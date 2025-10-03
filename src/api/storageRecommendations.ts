// API utility for storage recommendations
export interface StorageRecommendation {
  storage_id: string;
  storage_type: string;
  application_name: string;
  host_asset: string;
  provisioned_size: number;
  consumed_size: number;
  provider_name: 'aws' | 'azure' | 'gcp';
  current_cost_per_month: number;
  currency_code: string;
  throughput_idle_pct: number;
  total_throughput: number;
  provisionedIOPS?: number;
  recommendedIOPS?: number;
  recommendations: {
    block?: {
      family_type: string;
      cost_savings: number;
      description: string;
    };
    object?: {
      storage_type: string;
      cost_savings: number;
      description: string;
    };
    snapshot?: {
      snapshot_type: string;
      cost_savings: number;
      description: string;
    };
  };
}

interface StorageRecommendationFilters {
  department?: string;
  application?: string;
  provider?: 'aws' | 'azure' | 'gcp';
}

export async function fetchStorageRecommendations(filters: StorageRecommendationFilters = {}): Promise<StorageRecommendation[]> {
  const params = new URLSearchParams();
  if (filters.department) params.append('department', filters.department);
  if (filters.application) params.append('application', filters.application);
  if (filters.provider) params.append('provider', filters.provider);
  const url = `/api/optimization/recommendations/storage${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url, { 
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include' 
  });
  if (!res.ok) throw new Error('Failed to fetch storage recommendations');
  return await res.json();
}
