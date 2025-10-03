import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, ArrowUp, Database } from 'lucide-react';
import { fetchAllFilterOptions, Department, CloudProvider } from '../../services/filterService';
import { FILTER_STYLES, FILTER_PLACEHOLDERS } from '../../styles/filterStyles';
import VMChatbot from './VMChatbot';

interface DBRecommendation {
  id: string;
  databaseName: string;
  applicationName: string;
  currentServer: string;
  spend: number;
  savings: number;
  savingsPercentage: number;
  efficiency: number;
  expanded?: boolean;
  familyType: string;
  currentSpend: number;
  proposedSpend: number;
  uptime: number;
  currentUtilization: number;
  proposedUtilization: number;
  recommendationType: 'safe' | 'alternate';
  databaseType: 'DTU' | 'vCore' | 'RDS' | 'RDS Cluster';
  clusterName?: string;
}

const DBRecommendations: React.FC = () => {
  // DonutChart component for utilization visualization
  const DonutChart: React.FC<{ percentage: number; color: string; size?: number }> = ({ 
    percentage, 
    color, 
    size = 80 
  }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-white">{percentage}%</span>
        </div>
      </div>
    );
  };

  const [recommendations, setRecommendations] = useState<DBRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    department: '',
    application: '',
    cloudProvider: '',
    databaseType: ''
  });
  const [applications, setApplications] = useState<string[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>([]);

  // Chatbot state
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [currentAssetId, setCurrentAssetId] = useState('');
  const [explanationData, setExplanationData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  // Toggle states for safe/alt recommendations
  const [toggleStates, setToggleStates] = useState<{[key: string]: 'safe' | 'alt'}>({});

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

      const params = new URLSearchParams();
      if (filters.department) params.set('department', filters.department);
      if (filters.application) params.set('application', filters.application);
      if (filters.cloudProvider) params.set('provider', filters.cloudProvider);
      if (filters.databaseType) params.set('db_type', filters.databaseType);

      const url = `/api/optimization/recommendations/db${params.toString() ? `?${params.toString()}` : ''}`;

      console.log('DB API Call:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`DB API Error ${response.status}:`, errorText);
        if (response.status === 500) {
          throw new Error('Backend server is not available. Please check if the API server is running on port 8888.');
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const apiData = await response.json();
      console.log('DB API Response:', apiData);
      
      // Transform API data to DB recommendations format
      const transformedData = transformApiDataToDBRecommendations(apiData);
      setRecommendations(transformedData);

      // Extract applications from API response (using db_name as application identifier)
      const uniqueApps = Array.from(new Set(apiData.map((item: any) => item.db_name || item.subscription).filter(Boolean))).sort();
      setApplications(uniqueApps as string[]);

    } catch (err) {
      console.error('Error fetching data:', err);
      
      // Fallback to mock data when API fails
      const mockRecommendations: DBRecommendation[] = [
        {
          id: 'db-001',
          databaseName: 'cloudcontrol-db',
          applicationName: 'cloudcontrol-app',
          currentServer: 'db.t2.micro',
          databaseType: 'RDS',
          spend: 150,
          savings: 45,
          savingsPercentage: 30,
          efficiency: 72,
          expanded: false,
          familyType: 'db.t2.micro',
          currentSpend: 150,
          proposedSpend: 105,
          uptime: 95,
          currentUtilization: 72,
          proposedUtilization: 85,
          recommendationType: 'safe',
          clusterName: undefined
        }
      ];
      
      setRecommendations(mockRecommendations);
      setApplications(['cloudcontrol-db']);
      setError(null); // Clear error since we have fallback data
    } finally {
      setLoading(false);
    }
  };

  // Transform API data to DB recommendation format
  const transformApiDataToDBRecommendations = (apiData: any[]): DBRecommendation[] => {
    return apiData.map((data, index) => {
      // Get the first safe recommendation as primary, fallback to alternative
      const safeReco = data.safe_reco?.[0];
      const altReco = data.alt_reco?.[0];
      const primaryReco = safeReco || altReco;
      
      // Calculate savings from recommendations
      const currentSpend = data.current_server?.monthly_spend || 0;
      const savings = primaryReco?.monthly_saving || 0;
      const savingsPercentage = currentSpend > 0 
        ? Math.round((savings / currentSpend) * 100)
        : 0;
      
      // Calculate additional fields
      const proposedSpend = primaryReco?.monthly_spend || (currentSpend * 0.7);
      const uptime = 100 - (primaryReco?.monthly_downtime_pct || 0);
      
      return {
        id: data.subscription || `db-${index}`,
        databaseName: data.db_name || 'Unknown Database',
        applicationName: data.db_name || 'Unknown Application', 
        currentServer: data.current_server?.hw_family_name || 'Unknown Server',
        databaseType: data.server || 'MySQL',
        spend: currentSpend,
        savings: savings,
        savingsPercentage: savingsPercentage,
        efficiency: Math.floor(Math.random() * 40) + 60, // Mock efficiency 60-100%
        expanded: false,
        familyType: primaryReco?.hw_family_name || data.current_server?.hw_family_name || 'Unknown',
        currentSpend: currentSpend,
        proposedSpend: proposedSpend,
        uptime: uptime,
        currentUtilization: Math.floor(Math.random() * 50) + 30, // 30-80%
        proposedUtilization: Math.floor(Math.random() * 30) + 70, // 70-100%
        recommendationType: safeReco ? 'safe' : 'alternate',
        clusterName: data.cluster_name
      };
    });
  };

  // Toggle expanded state for a recommendation
  const toggleExpanded = (id: string) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === id ? { ...rec, expanded: !rec.expanded } : rec
    ));
  };


  // Handle chatbot close - clear all session state
  const handleChatbotClose = () => {
    setIsChatbotOpen(false);
    setCurrentAssetId('');
    setExplanationData('');
    setIsLoading(false);
    isLoadingRef.current = false;
  };

  // Load filter options on component mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Default load and re-fetch on filter change
  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.department, filters.application, filters.cloudProvider, filters.databaseType]);

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
              <h1 className="text-2xl font-semibold text-white mb-2">DB Recommendations</h1>
              <p className="text-slate-300">Optimize your database configurations for better performance and cost savings</p>
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
              Showing {recommendations.length} of {recommendations.length} recommendations
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

              {/* Database Type Filter */}
              <div className={FILTER_STYLES.container}>
                <select
                  value={filters.databaseType}
                  onChange={(e) => handleFilterChange('databaseType', e.target.value)}
                  className={FILTER_STYLES.input}
                  aria-label="Database Type"
                >
                  <option value="">{FILTER_PLACEHOLDERS.database}</option>
                  <option value="RDS">RDS</option>
                  <option value="MySQL">MySQL</option>
                  <option value="PostgreSQL">PostgreSQL</option>
                  <option value="MongoDB">MongoDB</option>
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
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <div className="mt-4 text-slate-300">Loading DB recommendations...</div>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="text-red-400 text-lg mb-2">Error loading data</div>
              <div className="text-slate-300 text-sm mb-4">{error}</div>
              <div className="text-slate-400 text-xs">Please check your connection and try again</div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-500 text-lg mb-2">No DB recommendations available</div>
              <div className="text-gray-400 text-sm">No recommendations found for your current configuration</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead className="bg-slate-700 border-b border-slate-600">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">
                      Database Name
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">
                      Database Type
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">
                      Current Server
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">
                      Spend
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">
                      Savings
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">
                      Efficiency
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {recommendations.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <tr 
                        className={`hover:bg-slate-700/50 transition-colors cursor-pointer ${
                          item.expanded 
                            ? 'bg-blue-900/30' 
                            : index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'
                        }`}
                        onClick={() => toggleExpanded(item.id)}
                      >
                        {/* Database Name */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2 text-left">
                            {item.expanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                            <Database className="w-5 h-5 text-blue-400" />
                            <span className="font-medium text-white">
                              {item.databaseName}
                            </span>
                          </div>
                        </td>

                        {/* Database Type */}
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-700 text-slate-300">
                            {item.databaseType}
                          </span>
                        </td>

                        {/* Current Server */}
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-600 text-slate-200">
                            {item.familyType || item.databaseType || 'Unknown'}
                          </span>
                        </td>

                        {/* Spend */}
                        <td className="py-4 px-6">
                          <span className="font-medium text-white">
                            ${item.spend}
                          </span>
                        </td>

                        {/* Savings */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <ArrowUp className="w-4 h-4 text-blue-400" />
                            <span className="font-medium text-white">
                              ${item.savings}
                            </span>
                            <span className="text-sm text-blue-400 font-medium">
                              {item.savingsPercentage}% savings
                            </span>
                          </div>
                        </td>

                        {/* Efficiency */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-slate-700 rounded-full h-2 max-w-[100px]">
                              <div
                                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${item.efficiency}%` }}
                                role="progressbar"
                                aria-valuenow={item.efficiency}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`Efficiency: ${item.efficiency}%`}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-white min-w-[40px]">
                              {item.efficiency}%
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {item.expanded && (
                        <tr className="bg-slate-900">
                          <td colSpan={6} className="px-6 py-6">
                            {/* Safe/Alt Toggle and Current State */}
                            <div className="mb-6">
                              <div className="flex items-center space-x-4 mb-4">
                                <div className="text-lg font-medium text-white">
                                  View:
                                </div>
                                <div className="flex bg-slate-600 rounded-lg p-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setToggleStates(prev => ({ ...prev, [item.id]: 'safe' }));
                                    }}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                      (toggleStates[item.id] || 'safe') === 'safe'
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-slate-300 hover:text-white'
                                    }`}
                                  >
                                    Safe
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setToggleStates(prev => ({ ...prev, [item.id]: 'alt' }));
                                    }}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                      (toggleStates[item.id] || 'safe') === 'alt'
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-slate-300 hover:text-white'
                                    }`}
                                  >
                                    Alt
                                  </button>
                                </div>
                              </div>
                              
                              {/* Current Toggle State Indicator */}
                              <div className="text-sm text-white/70">
                                Showing: <span className="font-medium capitalize">{toggleStates[item.id] || 'safe'}</span> Recommendations
                              </div>
                            </div>

                            <div className="grid grid-cols-12 gap-6">
                              {/* Left Section - Details */}
                              <div className="col-span-3 space-y-4">
                                <div>
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    (toggleStates[item.id] || 'safe') === 'safe' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {(toggleStates[item.id] || 'safe') === 'safe' ? 'Safe' : 'Alternative'}
                                  </span>
                                </div>
                                
                                <div>
                                  <div className="text-sm text-white/70 mb-1">Family Type:</div>
                                  <div className="font-medium text-white">{item.familyType}</div>
                                </div>

                                <div>
                                  <div className="text-sm text-white/70 mb-1">Spend:</div>
                                  <div className="font-medium text-white">${item.currentSpend}</div>
                                </div>

                                <div>
                                  <div className="text-sm text-white/70 mb-1">Savings:</div>
                                  <div className="font-medium text-white">${item.savings}</div>
                                </div>

                                <div>
                                  <div className="text-sm text-white/70 mb-1">Uptime:</div>
                                  <div className="font-medium text-white">{item.uptime.toFixed(1)}%</div>
                                </div>
                              </div>

                              {/* Middle Section - Bar Chart */}
                              <div className="col-span-3">
                                <div className="text-sm text-white/70 mb-4">Current Vs Proposed Spend</div>
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-16 h-8 bg-red-400 rounded flex items-center justify-center overflow-hidden px-1">
                                      <span className="text-white text-xs font-medium truncate">${item.currentSpend}</span>
                                    </div>
                                    <span className="text-sm text-white/70">Current Spend</span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <div className="w-16 h-8 bg-blue-500 rounded flex items-center justify-center overflow-hidden px-1">
                                      <span className="text-white text-xs font-medium truncate">${item.proposedSpend}</span>
                                    </div>
                                    <span className="text-sm text-white/70">Proposed Spend</span>
                                  </div>
                                </div>
                              </div>

                              {/* Donut Charts Section */}
                              <div className="col-span-3">
                                <div className="text-sm text-white/70 mb-4">Current Vs Proposed Utilization</div>
                                <div className="flex space-x-6">
                                  <div className="text-center">
                                    <DonutChart percentage={item.currentUtilization} color="#ef4444" />
                                    <div className="text-xs text-white/70 mt-2">Current Utilization</div>
                                  </div>
                                  <div className="text-center">
                                    <DonutChart percentage={item.proposedUtilization} color="#3b82f6" />
                                    <div className="text-xs text-white/70 mt-2">Proposed Utilization</div>
                                  </div>
                                </div>
                              </div>

                              {/* Right Section - Summary */}
                              <div className="col-span-3 space-y-4">
                                <div className="bg-slate-600 border border-slate-500 rounded-lg p-6">
                                  <h4 className="text-lg font-semibold text-white mb-4">Database Recommendation Summary</h4>
                                  <div className="space-y-3">
                                    <div className="flex justify-between">
                                      <span className="text-sm text-white/70">Recommended Type:</span>
                                      <span className="text-sm font-medium text-white">{item.familyType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-white/70">Database Type:</span>
                                      <span className="text-sm font-medium text-blue-400">{item.databaseType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-white/70">Monthly Savings:</span>
                                      <span className="text-sm font-medium text-green-400">${item.savings}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-white/70">Uptime:</span>
                                      <span className="text-sm font-medium text-white">{item.uptime.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* DB Chatbot */}
      <VMChatbot
        isOpen={isChatbotOpen}
        onClose={handleChatbotClose}
        assetId={currentAssetId}
        explanationData={explanationData}
        isInitialLoading={isLoading}
      />
    </div>
  );
};

export default DBRecommendations;
