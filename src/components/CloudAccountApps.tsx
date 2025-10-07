import React, { useState } from 'react';
import { Search, ChevronDown, Filter } from 'lucide-react';
import { ApplicationData } from '../types';
import { useApplications } from '../hooks/useApi';
import ComputeModal from './ComputeModal';

interface CloudAccountAppsProps {
  selectedAccount: string;
  onBack: () => void;
  onApplicationClick: (applicationName: string) => void;
}

const CloudAccountApps: React.FC<CloudAccountAppsProps> = ({
  selectedAccount,
  onBack,
  onApplicationClick
}) => {
  const [appsSearchTerm, setAppsSearchTerm] = useState('');
  const [appsSelectedProvider, setAppsSelectedProvider] = useState('All Providers');

  const [appsSortBy, setAppsSortBy] = useState('Sort by');
  const [appsSortOrder, setAppsSortOrder] = useState('Descending');
  const [selectedComputeId, setSelectedComputeId] = useState('');
  const [showComputeModal, setShowComputeModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Handle search navigation
  React.useEffect(() => {
    if (appsSearchTerm.trim()) {
      const term = appsSearchTerm.trim().toLowerCase();
      
      // Check for exact cloud account search
      if (term === 'cloud account 1') {
        setAppsSearchTerm('');
        const event = new CustomEvent('navigateToCloudAccountApps', { detail: { cloudAccount: 'Cloud Account 1' } });
        window.dispatchEvent(event);
        return;
      }
      if (term === 'cloud account 2') {
        setAppsSearchTerm('');
        const event = new CustomEvent('navigateToCloudAccountApps', { detail: { cloudAccount: 'Cloud Account 2' } });
        window.dispatchEvent(event);
        return;
      }
      
      // Check for exact application search
      if (term === 'temp_core_01') {
        setAppsSearchTerm('');
        setTimeout(() => {
          const event = new CustomEvent('navigateToCloudAccountDetail', { detail: { cloudAccount: 'Cloud Account 1', applicationName: 'Temp_Core_01' } });
          window.dispatchEvent(event);
        }, 100);
        return;
      }
      
      // Check for exact compute ID search
      if (term === 'vol-0707df985c67e6411') {
        setAppsSearchTerm('');
        setSelectedComputeId('vol-0707df985c67e6411');
        setShowComputeModal(true);
        return;
      }
    }
  }, [appsSearchTerm]);

  // Fetch applications data
  console.log('CloudAccountApps - selectedAccount:', selectedAccount);
  const { data: applicationsData, loading, error } = useApplications({
    cloudAccount: selectedAccount
  });
  console.log('CloudAccountApps - applicationsData:', applicationsData, 'loading:', loading, 'error:', error);
  const applicationData = applicationsData?.applications || [];
  console.log('CloudAccountApps - applicationData array:', applicationData, 'length:', applicationData.length);

  const handleReset = () => {
    setAppsSearchTerm('');
    setAppsSelectedProvider('All Providers');

    setAppsSortBy('Sort by');
    setAppsSortOrder('Descending');
    setCurrentPage(1);
  };

  // Filter applications
  const filteredApps = applicationData.filter(app => {
    const matchesSearch = appsSearchTerm === '' || 
      app.applicationName.toLowerCase().includes(appsSearchTerm.toLowerCase());
    

    
    const matchesProvider = appsSelectedProvider === 'All Providers' || app.provider === appsSelectedProvider;
    
    return matchesSearch && matchesProvider;
  });
  
  console.log('Filtered apps count:', filteredApps.length, 'from total:', applicationData.length);

  // Sort applications
  const sortedApps = appsSortBy !== 'Sort by' 
    ? [...filteredApps].sort((a, b) => {
        let aVal, bVal;
        
        switch (appsSortBy) {
          case 'Application Name':
            aVal = a.applicationName;
            bVal = b.applicationName;
            break;
          case 'Spends':
            aVal = parseFloat(a.spends.replace(/[$,k]/g, ''));
            bVal = parseFloat(b.spends.replace(/[$,k]/g, ''));
            break;
          case 'Potential Savings':
            aVal = parseFloat(a.potentialSavings.replace(/[$,k]/g, ''));
            bVal = parseFloat(b.potentialSavings.replace(/[$,k]/g, ''));
            break;
          case 'Efficiency':
            aVal = parseFloat(a.efficiency.replace('%', ''));
            bVal = parseFloat(b.efficiency.replace('%', ''));
            break;

          default:
            return 0;
        }
        
        if (typeof aVal === 'string') {
          return appsSortOrder === 'Ascending' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        } else {
          return appsSortOrder === 'Ascending' ? aVal - bVal : bVal - aVal;
        }
      })
    : filteredApps;

  // Pagination
  const totalPages = Math.ceil(sortedApps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApps = sortedApps.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4" style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-slate-400 hover:text-white">
            ← Back
          </button>
          <h1 className="text-2xl font-semibold text-white">{selectedAccount} - Applications</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4" style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Application name"
              value={appsSearchTerm}
              onChange={(e) => setAppsSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-white placeholder-slate-400"
              style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
            />
          </div>
          

          <div className="relative">
            <select
              value={appsSelectedProvider}
              onChange={(e) => setAppsSelectedProvider(e.target.value)}
              className="appearance-none px-3 py-2 pr-8 rounded-lg text-white"
              style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
            >
              <option value="All Providers">All Providers</option>
              <option value="AWS">AWS</option>
              <option value="Azure">Azure</option>
              <option value="GCP">GCP</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          

          <div className="relative">
            <select
              value={appsSortBy}
              onChange={(e) => setAppsSortBy(e.target.value)}
              className="appearance-none px-3 py-2 pr-8 rounded-lg text-white"
              style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
            >
              <option>Sort by</option>
              <option>Application Name</option>
              <option>Spends</option>
              <option>Potential Savings</option>
              <option>Efficiency</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          
          <button
            onClick={() => setAppsSortOrder(appsSortOrder === 'Ascending' ? 'Descending' : 'Ascending')}
            className="flex items-center px-3 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
          >
            <Filter className="h-4 w-4 mr-2" />
            {appsSortOrder}
          </button>
          
          <button
            onClick={handleReset}
            className="px-3 py-2 text-slate-400 hover:text-white"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="p-6">
        {loading ? (
          <div className="text-center text-slate-400 py-8">Loading applications...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-8">Error loading applications: {error}</div>
        ) : (
          <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
          <table className="w-full">
            <thead style={{ backgroundColor: '#334155' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Cloud Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Application Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Spends</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Potential Savings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Efficiency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#334155' }}>
              {currentApps.map((app, index) => (
                <tr key={index} className="hover:opacity-80">
                  <td className="px-6 py-4 text-sm text-white">{selectedAccount}</td>
                  <td className="px-6 py-4 text-sm text-blue-400 cursor-pointer hover:text-blue-300" onClick={() => onApplicationClick(app.applicationName)}>
                    {app.applicationName}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">{app.spends}</td>
                  <td className="px-6 py-4 text-sm text-green-400 font-semibold">{app.potentialSavings}</td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">{app.efficiency}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{app.provider}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3" style={{ backgroundColor: '#334155', borderTop: '1px solid #475569' }}>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedApps.length)} of {sortedApps.length} results
              </div>
              <div className="flex items-center space-x-2">
                {currentPage > 1 && (
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-3 py-1 text-sm text-slate-400 hover:text-white"
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
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {currentPage < totalPages && (
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-3 py-1 text-sm text-slate-400 hover:text-white"
                  >
                    →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Compute Modal */}
      <ComputeModal
        isOpen={showComputeModal}
        onClose={() => setShowComputeModal(false)}
        computeId={selectedComputeId}
      />
    </div>
  );
};

export default CloudAccountApps;