import React, { useState, useEffect } from 'react';
import { ChevronDown, HardDrive } from 'lucide-react';
import { fetchStorageRecommendations, StorageRecommendation } from '../../api/storageRecommendations';
import { fetchAllFilterOptions, Department, CloudProvider } from '../../services/filterService';
import { FILTER_STYLES, FILTER_PLACEHOLDERS } from '../../styles/filterStyles';

const StorageIdle: React.FC = () => {
  const [recommendations, setRecommendations] = useState<StorageRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedRecommendations, setSelectedRecommendations] = useState<Record<string, 'block' | 'object' | 'snapshot'>>({});
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
      
      // Filter for idle volumes only (high throughput idle percentage)
      const idleVolumes = data.filter(item => item.throughput_idle_pct >= 80);
      
      setRecommendations(idleVolumes);

      // Extract applications from response
      const uniqueApps = Array.from(new Set(data.map(item => item.application_name).filter(Boolean))).sort();
      setApplications(uniqueApps as string[]);

    } catch (err) {
      console.error('Error fetching data:', err);
      
      // Fallback to mock data when API fails
      const mockRecommendations: StorageRecommendation[] = [
        {
          storage_id: 'vol-0053beb8c7b733831',
          storage_type: 'gp3',
          application_name: 'rbtuat-TejeshPulari-Titlo-Server-2021-12-22',
          host_asset: 'i-0d9de9bc19d1b328d',
          provisioned_size: 30,
          consumed_size: 30,
          provider_name: 'aws',
          current_cost_per_month: 1.50,
          currency_code: 'USD',
          throughput_idle_pct: 100,
          total_throughput: 0,
          recommendations: {
            block: {
              family_type: 'gp3',
              cost_savings: 0.75,
              description: 'Convert to gp3 for better performance and cost savings'
            },
            object: {
              storage_type: 'S3 Standard-IA',
              cost_savings: 1.20,
              description: 'Move to S3 Infrequent Access for rarely used data'
            },
            snapshot: {
              snapshot_type: 'gp2',
              cost_savings: 0.30,
              description: 'Create snapshot before archiving'
            }
          }
        }
      ];
      
      setRecommendations(mockRecommendations);
      setApplications(['rbtuat-TejeshPulari-Titlo-Server-2021-12-22']);
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

  const toggleRowExpansion = (storageId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storageId)) {
        newSet.delete(storageId);
      } else {
        newSet.add(storageId);
      }
      return newSet;
    });
  };

  const handleRecommendationChange = (storageId: string, recommendationType: 'block' | 'object' | 'snapshot') => {
    setSelectedRecommendations(prev => ({
      ...prev,
      [storageId]: recommendationType
    }));
  };

  const getRecommendationOptions = (item: StorageRecommendation) => {
    const options: Array<{type: 'block' | 'object' | 'snapshot', label: string, value: string, savings: number}> = [];
    
    if (item.recommendations.block) {
      options.push({
        type: 'block',
        label: 'Block',
        value: item.recommendations.block.family_type,
        savings: item.recommendations.block.cost_savings
      });
    }
    
    if (item.recommendations.object) {
      options.push({
        type: 'object',
        label: 'Object',
        value: item.recommendations.object.storage_type,
        savings: item.recommendations.object.cost_savings
      });
    }
    
    if (item.recommendations.snapshot) {
      options.push({
        type: 'snapshot',
        label: 'Snapshot',
        value: item.recommendations.snapshot.snapshot_type,
        savings: item.recommendations.snapshot.cost_savings
      });
    }
    
    return options;
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2">Idle Volumes</h1>
              <p className="text-slate-300">Find EBS volumes with no recent activity to right-size or remove</p>
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
              Showing 1 of 1 volumes
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

              {/* Application Filter */}
              <div className={FILTER_STYLES.container}>
                <select
                  value={filters.application}
                  onChange={(e) => handleFilterChange('application', e.target.value)}
                  className={FILTER_STYLES.input}
                  aria-label="Application"
                >
                  <option value="">{FILTER_PLACEHOLDERS.application}</option>
                  {applications.map(app => (
                    <option key={app} value={app}>{app}</option>
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
                  <option value="idle-desc">Idle % (High to Low)</option>
                  <option value="idle-asc">Idle % (Low to High)</option>
                  <option value="cost-desc">Cost (High to Low)</option>
                  <option value="cost-asc">Cost (Low to High)</option>
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
              <div className="mt-4 text-slate-300">Loading idle volumes...</div>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="text-red-400 text-lg mb-2">Error loading data</div>
              <div className="text-slate-300 text-sm mb-4">{error}</div>
              <div className="text-slate-400 text-xs">Please check your connection and try again</div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-500 text-lg mb-2">No idle volumes found</div>
              <div className="text-gray-400 text-sm">All your storage volumes are actively being used</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead className="bg-slate-700 border-b border-slate-600">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">Volume Id</th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">Type</th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">Application</th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">Host Asset</th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">Provisioned Size</th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">Consumed Size</th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">Provider</th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">Current Cost/Month</th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">Currency</th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">Throughput Idle %</th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">Total Throughput</th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">Recommendations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {recommendations.map((item, index) => {
                    const isExpanded = expandedRows.has(item.storage_id);
                    const recommendationOptions = getRecommendationOptions(item);
                    const selectedRec = selectedRecommendations[item.storage_id];
                    
                    return (
                      <React.Fragment key={item.storage_id}>
                        <tr 
                          className={`hover:bg-slate-700/50 transition-colors ${
                            index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'
                          }`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <HardDrive className="w-5 h-5 text-orange-400" />
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
                            <span className="text-white">{item.application_name}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-white">{item.host_asset}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-white">{item.provisioned_size}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-white">{item.consumed_size}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-700 text-slate-300">
                              {item.provider_name.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-medium text-white">{item.current_cost_per_month}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-white">{item.currency_code}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-orange-400">{item.throughput_idle_pct}%</span>
                              <span className="text-sm text-orange-400">idle</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-white">{item.total_throughput}</span>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => toggleRowExpansion(item.storage_id)}
                              className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <span>View Recommendations</span>
                              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded Recommendations Row */}
                        {isExpanded && (
                          <tr className="bg-slate-700/50">
                            <td colSpan={12} className="px-6 py-4">
                              <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-white mb-4">Storage Recommendations for {item.storage_id}</h4>
                                
                                {/* Recommendation Type Selector */}
                                <div className="flex items-center space-x-4 mb-4">
                                  <label className="text-slate-300 font-medium">Select Recommendation Type:</label>
                                  <select
                                    value={selectedRec || ''}
                                    onChange={(e) => handleRecommendationChange(item.storage_id, e.target.value as 'block' | 'object' | 'snapshot')}
                                    className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">Select a recommendation...</option>
                                    {recommendationOptions.map((option) => (
                                      <option key={option.type} value={option.type}>
                                        {option.label} - {option.value} (Save ${option.savings.toFixed(2)}/month)
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Recommendation Details */}
                                {selectedRec && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {recommendationOptions.map((option) => (
                                      <div
                                        key={option.type}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                          selectedRec === option.type
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-slate-600 bg-slate-600/50'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <h5 className="font-semibold text-white">{option.label}</h5>
                                          <span className="text-green-400 font-medium">${option.savings.toFixed(2)}/mo</span>
                                        </div>
                                        <p className="text-slate-300 text-sm mb-2">{option.value}</p>
                                        <p className="text-slate-400 text-xs">
                                          {option.type === 'block' && item.recommendations.block?.description}
                                          {option.type === 'object' && item.recommendations.object?.description}
                                          {option.type === 'snapshot' && item.recommendations.snapshot?.description}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-4">
                                  <button
                                    onClick={() => toggleRowExpansion(item.storage_id)}
                                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                                  >
                                    Close
                                  </button>
                                  {selectedRec && (
                                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                      Apply Recommendation
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mt-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Optimization Recommendations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">Right-size Storage</h4>
                <p className="text-slate-300 text-sm">Consider reducing provisioned size to match actual consumption</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">Archive Old Data</h4>
                <p className="text-slate-300 text-sm">Move infrequently accessed data to cheaper storage tiers</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">Remove Unused Volumes</h4>
                <p className="text-slate-300 text-sm">Consider removing volumes with 100% idle time after verification</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageIdle;
