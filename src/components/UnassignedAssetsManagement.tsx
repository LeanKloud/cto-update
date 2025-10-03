import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Server, Database, HardDrive } from 'lucide-react';
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

interface UnassignedAssetsManagementProps {
  onBack?: () => void;
}

const UnassignedAssetsManagement: React.FC<UnassignedAssetsManagementProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unassignedAssets, setUnassignedAssets] = useState<ApiAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<ApiAsset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCreatingNewApp, setIsCreatingNewApp] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [selectedExistingApp, setSelectedExistingApp] = useState('');
  const [existingApplications, setExistingApplications] = useState<string[]>([]);
  
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

  // Fetch unassigned assets
  const fetchUnassignedAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/optimization/recommendations/applications', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setUnassignedAssets(data.unassigned || []);
      setFilteredAssets(data.unassigned || []);

      console.log('UnassignedAssetsManagement - API Response:', data);
      console.log('UnassignedAssetsManagement - Unassigned assets:', data.unassigned);

    } catch (err) {
      console.error('Error fetching unassigned assets:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      setUnassignedAssets([]);
      setFilteredAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnassignedAssets();
  }, []);

  // Filter assets based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAssets(unassignedAssets);
    } else {
      const filtered = unassignedAssets.filter(asset =>
        asset.asset_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.provider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.dept_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAssets(filtered);
    }
  }, [searchTerm, unassignedAssets]);

  const handleAssetClick = (asset: ApiAsset) => {
    setModalState({
      isOpen: true,
      resourceType: categorizeAssetType(asset.service_type),
      resourceName: asset.cloud_service_name,
      resourceId: asset.asset_id,
      assetData: asset
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Fetch existing applications
  const fetchExistingApplications = async () => {
    try {
      const response = await fetch('/api/optimization/recommendations/applications', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      const appNames = data.assigned
        .map(asset => asset.application_name)
        .filter((name): name is string => name !== null && name !== '')
        .filter((name, index, arr) => arr.indexOf(name) === index); // Remove duplicates
      
      setExistingApplications(appNames);
    } catch (err) {
      console.error('Failed to fetch existing applications:', err);
    }
  };

  // Handle assignment to application
  const handleAssignToApplication = async () => {
    if (selectedAssets.length === 0) return;

    const applicationName = isCreatingNewApp ? newAppName : selectedExistingApp;
    
    if (!applicationName.trim()) {
      alert('Please provide an application name');
      return;
    }

    try {
      const response = await fetch('/api/assets/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          asset_ids: selectedAssets,
          application_name: applicationName.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        // Reset states
        setSelectedAssets([]);
        setIsSelectionMode(false);
        setIsAssignModalOpen(false);
        setIsCreatingNewApp(false);
        setNewAppName('');
        setSelectedExistingApp('');
        
        // Refresh the assets list
        await fetchUnassignedAssets();
        
        alert(`Successfully assigned ${selectedAssets.length} asset${selectedAssets.length !== 1 ? 's' : ''} to ${applicationName}`);
      } else {
        throw new Error(result.message || 'Assignment failed');
      }
    } catch (err) {
      console.error('Assignment failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to assign assets');
    }
  };

  // Handle delete selected assets
  const handleDeleteSelected = async () => {
    if (selectedAssets.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedAssets.length} selected asset${selectedAssets.length !== 1 ? 's' : ''}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch('/api/assets/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          asset_ids: selectedAssets
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        setSelectedAssets([]);
        setIsSelectionMode(false);
        await fetchUnassignedAssets();
        alert(`Successfully deleted ${selectedAssets.length} asset${selectedAssets.length !== 1 ? 's' : ''}`);
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete assets');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssets(filteredAssets.map(asset => asset.asset_id));
    } else {
      setSelectedAssets([]);
    }
  };

  const openAssignModal = () => {
    fetchExistingApplications();
    setIsAssignModalOpen(true);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(prev => !prev);
    if (isSelectionMode) {
      // Exiting selection mode, clear selections
      setSelectedAssets([]);
    }
  };


  const handleSelectAsset = (assetId: string, selected: boolean) => {
    if (selected) {
      setSelectedAssets(prev => [...prev, assetId]);
    } else {
      setSelectedAssets(prev => prev.filter(id => id !== assetId));
    }
  };

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

  const getResourceIcon = (serviceType: string) => {
    const assetType = categorizeAssetType(serviceType);
    
    switch (assetType) {
      case 'vm':
        return <Server className="w-6 h-6 text-blue-400" />;
      case 'db':
        return <Database className="w-6 h-6 text-green-400" />;
      case 'storage':
        return <HardDrive className="w-6 h-6 text-purple-400" />;
      default:
        return <Server className="w-6 h-6 text-gray-400" />;
    }
  };

  const getAssetTypeCount = (assets: ApiAsset[], targetType: 'vm' | 'db' | 'storage'): number => {
    return assets.filter(asset => categorizeAssetType(asset.service_type) === targetType).length;
  };

  const calculateAssetMetrics = (asset: ApiAsset) => {
    if (!asset.profiles || asset.profiles.length === 0) {
      return { totalSavings: 0, totalCost: 0, currentCost: 0 };
    }

    let totalSavings = 0;
    let totalProjectedCost = 0;
    
    // Calculate from all profiles
    asset.profiles.forEach(profile => {
      if (profile.recommendations) {
        // Use the better recommendation (safe vs alternative)
        const safeReco = profile.recommendations.safe;
        const altReco = profile.recommendations.alternative;
        
        // Use safe recommendation as primary, fallback to alternative
        const primaryReco = safeReco || altReco;
        
        if (primaryReco) {
          totalSavings += primaryReco.projected_monthly_saving || 0;
          totalProjectedCost += primaryReco.projected_monthly_cost || 0;
        }
      }
    });
    
    // Current cost = projected cost + savings
    const currentCost = totalProjectedCost + totalSavings;
    
    return { totalSavings, totalCost: totalProjectedCost, currentCost };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
          <div className="text-slate-300">Loading unassigned assets...</div>
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
          <div className="text-xl font-semibold mb-2">Error Loading Assets</div>
          <div className="text-slate-300">{error}</div>
        </div>
      </div>
    );
  }

  const totalSavings = filteredAssets.reduce((sum, asset) => {
    const { totalSavings } = calculateAssetMetrics(asset);
    return sum + totalSavings;
  }, 0);

  const totalCost = filteredAssets.reduce((sum, asset) => {
    const { currentCost } = calculateAssetMetrics(asset);
    return sum + currentCost;
  }, 0);

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
            <h1 className="text-3xl font-bold text-white mb-2">Manage Unassigned Assets</h1>
            <p className="text-slate-300">Manage and organize unassigned cloud resources</p>
          </div>
          
          <div className="flex space-x-6">
            <div className="text-right">
              <div className="text-2xl font-bold text-white">${totalCost.toFixed(2)}</div>
              <div className="text-sm text-slate-400">Total Monthly Cost</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">${totalSavings.toFixed(2)}</div>
              <div className="text-sm text-slate-400">Monthly Potential Savings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">Total Unassigned Assets</h3>
            <div className="text-3xl font-bold text-blue-400">{filteredAssets.length}</div>
            <p className="text-sm text-slate-400">Across all providers</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">Monthly Cost</h3>
            <div className="text-3xl font-bold text-white">${totalCost.toFixed(2)}</div>
            <p className="text-sm text-slate-400">Potential waste</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">Selected Assets</h3>
            <div className="text-3xl font-bold text-purple-400">{selectedAssets.length}</div>
            <p className="text-sm text-slate-400">Ready for action</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">Asset Types</h3>
            <div className="flex space-x-2 text-sm">
              <span className="text-blue-400">
                {getAssetTypeCount(filteredAssets, 'vm')} VMs
              </span>
              <span className="text-green-400">
                {getAssetTypeCount(filteredAssets, 'db')} DBs
              </span>
              <span className="text-purple-400">
                {getAssetTypeCount(filteredAssets, 'storage')} Storage
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search assets by name, ID, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={toggleSelectionMode}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isSelectionMode
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSelectionMode ? 'Exit Selection' : 'Select Assets'}
            </button>
          </div>
        </div>

        {/* Selection Controls and Action Buttons */}
        {selectedAssets.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium">
                  {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedAssets([])}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Clear selection
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={openAssignModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Assign to Application
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Select All Controls */}
        {isSelectionMode && filteredAssets.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="select-all"
                checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="select-all" className="text-slate-300 text-sm cursor-pointer">
                Select all {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''}
              </label>
            </div>
            
            <div className="text-sm text-slate-400">
              Showing {filteredAssets.length} of {unassignedAssets.length} assets
            </div>
          </div>
        )}
        
        {/* Asset Count (when not in selection mode) */}
        {!isSelectionMode && filteredAssets.length > 0 && (
          <div className="flex justify-end mb-4">
            <div className="text-sm text-slate-400">
              Showing {filteredAssets.length} of {unassignedAssets.length} assets
            </div>
          </div>
        )}

        {/* Asset Grid */}
        {filteredAssets.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
            <div className="text-slate-400 text-lg mb-2">No unassigned assets found</div>
            <div className="text-slate-500 text-sm">
              {searchTerm ? 'Try adjusting your search criteria' : 'All assets are currently assigned to applications'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAssets.map((asset) => {
              const { totalSavings, currentCost } = calculateAssetMetrics(asset);
              const isSelected = selectedAssets.includes(asset.asset_id);
              
              return (
                <div
                  key={asset.asset_id}
                  className={`bg-slate-800 border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:bg-slate-700 ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => {
                    if (isSelectionMode) {
                      handleSelectAsset(asset.asset_id, !isSelected);
                    } else {
                      handleAssetClick(asset);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {isSelectionMode && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectAsset(asset.asset_id, e.target.checked);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                        />
                      )}
                      {getResourceIcon(asset.service_type)}
                      <div>
                        <h3 className="font-semibold text-white text-sm truncate max-w-[200px]">
                          {asset.asset_id}
                        </h3>
                        <p className="text-xs text-slate-400">{asset.hw_family_name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Provider:</span>
                        <p className="text-white font-medium uppercase">{asset.provider_name}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Department:</span>
                        <p className="text-white font-medium">{asset.dept_name}</p>
                      </div>
                    </div>

                    <div className="bg-slate-700 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-400">Monthly Cost</span>
                        <span className="text-sm font-bold text-white">${currentCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Potential Savings</span>
                        <span className="text-sm font-bold text-green-400">${totalSavings.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        {asset.profiles?.length || 0} recommendation{(asset.profiles?.length || 0) !== 1 ? 's' : ''}
                      </span>
                      {isSelectionMode ? (
                        <span className="text-slate-400">Click to select/deselect</span>
                      ) : (
                        <span className="text-blue-400">Click to view details →</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Asset Details Modal */}
      <DetailedAssetModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        resourceType={modalState.resourceType}
        resourceName={modalState.resourceName}
        resourceId={modalState.resourceId}
        assetData={modalState.assetData}
        onAcceptRecommendation={fetchUnassignedAssets}
      />

      {/* Assignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-xl shadow-xl max-w-md w-full border border-slate-700">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white">
                Assign {selectedAssets.length} Asset{selectedAssets.length !== 1 ? 's' : ''}
              </h3>
              <button
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setIsCreatingNewApp(false);
                  setNewAppName('');
                  setSelectedExistingApp('');
                }}
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {/* Option Selection */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="existing-app"
                      name="assignment-type"
                      checked={!isCreatingNewApp}
                      onChange={() => setIsCreatingNewApp(false)}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500"
                    />
                    <label htmlFor="existing-app" className="text-white font-medium cursor-pointer">
                      Assign to Existing Application
                    </label>
                  </div>

                  {!isCreatingNewApp && (
                    <div className="ml-7">
                      <select
                        value={selectedExistingApp}
                        onChange={(e) => setSelectedExistingApp(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select an application...</option>
                        {existingApplications.map((appName) => (
                          <option key={appName} value={appName}>
                            {appName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="new-app"
                      name="assignment-type"
                      checked={isCreatingNewApp}
                      onChange={() => setIsCreatingNewApp(true)}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500"
                    />
                    <label htmlFor="new-app" className="text-white font-medium cursor-pointer">
                      Create New Application
                    </label>
                  </div>

                  {isCreatingNewApp && (
                    <div className="ml-7">
                      <input
                        type="text"
                        value={newAppName}
                        onChange={(e) => setNewAppName(e.target.value)}
                        placeholder="Enter new application name..."
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-slate-700">
              <button
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setIsCreatingNewApp(false);
                  setNewAppName('');
                  setSelectedExistingApp('');
                }}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignToApplication}
                disabled={!isCreatingNewApp && !selectedExistingApp || isCreatingNewApp && !newAppName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Assets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnassignedAssetsManagement;