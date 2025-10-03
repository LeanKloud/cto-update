import React, { useState, useEffect } from 'react';
import { ArrowLeft, Server, Database, HardDrive } from 'lucide-react';
import DetailedAssetModal from './DetailedAssetModal';

// Backend API Response Interfaces
interface ApiRecommendation {
  reco_type: "vm" | "db" | "storage" | "iops" | null;
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

interface ResourceDetail {
  id: string;
  name: string;
  status: 'idle' | 'active' | 'unattached' | 'attached' | 'warning';
  utilization?: number;
  cost: number;
  recommendations?: string[];
  hw_family: string;
  provider: string;
  service_type: string;
  monthly_savings: number;
}

interface ApplicationDetailData {
  id: string;
  name: string;
  account: string;
  provider: string;
  department: string;
  vms: ResourceDetail[];
  databases: ResourceDetail[];
  storage: ResourceDetail[];
  totalSavings: number;
  totalCost: number;
}

interface ApplicationRecommendationsDetailProps {
  applicationId?: string | null;
  onBack?: () => void;
}

// Categorize asset type based on service type
const categorizeAssetType = (serviceType: string): 'vm' | 'db' | 'storage' => {
  const type = serviceType.toLowerCase();
  
  // VM/Compute categorization - comprehensive list
  if (type.includes('vm') || 
      type.includes('compute') || 
      type.includes('virtualmachine') ||
      type.includes('virtual machine') ||
      type.includes('ec2') ||
      type.includes('instance') ||
      type.includes('server') ||
      type.includes('machine')) {
    return 'vm';
  }
  
  // Database categorization - comprehensive list
  if (type.includes('db') || 
      type.includes('database') || 
      type.includes('sql') ||
      type.includes('mysql') ||
      type.includes('postgres') ||
      type.includes('oracle') ||
      type.includes('mongodb') ||
      type.includes('redis') ||
      type.includes('rds') ||
      type.includes('cosmos') ||
      type.includes('dynamodb')) {
    return 'db';
  }
  
  // Storage categorization (default for anything else)
  return 'storage';
};

const ApplicationRecommendationsDetail: React.FC<ApplicationRecommendationsDetailProps> = ({ applicationId, onBack }) => {
  const [applicationData, setApplicationData] = useState<ApplicationDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vms' | 'databases' | 'storage'>('vms');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    resourceType: 'vm' | 'db' | 'storage';
    resourceName: string;
    resourceId: string;
    assetData?: ApiAsset;
  }>({
    isOpen: false,
    resourceType: 'vm',
    resourceName: '',
    resourceId: ''
  });
  
  const [acceptanceStates, setAcceptanceStates] = useState<Record<string, 'safe' | 'alternate' | null>>({});

  // API Integration
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  // Transform API data
  const transformApiDataToApplicationDetail = (assignedAssets: ApiAsset[], appName: string): ApplicationDetailData => {
    const appAssets = assignedAssets.filter(asset => asset.application_name === appName);
    
    if (appAssets.length === 0) {
      return {
        id: appName,
        name: appName,
        account: 'Unknown',
        provider: 'Unknown',
        department: 'Unknown',
        vms: [],
        databases: [],
        storage: [],
        totalSavings: 0,
        totalCost: 0
      };
    }

    // Use first asset for application-level details
    const firstAsset = appAssets[0];

     // Calculate total savings and costs with profiles format
     const calculateAssetMetrics = (profiles: ApiProfile[] | undefined) => {
       let totalSavings = 0;
       let totalSpend = 0;
       
       if (!profiles || !Array.isArray(profiles)) {
         return { totalSavings: 0, totalSpend: 0 };
       }
       
       profiles.forEach(profile => {
         if (profile.recommendations) {
           // Use the better recommendation (safe vs alternative)
           const safeReco = profile.recommendations.safe;
           const altReco = profile.recommendations.alternative;
           
           // Use safe recommendation as primary, fallback to alternative
           const primaryReco = safeReco || altReco;
           
           if (primaryReco) {
             totalSavings += primaryReco.projected_monthly_saving || 0;
             totalSpend += primaryReco.projected_monthly_cost || 0;
           }
         }
       });
       
       return { totalSavings, totalSpend };
     };

    const totalSavings = appAssets.reduce((sum, asset) => {
      const { totalSavings: assetSavings } = calculateAssetMetrics(asset.profiles);
      return sum + assetSavings;
    }, 0);

    const totalCost = appAssets.reduce((sum, asset) => {
      const { totalSavings: assetSavings, totalSpend: assetSpend } = calculateAssetMetrics(asset.profiles);
      return sum + assetSpend + assetSavings;
    }, 0);

    // Group and process assets
    const resources = appAssets.map(asset => {
      const { totalSavings: assetSavings, totalSpend: assetSpend } = calculateAssetMetrics(asset.profiles);
      
      return {
        id: asset.asset_id,
        name: asset.cloud_service_name,
        status: 'active' as const,
        cost: assetSpend + assetSavings,
        hw_family: asset.hw_family_name,
        provider: asset.provider_name,
        service_type: asset.service_type,
        monthly_savings: assetSavings,
        recommendations: (asset.profiles || []).map(profile => {
          const safeReco = profile.recommendations?.safe;
          const altReco = profile.recommendations?.alternative;
          const primaryReco = safeReco || altReco;
          
          if (!primaryReco) return 'No recommendation';
          
          switch (primaryReco.reco_type) {
            case 'vm':
            case 'db':
              return primaryReco.new_hw_family_name || 'No recommendation';
            case 'storage':
              return `${primaryReco.recommended_storage_type || 'storage'} - ${primaryReco.recommended_family || 'family'}`;
            case 'iops':
              return `${primaryReco.reco_iops || 0} IOPS`;
            default:
              return 'No recommendation';
          }
        })
      };
    });


    // Sort and categorize resources
    const sortedResources = resources.sort((a, b) => b.monthly_savings - a.monthly_savings);
    
    const vms = sortedResources.filter(r => categorizeAssetType(r.service_type) === 'vm');
    const databases = sortedResources.filter(r => categorizeAssetType(r.service_type) === 'db');
    const storage = sortedResources.filter(r => categorizeAssetType(r.service_type) === 'storage');

    return {
      id: appName,
      name: appName,
      account: firstAsset.dept_name,
      provider: firstAsset.provider_name,
      department: firstAsset.dept_name,
      vms,
      databases,
      storage,
      totalSavings,
      totalCost
    };
  };

  // Fetch application details
  const fetchApplicationDetails = async () => {
    if (!applicationId) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('application', applicationId);
      const response = await fetch(`/api/optimization/recommendations/applications?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error('Server error: Missing session configuration');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData: ApiResponse = await response.json();
      setApiResponse(apiData);
      
      const transformedData = transformApiDataToApplicationDetail(apiData.assigned, applicationId);
      setApplicationData(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setApplicationData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  // Modal handlers
  const handleResourceClick = (resource: ResourceDetail, type: 'vm' | 'db' | 'storage') => {
    // Use existing data from apiResponse instead of making new API call
    if (apiResponse) {
      const asset = apiResponse.assigned.find(a => a.asset_id === resource.id);
      if (asset) {
        setModalState({
          isOpen: true,
          resourceType: type,
          resourceName: resource.name,
          resourceId: resource.id,
          assetData: asset
        });
      }
    }
  };

  const handleCloseModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };
  
  const handleAcceptanceChange = (assetId: string, type: 'safe' | 'alternate' | null) => {
    setAcceptanceStates(prev => ({
      ...prev,
      [assetId]: type
    }));
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
          <div className="text-slate-300">Loading application details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="border-b border-slate-800 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Applications</span>
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-red-400">
          <div className="text-xl font-semibold mb-2">Error Loading Application</div>
          <div className="text-slate-300">{error}</div>
        </div>
      </div>
    );
  }

  if (!applicationData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="border-b border-slate-800 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Applications</span>
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <div className="text-xl font-semibold mb-2">No Data Available</div>
          <div className="text-slate-500">No application data found for the specified ID.</div>
        </div>
      </div>
    );
  }

  // Render resource card
  const renderResourceCard = (resource: ResourceDetail) => {
    const getIcon = () => {
      // Use the actual categorized type from the resource
      const actualType = categorizeAssetType(resource.service_type);
      switch (actualType) {
        case 'vm':
          return <Server className="w-5 h-5 text-blue-400" />;
        case 'db':
          return <Database className="w-5 h-5 text-green-400" />;
        case 'storage':
          return <HardDrive className="w-5 h-5 text-purple-400" />;
      }
    };
    
    return (
      <div
        key={resource.id}
        className="cursor-pointer bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg p-4 mb-4 transition-all duration-200"
        onClick={() => handleResourceClick(resource, categorizeAssetType(resource.service_type))}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <div>
              <h3 className="font-semibold text-white">{resource.id}</h3>
              <p className="text-sm text-slate-400">{resource.hw_family}</p>
              <p className="text-xs text-slate-500">{resource.provider.toUpperCase()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-green-400">
              ${resource.monthly_savings.toFixed(2)} savings
            </p>
            <p className="text-xs text-slate-400">
              Current: ${resource.cost.toFixed(2)}
            </p>
            <p className="text-xs text-blue-400">
              {resource.recommendations?.length || 0} recommendations
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render resource list
  const renderResources = (type: 'vms' | 'databases' | 'storage') => {
    const resources = type === 'vms' 
      ? applicationData.vms 
      : type === 'databases' 
        ? applicationData.databases 
        : applicationData.storage;

    if (resources.length === 0) {
      return (
        <div className="text-slate-400 text-center py-8">
          <p className="text-lg">No {type} found for this application</p>
          <p className="text-sm text-slate-500 mt-2">This application doesn't have any {type} resources assigned to it.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
            {resources.map(resource => renderResourceCard(resource))}
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Applications</span>
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{applicationData.name}</h1>
            <div className="flex items-center space-x-6 text-slate-300">
              <span>Cloud Account: {applicationData.account}</span>
              <span>Provider: {applicationData.provider.toUpperCase()}</span>
              <span>Department: {applicationData.department}</span>
            </div>
          </div>
          
          <div className="flex space-x-6">
            <div className="text-right">
              <div className="text-2xl font-bold text-white">${applicationData.totalCost.toFixed(2)}</div>
              <div className="text-sm text-slate-400">Total Monthly Cost</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">${applicationData.totalSavings.toFixed(2)}</div>
              <div className="text-sm text-slate-400">Monthly Potential Savings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Summary Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Server className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Virtual Machines</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300">Total:</span>
                <span className="text-white">{applicationData.vms.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Assets:</span>
                <span className="text-white">{applicationData.vms.length > 0 ? 'Available' : 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Recommendations:</span>
                <span className="text-blue-400">{applicationData.vms.reduce((sum, vm) => sum + (vm.recommendations?.length || 0), 0)}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Databases</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300">Total:</span>
                <span className="text-white">{applicationData.databases.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Assets:</span>
                <span className="text-white">{applicationData.databases.length > 0 ? 'Available' : 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Recommendations:</span>
                <span className="text-blue-400">{applicationData.databases.reduce((sum, db) => sum + (db.recommendations?.length || 0), 0)}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <HardDrive className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Storage</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300">Total:</span>
                <span className="text-white">{applicationData.storage.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Assets:</span>
                <span className="text-white">{applicationData.storage.length > 0 ? 'Available' : 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Recommendations:</span>
                <span className="text-blue-400">{applicationData.storage.reduce((sum, s) => sum + (s.recommendations?.length || 0), 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Tabs */}
        <div className="bg-slate-800 rounded-xl border border-slate-700">
          <div className="flex border-b border-slate-700">
            {(['vms', 'databases', 'storage'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'vms' && <Server className="w-5 h-5" />}
                {tab === 'databases' && <Database className="w-5 h-5" />}
                {tab === 'storage' && <HardDrive className="w-5 h-5" />}
                <span className="capitalize">{tab}</span>
                <span className="ml-2 px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                  {applicationData[tab].length}
                </span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {renderResources(activeTab)}
          </div>
        </div>
      </div>

      {/* Modal */}
      <DetailedAssetModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        resourceType={modalState.resourceType}
        resourceName={modalState.resourceName}
        resourceId={modalState.resourceId}
        assetData={modalState.assetData}
        onAcceptRecommendation={fetchApplicationDetails}
        acceptedType={acceptanceStates[modalState.resourceId]}
        onAcceptanceChange={handleAcceptanceChange}
      />
    </div>
  );
};

export default ApplicationRecommendationsDetail;
