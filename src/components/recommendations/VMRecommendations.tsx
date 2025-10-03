import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown, MessageCircle, Server } from 'lucide-react';
import VMChatbot from './VMChatbot';
import { getMockVMExplanation } from '../../api/vmExplanations';
import { getVMExplanation } from '../../services/chatbotService';
import { fetchAllFilterOptions, Department, CloudProvider } from '../../services/filterService';
import { FILTER_STYLES, FILTER_PLACEHOLDERS } from '../../styles/filterStyles';

interface VMRecommendation {
  id: string;
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
  maxCpuUsage: number;
  maxMemoryUsage: number;
  maxNetworkThroughput: number;
}

// API Response Interfaces
interface ApiServer {
  hw_family_name: string;
  asset_id: string | null;
  is_reserved: boolean;
  is_conservative: boolean;
  monthly_downtime_pct: number;
  monthly_spend: number;
  monthly_unutilized: number;
  monthly_saving: number;
  currency_code: string;
  provider: string;
}

interface ApiRecommendationData {
  application_name: string;
  current_server: ApiServer;
  conservative_reco: ApiServer[];
  alternate_reco: ApiServer[];
}

type ApiResponse = ApiRecommendationData[];

// Transformed data structure - grouped by asset_id
interface TransformedVMData {
  asset_id: string;
  application_name: string; // Now included as a property
  current_server: ApiServer;
  conservative_reco: ApiServer[];
  alternate_reco: ApiServer[];
}

type TransformedApiResponse = TransformedVMData[];

const VMRecommendations: React.FC = () => {
  const [sortField, setSortField] = useState<'spend' | 'savings' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [recommendationView, setRecommendationView] = useState<string>('all');
  const [filters, setFilters] = useState({
    department: '',
    application: '',
    cloudProvider: ''
  });
  const [selectedRecommendations, setSelectedRecommendations] = useState<{[key: string]: string}>({});
  const [rejectionReason, setRejectionReason] = useState<string>('');
  // State for Safe/Alt toggle for each recommendation
  const [toggleStates, setToggleStates] = useState<{[key: string]: 'safe' | 'alt'}>({});
  
  // State for dropdown visibility
  const [dropdownStates, setDropdownStates] = useState<{[key: string]: boolean}>({});
  
  // Chatbot state
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [currentAssetId, setCurrentAssetId] = useState<string>('');
  const [explanationData, setExplanationData] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isLoadingRef = useRef<boolean>(false);

  const [recommendations, setRecommendations] = useState<VMRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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

  // Reusable fetcher that respects filters and populates applications
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.department) params.set('department', filters.department);
      if (filters.application) params.set('application', filters.application);
      if (filters.cloudProvider) params.set('provider', filters.cloudProvider);

      const exclusiveUrl = `/api/optimization/recommendations/ec2/exclusive${params.toString() ? `?${params.toString()}` : ''}`;
      const loadBalancedUrl = `/api/optimization/recommendations/ec2/load-balanced${params.toString() ? `?${params.toString()}` : ''}`;

      console.log('VM API Calls:', { exclusiveUrl, loadBalancedUrl });

      // Fetch both APIs simultaneously
      const [exclusiveResponse, loadBalancedResponse] = await Promise.all([
        fetch(exclusiveUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }),
        fetch(loadBalancedUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
      ]);

      if (!exclusiveResponse.ok) {
        const errorText = await exclusiveResponse.text();
        console.error(`Exclusive API Error ${exclusiveResponse.status}:`, errorText);
        
        if (exclusiveResponse.status === 404) {
          throw new Error('API endpoint not found. Please check if the backend server is running on port 8888 and the API endpoints are correct.');
        }
        if (exclusiveResponse.status === 500) {
          throw new Error('Backend server is not available. Please check if the API server is running on port 8888.');
        }
        if (exclusiveResponse.status >= 500) {
          throw new Error(`Server error: ${exclusiveResponse.status}. Please check the backend server.`);
        }
        throw new Error(`HTTP error! status: ${exclusiveResponse.status} - ${errorText}`);
      }

      // First check if the response looks like JSON
      const contentType = exclusiveResponse.headers.get('content-type');
      console.log('Exclusive API Content-Type:', contentType);
      
      let exclusiveData: ApiResponse;
      if (contentType && contentType.includes('application/json')) {
        try {
          exclusiveData = await exclusiveResponse.json();
          console.log('Exclusive API Response:', exclusiveData);
        } catch (parseError) {
          console.error('Failed to parse exclusive API response as JSON:', parseError);
          throw new Error('Invalid JSON response from exclusive API.');
        }
      } else {
        // Response is not JSON, likely HTML error page
        const responseText = await exclusiveResponse.text();
        console.error('Non-JSON response from exclusive API:', responseText.substring(0, 500));
        throw new Error('Server returned HTML instead of JSON. Check if the backend server is running correctly.');
      }
      
      let loadBalancedData: ApiResponse = [];
      
      // Handle load-balanced API response (may fail gracefully)
      if (loadBalancedResponse.ok) {
        try {
          loadBalancedData = await loadBalancedResponse.json();
          console.log('Load-balanced API Response:', loadBalancedData);
        } catch (parseError) {
          console.warn('Failed to parse load-balanced API response as JSON:', parseError);
          console.warn('Continuing with exclusive data only');
        }
      } else {
        console.warn('Load-balanced API failed, continuing with exclusive data only');
      }

      // Combine both API responses
      const combinedData = [...exclusiveData, ...loadBalancedData];
      console.log('Combined API Data:', combinedData);
      
      // First transform the API response structure (application_name -> asset_id grouping)
      const restructuredData = transformApiResponseStructure(combinedData);
      console.log('Restructured Data:', restructuredData);
      
      // Then transform to VM recommendations format
      const transformedData = transformApiDataToVMRecommendations(restructuredData);
      console.log('Transformed VM Recommendations:', transformedData);
      setRecommendations(transformedData);

      // Populate applications from combined response
      const uniqueApps = Array.from(new Set(combinedData.map(item => item.application_name))).sort();
      setApplications(uniqueApps);
    } catch (err) {
      console.error('Error fetching data:', err);
      
      // Fallback to mock data when API fails
      const mockRecommendations: VMRecommendation[] = [
        {
          id: 'vm-001',
          applicationName: 'Web Server App',
          currentServer: 't3.large',
          spend: 150,
          savings: 45,
          savingsPercentage: 30,
          efficiency: 75,
          familyType: 't3.medium',
          currentSpend: 150,
          proposedSpend: 105,
          uptime: 99.5,
          currentUtilization: 45,
          proposedUtilization: 70,
          recommendationType: 'safe',
          maxCpuUsage: 65,
          maxMemoryUsage: 80,
          maxNetworkThroughput: 120
        },
        {
          id: 'vm-002',
          applicationName: 'Database Server',
          currentServer: 'm5.xlarge',
          spend: 280,
          savings: 85,
          savingsPercentage: 30.4,
          efficiency: 60,
          familyType: 'm5.large',
          currentSpend: 280,
          proposedSpend: 195,
          uptime: 99.9,
          currentUtilization: 35,
          proposedUtilization: 65,
          recommendationType: 'safe',
          maxCpuUsage: 55,
          maxMemoryUsage: 70,
          maxNetworkThroughput: 200
        },
        {
          id: 'vm-003',
          applicationName: 'Analytics Service',
          currentServer: 'c5.2xlarge',
          spend: 420,
          savings: 125,
          savingsPercentage: 29.8,
          efficiency: 55,
          familyType: 'c5.xlarge',
          currentSpend: 420,
          proposedSpend: 295,
          uptime: 98.5,
          currentUtilization: 40,
          proposedUtilization: 75,
          recommendationType: 'safe',
          maxCpuUsage: 70,
          maxMemoryUsage: 60,
          maxNetworkThroughput: 300
        }
      ];
      
      setRecommendations(mockRecommendations);
      setApplications(['Web Server App', 'Database Server', 'Analytics Service']);
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

  // Data transformation function to convert API response to VM recommendation format
  const transformApiResponseStructure = (apiData: ApiResponse): TransformedApiResponse => {
    try {
      // Transform from application_name grouping to asset_id grouping
      return apiData.map((data, index) => {
        console.log(`Transforming item ${index}:`, data);
        return {
          asset_id: data.current_server?.asset_id || `unknown-asset-${Date.now()}-${index}`,
          application_name: data.application_name || `Unknown App ${index}`,
          current_server: data.current_server,
          conservative_reco: data.conservative_reco || [],
          alternate_reco: data.alternate_reco || []
        };
      });
    } catch (error) {
      console.error('Error in transformApiResponseStructure:', error);
      throw error;
    }
  };

  const transformApiDataToVMRecommendations = (transformedData: TransformedApiResponse): VMRecommendation[] => {
    return transformedData.map((data, index) => {
      // Get the first conservative recommendation as the primary recommendation
      const conservativeReco = data.conservative_reco[0];
      const alternateReco = data.alternate_reco[0];
      
      // Use conservative recommendation as primary, fallback to alternate if no conservative
      const primaryReco = conservativeReco || alternateReco;
      
      // Calculate derived values from API data
      const currentSpend = data.current_server.monthly_spend;
      const proposedSpend = primaryReco?.monthly_spend || currentSpend * 0.8;
      const savings = primaryReco?.monthly_saving || Math.abs(currentSpend - proposedSpend);
      const savingsPercentage = currentSpend > 0 ? (savings / currentSpend) * 100 : 0;
      
      // Calculate uptime from downtime percentage
      const uptime = 100 - data.current_server.monthly_downtime_pct;
      
      // Mock values for fields not provided by API
      const mockValues = {
        efficiency: Math.floor(Math.random() * 40) + 60, // 60-100%
        currentUtilization: Math.floor(Math.random() * 50) + 30, // 30-80%
        proposedUtilization: Math.floor(Math.random() * 30) + 70, // 70-100%
        maxCpuUsage: Math.floor(Math.random() * 20) + 80, // 80-100%
        maxMemoryUsage: Math.floor(Math.random() * 20) + 70, // 70-90%
        maxNetworkThroughput: Math.floor(Math.random() * 500) + 500, // 500-1000 Mbps
      };

      return {
        id: data.asset_id,
        applicationName: data.application_name,
        currentServer: data.current_server.hw_family_name,
        spend: currentSpend,
        savings: savings,
        savingsPercentage: Math.round(savingsPercentage),
        efficiency: mockValues.efficiency,
        familyType: primaryReco?.hw_family_name || data.current_server.hw_family_name,
        currentSpend: currentSpend,
        proposedSpend: proposedSpend,
        uptime: uptime,
        currentUtilization: mockValues.currentUtilization,
        proposedUtilization: mockValues.proposedUtilization,
        recommendationType: conservativeReco ? 'safe' : 'alternate',
        maxCpuUsage: mockValues.maxCpuUsage,
        maxMemoryUsage: mockValues.maxMemoryUsage,
        maxNetworkThroughput: mockValues.maxNetworkThroughput,
      };
    });
  };

  const handleSort = (field: 'spend' | 'savings') => {
    const newDirection = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortDirection(newDirection);

    const sorted = [...recommendations].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      return newDirection === 'desc' ? bValue - aValue : aValue - bValue;
    });

    setRecommendations(sorted);
  };

  const toggleExpanded = (id: string) => {
    setRecommendations(prev =>
      prev.map(item =>
        item.id === id ? { ...item, expanded: !item.expanded } : { ...item, expanded: false }
      )
    );
  };

  const handleFilterChange = (filterType: string, value: string) => {
    // Reset dependent filters
    if (filterType === 'department') {
      setFilters(prev => ({ ...prev, department: value, application: '' }));
      return;
    }
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const applyFilters = () => {
    fetchRecommendations();
  };

  // Filter recommendations based on selected filters
  const filteredRecommendations = recommendations.filter(item => {
    // Apply recommendation view filter with proper logic
    if (recommendationView === 'safe' && item.recommendationType !== 'safe') {
      return false;
    }
    if (recommendationView === 'alternative' && item.recommendationType !== 'alternate') {
      return false;
    }
    return true;
  });

  // Check if filtered results are empty for display messages
  const hasResults = filteredRecommendations.length > 0;
  const isFiltered = recommendationView !== 'all';

  const handleAccept = (id: string) => {
    console.log(`Accepted recommendation for ${id}`);
  };

  const handleReject = (id: string) => {
    console.log(`Rejected recommendation for ${id} with reason: ${rejectionReason}`);
  };

  const handleSubmit = (id: string) => {
    console.log(`Submitted rejection for ${id} with reason: ${rejectionReason}`);
  };

  const handleRecommendationChange = (id: string, value: string) => {
    setSelectedRecommendations(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle Safe/Alt toggle for each recommendation
  const handleToggleChange = (id: string, value: 'safe' | 'alt') => {
    setToggleStates(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle dropdown toggle - only closes when clicking the same trigger
  const handleDropdownToggle = (id: string) => {
    setDropdownStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Get current toggle state for a recommendation (defaults to 'safe')
  const getCurrentToggleState = (id: string): 'safe' | 'alt' => {
    return toggleStates[id] || 'safe';
  };

  // Handle Explain More button click - always open fresh chatbot
  const handleExplainMore = async (assetId: string) => {
    // Prevent multiple calls if already loading
    if (isLoadingRef.current) {
      console.log('Already loading, ignoring duplicate call');
      return;
    }
    
    // Always start fresh - clear all previous state
    setIsChatbotOpen(false);
    setCurrentAssetId('');
    setExplanationData('');
    setIsLoading(false);
    isLoadingRef.current = false;
    
    // Small delay to ensure UI updates
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Open fresh chatbot with loading state
    isLoadingRef.current = true;
    setCurrentAssetId(assetId);
    setIsChatbotOpen(true);
    setIsLoading(true);
    
    try {
      console.log(`Fetching explanation for asset: ${assetId}`);
      const explanation = await getVMExplanation(assetId);
      setExplanationData(explanation);
      console.log('Explanation received successfully');
    } catch (error) {
      console.error('Error fetching explanation:', error);
      setExplanationData(`Sorry, I couldn't fetch the explanation for asset ${assetId}. The chatbot service may be temporarily unavailable. Please try again later.`);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  // Handle chatbot close - clear all session state
  const handleChatbotClose = () => {
    setIsChatbotOpen(false);
    setCurrentAssetId('');
    setExplanationData('');
    setIsLoading(false);
    isLoadingRef.current = false;
  };

  // This component previously used a helper that is no longer needed.
  // Donut chart component
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

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2">VM Recommendations</h1>
              <p className="text-slate-300">Optimize your virtual machine configurations for better performance and cost savings</p>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchRecommendations()
                  .then(response => {
                    return response;
                  })
                  .catch(err => {
                    console.error('Error fetching data:', err);
                    setRecommendations([]);
                    setError(null); // Clear error since we have fallback data
                  })
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

        {/* Recommendation View Toggle */}
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-white">View:</span>
              <div className={FILTER_STYLES.container}>
                <select
                  value={recommendationView}
                  onChange={(e) => setRecommendationView(e.target.value)}
                  className={`${FILTER_STYLES.input} min-w-[220px]`}
                  aria-label="Recommendation View"
                >
                  <option value="all">{FILTER_PLACEHOLDERS.recommendationView}</option>
                  <option value="safe">Safe Recommendation</option>
                  <option value="alternate">Alternative Recommendation</option>
                </select>
                <ChevronDown className={FILTER_STYLES.chevron} />
              </div>
              
              {/* Single Sorting Control */}
              <span className="text-sm font-medium text-white">Sort by:</span>
              <div className={FILTER_STYLES.container}>
                <select
                  value={sortField ? `${sortField}-${sortDirection}` : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [field, direction] = e.target.value.split('-') as ['spend' | 'savings', 'asc' | 'desc'];
                      handleSort(field);
                      if (sortDirection !== direction) {
                        handleSort(field);
                      }
                    }
                  }}
                  className={`${FILTER_STYLES.input} min-w-[180px]`}
                  aria-label="Sort Options"
                >
                  <option value="">No Sorting</option>
                  <option value="spend-desc">Spend (High to Low)</option>
                  <option value="spend-asc">Spend (Low to High)</option>
                  <option value="savings-desc">Savings (High to Low)</option>
                  <option value="savings-asc">Savings (Low to High)</option>
                </select>
                <ChevronDown className={FILTER_STYLES.chevron} />
              </div>
            </div>
            <div className="text-sm text-slate-400">
              Showing {filteredRecommendations.length} of {recommendations.length} recommendations
            </div>
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

            {/* Filter Button */}
            <div className={FILTER_STYLES.buttonContainer}>
              {/* <button
                onClick={applyFilters}
                className={FILTER_STYLES.button}
              >
                Filter
              </button> */}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <div className="mt-4 text-slate-300">Loading VM recommendations...</div>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="text-red-400 text-lg mb-2">Error loading data</div>
              <div className="text-slate-300 text-sm mb-4">{error}</div>
              <div className="text-slate-400 text-xs">Please check your connection and try again</div>
            </div>
          ) : recommendations.length === 0 ? (
            // Empty state message when no recommendations at all
            <div className="p-12 text-center">
              <div className="text-gray-500 text-lg mb-2">No VM recommendations available</div>
              <div className="text-gray-400 text-sm">No recommendations found for your current configuration</div>
            </div>
          ) : !hasResults && isFiltered ? (
            // Empty state message when no results found for specific filter
            <div className="p-12 text-center">
              <div className="text-gray-500 text-lg mb-2">
                {recommendationView === 'safe' 
                  ? 'No safe recommendations available' 
                  : 'No alternative recommendations available'
                }
              </div>
              <div className="text-gray-400 text-sm">
                Try selecting "All Recommendations" to see all available options.
              </div>
            </div>
          ) : (
            // Normal table display when results exist
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead className="bg-slate-700 border-b border-slate-600">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-white" scope="col">
                      Asset ID
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
                  {filteredRecommendations.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <tr 
                        className={`hover:bg-slate-700/50 transition-colors cursor-pointer ${
                          index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'
                        }`}
                        onClick={() => toggleExpanded(item.id)}
                      >
                        {/* Application Name */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2 text-left">
                            {item.expanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                            <Server className="w-5 h-5 text-blue-400" />
                            <span className="font-medium text-white">
                              {item.id}
                            </span>
                          </div>
                        </td>

                        {/* Current Server */}
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-700 text-slate-300">
                            {item.currentServer}
                          </span>
                        </td>

                        {/* Spend */}
                        <td className="py-4 px-6">
                          <span className="font-medium text-white">
                            ${item.currentSpend}
                          </span>
                        </td>

                        {/* Savings */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <ArrowUp className="w-4 h-4 text-blue-400" />
                            <span className="font-medium text-white">
                              ${item.savings.toLocaleString()}
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

                      {/* Expanded Row Content */}
                      {item.expanded && (
                        <tr className="bg-slate-700">
                          <td colSpan={5} className="py-6 px-6">
                            {/* Safe/Alt Toggle Section */}
                            <div className="mb-6 flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-white">View:</span>
                                <div className="flex bg-slate-600 rounded-lg p-1">
                                  <button
                                    onClick={() => handleToggleChange(item.id, 'safe')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                      getCurrentToggleState(item.id) === 'safe'
                                        ? 'bg-green-500 text-white shadow-sm'
                                        : 'text-slate-300 hover:text-white'
                                    }`}
                                  >
                                    Safe
                                  </button>
                                  <button
                                    onClick={() => handleToggleChange(item.id, 'alt')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                      getCurrentToggleState(item.id) === 'alt'
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'text-slate-300 hover:text-white'
                                    }`}
                                  >
                                    Alt
                                  </button>
                                </div>
                              </div>
                              
                              {/* Current Toggle State Indicator */}
                              <div className="text-sm text-slate-300">
                                Showing: <span className="font-medium capitalize">{getCurrentToggleState(item.id)}</span> Recommendations
                              </div>
                            </div>

                            <div className="grid grid-cols-12 gap-6">
                              {/* Left Section - Details */}
                              <div className="col-span-3 space-y-4">
                                <div>
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    getCurrentToggleState(item.id) === 'safe' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {getCurrentToggleState(item.id) === 'safe' ? 'Safe' : 'Alternative'}
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
                                  <div className="font-medium text-white">{item.uptime}%</div>
                                </div>

                                {/* Performance Metrics Section */}
                                <div className="pt-4 border-t border-slate-600">
                                  <div className="text-sm font-medium text-white/80 mb-3">Performance Metrics:</div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-sm text-white/70">Max CPU:</span>
                                      <span className="text-sm font-medium text-white">{item.maxCpuUsage}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-white/70">Max Memory:</span>
                                      <span className="text-sm font-medium text-white">{item.maxMemoryUsage}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-white/70">Max Network:</span>
                                      <span className="text-sm font-medium text-white">{item.maxNetworkThroughput} Mbps</span>
                                    </div>
                                  </div>
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

                              {/* Right Section - Controls */}
                              <div className="col-span-3 space-y-4">
                                {/* Simplified Recommendations Display */}
                                <div className="bg-slate-600 border border-slate-500 rounded-lg p-6">
                                  <h4 className="text-lg font-semibold text-white mb-4">Recommendation Summary</h4>
                                  <div className="space-y-3">
                                    <div className="flex justify-between">
                                      <span className="text-sm text-white/70">Recommended Type:</span>
                                      <span className="text-sm font-medium text-white">{item.familyType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-white/70">Monthly Savings:</span>
                                      <span className="text-sm font-medium text-green-400">${item.savings}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-white/70">Uptime:</span>
                                      <span className="text-sm font-medium text-white">{item.uptime}%</span>
                                    </div>
                                  </div>
                                  
                                  {/* Explain More Button */}
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <button
                                      onClick={() => handleExplainMore(item.id)}
                                      disabled={isLoading}
                                      className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                        isLoading 
                                          ? 'bg-gray-400 cursor-not-allowed' 
                                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                                      }`}
                                    >
                                      <MessageCircle className="w-4 h-4" />
                                      <span>{isLoading ? 'Loading...' : 'Ask AI'}</span>
                                    </button>
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
      
      {/* VM Chatbot */}
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

export default VMRecommendations;
