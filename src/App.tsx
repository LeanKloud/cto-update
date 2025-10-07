import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ApplicationsTableView from './components/ApplicationsTableView';
import Sidebar from './components/Sidebar';
import CloudAccountSummary from './components/CloudAccountSummary';
import CloudAccountDetail from './components/CloudAccountDetail';
import CloudAccountApps from './components/CloudAccountApps';
import { ViewType } from './types';
import { useDashboardSummary, useCloudAccounts } from './hooks/useApi';
import { Search, ChevronDown } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showCloudAccountDetail, setShowCloudAccountDetail] = useState(false);
  const [selectedCloudAccount, setSelectedCloudAccount] = useState('');
  const [selectedAccountForApps, setSelectedAccountForApps] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedApplicationName, setSelectedApplicationName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('All Providers');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  // API hooks
  const { data: cloudAccountsData } = useCloudAccounts();
  const cloudAccountSummaryData = cloudAccountsData?.accounts || [];
  const applicationData = []; // Will be fetched per account

  // Listen for requests from child components to open cloud account detail
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { cloudAccount?: string };
      const cloudAccount = detail?.cloudAccount || 'Cloud Account 1';
      setSelectedCloudAccount(cloudAccount);
      setSelectedApplicationName('');
      setShowCloudAccountDetail(true);
      setCurrentView('applications');
    };
    window.addEventListener('openCloudAccountDetail', handler as EventListener);
    return () => window.removeEventListener('openCloudAccountDetail', handler as EventListener);
  }, []);

  // Listen for requests to navigate to applications view
  useEffect(() => {
    const handler = (e: Event) => {
      setCurrentView('applications');
    };
    window.addEventListener('navigateToApplications', handler as EventListener);
    return () => window.removeEventListener('navigateToApplications', handler as EventListener);
  }, []);

  // Listen for requests to navigate to cloud account apps
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { cloudAccount?: string };
      const cloudAccount = detail?.cloudAccount || 'Cloud Account 1';
      setSelectedAccountForApps(cloudAccount);
      setCurrentView('cloudAccountApps');
    };
    window.addEventListener('navigateToCloudAccountApps', handler as EventListener);
    return () => window.removeEventListener('navigateToCloudAccountApps', handler as EventListener);
  }, []);

  // Listen for requests to navigate to cloud account detail
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { cloudAccount?: string; applicationName?: string };
      const cloudAccount = detail?.cloudAccount || 'Cloud Account 1';
      const applicationName = detail?.applicationName || '';
      setSelectedCloudAccount(cloudAccount);
      setSelectedApplicationName(applicationName);
      setShowCloudAccountDetail(true);
      setCurrentView('applications');
    };
    window.addEventListener('navigateToCloudAccountDetail', handler as EventListener);
    return () => window.removeEventListener('navigateToCloudAccountDetail', handler as EventListener);
  }, []);

  const handleNavigation = (view: 'dashboard' | 'applications') => {
    setCurrentView(view);
    setShowCloudAccountDetail(false);
  };

  const handleCloudAccountSummaryClick = (cloudAccount: string) => {
    console.log('Cloud account clicked:', cloudAccount);
    setSelectedAccountForApps(cloudAccount);
    setCurrentView('cloudAccountApps');
  };

  const handleCloudAccountClick = (cloudAccount: string) => {
    setSelectedCloudAccount(cloudAccount);
    setSelectedApplicationName('');
    setShowCloudAccountDetail(true);
    setCurrentView('applications');
  };

  const handleApplicationClick = (applicationName: string) => {
    setSelectedCloudAccount(selectedAccountForApps);
    setSelectedApplicationName(applicationName);
    setShowCloudAccountDetail(true);
    setCurrentView('applications');
  };

  const handleBackToApplications = () => {
    setShowCloudAccountDetail(false);
    setSelectedCloudAccount('');
    setSelectedApplicationName('');
    setCurrentView('cloudAccountApps');
  };

  const handleComputeIdClick = (computeId: string) => {
    // Handle compute ID click if needed
  };

  // Dashboard view
  if (currentView === 'dashboard') {
    return (
      <div className="flex h-screen" style={{ backgroundColor: '#0f172a' }}>
        <Sidebar currentView={currentView} onNavigate={handleNavigation} />
        <div className="flex-1 overflow-y-auto">
          <Dashboard 
            onViewApplications={() => setCurrentView('applications')}
            onViewAccountDetails={(accountId) => {
              setSelectedAccountId(accountId);
              setCurrentView('applications');
            }}
          />
        </div>
      </div>
    );
  }

  // Cloud Account Detail View
  if (showCloudAccountDetail) {
    return (
      <div className="flex h-screen" style={{ backgroundColor: '#0f172a' }}>
        <Sidebar currentView={currentView} onNavigate={handleNavigation} />
        <div className="flex-1 overflow-hidden">
          <CloudAccountDetail
            cloudAccount={selectedCloudAccount}
            applicationName={selectedApplicationName}
            onBack={handleBackToApplications}
            onComputeClick={handleComputeIdClick}
          />
        </div>
      </div>
    );
  }

  // Cloud Account Applications View
  if (currentView === 'cloudAccountApps') {
    if (!selectedAccountForApps) {
      return (
        <div className="flex h-screen" style={{ backgroundColor: '#0f172a' }}>
          <Sidebar currentView={currentView} onNavigate={handleNavigation} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white">No account selected</div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex h-screen" style={{ backgroundColor: '#0f172a' }}>
        <Sidebar currentView={currentView} onNavigate={handleNavigation} />
        <CloudAccountApps
          selectedAccount={selectedAccountForApps}
          onBack={() => setCurrentView('applications')}
          onApplicationClick={handleApplicationClick}
        />
      </div>
    );
  }

  // Applications view (default)
  return (
    <div className="flex h-screen" style={{ backgroundColor: '#0f172a' }}>
      <Sidebar currentView={currentView} onNavigate={handleNavigation} />
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {/* Filters */}
          <div className="p-6 m-6 mt-6" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Cloud account or Application..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-md text-white placeholder-slate-400"
                  style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="appearance-none rounded-lg px-4 py-2 pr-8 text-white"
                    style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
                  >
                    <option>All Providers</option>
                    <option>AWS</option>
                    <option>Azure</option>
                    <option>GCP</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none rounded-lg px-3 py-2 pr-8 text-sm text-white"
                    style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
                  >
                    <option value="">Sort by</option>
                    <option value="cloudAccount">Cloud Account</option>
                    <option value="applications">Applications</option>
                    <option value="totalSpends">Total Spends</option>
                    <option value="totalSavings">Total Savings</option>
                    <option value="efficiency">Efficiency</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center px-3 py-2 rounded-md text-sm text-slate-300 hover:text-white"
                  style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
                >
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </button>
                
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedProvider('All Providers');
                    setSortBy('');
                    setSortOrder('desc');
                  }}
                  className="px-3 py-2 rounded-md text-sm text-slate-300 hover:text-white"
                  style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
          
          <CloudAccountSummary 
            data={cloudAccountSummaryData}
            onAccountClick={handleCloudAccountSummaryClick}
            searchTerm={searchTerm}
            selectedProvider={selectedProvider}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default App;