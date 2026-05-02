import { createPublicClient, http, isAddress, namehash, type Address } from 'viem';
import { mainnet } from 'viem/chains';

export type EnsResolver = (name: string) => Promise<Address | null>;

export type ResolvedWallet = {
  input?: string;
  address: Address;
  ensName?: string;
};

const ENS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' as const;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;
const ENS_RPC_URLS = [
  process.env.ETHEREUM_RPC_URL,
  'https://cloudflare-eth.com',
  'https://ethereum.publicnode.com',
  'https://eth.llamarpc.com',
].filter(Boolean) as string[];

const registryAbi = [
  {
    name: 'resolver',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

const resolverAbi = [
  {
    name: 'addr',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

const defaultEnsResolver: EnsResolver = async (name: string) => {
  const node = namehash(name);
  let lastError: unknown;

  for (const rpcUrl of ENS_RPC_URLS) {
    try {
      const client = createPublicClient({
        chain: mainnet,
        transport: http(rpcUrl, { timeout: 8_000, retryCount: 0 }),
      });
      const resolver = await client.readContract({
        address: ENS_REGISTRY,
        abi: registryAbi,
        functionName: 'resolver',
        args: [node],
      });
      if (resolver === ZERO_ADDRESS) return null;

      const address = await client.readContract({
        address: resolver,
        abi: resolverAbi,
        functionName: 'addr',
        args: [node],
      });
      return address === ZERO_ADDRESS ? null : address;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`ENS lookup failed for ${name}`);
};

export async function resolveWallet(input: string, resolver: EnsResolver = defaultEnsResolver): Promise<ResolvedWallet> {
  const wallet = input.trim();

  if (isAddress(wallet)) {
    return { address: wallet as Address };
  }

  if (wallet.toLowerCase().endsWith('.eth')) {
    const ensName = wallet.toLowerCase();
    const address = await resolver(ensName);
    if (!address) throw new Error(`ENS name did not resolve to an address: ${wallet}`);
    return { input: wallet, address, ensName };
  }

  throw new Error('Wallet must be an EVM address or ENS name');
}
