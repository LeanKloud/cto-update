import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

// Generic hook for API calls with loading and error states
export function useApi<T>(
  apiCall: () => Promise<any>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall();
        
        if (isMounted) {
          if (response.success) {
            setData(response.data);
          } else {
            setError(response.error || 'An error occurred');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'An error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

// Specific hooks for common API calls
export function useDashboardSummary(params?: { period?: string }) {
  return useApi(
    () => apiService.getDashboardSummary(params),
    [params?.period]
  );
}

export function useCloudAccounts(params?: {
  provider?: string;
  department?: string;
  period?: string;
  page?: number;
  limit?: number;
}) {
  return useApi(
    () => apiService.getCloudAccounts(params),
    [params?.provider, params?.department, params?.period, params?.page, params?.limit]
  );
}

export function useApplications(params?: {
  cloudAccount?: string;
  sort?: string;
  order?: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useApi(
    () => apiService.getApplications(params),
    [params?.cloudAccount, params?.sort, params?.order, params?.page, params?.limit, params?.search]
  );
}

export function useComputeResources(applicationId: string, params?: {
  type?: string;
  sort?: string;
  order?: string;
}) {
  return useApi(
    () => apiService.getComputeResources(applicationId, params),
    [applicationId, params?.type, params?.sort, params?.order]
  );
}

export function useStorageResources(applicationId: string) {
  return useApi(
    () => apiService.getStorageResources(applicationId),
    [applicationId]
  );
}

export function useDatabaseResources(applicationId: string) {
  return useApi(
    () => apiService.getDatabaseResources(applicationId),
    [applicationId]
  );
}

export function useAlerts(params?: {
  severity?: string;
  isRead?: boolean;
  limit?: number;
}) {
  return useApi(
    () => apiService.getAlerts(params),
    [params?.severity, params?.isRead, params?.limit]
  );
}

export function useRecommendations(params?: {
  type?: string;
  priority?: string;
  limit?: number;
}) {
  return useApi(
    () => apiService.getRecommendations(params),
    [params?.type, params?.priority, params?.limit]
  );
}

export function useTrends(params: {
  period: string;
  type?: string;
  granularity?: string;
}) {
  return useApi(
    () => apiService.getTrends(params),
    [params.period, params.type, params.granularity]
  );
}

export function useAttentionData(params?: {
  category?: 'usage-cost' | 'disk-utilisation' | 'idle-instances';
  filter?: string;
  search?: string;
}) {
  return useApi(
    () => apiService.getAttentionData(params),
    [params?.category, params?.filter, params?.search]
  );
}

export function useSpotUtilization(params?: {
  sort?: string;
  order?: string;
}) {
  return useApi(
    () => apiService.getSpotUtilization(params),
    [params?.sort, params?.order]
  );
}