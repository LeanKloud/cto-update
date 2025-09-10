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