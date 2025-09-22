import { mockApiService } from './mockApiService';

// Use mock API service for development
const USE_MOCK_API = import.meta.env?.MODE === 'development' || !import.meta.env?.VITE_API_URL;
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Cloud Accounts
  async getCloudAccounts(params?: {
    provider?: string;
    department?: string;
    period?: string;
    page?: number;
    limit?: number;
  }) {
    if (USE_MOCK_API) {
      return mockApiService.getCloudAccounts(params);
    }
    
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    
    return this.request(`/cloud-accounts?${searchParams}`);
  }

  async getCloudAccount(accountId: string) {
    if (USE_MOCK_API) {
      return mockApiService.getCloudAccount(accountId);
    }
    
    return this.request(`/cloud-accounts/${accountId}`);
  }

  // Applications
  async getApplications(params?: {
    cloudAccount?: string;
    sort?: string;
    order?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    if (USE_MOCK_API) {
      return mockApiService.getApplications(params);
    }
    
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    
    return this.request(`/applications?${searchParams}`);
  }

  async getApplication(applicationId: string) {
    if (USE_MOCK_API) {
      return mockApiService.getApplication(applicationId);
    }
    
    return this.request(`/applications/${applicationId}`);
  }

  // Resources
  async getComputeResources(applicationId: string, params?: {
    type?: string;
    sort?: string;
    order?: string;
  }) {
    if (USE_MOCK_API) {
      return mockApiService.getComputeResources(applicationId, params);
    }
    
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    
    return this.request(`/applications/${applicationId}/compute?${searchParams}`);
  }

  async getStorageResources(applicationId: string) {
    if (USE_MOCK_API) {
      return mockApiService.getStorageResources(applicationId);
    }
    
    return this.request(`/applications/${applicationId}/storage`);
  }

  async getDatabaseResources(applicationId: string) {
    if (USE_MOCK_API) {
      return mockApiService.getDatabaseResources(applicationId);
    }
    
    return this.request(`/applications/${applicationId}/databases`);
  }

  // Analytics
  async getTrends(params: {
    period: string;
    type?: string;
    granularity?: string;
  }) {
    if (USE_MOCK_API) {
      return mockApiService.getTrends(params);
    }
    
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    
    return this.request(`/analytics/trends?${searchParams}`);
  }

  async getRecommendations(params?: {
    type?: string;
    priority?: string;
    limit?: number;
  }) {
    if (USE_MOCK_API) {
      return mockApiService.getRecommendations(params);
    }
    
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    
    return this.request(`/analytics/recommendations?${searchParams}`);
  }

  // Dashboard
  async getDashboardSummary(params?: { period?: string }) {
    if (USE_MOCK_API) {
      return mockApiService.getDashboardSummary(params);
    }
    
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.append('period', params.period);
    
    return this.request(`/dashboard/summary?${searchParams}`);
  }

  // Alerts
  async getAlerts(params?: {
    severity?: string;
    isRead?: boolean;
    limit?: number;
  }) {
    if (USE_MOCK_API) {
      return mockApiService.getAlerts(params);
    }
    
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    
    return this.request(`/alerts?${searchParams}`);
  }

  async markAlertAsRead(alertId: string) {
    if (USE_MOCK_API) {
      return mockApiService.markAlertAsRead(alertId);
    }
    
    return this.request(`/alerts/${alertId}/read`, { method: 'PATCH' });
  }

  // Attention Data
  async getAttentionData(params?: {
    category?: 'usage-cost' | 'disk-utilisation' | 'idle-instances';
    filter?: string;
    search?: string;
  }) {
    if (USE_MOCK_API) {
      return mockApiService.getAttentionData(params);
    }
    
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    
    return this.request(`/attention?${searchParams}`);
  }

  // Spot Utilization
  async getSpotUtilization(params?: {
    sort?: string;
    order?: string;
  }) {
    if (USE_MOCK_API) {
      return mockApiService.getSpotUtilization(params);
    }
    
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    
    return this.request(`/spot-utilization?${searchParams}`);
  }

  async getSpotSavingsDetails(accountId: number, params?: {
    sort?: string;
    order?: string;
  }) {
    if (USE_MOCK_API) {
      return mockApiService.getSpotSavingsDetails(accountId, params);
    }
    
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    
    return this.request(`/spot-utilization/${accountId}/details?${searchParams}`);
  }
}

export const apiService = new ApiService();