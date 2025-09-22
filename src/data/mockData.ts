import { ApplicationData, ComputeResource, CloudAccountSummary } from '../types';

export const departments = ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations', 'Product'];
export const providers: Array<'AWS' | 'Azure' | 'GCP'> = ['AWS', 'Azure', 'GCP'];

export const cloudAccountSummaryData: CloudAccountSummary[] = [
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

export const applicationData: ApplicationData[] = Array(90).fill(null).map((_, index) => ({
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

export const computeResources: ComputeResource[] = [
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

export const storageResources: ComputeResource[] = [
  { computeType: 'S3 Bucket', computeId: 'bucket-app-logs', currentServer: 'Standard', spends: '$120k', savings: '$30k', potentialSavings: '$40k', efficiency: '75%' },
  { computeType: 'EBS Volume', computeId: 'vol-0a1b2c3d4e5f6g7h', currentServer: 'Standard', spends: '$90k', savings: '$15k', potentialSavings: '$20k', efficiency: '70%' },
  { computeType: 'EFS', computeId: 'fs-0a1b2c3d', currentServer: 'General Purpose', spends: '$60k', savings: '$10k', potentialSavings: '$15k', efficiency: '68%' },
  { computeType: 'S3 Bucket', computeId: 'bucket-analytics', currentServer: 'Intelligent-Tiering', spends: '$150k', savings: '$45k', potentialSavings: '$35k', efficiency: '82%' },
  { computeType: 'EBS Volume', computeId: 'vol-1a2b3c4d5e6f7g8h', currentServer: 'st1', spends: '$40k', savings: '$6k', potentialSavings: '$8k', efficiency: '65%' },
  { computeType: 'Glacier', computeId: 'archive-project-x', currentServer: 'Deep Archive', spends: '$20k', savings: '$5k', potentialSavings: '$7k', efficiency: '80%' },
];

export const databaseResources: ComputeResource[] = [
  { computeType: 'RDS (PostgreSQL)', computeId: 'db-analytics-01', currentServer: 'db.m6g.large', spends: '$300k', savings: '$80k', potentialSavings: '$50k', efficiency: '78%', dbType: 'rds' },
  { computeType: 'RDS (MySQL)', computeId: 'db-core-01', currentServer: 'db.t4g.large', spends: '$180k', savings: '$25k', potentialSavings: '$30k', efficiency: '72%', dbType: 'rds' },
  { computeType: 'Aurora', computeId: 'aurora-cluster-01', currentServer: 'r6g.large', spends: '$400k', savings: '$120k', potentialSavings: '$70k', efficiency: '85%', dbType: 'vcore' },
  { computeType: 'DynamoDB', computeId: 'ddb-orders', currentServer: 'On-Demand', spends: '$90k', savings: '$10k', potentialSavings: '$18k', efficiency: '68%', dbType: 'dtu' },
  { computeType: 'MongoDB Atlas', computeId: 'mongo-app', currentServer: 'M30', spends: '$70k', savings: '$9k', potentialSavings: '$12k', efficiency: '66%', dbType: 'databricks' },
  { computeType: 'RDS (SQL Server)', computeId: 'db-reporting', currentServer: 'db.m5.large', spends: '$110k', savings: '$10k', potentialSavings: '$15k', efficiency: '60%', dbType: 'rds' },
];