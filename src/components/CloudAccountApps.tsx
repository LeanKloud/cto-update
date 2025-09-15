import React, { useState } from 'react';
import { Search, ChevronDown, Filter } from 'lucide-react';
import { ApplicationData } from '../types';

interface CloudAccountAppsProps {
  selectedAccount: string;
  applicationData: ApplicationData[];
  onBack: () => void;
  onApplicationClick: (applicationName: string) => void;
}

const CloudAccountApps: React.FC<CloudAccountAppsProps> = ({
  selectedAccount,
  applicationData,
  onBack,
  onApplicationClick
}) => {
  const [appsSearchTerm, setAppsSearchTerm] = useState('');
  const [appsSelectedDepartment, setAppsSelectedDepartment] = useState('All Departments');
  const [appsSelectedProvider, setAppsSelectedProvider] = useState('AWS');
  const [appsSelectedPeriod, setAppsSelectedPeriod] = useState('2025, Q1');
  const [appsSortBy, setAppsSortBy] = useState('Sort by');
  const [appsSortOrder, setAppsSortOrder] = useState('Descending');

  const handleReset = () => {
    setAppsSearchTerm('');
    setAppsSelectedDepartment('All Departments');
    setAppsSelectedProvider('AWS');
    setAppsSelectedPeriod('2025, Q1');
    setAppsSortBy('Sort by');
    setAppsSortOrder('Descending');
  };

  // Filter applications
  const filteredApps = applicationData.filter(app => {
    const matchesSearch = appsSearchTerm === '' || 
      app.applicationName.toLowerCase().includes(appsSearchTerm.toLowerCase()) ||
      app.instanceId.toLowerCase().includes(appsSearchTerm.toLowerCase());
    
    const matchesDepartment = appsSelectedDepartment === 'All Departments' || 
      app.department === appsSelectedDepartment;
    
    const matchesProvider = app.provider === appsSelectedProvider;
    
    return matchesSearch && matchesDepartment && matchesProvider;
  });

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
      })
    : filteredApps;

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
            onClick={handleReset}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Spends</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Potential Savings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Efficiency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#334155' }}>
              {sortedApps.slice(0, 12).map((app, index) => (
                <tr key={index} className="hover:opacity-80">
                  <td className="px-6 py-4 text-sm text-white">{selectedAccount}</td>
                  <td className="px-6 py-4 text-sm text-blue-400 cursor-pointer hover:text-blue-300" onClick={() => onApplicationClick(app.applicationName)}>
                    {app.applicationName}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">{app.spends}</td>
                  <td className="px-6 py-4 text-sm text-green-400 font-semibold">{app.potentialSavings}</td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">{app.efficiency}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{app.department}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{app.provider}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3" style={{ backgroundColor: '#334155', borderTop: '1px solid #475569' }}>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Showing 1 to {Math.min(12, sortedApps.length)} of {sortedApps.length} results
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
  );
};

export default CloudAccountApps;