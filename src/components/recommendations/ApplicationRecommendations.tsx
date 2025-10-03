import React, { useState, useEffect } from 'react';
import { ChevronDown, Server, Database, HardDrive, Eye, CheckCircle } from 'lucide-react';
import { fetchAllFilterOptions, Department, CloudProvider } from '../../services/filterService';
import { FILTER_STYLES, FILTER_PLACEHOLDERS } from '../../styles/filterStyles';

// API Response Interfaces
interface ApiRecommendation {
  reco_type: 'vm' | 'db' | 'storage' | 'iops' | null;
  new_hw_family_name?: string | null;
  recommended_storage_type?: string | null;
  recommended_family?: string | null;
  reco_iops?: string | null;
  projected_monthly_cost: number | null;
  projected_monthly_saving: number | null;
}

interface ApiProfile {
  profile: string | null;
  recommendations: {
    safe: ApiRecommendation;
    alternative: ApiRecommendation;
  };
}
interface ApiAsset {
  account_id : string;
  asset_id: string;
  application_name: string | null;
  hw_family_name: string;
  dept_id: number;
  dept_name: string;
  cloud_service_name: string;
  provider_name: string;
  service_type: string;
  profiles: ApiProfile[];
}

interface ApiResponse {
  assigned: ApiAsset[];
  unassigned: ApiAsset[];
}

// Transformed data structure
interface Application {
  id: string;
  name: string;
  account: string;
  provider: 'aws' | 'azure' | 'gcp';
  department: string;
  resources: {
    vm: { count: number; idle: number; active: number; assets: ApiAsset[] };
    db: { count: number; idle: number; unattached: number; assets: ApiAsset[] };
    storage: { count: number; attached: number; unattached: number; assets: ApiAsset[] };
  };
  totalSavings: number;
  totalSpend: number;
}

interface UnassignedAssets {
  id: string;
  name: string;
  account: string;
  provider: 'aws' | 'azure' | 'gcp' | 'mixed';
  department: string;
  resources: {
    vm: { count: number; idle: number; active: number; assets: ApiAsset[] };
    db: { count: number; idle: number; unattached: number; assets: ApiAsset[] };
    storage: { count: number; attached: number; unattached: number; assets: ApiAsset[] };
  };
  totalSavings: number;
  totalSpend: number;
}

// Helper function to categorize assets by type
const categorizeAsset = (asset: ApiAsset): 'vm' | 'db' | 'storage' => {
  const serviceType = asset.cloud_service_name.toLowerCase();
  if (serviceType.includes('ec2') || serviceType.includes('compute') || serviceType.includes('virtualmachine')) {
    return 'vm';
  } else if (serviceType.includes('rds') || serviceType.includes('sql') || serviceType.includes('database')) {
    return 'db';
  } else {
    return 'storage';
  }
};


interface ApplicationRecommendationsProps {
  onViewRecommendations?: (applicationId: string) => void;
  onManageAssets?: () => void;
}

const ApplicationRecommendations: React.FC<ApplicationRecommendationsProps> = ({ onViewRecommendations, onManageAssets }) => {
  const [filters, setFilters] = useState({
    department: '',
    application: '',
    cloudProvider: '',
    cloudAccountType: '',
    assetStatus: 'all' // 'all', 'assigned', 'unassigned'
  });
  const [applicationsData, setApplicationsData] = useState<Application[]>([]);
  const [unassignedAssetsData, setUnassignedAssetsData] = useState<UnassignedAssets[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [showUnassigned, setShowUnassigned] = useState(true);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<string[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>([]);

  // Extract unique cloud account numbers for filtering
  const cloudAccountTypes = Array.from(new Set(applicationsData.map(app => app.account))).sort();

  // Calculate total unassigned assets
  const totalUnassignedAssets = unassignedAssetsData.reduce((total, assets) => 
    total + assets.resources.vm.count + assets.resources.db.count + assets.resources.storage.count, 0
  );

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

  // Extract application names from API response data
  const extractApplicationOptions = (apiData: ApiResponse) => {
    // Extract unique application names
    const allApps = apiData.assigned.map(item => item.application_name).filter(Boolean) as string[];
    const uniqueApps = Array.from(new Set(allApps)).sort();
    setApplications(uniqueApps);
  };

  // API Integration
  const fetchRecommendations = async (extractFilters = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.department) params.set('department', filters.department);
      if (filters.application) params.set('application', filters.application);
      if (filters.cloudProvider) params.set('c_provider', filters.cloudProvider);

      const url = `/api/optimization/recommendations/applications${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        
        if (response.status === 500) {
          throw new Error('Backend server is not available. Please check if the API server is running on port 8888.');
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const apiData: ApiResponse = await response.json();
      
      console.log('ApplicationRecommendations - API Response:', apiData);
      console.log('ApplicationRecommendations - Assigned assets:', apiData.assigned);
      console.log('ApplicationRecommendations - Unassigned assets:', apiData.unassigned);
      
      // Only extract filter options on initial load or when explicitly requested
      if (extractFilters) {
        extractApplicationOptions(apiData);
      }
      
      // Transform API data to application format
      const transformedApplications = transformApiDataToApplications(apiData.assigned);
      const transformedUnassigned = transformApiDataToUnassignedAssets(apiData.unassigned);
      
      console.log('ApplicationRecommendations - Transformed applications:', transformedApplications);
      console.log('ApplicationRecommendations - Transformed unassigned:', transformedUnassigned);
      
      setApplicationsData(transformedApplications);
      setUnassignedAssetsData(transformedUnassigned);
      setFilteredApplications(transformedApplications);

    } catch (err) {
      console.error('Error fetching data:', err);
      setApplicationsData([]);
      setUnassignedAssetsData([]);
      setError(null); // Clear error since we have fallback data
    } finally {
      setLoading(false);
    }
  };

  // Transform API data to Application format
  const transformApiDataToApplications = (assignedAssets: ApiAsset[]): Application[] => {
    const applicationMap = new Map<string, Application>();

    assignedAssets.forEach(asset => {
      if (!asset.application_name) return;

      const appId = asset.application_name;
      const assetType = categorizeAsset(asset);
      
      if (!applicationMap.has(appId)) {
        applicationMap.set(appId, {
          id: appId,
          name: asset.application_name,
          account: asset.account_id, // Using provider as account for now
          provider: asset.provider_name.toLowerCase() as 'aws' | 'azure' | 'gcp',
          department: asset.dept_name,
          resources: {
            vm: { count: 0, idle: 0, active: 0, assets: [] },
            db: { count: 0, idle: 0, unattached: 0, assets: [] },
            storage: { count: 0, attached: 0, unattached: 0, assets: [] }
          },
          totalSavings: 0,
          totalSpend: 0
        });
      }

      const app = applicationMap.get(appId)!;
      app.resources[assetType].assets.push(asset);
      app.resources[assetType].count++;
      
      // Calculate savings and spend from profiles
      const allRecommendations = asset.profiles.flatMap(profile => [
        profile.recommendations.safe,
        profile.recommendations.alternative
      ]).filter(reco => reco.projected_monthly_saving !== null || reco.projected_monthly_cost !== null);
      
      const totalSavings = allRecommendations.reduce((sum, reco) => sum + (reco.projected_monthly_saving || 0), 0);
      const totalSpend = allRecommendations.reduce((sum, reco) => sum + (reco.projected_monthly_cost || 0), 0);
      app.totalSavings += totalSavings;
      app.totalSpend += totalSpend;

      // Determine status (simplified logic)
      if (assetType === 'vm' || assetType === 'db') {
        app.resources[assetType].idle += totalSavings > 0 ? 1 : 0;
        if (assetType === 'vm') {
          app.resources[assetType].active += totalSavings === 0 ? 1 : 0;
        } else {
          app.resources[assetType].unattached += totalSavings === 0 ? 1 : 0;
        }
      } else {
        app.resources[assetType].attached += totalSavings > 0 ? 1 : 0;
        app.resources[assetType].unattached += totalSavings === 0 ? 1 : 0;
      }
    });

    return Array.from(applicationMap.values());
  };

  // Transform API data to UnassignedAssets format - Single consolidated box
  const transformApiDataToUnassignedAssets = (unassignedAssets: ApiAsset[]): UnassignedAssets[] => {
    if (unassignedAssets.length === 0) return [];

    // Create a single consolidated unassigned assets group
    const consolidatedUnassigned: UnassignedAssets = {
      id: 'unassigned-consolidated',
      name: 'Unassigned Assets',
      account: 'Multiple',
      provider: 'mixed' as 'aws' | 'azure' | 'gcp',
      department: 'All Departments',
      resources: {
        vm: { count: 0, idle: 0, active: 0, assets: [] },
        db: { count: 0, idle: 0, unattached: 0, assets: [] },
        storage: { count: 0, attached: 0, unattached: 0, assets: [] }
      },
      totalSavings: 0,
      totalSpend: 0
    };

    unassignedAssets.forEach(asset => {
      const assetType = categorizeAsset(asset);
      
      consolidatedUnassigned.resources[assetType].assets.push(asset);
      consolidatedUnassigned.resources[assetType].count++;
      
      // Calculate savings and spend from profiles
      const allRecommendations = asset.profiles.flatMap(profile => [
        profile.recommendations.safe,
        profile.recommendations.alternative
      ]).filter(reco => reco.projected_monthly_saving !== null || reco.projected_monthly_cost !== null);
      
      const totalSavings = allRecommendations.reduce((sum, reco) => sum + (reco.projected_monthly_saving || 0), 0);
      const totalSpend = allRecommendations.reduce((sum, reco) => sum + (reco.projected_monthly_cost || 0), 0);
      consolidatedUnassigned.totalSavings += totalSavings;
      consolidatedUnassigned.totalSpend += totalSpend;

      // Determine status (simplified logic)
      if (assetType === 'vm' || assetType === 'db') {
        consolidatedUnassigned.resources[assetType].idle += totalSavings > 0 ? 1 : 0;
        if (assetType === 'vm') {
          consolidatedUnassigned.resources[assetType].active += totalSavings === 0 ? 1 : 0;
        } else {
          consolidatedUnassigned.resources[assetType].unattached += totalSavings === 0 ? 1 : 0;
        }
      } else {
        consolidatedUnassigned.resources[assetType].attached += totalSavings > 0 ? 1 : 0;
        consolidatedUnassigned.resources[assetType].unattached += totalSavings === 0 ? 1 : 0;
      }
    });

    return [consolidatedUnassigned];
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleViewRecommendations = (applicationId: string) => {
    if (onViewRecommendations) {
      onViewRecommendations(applicationId);
    }
  };

  const handleManageAssets = () => {
    if (onManageAssets) {
      onManageAssets();
    }
  };

  const handleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  // Initial load - fetch data and extract filter options
  useEffect(() => {
    loadFilterOptions();
    fetchRecommendations(true); // Extract application options on initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch data when filters change (but don't re-extract filter options)
  useEffect(() => {
    if (departments.length > 0 || applications.length > 0 || cloudProviders.length > 0) {
      fetchRecommendations(false); // Don't extract filters on filter changes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.department, filters.application, filters.cloudProvider]);

  // Apply filters to applications
  useEffect(() => {
    let filtered = applicationsData;

    // Filter by asset status
    if (filters.assetStatus === 'assigned') {
      setShowUnassigned(false);
    } else if (filters.assetStatus === 'unassigned') {
      filtered = [];
      setShowUnassigned(true);
    } else {
      setShowUnassigned(true);
    }

    if (filters.department) {
      const selectedDept = departments.find(d => d.id.toString() === filters.department);
      if (selectedDept) {
        filtered = filtered.filter(app => app.department === selectedDept.name);
      }
    }

    if (filters.application) {
      filtered = filtered.filter(app => app.name === filters.application);
    }

    if (filters.cloudProvider) {
      filtered = filtered.filter(app => app.provider === filters.cloudProvider);
    }

    if (filters.cloudAccountType) {
      filtered = filtered.filter(app => app.account === filters.cloudAccountType);
    }

    setFilteredApplications(filtered);
  }, [filters, applicationsData, departments]);

  const ResourceIcon: React.FC<{ 
    type: 'vm' | 'db' | 'storage'; 
    count: number; 
    status: string; 
    isUnassigned?: boolean;
    assetId?: string;
    onSelect?: (assetId: string) => void;
    assets?: ApiAsset[];
    showRecommendations?: boolean;
    onClick?: (asset: ApiAsset) => void;
  }> = ({ type, count, status, isUnassigned = false, assetId, onSelect, assets = [], showRecommendations = false, onClick }) => {
    const getIcon = () => {
      switch (type) {
        case 'vm':
          return <Server className="w-5 h-5" />;
        case 'db':
          return <Database className="w-5 h-5" />;
        case 'storage':
          return <HardDrive className="w-5 h-5" />;
        default:
          return null;
      }
    };

    const getLabel = () => {
      switch (type) {
        case 'vm':
          return 'VM';
        case 'db':
          return 'DB';
        case 'storage':
          return 'Storage';
        default:
          return '';
      }
    };

    // Get recommendations for this resource type from profiles
    const recommendations = assets.flatMap(asset => 
      asset.profiles.flatMap(profile => [
        profile.recommendations.safe,
        profile.recommendations.alternative
      ])
    ).filter(reco => {
      if (type === 'vm' || type === 'db') {
        return reco.reco_type === type;
      } else if (type === 'storage') {
        return reco.reco_type === 'storage' || reco.reco_type === 'iops';
      }
      return false;
    });

    const hasRecommendations = recommendations.length > 0;
    const totalSavings = recommendations.reduce((sum, reco) => sum + (reco.projected_monthly_saving || 0), 0);

    const handleIconClick = () => {
      if (onClick && assets.length > 0) {
        // Find the first asset of this type
        const assetOfType = assets.find(asset => categorizeAsset(asset) === type) || assets[0];
        onClick(assetOfType);
      }
    };

    return (
      <div className={`flex flex-col items-center space-y-1 ${isUnassigned ? 'relative' : ''}`}>
        {isUnassigned && assetId && onSelect && (
          <input
            type="checkbox"
            className="absolute -top-2 -right-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            checked={selectedAssets.includes(assetId)}
            onChange={() => onSelect(assetId)}
          />
        )}
        <div 
          className={`flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
            isUnassigned 
              ? 'flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-600' 
              : hasRecommendations 
                ? 'bg-green-100 text-green-600' 
                : 'bg-blue-100 text-blue-600'
          }`}
          onClick={handleIconClick}
        >
          {getIcon()}
        </div>
        <div className="text-center flex flex-col gap-1">
          <div className="text-sm font-medium text-white">{getLabel()}</div>
          <div className="text-xs text-white/100">{count} total</div>
          <div className={`text-xs ${isUnassigned ? 'text-red-500 font-medium' : 'text-white/60'}`}>
            {status}
          </div>
          {showRecommendations && hasRecommendations && (
            <div className="text-xs text-green-400 font-medium mt-1">
              ${totalSavings.toFixed(0)} savings
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">Application Recommendations</h1>
              <p className="text-lg text-slate-300 mt-2">Cloud optimization insights and resource management</p>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchRecommendations(true) // Extract filters when manually refreshing
                  .then(response => {
                    return response;
                  })
                  .catch(err => {
                    console.error('Error fetching data:', err);
                    setApplicationsData([]);
                    setUnassignedAssetsData([]);
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
        </header>

        {/* Loading State */}
        {loading ? (
          <div className="bg-slate-800 p-12 rounded-xl shadow-2xl border border-slate-700 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <div className="mt-4 text-slate-300">Loading application recommendations...</div>
          </div>
        ) : error ? (
          <div className="bg-slate-800 p-12 rounded-xl shadow-2xl border border-slate-700 text-center">
            <div className="text-red-400 text-lg mb-2">Error loading data</div>
            <div className="text-slate-300 text-sm mb-4">{error}</div>
            <div className="text-slate-400 text-xs">Please check your connection and try again</div>
          </div>
        ) : (
          <>
            {/* Filters Section */}
            <div className={FILTER_STYLES.section}>
              <div className={FILTER_STYLES.sectionHeader}>
                <div className={FILTER_STYLES.count}>
                  Showing {filteredApplications.length} of {applicationsData.length} applications
                </div>
              </div>
          
          <div className="flex items-center justify-between">
            <div className={FILTER_STYLES.wrapper}>
            <div className={FILTER_STYLES.container}>
              <select 
                name="assetStatus"
                value={filters.assetStatus}
                onChange={handleFilterChange}
                className={FILTER_STYLES.input}
                aria-label="Asset Status"
              >
                <option value="all">All Assets</option>
                <option value="assigned">Assigned Only</option>
                <option value="unassigned">Unassigned Only</option>
              </select>
              <ChevronDown className={FILTER_STYLES.chevron} />
            </div>

            <div className={FILTER_STYLES.container}>
              <select 
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className={FILTER_STYLES.input}
                aria-label="Department"
              >
                <option value="">{FILTER_PLACEHOLDERS.department}</option>
                {departments.map(dep => (
                  <option key={dep.id} value={dep.id.toString()}>{dep.name}</option>
                ))}
              </select>
              <ChevronDown className={FILTER_STYLES.chevron} />
            </div>

            <div className={FILTER_STYLES.container}>
              <select 
                name="application"
                value={filters.application}
                onChange={handleFilterChange}
                className={FILTER_STYLES.input}
                aria-label="Application Name"
              >
                <option value="">{FILTER_PLACEHOLDERS.application}</option>
                {applications.map(app => (
                  <option key={app} value={app}>{app}</option>
                ))}
              </select>
              <ChevronDown className={FILTER_STYLES.chevron} />
            </div>

            <div className={FILTER_STYLES.container}>
              <select 
                name="cloudProvider"
                value={filters.cloudProvider}
                onChange={handleFilterChange}
                className={FILTER_STYLES.input}
                aria-label="Cloud Provider"
              >
                <option value="">{FILTER_PLACEHOLDERS.cloudProvider}</option>
                {cloudProviders.map(provider => (
                  <option key={provider.name} value={provider.name}>
                    {provider.description || provider.name.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className={FILTER_STYLES.chevron} />
            </div>

            <div className={FILTER_STYLES.container}>
              <select 
                name="cloudAccountType"
                value={filters.cloudAccountType}
                onChange={handleFilterChange}
                className={FILTER_STYLES.input}
                aria-label="Cloud Account Type"
              >
                <option value="">{FILTER_PLACEHOLDERS.cloudAccount}</option>
                {cloudAccountTypes.map(account => (
                  <option key={account} value={account}>Account {account}</option>
                ))}
              </select>
              <ChevronDown className={FILTER_STYLES.chevron} />
            </div>
            </div>
            
            {/* Filter Button */}
            <div className={FILTER_STYLES.buttonContainer}>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {filters.assetStatus !== 'unassigned' && (
          <div className="space-y-6">
            {filteredApplications.length === 0 && filters.assetStatus !== 'unassigned' ? (
              <div className="bg-slate-800 p-12 rounded-xl shadow-2xl border border-slate-700 text-center">
                <div className="text-slate-400 text-lg mb-2">No assigned applications found</div>
                <div className="text-slate-500 text-sm">Try adjusting your filters to see more results</div>
              </div>
            ) : (
              <>
                {filteredApplications.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-white mb-2">Assigned Applications</h2>
                    <p className="text-slate-300">Applications with properly assigned assets</p>
                  </div>
                )}
                {filteredApplications.map((app) => (
                  <div key={app.id} className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{app.name}</h3>
                        <p className="text-slate-300">Cloud Account No: {app.account}</p>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-700 text-slate-300">
                            {app.provider.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleViewRecommendations(app.id)}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Recommendations</span>
                      </button>
                    </div>

                    {/* Resource Type Symbols */}
                    <div className="border-t border-slate-700 pt-6">
                      <h4 className="text-sm font-medium text-white mb-4">Resource Overview</h4>
                      <div className="flex items-center justify-around">
                        <ResourceIcon 
                          type="vm" 
                          count={app.resources.vm.count}
                          status={`${app.resources.vm.idle} idle, ${app.resources.vm.active} active`}
                          assets={app.resources.vm.assets}
                          showRecommendations={true}
                        />
                        <ResourceIcon 
                          type="db" 
                          count={app.resources.db.count}
                          status={`${app.resources.db.idle} idle, ${app.resources.db.unattached} unattached`}
                          assets={app.resources.db.assets}
                          showRecommendations={true}
                        />
                        <ResourceIcon 
                          type="storage" 
                          count={app.resources.storage.count}
                          status={`${app.resources.storage.unattached} unattached, ${app.resources.storage.attached} attached`}
                          assets={app.resources.storage.assets}
                          showRecommendations={true}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

            {/* Unassigned Assets Section - Moved to Bottom */}
            {showUnassigned && filters.assetStatus !== 'assigned' && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">!</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Unassigned Assets</h2>
                      <p className="text-sm text-slate-300">
                        {totalUnassignedAssets} assets not assigned to any application
                      </p>
                    </div>
                  </div>
                  {selectedAssets.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-slate-300">
                        {selectedAssets.length} selected
                      </span>
                      <button
                        onClick={handleManageAssets}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors text-sm"
                      >
                        Assign to Application
                      </button>
                    </div>
                  )}
                </div>

                {/* Single Consolidated Unassigned Assets Box */}
                {unassignedAssetsData.length > 0 && (
                  <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1 flex items-center space-x-2">
                          <span>{unassignedAssetsData[0].name}</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Needs Assignment
                          </span>
                        </h3>
                        <p className="text-slate-300">Multiple Cloud Accounts</p>
                        <div className="mt-2 flex items-center space-x-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-700 text-slate-300">
                            Mixed Providers
                          </span>
                          <span className="text-sm text-red-400 font-medium">
                            {totalUnassignedAssets} total assets
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={handleManageAssets}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Manage Assets</span>
                      </button>
                    </div>

                    {/* Resource Type Symbols for Unassigned Assets */}
                    <div className="border-t border-slate-700 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-white">Unassigned Resource Overview</h4>
                        <div className="text-xs text-slate-400">
                          Select individual assets to assign to applications
                        </div>
                      </div>
                      <div className="flex items-center justify-around">
                        <ResourceIcon 
                          type="vm" 
                          count={unassignedAssetsData[0].resources.vm.count}
                          status={`${unassignedAssetsData[0].resources.vm.idle} idle, ${unassignedAssetsData[0].resources.vm.active} orphaned`}
                          isUnassigned={true}
                          assetId={`${unassignedAssetsData[0].id}-vm`}
                          onSelect={handleAssetSelection}
                          assets={unassignedAssetsData[0].resources.vm.assets}
                          showRecommendations={true}
                        />
                        <ResourceIcon 
                          type="db" 
                          count={unassignedAssetsData[0].resources.db.count}
                          status={`${unassignedAssetsData[0].resources.db.idle} idle, ${unassignedAssetsData[0].resources.db.unattached} unattached`}
                          isUnassigned={true}
                          assetId={`${unassignedAssetsData[0].id}-db`}
                          onSelect={handleAssetSelection}
                          assets={unassignedAssetsData[0].resources.db.assets}
                          showRecommendations={true}
                        />
                        <ResourceIcon 
                          type="storage" 
                          count={unassignedAssetsData[0].resources.storage.count}
                          status={`${unassignedAssetsData[0].resources.storage.unattached} unattached, ${unassignedAssetsData[0].resources.storage.attached} orphaned`}
                          isUnassigned={true}
                          assetId={`${unassignedAssetsData[0].id}-storage`}
                          onSelect={handleAssetSelection}
                          assets={unassignedAssetsData[0].resources.storage.assets}
                          showRecommendations={true}
                        />
                      </div>
                    </div>
                  </div>
                )}
          </div>
        )}

                {/* Empty State for Unassigned Only View */}
                {filters.assetStatus === 'unassigned' && unassignedAssetsData.length === 0 && (
                  <div className="bg-slate-800 p-12 rounded-xl shadow-2xl border border-slate-700 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-slate-300 text-lg mb-2">All assets are properly assigned!</div>
                    <div className="text-slate-400 text-sm">
                      Great job! All your cloud resources are organized under applications.
                    </div>
                  </div>
                )}

                {/* Summary Statistics */}
                {filters.assetStatus === 'all' && (
                  <div className="mt-8 bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Asset Management Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">
                          {filteredApplications.length}
                        </div>
                        <div className="text-sm text-slate-300">Assigned Applications</div>
                      </div>
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-orange-400">
                          {totalUnassignedAssets}
                        </div>
                        <div className="text-sm text-slate-300">Unassigned Assets</div>
                      </div>
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">
                          {Math.round((filteredApplications.length / (filteredApplications.length + (totalUnassignedAssets > 0 ? 1 : 0))) * 100)}%
                        </div>
                        <div className="text-sm text-slate-300">Organization Rate</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
      </div>
    </div>
  );
};

export default ApplicationRecommendations;
