import React, { useState } from "react";
import { X, Server, Database, HardDrive, ChevronDown } from "lucide-react";

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

interface DetailedAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: "vm" | "db" | "storage";
  resourceName: string;
  resourceId: string;
  assetData?: ApiAsset;
  onAcceptRecommendation?: () => void;
  acceptedType?: "safe" | "alternate" | null;
  onAcceptanceChange?: (
    assetId: string,
    type: "safe" | "alternate" | null
  ) => void;
}

const DetailedAssetModal: React.FC<DetailedAssetModalProps> = ({
  isOpen,
  onClose,
  resourceType,
  // resourceName,
  resourceId,
  assetData,
  // onAcceptRecommendation,
  acceptedType: propAcceptedType,
  onAcceptanceChange,
}) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localAcceptedType, setLocalAcceptedType] = useState<
    "safe" | "alternate" | null
  >(null);
  const [selectedProfile, setSelectedProfile] = useState<string>("default");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);


  const getProfileValues = (profile: string) => {
    const profileData = assetData?.profiles.find((p) => p.profile === profile);
    return {
      current: profileData?.profile || "default",
      safe: profileData?.profile || "default",
    }
  };

  const acceptedType = propAcceptedType ?? localAcceptedType;

  if (!isOpen) return null;

  const acceptRecommendation = async (type: "safe" | "alternate") => {
    if (!assetData) return;

    setIsAccepting(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        asset_id: assetData.asset_id,
        asset_type: resourceType,
        accepted_type: type,
      });

      const response = await fetch(
        `/api/optimization/recommendations/accept?${params}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        if (onAcceptanceChange) {
          onAcceptanceChange(assetData.asset_id, type);
        } else {
          setLocalAcceptedType(type);
        }
        setIsAccepting(false);
      } else {
        throw new Error(result.message || "Failed to accept recommendation");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsAccepting(false);
    }
  };

  const revokeRecommendation = async () => {
    if (!assetData) return;

    setIsAccepting(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        asset_id: assetData.asset_id,
        asset_type: resourceType,
      });

      const response = await fetch(
        `/api/optimization/recommendations/revoke?${params}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        if (onAcceptanceChange) {
          onAcceptanceChange(assetData.asset_id, null);
        } else {
          setLocalAcceptedType(null);
        }
      } else {
        throw new Error(result.message || "Failed to revoke recommendation");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsAccepting(false);
    }
  };

  const getResourceIcon = () => {
    switch (resourceType) {
      case "vm":
        return <Server className="w-6 h-6 text-blue-400" />;
      case "db":
        return <Database className="w-6 h-6 text-green-400" />;
      case "storage":
        return <HardDrive className="w-6 h-6 text-purple-400" />;
    }
  };

  const getResourceTitle = () => {
    switch (resourceType) {
      case "vm":
        return "VM";
      case "db":
        return "Database";
      case "storage":
        return "Storage";
    }
  };

  // Helper functions to get recommendation data
  const getCurrentCost = () => {
    if (!assetData?.profiles.length) return 700;
    const allRecommendations = assetData.profiles
      .flatMap((profile) => [
        profile.recommendations.safe,
        profile.recommendations.alternative,
      ])
      .filter((reco) => reco.projected_monthly_cost !== null);

    const totalProjectedCost = allRecommendations.reduce(
      (sum, reco) => sum + (reco.projected_monthly_cost || 0),
      0
    );
    const totalSavings = allRecommendations.reduce(
      (sum, reco) => sum + (reco.projected_monthly_saving || 0),
      0
    );
    return totalProjectedCost + totalSavings;
  };

  const getSafeRecommendation = () => {
    const findIndex = assetData?.profiles.findIndex(
      (profile) => profile.profile === selectedProfile
    );
    return assetData?.profiles[findIndex || 0]?.recommendations.safe;
  };

  const getAlternateRecommendation = () => {
    const findIndex = assetData?.profiles.findIndex(
      (profile) => profile.profile === selectedProfile
    );
    return assetData?.profiles[findIndex || 0]?.recommendations.alternative;
  };

  // Generate table data based on resource type and API data
  const generateTableData = () => {
    const safeReco = getSafeRecommendation();
    const alternateReco = getAlternateRecommendation();
    const currentCost = getCurrentCost();

    const baseData = [
      {
        label: `${getResourceTitle()} type`,
        current:
          resourceType === "vm"
            ? "Virtual Machine"
            : resourceType === "db"
            ? "Database"
            : "Storage",
        safe:
          resourceType === "vm"
            ? "Virtual Machine"
            : resourceType === "db"
            ? "Database"
            : "Storage",
        alternate: alternateReco
          ? resourceType === "vm"
            ? "Virtual Machine"
            : resourceType === "db"
            ? "Database"
            : "Storage"
          : "No alternative recommendation",
      },
      {
        label: `${getResourceTitle()} ID`,
        current: resourceId,
        safe: resourceId,
        alternate: alternateReco ? resourceId : "No alternative recommendation",
      },
      {
        label: "Server",
        current: assetData?.hw_family_name || "t3a.medium",
        safe: safeReco?.new_hw_family_name || "t3a.small",
        alternate:
          alternateReco?.new_hw_family_name || "No alternative recommendation",
      },
      {
        label: "Spends",
        current: `$${currentCost.toFixed(0)}k`,
        safe: `$${(safeReco?.projected_monthly_cost || 700).toFixed(0)}k`,
        alternate: alternateReco
          ? `$${(alternateReco.projected_monthly_cost || 700).toFixed(0)}k`
          : "No alternative recommendation",
      },
      {
        label: "Savings",
        current: `$${Math.floor(Math.random() * 200 + 200)}k`,
        safe: `$${Math.floor(Math.random() * 200 + 200)}k`,
        alternate: alternateReco
          ? `$${Math.floor(Math.random() * 200 + 200)}k`
          : "No alternative recommendation",
      },
      {
        label: "Potential savings",
        current: "-",
        safe: `$${(safeReco?.projected_monthly_saving || 700).toFixed(0)}k`,
        alternate: alternateReco
          ? `$${(alternateReco.projected_monthly_saving || 800).toFixed(0)}k`
          : "No alternative recommendation",
      },
      {
        label: "Efficiency",
        current: "50%",
        safe: "60%",
        alternate: alternateReco ? "80%" : "No alternative recommendation",
      },
      {
        label: "Median CPU usage",
        current: "80%",
        safe: "60%",
        alternate: alternateReco ? "80%" : "No alternative recommendation",
      },
      {
        label: "Median Memory usage",
        current: "80%",
        safe: "60%",
        alternate: alternateReco ? "80%" : "No alternative recommendation",
      },
      {
        label: "Median Network usage",
        current: "80%",
        safe: "60%",
        alternate: alternateReco ? "80%" : "No alternative recommendation",
      },
      {
        label: "Max CPU",
        current: "90",
        safe: "85",
        alternate: alternateReco ? "95" : "No alternative recommendation",
      },
      {
        label: "Max Memory",
        current: "80",
        safe: "75",
        alternate: alternateReco ? "85" : "No alternative recommendation",
      },
      {
        label: "Max Network",
        current: "30",
        safe: "25",
        alternate: alternateReco ? "35" : "No alternative recommendation",
      },
      {
        label: "Profile",
        current: getProfileValues(selectedProfile).current,
        safe: getProfileValues(selectedProfile).safe,
        alternate: alternateReco
          ? getProfileValues(selectedProfile).current
          : "No alternative recommendation",
      },
    ];

    // Customize for storage type
    if (resourceType === "storage") {
      baseData[2] = {
        label: "Storage Type",
        current: assetData?.hw_family_name || "gp2",
        safe: safeReco?.recommended_family || "gp3",
        alternate: alternateReco?.recommended_family || "io1",
      };

      // Add IOPS row for storage
      baseData.splice(7, 0, {
        label: "IOPS",
        current: "3000",
        safe: safeReco?.reco_iops || "3000",
        alternate: alternateReco?.reco_iops || "5000",
      });
    }

    return baseData;
  };

  const tableRows = generateTableData();
  const hasAlternateRecommendation = getAlternateRecommendation() !== null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            {getResourceIcon()}
            <div>
              <h3 className="text-xl font-semibold text-white">
                Details & Recommendation of {getResourceTitle()} ID -{" "}
                {resourceId}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-visible">
            <table className="w-full">
              <thead className="bg-slate-700 border-b border-slate-600">
                <tr>
                  <th
                    className={`text-left py-4 px-6 font-medium text-white ${
                      hasAlternateRecommendation ? "w-1/4" : "w-1/3"
                    }`}
                  >
                    {getResourceTitle()} details
                  </th>
                  <th
                    className={`text-center py-4 px-6 font-medium text-white ${
                      hasAlternateRecommendation ? "w-1/4" : "w-1/3"
                    }`}
                  >
                    Current
                  </th>
                  <th
                    className={`text-center py-4 px-6 font-medium text-white ${
                      hasAlternateRecommendation ? "w-1/4" : "w-1/3"
                    }`}
                  >
                    Safe
                  </th>
                  {hasAlternateRecommendation && (
                    <th className="text-center py-4 px-6 font-medium text-white w-1/4">
                      Alternate
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {tableRows.map((row, index) => (
                  <tr
                    key={row.label}
                    className={`${
                      index % 2 === 0 ? "bg-slate-800" : "bg-slate-800/50"
                    } hover:bg-slate-700/50 transition-colors`}
                  >
                    <td className="py-4 px-6 font-medium text-white">
                      {row.label === "Profile" ? (
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setIsProfileDropdownOpen(!isProfileDropdownOpen)
                            }
                            className="flex items-center space-x-2 px-3 py-1 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                          >
                            <span>{row.label}</span>
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          {isProfileDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-[9999] min-w-[120px] whitespace-nowrap">
                              {assetData?.profiles?.map((option, index) => (
                                <button
                                  key={option?.profile || index}
                                  onClick={() => {
                                    setSelectedProfile(
                                      option?.profile || "default"
                                    );
                                    setIsProfileDropdownOpen(false);
                                  }}
                                  className="block w-full text-left px-3 py-2 text-white hover:bg-slate-600 first:rounded-t-lg last:rounded-b-lg transition-colors"
                                >
                                  {option?.profile || "default"}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        row.label
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-white truncate " style={{maxWidth: '150px'}}>
                      {row.current}
                    </td>
                    <td className="py-4 px-6 text-center text-white truncate " style={{maxWidth: '150px'}}>
                      {row.safe}
                    </td>
                    {hasAlternateRecommendation && (
                      <td className="py-4 px-6 text-center text-white truncate " style={{maxWidth: '150px'}}>
                        {row.alternate}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-slate-700">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
            {error && <div className="text-red-400 text-sm mb-4">{error}</div>}
            {acceptedType ? (
              <>
                <div className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowe">
                  {acceptedType === "safe" ? "Safe" : "Alternate"}{" "}
                  recommendation accepted
                </div>
                <button
                  onClick={revokeRecommendation}
                  disabled={isAccepting}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAccepting ? "Revoking..." : "Revoke Acceptance"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => acceptRecommendation("safe")}
                  disabled={isAccepting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAccepting ? "Processing..." : "Accept Safe Recommendation"}
                </button>
                {getAlternateRecommendation() && (
                  <button
                    onClick={() => acceptRecommendation("alternate")}
                    disabled={isAccepting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAccepting
                      ? "Processing..."
                      : "Accept Alternate Recommendation"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedAssetModal;
