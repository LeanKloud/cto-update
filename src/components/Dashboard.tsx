import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  TrendingDown, 
  TrendingUp, 
  ChevronRight,
  Bell,
  BarChart3,
  Filter,
  ArrowUpDown,
  Download
} from 'lucide-react';

interface ApplicationData {
  cloudAccount: string;
  applicationName: string;
  computeUsage: number;
  dbUsage: number;
  storage: number;
  diskUtilisation: number;
  idleInstances: number;
  spends: number;
  savings: number;
  status: 'active' | 'inactive';
}

interface ChartData {
  account: number;
  spendings: number;
  savings: number;
  potential: number;
  efficiency: number;
}

interface SavingsRow {
  cloudAccount: string;
  applicationName: string;
  onDemand: number;
  withSpot: number;
  withoutSpot: number;
  percent: number;
}

interface DashboardProps {
  onViewApplications: () => void;
  onViewAccountDetails: (accountId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewApplications, onViewAccountDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('AWS');
  const [selectedQuarter, setSelectedQuarter] = useState('2025, Q1');
  const [hoveredAccount, setHoveredAccount] = useState<number | null>(null);
  const [showAttentionView, setShowAttentionView] = useState(false);
  const [selectedCloudAccount, setSelectedCloudAccount] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('Usage & Cost');
  const [sortBy, setSortBy] = useState('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [hoveredSpotAccount, setHoveredSpotAccount] = useState<number | null>(null);
  const [showSpotSortDropdown, setShowSpotSortDropdown] = useState(false);
  const [spotSortBy, setSpotSortBy] = useState('');
  const [selectedTrendMetric, setSelectedTrendMetric] = useState<'Spends' | 'Savings' | 'Potential savings' | 'Efficiency'>('Spends');
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState<{ account: number; quarterIdx: number } | null>(null);
  const [selectedTrendClouds, setSelectedTrendClouds] = useState<number[]>(Array.from({ length: 10 }, (_, i) => i + 1));
  const [showCloudPicker, setShowCloudPicker] = useState(false);
  const [showSpotDetails, setShowSpotDetails] = useState(false);
  const [selectedSpotAccountForDetails, setSelectedSpotAccountForDetails] = useState<number | null>(null);
  const [showSavingsSortDropdown, setShowSavingsSortDropdown] = useState(false);
  const [savingsSortBy, setSavingsSortBy] = useState('');
  const [showAttentionFilterDropdown, setShowAttentionFilterDropdown] = useState(false);
  const [attentionFilter, setAttentionFilter] = useState('All');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const getAttentionFilterOptions = () => {
    if (activeTab === 'Usage & Cost') {
      return ['All', 'Cloud Account 1', 'Cloud Account 2', 'Cloud Account 3'];
    }
    if (activeTab === 'Disk utilisation') {
      return ['All', '> 70%', '> 65%', '> 60%'];
    }
    return ['All', '> 12', '> 10', '> 8', '> 5'];
  };

  const trendQuarters = ['2025, Q2','2025, Q1','2024, Q4','2024, Q3','2024, Q2','2024, Q1','2023, Q4','2023, Q3','2023, Q2','2023, Q1'];

  // Static datasets shaped to visually match the reference. Units are in "k" for money and percent for efficiency
  const trendData: Record<'Spends' | 'Savings' | 'Potential savings' | 'Efficiency', Record<number, number[]>> = {
    Spends: {
      1: [680, 690, 660, 720, 700, 690, 680, 740, 710, 720],
      2: [640, 630, 650, 600, 640, 660, 670, 620, 660, 650],
      3: [620, 610, 640, 700, 650, 620, 610, 640, 680, 670],
      4: [600, 590, 620, 660, 640, 650, 660, 600, 560, 600],
      5: [610, 600, 630, 670, 690, 700, 720, 760, 710, 690],
      6: [700, 640, 680, 660, 650, 640, 660, 680, 690, 700], // 2025 Q2 tooltip target 700k
      7: [590, 600, 620, 640, 660, 640, 610, 570, 620, 640],
      8: [560, 570, 600, 620, 640, 630, 610, 560, 600, 610],
      9: [580, 590, 620, 640, 610, 600, 640, 660, 690, 680],
      10: [610, 620, 650, 660, 640, 630, 650, 670, 680, 690],
    },
    Savings: {
      1: [540, 560, 520, 510, 550, 580, 600, 610, 580, 560],
      2: [520, 540, 500, 490, 530, 560, 570, 580, 560, 540],
      3: [500, 520, 540, 560, 520, 500, 520, 540, 560, 550],
      4: [480, 500, 520, 540, 520, 500, 480, 460, 500, 520],
      5: [560, 540, 520, 500, 520, 540, 560, 580, 560, 540],
      6: [600, 560, 520, 580, 560, 540, 560, 560, 560, 560], // 2025 Q2 tooltip target 600k
      7: [520, 500, 520, 540, 520, 500, 520, 540, 560, 540],
      8: [500, 480, 500, 520, 500, 480, 500, 520, 540, 520],
      9: [520, 500, 520, 540, 520, 500, 520, 540, 560, 540],
      10: [540, 520, 540, 560, 540, 520, 540, 560, 560, 560],
    },
    'Potential savings': {
      1: [600, 580, 560, 540, 520, 540, 560, 580, 600, 620],
      2: [580, 560, 540, 520, 540, 560, 580, 600, 600, 600],
      3: [620, 600, 580, 560, 540, 560, 580, 600, 620, 640],
      4: [640, 620, 600, 580, 560, 540, 560, 580, 600, 620],
      5: [660, 640, 600, 580, 560, 580, 600, 620, 640, 660],
      6: [650, 600, 620, 640, 600, 580, 600, 620, 640, 650], // 2025 Q2 tooltip target 650k
      7: [620, 600, 580, 560, 540, 560, 580, 600, 600, 620],
      8: [600, 580, 560, 540, 520, 540, 560, 580, 600, 600],
      9: [620, 600, 580, 560, 540, 560, 580, 600, 620, 640],
      10: [640, 620, 600, 580, 560, 580, 600, 620, 640, 660],
    },
    Efficiency: {
      1: [40, 42, 38, 36, 40, 44, 46, 48, 45, 43],
      2: [38, 36, 35, 34, 36, 38, 40, 42, 40, 38],
      3: [36, 34, 36, 38, 40, 38, 36, 34, 36, 38],
      4: [34, 32, 34, 36, 38, 40, 38, 36, 34, 32],
      5: [42, 40, 38, 36, 38, 40, 42, 44, 42, 40],
      6: [30, 32, 34, 33, 32, 31, 32, 33, 34, 35], // 2025 Q2 tooltip target 30%
      7: [36, 35, 34, 33, 34, 35, 36, 37, 36, 35],
      8: [34, 33, 32, 31, 32, 33, 34, 35, 34, 33],
      9: [35, 34, 33, 32, 33, 34, 35, 36, 35, 34],
      10: [36, 35, 34, 33, 34, 35, 36, 37, 36, 35],
    }
  };

  const accountColors = ['#3b82f6','#65a30d','#f97316','#ef4444','#8b5cf6','#0ea5e9','#06b6d4','#f43f5e','#22c55e','#a855f7'];

  // Chart data for 10 cloud accounts (will be sorted based on sortBy)
  const baseChartData: ChartData[] = [
    { account: 1, spendings: 400, savings: 200, potential: 300, efficiency: 75 },
    { account: 2, spendings: 600, savings: 150, potential: 400, efficiency: 65 },
    { account: 3, spendings: 500, savings: 250, potential: 350, efficiency: 80 },
    { account: 4, spendings: 300, savings: 100, potential: 200, efficiency: 60 },
    { account: 5, spendings: 550, savings: 300, potential: 450, efficiency: 85 },
    { account: 6, spendings: 700, savings: 600, potential: 650, efficiency: 90 },
    { account: 7, spendings: 450, savings: 180, potential: 280, efficiency: 70 },
    { account: 8, spendings: 520, savings: 220, potential: 380, efficiency: 75 },
    { account: 9, spendings: 480, savings: 190, potential: 320, efficiency: 72 },
    { account: 10, spendings: 580, savings: 280, potential: 420, efficiency: 82 }
  ];

  // Sort chart data based on selected sort option
  const getSortedChartData = (): ChartData[] => {
    const data = [...baseChartData];
    
    switch (sortBy) {
      case 'Efficiency (Highest to Lowest)':
        return data.sort((a, b) => b.efficiency - a.efficiency);
      case 'Efficiency (Lowest to Highest)':
        return data.sort((a, b) => a.efficiency - b.efficiency);
      case 'Spends (Highest to Lowest)':
        return data.sort((a, b) => b.spendings - a.spendings);
      case 'Spends (Lowest to Highest)':
        return data.sort((a, b) => a.spendings - b.spendings);
      case 'Savings (Highest to Lowest)':
        return data.sort((a, b) => b.savings - a.savings);
      case 'Savings (Lowest to Highest)':
        return data.sort((a, b) => a.savings - b.savings);
      case 'Potential Savings (Highest to Lowest)':
        return data.sort((a, b) => b.potential - a.potential);
      case 'Potential Savings (Lowest to Highest)':
        return data.sort((a, b) => a.potential - b.potential);
      default:
        return data;
    }
  };

  const chartData = getSortedChartData();
  const accountMatchesSearch = (acc: number) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return `cloud account ${acc}`.toLowerCase().includes(q) || String(acc).includes(q);
  };
  const filteredChartData = chartData.filter(d => accountMatchesSearch(d.account));

  // Spot savings data for the On Spot Savings chart
  const baseSpotData = [
    { account: 1, onDemand: 4500, spot: 1200, savings: 500 },
    { account: 2, onDemand: 1200, spot: 1200, savings: 0 },
    { account: 3, onDemand: 1200, spot: 1200, savings: 0 },
    { account: 4, onDemand: 2500, spot: 1500, savings: 4500 },
    { account: 5, onDemand: 4500, spot: 1500, savings: 4500 },
    { account: 6, onDemand: 3500, spot: 1500, savings: 3500 },
    { account: 7, onDemand: 4000, spot: 1500, savings: 4000 },
    { account: 8, onDemand: 3500, spot: 1500, savings: 3500 },
    { account: 9, onDemand: 2500, spot: 1500, savings: 2500 },
    { account: 10, onDemand: 3500, spot: 1500, savings: 3500 }
  ];

  // Sort spot data based on selected sort option
  const getSortedSpotData = () => {
    const data = [...baseSpotData];
    
    switch (spotSortBy) {
      case 'Savings (Highest to Lowest)':
        return data.sort((a, b) => b.savings - a.savings);
      case 'Savings (Lowest to Highest)':
        return data.sort((a, b) => a.savings - b.savings);
      case 'On Demand (Highest to Lowest)':
        return data.sort((a, b) => b.onDemand - a.onDemand);
      case 'On Demand (Lowest to Highest)':
        return data.sort((a, b) => a.onDemand - b.onDemand);
      case 'On Spot (Highest to Lowest)':
        return data.sort((a, b) => b.spot - a.spot);
      case 'On Spot (Lowest to Highest)':
        return data.sort((a, b) => a.spot - b.spot);
      default:
        return data;
    }
  };

  // Sample application data for the attention view
  const applicationData: ApplicationData[] = [
    { cloudAccount: 'Cloud Account 1', applicationName: 'Temp_Core_01', computeUsage: 60, dbUsage: 70, storage: 80, diskUtilisation: 65, idleInstances: 12, spends: 3000, savings: 10, status: 'active' },
    { cloudAccount: 'Cloud Account 1', applicationName: 'Temp_Core_01', computeUsage: 60, dbUsage: 70, storage: 80, diskUtilisation: 60, idleInstances: 8, spends: 3000, savings: 10, status: 'inactive' },
    { cloudAccount: 'Cloud Account 2', applicationName: 'Temp_Core_01', computeUsage: 60, dbUsage: 70, storage: 80, diskUtilisation: 58, idleInstances: 5, spends: 3000, savings: 10, status: 'active' },
    { cloudAccount: 'Cloud Account 3', applicationName: 'Temp_Core_01', computeUsage: 60, dbUsage: 70, storage: 80, diskUtilisation: 72, idleInstances: 15, spends: 3000, savings: 10, status: 'inactive' },
    { cloudAccount: 'Cloud Account 2', applicationName: 'Temp_Core_01', computeUsage: 60, dbUsage: 70, storage: 80, diskUtilisation: 68, idleInstances: 9, spends: 3000, savings: 10, status: 'active' },
    { cloudAccount: 'Cloud Account 1', applicationName: 'Temp_Core_01', computeUsage: 60, dbUsage: 70, storage: 80, diskUtilisation: 63, idleInstances: 7, spends: 3000, savings: 10, status: 'inactive' },
  ];

  const handleChartBarClick = (accountNumber: number) => {
    setSelectedCloudAccount(accountNumber);
    // Navigate to applications view
    const event = new CustomEvent('navigateToApplications', { detail: { cloudAccount: accountNumber } });
    window.dispatchEvent(event);
  };

  const handleBackToDashboard = () => {
    setShowAttentionView(false);
    setSelectedCloudAccount(null);
  };

  const sortOptions = [
    'Efficiency (Highest to Lowest)',
    'Efficiency (Lowest to Highest)',
    'Spends (Highest to Lowest)',
    'Spends (Lowest to Highest)',
    'Savings (Highest to Lowest)',
    'Savings (Lowest to Highest)',
    'Potential Savings (Highest to Lowest)',
    'Potential Savings (Lowest to Highest)'
  ];

  const maxValue = Math.max(...chartData.map(d => d.spendings + d.savings + d.potential));

  // If showing attention view, render that instead
  if (showAttentionView) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            
            {/* Center - Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Cloud account or Application..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Right side - Dropdowns */}
            <div className="flex items-center space-x-4">
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
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="2025, Q1">2025, Q1</option>
                  <option value="2024, Q4">2024, Q4</option>
                  <option value="2024, Q3">2024, Q3</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Attention View Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-6">Attention</h2>

            {/* Filter Tabs */}
            <div className="flex space-x-8 mb-6 border-b border-gray-200">
              {['Usage & Cost', 'Disk utilisation', 'Idle instances'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
              
              {/* Filter Icon */}
              <div className="ml-auto relative">
                <button
                  onClick={() => setShowAttentionFilterDropdown(!showAttentionFilterDropdown)}
                  className="p-2 rounded hover:bg-gray-50"
                  aria-label="Filter attention table"
                >
                  <Filter className="h-5 w-5 text-gray-500" />
                </button>
                {showAttentionFilterDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {getAttentionFilterOptions().map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setAttentionFilter(opt); setShowAttentionFilterDropdown(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${attentionFilter === opt ? 'text-blue-600' : 'text-gray-700'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Cloud Account</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Application name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <div className="flex items-center">
                        Compute usage
                        <ArrowUpDown className="ml-1 h-4 w-4 text-blue-500" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <div className="flex items-center">
                        DB usage
                        <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <div className="flex items-center">
                        Storage
                        <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <div className="flex items-center">
                        Disk utilisation
                        <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <div className="flex items-center">
                        Idle instances
                        <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <div className="flex items-center">
                        Spends
                        <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <div className="flex items-center">
                        Savings
                        <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
                      </div>
                    </th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let rows = [...applicationData];
                    // Apply contextual filter
                    if (attentionFilter && attentionFilter !== 'All') {
                      if (activeTab === 'Usage & Cost') {
                        if (attentionFilter.startsWith('Cloud Account')) {
                          rows = rows.filter((r) => r.cloudAccount === attentionFilter);
                        }
                      } else if (activeTab === 'Disk utilisation') {
                        const threshold = parseInt(attentionFilter.replace(/[^0-9]/g, '')) || 0;
                        rows = rows.filter((r) => r.diskUtilisation > threshold);
                      } else if (activeTab === 'Idle instances') {
                        const threshold = parseInt(attentionFilter.replace(/[^0-9]/g, '')) || 0;
                        rows = rows.filter((r) => r.idleInstances > threshold);
                      }
                    }
                    // Apply search term within Attention context
                    const q = searchTerm.trim().toLowerCase();
                    if (q) {
                      rows = rows.filter((r) => [r.cloudAccount, r.applicationName].some((v) => v.toLowerCase().includes(q)));
                    }
                    return rows.map((app, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          const event = new CustomEvent('navigateToApplications', { detail: { cloudAccount: app.cloudAccount } });
                          window.dispatchEvent(event);
                        }}
                      >
                        <td className="py-4 px-4 text-gray-900">{app.cloudAccount}</td>
                        <td className="py-4 px-4 text-gray-900">{app.applicationName}</td>
                        <td className="py-4 px-4 text-gray-900">{app.computeUsage}%</td>
                        <td className="py-4 px-4 text-gray-900">{app.dbUsage}%</td>
                        <td className="py-4 px-4 text-gray-900">{app.storage}%</td>
                        <td className="py-4 px-4 text-gray-900">{app.diskUtilisation}%</td>
                        <td className="py-4 px-4 text-gray-900">{app.idleInstances}</td>
                        <td className="py-4 px-4 text-gray-900">${app.spends}</td>
                        <td className="py-4 px-4 text-gray-900">${app.savings}</td>
                        <td className="py-4 px-4">
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAlertAccountClick = (accountName: string) => {
    // Map account name to account ID for navigation
    const accountMap: { [key: string]: string } = {
      'Cloud Account 1': 'ca-123',
      'Cloud Account 2': 'ca-124', 
      'Cloud Account 3': 'ca-125',
      'Cloud Account 4': 'ca-126'
    };
    
    const accountId = accountMap[accountName];
    if (accountId) {
      onViewAccountDetails(accountId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left side - could add breadcrumb or title */}
          <div></div>
          
          {/* Center - Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Cloud account or Application..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Right side - Dropdowns */}
          <div className="flex items-center space-x-4">
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
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="2025, Q1">2025, Q1</option>
                <option value="2024, Q4">2024, Q4</option>
                <option value="2024, Q3">2024, Q3</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-8 gap-6 mb-8">
          {/* Total Cloud Accounts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Cloud Accounts</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">30</div>
            <div className="text-sm text-gray-600">Efficiency 60%</div>
          </div>

          {/* VMs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">VMs</div>
            <div className="text-3xl font-bold text-gray-900">30000</div>
          </div>

          {/* App Instance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">App Instance</div>
            <div className="text-3xl font-bold text-gray-900">1200</div>
          </div>

          {/* DBs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">DBs</div>
            <div className="text-3xl font-bold text-gray-900">3000</div>
          </div>

          {/* Storage */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Storage</div>
            <div className="text-3xl font-bold text-gray-900">300</div>
          </div>

          {/* Current Spends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Current spends</div>
            <div className="text-3xl font-bold text-gray-900">$100</div>
          </div>

          {/* Current Savings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Current savings</div>
            <div className="text-3xl font-bold text-gray-900">$10</div>
          </div>

          {/* Potential Savings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Potential savings</div>
            <div className="text-3xl font-bold text-gray-900">$40</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Alerts Section - Full Width */}
          <div className="col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-900 mr-2">Alerts</h3>
                <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  2
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all
                <ChevronRight className="inline h-4 w-4 ml-1" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800">High Spend Alert</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Cloud Account 1 has the highest spend of $2.4M this quarter
                  </p>
                  <button 
                    onClick={onViewApplications}
                    className="text-xs text-red-600 hover:text-red-800 underline mt-1 block"
                  >
                    View applications →
                  </button>
                  <p className="text-xs text-red-600 mt-1">1 hour ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-800">New Asset Created</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    New EC2 instance (i-0a1b2c3d4e5f6789) created in Cloud Account 2
                  </p>
                  <button 
                    onClick={() => setSelectedAccount('ca-456')}
                    className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                  >
                    View applications →
                  </button>
                  <p className="text-xs text-blue-600 mt-1">30 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-orange-800">Resource Imbalance</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Cloud Account 1 has 3x more resources than other accounts
                  </p>
                  <button 
                    onClick={() => setSelectedAccount('ca-123')}
                    className="text-xs text-orange-600 hover:text-orange-800 underline mt-1 block"
                  >
                    View applications →
                  </button>
                  <p className="text-xs text-orange-600 mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800">Compute Outage</h4>
                  <p className="text-sm text-red-700 mt-1">
                    EC2 instance i-de0b6b3a7640000 in us-east-1 is unresponsive
                  </p>
                  <p className="text-xs text-red-600 mt-1">15 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800">Disk Outage</h4>
                  <p className="text-sm text-red-700 mt-1">
                    EBS volume vol-6124fee993bc0000 experiencing I/O errors
                  </p>
                  <p className="text-xs text-red-600 mt-1">5 minutes ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spends & Savings Chart - Full Width Below Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Spends & Savings</h3>
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                aria-label="Sort"
              >
                <BarChart3 className="h-5 w-5 text-gray-500" />
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => { setSortBy(option); setShowSortDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chart Container */}
          <div className="relative">
            <div className="flex items-end justify-between h-64 mb-4 px-4">
              {filteredChartData.map((data) => {
                const chartHeight = 200; // px - keep columns within chart area
                // Scale each stacked segment against the maximum TOTAL so stacks never exceed chartHeight
                const spendingHeight = (data.spendings / maxValue) * chartHeight;
                const savingsHeight = (data.savings / maxValue) * chartHeight;
                const potentialHeight = (data.potential / maxValue) * chartHeight;
                const efficiencyHeight = (data.efficiency / 100) * chartHeight;

                return (
                  <div
                    key={data.account}
                    className="relative flex items-end space-x-2 group cursor-pointer"
                    onMouseEnter={() => setHoveredAccount(data.account)}
                    onMouseLeave={() => setHoveredAccount(null)}
                    onClick={() => handleChartBarClick(data.account)}
                  >
                    {/* Tooltip */}
                    {hoveredAccount === data.account && data.account === 6 && (
                      <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-3 text-sm whitespace-nowrap z-10">
                        <div className="font-bold text-gray-900 mb-2">Cloud Account 6</div>
                        <div className="text-gray-600 mb-1">Spends - $700k</div>
                        <div className="text-gray-600 mb-1">Savings - $600k</div>
                        <div className="text-gray-600 mb-1">Potential savings - $650k</div>
                        <div className="text-gray-600">Efficiency - 90%</div>
                      </div>
                    )}

                    {/* Main Stacked Bar */}
                    <div className="relative flex flex-col items-center">
                      <div className="w-8 relative" style={{ height: `${200}px` }}>
                        {/* Spendings (Bottom - Red) */}
                        <div
                          className="absolute bottom-0 w-full bg-red-300 transition-all duration-200"
                          style={{ height: `${Math.max(spendingHeight, 8)}px` }}
                        ></div>
                        {/* Savings (Middle - Blue) */}
                        <div
                          className="absolute w-full bg-blue-300 transition-all duration-200"
                          style={{ 
                            height: `${Math.max(savingsHeight, 8)}px`,
                            bottom: `${Math.max(spendingHeight, 8)}px`
                          }}
                        ></div>
                        {/* Potential Savings (Top - Green) */}
                        <div
                          className="absolute w-full bg-green-400 transition-all duration-200"
                          style={{ 
                            height: `${Math.max(potentialHeight, 8)}px`,
                            bottom: `${Math.max(spendingHeight + savingsHeight, 16)}px`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Efficiency Bar (Right - Grey) */}
                    <div className="relative flex flex-col items-center">
                      <div
                        className="w-6 bg-gray-400 transition-all duration-200"
                        style={{ height: `${Math.max(efficiencyHeight, 8)}px` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis Labels */}
            <div className="flex justify-between px-4 mb-4">
              {filteredChartData.map((data) => (
                <div key={data.account} className="text-xs text-gray-600 text-center flex-1">
                  Cloud<br />Account {data.account}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mt-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                <span className="text-gray-600">Spendings</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                <span className="text-gray-600">Savings</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-gray-600">Potential Savings</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">Efficiency</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column section replicating reference (Instance breakdown + On Spot savings) */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {/* Left: Instance breakdown donut */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Instance breakdown</h3>
            <div className="flex items-center">
              {/* Donut */}
              <div className="relative" style={{ width: 220, height: 220 }}>
                <div
                  className="rounded-full"
                  style={{
                    width: '220px',
                    height: '220px',
                    background: 'conic-gradient(#00BCD4 0 70%, #4CAF50 70% 100%)'
                  }}
                ></div>
                {/* Inner hole */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-full" style={{ width: 140, height: 140 }}></div>
                  <div className="absolute text-sm font-semibold text-gray-800">70%</div>
                </div>

                {/* Tooltip callout for On Demand */}
                <div className="absolute -right-6 top-16">
                  <div className="relative bg-white border border-gray-200 rounded-lg shadow px-4 py-3 text-sm text-gray-700">
                    <div className="font-semibold text-gray-900 mb-1">On Demand</div>
                    <div>Usage - 30%</div>
                    <div>Prod - 25%</div>
                    <div>Non Prod - 5%</div>
                    {/* Arrow */}
                    <div className="absolute -left-2 top-6 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-gray-200"></div>
                    <div className="absolute -left-[7px] top-[26px] w-0 h-0 border-t-7 border-b-7 border-r-7 border-t-transparent border-b-transparent border-r-white"></div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="ml-8 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4CAF50' }}></div>
                  <span className="text-gray-700 text-sm">On Demand</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00BCD4' }}></div>
                  <span className="text-gray-700 text-sm">On Spot</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: On Spot savings bars */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">On Spot savings</h3>
              <div className="relative">
                <button
                  onClick={() => setShowSpotSortDropdown(!showSpotSortDropdown)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  aria-label="Sort On Spot"
                >
                  <BarChart3 className="h-5 w-5 text-gray-500" />
                </button>
                {showSpotSortDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {[
                      'Savings (Highest to Lowest)',
                      'Savings (Lowest to Highest)',
                      'On Demand (Highest to Lowest)',
                      'On Demand (Lowest to Highest)',
                      'On Spot (Highest to Lowest)',
                      'On Spot (Lowest to Highest)'
                    ].map((option) => (
                      <button
                        key={option}
                        onClick={() => { setSpotSortBy(option); setShowSpotSortDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="flex items-end justify-between h-48 mb-1 px-4">
                {(() => {
                  const spotData = getSortedSpotData().filter(d => accountMatchesSearch(d.account));
                  return spotData.map((data) => (
                   <div
                     key={data.account}
                     className="relative flex items-end space-x-1 group cursor-pointer"
                     onMouseEnter={() => setHoveredSpotAccount(data.account)}
                     onMouseLeave={() => setHoveredSpotAccount(null)}
                     onClick={() => { setSelectedSpotAccountForDetails(data.account); setShowSpotDetails(true); }}
                   >
                     {hoveredSpotAccount === data.account && data.account === 1 && (
                       <div className="absolute -top-28 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2 text-xs z-10 whitespace-nowrap">
                         <div className="font-bold text-gray-900 mb-1">Cloud Account 1</div>
                         <div className="text-gray-600">On Spot Savings - $500k</div>
                         <div className="text-gray-600">On Spot cost - $700k</div>
                         <div className="text-gray-600">On Demand cost - $1200k</div>
                         <div className="text-gray-600">Savings - 55%</div>
                       </div>
                     )}

                     {/* On Demand */}
                     <div 
                       className="w-4 bg-[#4CAF50] transition-all duration-300 hover:opacity-80"
                       style={{ height: `${Math.max((data.onDemand / 5000) * 180, 8)}px` }}
                     ></div>
                     {/* Spot */}
                     <div 
                       className="w-4 bg-[#00BCD4] transition-all duration-300 hover:opacity-80"
                       style={{ height: `${Math.max((data.spot / 5000) * 180, 8)}px` }}
                     ></div>
                     {/* Savings on Spot */}
                     <div 
                       className="w-4 bg-[#f28b82] transition-all duration-300 hover:opacity-80"
                       style={{ height: `${Math.max((data.savings / 5000) * 180, 8)}px` }}
                     ></div>
                   </div>
                  ));
                })()}
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between px-2 mt-3 ml-12">
                {(() => {
                  const spotData = getSortedSpotData().filter(d => accountMatchesSearch(d.account));
                  return spotData.map((d) => (
                    <div key={d.account} className="text-xs text-gray-600 text-center">
                      Cloud<br />Account {d.account}
                    </div>
                  ));
                })()}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center space-x-6 mt-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#4CAF50] rounded-full"></div>
                  <span className="text-gray-600">On Demand</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#00BCD4] rounded-full"></div>
                  <span className="text-gray-600">Spot</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#f28b82] rounded-full"></div>
                  <span className="text-gray-600">Savings on Spot</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Savings on Application modal */}
        {showSpotDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-[1100px] mt-16 border-2 border-blue-300">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Savings on Application</h3>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowSavingsSortDropdown(!showSavingsSortDropdown)}
                      className="p-2 hover:bg-gray-100 rounded"
                      aria-label="Sort savings table"
                    >
                      <Filter className="h-5 w-5 text-gray-600" />
                    </button>
                    {showSavingsSortDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        {[
                          'On Demand cost (Highest to Lowest)',
                          'On Demand cost (Lowest to Highest)',
                          'Savings with Spot (Highest to Lowest)',
                          'Savings with Spot (Lowest to Highest)',
                          'Savings without Spot (Highest to Lowest)',
                          'Savings without Spot (Lowest to Highest)',
                          '%age Savings (Highest to Lowest)',
                          '%age Savings (Lowest to Highest)'
                        ].map((option) => (
                          <button
                            key={option}
                            onClick={() => { setSavingsSortBy(option); setShowSavingsSortDropdown(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setShowSpotDetails(false)} className="p-2 hover:bg-gray-100 rounded">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-900">
                      <th className="text-left py-3 px-6 font-medium">Cloud Account</th>
                      <th className="text-left py-3 px-6 font-medium">Application name</th>
                      <th className="text-left py-3 px-6 font-medium">
                        <div className="inline-flex items-center">On Demand cost <ArrowUpDown className="ml-1 h-4 w-4" /></div>
                      </th>
                      <th className="text-left py-3 px-6 font-medium">
                        <div className="inline-flex items-center">Savings with Spot <ArrowUpDown className="ml-1 h-4 w-4" /></div>
                      </th>
                      <th className="text-left py-3 px-6 font-medium">
                        <div className="inline-flex items-center">Savings without Spot <ArrowUpDown className="ml-1 h-4 w-4" /></div>
                      </th>
                      <th className="text-left py-3 px-6 font-medium">
                        <div className="inline-flex items-center">%age Savings <ArrowUpDown className="ml-1 h-4 w-4" /></div>
                      </th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const q = searchTerm.trim().toLowerCase();
                      const filteredRows = applicationData.filter(a => {
                        if (!q) return true;
                        return [a.cloudAccount, a.applicationName, `${a.computeUsage}%`, `${a.dbUsage}%`, `${a.storage}%`, `${a.diskUtilisation}%`, `${a.idleInstances}`, `$${a.spends}`, `$${a.savings}`]
                          .some(v => String(v).toLowerCase().includes(q));
                      });
                      const rows: SavingsRow[] = Array.from({ length: 6 }).map(() => ({
                        cloudAccount: `Cloud Account ${selectedSpotAccountForDetails ?? 1}`,
                        applicationName: 'Temp_Core_01',
                        onDemand: 6000,
                        withSpot: 3000,
                        withoutSpot: 1000,
                        percent: 50,
                      }));
                      const data = [...rows];
                      switch (savingsSortBy) {
                        case 'On Demand cost (Highest to Lowest)':
                          data.sort((a, b) => b.onDemand - a.onDemand); break;
                        case 'On Demand cost (Lowest to Highest)':
                          data.sort((a, b) => a.onDemand - b.onDemand); break;
                        case 'Savings with Spot (Highest to Lowest)':
                          data.sort((a, b) => b.withSpot - a.withSpot); break;
                        case 'Savings with Spot (Lowest to Highest)':
                          data.sort((a, b) => a.withSpot - b.withSpot); break;
                        case 'Savings without Spot (Highest to Lowest)':
                          data.sort((a, b) => b.withoutSpot - a.withoutSpot); break;
                        case 'Savings without Spot (Lowest to Highest)':
                          data.sort((a, b) => a.withoutSpot - b.withoutSpot); break;
                        case '%age Savings (Highest to Lowest)':
                          data.sort((a, b) => b.percent - a.percent); break;
                        case '%age Savings (Lowest to Highest)':
                          data.sort((a, b) => a.percent - b.percent); break;
                        default:
                          break;
                      }
                      return filteredRows.slice(0, data.length).map((_, idx) => {
                        const row = data[idx];
                        return (
                          <tr key={idx} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="py-4 px-6 text-gray-900">{row.cloudAccount}</td>
                            <td className="py-4 px-6 text-gray-900">{row.applicationName}</td>
                            <td className="py-4 px-6 text-gray-900">${row.onDemand}</td>
                            <td className="py-4 px-6 text-gray-900">${row.withSpot}</td>
                            <td className="py-4 px-6 text-gray-900">${row.withoutSpot}</td>
                            <td className="py-4 px-6 text-gray-900">{row.percent}%</td>
                            <td className="py-4 px-4 text-gray-400"><ChevronRight className="h-4 w-4" /></td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Compare cost across Quarters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Compare cost across Quarters</h3>
            <div className="relative w-64">
              <button
                className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowCloudPicker(!showCloudPicker)}
              >
                <span>Selected: {selectedTrendClouds.length} clouds</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {showCloudPicker && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                  <div className="flex items-center justify-between px-2 py-1">
                    <button className="text-xs text-blue-600 hover:underline" onClick={() => setSelectedTrendClouds(Array.from({ length: 10 }, (_, i) => i + 1))}>Select all</button>
                    <button className="text-xs text-gray-500 hover:underline" onClick={() => setSelectedTrendClouds([])}>Clear</button>
                  </div>
                  <div className="max-h-48 overflow-y-auto mt-1 space-y-1">
                    {Array.from({ length: 10 }, (_, idx) => idx + 1).map((acc) => (
                      <label key={acc} className="flex items-center space-x-2 px-2 py-1 text-sm hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTrendClouds.includes(acc)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTrendClouds([...selectedTrendClouds, acc]);
                            } else {
                              setSelectedTrendClouds(selectedTrendClouds.filter(c => c !== acc));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Cloud Account {acc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metric Selector */}
          <div className="flex space-x-4 mt-6 mb-4">
            {(['Spends', 'Savings', 'Potential savings', 'Efficiency'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedTrendMetric(metric)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTrendMetric === metric
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {metric}
              </button>
            ))}
          </div>

          {/* Trend Chart */}
          <div className="relative h-80 mt-6">
            <svg width="100%" height="100%" viewBox="0 0 800 300" className="overflow-visible">
              {/* Grid lines */}
              {Array.from({ length: 6 }).map((_, i) => (
                <line
                  key={i}
                  x1="60"
                  y1={50 + i * 40}
                  x2="740"
                  y2={50 + i * 40}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              ))}
              
              {/* Y-axis */}
              <line x1="60" y1="50" x2="60" y2="250" stroke="#9ca3af" strokeWidth="2"/>
              
              {/* X-axis */}
              <line x1="60" y1="250" x2="740" y2="250" stroke="#9ca3af" strokeWidth="2"/>

              {/* Trend lines */}
              {selectedTrendClouds.map((account) => {
                const data = trendData[selectedTrendMetric][account];
                const color = accountColors[(account - 1) % accountColors.length];
                
                const points = data.map((value, idx) => {
                  const x = 60 + (idx * (680 / (trendQuarters.length - 1)));
                  const maxVal = selectedTrendMetric === 'Efficiency' ? 100 : 800;
                  const y = 250 - ((value / maxVal) * 200);
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <g key={account}>
                    <polyline
                      points={points}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      className="hover:stroke-4"
                    />
                    {/* Data points */}
                    {data.map((value, idx) => {
                      const x = 60 + (idx * (680 / (trendQuarters.length - 1)));
                      const maxVal = selectedTrendMetric === 'Efficiency' ? 100 : 800;
                      const y = 250 - ((value / maxVal) * 200);
                      
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="4"
                          fill={color}
                          className="hover:r-6 cursor-pointer"
                          onMouseEnter={() => setHoveredTrendPoint({ account, quarterIdx: idx })}
                          onMouseLeave={() => setHoveredTrendPoint(null)}
                        />
                      );
                    })}
                  </g>
                );
              })}

              {/* X-axis labels */}
              {trendQuarters.map((quarter, idx) => (
                <text
                  key={idx}
                  x={60 + (idx * (680 / (trendQuarters.length - 1)))}
                  y="270"
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {quarter}
                </text>
              ))}

              {/* Y-axis labels */}
              {Array.from({ length: 6 }).map((_, i) => {
                const maxVal = selectedTrendMetric === 'Efficiency' ? 100 : 800;
                const value = maxVal - (i * (maxVal / 5));
                const suffix = selectedTrendMetric === 'Efficiency' ? '%' : 'k';
                
                return (
                  <text
                    key={i}
                    x="50"
                    y={55 + i * 40}
                    textAnchor="end"
                    className="text-xs fill-gray-600"
                  >
                    {value}{suffix}
                  </text>
                );
              })}
            </svg>

            {/* Tooltip */}
            {hoveredTrendPoint && hoveredTrendPoint.account === 6 && hoveredTrendPoint.quarterIdx === 0 && (
              <div className="absolute bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2 text-xs z-10 pointer-events-none"
                   style={{ 
                     left: `${60 + (hoveredTrendPoint.quarterIdx * (680 / (trendQuarters.length - 1))) - 40}px`,
                     top: '20px'
                   }}>
                <div className="font-bold text-gray-900 mb-1">Cloud Account 6</div>
                <div className="text-gray-600">{trendQuarters[hoveredTrendPoint.quarterIdx]}</div>
                <div className="text-gray-600">
                  {selectedTrendMetric}: {trendData[selectedTrendMetric][hoveredTrendPoint.account][hoveredTrendPoint.quarterIdx]}
                  {selectedTrendMetric === 'Efficiency' ? '%' : 'k'}
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            {selectedTrendClouds.map((account) => (
              <div key={account} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: accountColors[(account - 1) % accountColors.length] }}
                ></div>
                <span className="text-sm text-gray-600">Cloud Account {account}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;