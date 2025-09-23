import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Server, Database, HardDrive, Activity, Bell, Eye, EyeOff } from 'lucide-react';
import { useDashboardSummary, useAlerts, useRecommendations, useTrends, useAttentionData, useSpotUtilization } from '../hooks/useApi';

interface DashboardProps {
  onViewApplications: () => void;
  onViewAccountDetails: (accountId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewApplications, onViewAccountDetails }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('2025, Q1');
  const [selectedCategory, setSelectedCategory] = useState<'usage-cost' | 'disk-utilisation' | 'idle-instances'>('usage-cost');
  const [showSavingsDetails, setShowSavingsDetails] = useState<{ [key: number]: boolean }>({});

  // API hooks
  const { data: dashboardData, loading: dashboardLoading } = useDashboardSummary({ period: selectedPeriod });
  const { data: alertsData, loading: alertsLoading } = useAlerts({ severity: 'critical', limit: 5 });
  const { data: recommendationsData, loading: recommendationsLoading } = useRecommendations({ limit: 3 });
  const { data: trendsData, loading: trendsLoading } = useTrends({ period: selectedPeriod, type: 'spends' });
  const { data: attentionData, loading: attentionLoading } = useAttentionData({ category: selectedCategory });
  const { data: spotData, loading: spotLoading } = useSpotUtilization();

  // Dark theme color palette
  const darkThemeColors = {
    // Primary data series colors
    primary: '#60A5FA',      // Light blue
    secondary: '#34D399',    // Light green
    tertiary: '#A78BFA',     // Light purple
    quaternary: '#FBBF24',   // Light amber
    
    // Chart specific colors
    savings: '#10B981',      // Emerald green for savings
    costs: '#EF4444',        // Red for costs/spends
    efficiency: '#8B5CF6',   // Purple for efficiency
    
    // Background and UI colors
    chartBackground: '#1E293B', // Slate 800
    gridLines: '#475569',    // Slate 600
    textPrimary: '#F1F5F9',  // Slate 100
    textSecondary: '#CBD5E1', // Slate 300
    
    // Status colors
    success: '#10B981',      // Emerald 500
    warning: '#F59E0B',      // Amber 500
    danger: '#EF4444',       // Red 500
    info: '#3B82F6',         // Blue 500
  };

  // Mock data with updated structure
  const trendsChartData = trendsData ? 
    trendsData.quarters.map((quarter: string, index: number) => ({
      quarter,
      spends: Object.values(trendsData.data).reduce((sum: number, accountData: any) => sum + (accountData[index] || 0), 0),
      savings: Object.values(trendsData.data).reduce((sum: number, accountData: any) => sum + ((accountData[index] || 0) * 0.8), 0)
    })) : [];

  const instanceBreakdownData = [
    { name: 'Virtual Machines', value: 45, color: darkThemeColors.primary },
    { name: 'Containers', value: 30, color: darkThemeColors.secondary },
    { name: 'Serverless', value: 15, color: darkThemeColors.tertiary },
    { name: 'Databases', value: 10, color: darkThemeColors.quaternary }
  ];

  const spotUtilizationData = spotData?.map((item: any) => ({
    account: `Account ${item.account}`,
    onDemand: item.onDemand,
    spot: item.spot,
    savings: item.savings
  })) || [];

  const toggleSavingsDetails = (accountIndex: number) => {
    setShowSavingsDetails(prev => ({
      ...prev,
      [accountIndex]: !prev[accountIndex]
    }));
  };

  // Custom tooltip component for dark theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg shadow-lg p-3 border" 
             style={{ 
               backgroundColor: '#1E293B', 
               borderColor: '#475569',
               color: darkThemeColors.textPrimary 
             }}>
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: '#0F172A' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-slate-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full" style={{ backgroundColor: '#0F172A' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Cloud Cost Dashboard</h1>
          <p className="text-slate-400 mt-1">Monitor and optimize your cloud infrastructure costs</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#1E293B', border: '1px solid #475569' }}
          >
            <option value="2025, Q1">2025, Q1</option>
            <option value="2024, Q4">2024, Q4</option>
            <option value="2024, Q3">2024, Q3</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Server className="h-8 w-8" style={{ color: darkThemeColors.primary }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Cloud Accounts</p>
              <p className="text-2xl font-semibold text-white">{dashboardData?.totalCloudAccounts || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8" style={{ color: darkThemeColors.secondary }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Virtual Machines</p>
              <p className="text-2xl font-semibold text-white">{dashboardData?.totalVirtualMachines?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8" style={{ color: darkThemeColors.costs }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Monthly Spend</p>
              <p className="text-2xl font-semibold text-white">${dashboardData?.monthlySpend?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8" style={{ color: darkThemeColors.savings }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Potential Savings</p>
              <p className="text-2xl font-semibold text-white">${dashboardData?.potentialSavings?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spends and Savings Trends Chart */}
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
          <h3 className="text-lg font-semibold text-white mb-4">Spends & Savings Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkThemeColors.gridLines} />
              <XAxis 
                dataKey="quarter" 
                stroke={darkThemeColors.textSecondary}
                fontSize={12}
              />
              <YAxis 
                stroke={darkThemeColors.textSecondary}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="spends" 
                stroke={darkThemeColors.costs}
                strokeWidth={3}
                dot={{ fill: darkThemeColors.costs, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: darkThemeColors.costs, strokeWidth: 2 }}
                name="Spends"
              />
              <Line 
                type="monotone" 
                dataKey="savings" 
                stroke={darkThemeColors.savings}
                strokeWidth={3}
                dot={{ fill: darkThemeColors.savings, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: darkThemeColors.savings, strokeWidth: 2 }}
                name="Savings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Instance Breakdown Pie Chart */}
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
          <h3 className="text-lg font-semibold text-white mb-4">Instance Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={instanceBreakdownData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                fontSize={12}
              >
                {instanceBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke={darkThemeColors.chartBackground} strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {instanceBreakdownData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-slate-300">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spot Utilization Chart */}
      <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Spot Instance Utilization & Savings</h3>
          <button
            onClick={onViewApplications}
            className="text-sm px-4 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: '#3B82F6', 
              color: 'white',
            }}
          >
            View Details
          </button>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={spotUtilizationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkThemeColors.gridLines} />
            <XAxis 
              dataKey="account" 
              stroke={darkThemeColors.textSecondary}
              fontSize={12}
            />
            <YAxis 
              stroke={darkThemeColors.textSecondary}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="onDemand" 
              fill={darkThemeColors.costs}
              name="On-Demand Cost"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="spot" 
              fill={darkThemeColors.primary}
              name="Spot Cost"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="savings" 
              fill={darkThemeColors.savings}
              name="Savings"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Expandable savings details */}
        <div className="mt-6 space-y-2">
          {spotUtilizationData.slice(0, 3).map((item: any, index: number) => (
            <div key={index} className="border rounded-lg" style={{ borderColor: '#334155' }}>
              <button
                onClick={() => toggleSavingsDetails(index)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:opacity-80"
                style={{ backgroundColor: '#334155' }}
              >
                <span className="text-white font-medium">{item.account} Savings Details</span>
                {showSavingsDetails[index] ? (
                  <EyeOff className="h-4 w-4 text-slate-400" />
                ) : (
                  <Eye className="h-4 w-4 text-slate-400" />
                )}
              </button>
              {showSavingsDetails[index] && (
                <div className="p-4 space-y-2" style={{ backgroundColor: '#1E293B' }}>
                  <div className="flex justify-between">
                    <span className="text-slate-300">On-Demand Cost:</span>
                    <span className="text-white font-semibold">${item.onDemand?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Spot Cost:</span>
                    <span className="text-white font-semibold">${item.spot?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Total Savings:</span>
                    <span className="font-semibold" style={{ color: darkThemeColors.savings }}>
                      ${item.savings?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Savings Percentage:</span>
                    <span className="font-semibold" style={{ color: darkThemeColors.savings }}>
                      {item.onDemand > 0 ? ((item.savings / item.onDemand) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alerts and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
            <Bell className="h-5 w-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {alertsData?.slice(0, 3).map((alert: any) => (
              <div key={alert.id} className="p-3 rounded-lg border-l-4" 
                   style={{ 
                     backgroundColor: '#334155',
                     borderLeftColor: alert.severity === 'critical' ? darkThemeColors.danger : darkThemeColors.warning
                   }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{alert.title}</p>
                    <p className="text-xs text-slate-300 mt-1">{alert.message}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <AlertTriangle 
                    className="h-4 w-4 ml-2" 
                    style={{ color: alert.severity === 'critical' ? darkThemeColors.danger : darkThemeColors.warning }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Cost Optimization</h3>
            <TrendingUp className="h-5 w-5" style={{ color: darkThemeColors.savings }} />
          </div>
          <div className="space-y-3">
            {recommendationsData?.map((rec: any) => (
              <div key={rec.id} className="p-3 rounded-lg" style={{ backgroundColor: '#334155' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{rec.title}</p>
                    <p className="text-xs text-slate-300 mt-1">{rec.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-slate-400">
                        {rec.affectedResources} resources
                      </span>
                      {rec.potentialSavings !== '$0' && (
                        <span className="text-xs font-medium" style={{ color: darkThemeColors.savings }}>
                          Save {rec.potentialSavings}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    rec.priority === 'high' ? 'bg-red-900 text-red-200' :
                    rec.priority === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                    'bg-blue-900 text-blue-200'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attention Required Section */}
      <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Attention Required</h3>
          <div className="flex space-x-2">
            {(['usage-cost', 'disk-utilisation', 'idle-instances'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedCategory === category 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
                style={{ 
                  backgroundColor: selectedCategory === category ? '#3B82F6' : '#334155'
                }}
              >
                {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: '#334155' }}>
                <th className="text-left py-2 text-sm font-medium text-slate-400">Cloud Account</th>
                <th className="text-left py-2 text-sm font-medium text-slate-400">Application</th>
                <th className="text-left py-2 text-sm font-medium text-slate-400">
                  {selectedCategory === 'usage-cost' ? 'Compute Usage' : 
                   selectedCategory === 'disk-utilisation' ? 'Disk Usage' : 'Idle Instances'}
                </th>
                <th className="text-left py-2 text-sm font-medium text-slate-400">Spends</th>
                <th className="text-left py-2 text-sm font-medium text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {attentionData?.slice(0, 5).map((item: any, index: number) => (
                <tr key={index} className="border-b" style={{ borderColor: '#334155' }}>
                  <td className="py-3 text-sm text-white">{item.cloudAccount}</td>
                  <td className="py-3 text-sm text-blue-400 cursor-pointer hover:text-blue-300">
                    {item.applicationName}
                  </td>
                  <td className="py-3 text-sm text-white">
                    {selectedCategory === 'usage-cost' ? `${item.computeUsage}%` :
                     selectedCategory === 'disk-utilisation' ? `${item.diskUtilisation}%` :
                     `${item.idleInstances} instances`}
                  </td>
                  <td className="py-3 text-sm text-white font-semibold">
                    ${item.spends?.toLocaleString()}
                  </td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.status === 'active' ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;