// Types for Global Hedge AI Mobile App

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPPORT' | 'ACCOUNTING';
  balance: number;
  referralCode: string;
  walletAddress?: string;
  createdAt: string;
}

export interface Deposit {
  id: string;
  amount: number;
  cryptocurrency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  txId: string;
  proofImageUrl?: string;
  rewardAmount?: number;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  cryptocurrency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  toAddress: string;
  txId?: string;
  feeAmount: number;
  netAmount: number;
  createdAt: string;
}

export interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  network: string;
  address: string;
  minDeposit: number;
  minWithdrawal: number;
  enabled: boolean;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export interface Message {
  id: string;
  content: string;
  type: 'SYSTEM' | 'SUPPORT' | 'ANNOUNCEMENT';
  isRead: boolean;
  createdAt: string;
}

export interface DailyReward {
  amount: number;
  claimed: boolean;
  claimDate: string;
}

export interface RandomReward {
  amount: number;
  claimed: boolean;
  claimDate: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
}

export interface DepositForm {
  amount: string;
  cryptocurrency: string;
  txId: string;
  proofImage?: string;
}

export interface WithdrawalForm {
  amount: string;
  cryptocurrency: string;
  toAddress: string;
}

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  language: 'ar' | 'en' | 'es' | 'fr' | 'tr';
}
