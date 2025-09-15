import React, { useState } from 'react';
import { ComputeResource, DetailCategory, SortOrder } from '../types';
import SearchAndFilters from './SearchAndFilters';
import ResourcesTable from './ResourcesTable';
import ComputeModal from './ComputeModal';

interface CloudAccountDetailProps {
  cloudAccount: string;
  onBack: () => void;
  onComputeClick: (computeId: string) => void;
}

const CloudAccountDetail: React.FC<CloudAccountDetailProps> = ({
  cloudAccount,
  onBack,
  onComputeClick
}) => {
  const [selectedDetailCategory, setSelectedDetailCategory] = useState<DetailCategory>('Compute');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedProvider, setSelectedProvider] = useState('All Providers');
  const [selectedPeriod, setSelectedPeriod] = useState('2025, Q1');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showComputeModal, setShowComputeModal] = useState(false);
  const [selectedComputeId, setSelectedComputeId] = useState('');

  // Mock data for different resource types
  const computeResources: ComputeResource[] = [
    { computeType: 'Lambda', computeId: 'vol-0707df985c67e6411', currentServer: 't3a.medium', spends: '$700k', savings: '$700k', potentialSavings: '$700k', efficiency: '90%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
    { computeType: 'Lambda', computeId: 'vol-0707df985c67e6411', currentServer: 't3a.medium', spends: '$700k', savings: '$700k', potentialSavings: '', efficiency: '90%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
    { computeType: 'Virtual Machines', computeId: 'vol-0707df985c67e6411', currentServer: 't3a.medium', spends: '$700k', savings: '$700k', potentialSavings: '$700k', efficiency: '90%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
    { computeType: 'Virtual desktop (Serverless)', computeId: 'vol-0707df985c67e6411', currentServer: 't3a.medium', spends: '$700k', savings: '$700k', potentialSavings: '$700k', efficiency: '90%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
  ];

  const storageResources: ComputeResource[] = [
    { computeType: 'S3 Bucket', computeId: 'bucket-app-logs', currentServer: 'Standard', spends: '$120k', savings: '$30k', potentialSavings: '$40k', efficiency: '75%' },
    { computeType: 'EBS Volume', computeId: 'vol-0a1b2c3d4e5f6g7h', currentServer: 'Standard', spends: '$90k', savings: '$15k', potentialSavings: '$20k', efficiency: '70%' },
    { computeType: 'EFS', computeId: 'fs-0a1b2c3d', currentServer: 'General Purpose', spends: '$60k', savings: '$10k', potentialSavings: '$15k', efficiency: '68%' },
  ];

  const databaseResources: ComputeResource[] = [
    { computeType: 'RDS (PostgreSQL)', computeId: 'db-analytics-01', currentServer: 'db.m6g.large', spends: '$300k', savings: '$80k', potentialSavings: '$50k', efficiency: '78%', dbType: 'rds' },
    { computeType: 'RDS (MySQL)', computeId: 'db-core-01', currentServer: 'db.t4g.large', spends: '$180k', savings: '$25k', potentialSavings: '$30k', efficiency: '72%', dbType: 'rds' },
    { computeType: 'Aurora', computeId: 'aurora-cluster-01', currentServer: 'r6g.large', spends: '$400k', savings: '$120k', potentialSavings: '$70k', efficiency: '85%', dbType: 'vcore' },
  ];

  const getCurrentResources = () => {
    switch (selectedDetailCategory) {
      case 'Compute': return computeResources;
      case 'Storage': return storageResources;
      case 'Database': return databaseResources;
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
          ...baseOptions
        ];
      case 'Storage':
        return [
          { value: 'computeType', label: 'Storage Type' },
          { value: 'computeId', label: 'Storage ID' },
          { value: 'currentServer', label: 'Current Tier' },
          ...baseOptions
        ];
      case 'Database':
        return [
          { value: 'computeType', label: 'Database Type' },
          { value: 'computeId', label: 'Database ID' },
          { value: 'currentServer', label: 'DB Engine' },
          ...baseOptions
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
    setSelectedPeriod('2025, Q1');
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
              {cloudAccount} - Details
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
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onReset={handleReset}
          setCurrentPage={setCurrentPage}
          placeholder="Search by type, ID, server..."
          sortOptions={getSortOptions()}
        />

        {/* Resources Table */}
        <ResourcesTable
          resources={getCurrentResources()}
          category={selectedDetailCategory}
          searchTerm={searchTerm}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onResourceClick={handleComputeIdClick}
        />
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