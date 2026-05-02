export function openApiSpec() {
  const tokenEnum = ['USDC', 'WETH', 'CBBTC', '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf'];

  return {
    openapi: '3.1.0',
    info: {
      title: 'AgentPay Router',
      version: '0.1.0',
      description:
        'x402-style paid HTTP rails for agents: request, receive 402 Payment Required, pay per request, get live Base market data, then prepare a KeeperHub handoff preview.',
    },
    servers: [{ url: 'https://agentpay-router-zeta.vercel.app' }],
    tags: [
      { name: 'status', description: 'Service status and metadata' },
      { name: 'quote', description: 'Paid market quote endpoint' },
      { name: 'keeperhub', description: 'Policy-checked KeeperHub handoff preview' },
    ],
    paths: {
      '/': {
        get: {
          tags: ['status'],
          summary: 'Landing page',
          responses: { '200': { description: 'HTML landing page for judges and humans' } },
        },
      },
      '/api': {
        get: {
          tags: ['status'],
          summary: 'API metadata',
          responses: {
            '200': {
              description: 'Service metadata',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiMetadata' } } },
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
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Health' } } },
            },
          },
        },
      },
      '/quote': {
        get: {
          tags: ['quote'],
          summary: 'Get a paid Base market quote',
          description:
            'Without payment, returns HTTP 402 plus a Payment-Required challenge. In demo mode, send x-payment: demo-paid to receive live Base market data such as USDC to cbBTC.',
          parameters: [
            { name: 'sell', in: 'query', schema: { type: 'string', enum: tokenEnum, default: 'USDC' } },
            { name: 'buy', in: 'query', schema: { type: 'string', enum: tokenEnum, default: 'CBBTC' } },
            { name: 'amount', in: 'query', schema: { type: 'number', default: 100, minimum: 0.000001 } },
            { name: 'chainId', in: 'query', schema: { type: 'string', default: '8453' } },
            { name: 'x-payment', in: 'header', required: false, schema: { type: 'string', example: 'demo-paid' } },
          ],
          responses: {
            '200': {
              description: 'Paid quote response',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/PaidQuote' } } },
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
          summary: 'Prepare a KeeperHub handoff preview from a paid quote',
          description:
            'Consumes the paid quote object returned by /quote and turns it into a deterministic KeeperHub handoff preview with policy checks and an inline audit summary. It does not fetch free quote data or submit live execution by default.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HandoffRequest' },
                examples: {
                  paidCbbtcQuote: {
                    value: {
                      wallet: 'baseddesigner.eth',
                      quote: {
                        payment: { status: 'settled', mode: 'demo', amountUsd: 0.001 },
                        id: 'quote_example',
                        chainId: 8453,
                        sell: 'USDC',
                        buy: 'CBBTC',
                        amount: '100',
                        quote: {
                          estimatedOut: '0.0012',
                          executionPrice: '0.00001200 CBBTC / USDC',
                          source: 'DexScreener live Base CBBTC/USDC market data',
                        },
                        route: [{ dex: 'aerodrome', pair: '0x4e962BB3889Bf030368F56810A9c96B83CB3E778' }],
                        timestamp: '2026-05-02T18:00:00.000Z',
                      },
                      policy: { maxUsd: 5000, maxSlippageBps: 100 },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Policy-checked KeeperHub handoff preview. Blocked policy also returns 200 with status=blocked_by_policy so agents can inspect checks.',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/HandoffResponse' } } },
            },
            '400': { description: 'Invalid handoff request, malformed paid quote, or quoteRequest bypass attempt' },
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
        PaymentReceipt: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['settled'] },
            mode: { type: 'string', example: 'demo' },
            amountUsd: { type: 'number' },
            paidAt: { type: 'string', format: 'date-time' },
            reference: { type: 'string' },
          },
          additionalProperties: true,
        },
        MarketQuote: {
          type: 'object',
          required: ['id', 'chainId', 'sell', 'buy', 'amount', 'quote', 'route', 'timestamp'],
          properties: {
            id: { type: 'string', pattern: '^quote_[A-Za-z0-9_-]+$' },
            chainId: { type: 'number', const: 8453 },
            sell: { type: 'string', enum: ['USDC', 'WETH', 'CBBTC'] },
            buy: { type: 'string', enum: ['USDC', 'WETH', 'CBBTC'] },
            amount: { type: 'string' },
            quote: {
              type: 'object',
              required: ['estimatedOut', 'executionPrice', 'source'],
              properties: {
                estimatedOut: { type: 'string' },
                executionPrice: { type: 'string' },
                source: { type: 'string' },
                pairAddress: { type: 'string' },
                liquidityUsd: { type: 'number' },
              },
            },
            route: {
              type: 'array',
              items: {
                type: 'object',
                required: ['dex', 'pair'],
                properties: { dex: { type: 'string' }, pair: { type: 'string' } },
              },
            },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        PaidQuote: {
          allOf: [
            { $ref: '#/components/schemas/MarketQuote' },
            {
              type: 'object',
              required: ['payment'],
              properties: { payment: { $ref: '#/components/schemas/PaymentReceipt' } },
            },
          ],
        },
        HandoffRequest: {
          type: 'object',
          required: ['wallet', 'quote'],
          properties: {
            wallet: {
              type: 'string',
              description: 'Agent wallet address or ENS name. ENS names resolve to an EVM address before KeeperHub handoff preview generation.',
              examples: ['baseddesigner.eth', '0x0000000000000000000000000000000000000000'],
            },
            quote: { $ref: '#/components/schemas/PaidQuote' },
            policy: {
              type: 'object',
              properties: {
                maxUsd: { type: 'number', minimum: 0.000001 },
                maxSlippageBps: { type: 'number', minimum: 0, maximum: 500 },
                allowedTokens: { type: 'array', items: { type: 'string', enum: ['USDC', 'WETH', 'CBBTC'] } },
              },
            },
          },
          additionalProperties: false,
        },
        HandoffResponse: {
          type: 'object',
          required: ['status', 'handoffHash', 'handoffReceipt', 'quote', 'wallet', 'policyChecks', 'keeperhub', 'audit'],
          properties: {
            status: { type: 'string', enum: ['ready_for_keeperhub', 'blocked_by_policy'] },
            handoffHash: {
              type: 'string',
              pattern: '^0x[a-f0-9]{64}$',
              description: 'Deterministic handoff receipt hash. This is not an onchain transaction hash.',
            },
            handoffReceipt: {
              type: 'object',
              required: ['kind', 'hash', 'note'],
              properties: {
                kind: { type: 'string', const: 'handoff_receipt' },
                hash: { type: 'string', pattern: '^0x[a-f0-9]{64}$' },
                note: { type: 'string' },
              },
            },
            quote: { $ref: '#/components/schemas/MarketQuote' },
            wallet: {
              type: 'object',
              required: ['input', 'address'],
              properties: {
                input: { type: 'string', examples: ['baseddesigner.eth'] },
                address: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
                ensName: { type: 'string', examples: ['baseddesigner.eth'] },
              },
            },
            policyChecks: {
              type: 'array',
              items: {
                type: 'object',
                required: ['name', 'status', 'detail'],
                properties: {
                  name: { type: 'string' },
                  status: { type: 'string', enum: ['pass', 'fail'] },
                  detail: { type: 'string' },
                },
              },
            },
            keeperhub: { type: 'object' },
            audit: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                path: { type: 'string' },
                storage: { type: 'string', enum: ['ephemeral_serverless', 'local_file'] },
                summary: { type: 'object' },
              },
            },
          },
        },
      },
    },
  } as const;
}
