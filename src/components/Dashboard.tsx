import React, { useState } from 'react';
import { 
  Cloud, 
  Server, 
  Database, 
  HardDrive, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Building,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface DashboardProps {
  onViewAllApplications: () => void;
  onCloudAccountClick: (accountId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewAllApplications, onCloudAccountClick }) => {
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const cloudAccounts = [
    {
      id: 'ca-123',
      cloudAccount: 'Cloud Account 1',
      applications: 45,
      vms: 120,
      storage: 8,
      totalSpends: '$2.4M',
      totalSavings: '$180K',
      potentialSavings: '$320K',
      efficiency: '85%',
      provider: 'AWS',
      department: 'Engineering'
    },
    {
      id: 'ca-124',
      cloudAccount: 'Cloud Account 2',
      applications: 32,
      vms: 85,
      storage: 6,
      totalSpends: '$1.8M',
      totalSavings: '$120K',
      potentialSavings: '$250K',
      efficiency: '78%',
      provider: 'Azure',
      department: 'Finance'
    },
    {
      id: 'ca-125',
      cloudAccount: 'Cloud Account 3',
      applications: 28,
      vms: 95,
      storage: 5,
      totalSpends: '$1.6M',
      totalSavings: '$95K',
      potentialSavings: '$180K',
      efficiency: '82%',
      provider: 'GCP',
      department: 'Product'
    },
    {
      id: 'ca-126',
      cloudAccount: 'Cloud Account 4',
      applications: 38,
      vms: 110,
      storage: 7,
      totalSpends: '$2.1M',
      totalSavings: '$150K',
      potentialSavings: '$290K',
      efficiency: '80%',
      provider: 'AWS',
      department: 'Marketing'
    },
    {
      id: 'ca-127',
      cloudAccount: 'Cloud Account 5',
      applications: 25,
      vms: 70,
      storage: 4,
      totalSpends: '$1.3M',
      totalSavings: '$80K',
      potentialSavings: '$160K',
      efficiency: '88%',
      provider: 'Azure',
      department: 'Operations'
    }
  ];

  const allAlerts = [
    {
      id: 1,
      type: 'budget_exceed',
      severity: 'high',
      message: 'Engineering department exceeded monthly budget by 15%',
      timestamp: '2 hours ago',
      icon: AlertTriangle,
      color: 'text-red-500'
    },
    {
      id: 2,
      type: 'efficiency_low',
      severity: 'medium',
      message: 'Cloud Account 2 efficiency dropped below 80%',
      timestamp: '4 hours ago',
      icon: TrendingDown,
      color: 'text-yellow-500'
    },
    {
      id: 3,
      type: 'unused_resource',
      severity: 'medium',
      message: '5 unused storage volumes detected in AWS',
      timestamp: '6 hours ago',
      icon: HardDrive,
      color: 'text-yellow-500'
    },
    {
      id: 4,
      type: 'cost_spike',
      severity: 'high',
      message: 'Unexpected 25% cost increase in GCP compute resources',
      timestamp: '8 hours ago',
      icon: TrendingUp,
      color: 'text-red-500'
    },
    {
      id: 5,
      type: 'security',
      severity: 'high',
      message: 'Security group misconfiguration detected',
      timestamp: '12 hours ago',
      icon: XCircle,
      color: 'text-red-500'
    },
    {
      id: 6,
      type: 'maintenance',
      severity: 'low',
      message: 'Scheduled maintenance for Cloud Account 3',
      timestamp: '1 day ago',
      icon: Clock,
      color: 'text-blue-500'
    }
  ];

  const displayedAlerts = showAllAlerts ? allAlerts : allAlerts.slice(0, 2);

  const handleCloudAccountClick = (accountId: string) => {
    onCloudAccountClick(accountId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CTO Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor and optimize your cloud infrastructure costs
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-900">2 minutes ago</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Spends</p>
                <p className="text-2xl font-bold text-gray-900">$9.2M</p>
                <p className="text-sm text-green-600">+8% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Savings</p>
                <p className="text-2xl font-bold text-gray-900">$625K</p>
                <p className="text-sm text-blue-600">+12% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Potential Savings</p>
                <p className="text-2xl font-bold text-gray-900">$1.2M</p>
                <p className="text-sm text-yellow-600">Available to optimize</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Efficiency</p>
                <p className="text-2xl font-bold text-gray-900">83%</p>
                <p className="text-sm text-green-600">+3% from last month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cloud Accounts Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Cloud Accounts</h2>
                  <button
                    onClick={onViewAllApplications}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    View All Applications →
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cloud Account
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applications
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        VMs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Storage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Spends
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Savings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Potential Savings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Efficiency
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cloudAccounts.map((account) => (
                      <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleCloudAccountClick(account.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                          >
                            {account.cloudAccount}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {account.applications}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {account.vms}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {account.storage} TB
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                          {account.totalSpends}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                          {account.totalSavings}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-yellow-600 font-semibold">
                          {account.potentialSavings}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-semibold ${
                            parseInt(account.efficiency) >= 85 ? 'text-green-600' : 
                            parseInt(account.efficiency) >= 80 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {account.efficiency}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Alerts & Notifications */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Alerts & Notifications
                  </h2>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {allAlerts.filter(alert => alert.severity === 'high').length} High
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {displayedAlerts.map((alert) => {
                    const IconComponent = alert.icon;
                    return (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <IconComponent className={`w-5 h-5 mt-0.5 ${alert.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {alert.timestamp}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {allAlerts.length > 2 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowAllAlerts(!showAllAlerts)}
                      className="w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors py-2 rounded-lg hover:bg-blue-50"
                    >
                      {showAllAlerts ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>Show Less</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>View All ({allAlerts.length - 2} more)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cloud className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Total Accounts</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Server className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Total Applications</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">168</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-600">Total VMs</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">480</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">Total Storage</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">30 TB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;