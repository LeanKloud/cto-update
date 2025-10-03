import React from 'react';
import { X, Server, Database, HardDrive } from 'lucide-react';

// Backend API Response Interfaces
interface ApiRecommendation {
  reco_type: 'vm' | 'db' | 'storage' | 'iops';
  new_hw_family_name?: string;
  recommended_storage_type?: string;
  recommended_family?: string;
  reco_iops?: number;
  projected_monthly_cost: number;
  projected_monthly_saving: number;
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
  recos: ApiRecommendation[];
}

interface RecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: 'vm' | 'db' | 'storage';
  resourceName: string;
  resourceId: string;
  assetData?: ApiAsset;
}

const RecommendationsModal: React.FC<RecommendationsModalProps> = ({
  isOpen,
  onClose,
  resourceType,
  resourceName,
  resourceId,
  assetData
}) => {
  if (!isOpen) return null;

  // Helper function to get current cost (mock for now, should come from API)
  const getCurrentCost = () => {
    // This should ideally come from the API, but for now we'll calculate from recommendations
    if (!assetData?.recos.length) return 0;
    const totalProjectedCost = assetData.recos.reduce((sum, reco) => sum + reco.projected_monthly_cost, 0);
    const totalSavings = assetData.recos.reduce((sum, reco) => sum + reco.projected_monthly_saving, 0);
    return totalProjectedCost + totalSavings;
  };

  // Helper function to get current utilization (mock for now)
  const getCurrentUtilization = () => {
    return Math.floor(Math.random() * 50) + 30; // Random between 30-80%
  };

  // Helper function to get the primary recommendation (first one)
  const getPrimaryRecommendation = () => {
    if (!assetData?.recos.length) return null;
    return assetData.recos[0];
  };

  // Helper function to get alternative recommendation (second one, if exists)
  const getAlternativeRecommendation = () => {
    if (!assetData?.recos.length || assetData.recos.length < 2) return null;
    return assetData.recos[1];
  };

  const getResourceIcon = () => {
    switch (resourceType) {
      case 'vm':
        return <Server className="w-6 h-6 text-blue-400" />;
      case 'db':
        return <Database className="w-6 h-6 text-green-400" />;
      case 'storage':
        return <HardDrive className="w-6 h-6 text-purple-400" />;
      default:
        return null;
    }
  };

  const getResourceTitle = () => {
    switch (resourceType) {
      case 'vm':
        return 'Virtual Machine Recommendations';
      case 'db':
        return 'Database Recommendations';
      case 'storage':
        return 'Storage Recommendations';
      default:
        return 'Recommendations';
    }
  };

  const UtilizationChart: React.FC<{ percentage: number; color: string; label: string }> = ({ 
    percentage, 
    color, 
    label 
  }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width="100" height="100" className="transform -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#374151"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
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
            <span className="text-lg font-bold text-white">{percentage}%</span>
          </div>
        </div>
        <div className="text-sm text-slate-400 mt-2 text-center">{label}</div>
      </div>
    );
  };

  const renderVMRecommendations = () => {
    if (!assetData) return null;

    const currentCost = getCurrentCost();
    const currentUtilization = getCurrentUtilization();
    const primaryReco = getPrimaryRecommendation();
    const alternativeReco = getAlternativeRecommendation();

    return (
      <div className="space-y-6">
        {/* Current Instance */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h4 className="font-medium text-white mb-2">Current Instance</h4>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-700 text-slate-300">
              {assetData.hw_family_name}
            </span>
            <span className="text-sm text-slate-300">
              ${currentCost.toFixed(2)}/month
            </span>
            <span className="text-sm text-slate-300">
              {currentUtilization}% utilization
            </span>
          </div>
        </div>

        {/* Recommendations - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Instance Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3 text-center">Current Instance</h4>
            <div className="space-y-3">
              <div className="text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-700 text-slate-300">
                  {assetData.hw_family_name}
                </span>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-white">${currentCost.toFixed(2)}</span>
                <span className="text-sm text-slate-400 ml-1">/month</span>
              </div>
              <div className="text-center">
                <span className="text-sm text-slate-400">{currentUtilization}% utilization</span>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <UtilizationChart 
                percentage={currentUtilization} 
                color="#4B5563" 
                label="Current Utilization"
              />
            </div>
          </div>

          {/* Safe Recommendation */}
          {primaryReco && (
            <div className="border border-green-600/20 rounded-lg p-4 bg-green-900/10">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
                  Safe
                </span>
                <h4 className="font-medium text-white">Safe Recommended</h4>
              </div>
              
              <div className="space-y-3">
                <div className="text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/30 text-green-300">
                    {primaryReco.new_hw_family_name || 'N/A'}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-white">${primaryReco.projected_monthly_cost.toFixed(2)}</span>
                  <span className="text-sm text-slate-400 ml-1">/month</span>
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-green-400">${primaryReco.projected_monthly_saving.toFixed(2)} savings</span>
                </div>
                <div className="text-center">
                  <span className="text-sm text-slate-400">99.99% uptime</span>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <UtilizationChart 
                  percentage={92} 
                  color="#10B981" 
                  label="Proposed Utilization"
                />
              </div>
            </div>
          )}

          {/* Alternative Recommendation */}
          {alternativeReco && (
            <div className="border border-blue-600/20 rounded-lg p-4 bg-blue-900/10">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300">
                  Alternative
                </span>
                <h4 className="font-medium text-white">Alternative Option</h4>
              </div>
              
              <div className="space-y-3">
                <div className="text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900/30 text-blue-300">
                    {alternativeReco.new_hw_family_name || 'N/A'}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-white">${alternativeReco.projected_monthly_cost.toFixed(2)}</span>
                  <span className="text-sm text-slate-400 ml-1">/month</span>
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-blue-400">${alternativeReco.projected_monthly_saving.toFixed(2)} savings</span>
                </div>
                <div className="text-center">
                  <span className="text-sm text-slate-400">99.95% uptime</span>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <UtilizationChart 
                  percentage={78} 
                  color="#3B82F6" 
                  label="Proposed Utilization"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDBRecommendations = () => {
    if (!assetData) return null;

    const currentCost = getCurrentCost();
    const currentUtilization = getCurrentUtilization();
    const primaryReco = getPrimaryRecommendation();
    const alternativeReco = getAlternativeRecommendation();

    return (
      <div className="space-y-6">
        {/* Current Database */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h4 className="font-medium text-white mb-2">Current Database Instance</h4>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-700 text-slate-300">
              {assetData.hw_family_name}
            </span>
            <span className="text-sm text-slate-300">
              ${currentCost.toFixed(2)}/month
            </span>
            <span className="text-sm text-slate-300">
              {currentUtilization}% utilization
            </span>
          </div>
        </div>

        {/* Recommendations - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Instance Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3 text-center">Current Instance</h4>
            <div className="space-y-3">
              <div className="text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-700 text-slate-300">
                  {assetData.hw_family_name}
                </span>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-white">${currentCost.toFixed(2)}</span>
                <span className="text-sm text-slate-400 ml-1">/month</span>
              </div>
              <div className="text-center">
                <span className="text-sm text-slate-400">{currentUtilization}% utilization</span>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <UtilizationChart 
                percentage={currentUtilization} 
                color="#4B5563" 
                label="Current Utilization"
              />
            </div>
          </div>

          {/* Safe Recommendation */}
          {primaryReco && (
            <div className="border border-green-600/20 rounded-lg p-4 bg-green-900/10">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
                  Safe
                </span>
                <h4 className="font-medium text-white">Safe Recommended</h4>
              </div>
              
              <div className="space-y-3">
                <div className="text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/30 text-green-300">
                    {primaryReco.new_hw_family_name || 'N/A'}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-white">${primaryReco.projected_monthly_cost.toFixed(2)}</span>
                  <span className="text-sm text-slate-400 ml-1">/month</span>
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-green-400">${primaryReco.projected_monthly_saving.toFixed(2)} savings</span>
                </div>
                <div className="text-center">
                  <span className="text-sm text-slate-400">99.99% uptime</span>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <UtilizationChart 
                  percentage={92} 
                  color="#10B981" 
                  label="Proposed Utilization"
                />
              </div>
            </div>
          )}

          {/* Alternative Recommendation */}
          {alternativeReco && (
            <div className="border border-blue-600/20 rounded-lg p-4 bg-blue-900/10">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300">
                  Alternative
                </span>
                <h4 className="font-medium text-white">Alternative Option</h4>
              </div>
              
              <div className="space-y-3">
                <div className="text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900/30 text-blue-300">
                    {alternativeReco.new_hw_family_name || 'N/A'}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-white">${alternativeReco.projected_monthly_cost.toFixed(2)}</span>
                  <span className="text-sm text-slate-400 ml-1">/month</span>
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-blue-400">${alternativeReco.projected_monthly_saving.toFixed(2)} savings</span>
                </div>
                <div className="text-center">
                  <span className="text-sm text-slate-400">99.95% uptime</span>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <UtilizationChart 
                  percentage={78} 
                  color="#3B82F6" 
                  label="Proposed Utilization"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStorageRecommendations = () => {
    if (!assetData) return null;

    const currentCost = getCurrentCost();
    const currentUtilization = getCurrentUtilization();
    const primaryReco = getPrimaryRecommendation();
    const alternativeReco = getAlternativeRecommendation();

    return (
      <div className="space-y-6">
        {/* Current Storage */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h4 className="font-medium text-white mb-2">Current Storage</h4>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-700 text-slate-300">
              {assetData.hw_family_name}
            </span>
            <span className="text-sm text-slate-300">
              ${currentCost.toFixed(2)}/month
            </span>
            <span className="text-sm text-slate-300">
              {currentUtilization}% utilization
            </span>
          </div>
        </div>

        {/* Recommendations - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Instance Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3 text-center">Current Storage</h4>
            <div className="space-y-3">
              <div className="text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-700 text-slate-300">
                  {assetData.hw_family_name}
                </span>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-white">${currentCost.toFixed(2)}</span>
                <span className="text-sm text-slate-400 ml-1">/month</span>
              </div>
              <div className="text-center">
                <span className="text-sm text-slate-400">{currentUtilization}% utilization</span>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <UtilizationChart 
                percentage={currentUtilization} 
                color="#4B5563" 
                label="Current Utilization"
              />
            </div>
          </div>

          {/* Safe Recommendation */}
          {primaryReco && (
            <div className="border border-green-600/20 rounded-lg p-4 bg-green-900/10">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
                  Safe
                </span>
                <h4 className="font-medium text-white">Safe Recommended</h4>
              </div>
              
              <div className="space-y-3">
                <div className="text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/30 text-green-300">
                    {primaryReco.recommended_storage_type || 'block'} - {primaryReco.recommended_family || 'gp2'}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-white">${primaryReco.projected_monthly_cost.toFixed(2)}</span>
                  <span className="text-sm text-slate-400 ml-1">/month</span>
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-green-400">${primaryReco.projected_monthly_saving.toFixed(2)} savings</span>
                </div>
                <div className="text-center">
                  <span className="text-sm text-slate-400">99.99% durability</span>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <UtilizationChart 
                  percentage={92} 
                  color="#10B981" 
                  label="Proposed Utilization"
                />
              </div>
            </div>
          )}

          {/* Alternative Recommendation */}
          {alternativeReco && (
            <div className="border border-blue-600/20 rounded-lg p-4 bg-blue-900/10">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300">
                  Alternative
                </span>
                <h4 className="font-medium text-white">Alternative Option</h4>
              </div>
              
              <div className="space-y-3">
                <div className="text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900/30 text-blue-300">
                    {alternativeReco.recommended_storage_type || 'block'} - {alternativeReco.recommended_family || 'gp3'}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-white">${alternativeReco.projected_monthly_cost.toFixed(2)}</span>
                  <span className="text-sm text-slate-400 ml-1">/month</span>
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-blue-400">${alternativeReco.projected_monthly_saving.toFixed(2)} savings</span>
                </div>
                <div className="text-center">
                  <span className="text-sm text-slate-400">99.95% durability</span>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <UtilizationChart 
                  percentage={78} 
                  color="#3B82F6" 
                  label="Proposed Utilization"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Application Overview */}
        <div className="p-6 border-b border-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-slate-200">Cloud Account</h3>
                <span className="text-blue-400">{assetData?.provider_name || 'azure'}</span>
              </div>
              <div className="text-sm text-slate-400">
                {assetData?.application_name || resourceName}
              </div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-slate-200">Total Monthly Cost</h3>
                <span className="text-emerald-400">${getCurrentCost().toFixed(2)}</span>
              </div>
              <div className="text-sm text-slate-400">
                Provider: {assetData?.provider_name || 'azure'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            {getResourceIcon()}
            <div>
              <h3 className="text-xl font-semibold text-white">{getResourceTitle()}</h3>
              <p className="text-sm text-slate-400">{resourceName} ({resourceId})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {resourceType === 'vm' && renderVMRecommendations()}
          {resourceType === 'db' && renderDBRecommendations()}
          {resourceType === 'storage' && renderStorageRecommendations()}
        </div>
      </div>
    </div>
  );
};

export default RecommendationsModal;


