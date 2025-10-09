export interface CryptocurrencyConfig {
  id: string;
  name: string;
  symbol: string;
  network: string;
  icon: string;
  address: string;
  minDeposit: number;
  minWithdrawal: number;
  decimals: number;
  enabled: boolean;
}

// Function to get wallet address from database
async function getWalletAddress(cryptoId: string): Promise<string> {
  try {
    const { prisma } = await import('@/lib/prisma');
    const policy = await prisma.policy.findUnique({
      where: { key: `${cryptoId}_ADDRESS` }
    });
    return policy?.value || '';
  } catch (error) {
    console.error(`Error fetching wallet address for ${cryptoId}:`, error);
    return '';
  }
}

export const SUPPORTED_CRYPTOCURRENCIES: CryptocurrencyConfig[] = [
  {
    id: 'USDT_TRC20',
    name: 'Tether USD (TRC20)',
    symbol: 'USDT',
    network: 'TRC20',
    icon: '🟡',
    address: process.env.NEXT_PUBLIC_USDT_TRC20_ADDRESS || 'TKaAamEouHjG9nZwoTPhgYUerejbBHGMop',
    minDeposit: 10,
    minWithdrawal: 20,
    decimals: 6,
    enabled: true
  },
  {
    id: 'USDT_ERC20',
    name: 'Tether USD (ERC20)',
    symbol: 'USDT',
    network: 'ERC20',
    icon: '🔵',
    address: process.env.NEXT_PUBLIC_USDT_ERC20_ADDRESS || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    minDeposit: 10,
    minWithdrawal: 20,
    decimals: 6,
    enabled: true
  },
  {
    id: 'BTC',
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'Bitcoin',
    icon: '🟠',
    address: process.env.NEXT_PUBLIC_BTC_ADDRESS || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    minDeposit: 0.001,
    minWithdrawal: 0.002,
    decimals: 8,
    enabled: true
  },
  {
    id: 'ETH',
    name: 'Ethereum',
    symbol: 'ETH',
    network: 'Ethereum',
    icon: '🔷',
    address: process.env.NEXT_PUBLIC_ETH_ADDRESS || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    minDeposit: 0.01,
    minWithdrawal: 0.02,
    decimals: 18,
    enabled: true
  },
  {
    id: 'BNB',
    name: 'Binance Coin',
    symbol: 'BNB',
    network: 'BSC',
    icon: '🟨',
    address: process.env.NEXT_PUBLIC_BNB_ADDRESS || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    minDeposit: 0.1,
    minWithdrawal: 0.2,
    decimals: 18,
    enabled: true
  },
  {
    id: 'ADA',
    name: 'Cardano',
    symbol: 'ADA',
    network: 'Cardano',
    icon: '🔵',
    address: process.env.NEXT_PUBLIC_ADA_ADDRESS || '',
    minDeposit: 10,
    minWithdrawal: 20,
    decimals: 6,
    enabled: false
  },
  {
    id: 'SOL',
    name: 'Solana',
    symbol: 'SOL',
    network: 'Solana',
    icon: '🟣',
    address: process.env.NEXT_PUBLIC_SOL_ADDRESS || '',
    minDeposit: 0.1,
    minWithdrawal: 0.2,
    decimals: 9,
    enabled: false
  },
  {
    id: 'MATIC',
    name: 'Polygon',
    symbol: 'MATIC',
    network: 'Polygon',
    icon: '🟣',
    address: process.env.NEXT_PUBLIC_MATIC_ADDRESS || '',
    minDeposit: 10,
    minWithdrawal: 20,
    decimals: 18,
    enabled: false
  },
  {
    id: 'AVAX',
    name: 'Avalanche',
    symbol: 'AVAX',
    network: 'Avalanche',
    icon: '🔴',
    address: process.env.NEXT_PUBLIC_AVAX_ADDRESS || '',
    minDeposit: 0.5,
    minWithdrawal: 1,
    decimals: 18,
    enabled: false
  },
  {
    id: 'DOT',
    name: 'Polkadot',
    symbol: 'DOT',
    network: 'Polkadot',
    icon: '🟣',
    address: process.env.NEXT_PUBLIC_DOT_ADDRESS || '',
    minDeposit: 0.5,
    minWithdrawal: 1,
    decimals: 10,
    enabled: false
  }
];

export function getCryptocurrencyById(id: string): CryptocurrencyConfig | undefined {
  return SUPPORTED_CRYPTOCURRENCIES.find(crypto => crypto.id === id);
}

export function getEnabledCryptocurrencies(): CryptocurrencyConfig[] {
  return SUPPORTED_CRYPTOCURRENCIES.filter(crypto => crypto.enabled);
}

export function formatCryptocurrencyAmount(amount: number, cryptocurrency: CryptocurrencyConfig): string {
  return amount.toFixed(cryptocurrency.decimals);
}

// Function to get cryptocurrencies with database addresses
export async function getCryptocurrenciesWithAddresses(): Promise<CryptocurrencyConfig[]> {
  const cryptocurrencies = [...SUPPORTED_CRYPTOCURRENCIES];
  
  for (const crypto of cryptocurrencies) {
    crypto.address = await getWalletAddress(crypto.id);
  }
  
  return cryptocurrencies;
}

// Function to get enabled cryptocurrencies with addresses
export async function getEnabledCryptocurrenciesWithAddresses(): Promise<CryptocurrencyConfig[]> {
  const allCryptos = await getCryptocurrenciesWithAddresses();
  return allCryptos.filter(crypto => crypto.enabled);
}
