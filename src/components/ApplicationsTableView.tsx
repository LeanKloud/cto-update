import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, ChevronDown } from 'lucide-react';

interface ApplicationsTableViewProps {
  onBack: () => void;
  onCloudAccountClick: (accountId: string) => void;
}

const ApplicationsTableView: React.FC<ApplicationsTableViewProps> = ({ onBack, onCloudAccountClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('All Providers');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  
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

  const handleCloudAccountClick = (accountName: string) => {
    onCloudAccountClick(accountName);
  };

  // Generate more applications to show full dataset
  const allApplications = [
    ...applications,
    ...Array(18).fill(null).map((_, index) => ({
      id: `app-${13 + index}`,
      cloudAccount: `Cloud Account ${Math.floor((index % 10) + 1)}`,
      applicationName: `Temp_Core_${String(35 + index).padStart(2, '0')}`,
      instanceId: 'i-de0b6b3a7640000',
      volumeId: 'vol-6124fee993bc0000',
      spends: `$${680 - (index % 8) * 10}k`,
      potentialSavings: `$${680 - (index % 9) * 15}k`,
      efficiency: `${85 - (index % 7) * 2}%`,
      department: ['Engineering', 'Finance', 'Product', 'Marketing', 'Operations', 'Sales', 'HR'][index % 7],
      provider: 'AWS'
    }))
  ];

  // Filter and sort applications
  const filteredApplications = allApplications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.applicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.instanceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = selectedProvider === 'All Providers' || app.provider === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  const sortedApplications = sortBy ? [...filteredApplications].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case 'applicationName':
        aVal = a.applicationName;
        bVal = b.applicationName;
        break;
      case 'spends':
        aVal = parseFloat(a.spends.replace(/[$,k]/g, ''));
        bVal = parseFloat(b.spends.replace(/[$,k]/g, ''));
        break;
      case 'potentialSavings':
        aVal = parseFloat(a.potentialSavings.replace(/[$,k]/g, ''));
        bVal = parseFloat(b.potentialSavings.replace(/[$,k]/g, ''));
        break;
      case 'efficiency':
        aVal = parseFloat(a.efficiency.replace('%', ''));
        bVal = parseFloat(b.efficiency.replace('%', ''));
        break;
      case 'department':
        aVal = a.department;
        bVal = b.department;
        break;
      default:
        return 0;
    }
    if (typeof aVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  }) : filteredApplications;

  // Pagination
  const totalPages = Math.ceil(sortedApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplications = sortedApplications.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Application name, Instance ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select 
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>All Providers</option>
            <option>AWS</option>
            <option>Azure</option>
            <option>GCP</option>
          </select>
          
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sort by</option>
            <option value="applicationName">Application Name</option>
            <option value="spends">Spends</option>
            <option value="potentialSavings">Potential Savings</option>
            <option value="efficiency">Efficiency</option>
            <option value="department">Department</option>
          </select>
          
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedProvider('All Providers');
              setSortBy('');
              setSortOrder('desc');
              setCurrentPage(1);
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Reset Filters
          </button>
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
                {currentApplications.map((app, index) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleCloudAccountClick(app.cloudAccount)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium hover:underline transition-colors"
                      >
                        {app.cloudAccount}
                      </button>
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
                      <span className={`font-semibold ${
                        parseInt(app.efficiency) >= 85 ? 'text-green-600' : 'text-yellow-600'
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
                Showing {startIndex + 1} to {Math.min(endIndex, sortedApplications.length)} of {sortedApplications.length} results
              </div>
              <div className="flex items-center space-x-2">
                {currentPage > 1 && (
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    ←
                  </button>
                )}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {currentPage < totalPages && (
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsTableView;