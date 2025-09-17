import { ApplicationData, ComputeResource, CloudAccountSummary } from '../types';

// Enhanced mock data that replicates all UI data
export const mockApiData = {
  // Dashboard summary data
  dashboardSummary: {
    totalCloudAccounts: 30,
    totalVirtualMachines: 30000,
    totalApplicationInstances: 1200,
    totalDatabases: 3000,
    totalStorage: 300, // GiB
    monthlySpend: 100000, // $100K
    monthlySavings: 10000, // $10K
    potentialSavings: 40000, // $40K
    efficiency: 60 // %
  },

  // Cloud accounts data
  cloudAccounts: [
    { id: 'ca-001', cloudAccount: 'Cloud Account 1', applications: 45, vms: 120, storage: 8, totalSpends: '$2.4M', totalSavings: '$180K', potentialSavings: '$320K', efficiency: '85%', provider: 'AWS', department: 'Engineering' },
    { id: 'ca-002', cloudAccount: 'Cloud Account 2', applications: 32, vms: 95, storage: 6, totalSpends: '$1.8M', totalSavings: '$140K', potentialSavings: '$280K', efficiency: '78%', provider: 'Azure', department: 'Sales' },
    { id: 'ca-003', cloudAccount: 'Cloud Account 3', applications: 28, vms: 78, storage: 5, totalSpends: '$1.5M', totalSavings: '$120K', potentialSavings: '$240K', efficiency: '82%', provider: 'GCP', department: 'Marketing' },
    { id: 'ca-004', cloudAccount: 'Cloud Account 4', applications: 38, vms: 105, storage: 7, totalSpends: '$2.1M', totalSavings: '$160K', potentialSavings: '$300K', efficiency: '80%', provider: 'AWS', department: 'Finance' },
    { id: 'ca-005', cloudAccount: 'Cloud Account 5', applications: 25, vms: 65, storage: 4, totalSpends: '$1.2M', totalSavings: '$95K', potentialSavings: '$180K', efficiency: '75%', provider: 'Azure', department: 'HR' },
    { id: 'ca-006', cloudAccount: 'Cloud Account 6', applications: 52, vms: 140, storage: 10, totalSpends: '$2.8M', totalSavings: '$220K', potentialSavings: '$400K', efficiency: '88%', provider: 'AWS', department: 'Operations' },
    { id: 'ca-007', cloudAccount: 'Cloud Account 7', applications: 35, vms: 88, storage: 6, totalSpends: '$1.9M', totalSavings: '$150K', potentialSavings: '$260K', efficiency: '79%', provider: 'GCP', department: 'Product' },
    { id: 'ca-008', cloudAccount: 'Cloud Account 8', applications: 41, vms: 112, storage: 8, totalSpends: '$2.2M', totalSavings: '$170K', potentialSavings: '$310K', efficiency: '83%', provider: 'Azure', department: 'Engineering' },
    { id: 'ca-009', cloudAccount: 'Cloud Account 9', applications: 29, vms: 72, storage: 5, totalSpends: '$1.6M', totalSavings: '$125K', potentialSavings: '$220K', efficiency: '77%', provider: 'AWS', department: 'Sales' },
    { id: 'ca-010', cloudAccount: 'Cloud Account 10', applications: 33, vms: 85, storage: 6, totalSpends: '$1.7M', totalSavings: '$135K', potentialSavings: '$250K', efficiency: '81%', provider: 'GCP', department: 'Marketing' },
  ] as (CloudAccountSummary & { id: string })[],

  // Applications data by cloud account
  applications: {
    'ca-001': Array(45).fill(null).map((_, index) => ({
      id: `app-001-${String(index + 1).padStart(3, '0')}`,
      cloudAccount: 'Cloud Account 1',
      applicationName: `Temp_Core_${String(index + 1).padStart(2, '0')}`,
      spends: `$${700 - (index % 5) * 10}k`,
      potentialSavings: `$${700 - (index % 7) * 20}k`,
      efficiency: `${90 - (index % 6) * 3}%`,
      department: ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations', 'Product'][index % 7],
      provider: 'AWS' as const,
    })),
    'ca-002': Array(32).fill(null).map((_, index) => ({
      id: `app-002-${String(index + 1).padStart(3, '0')}`,
      cloudAccount: 'Cloud Account 2',
      applicationName: `Azure_App_${String(index + 1).padStart(2, '0')}`,
      instanceId: `vm-${(2000000000000000000 + index).toString(16)}`,
      volumeId: `disk-${(8000000000000000000 + index).toString(16)}`,
      spends: `$${650 - (index % 4) * 15}k`,
      potentialSavings: `$${600 - (index % 6) * 25}k`,
      efficiency: `${85 - (index % 5) * 4}%`,
      department: ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations', 'Product'][index % 7],
      provider: 'Azure' as const,
    })),
    // Add similar data for other cloud accounts...
  },

  // Compute resources by application
  computeResources: {
    'app-001-001': [
      { computeType: 'Lambda', computeId: 'lambda-001', currentServer: 't3a.medium', spends: '$700k', savings: '$700k', potentialSavings: '$700k', efficiency: '90%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
      { computeType: 'Virtual Machines', computeId: 'vm-001', currentServer: 't3a.large', spends: '$850k', savings: '$200k', potentialSavings: '$300k', efficiency: '85%', maxCpu: '4 vCPU', maxMemory: '8 GB' },
      { computeType: 'Virtual desktop (Serverless)', computeId: 'vd-001', currentServer: 't3a.medium', spends: '$500k', savings: '$150k', potentialSavings: '$250k', efficiency: '88%', maxCpu: '2 vCPU', maxMemory: '4 GB' },
    ],
  },

  // Storage resources by application
  storageResources: {
    'app-001-001': [
      { computeType: 'S3 Bucket', computeId: 'bucket-app-logs', currentServer: 'Standard', spends: '$120k', savings: '$30k', potentialSavings: '$40k', efficiency: '75%' },
      { computeType: 'EBS Volume', computeId: 'vol-0a1b2c3d4e5f6g7h', currentServer: 'Standard', spends: '$90k', savings: '$15k', potentialSavings: '$20k', efficiency: '70%' },
      { computeType: 'EFS', computeId: 'fs-0a1b2c3d', currentServer: 'General Purpose', spends: '$60k', savings: '$10k', potentialSavings: '$15k', efficiency: '68%' },
    ],
  },

  // Database resources by application
  databaseResources: {
    'app-001-001': [
      { computeType: 'RDS (PostgreSQL)', computeId: 'db-analytics-01', currentServer: 'db.m6g.large', spends: '$300k', savings: '$80k', potentialSavings: '$50k', efficiency: '78%', dbType: 'rds' },
      { computeType: 'RDS (MySQL)', computeId: 'db-core-01', currentServer: 'db.t4g.large', spends: '$180k', savings: '$25k', potentialSavings: '$30k', efficiency: '72%', dbType: 'rds' },
      { computeType: 'Aurora', computeId: 'aurora-cluster-01', currentServer: 'r6g.large', spends: '$400k', savings: '$120k', potentialSavings: '$70k', efficiency: '85%', dbType: 'vcore' },
    ],
  },

  // Trends data for analytics
  trends: {
    spends: {
      quarters: ['2025, Q2','2025, Q1','2024, Q4','2024, Q3','2024, Q2','2024, Q1','2023, Q4','2023, Q3','2023, Q2','2023, Q1'],
      data: {
        1: [680, 690, 660, 720, 700, 690, 680, 740, 710, 720],
        2: [640, 630, 650, 600, 640, 660, 670, 620, 660, 650],
        3: [620, 610, 640, 700, 650, 620, 610, 640, 680, 670],
        4: [600, 590, 620, 660, 640, 650, 660, 600, 560, 600],
        5: [610, 600, 630, 670, 690, 700, 720, 760, 710, 690],
        6: [700, 640, 680, 660, 650, 640, 660, 680, 690, 700],
        7: [590, 600, 620, 640, 660, 640, 610, 570, 620, 640],
        8: [560, 570, 600, 620, 640, 630, 610, 560, 600, 610],
        9: [580, 590, 620, 640, 610, 600, 640, 660, 690, 680],
        10: [610, 620, 650, 660, 640, 630, 650, 670, 680, 690],
      }
    },
    savings: {
      quarters: ['2025, Q2','2025, Q1','2024, Q4','2024, Q3','2024, Q2','2024, Q1','2023, Q4','2023, Q3','2023, Q2','2023, Q1'],
      data: {
        1: [540, 560, 520, 510, 550, 580, 600, 610, 580, 560],
        2: [520, 540, 500, 490, 530, 560, 570, 580, 560, 540],
        3: [500, 520, 540, 560, 520, 500, 520, 540, 560, 550],
        4: [480, 500, 520, 540, 520, 500, 480, 460, 500, 520],
        5: [560, 540, 520, 500, 520, 540, 560, 580, 560, 540],
        6: [600, 560, 520, 580, 560, 540, 560, 560, 560, 560],
        7: [520, 500, 520, 540, 520, 500, 520, 540, 560, 540],
        8: [500, 480, 500, 520, 500, 480, 500, 520, 540, 520],
        9: [520, 500, 520, 540, 520, 500, 520, 540, 560, 540],
        10: [540, 520, 540, 560, 540, 520, 540, 560, 560, 560],
      }
    },
    efficiency: {
      quarters: ['2025, Q2','2025, Q1','2024, Q4','2024, Q3','2024, Q2','2024, Q1','2023, Q4','2023, Q3','2023, Q2','2023, Q1'],
      data: {
        1: [40, 42, 38, 36, 40, 44, 46, 48, 45, 43],
        2: [38, 36, 35, 34, 36, 38, 40, 42, 40, 38],
        3: [36, 34, 36, 38, 40, 38, 36, 34, 36, 38],
        4: [34, 32, 34, 36, 38, 40, 38, 36, 34, 32],
        5: [42, 40, 38, 36, 38, 40, 42, 44, 42, 40],
        6: [30, 32, 34, 33, 32, 31, 32, 33, 34, 35],
        7: [36, 35, 34, 33, 34, 35, 36, 37, 36, 35],
        8: [34, 33, 32, 31, 32, 33, 34, 35, 34, 33],
        9: [35, 34, 33, 32, 33, 34, 35, 36, 35, 34],
        10: [36, 35, 34, 33, 34, 35, 36, 37, 36, 35],
      }
    }
  },

  // Recommendations data
  recommendations: [
    {
      id: 'rec-001',
      type: 'cost-optimization',
      priority: 'high',
      title: 'Right-size EC2 instances in Cloud Account 1',
      description: 'Several EC2 instances are over-provisioned and can be downsized',
      potentialSavings: '$45K',
      cloudAccount: 'Cloud Account 1',
      affectedResources: 12
    },
    {
      id: 'rec-002',
      type: 'security',
      priority: 'critical',
      title: 'Enable encryption for S3 buckets',
      description: 'Multiple S3 buckets lack server-side encryption',
      potentialSavings: '$0',
      cloudAccount: 'Cloud Account 2',
      affectedResources: 8
    },
    {
      id: 'rec-003',
      type: 'performance',
      priority: 'medium',
      title: 'Optimize database connections',
      description: 'Database connection pooling can improve performance',
      potentialSavings: '$12K',
      cloudAccount: 'Cloud Account 3',
      affectedResources: 5
    }
  ],

  // Alerts data
  alerts: [
    {
      id: 'alert-001',
      type: 'high-spend',
      severity: 'critical',
      title: 'High Spend Alert',
      message: 'Cloud Account 1 has the highest spend of $2.4M this quarter',
      cloudAccount: 'Cloud Account 1',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      isRead: false
    },
    {
      id: 'alert-002',
      type: 'new-asset',
      severity: 'info',
      title: 'New Asset Created',
      message: 'New EC2 instance (i-0a1b2c3d4e5f6789) created in Cloud Account 2',
      cloudAccount: 'Cloud Account 2',
      timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      isRead: false
    },
    {
      id: 'alert-003',
      type: 'resource-imbalance',
      severity: 'warning',
      title: 'Resource Imbalance',
      message: 'Cloud Account 1 has 3x more resources than other accounts',
      cloudAccount: 'Cloud Account 1',
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      isRead: false
    },
    {
      id: 'alert-004',
      type: 'compute-outage',
      severity: 'critical',
      title: 'Compute Outage',
      message: 'EC2 instance i-de0b6b3a7640000 in us-east-1 is unresponsive',
      cloudAccount: 'Cloud Account 1',
      timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
      isRead: false
    },
    {
      id: 'alert-005',
      type: 'disk-outage',
      severity: 'critical',
      title: 'Disk Outage',
      message: 'EBS volume vol-6124fee993bc0000 experiencing I/O errors',
      cloudAccount: 'Cloud Account 1',
      timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      isRead: false
    }
  ],

  // Attention data for different categories
  attentionData: {
    'usage-cost': [
      { cloudAccount: 'Cloud Account 1', applicationName: 'Temp_Core_01', computeUsage: 60, dbUsage: 70, storage: 80, diskUtilisation: 65, idleInstances: 12, spends: 3000, savings: 10, status: 'active' },
      { cloudAccount: 'Cloud Account 1', applicationName: 'Temp_Core_02', computeUsage: 55, dbUsage: 65, storage: 75, diskUtilisation: 60, idleInstances: 8, spends: 2800, savings: 15, status: 'inactive' },
      { cloudAccount: 'Cloud Account 2', applicationName: 'Azure_App_01', computeUsage: 70, dbUsage: 80, storage: 85, diskUtilisation: 58, idleInstances: 5, spends: 3200, savings: 20, status: 'active' },
      { cloudAccount: 'Cloud Account 3', applicationName: 'GCP_Service_01', computeUsage: 65, dbUsage: 75, storage: 90, diskUtilisation: 72, idleInstances: 15, spends: 2900, savings: 12, status: 'inactive' },
      { cloudAccount: 'Cloud Account 2', applicationName: 'Azure_App_02', computeUsage: 58, dbUsage: 68, storage: 78, diskUtilisation: 68, idleInstances: 9, spends: 2700, savings: 18, status: 'active' },
      { cloudAccount: 'Cloud Account 1', applicationName: 'Temp_Core_03', computeUsage: 62, dbUsage: 72, storage: 82, diskUtilisation: 63, idleInstances: 7, spends: 3100, savings: 14, status: 'inactive' },
    ],
    'disk-utilisation': [
      { cloudAccount: 'Cloud Account 1', applicationName: 'Temp_Core_01', computeUsage: 60, dbUsage: 70, storage: 80, diskUtilisation: 75, idleInstances: 12, spends: 3000, savings: 10, status: 'active' },
      { cloudAccount: 'Cloud Account 3', applicationName: 'GCP_Service_01', computeUsage: 65, dbUsage: 75, storage: 90, diskUtilisation: 72, idleInstances: 15, spends: 2900, savings: 12, status: 'inactive' },
      { cloudAccount: 'Cloud Account 2', applicationName: 'Azure_App_02', computeUsage: 58, dbUsage: 68, storage: 78, diskUtilisation: 68, idleInstances: 9, spends: 2700, savings: 18, status: 'active' },
    ],
    'idle-instances': [
      { cloudAccount: 'Cloud Account 3', applicationName: 'GCP_Service_01', computeUsage: 65, dbUsage: 75, storage: 90, diskUtilisation: 72, idleInstances: 15, spends: 2900, savings: 12, status: 'inactive' },
      { cloudAccount: 'Cloud Account 1', applicationName: 'Temp_Core_01', computeUsage: 60, dbUsage: 70, storage: 80, diskUtilisation: 65, idleInstances: 12, spends: 3000, savings: 10, status: 'active' },
      { cloudAccount: 'Cloud Account 2', applicationName: 'Azure_App_02', computeUsage: 58, dbUsage: 68, storage: 78, diskUtilisation: 68, idleInstances: 9, spends: 2700, savings: 18, status: 'active' },
    ]
  },

  // Spot utilization data
  spotUtilization: [
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
  ]
};