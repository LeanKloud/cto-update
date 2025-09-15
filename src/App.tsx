import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ApplicationsTableView from './components/ApplicationsTableView';
import Sidebar from './components/Sidebar';
import CloudAccountSummary from './components/CloudAccountSummary';
import CloudAccountDetail from './components/CloudAccountDetail';
import CloudAccountApps from './components/CloudAccountApps';
import { ViewType } from './types';
import { cloudAccountSummaryData, applicationData } from './data/mockData';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showCloudAccountDetail, setShowCloudAccountDetail] = useState(false);
  const [selectedCloudAccount, setSelectedCloudAccount] = useState('');
  const [selectedAccountForApps, setSelectedAccountForApps] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');

  // Listen for requests from child components to open cloud account detail
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
      setCurrentView('applications');
    };
    window.addEventListener('navigateToApplications', handler as EventListener);
    return () => window.removeEventListener('navigateToApplications', handler as EventListener);
  }, []);

  const handleNavigation = (view: 'dashboard' | 'applications') => {
    setCurrentView(view);
    setShowCloudAccountDetail(false);
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
            onBack={handleBackToApplications}
            onComputeClick={handleComputeIdClick}
          />
        </div>
      </div>
    );
  }

  // Cloud Account Applications View
  if (currentView === 'cloudAccountApps') {
    return (
      <div className="flex h-screen" style={{ backgroundColor: '#0f172a' }}>
        <Sidebar currentView={currentView} onNavigate={handleNavigation} />
        <CloudAccountApps
          selectedAccount={selectedAccountForApps}
          applicationData={applicationData}
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
          <div className="px-6 py-4" style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
            <h1 className="text-2xl font-semibold text-white">All Applications</h1>
          </div>
          <CloudAccountSummary 
            data={cloudAccountSummaryData}
            onAccountClick={handleCloudAccountSummaryClick}
          />
        </div>
      </div>
    </div>
  );
};

export default App;