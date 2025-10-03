import React from 'react';
import { Server, Database, HardDrive, CheckCircle, AlertCircle, Clock, Activity } from 'lucide-react';

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

interface AssetCardProps {
  type: 'vm' | 'db' | 'storage';
  count: number;
  status: string;
  assets?: ApiAsset[];
  showRecommendations?: boolean;
  isUnassigned?: boolean;
  assetId?: string;
  onSelect?: (assetId: string) => void;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

const AssetCard: React.FC<AssetCardProps> = ({
  type,
  count,
  status,
  assets = [],
  showRecommendations = false,
  isUnassigned = false,
  assetId,
  onSelect,
  isSelected = false,
  onClick,
  className = ''
}) => {
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

  const getStatusIcon = (status: string) => {
    if (status.includes('idle')) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    if (status.includes('orphaned') || status.includes('unattached')) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (status.includes('active') || status.includes('attached')) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  // Get recommendations for this resource type
  const recommendations = assets.flatMap(asset => asset.recos).filter(reco => {
    if (type === 'vm' || type === 'db') {
      return reco.reco_type === type;
    } else if (type === 'storage') {
      return reco.reco_type === 'storage' || reco.reco_type === 'iops';
    }
    return false;
  });

  const hasRecommendations = recommendations.length > 0;
  const totalSavings = recommendations.reduce((sum, reco) => sum + (reco.projected_monthly_saving || 0), 0);

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect && assetId) {
      e.stopPropagation();
      onSelect(assetId);
    } else if (onClick) {
      onClick();
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect && assetId) {
      onSelect(assetId);
    }
  };

  return (
    <div 
      className={`flex flex-col items-center space-y-1 relative cursor-pointer transition-all duration-200 ${
        isSelected ? 'transform scale-105' : ''
      } ${className}`}
      onClick={handleClick}
    >
      {isUnassigned && assetId && onSelect && (
        <input
          type="checkbox"
          className="absolute -top-2 -right-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 z-10"
          checked={isSelected}
          onChange={handleCheckboxClick}
          onClick={handleCheckboxClick}
        />
      )}
      
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
        isUnassigned 
          ? 'bg-red-100 text-red-600' 
          : hasRecommendations 
            ? 'bg-green-100 text-green-600' 
            : 'bg-blue-100 text-blue-600'
      }`}>
        {getIcon()}
      </div>
      
      <div className="text-center flex flex-col gap-1">
        <div className="text-sm font-medium text-white">{getLabel()}</div>
        <div className="text-xs text-white/70">{count} total</div>
        <div className={`text-xs flex items-center justify-center gap-1 ${
          isUnassigned ? 'text-red-400 font-medium' : 'text-white/60'
        }`}>
          {getStatusIcon(status)}
          <span>{status}</span>
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

export default AssetCard;