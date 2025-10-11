// API Service for Global Hedge AI Mobile App

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

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  private async saveToken(token: string) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      this.token = token;
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  private async removeToken() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      this.token = null;
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/api${endpoint}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // ✅ إزالة Bearer token واستخدام sessions فقط
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // ✅ استخدام sessions
      });

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
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.ok && response.data?.token) {
      await this.saveToken(response.data.token);
    }

    return response;
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.ok && response.data?.token) {
      await this.saveToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    await this.removeToken();
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/me');
  }

  // Deposits
  async getDeposits(): Promise<ApiResponse<Deposit[]>> {
    return this.request<Deposit[]>('/deposits');
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
  async getWithdrawals(): Promise<ApiResponse<Withdrawal[]>> {
    return this.request<Withdrawal[]>('/withdrawals');
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
  async getMessages(): Promise<ApiResponse<Message[]>> {
    return this.request<Message[]>('/messages');
  }

  async sendMessage(body: string): Promise<ApiResponse<Message>> {
    return this.request<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  }

  async markMessageAsRead(messageId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  // Admin APIs
  async getAdminUsers(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/admin/users');
  }

  async updateUserBalance(userId: string, balance: number): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/users/balance', {
      method: 'PUT',
      body: JSON.stringify({ userId, balance }),
    });
  }

  async getAdminDeposits(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/admin/deposits');
  }

  async approveDeposit(depositId: string): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/deposits/approve', {
      method: 'PUT',
      body: JSON.stringify({ depositId }),
    });
  }

  async rejectDeposit(depositId: string): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/deposits/reject', {
      method: 'PUT',
      body: JSON.stringify({ depositId }),
    });
  }

  async getAdminWithdrawals(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/admin/withdrawals');
  }

  async approveWithdrawal(withdrawalId: string): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/withdrawals/approve', {
      method: 'PUT',
      body: JSON.stringify({ withdrawalId }),
    });
  }

  async rejectWithdrawal(withdrawalId: string): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/withdrawals/reject', {
      method: 'PUT',
      body: JSON.stringify({ withdrawalId }),
    });
  }

  async getAdminMessages(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/admin/messages');
  }

  async sendAdminReply(threadId: string, body: string): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/messages', {
      method: 'POST',
      body: JSON.stringify({ threadId, body }),
    });
  }

  async getAdminReports(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/reports/financial');
  }

  async getUserReports(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/admin/reports/users');
  }

  async getPlatformStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/platform-stats');
  }

  // Full Control APIs
  async updateUserFull(userData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/users/full-update', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateDepositFull(depositData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/deposits/full-update', {
      method: 'PUT',
      body: JSON.stringify(depositData),
    });
  }

  async updateWithdrawalFull(withdrawalData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/withdrawals/full-update', {
      method: 'PUT',
      body: JSON.stringify(withdrawalData),
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
}

export default new ApiService();
