import React from 'react';
import { Server, Database, HardDrive, CheckCircle, AlertCircle, Clock, Activity, Settings } from 'lucide-react';

interface ApiRecommendation {
  reco_type: 'vm' | 'db' | 'storage' | 'iops' | null;
  new_hw_family_name?: string | null;
  recommended_storage_type?: string | null;
  recommended_family?: string | null;
  reco_iops?: string | null;
  projected_monthly_cost: number | null;
  projected_monthly_saving: number | null;
}

interface ProfileRecommendation {
  profile?: { cpu: string; memory: string };
  recommendations: {
    safe: ApiRecommendation;
    alternative?: ApiRecommendation;
  };
}

interface DetailedAssetCardProps {
  id: string;
  name: string;
  type: 'vm' | 'database' | 'storage';
  provider: 'aws' | 'azure' | 'gcp';
  status: 'idle' | 'orphaned' | 'unattached' | 'active';
  monthlyCost: number;
  monthly_savings: number;
  specifications: {
    vm?: {
      instanceType: string;
      cpu: string;
      memory: string;
      utilization: number;
    };
    database?: {
      engine: string;
      version: string;
      size: string;
      connections: number;
    };
    storage?: {
      type: string;
      size: string;
      tier: string;
      iops?: number;
    };
  };
  apiRecos?: ApiRecommendation[];
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onSelect?: (assetId: string) => void;
  onClick?: () => void;
}

const DetailedAssetCard: React.FC<DetailedAssetCardProps> = ({
  id,
  name,
  type,
  provider,
  status,
  monthlyCost,
  monthly_savings,
  specifications,
  apiRecos = [],
  isSelected = false,
  isSelectionMode = false,
  onSelect,
  onClick
}) => {
  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'vm':
        return <Server className="w-5 h-5 text-blue-600" />;
      case 'database':
        return <Database className="w-5 h-5 text-green-600" />;
      case 'storage':
        return <HardDrive className="w-5 h-5 text-purple-600" />;
      default:
        return <Settings className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'idle':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'orphaned':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'unattached':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return 'bg-yellow-100 text-yellow-800';
      case 'orphaned':
        return 'bg-red-100 text-red-800';
      case 'unattached':
        return 'bg-orange-100 text-orange-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(id);
    }
  };

  return (
    <div
      className={`bg-slate-800 border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer ${
        isSelectionMode && isSelected ? 'border-blue-500 bg-slate-700' : 'border-slate-700'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {isSelectionMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelectClick}
              onClick={handleSelectClick}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 mt-1 flex-shrink-0"
            />
          )}
          <div className="flex items-center justify-center w-10 h-10 bg-slate-700 rounded-lg text-blue-400 flex-shrink-0">
            {getAssetIcon(type)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white truncate">{name}</h3>
            <p className="text-sm text-slate-400 break-words overflow-wrap-anywhere hyphens-auto">
              {id}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
          {getStatusIcon(status)}
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {specifications.vm && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Utilization</span>
              <span className="font-medium text-white">{specifications.vm.utilization}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  specifications.vm.utilization > 80 ? 'bg-red-500' :
                  specifications.vm.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${specifications.vm.utilization}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-slate-300">Monthly Cost</span>
          <span className="font-medium text-white">${monthlyCost.toFixed(2)}</span>
        </div>

        {monthly_savings > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Potential Savings</span>
            <span className="font-medium text-green-400">${monthly_savings.toFixed(2)}</span>
          </div>
        )}

        <div className="pt-3 border-t border-slate-700">
          <h4 className="text-sm font-medium text-slate-200 mb-2">Recommendations</h4>
          <div className="space-y-2">
            {apiRecos?.map((reco, index) => (
              <div key={index} className="bg-slate-700 p-2 rounded text-xs">
                <div className="font-medium text-blue-300">
                  Reco Type: {reco.reco_type === 'storage' ? 'Storage' : reco.reco_type === 'iops' ? 'IOPS' : reco.reco_type.toUpperCase()}
                </div>
                {reco.reco_type === 'storage' ? (
                  <>
                    <div className="text-slate-300">
                      Storage Type: {reco.recommended_storage_type || 'block'}
                    </div>
                    <div className="text-slate-300">
                      Recommendation: {reco.recommended_family || 'gp2'}
                    </div>
                  </>
                ) : reco.reco_type === 'iops' ? (
                  <div className="text-slate-300">
                    Recommendation: {reco.reco_iops || 500} IOPS
                  </div>
                ) : (
                  <div className="text-slate-300">
                    Recommendation: {reco.new_hw_family_name || 'N/A'}
                  </div>
                )}
              </div>
            )) || (
              <div className="text-sm text-slate-400">No recommendations available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedAssetCard;