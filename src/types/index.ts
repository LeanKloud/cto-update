export interface ApplicationData {
  cloudAccount: string;
  applicationName: string;
  instanceId: string;
  volumeId: string;
  spends: string;
  potentialSavings: string;
  efficiency: string;
  department: string;
  provider: 'AWS' | 'Azure' | 'GCP';
}

export interface ComputeResource {
  computeType: string;
  computeId: string;
  currentServer: string;
  spends: string;
  savings: string;
  potentialSavings: string;
  efficiency: string;
  maxCpu?: string;
  maxMemory?: string;
  dbType?: string;
}

export interface CloudAccountSummary {
  cloudAccount: string;
  applications: number;
  vms: number;
  storage: number;
  totalSpends: string;
  totalSavings: string;
  potentialSavings: string;
  efficiency: string;
  provider: 'AWS' | 'Azure' | 'GCP';
  department: string;
}

export type ViewType = 'dashboard' | 'applications' | 'cloudAccountApps';
export type DetailCategory = 'Compute' | 'Storage' | 'Database';
export type SortOrder = 'asc' | 'desc';