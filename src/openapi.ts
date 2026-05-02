export function openApiSpec() {
  return {
    openapi: '3.1.0',
    info: {
      title: 'AgentPay Router',
      version: '0.1.0',
      description:
        'x402-style paid HTTP rails for agents: request, receive 402 Payment Required, pay per request, get a live Base quote, then prepare a KeeperHub execution handoff.',
    },
    servers: [{ url: 'https://agentpay-router-zeta.vercel.app' }],
    tags: [
      { name: 'status', description: 'Service status and metadata' },
      { name: 'quote', description: 'Paid market quote endpoint' },
      { name: 'keeperhub', description: 'Policy-checked execution handoff' },
    ],
    paths: {
      '/': {
        get: {
          tags: ['status'],
          summary: 'Landing page',
          responses: {
            '200': { description: 'HTML landing page for judges and humans' },
          },
        },
      },
      '/api': {
        get: {
          tags: ['status'],
          summary: 'API metadata',
          responses: {
            '200': {
              description: 'Service metadata',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiMetadata' },
                },
              },
            },
          },
        },
      },
      '/health': {
        get: {
          tags: ['status'],
          summary: 'Health check',
          responses: {
            '200': {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Health' },
                },
              },
            },
          },
        },
      },
      '/quote': {
        get: {
          tags: ['quote'],
          summary: 'Get a paid Base market quote',
          description:
            'Without payment, returns HTTP 402 plus a Payment-Required challenge. In demo mode, send x-payment: demo-paid to receive a live Base USDC/WETH quote.',
          parameters: [
            { name: 'sell', in: 'query', schema: { type: 'string', enum: ['USDC', 'WETH'], default: 'USDC' } },
            { name: 'buy', in: 'query', schema: { type: 'string', enum: ['USDC', 'WETH'], default: 'WETH' } },
            { name: 'amount', in: 'query', schema: { type: 'number', default: 1, minimum: 0 } },
            { name: 'chainId', in: 'query', schema: { type: 'string', default: '8453' } },
            { name: 'x-payment', in: 'header', required: false, schema: { type: 'string', example: 'demo-paid' } },
          ],
          responses: {
            '200': {
              description: 'Paid quote response',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaidQuote' },
                },
              },
            },
            '400': { description: 'Invalid quote request' },
            '402': {
              description: 'Payment required challenge',
              headers: {
                'Payment-Required': {
                  description: 'Serialized payment challenge for the requesting agent',
                  schema: { type: 'string' },
                },
              },
            },
          },
        },
      },
      '/keeperhub/prepare-execution': {
        post: {
          tags: ['keeperhub'],
          summary: 'Prepare a KeeperHub execution handoff',
          description:
            'Turns a quote request, wallet, and policy into a deterministic handoff payload with policy checks and an audit artifact. This is the safe hackathon path before live execution keys exist.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HandoffRequest' },
                examples: {
                  usdcToWeth: {
                    value: {
                      wallet: '0x0000000000000000000000000000000000000000',
                      quoteRequest: { sell: 'USDC', buy: 'WETH', amount: 1 },
                      policy: { maxUsd: 5000, maxSlippageBps: 100 },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Policy-checked KeeperHub handoff',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/HandoffResponse' },
                },
              },
            },
            '400': { description: 'Invalid handoff request or blocked policy' },
          },
        },
      },
      '/openapi.json': {
        get: {
          tags: ['status'],
          summary: 'OpenAPI spec',
          responses: { '200': { description: 'OpenAPI 3.1 JSON document' } },
        },
      },
    },
    components: {
      schemas: {
        ApiMetadata: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            pitch: { type: 'string' },
            endpoints: { type: 'array', items: { type: 'string' } },
          },
        },
        Health: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            service: { type: 'string' },
            network: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
          required: ['ok', 'service', 'network', 'timestamp'],
        },
        PaidQuote: {
          type: 'object',
          properties: {
            payment: { type: 'object' },
            request: { type: 'object' },
            quote: { type: 'object' },
            route: { type: 'array', items: { type: 'object' } },
          },
        },
        HandoffRequest: {
          type: 'object',
          required: ['wallet', 'quoteRequest'],
          properties: {
            wallet: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
            quoteRequest: {
              type: 'object',
              required: ['sell', 'buy', 'amount'],
              properties: {
                sell: { type: 'string', enum: ['USDC', 'WETH'] },
                buy: { type: 'string', enum: ['USDC', 'WETH'] },
                amount: { type: 'number', minimum: 0 },
              },
            },
            policy: {
              type: 'object',
              properties: {
                maxUsd: { type: 'number' },
                maxSlippageBps: { type: 'number' },
              },
            },
          },
        },
        HandoffResponse: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            quote: { type: 'object' },
            policy: { type: 'object' },
            keeperhub: { type: 'object' },
            audit: { type: 'object' },
          },
        },
      },
    },
  } as const;
}
