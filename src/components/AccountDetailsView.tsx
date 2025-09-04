import React from 'react';
import { ArrowLeft, Search, Filter, ChevronDown } from 'lucide-react';

interface AccountDetailsViewProps {
  accountId: string;
  onBack: () => void;
}

const AccountDetailsView: React.FC<AccountDetailsViewProps> = ({ accountId, onBack }) => {
  const applications = [
    {
      id: 'app-1',
      cloudAccount: 'Cloud Account 1',
      applicationName: 'Temp_Core_01',
      instanceId: 'i-de0b6b3a7640000',
      volumeId: 'vol-6124fee993bc0000',
      spends: '$700k',
      potentialSavings: '$700k',
      efficiency: '90%',
      department: 'Engineering',
      provider: 'AWS'
    },
    {
      id: 'app-2',
      cloudAccount: 'Cloud Account 1',
      applicationName: 'Temp_Core_04',
      instanceId: 'i-de0b6b3a7640000',
      volumeId: 'vol-6124fee993bc0000',
      spends: '$670k',
      potentialSavings: '$640k',
      efficiency: '81%',
      department: 'Finance',
      provider: 'AWS'
    },
    {
      id: 'app-3',
      cloudAccount: 'Cloud Account 1',
      applicationName: 'Temp_Core_07',
      instanceId: 'i-de0b6b3a7640000',
      volumeId: 'vol-6124fee993bc0000',
      spends: '$690k',
      potentialSavings: '$580k',
      efficiency: '90%',
      department: 'Product',
      provider: 'AWS'
    },
    {
      id: 'app-4',
      cloudAccount: 'Cloud Account 1',
      applicationName: 'Temp_Core_10',
      instanceId: 'i-de0b6b3a7640000',
      volumeId: 'vol-6124fee993bc0000',
      spends: '$660k',
      potentialSavings: '$660k',
      efficiency: '81%',
      department: 'Marketing',
      provider: 'AWS'
    },
    {
      id: 'app-5',
      cloudAccount: 'Cloud Account 1',
      applicationName: 'Temp_Core_13',
      instanceId: 'i-de0b6b3a7640000',
      volumeId: 'vol-6124fee993bc0000',
      spends: '$680k',
      potentialSavings: '$600k',
      efficiency: '90%',
      department: 'Operations',
      provider: 'AWS'
    },
    {
      id: 'app-6',
      cloudAccount: 'Cloud Account 1',
      applicationName: 'Temp_Core_16',
      instanceId: 'i-de0b6b3a7640000',
      volumeId: 'vol-6124fee993bc0000',
      spends: '$700k',
      potentialSavings: '$680k',
      efficiency: '81%',
      department: 'Sales',
      provider: 'AWS'
    },
    {
      id: 'app-7',
      cloudAccount: 'Cloud Account 1',
      applicationName: 'Temp_Core_19',
      instanceId: 'i-de0b6b3a7640000',
      volumeId: 'vol-6124fee993bc0000',
      spends: '$670k',
      potentialSavings: '$620k',
      efficiency: '90%',
      department: 'HR',
      provider: 'AWS'
    },
    {
      id: 'app-8',
      cloudAccount: 'Cloud Account 1',
      applicationName: 'Temp_Core_22',
      instanceId: 'i-de0b6b3a7640000',
      volumeId: 'vol-6124fee993bc0000',
      spends: '$690k',
      potentialSavings: '$700k',
      efficiency: '81%',
      department: 'Engineering',
      provider: 'AWS'
    },
    {
      id: 'app-9',
      cloudAccount: 'Cloud Account 1',
      applicationName: 'Temp_Core_25',
      instanceId: 'i-de0b6b3a7640000',
      volumeId: 'vol-6124fee993bc0000',
      spends: '$660k',
      potentialSavings: '$640k',
      efficiency: '90%',
      department: 'Finance',
      provider: 'AWS'
    },
    {
      id: 'app-10',
      cloudAccount: 'Cloud Account 1',
      applicationName: 'Temp_Core_28',
      instanceId: 'i-de0b6b3a7640000',
      volumeId: 'vol-6124fee993bc0000',
      spends: '$680k',
      potentialSavings: '$580k',
      efficiency: '81%',
      department: 'Product',
      provider: 'AWS'
    },
    {
      id: 'app-11',
      cloudAccount: 'Cloud Account 1',
      applicationName: 'Temp_Core_31',
      instanceId: 'i-de0b6b3a7640000',
      volumeId: 'vol-6124fee993bc0000',
      spends: '$700k',
      potentialSavings: '$660k',
      efficiency: '90%',
      department: 'Marketing',
      provider: 'AWS'
    },
    {
      id: 'app-12',
      cloudAccount: 'Cloud Account 1',
      applicationName: 'Temp_Core_34',
      instanceId: 'i-de0b6b3a7640000',
      volumeId: 'vol-6124fee993bc0000',
      spends: '$670k',
      potentialSavings: '$600k',
      efficiency: '81%',
      department: 'Operations',
      provider: 'AWS'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {accountId === 'ca-123' ? 'Cloud Account 1' : accountId} - Applications
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Application name, Instance ID"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>All Departments</option>
                <option>Engineering</option>
                <option>Finance</option>
                <option>Product</option>
                <option>Marketing</option>
                <option>Operations</option>
                <option>Sales</option>
                <option>HR</option>
              </select>
              
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>AWS</option>
                <option>Azure</option>
                <option>GCP</option>
              </select>
              
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>2025, Q1</option>
                <option>2024, Q4</option>
                <option>2024, Q3</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Sort by</option>
                  <option>Spends</option>
                  <option>Efficiency</option>
                  <option>Potential Savings</option>
                </select>
                
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Descending</option>
                  <option>Ascending</option>
                </select>
              </div>
              
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cloud Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instance ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spends
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Potential Savings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efficiency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app, index) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                        {app.cloudAccount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {app.applicationName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-sm">
                      {app.instanceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-sm">
                      {app.volumeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                      {app.spends}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                      {app.potentialSavings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        parseInt(app.efficiency) >= 85 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {app.efficiency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {app.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {app.provider}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing 1 to 12 of 30 results
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  1
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  2
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  3
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailsView;