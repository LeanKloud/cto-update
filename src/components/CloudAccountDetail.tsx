import React, { useState } from 'react';
import { ComputeResource, DetailCategory, SortOrder } from '../types';
import SearchAndFilters from './SearchAndFilters';
import ResourcesTable from './ResourcesTable';
import ComputeModal from './ComputeModal';
import { useComputeResources, useStorageResources, useDatabaseResources } from '../hooks/useApi';

interface CloudAccountDetailProps {
  cloudAccount: string;
  applicationName?: string;
  onBack: () => void;
  onComputeClick: (computeId: string) => void;
}

const CloudAccountDetail: React.FC<CloudAccountDetailProps> = ({
  cloudAccount,
  applicationName,
  onBack,
  onComputeClick
}) => {
  const [selectedDetailCategory, setSelectedDetailCategory] = useState<DetailCategory>('Compute');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedProvider, setSelectedProvider] = useState('All Providers');

  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showComputeModal, setShowComputeModal] = useState(false);
  const [selectedComputeId, setSelectedComputeId] = useState('');

  // Handle search navigation
  React.useEffect(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      
      // Check for exact cloud account search
      if (term === 'cloud account 1') {
        setSearchTerm('');
        const event = new CustomEvent('navigateToCloudAccountApps', { detail: { cloudAccount: 'Cloud Account 1' } });
        window.dispatchEvent(event);
        return;
      }
      if (term === 'cloud account 2') {
        setSearchTerm('');
        const event = new CustomEvent('navigateToCloudAccountApps', { detail: { cloudAccount: 'Cloud Account 2' } });
        window.dispatchEvent(event);
        return;
      }
      
      // Check for exact application search
      if (term === 'temp_core_01') {
        setSearchTerm('');
        const event = new CustomEvent('navigateToCloudAccountDetail', { detail: { cloudAccount: 'Cloud Account 1', applicationName: 'temp_core_01' } });
        window.dispatchEvent(event);
        return;
      }
      
      // Check for exact compute ID search
      if (term === 'vol-0707df985c67e6411') {
        setSearchTerm('');
        setSelectedComputeId('vol-0707df985c67e6411');
        setShowComputeModal(true);
        return;
      }
    }
  }, [searchTerm]);

  // Fetch data from API using the application name
  console.log('CloudAccountDetail - applicationName:', applicationName);
  
  const { data: computeData, loading: computeLoading, error: computeError } = useComputeResources(applicationName || '');
  const { data: storageData, loading: storageLoading, error: storageError } = useStorageResources(applicationName || '');
  const { data: databaseData, loading: databaseLoading, error: databaseError } = useDatabaseResources(applicationName || '');

  console.log('CloudAccountDetail - computeData:', computeData);
  console.log('CloudAccountDetail - storageData:', storageData);
  console.log('CloudAccountDetail - databaseData:', databaseData);

  // Extract resources from API data
  const computeResources: ComputeResource[] = computeData?.resources || [];
  const storageResources: ComputeResource[] = storageData?.resources || [];
  const databaseResources: ComputeResource[] = databaseData?.resources || [];

  // Get unique departments from all resources for filtering
  const allResources = [...computeResources, ...storageResources, ...databaseResources];
  const uniqueDepartments = [...new Set(allResources.map(r => r.department).filter(Boolean))].sort();

  const getCurrentResources = () => {
    let resources: ComputeResource[] = [];
    switch (selectedDetailCategory) {
      case 'Compute': resources = computeResources; break;
      case 'Storage': resources = storageResources; break;
      case 'Database': resources = databaseResources; break;
    }
    
    // Filter by department if selected
    if (selectedDepartment !== 'All Departments') {
      resources = resources.filter(r => r.department === selectedDepartment);
    }
    
    return resources;
  };

  const getCurrentLoading = () => {
    switch (selectedDetailCategory) {
      case 'Compute': return computeLoading;
      case 'Storage': return storageLoading;
      case 'Database': return databaseLoading;
    }
  };

  const getCurrentError = () => {
    switch (selectedDetailCategory) {
      case 'Compute': return computeError;
      case 'Storage': return storageError;
      case 'Database': return databaseError;
    }
  };

  const getSortOptions = () => {
    const baseOptions = [
      { value: 'spends', label: 'Spends' },
      { value: 'savings', label: 'Savings' },
      { value: 'potentialSavings', label: 'Potential Savings' },
      { value: 'efficiency', label: 'Efficiency' }
    ];

    switch (selectedDetailCategory) {
      case 'Compute':
        return [
          { value: 'computeType', label: 'Compute Type' },
          { value: 'computeId', label: 'Compute ID' },
          { value: 'currentServer', label: 'Current Server' },
          ...baseOptions,
          { value: 'department', label: 'Department' }
        ];
      case 'Storage':
        return [
          { value: 'computeType', label: 'Storage Type' },
          { value: 'computeId', label: 'Storage ID' },
          { value: 'currentServer', label: 'Current Tier' },
          ...baseOptions,
          { value: 'department', label: 'Department' }
        ];
      case 'Database':
        return [
          { value: 'computeType', label: 'Database Type' },
          { value: 'computeId', label: 'Database ID' },
          { value: 'currentServer', label: 'DB Engine' },
          ...baseOptions,
          { value: 'department', label: 'Department' }
        ];
    }
  };

  const handleComputeIdClick = (computeId: string) => {
    setSelectedComputeId(computeId);
    setShowComputeModal(true);
    onComputeClick(computeId);
  };

  const handleCloseComputeModal = () => {
    setShowComputeModal(false);
    setSelectedComputeId('');
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedDepartment('All Departments');
    setSelectedProvider('All Providers');

    setSortBy('');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  return (
    <>
      <div className="h-full overflow-y-auto">
        {/* Header with Back Button */}
        <div className="px-6 py-4" style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="text-slate-400 hover:text-white">
              ← Back
            </button>
            <h1 className="text-2xl font-semibold text-white">
              {cloudAccount} {applicationName ? `${applicationName} Assets` : '- Details'}
            </h1>
          </div>
        </div>

        {/* Service Categories */}
        <div style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }} className="px-6 py-4">
          <div className="flex space-x-8">
            {(['Compute', 'Storage', 'Database'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedDetailCategory(tab)}
                className={`pb-2 ${selectedDetailCategory === tab ? 'border-b-2 border-white' : ''}`}
              >
                <span className={`text-sm font-medium ${selectedDetailCategory === tab ? 'text-white' : 'text-slate-400'}`}>
                  {tab}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}

          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onReset={handleReset}
          setCurrentPage={setCurrentPage}
          placeholder="Search by type, ID, server..."
          sortOptions={getSortOptions()}
          hideProviderFilter={true}
          departments={uniqueDepartments}
        />

        {/* Resources Table */}
        {getCurrentLoading() ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-400">Loading {selectedDetailCategory.toLowerCase()} resources...</div>
          </div>
        ) : getCurrentError() ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-400">Error loading {selectedDetailCategory.toLowerCase()} resources: {getCurrentError()}</div>
          </div>
        ) : (
          <ResourcesTable
            resources={getCurrentResources()}
            category={selectedDetailCategory}
            searchTerm={searchTerm}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onResourceClick={handleComputeIdClick}
          />
        )}
      </div>

      {/* Compute Modal */}
      <ComputeModal
        isOpen={showComputeModal}
        onClose={handleCloseComputeModal}
        computeId={selectedComputeId}
      />
    </>
  );
};

export default CloudAccountDetail;