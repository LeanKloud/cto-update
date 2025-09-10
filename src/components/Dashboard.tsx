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
  const [showAllAlerts, setShowAllAlerts] = useState(false);

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
    { cloudAccount: 'Cloud Account 1', applicationName: 'Temp_Core_01', computeUsage: 60, dbUsage: 70, storage: 80, diskUtilisation: 63, idleInstances: 7, spends: 3000, savings: 10, status: 'active' }
  ];

  // Sample savings data for the savings table
  const savingsData: SavingsRow[] = [
    { cloudAccount: 'Cloud Account 1', applicationName: 'App_01', onDemand: 4500, withSpot: 1200, withoutSpot: 3300, percent: 73 },
    { cloudAccount: 'Cloud Account 2', applicationName: 'App_02', onDemand: 3200, withSpot: 1100, withoutSpot: 2100, percent: 66 },
    { cloudAccount: 'Cloud Account 3', applicationName: 'App_03', onDemand: 2800, withSpot: 900, withoutSpot: 1900, percent: 68 },
    { cloudAccount: 'Cloud Account 4', applicationName: 'App_04', onDemand: 5100, withSpot: 1400, withoutSpot: 3700, percent: 73 },
    { cloudAccount: 'Cloud Account 5', applicationName: 'App_05', onDemand: 3900, withSpot: 1300, withoutSpot: 2600, percent: 67 }
  ];

  const filteredApplicationData = applicationData.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.cloudAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (attentionFilter === 'All') return matchesSearch;
    
    if (activeTab === 'Usage & Cost') {
      return matchesSearch && app.cloudAccount === attentionFilter;
    } else if (activeTab === 'Disk utilisation') {
      const threshold = parseInt(attentionFilter.replace('> ', '').replace('%', ''));
      return matchesSearch && app.diskUtilisation > threshold;
    } else if (activeTab === 'Idle instances') {
      const threshold = parseInt(attentionFilter.replace('> ', ''));
      return matchesSearch && app.idleInstances > threshold;
    }
    
    return matchesSearch;
  });

  const spotData = getSortedSpotData().filter(d => accountMatchesSearch(d.account));

  const getSortedSavingsData = () => {
    const data = [...savingsData];
    
    switch (savingsSortBy) {
      case 'Savings % (Highest to Lowest)':
        return data.sort((a, b) => b.percent - a.percent);
      case 'Savings % (Lowest to Highest)':
        return data.sort((a, b) => a.percent - b.percent);
      case 'On Demand (Highest to Lowest)':
        return data.sort((a, b) => b.onDemand - a.onDemand);
      case 'On Demand (Lowest to Highest)':
        return data.sort((a, b) => a.onDemand - b.onDemand);
      case 'With Spot (Highest to Lowest)':
        return data.sort((a, b) => b.withSpot - a.withSpot);
      case 'With Spot (Lowest to Highest)':
        return data.sort((a, b) => a.withSpot - b.withSpot);
      default:
        return data;
    }
  };

  const sortedSavingsData = getSortedSavingsData();

  const alerts = [
    { id: 1, type: 'warning', message: 'High disk utilization detected in Cloud Account 3', time: '2 minutes ago', severity: 'medium' },
    { id: 2, type: 'error', message: 'Cost threshold exceeded for Cloud Account 1', time: '5 minutes ago', severity: 'high' },
    { id: 3, type: 'info', message: 'New optimization recommendations available', time: '10 minutes ago', severity: 'low' },
    { id: 4, type: 'warning', message: 'Idle instances detected in Cloud Account 2', time: '15 minutes ago', severity: 'medium' },
    { id: 5, type: 'error', message: 'Service disruption in Cloud Account 4', time: '20 minutes ago', severity: 'high' },
    { id: 6, type: 'info', message: 'Monthly report generated successfully', time: '25 minutes ago', severity: 'low' }
  ];

  const displayedAlerts = showAllAlerts ? alerts : alerts.slice(0, 2);

  const renderChart = () => {
    const maxValue = Math.max(...filteredChartData.flatMap(d => [d.spendings, d.savings, d.potential]));
    const chartHeight = 200;
    const chartWidth = 600;
    const barWidth = 40;
    const groupWidth = 140;
    const leftMargin = 60;

    return (
      <div className="relative">
        <svg width={chartWidth + leftMargin + 40} height={chartHeight + 60} className="overflow-visible">
          {/* Y-axis labels */}
          {[0, 200, 400, 600, 800].map((value, i) => (
            <g key={value}>
              <text
                x={leftMargin - 10}
                y={chartHeight - (value / maxValue) * chartHeight + 5}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {value}k
              </text>
              <line
                x1={leftMargin}
                y1={chartHeight - (value / maxValue) * chartHeight}
                x2={chartWidth + leftMargin}
                y2={chartHeight - (value / maxValue) * chartHeight}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            </g>
          ))}

          {/* Bars */}
          {filteredChartData.map((data, index) => {
            const x = leftMargin + index * groupWidth + 20;
            const spendingHeight = (data.spendings / maxValue) * chartHeight;
            const savingsHeight = (data.savings / maxValue) * chartHeight;
            const potentialHeight = (data.potential / maxValue) * chartHeight;

            return (
              <g key={data.account}>
                {/* Spending bar */}
                <rect
                  x={x}
                  y={chartHeight - spendingHeight}
                  width={barWidth}
                  height={spendingHeight}
                  fill="#3b82f6"
                  className="hover:opacity-80 cursor-pointer"
                  onMouseEnter={() => setHoveredAccount(data.account)}
                  onMouseLeave={() => setHoveredAccount(null)}
                  onClick={() => onViewAccountDetails(`cloud-account-${data.account}`)}
                />
                
                {/* Savings bar */}
                <rect
                  x={x + barWidth + 5}
                  y={chartHeight - savingsHeight}
                  width={barWidth}
                  height={savingsHeight}
                  fill="#10b981"
                  className="hover:opacity-80 cursor-pointer"
                  onMouseEnter={() => setHoveredAccount(data.account)}
                  onMouseLeave={() => setHoveredAccount(null)}
                  onClick={() => onViewAccountDetails(`cloud-account-${data.account}`)}
                />
                
                {/* Potential savings bar */}
                <rect
                  x={x + (barWidth + 5) * 2}
                  y={chartHeight - potentialHeight}
                  width={barWidth}
                  height={potentialHeight}
                  fill="#f59e0b"
                  className="hover:opacity-80 cursor-pointer"
                  onMouseEnter={() => setHoveredAccount(data.account)}
                  onMouseLeave={() => setHoveredAccount(null)}
                  onClick={() => onViewAccountDetails(`cloud-account-${data.account}`)}
                />

                {/* Account label */}
                <text
                  x={x + groupWidth / 2 - 10}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {data.account}
                </text>

                {/* Tooltip */}
                {hoveredAccount === data.account && (
                  <g>
                    <rect
                      x={x - 20}
                      y={chartHeight - Math.max(spendingHeight, savingsHeight, potentialHeight) - 80}
                      width={160}
                      height={70}
                      fill="white"
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      rx="4"
                      className="drop-shadow-lg"
                    />
                    <text x={x - 10} y={chartHeight - Math.max(spendingHeight, savingsHeight, potentialHeight) - 60} className="text-xs font-medium fill-gray-900">
                      Cloud Account {data.account}
                    </text>
                    <text x={x - 10} y={chartHeight - Math.max(spendingHeight, savingsHeight, potentialHeight) - 45} className="text-xs fill-blue-600">
                      Spends: {data.spendings}k
                    </text>
                    <text x={x - 10} y={chartHeight - Math.max(spendingHeight, savingsHeight, potentialHeight) - 30} className="text-xs fill-green-600">
                      Savings: {data.savings}k
                    </text>
                    <text x={x - 10} y={chartHeight - Math.max(spendingHeight, savingsHeight, potentialHeight) - 15} className="text-xs fill-yellow-600">
                      Potential: {data.potential}k
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Spends</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Savings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600">Potential Savings</span>
          </div>
        </div>
      </div>
    );
  };
}