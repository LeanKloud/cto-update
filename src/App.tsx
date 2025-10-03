import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import CloudAccountSummary from './components/CloudAccountSummary';
import CloudAccountDetail from './components/CloudAccountDetail';
import CloudAccountApps from './components/CloudAccountApps';
import VMRecommendations from './components/recommendations/VMRecommendations';
import DBRecommendations from './components/recommendations/DBRecommendations';
import StorageUnattachedDisks from './components/recommendations/StorageUnattachedDisks';
import StorageIdle from './components/recommendations/StorageIdle';
import StorageSize from './components/recommendations/StorageSize';
import StorageIOPS from './components/recommendations/StorageIOPS';
import ApplicationRecommendations from './components/recommendations/ApplicationRecommendations';
import ApplicationRecommendationsDetail from './components/ApplicationRecommendationsDetail';
import UnassignedAssetsManagement from './components/UnassignedAssetsManagement';
import { ViewType } from './types';
import { useCloudAccounts } from './hooks/useApi';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showCloudAccountDetail, setShowCloudAccountDetail] = useState(false);
  const [selectedCloudAccount, setSelectedCloudAccount] = useState('');
  const [selectedAccountForApps, setSelectedAccountForApps] = useState('');
  const [selectedApplicationName, setSelectedApplicationName] = useState('');
  const [activeRecommendationTab, setActiveRecommendationTab] = useState<string>('');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  // API hooks
  const { data: cloudAccountsData } = useCloudAccounts();
  const cloudAccountSummaryData = (cloudAccountsData as any)?.accounts || [];

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
    const handler = () => {
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
    setActiveRecommendationTab('');
  };

  const handleRecommendationNavigation = (tab: string) => {
    setCurrentView('applications'); // Set to a base view
    setShowCloudAccountDetail(false);
    setActiveRecommendationTab(tab);
  };

  const handleCloudAccountSummaryClick = (cloudAccount: string) => {
    setSelectedAccountForApps(cloudAccount);
    setCurrentView('cloudAccountApps');
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

  const handleComputeIdClick = () => {
    // Handle compute ID click if needed
  };

  const handleViewApplicationDetail = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setCurrentView('application-detail');
  };

  const handleManageUnassignedAssets = () => {
    setCurrentView('unassigned-assets');
  };

  const handleBackFromApplicationDetail = () => {
    setSelectedApplicationId(null);
    setCurrentView('applications');
    setActiveRecommendationTab('Application Recommendations');
  };

  const handleBackFromUnassignedAssets = () => {
    setCurrentView('applications');
    setActiveRecommendationTab('Application Recommendations');
  };

  // Handle special views that don't need sidebar
  if (currentView === 'application-detail') {
    return (
      <ApplicationRecommendationsDetail 
        applicationId={selectedApplicationId} 
        onBack={handleBackFromApplicationDetail}
      />
    );
  }

  if (currentView === 'unassigned-assets') {
    return (
      <UnassignedAssetsManagement 
        onBack={handleBackFromUnassignedAssets}
      />
    );
  }

  // Recommendations view
  if (activeRecommendationTab) {
    return (
      <div className="flex h-screen" style={{ backgroundColor: '#0f172a' }}>
        <Sidebar 
          currentView={currentView} 
          onNavigate={handleNavigation} 
          onRecommendationNavigate={handleRecommendationNavigation}
        />
        <div className="flex-1 overflow-y-auto">
          {activeRecommendationTab === 'VM Recommendations' && <VMRecommendations />}
          {activeRecommendationTab === 'DB Recommendations' && <DBRecommendations />}
          {activeRecommendationTab === 'Unattached Disks' && <StorageUnattachedDisks />}
          {activeRecommendationTab === 'Idle Disks' && <StorageIdle />}
          {activeRecommendationTab === 'Size Recommendations' && <StorageSize />}
          {activeRecommendationTab === 'IOPS Recommendations' && <StorageIOPS />}
          {activeRecommendationTab === 'Application Recommendations' && (
            <ApplicationRecommendations 
              onViewRecommendations={handleViewApplicationDetail}
              onManageAssets={handleManageUnassignedAssets}
            />
          )}
          {/* Add other recommendation components as needed */}
        </div>
      </div>
    );
  }

  // Dashboard view
  if (currentView === 'dashboard') {
    return (
      <div className="flex h-screen" style={{ backgroundColor: '#0f172a' }}>
        <Sidebar 
          currentView={currentView} 
          onNavigate={handleNavigation} 
          onRecommendationNavigate={handleRecommendationNavigation}
        />
        <div className="flex-1 overflow-y-auto">
          <Dashboard 
            onViewApplications={() => setCurrentView('applications')}
            onViewAccountDetails={() => {
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
        <Sidebar 
          currentView={currentView} 
          onNavigate={handleNavigation} 
          onRecommendationNavigate={handleRecommendationNavigation}
        />
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
    return (
      <div className="flex h-screen" style={{ backgroundColor: '#0f172a' }}>
        <Sidebar 
          currentView={currentView} 
          onNavigate={handleNavigation} 
          onRecommendationNavigate={handleRecommendationNavigation}
        />
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
      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigation} 
        onRecommendationNavigate={handleRecommendationNavigation}
      />
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