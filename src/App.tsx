import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Layers, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  Settings, 
  User,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Filter
} from 'lucide-react';
import Dashboard from './components/Dashboard';

import ApplicationsTableView from './components/ApplicationsTableView';

interface ApplicationData {
  cloudAccount: string;
  applicationName: string;
  instanceId: string;
  volumeId: string;
  spends: string;
  potentialSavings: string;
  efficiency: string;
  department: string;
  provider: 'AWS' | 'Azure' | 'GCP';
}

interface ComputeResource {
  computeType: string;
  computeId: string;
  currentServer: string;
  spends: string;
  savings: string;
  potentialSavings: string;
  efficiency: string;
  maxCpu?: string;
  maxMemory?: string;
  dbType?: string;
}

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('AWS');
  const [selectedPeriod, setSelectedPeriod] = useState('2025, Q1');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCloudAccountDetail, setShowCloudAccountDetail] = useState(false);
  const [selectedCloudAccount, setSelectedCloudAccount] = useState('');
  const [showComputeModal, setShowComputeModal] = useState(false);
  const [selectedComputeId, setSelectedComputeId] = useState('');
  const [currentView, setCurrentView] = useState<'dashboard' | 'applications' | 'cloudAccountApps'>('dashboard');
  const [selectedDetailCategory, setSelectedDetailCategory] = useState<'Compute' | 'Storage' | 'Database'>('Compute');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [appSortBy, setAppSortBy] = useState('');
  const [appSortOrder, setAppSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedAccountForApps, setSelectedAccountForApps] = useState('');
  const [appsSearchTerm, setAppsSearchTerm] = useState('');
  const [appsSelectedDepartment, setAppsSelectedDepartment] = useState('All Departments');
  const [appsSelectedProvider, setAppsSelectedProvider] = useState('AWS');
  const [appsSelectedPeriod, setAppsSelectedPeriod] = useState('2025, Q1');
  const [appsSortBy, setAppsSortBy] = useState('Sort by');
  const [appsSortOrder, setAppsSortOrder] = useState('Descending');



  // Listen for requests from child components (e.g., Dashboard attention table) to open a cloud account detail
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { cloudAccount?: string };
      const cloudAccount = detail?.cloudAccount || 'Cloud Account 1';
      setSelectedCloudAccount(cloudAccount);
      setShowCloudAccountDetail(true);
      setCurrentView('applications');
    };
    window.addEventListener('openCloudAccountDetail', handler as EventListener);
    return () => window.removeEventListener('openCloudAccountDetail', handler as EventListener);
  }, []);

  // Listen for requests to navigate to applications view
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { cloudAccount?: string | number };
      setCurrentView('applications');
    };
    window.addEventListener('navigateToApplications', handler as EventListener);
    return () => window.removeEventListener('navigateToApplications', handler as EventListener);
  }, []);



  // Cloud Account Summary data
  const cloudAccountSummaryData = [
    { cloudAccount: 'Cloud Account 1', applications: 45, vms: 120, storage: 8, totalSpends: '$2.4M', totalSavings: '$180K', potentialSavings: '$320K', efficiency: '85%', provider: 'AWS', department: 'Engineering' },
    { cloudAccount: 'Cloud Account 2', applications: 32, vms: 95, storage: 6, totalSpends: '$1.8M', totalSavings: '$140K', potentialSavings: '$280K', efficiency: '78%', provider: 'Azure', department: 'Sales' },
    { cloudAccount: 'Cloud Account 3', applications: 28, vms: 78, storage: 5, totalSpends: '$1.5M', totalSavings: '$120K', potentialSavings: '$240K', efficiency: '82%', provider: 'GCP', department: 'Marketing' },
    { cloudAccount: 'Cloud Account 4', applications: 38, vms: 105, storage: 7, totalSpends: '$2.1M', totalSavings: '$160K', potentialSavings: '$300K', efficiency: '80%', provider: 'AWS', department: 'Finance' },
    { cloudAccount: 'Cloud Account 5', applications: 25, vms: 65, storage: 4, totalSpends: '$1.2M', totalSavings: '$95K', potentialSavings: '$180K', efficiency: '75%', provider: 'Azure', department: 'HR' },
    { cloudAccount: 'Cloud Account 6', applications: 52, vms: 140, storage: 10, totalSpends: '$2.8M', totalSavings: '$220K', potentialSavings: '$400K', efficiency: '88%', provider: 'AWS', department: 'Operations' },
    { cloudAccount: 'Cloud Account 7', applications: 35, vms: 88, storage: 6, totalSpends: '$1.9M', totalSavings: '$150K', potentialSavings: '$260K', efficiency: '79%', provider: 'GCP', department: 'Product' },
    { cloudAccount: 'Cloud Account 8', applications: 41, vms: 112, storage: 8, totalSpends: '$2.2M', totalSavings: '$170K', potentialSavings: '$310K', efficiency: '83%', provider: 'Azure', department: 'Engineering' },
    { cloudAccount: 'Cloud Account 9', applications: 29, vms: 72, storage: 5, totalSpends: '$1.6M', totalSavings: '$125K', potentialSavings: '$220K', efficiency: '77%', provider: 'AWS', department: 'Sales' },
    { cloudAccount: 'Cloud Account 10', applications: 33, vms: 85, storage: 6, totalSpends: '$1.7M', totalSavings: '$135K', potentialSavings: '$250K', efficiency: '81%', provider: 'GCP', department: 'Marketing' },
  ];

  // Sample data matching the screenshot
  const departments = ['Engineering','Sales','Marketing','Finance','HR','Operations','Product'];
  const providers: Array<'AWS'|'Azure'|'GCP'> = ['AWS','Azure','GCP'];
  const applicationData: ApplicationData[] = Array(90).fill(null).map((_, index) => ({
    cloudAccount: 'Cloud Account 1',
    applicationName: `Temp_Core_${String(index + 1).padStart(2, '0')}`,
    instanceId: `i-${(1000000000000000000 + index).toString(16)}`,
    volumeId: `vol-${(7000000000000000000 + index).toString(16)}`,
    spends: `$${700 - (index % 5) * 10}k`,
    potentialSavings: `$${700 - (index % 7) * 20}k`,
    efficiency: `${90 - (index % 6) * 3}%`,
    department: departments[index % departments.length],
    provider: providers[index % providers.length],
  }));

  // Compute resources data for cloud account detail view
  const computeResources: ComputeResource[] = [
    { computeType: 'Lambda', computeId: 'vol-0707df985c67e6411', currentServer: 't3a.medium', spends: '$700k', savings: '$700k', potentialSavings: '$700k', efficiency: '90%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
    { computeType: 'Lambda', computeId: 'vol-0707df985c67e6411', currentServer: 't3a.medium', spends: '$700k', savings: '$700k', potentialSavings: '', efficiency: '90%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
    { computeType: 'Lambda', computeId: 'vol-0707df985c67e6411', currentServer: 't3a.medium', spends: '$700k', savings: '$700k', potentialSavings: '$700k', efficiency: '90%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
    { computeType: 'Virtual Machines', computeId: 'vol-0707df985c67e6411', currentServer: 't3a.medium', spends: '$700k', savings: '$700k', potentialSavings: '$700k', efficiency: '90%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
    { computeType: 'Virtual Machines', computeId: 'vol-0707df985c67e6411', currentServer: 't3a.medium', spends: '$700k', savings: '$700k', potentialSavings: '$700k', efficiency: '90%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
    { computeType: 'Virtual Machines', computeId: 'vol-0707df985c67e6411', currentServer: 't3a.medium', spends: '$700k', savings: '$700k', potentialSavings: '$700k', efficiency: '90%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
    { computeType: 'Virtual Machines', computeId: 'vol-0707df985c67e6411', currentServer: 't3a.medium', spends: '$700k', savings: '$700k', potentialSavings: '', efficiency: '90%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
    { computeType: 'Lambda', computeId: 'vol-0707df985c67e6411', currentServer: 't3a.medium', spends: '$700k', savings: '$700k', potentialSavings: '$700k', efficiency: '90%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
    { computeType: 'Lambda', computeId: 'vol-0707df985c67e6411', currentServer: 't3a.medium', spends: '$700k', savings: '$700k', potentialSavings: '$700k', efficiency: '90%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
    { computeType: 'Virtual desktop (Serverless)', computeId: 'vol-0707df985c67e6411', currentServer: 't3a.medium', spends: '$700k', savings: '$700k', potentialSavings: '$700k', efficiency: '90%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
    { computeType: 'Virtual desktop (Serverless)', computeId: 'vol-0707df985c67e6411', currentServer: 't3a.medium', spends: '$700k', savings: '$700k', potentialSavings: '$700k', efficiency: '90%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
    { computeType: 'Virtual desktop (Serverless)', computeId: 'vol-0707df985c67e6411', currentServer: 't3a.medium', spends: '$700k', savings: '$700k', potentialSavings: '$700k', efficiency: '90%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
  ];

  // Storage resources mock data (reusing ComputeResource shape for simplicity)
  const storageResources: ComputeResource[] = [
    { computeType: 'S3 Bucket', computeId: 'bucket-app-logs', currentServer: 'Standard', spends: '$120k', savings: '$30k', potentialSavings: '$40k', efficiency: '75%' },
    { computeType: 'EBS Volume', computeId: 'vol-0a1b2c3d4e5f6g7h', currentServer: 'Standard', spends: '$90k', savings: '$15k', potentialSavings: '$20k', efficiency: '70%' },
    { computeType: 'EFS', computeId: 'fs-0a1b2c3d', currentServer: 'General Purpose', spends: '$60k', savings: '$10k', potentialSavings: '$15k', efficiency: '68%' },
    { computeType: 'S3 Bucket', computeId: 'bucket-analytics', currentServer: 'Intelligent-Tiering', spends: '$150k', savings: '$45k', potentialSavings: '$35k', efficiency: '82%' },
    { computeType: 'EBS Volume', computeId: 'vol-1a2b3c4d5e6f7g8h', currentServer: 'st1', spends: '$40k', savings: '$6k', potentialSavings: '$8k', efficiency: '65%' },
    { computeType: 'Glacier', computeId: 'archive-project-x', currentServer: 'Deep Archive', spends: '$20k', savings: '$5k', potentialSavings: '$7k', efficiency: '80%' },
  ];

  // Database resources mock data
  const databaseResources: ComputeResource[] = [
    { computeType: 'RDS (PostgreSQL)', computeId: 'db-analytics-01', currentServer: 'db.m6g.large', spends: '$300k', savings: '$80k', potentialSavings: '$50k', efficiency: '78%', dbType: 'rds' },
    { computeType: 'RDS (MySQL)', computeId: 'db-core-01', currentServer: 'db.t4g.large', spends: '$180k', savings: '$25k', potentialSavings: '$30k', efficiency: '72%', dbType: 'rds' },
    { computeType: 'Aurora', computeId: 'aurora-cluster-01', currentServer: 'r6g.large', spends: '$400k', savings: '$120k', potentialSavings: '$70k', efficiency: '85%', dbType: 'vcore' },
    { computeType: 'DynamoDB', computeId: 'ddb-orders', currentServer: 'On-Demand', spends: '$90k', savings: '$10k', potentialSavings: '$18k', efficiency: '68%', dbType: 'dtu' },
    { computeType: 'MongoDB Atlas', computeId: 'mongo-app', currentServer: 'M30', spends: '$70k', savings: '$9k', potentialSavings: '$12k', efficiency: '66%', dbType: 'databricks' },
    { computeType: 'RDS (SQL Server)', computeId: 'db-reporting', currentServer: 'db.m5.large', spends: '$110k', savings: '$10k', potentialSavings: '$15k', efficiency: '60%', dbType: 'rds' },
  ];

  const itemsPerPage = 12;
  const filteredApplications = applicationData.filter((row) => {
    const matchesSearch = [
      row.applicationName,
      row.instanceId,
      row.volumeId,
      row.cloudAccount,
      row.spends,
      row.potentialSavings,
      row.efficiency,
      row.department,
      row.provider,
    ].some((v) => v.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = selectedDepartment === 'All Departments' || row.department === selectedDepartment;
    const matchesProvider = selectedProvider === 'All Providers' || row.provider === selectedProvider;
    return matchesSearch && matchesDept && matchesProvider;
  });

  const sortedApplications = (() => {
    const data = [...filteredApplications];
    if (!appSortBy) return data;
    return data.sort((a, b) => {
      let aVal: any = (a as any)[appSortBy];
      let bVal: any = (b as any)[appSortBy];
      if (typeof aVal === 'string' && aVal.startsWith('$')) {
        aVal = parseFloat(aVal.replace(/[$,k]/g, ''));
        bVal = parseFloat(bVal.replace(/[$,k]/g, ''));
      }
      if (typeof aVal === 'string' && aVal.endsWith('%')) {
        aVal = parseFloat(aVal.replace('%',''));
        bVal = parseFloat(bVal.replace('%',''));
      }
      if (appSortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
  })();

  const totalPages = Math.ceil(sortedApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedApplications.slice(startIndex, endIndex);

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', active: currentView === 'dashboard' },
    { icon: Layers, label: 'Applications', active: currentView === 'applications' },
    { icon: AlertTriangle, label: 'Alerts', active: false },
    { icon: TrendingUp, label: 'Recommendations', active: false },
    { icon: FileText, label: 'Reports', active: false },
  ];

  const bottomSidebarItems = [
    { icon: Settings, label: 'Settings', active: false },
    { icon: User, label: 'Arun Mehta', active: false },
  ];

  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 9;
    
    for (let i = 1; i <= Math.min(maxVisiblePages, totalPages); i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-2 text-sm ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          } rounded`}
        >
          {i}
        </button>
      );
    }
    
    return pages;
  };

  const handleCloudAccountSummaryClick = (cloudAccount: string) => {
    setSelectedAccountForApps(cloudAccount);
    setCurrentView('cloudAccountApps');
  };

  const handleCloudAccountClick = (cloudAccount: string) => {
    setSelectedCloudAccount(cloudAccount);
    setShowCloudAccountDetail(true);
    setCurrentView('applications');
  };

  const handleApplicationClick = (applicationName: string) => {
    setSelectedCloudAccount(selectedAccountForApps);
    setShowCloudAccountDetail(true);
    setCurrentView('applications');
  };


  const handleBackToApplications = () => {
    setShowCloudAccountDetail(false);
    setSelectedCloudAccount('');
  };

  const handleComputeIdClick = (computeId: string) => {
    setSelectedComputeId(computeId);
    setShowComputeModal(true);
  };

  const handleCloseComputeModal = () => {
    setShowComputeModal(false);
    setSelectedComputeId('');
  };



  const handleNavigation = (view: 'dashboard' | 'applications') => {
    setCurrentView(view);
    setShowCloudAccountDetail(false);
    setShowComputeModal(false);
  };

  // Compute details data for the modal
  const computeDetails = {
    computeType: 'Virtual Machine',
    computeId: selectedComputeId,
    server: 't3a.medium',
    spends: '$700k',
    savings: '$300k',
    potentialSavings: '-',
    efficiency: '50%',
    cpuUsage: '80%',
    memoryUsage: '80%',
    network: '80%',
    maxCpu: '97%',
    maxMemory: '80%'
  };

  const currentConfig = {
    computeType: 'Virtual Machine',
    computeId: selectedComputeId,
    server: 't3a.medium',
    spends: '$700k',
    savings: '$300k',
    potentialSavings: '-',
    efficiency: '50%',
    cpuUsage: '80%',
    memoryUsage: '80%',
    network: '80%',
    maxCpu: '97%',
    maxMemory: '80%'
  };

  const safeConfig = {
    computeType: 'Virtual Machine',
    computeId: selectedComputeId,
    server: 't3a.small',
    spends: '$700k',
    savings: '-',
    potentialSavings: '$700k',
    efficiency: '60%',
    cpuUsage: '60%',
    memoryUsage: '60%',
    network: '60%',
    maxCpu: '65%',
    maxMemory: '62%'
  };

  const alternateConfig = {
    computeType: 'Virtual Machine',
    computeId: selectedComputeId,
    server: 't3a.small',
    spends: '$700k',
    savings: '-',
    potentialSavings: '$800k',
    efficiency: '80%',
    cpuUsage: '80%',
    memoryUsage: '80%',
    network: '80%',
    maxCpu: '70%',
    maxMemory: '68%'
  };

  // Hoisted modal component so it can be used anywhere below
  function ComputeModal() {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Details & Recommendation of Compute ID -{selectedComputeId}
            </h2>
            <button
              onClick={handleCloseComputeModal}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          {/* Modal Content */}
          <div className="p-6">
            <div className="grid grid-cols-4 gap-8">
              {/* Compute Details Column */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4 pb-2 border-b-2 border-black">
                  Compute details
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Compute type</div>
                    <div className="text-sm text-gray-900">{computeDetails.computeType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Compute ID</div>
                    <div className="text-sm text-gray-900 font-mono">{computeDetails.computeId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Server</div>
                    <div className="text-sm text-gray-900">{computeDetails.server}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Spends</div>
                    <div className="text-sm text-gray-900 font-semibold">{computeDetails.spends}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Savings</div>
                    <div className="text-sm text-gray-900 font-semibold">{computeDetails.savings}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Potential savings</div>
                    <div className="text-sm text-gray-900 font-semibold">{computeDetails.potentialSavings}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Efficiency</div>
                    <div className="text-sm text-gray-900 font-semibold">{computeDetails.efficiency}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">CPU usage</div>
                    <div className="text-sm text-gray-900 font-semibold">{computeDetails.cpuUsage}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Memory usage</div>
                    <div className="text-sm text-gray-900 font-semibold">{computeDetails.memoryUsage}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Network</div>
                    <div className="text-sm text-gray-900 font-semibold">{computeDetails.network}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Max CPU</div>
                    <div className="text-sm text-gray-900 font-semibold">{computeDetails.maxCpu}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Max Memory</div>
                    <div className="text-sm text-gray-900 font-semibold">{computeDetails.maxMemory}</div>
                  </div>
                </div>
              </div>
  
              {/* Current Column */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4 pb-2 border-b-2 border-black">
                  Current
                </h3>
                <div className="space-y-4">
                  <div className="text-sm text-gray-900">{currentConfig.computeType}</div>
                  <div className="text-sm text-gray-900 font-mono">{currentConfig.computeId}</div>
                  <div className="text-sm text-gray-900">{currentConfig.server}</div>
                  <div className="text-sm text-gray-900 font-semibold">{currentConfig.spends}</div>
                  <div className="text-sm text-gray-900 font-semibold">{currentConfig.savings}</div>
                  <div className="text-sm text-gray-900 font-semibold">{currentConfig.potentialSavings}</div>
                  <div className="text-sm text-gray-900 font-semibold">{currentConfig.efficiency}</div>
                  <div className="text-sm text-gray-900 font-semibold">{currentConfig.cpuUsage}</div>
                  <div className="text-sm text-gray-900 font-semibold">{currentConfig.memoryUsage}</div>
                  <div className="text-sm text-gray-900 font-semibold">{currentConfig.network}</div>
                  <div className="text-sm text-gray-900 font-semibold">{currentConfig.maxCpu}</div>
                  <div className="text-sm text-gray-900 font-semibold">{currentConfig.maxMemory}</div>
                </div>
                <div className="mt-6">
                  <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium">
                    Selected
                  </button>
                </div>
              </div>
  
              {/* Safe Column */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4 pb-2 border-b-2 border-black">
                  Safe
                </h3>
                <div className="space-y-4">
                  <div className="text-sm text-gray-900">{safeConfig.computeType}</div>
                  <div className="text-sm text-gray-900 font-mono">{safeConfig.computeId}</div>
                  <div className="text-sm text-gray-900">{safeConfig.server}</div>
                  <div className="text-sm text-gray-900 font-semibold">{safeConfig.spends}</div>
                  <div className="text-sm text-gray-900 font-semibold">{safeConfig.savings}</div>
                  <div className="text-sm text-gray-900 font-semibold">{safeConfig.potentialSavings}</div>
                  <div className="text-sm text-gray-900 font-semibold">{safeConfig.efficiency}</div>
                  <div className="text-sm text-gray-900 font-semibold">{safeConfig.cpuUsage}</div>
                  <div className="text-sm text-gray-900 font-semibold">{safeConfig.memoryUsage}</div>
                  <div className="text-sm text-gray-900 font-semibold">{safeConfig.network}</div>
                  <div className="text-sm text-gray-900 font-semibold">{safeConfig.maxCpu}</div>
                  <div className="text-sm text-gray-900 font-semibold">{safeConfig.maxMemory}</div>
                </div>
                <div className="mt-6">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                    Choose & update
                  </button>
                </div>
              </div>
  
              {/* Alternate Column */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4 pb-2 border-b-2 border-black">
                  Alternate
                </h3>
                <div className="space-y-4">
                  <div className="text-sm text-gray-900">{alternateConfig.computeType}</div>
                  <div className="text-sm text-gray-900 font-mono">{alternateConfig.computeId}</div>
                  <div className="text-sm text-gray-900">{alternateConfig.server}</div>
                  <div className="text-sm text-gray-900 font-semibold">{alternateConfig.spends}</div>
                  <div className="text-sm text-gray-900 font-semibold">{alternateConfig.savings}</div>
                  <div className="text-sm text-gray-900 font-semibold">{alternateConfig.potentialSavings}</div>
                  <div className="text-sm text-gray-900 font-semibold">{alternateConfig.efficiency}</div>
                  <div className="text-sm text-gray-900 font-semibold">{alternateConfig.cpuUsage}</div>
                  <div className="text-sm text-gray-900 font-semibold">{alternateConfig.memoryUsage}</div>
                  <div className="text-sm text-gray-900 font-semibold">{alternateConfig.network}</div>
                  <div className="text-sm text-gray-900 font-semibold">{alternateConfig.maxCpu}</div>
                  <div className="text-sm text-gray-900 font-semibold">{alternateConfig.maxMemory}</div>
                </div>
                <div className="mt-6">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                    Choose & update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If dashboard view is selected, show dashboard
  if (currentView === 'dashboard') {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
          {/* Main Navigation */}
          <div className="flex-1 py-6">
            <nav className="space-y-1 px-3">
              {sidebarItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (item.label === 'Dashboard') handleNavigation('dashboard');
                    if (item.label === 'Applications') handleNavigation('applications');
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    item.active
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-gray-200 py-4">
            <nav className="space-y-1 px-3">
              {bottomSidebarItems.map((item, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto">
          <Dashboard 
            onViewApplications={() => setCurrentView('applications')}
            onViewAccountDetails={(accountId) => {
              setSelectedAccountId(accountId);
              setCurrentView('accountDetails');
            }}
          />
        </div>
      </div>
    );
  }

  // Cloud Account Detail View
  if (showCloudAccountDetail) {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
          {/* Main Navigation */}
          <div className="flex-1 py-6">
            <nav className="space-y-1 px-3">
              {sidebarItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (item.label === 'Dashboard') handleNavigation('dashboard');
                    if (item.label === 'Applications') handleNavigation('applications');
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    item.active
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-gray-200 py-4">
            <nav className="space-y-1 px-3">
              {bottomSidebarItems.map((item, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {/* Header with Back Button */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToApplications}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {selectedCloudAccount} - Details
                </h1>
              </div>
            </div>

            {/* Service Categories */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex space-x-8">
                {(['Compute','Storage','Database'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSelectedDetailCategory(tab)}
                    className={`pb-2 ${selectedDetailCategory === tab ? 'border-b-2 border-black' : ''}`}
                  >
                    <span className={`text-sm font-medium ${selectedDetailCategory === tab ? 'text-gray-900' : 'text-gray-500'}`}>{tab}</span>
                  </button>
                ))}
                {/* Networking and Monitoring removed per request */}
              </div>
            </div>

            {/* Search and Filters (like All Applications) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 m-6 mt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by type, ID, server..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Right side - Dropdowns & Sort */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <select
                      value={selectedDepartment}
                      onChange={(e) => { setSelectedDepartment(e.target.value); setCurrentPage(1); }}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="All Departments">All Departments</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Finance">Finance</option>
                      <option value="HR">HR</option>
                      <option value="Operations">Operations</option>
                      <option value="Product">Product</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={selectedProvider}
                      onChange={(e) => { setSelectedProvider(e.target.value); setCurrentPage(1); }}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="All Providers">All Providers</option>
                      <option value="AWS">AWS</option>
                      <option value="Azure">Azure</option>
                      <option value="GCP">GCP</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={selectedPeriod}
                      onChange={(e) => { setSelectedPeriod(e.target.value); setCurrentPage(1); }}
                      className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="2025, Q1">2025, Q1</option>
                      <option value="2024, Q4">2024, Q4</option>
                      <option value="2024, Q3">2024, Q3</option>
                      <option value="2024, Q2">2024, Q2</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Sort controls */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sort by</option>
                      <option value="computeType">{selectedDetailCategory === 'Compute' ? 'Compute Type' : selectedDetailCategory === 'Storage' ? 'Storage Type' : 'Database Type'}</option>
                      <option value="computeId">{selectedDetailCategory === 'Compute' ? 'Compute ID' : selectedDetailCategory === 'Storage' ? 'Storage ID' : 'Database ID'}</option>
                      <option value="currentServer">{selectedDetailCategory === 'Compute' ? 'Current Server' : selectedDetailCategory === 'Storage' ? 'Current Tier' : 'DB Engine'}</option>
                      <option value="spends">Spends</option>
                      <option value="savings">Savings</option>
                      <option value="potentialSavings">Potential Savings</option>
                      <option value="efficiency">Efficiency</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className={`flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm ${sortOrder === 'asc' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-700'}`}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </button>
                  <button
                    onClick={() => { setSearchTerm(''); setSelectedDepartment('All Departments'); setSelectedProvider('All Providers'); setSelectedPeriod('2025, Q1'); setSortBy(''); setSortOrder('desc'); setCurrentPage(1); }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
            
            {/* Resources Table (Compute / Storage / Database) */}
            <div className="px-6 py-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {selectedDetailCategory === 'Compute' ? 'COMPUTE TYPE' : selectedDetailCategory === 'Storage' ? 'STORAGE TYPE' : 'DATABASE TYPE'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {selectedDetailCategory === 'Compute' ? 'COMPUTE ID' : selectedDetailCategory === 'Storage' ? 'STORAGE ID' : 'DATABASE ID'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {selectedDetailCategory === 'Compute' ? 'CURRENT SERVER' : selectedDetailCategory === 'Storage' ? 'CURRENT TIER' : 'DB ENGINE'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SPENDS</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SAVINGS</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">POTENTIAL SAVINGS</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EFFICIENCY</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(() => {
                        let data = selectedDetailCategory === 'Compute' ? computeResources : selectedDetailCategory === 'Storage' ? storageResources : databaseResources;
                        // Search filter on resource rows
                        if (searchTerm) {
                          const q = searchTerm.toLowerCase();
                          data = data.filter((r) => [r.computeType, r.computeId, r.currentServer, r.spends, r.savings, r.potentialSavings, r.efficiency].some((v) => v.toLowerCase().includes(q)));
                        }
                        
                        // Apply sorting if sortBy is selected
                        if (sortBy) {
                          data = [...data].sort((a, b) => {
                            let aValue: any = a[sortBy as keyof ComputeResource];
                            let bValue: any = b[sortBy as keyof ComputeResource];
                            
                            // Handle numeric values (remove $ and k, then convert to number)
                            if (typeof aValue === 'string' && aValue.includes('$')) {
                              aValue = parseFloat(aValue.replace(/[$,k]/g, ''));
                              bValue = parseFloat(bValue.replace(/[$,k]/g, ''));
                            }
                            
                            // Handle percentage values
                            if (typeof aValue === 'string' && aValue.includes('%')) {
                              aValue = parseFloat(aValue.replace('%', ''));
                              bValue = parseFloat(bValue.replace('%', ''));
                            }
                            
                            if (sortOrder === 'asc') {
                              return aValue > bValue ? 1 : -1;
                            } else {
                              return aValue < bValue ? 1 : -1;
                            }
                          });
                        }
                        
                        return data.map((resource, index) => (
                          <tr key={index} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleComputeIdClick(resource.computeId)}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.computeType}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">{resource.computeId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.currentServer}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{resource.spends}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{resource.savings}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{resource.potentialSavings}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{resource.efficiency}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                              <ChevronRight className="h-4 w-4" />
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing 12 of 90 results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((page) => (
                        <button
                          key={page}
                          className={`px-3 py-2 text-sm ${
                            page === 1
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          } rounded`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Compute Modal */}
        {showComputeModal && <ComputeModal />}
      </div>
    );
  }

  // Compute Modal Component (removed duplicate; now hoisted above)

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleViewApplications = () => {
    setCurrentView('applications-table');
  };

  // Cloud Account Applications View (intermediate step)
  if (currentView === 'cloudAccountApps') {
    return (
      <div className="flex h-screen" style={{ backgroundColor: '#0f172a' }}>
        {/* Sidebar */}
        <div className="w-64 shadow-sm flex flex-col" style={{ backgroundColor: '#1e293b', borderRight: '1px solid #334155' }}>
          <div className="flex-1 py-6">
            <nav className="space-y-1 px-3">
              {sidebarItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (item.label === 'Dashboard') handleNavigation('dashboard');
                    if (item.label === 'Applications') handleNavigation('applications');
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    item.active ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  style={{ backgroundColor: item.active ? '#334155' : 'transparent' }}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="py-4" style={{ borderTop: '1px solid #334155' }}>
            <nav className="space-y-1 px-3">
              {bottomSidebarItems.map((item, index) => (
                <a key={index} href="#" className="flex items-center px-3 py-2 text-sm font-medium text-slate-400 rounded-md hover:text-white">
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-4" style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
            <div className="flex items-center space-x-4">
              <button onClick={() => setCurrentView('applications')} className="text-slate-400 hover:text-white">
                ← Back
              </button>
              <h1 className="text-2xl font-semibold text-white">{selectedAccountForApps} - Applications</h1>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4" style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Application name, Instance ID"
                  value={appsSearchTerm}
                  onChange={(e) => setAppsSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg text-white placeholder-slate-400"
                  style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
                />
              </div>
              
              <div className="relative">
                <select
                  value={appsSelectedDepartment}
                  onChange={(e) => setAppsSelectedDepartment(e.target.value)}
                  className="appearance-none px-3 py-2 pr-8 rounded-lg text-white"
                  style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
                >
                  <option>All Departments</option>
                  <option>Engineering</option>
                  <option>Finance</option>
                  <option>Product</option>
                  <option>Marketing</option>
                  <option>Operations</option>
                  <option>Sales</option>
                  <option>HR</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={appsSelectedProvider}
                  onChange={(e) => setAppsSelectedProvider(e.target.value)}
                  className="appearance-none px-3 py-2 pr-8 rounded-lg text-white"
                  style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
                >
                  <option>AWS</option>
                  <option>Azure</option>
                  <option>GCP</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={appsSelectedPeriod}
                  onChange={(e) => setAppsSelectedPeriod(e.target.value)}
                  className="appearance-none px-3 py-2 pr-8 rounded-lg text-white"
                  style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
                >
                  <option>2025, Q1</option>
                  <option>2024, Q4</option>
                  <option>2024, Q3</option>
                  <option>2024, Q2</option>
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
                  <option>Department</option>
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
                onClick={() => {
                  setAppsSearchTerm('');
                  setAppsSelectedDepartment('All Departments');
                  setAppsSelectedProvider('AWS');
                  setAppsSelectedPeriod('2025, Q1');
                  setAppsSortBy('Sort by');
                  setAppsSortOrder('Descending');
                }}
                className="px-3 py-2 text-slate-400 hover:text-white"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Applications Table */}
          <div className="p-6">
            <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
              <table className="w-full">
                <thead style={{ backgroundColor: '#334155' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Cloud Account</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Application Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Instance ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Volume ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Spends</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Potential Savings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Efficiency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Provider</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#334155' }}>
                  {(() => {
                    // Filter applications
                    let filteredApps = applicationData.filter(app => {
                      const matchesSearch = appsSearchTerm === '' || 
                        app.applicationName.toLowerCase().includes(appsSearchTerm.toLowerCase()) ||
                        app.instanceId.toLowerCase().includes(appsSearchTerm.toLowerCase());
                      
                      const matchesDepartment = appsSelectedDepartment === 'All Departments' || 
                        app.department === appsSelectedDepartment;
                      
                      const matchesProvider = app.provider === appsSelectedProvider;
                      
                      return matchesSearch && matchesDepartment && matchesProvider;
                    });

                    // Sort applications
                    if (appsSortBy !== 'Sort by') {
                      filteredApps.sort((a, b) => {
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
                          case 'Department':
                            aVal = a.department;
                            bVal = b.department;
                            break;
                          default:
                            return 0;
                        }
                        
                        if (typeof aVal === 'string') {
                          return appsSortOrder === 'Ascending' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                        } else {
                          return appsSortOrder === 'Ascending' ? aVal - bVal : bVal - aVal;
                        }
                      });
                    }

                    return filteredApps.slice(0, 12).map((app, index) => (
                      <tr key={index} className="hover:opacity-80">
                        <td className="px-6 py-4 text-sm text-blue-400 cursor-pointer hover:text-blue-300" onClick={() => handleCloudAccountClick(selectedAccountForApps)}>{selectedAccountForApps}</td>
                        <td className="px-6 py-4 text-sm text-white cursor-pointer hover:text-blue-400" onClick={() => handleApplicationClick(app.applicationName)}>
                          {app.applicationName}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300 font-mono">{app.instanceId}</td>
                        <td className="px-6 py-4 text-sm text-slate-300 font-mono">{app.volumeId}</td>
                        <td className="px-6 py-4 text-sm text-white font-semibold">{app.spends}</td>
                        <td className="px-6 py-4 text-sm text-green-400 font-semibold">{app.potentialSavings}</td>
                        <td className="px-6 py-4 text-sm text-white font-semibold">{app.efficiency}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{app.department}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{app.provider}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
              <div className="px-6 py-3" style={{ backgroundColor: '#334155', borderTop: '1px solid #475569' }}>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    {(() => {
                      const filteredCount = applicationData.filter(app => {
                        const matchesSearch = appsSearchTerm === '' || 
                          app.applicationName.toLowerCase().includes(appsSearchTerm.toLowerCase()) ||
                          app.instanceId.toLowerCase().includes(appsSearchTerm.toLowerCase());
                        
                        const matchesDepartment = appsSelectedDepartment === 'All Departments' || 
                          app.department === appsSelectedDepartment;
                        
                        const matchesProvider = app.provider === appsSelectedProvider;
                        
                        return matchesSearch && matchesDepartment && matchesProvider;
                      }).length;
                      
                      const showing = Math.min(12, filteredCount);
                      return `Showing 1 to ${showing} of ${filteredCount} results`;
                    })()} 
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">1</button>
                    <button className="px-3 py-1 text-sm text-slate-400 hover:text-white">2</button>
                    <button className="px-3 py-1 text-sm text-slate-400 hover:text-white">3</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        {/* Main Navigation */}
        <div className="flex-1 py-6">
          <nav className="space-y-1 px-3">
            {sidebarItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  if (item.label === 'Dashboard') handleNavigation('dashboard');
                  if (item.label === 'Applications') handleNavigation('applications');
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  item.active
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-200 py-4">
          <nav className="space-y-1 px-3">
            {bottomSidebarItems.map((item, index) => (
              <a
                key={index}
                href="#"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-4">

              <h1 className="text-2xl font-semibold text-gray-900">All Applications</h1>
            </div>
          </div>

          {/* Cloud Account Summary Section */}
          <div className="px-6 py-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Cloud Account Summary</h2>
              <p className="text-gray-600 mt-1">Overview of all cloud accounts with aggregated metrics</p>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Total Cloud Accounts</div>
                <div className="text-3xl font-bold text-gray-900">{cloudAccountSummaryData.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Total Applications</div>
                <div className="text-3xl font-bold text-gray-900">{cloudAccountSummaryData.reduce((sum, acc) => sum + acc.applications, 0)}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Total VMs</div>
                <div className="text-3xl font-bold text-gray-900">{cloudAccountSummaryData.reduce((sum, acc) => sum + acc.vms, 0)}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Total Storage (TB)</div>
                <div className="text-3xl font-bold text-gray-900">{cloudAccountSummaryData.reduce((sum, acc) => sum + acc.storage, 0)}</div>
              </div>
            </div>

            {/* Cloud Accounts Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cloud Account</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VMs</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Storage (TB)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spends</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Savings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potential Savings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cloudAccountSummaryData.map((account, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {account.cloudAccount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {account.applications}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {account.vms}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {account.storage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {account.totalSpends}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {account.totalSavings}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {account.potentialSavings}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {account.efficiency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            account.provider === 'AWS' ? 'bg-orange-100 text-orange-800' :
                            account.provider === 'Azure' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {account.provider}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {account.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          <button
                            onClick={() => handleCloudAccountSummaryClick(account.cloudAccount)}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>



          {/* Statistics Cards */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Total Cloud Accounts</div>
                <div className="text-3xl font-bold text-gray-900">30</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Total Applications</div>
                <div className="text-3xl font-bold text-gray-900">1200</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Prod</div>
                <div className="text-3xl font-bold text-gray-900">1200</div>
                <div className="text-sm font-medium text-gray-500 mt-2">Non - Prod</div>
                <div className="text-2xl font-semibold text-gray-900">200</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Total spends</div>
                <div className="text-3xl font-bold text-gray-900">$100</div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by Application name, Instance ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* Right side - Dropdowns */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="All Departments">All Departments</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Finance">Finance</option>
                      <option value="HR">HR</option>
                      <option value="Operations">Operations</option>
                      <option value="Product">Product</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="All Providers">All Providers</option>
                      <option value="AWS">AWS</option>
                      <option value="Azure">Azure</option>
                      <option value="GCP">GCP</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="2025, Q1">2025, Q1</option>
                      <option value="2024, Q4">2024, Q4</option>
                      <option value="2024, Q3">2024, Q3</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <select
                        value={appSortBy}
                        onChange={(e) => setAppSortBy(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Sort by</option>
                        <option value="cloudAccount">Cloud Account</option>
                        <option value="applicationName">Application name</option>
                        <option value="instanceId">Instance ID</option>
                        <option value="volumeId">Volume ID</option>
                        <option value="spends">Spends</option>
                        <option value="potentialSavings">Potential Savings</option>
                        <option value="efficiency">Efficiency</option>
                        <option value="department">Department</option>
                        <option value="provider">Provider</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    <button
                      onClick={() => setAppSortOrder(appSortOrder === 'asc' ? 'desc' : 'asc')}
                      className={`flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm ${appSortOrder === 'asc' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-700'}`}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {appSortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </button>
                    <button
                      onClick={() => { setSearchTerm(''); setSelectedDepartment('All Departments'); setSelectedProvider('All Providers'); setSelectedPeriod('2025, Q1'); setCurrentPage(1); setAppSortBy(''); }}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cloud Account
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Application name
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => handleCloudAccountClick(item.cloudAccount)}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {item.cloudAccount}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.applicationName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {item.instanceId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {item.volumeId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {item.spends}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {item.potentialSavings}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {item.efficiency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.provider}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, sortedApplications.length)} of {sortedApplications.length} results
                </div>
                <div className="flex items-center justify-start space-x-6 mt-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    <div className="flex space-x-1">
                      {renderPaginationNumbers()}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
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

export default App;