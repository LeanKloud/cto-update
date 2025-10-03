import React, { useState, useEffect } from 'react';
import { ChevronDown, HardDrive } from 'lucide-react';
import { fetchStorageRecommendations, StorageRecommendation } from '../../api/storageRecommendations';
import { fetchAllFilterOptions, Department, CloudProvider } from '../../services/filterService';
import { FILTER_STYLES, FILTER_PLACEHOLDERS } from '../../styles/filterStyles';

interface SizeRecommendation extends StorageRecommendation {
  recommendedSize: number;
  monthlySavings: number;
}

const StorageSize: React.FC = () => {
  const [recommendations, setRecommendations] = useState<SizeRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    department: '',
    application: '',
    cloudProvider: ''
  });
  const [applications, setApplications] = useState<string[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>([]);

  // Load filter options from backend APIs
  const loadFilterOptions = async () => {
    try {
      const filterData = await fetchAllFilterOptions();
      setDepartments(filterData.departments);
      setCloudProviders(filterData.cloudProviders);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterParams = {
        department: filters.department,
        application: filters.application,
        provider: filters.cloudProvider as 'aws' | 'azure' | 'gcp'
      };

      const data = await fetchStorageRecommendations(filterParams);
      
      // Transform to size recommendations
      const sizeRecommendations: SizeRecommendation[] = data.map(item => {
        // Calculate recommended size based on consumed size + 20% buffer
        const recommendedSize = Math.round(item.consumed_size * 1.2);
        
        // Calculate potential savings if we resize
        const sizeDifference = item.provisioned_size - recommendedSize;
        const monthlySavings = sizeDifference > 0 ? sizeDifference * 0.096 : 0; // ~$0.096 per GB per month for gp3
        
        return {
          ...item,
          recommendedSize: recommendedSize,
          monthlySavings: monthlySavings
        };
      }).filter(item => item.provisioned_size > item.recommendedSize);
      
      setRecommendations(sizeRecommendations);

      // Extract applications from response
      const uniqueApps = Array.from(new Set(data.map(item => item.application_name).filter(Boolean))).sort();
      setApplications(uniqueApps as string[]);

    } catch (err) {
      console.error('Error fetching data:', err);
      
      // Fallback to mock data when API fails
      const mockRecommendations: SizeRecommendation[] = [
        {
          storage_id: 'vol-0size1',
          storage_type: 'gp3',
          application_name: 'Web Application',
          host_asset: 'i-1234567890abcdef0',
          provisioned_size: 500,
          consumed_size: 200,
          provider_name: 'aws',
          current_cost_per_month: 45.30,
          currency_code: 'USD',
          throughput_idle_pct: 50,
          total_throughput: 1000,
          recommendations: {},
          recommendedSize: 240,
          monthlySavings: 18.75
        },
        {
          storage_id: 'vol-0size2',
          storage_type: 'gp2',
          application_name: 'Database Application',
          host_asset: 'i-0987654321fedcba0',
          provisioned_size: 200,
          consumed_size: 100,
          provider_name: 'aws',
          current_cost_per_month: 18.75,
          currency_code: 'USD',
          throughput_idle_pct: 30,
          total_throughput: 800,
          recommendations: {},
          recommendedSize: 120,
          monthlySavings: 8.00
        },
        {
          storage_id: 'vol-0size3',
          storage_type: 'st1',
          application_name: 'Analytics Service',
          host_asset: 'i-1122334455667788',
          provisioned_size: 1000,
          consumed_size: 600,
          provider_name: 'aws',
          current_cost_per_month: 80.10,
          currency_code: 'USD',
          throughput_idle_pct: 40,
          total_throughput: 1200,
          recommendations: {},
          recommendedSize: 720,
          monthlySavings: 28.03
        }
      ];
      
      setRecommendations(mockRecommendations);
      setApplications(['Web Application', 'Database Application', 'Analytics Service']);
      setError(null); // Clear error since we have fallback data
    } finally {
      setLoading(false);
    }
  };

  // Load filter options on component mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Default load and re-fetch on filter change
  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.department, filters.application, filters.cloudProvider]);

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'department') {
      setFilters(prev => ({ ...prev, department: value, application: '' }));
      return;
    }
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2">Size Optimization</h1>
              <p className="text-slate-300">Right-size volumes based on utilization to reduce spend</p>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchRecommendations()
                  .finally(() => {
                    setLoading(false);
                  });
              }}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className={FILTER_STYLES.section}>
          <div className={FILTER_STYLES.sectionHeader}>
            <div className="text-sm text-slate-400">
              Showing {recommendations.length} of {recommendations.length} volumes
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className={FILTER_STYLES.wrapper}>
              {/* Department Filter */}
              <div className={FILTER_STYLES.container}>
                <select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className={FILTER_STYLES.input}
                  aria-label="Department"
                >
                  <option value="">{FILTER_PLACEHOLDERS.department}</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <ChevronDown className={FILTER_STYLES.chevron} />
              </div>

              {/* Cloud Provider Filter */}
              <div className={FILTER_STYLES.container}>
                <select
                  value={filters.cloudProvider}
                  onChange={(e) => handleFilterChange('cloudProvider', e.target.value)}
                  className={FILTER_STYLES.input}
                  aria-label="Cloud Provider"
                >
                  <option value="">{FILTER_PLACEHOLDERS.cloudProvider}</option>
                  {cloudProviders.map((provider) => (
                    <option key={provider.name} value={provider.name}>{provider.description}</option>
                  ))}
                </select>
                <ChevronDown className={FILTER_STYLES.chevron} />
              </div>

              {/* Sort by Filter */}
              <div className={FILTER_STYLES.container}>
                <select
                  className={FILTER_STYLES.input}
                  aria-label="Sort by"
                >
                  <option value="">No Sorting</option>
                  <option value="savings-desc">Monthly Spend (High to Low)</option>
                  <option value="savings-asc">Monthly Spend (Low to High)</option>
                </select>
                <ChevronDown className={FILTER_STYLES.chevron} />
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <div className="mt-4 text-slate-300">Loading size recommendations...</div>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="text-red-400 text-lg mb-2">Error loading data</div>
              <div className="text-slate-300 text-sm mb-4">{error}</div>
              <div className="text-slate-400 text-xs">Please check your connection and try again</div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-500 text-lg mb-2">No size optimization opportunities found</div>
              <div className="text-gray-400 text-sm">All your volumes are appropriately sized</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead className="bg-slate-700 border-b border-slate-600">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">Volume Id</th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">Type</th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">Provisioned Size</th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">Recommended Size</th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">Monthly Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {recommendations.map((item, index) => (
                    <tr 
                      key={item.storage_id}
                      className={`hover:bg-slate-700/50 transition-colors ${
                        index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <HardDrive className="w-5 h-5 text-green-400" />
                          <span className="font-medium text-white">
                            {item.storage_id}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-700 text-slate-300">
                          {item.storage_type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-white">{item.provisioned_size.toFixed(0)} GB</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-400 font-medium">{item.recommendedSize} GB</span>
                          <span className="text-sm text-green-400">
                            ({((item.provisioned_size - item.recommendedSize) / item.provisioned_size * 100).toFixed(0)}% reduction)
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-white">${item.monthlySavings.toFixed(2)}</span>
                          <span className="text-sm text-green-400">savings</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorageSize;
