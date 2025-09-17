import React, { useState } from 'react';
import { useDashboardSummary, useCloudAccounts, useAlerts } from '../../hooks/useApi';

// Example component demonstrating API usage
const ApiUsageExample: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2025, Q1');
  const [selectedProvider, setSelectedProvider] = useState('');

  // Using the custom hooks
  const { 
    data: dashboardData, 
    loading: dashboardLoading, 
    error: dashboardError 
  } = useDashboardSummary(selectedPeriod);

  const { 
    data: cloudAccountsData, 
    loading: accountsLoading, 
    error: accountsError 
  } = useCloudAccounts({
    provider: selectedProvider || undefined,
    page: 1,
    limit: 5
  });

  const { 
    data: alertsData, 
    loading: alertsLoading, 
    error: alertsError 
  } = useAlerts({
    severity: 'critical',
    limit: 3
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">API Usage Example</h1>
      
      {/* Controls */}
      <div className="flex space-x-4">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="2025, Q1">2025, Q1</option>
          <option value="2024, Q4">2024, Q4</option>
          <option value="2024, Q3">2024, Q3</option>
        </select>
        
        <select
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Providers</option>
          <option value="AWS">AWS</option>
          <option value="Azure">Azure</option>
          <option value="GCP">GCP</option>
        </select>
      </div>

      {/* Dashboard Summary */}
      <div className="bg-gray-800 p-4 rounded">
        <h2 className="text-lg font-semibold text-white mb-3">Dashboard Summary</h2>
        {dashboardLoading && <p className="text-gray-400">Loading dashboard data...</p>}
        {dashboardError && <p className="text-red-400">Error: {dashboardError}</p>}
        {dashboardData && (
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{dashboardData.totalCloudAccounts}</div>
              <div className="text-sm text-gray-400">Cloud Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{dashboardData.totalVirtualMachines.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Virtual Machines</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">${dashboardData.monthlySpend.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Monthly Spend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{dashboardData.efficiency}%</div>
              <div className="text-sm text-gray-400">Efficiency</div>
            </div>
          </div>
        )}
      </div>

      {/* Cloud Accounts */}
      <div className="bg-gray-800 p-4 rounded">
        <h2 className="text-lg font-semibold text-white mb-3">Cloud Accounts</h2>
        {accountsLoading && <p className="text-gray-400">Loading cloud accounts...</p>}
        {accountsError && <p className="text-red-400">Error: {accountsError}</p>}
        {cloudAccountsData && (
          <div className="space-y-2">
            {cloudAccountsData.accounts.map((account: any) => (
              <div key={account.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                <div>
                  <div className="text-white font-medium">{account.cloudAccount}</div>
                  <div className="text-sm text-gray-400">{account.provider} • {account.department}</div>
                </div>
                <div className="text-right">
                  <div className="text-white">{account.totalSpends}</div>
                  <div className="text-sm text-green-400">{account.efficiency} efficiency</div>
                </div>
              </div>
            ))}
            <div className="text-sm text-gray-400 mt-2">
              Showing {cloudAccountsData.accounts.length} of {cloudAccountsData.pagination.total} accounts
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      <div className="bg-gray-800 p-4 rounded">
        <h2 className="text-lg font-semibold text-white mb-3">Critical Alerts</h2>
        {alertsLoading && <p className="text-gray-400">Loading alerts...</p>}
        {alertsError && <p className="text-red-400">Error: {alertsError}</p>}
        {alertsData && (
          <div className="space-y-2">
            {alertsData.map((alert: any) => (
              <div key={alert.id} className="p-3 bg-red-900 border border-red-700 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-white font-medium">{alert.title}</div>
                    <div className="text-sm text-red-200 mt-1">{alert.message}</div>
                    <div className="text-xs text-red-300 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                    {alert.severity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiUsageExample;