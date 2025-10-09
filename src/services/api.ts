import { mockApiService } from './mockApiService';
import { getQuarterDates } from '../utils/dateUtils';

// Use mock API service for development
const USE_MOCK_API = false; // Always try real API first
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8888/api/optimization';

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
    // Always try real API first for cloud accounts
    try {
      console.log('Fetching cloud accounts from API...');
      let url = 'http://localhost:8888/api/optimization/cloud-accounts';
      
      // Add start/end dates for dashboard chart when period is provided
      if (params?.period) {
        const { start, end } = getQuarterDates(params.period);
        url += `?start=${start}&end=${end}`;
      }
      
      const response = await fetch(url);
      console.log('Cloud accounts API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Transform backend response to match frontend format
      const transformedData = data.map((account: any) => ({
        id: account.cloudAccount,
        cloudAccount: account.cloudAccount,
        applications: account.applications || 0,
        vms: account.vms || 0,
        storage: 5,
        totalSpends: account.totalSpends ? `$${account.totalSpends.toFixed(0)}` : '$0',
        totalSavings: account.totalSavings ? `$${account.totalSavings.toFixed(0)}` : '$0',
        potentialSavings: account.potentialSavings ? `$${account.potentialSavings.toFixed(0)}` : '$0',
        efficiency: account.efficiency ? `${Math.round(account.efficiency)}%` : '0%',
        provider: account.provider,
        department: account.department || account.cloudAccount // Use cloudAccount name as department if not provided
      }));
      
      const result = {
        success: true,
        data: {
          accounts: transformedData,
          pagination: {
            page: 1,
            limit: transformedData.length,
            total: transformedData.length,
            totalPages: 1
          }
        }
      };
      
      console.log('Cloud accounts final result:', result);
      return result;
    } catch (error) {
      console.error('Backend API failed, using mock data:', error);
      return mockApiService.getCloudAccounts(params);
    }

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
    
    if (!params?.cloudAccount) {
      throw new Error('Cloud account is required for applications');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/cloud-accounts/${params.cloudAccount}/applications`);
      const apiResponse = await response.json();
      
      // The API returns { success: true, data: [...applications...] }
      // We need to extract the applications array from the data property
      const applications = apiResponse.success ? apiResponse.data : [];
      
      return {
        success: true,
        data: {
          applications: applications
        }
      };
    } catch (error) {
      console.log('Backend API failed, using mock data:', error);
      return mockApiService.getApplications(params);
    }
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
    
    try {
      const response = await fetch(`http://localhost:8888/api/optimization/applications?application=${applicationId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      
      // Transform the response to match the expected format
      const computeResources = [];
      
      // Process both assigned and unassigned resources
      const allAssets = [
        ...(apiResponse.assigned || []),
        ...(apiResponse.unassigned || [])
      ];
      
      allAssets.forEach((asset: any) => {
        if (asset.service_type === 'Compute' && asset.recos && asset.recos.length > 0) {
          const reco = asset.recos[0]; // Use the first recommendation
          
          computeResources.push({
            computeType: asset.cloud_service_name || 'Compute Engine',
            computeId: asset.asset_id,
            currentServer: asset.hw_family_name,
            spends: `$${reco.current_month_spend?.toFixed(0) || '0'}`,
            savings: `$${reco.realized_savings?.toFixed(0) || '0'}`,
            potentialSavings: `$${reco.projected_monthly_saving?.toFixed(0) || '0'}`,
            efficiency: `${reco.projected_monthly_util?.toFixed(1) || '0'}%`,
            maxCpu: reco.new_hw_family_name || asset.hw_family_name,
            maxMemory: '', // Not provided in API response
            dbType: '', // Not applicable for compute
            department: asset.dept_name || 'Unknown'
          });
        }
      });
      
      
      return {
        success: true,
        data: {
          resources: computeResources
        }
      };
    } catch (error) {
      console.error('Applications API failed, using mock data:', error);
      return mockApiService.getComputeResources(applicationId, params);
    }
  }

  async getStorageResources(applicationId: string) {
    if (USE_MOCK_API) {
      return mockApiService.getStorageResources(applicationId);
    }
    
    try {
      const response = await fetch(`http://localhost:8888/api/optimization/applications?application=${applicationId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      
      // Transform the response to match the expected format for storage
      const storageResources = [];
      
      // Process both assigned and unassigned storage resources
      const allAssets = [
        ...(apiResponse.assigned || []),
        ...(apiResponse.unassigned || [])
      ];
      
      allAssets.forEach((asset: any) => {
        if (asset.service_type === 'Storage' && asset.recos && asset.recos.length > 0) {
          const reco = asset.recos[0];
          
          storageResources.push({
            computeType: asset.cloud_service_name || 'Storage',
            computeId: asset.asset_id,
            currentServer: asset.hw_family_name || 'Standard',
            spends: `$${reco.current_month_spend?.toFixed(0) || '0'}`,
            savings: `$${reco.realized_savings?.toFixed(0) || '0'}`,
            potentialSavings: `$${reco.projected_monthly_saving?.toFixed(0) || '0'}`,
            efficiency: `${reco.projected_monthly_util?.toFixed(1) || '0'}%`,
            maxCpu: reco.recommended_storage_type || 'Standard',
            maxMemory: '', // Not applicable for storage
            dbType: '', // Not applicable for storage
            department: asset.dept_name || 'Unknown'
          });
        }
      });
      
      return {
        success: true,
        data: {
          resources: storageResources
        }
      };
    } catch (error) {
      console.error('Storage applications API failed, using mock data:', error);
      return mockApiService.getStorageResources(applicationId);
    }
  }

  async getDatabaseResources(applicationId: string) {
    if (USE_MOCK_API) {
      return mockApiService.getDatabaseResources(applicationId);
    }
    
    try {
      const response = await fetch(`http://localhost:8888/api/optimization/applications?application=${applicationId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      
      // Transform the response to match the expected format for databases
      const databaseResources = [];
      
      // Process both assigned and unassigned database resources
      const allAssets = [
        ...(apiResponse.assigned || []),
        ...(apiResponse.unassigned || [])
      ];
      
      allAssets.forEach((asset: any) => {
        if (asset.service_type === 'Database' && asset.recos && asset.recos.length > 0) {
          const reco = asset.recos[0];
          
          databaseResources.push({
            computeType: asset.cloud_service_name || 'Database',
            computeId: asset.asset_id,
            currentServer: asset.hw_family_name || 'Standard',
            spends: `$${reco.current_month_spend?.toFixed(0) || '0'}`,
            savings: `$${reco.realized_savings?.toFixed(0) || '0'}`,
            potentialSavings: `$${reco.projected_monthly_saving?.toFixed(0) || '0'}`,
            efficiency: `${reco.projected_monthly_util?.toFixed(1) || '0'}%`,
            maxCpu: reco.recommended_family || asset.hw_family_name || 'Standard',
            maxMemory: '', // Not provided in API response
            dbType: asset.cloud_service_name || 'Database',
            department: asset.dept_name || 'Unknown'
          });
        }
      });
      
      return {
        success: true,
        data: {
          resources: databaseResources
        }
      };
    } catch (error) {
      console.error('Database applications API failed, using mock data:', error);
      return mockApiService.getDatabaseResources(applicationId);
    }
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
    
    try {
      const response = await fetch('http://localhost:8888/api/optimization/cloud-accounts/summary');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      
      // API now returns an array with a single object
      const summary = Array.isArray(apiResponse) ? apiResponse[0] : apiResponse;
      
      return {
        success: true,
        data: {
          totalCloudAccounts: summary.total_accounts || 0,
          totalVirtualMachines: summary.total_vms || 0,
          totalApplicationInstances: summary.total_applications || 0,
          totalDatabases: 0, // Not provided in API response
          totalStorage: 0, // Not provided in API response
          monthlySpend: summary.total_spends || 0,
          monthlySavings: summary.total_savings || 0,
          potentialSavings: summary.potentialSavings || 0,
          efficiency: Math.round(summary.avg_efficiency || 0)
        }
      };
    } catch (error) {
      console.error('Dashboard summary API failed, using mock data:', error);
      return mockApiService.getDashboardSummary(params);
    }
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