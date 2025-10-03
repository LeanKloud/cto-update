// Filter service for fetching filter options from backend APIs

export interface Department {
  id: number;
  name: string;
  parent_dept_id?: number;
}

export interface CloudProvider {
  name: string;
  description: string;
}

export interface Application {
  name: string;
}

// Base API URL - using relative path for Vite proxy
const API_BASE_URL = '/api';

// Fetch departments from backend API
export const fetchDepartments = async (): Promise<Department[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/departments/`);
    if (!response.ok) {
      console.warn(`Departments API not available (${response.status}), using fallback data`);
      // Return fallback departments if API is not available
      return getFallbackDepartments();
    }
    const departments = await response.json();
    return departments;
  } catch (error) {
    console.error('Error fetching departments:', error);
    console.warn('Using fallback departments data');
    // Return fallback departments if API call fails
    return getFallbackDepartments();
  }
};

// Fallback departments data when API is not available
const getFallbackDepartments = (): Department[] => {
  return [
    { id: 1, name: 'Corporate', parent_dept_id: undefined },
    { id: 2, name: 'Engineering', parent_dept_id: 1 },
    { id: 3, name: 'Marketing', parent_dept_id: 1 },
    { id: 4, name: 'Sales', parent_dept_id: 1 },
    { id: 5, name: 'Finance', parent_dept_id: 1 },
    { id: 6, name: 'HR', parent_dept_id: 1 },
    { id: 7, name: 'Operations', parent_dept_id: 1 },
    { id: 8, name: 'IT', parent_dept_id: 1 },
    { id: 9, name: 'DevOps', parent_dept_id: 2 },
    { id: 10, name: 'QA', parent_dept_id: 2 }
  ];
};

// Fallback cloud providers data when API is not available
const getFallbackCloudProviders = (): CloudProvider[] => {
  return [
    { name: 'aws', description: 'AWS' },
    { name: 'azure', description: 'Azure' },
    { name: 'gcp', description: 'GCP' }
  ];
};

// Fetch cloud providers from backend API (if available)
export const fetchCloudProviders = async (): Promise<CloudProvider[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cloudproviders/`);
    if (!response.ok) {
      console.warn(`Cloud providers API not available (${response.status}), using fallback data`);
      // Return fallback providers if API is not available
      return getFallbackCloudProviders();
    }
    const providers = await response.json();
    return providers;
  } catch (error) {
    console.error('Error fetching cloud providers:', error);
    console.warn('Using fallback cloud providers data');
    // Return fallback providers if API call fails
    return getFallbackCloudProviders();
  }
};

// Fetch all filter options
export const fetchAllFilterOptions = async () => {
  try {
    const [departments, cloudProviders] = await Promise.all([
      fetchDepartments(),
      fetchCloudProviders()
    ]);
    
    return {
      departments,
      cloudProviders
    };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    throw error;
  }
};


