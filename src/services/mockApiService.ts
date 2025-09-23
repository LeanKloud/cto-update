import { mockApiData } from '../data/mockApiData';

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses that match the expected API structure
export class MockApiService {
  // Dashboard APIs
  async getDashboardSummary(params?: { period?: string }) {
    await delay();
    return {
      success: true,
      data: mockApiData.dashboardSummary
    };
  }

  // Cloud Accounts APIs
  async getCloudAccounts(params?: {
    provider?: string;
    department?: string;
    period?: string;
    page?: number;
    limit?: number;
  }) {
    await delay();
    
    let filteredAccounts = [...mockApiData.cloudAccounts];
    
    // Apply filters
    if (params?.provider && params.provider !== 'All Providers') {
      filteredAccounts = filteredAccounts.filter(acc => acc.provider === params.provider);
    }
    
    if (params?.department && params.department !== 'All Departments') {
      filteredAccounts = filteredAccounts.filter(acc => acc.department === params.department);
    }
    
    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: {
        accounts: paginatedAccounts,
        pagination: {
          page,
          limit,
          total: filteredAccounts.length,
          totalPages: Math.ceil(filteredAccounts.length / limit)
        }
      }
    };
  }

  async getCloudAccount(accountId: string) {
    await delay();
    
    const account = mockApiData.cloudAccounts.find(acc => acc.id === accountId);
    
    if (!account) {
      return {
        success: false,
        error: 'Cloud account not found'
      };
    }
    
    return {
      success: true,
      data: account
    };
  }

  // Applications APIs
  async getApplications(params?: {
    cloudAccount?: string;
    sort?: string;
    order?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    await delay();
    
    // Get all applications and filter by cloud account if specified
    let allApplications: any[] = [];
    Object.values(mockApiData.applications).forEach(apps => {
      allApplications = allApplications.concat(apps);
    });
    
    let filteredApps = [...allApplications];
    
    // Filter by cloud account
    if (params?.cloudAccount) {
      filteredApps = filteredApps.filter(app => app.cloudAccount === params.cloudAccount);
    }
    
    // Apply search
    if (params?.search) {
      const searchTerm = params.search.toLowerCase();
      filteredApps = filteredApps.filter(app => 
        app.applicationName.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply sorting
    if (params?.sort) {
      filteredApps.sort((a, b) => {
        const aVal = a[params.sort as keyof typeof a];
        const bVal = b[params.sort as keyof typeof b];
        const order = params.order === 'asc' ? 1 : -1;
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * order;
        }
        
        return (aVal > bVal ? 1 : -1) * order;
      });
    }
    
    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedApps = filteredApps.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: {
        applications: paginatedApps,
        pagination: {
          page,
          limit,
          total: filteredApps.length,
          totalPages: Math.ceil(filteredApps.length / limit)
        }
      }
    };
  }

  async getApplication(applicationId: string) {
    await delay();
    
    // Find application across all cloud accounts
    for (const accountApps of Object.values(mockApiData.applications)) {
      const app = accountApps.find(a => a.id === applicationId);
      if (app) {
        return {
          success: true,
          data: app
        };
      }
    }
    
    return {
      success: false,
      error: 'Application not found'
    };
  }

  // Resources APIs
  async getComputeResources(applicationId: string, params?: {
    type?: string;
    sort?: string;
    order?: string;
  }) {
    await delay();
    
    let resources = mockApiData.computeResources[applicationId] || [];
    
    // Apply type filter
    if (params?.type && params.type !== 'all') {
      resources = resources.filter(resource => 
        resource.computeType.toLowerCase().includes(params.type!.toLowerCase())
      );
    }
    
    // Apply sorting
    if (params?.sort) {
      resources.sort((a, b) => {
        const aVal = a[params.sort as keyof typeof a];
        const bVal = b[params.sort as keyof typeof b];
        const order = params.order === 'asc' ? 1 : -1;
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * order;
        }
        
        return (aVal > bVal ? 1 : -1) * order;
      });
    }
    
    return {
      success: true,
      data: resources
    };
  }

  async getStorageResources(applicationId: string) {
    await delay();
    
    const resources = mockApiData.storageResources[applicationId] || [];
    
    return {
      success: true,
      data: resources
    };
  }

  async getDatabaseResources(applicationId: string) {
    await delay();
    
    const resources = mockApiData.databaseResources[applicationId] || [];
    
    return {
      success: true,
      data: resources
    };
  }

  // Analytics APIs
  async getTrends(params: {
    period: string;
    type?: string;
    granularity?: string;
  }) {
    await delay();
    
    const trendType = params.type?.toLowerCase() || 'spends';
    const trendsData = mockApiData.trends[trendType as keyof typeof mockApiData.trends];
    
    if (!trendsData) {
      return {
        success: false,
        error: 'Trend type not found'
      };
    }
    
    return {
      success: true,
      data: trendsData
    };
  }

  async getRecommendations(params?: {
    type?: string;
    priority?: string;
    limit?: number;
  }) {
    await delay();
    
    let recommendations = [...mockApiData.recommendations];
    
    // Apply filters
    if (params?.type) {
      recommendations = recommendations.filter(rec => rec.type === params.type);
    }
    
    if (params?.priority) {
      recommendations = recommendations.filter(rec => rec.priority === params.priority);
    }
    
    // Apply limit
    if (params?.limit) {
      recommendations = recommendations.slice(0, params.limit);
    }
    
    return {
      success: true,
      data: recommendations
    };
  }

  // Alerts APIs
  async getAlerts(params?: {
    severity?: string;
    isRead?: boolean;
    limit?: number;
  }) {
    await delay();
    
    let alerts = [...mockApiData.alerts];
    
    // Apply filters
    if (params?.severity) {
      alerts = alerts.filter(alert => alert.severity === params.severity);
    }
    
    if (params?.isRead !== undefined) {
      alerts = alerts.filter(alert => alert.isRead === params.isRead);
    }
    
    // Apply limit
    if (params?.limit) {
      alerts = alerts.slice(0, params.limit);
    }
    
    // Sort by timestamp (newest first)
    alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return {
      success: true,
      data: alerts
    };
  }

  async markAlertAsRead(alertId: string) {
    await delay();
    
    const alert = mockApiData.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      return {
        success: true,
        data: alert
      };
    }
    
    return {
      success: false,
      error: 'Alert not found'
    };
  }

  // Attention APIs
  async getAttentionData(params?: {
    category?: 'usage-cost' | 'disk-utilisation' | 'idle-instances';
    filter?: string;
    search?: string;
  }) {
    await delay();
    
    const category = params?.category || 'usage-cost';
    let data = [...mockApiData.attentionData[category]];
    
    // Apply filter
    if (params?.filter && params.filter !== 'All') {
      if (category === 'usage-cost' && params.filter.startsWith('Cloud Account')) {
        data = data.filter(item => item.cloudAccount === params.filter);
      } else if (category === 'disk-utilisation') {
        const threshold = parseInt(params.filter.replace(/[^0-9]/g, '')) || 0;
        data = data.filter(item => item.diskUtilisation > threshold);
      } else if (category === 'idle-instances') {
        const threshold = parseInt(params.filter.replace(/[^0-9]/g, '')) || 0;
        data = data.filter(item => item.idleInstances > threshold);
      }
    }
    
    // Apply search
    if (params?.search) {
      const searchTerm = params.search.toLowerCase();
      data = data.filter(item => 
        item.cloudAccount.toLowerCase().includes(searchTerm) ||
        item.applicationName.toLowerCase().includes(searchTerm)
      );
    }
    
    return {
      success: true,
      data
    };
  }

  // Spot Utilization APIs
  async getSpotUtilization(params?: {
    sort?: string;
    order?: string;
  }) {
    await delay();
    
    let data = [...mockApiData.spotUtilization];
    
    // Apply sorting
    if (params?.sort) {
      data.sort((a, b) => {
        const aVal = a[params.sort as keyof typeof a];
        const bVal = b[params.sort as keyof typeof b];
        const order = params.order === 'asc' ? 1 : -1;
        
        return (aVal > bVal ? 1 : -1) * order;
      });
    }
    
    return {
      success: true,
      data
    };
  }

  // Spot Savings Details API
  async getSpotSavingsDetails(accountId: number, params?: {
    sort?: string;
    order?: string;
  }) {
    await delay();
    
    // Generate mock savings details for the specific account
    const savingsDetails = Array(6).fill(null).map((_, index) => ({
      id: `savings-${accountId}-${index + 1}`,
      cloudAccount: `Cloud Account ${accountId}`,
      applicationName: `Temp_Core_${String(index + 1).padStart(2, '0')}`,
      onDemandCost: 6000 + (index * 500),
      savingsWithSpot: 3000 + (index * 200),
      savingsWithoutSpot: 1000 + (index * 100),
      percentageSavings: 50 + (index * 2)
    }));
    
    // Apply sorting if specified
    if (params?.sort) {
      savingsDetails.sort((a, b) => {
        const aVal = a[params.sort as keyof typeof a];
        const bVal = b[params.sort as keyof typeof b];
        const order = params.order === 'asc' ? 1 : -1;
        
        return (aVal > bVal ? 1 : -1) * order;
      });
    }
    
    return {
      success: true,
      data: savingsDetails
    };
  }
}

export const mockApiService = new MockApiService();