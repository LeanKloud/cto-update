import { useMemo } from 'react';

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

interface FilteredAssetsByType {
  vms: ApiAsset[];
  databases: ApiAsset[];
  storage: ApiAsset[];
  totalCount: number;
  totalSavings: number;
  totalCost: number;
}

/**
 * Custom hook to filter assets by application name and categorize them by type
 * @param assignedAssets - Array of all assigned assets from API
 * @param applicationName - Name of the application to filter by
 * @returns Filtered and categorized assets with counts and totals
 */
export const useApplicationAssets = (
  assignedAssets: ApiAsset[] | null,
  applicationName: string | null
): FilteredAssetsByType => {
  return useMemo(() => {
    // Return empty result if no data or application name
    if (!assignedAssets || !applicationName) {
      return {
        vms: [],
        databases: [],
        storage: [],
        totalCount: 0,
        totalSavings: 0,
        totalCost: 0
      };
    }

    // Filter assets that belong to the specific application
    // Handle null application_name safely
    const filteredAssets = assignedAssets.filter(asset => 
      asset.application_name === applicationName
    );

    console.log(`useApplicationAssets - Filtering for application: "${applicationName}"`);
    console.log(`useApplicationAssets - Total assigned assets: ${assignedAssets.length}`);
    console.log(`useApplicationAssets - Filtered assets for "${applicationName}": ${filteredAssets.length}`);

    // Categorize assets by service type
    const vms: ApiAsset[] = [];
    const databases: ApiAsset[] = [];
    const storage: ApiAsset[] = [];

    let totalSavings = 0;
    let totalCost = 0;

    filteredAssets.forEach(asset => {
      // Calculate savings and cost from profiles
      const assetSavings = calculateAssetSavings(asset.profiles || []);
      const assetCost = calculateAssetCost(asset.profiles || []);
      
      totalSavings += assetSavings;
      totalCost += assetCost;

      // Categorize by service type using comprehensive logic
      const assetType = categorizeAssetType(asset.service_type);
      
      if (assetType === 'vm') {
        vms.push(asset);
      } else if (assetType === 'db') {
        databases.push(asset);
      } else {
        storage.push(asset);
      }
    });

    const result = {
      vms,
      databases,
      storage,
      totalCount: filteredAssets.length,
      totalSavings,
      totalCost
    };

    console.log(`useApplicationAssets - Result:`, {
      vms: result.vms.length,
      databases: result.databases.length,
      storage: result.storage.length,
      totalCount: result.totalCount,
      totalSavings: result.totalSavings,
      totalCost: result.totalCost
    });

    return result;
  }, [assignedAssets, applicationName]);
};

/**
 * Categorize asset type based on service type
 */
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

/**
 * Calculate total savings from asset profiles
 */
const calculateAssetSavings = (profiles: ApiProfile[]): number => {
  if (!profiles || !Array.isArray(profiles)) return 0;
  
  return profiles.reduce((total, profile) => {
    if (profile.recommendations) {
      // Use the better recommendation (safe vs alternative)
      const safeReco = profile.recommendations.safe;
      const altReco = profile.recommendations.alternative;
      
      // Use safe recommendation as primary, fallback to alternative
      const primaryReco = safeReco || altReco;
      
      if (primaryReco) {
        return total + (primaryReco.projected_monthly_saving || 0);
      }
    }
    return total;
  }, 0);
};

/**
 * Calculate total cost from asset profiles
 */
const calculateAssetCost = (profiles: ApiProfile[]): number => {
  if (!profiles || !Array.isArray(profiles)) return 0;
  
  return profiles.reduce((total, profile) => {
    if (profile.recommendations) {
      // Use the better recommendation (safe vs alternative)
      const safeReco = profile.recommendations.safe;
      const altReco = profile.recommendations.alternative;
      
      // Use safe recommendation as primary, fallback to alternative
      const primaryReco = safeReco || altReco;
      
      if (primaryReco) {
        return total + (primaryReco.projected_monthly_cost || 0);
      }
    }
    return total;
  }, 0);
};

export default useApplicationAssets;
