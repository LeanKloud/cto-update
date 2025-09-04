import React, { useState } from 'react';
import Dashboard from './components/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const handleViewDetails = (accountId: string) => {
    setSelectedAccount(accountId);
    setCurrentView('account-details');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedAccount(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard 
        currentView={currentView}
        selectedAccount={selectedAccount}
        onViewDetails={handleViewDetails}
        onBackToDashboard={handleBackToDashboard}
      />
    </div>
  );
}

export default App;