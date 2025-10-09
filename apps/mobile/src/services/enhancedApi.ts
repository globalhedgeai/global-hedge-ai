// Enhanced API Service for Global Hedge AI Mobile App

import { API_BASE_URL, STORAGE_KEYS } from '../constants';
import { 
  User, 
  Deposit, 
  Withdrawal, 
  Cryptocurrency, 
  MarketData, 
  Message,
  DailyReward,
  RandomReward,
  ApiResponse,
  LoginCredentials,
  RegisterData,
  DepositForm,
  WithdrawalForm
} from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

class EnhancedApiService {
  private baseUrl: string;
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.loadTokens();
  }

  private async loadTokens() {
    try {
      this.token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      this.refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  }

  private async saveTokens(token: string, refreshToken?: string) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      if (refreshToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        this.refreshToken = refreshToken;
      }
      this.token = token;
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  private async removeTokens() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      this.token = null;
      this.refreshToken = null;
    } catch (error) {
      console.error('Error removing tokens:', error);
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          await this.saveTokens(data.token, data.refreshToken);
          return true;
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      let response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle token expiration
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the request with new token
          headers.Authorization = `Bearer ${this.token}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        } else {
          // Refresh failed, redirect to login
          await this.removeTokens();
          return {
            ok: false,
            error: 'Session expired. Please login again.',
          };
        }
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error: data.error || 'Network error',
        };
      }

      return {
        ok: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        ok: false,
        error: 'Network error',
      };
    }
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string; refreshToken: string }>> {
    const response = await this.request<{ user: User; token: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.ok && response.data?.token) {
      await this.saveTokens(response.data.token, response.data.refreshToken);
    }

    return response;
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string; refreshToken: string }>> {
    const response = await this.request<{ user: User; token: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.ok && response.data?.token) {
      await this.saveTokens(response.data.token, response.data.refreshToken);
    }

    return response;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    await this.removeTokens();
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/me');
  }

  // Deposits
  async getDeposits(page: number = 1, limit: number = 20): Promise<ApiResponse<{ deposits: Deposit[]; total: number; page: number; totalPages: number }>> {
    return this.request<{ deposits: Deposit[]; total: number; page: number; totalPages: number }>(`/deposits?page=${page}&limit=${limit}`);
  }

  async createDeposit(deposit: DepositForm): Promise<ApiResponse<Deposit>> {
    const formData = new FormData();
    formData.append('amount', deposit.amount);
    formData.append('cryptocurrency', deposit.cryptocurrency);
    formData.append('txId', deposit.txId);
    
    if (deposit.proofImage) {
      formData.append('proofImage', {
        uri: deposit.proofImage,
        type: 'image/jpeg',
        name: 'proof.jpg',
      } as any);
    }

    return this.request<Deposit>('/deposits', {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type for FormData - let the browser set it
      },
    });
  }

  // Withdrawals
  async getWithdrawals(page: number = 1, limit: number = 20): Promise<ApiResponse<{ withdrawals: Withdrawal[]; total: number; page: number; totalPages: number }>> {
    return this.request<{ withdrawals: Withdrawal[]; total: number; page: number; totalPages: number }>(`/withdrawals?page=${page}&limit=${limit}`);
  }

  async createWithdrawal(withdrawal: WithdrawalForm): Promise<ApiResponse<Withdrawal>> {
    return this.request<Withdrawal>('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(withdrawal),
    });
  }

  // Cryptocurrencies
  async getCryptocurrencies(): Promise<ApiResponse<Cryptocurrency[]>> {
    return this.request<Cryptocurrency[]>('/cryptocurrencies');
  }

  // Market Data
  async getMarketData(): Promise<ApiResponse<MarketData[]>> {
    return this.request<MarketData[]>('/market/candles');
  }

  // Messages
  async getMessages(page: number = 1, limit: number = 20): Promise<ApiResponse<{ messages: Message[]; total: number; page: number; totalPages: number }>> {
    return this.request<{ messages: Message[]; total: number; page: number; totalPages: number }>(`/messages?page=${page}&limit=${limit}`);
  }

  async markMessageAsRead(messageId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  // Rewards
  async getDailyReward(): Promise<ApiResponse<DailyReward>> {
    return this.request<DailyReward>('/rewards/daily/status');
  }

  async claimDailyReward(): Promise<ApiResponse<DailyReward>> {
    return this.request<DailyReward>('/rewards/daily/claim', {
      method: 'POST',
    });
  }

  async getRandomReward(): Promise<ApiResponse<RandomReward>> {
    return this.request<RandomReward>('/rewards/random/status');
  }

  async claimRandomReward(): Promise<ApiResponse<RandomReward>> {
    return this.request<RandomReward>('/rewards/random/claim', {
      method: 'POST',
    });
  }

  // Policies
  async getPolicies(): Promise<ApiResponse<any>> {
    return this.request<any>('/policies');
  }

  // File Upload
  async uploadFile(fileUri: string): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'file.jpg',
    } as any);

    return this.request<{ url: string }>('/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type for FormData - let the browser set it
      },
    });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('/health');
  }

  // Referral
  async getReferralData(): Promise<ApiResponse<{
    referralCode: string;
    stats: { invitedCount: number; tier: number };
    invitedUsers: Array<{ id: string; email: string; joinedAt: string; balance: number }>;
  }>> {
    return this.request<{
      referralCode: string;
      stats: { invitedCount: number; tier: number };
      invitedUsers: Array<{ id: string; email: string; joinedAt: string; balance: number }>;
    }>('/referrals');
  }

  // Account Management
  async updateProfile(data: { email?: string; walletAddress?: string }): Promise<ApiResponse<User>> {
    return this.request<User>('/account/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    return this.request<void>('/account/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Notifications
  async getNotifications(): Promise<ApiResponse<Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
  }>>> {
    return this.request<Array<{
      id: string;
      title: string;
      message: string;
      type: string;
      read: boolean;
      createdAt: string;
    }>>('/notifications');
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // Support
  async createSupportTicket(data: {
    subject: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
  }): Promise<ApiResponse<{ id: string; status: string }>> {
    return this.request<{ id: string; status: string }>('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSupportTickets(): Promise<ApiResponse<Array<{
    id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
  }>>> {
    return this.request<Array<{
      id: string;
      subject: string;
      status: string;
      priority: string;
      createdAt: string;
      updatedAt: string;
    }>>('/support/tickets');
  }

  // Analytics
  async getAnalytics(): Promise<ApiResponse<{
    totalDeposits: number;
    totalWithdrawals: number;
    totalRewards: number;
    netProfit: number;
    monthlyGrowth: number;
  }>> {
    return this.request<{
      totalDeposits: number;
      totalWithdrawals: number;
      totalRewards: number;
      netProfit: number;
      monthlyGrowth: number;
    }>('/analytics');
  }
}

export default new EnhancedApiService();
