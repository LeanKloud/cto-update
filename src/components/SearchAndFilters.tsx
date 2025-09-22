import React from 'react';
import { Search, ChevronDown, Filter } from 'lucide-react';
import { SortOrder } from '../types';

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  selectedProvider: string;
  setSelectedProvider: (provider: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  onReset: () => void;
  setCurrentPage: (page: number) => void;
  placeholder?: string;
  sortOptions?: Array<{ value: string; label: string }>;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedDepartment,
  setSelectedDepartment,
  selectedProvider,
  setSelectedProvider,
  selectedPeriod,
  setSelectedPeriod,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onReset,
  setCurrentPage,
  placeholder = "Search...",
  sortOptions = [
    { value: 'applicationName', label: 'Application Name' },
    { value: 'spends', label: 'Spends' },
    { value: 'potentialSavings', label: 'Potential Savings' },
    { value: 'efficiency', label: 'Efficiency' },
    { value: 'department', label: 'Department' }
  ]
}) => {
  return (
    <div className="p-6 m-6 mt-6" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-md text-white placeholder-slate-400"
            style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={(e) => { setSelectedDepartment(e.target.value); setCurrentPage(1); }}
              className="appearance-none rounded-lg px-4 py-2 pr-8 text-white"
              style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
            >
              <option value="All Departments">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="HR">HR</option>
              <option value="Operations">Operations</option>
              <option value="Product">Product</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedProvider}
              onChange={(e) => { setSelectedProvider(e.target.value); setCurrentPage(1); }}
              className="appearance-none rounded-lg px-4 py-2 pr-8 text-white"
              style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
            >
              <option value="All Providers">All Providers</option>
              <option value="AWS">AWS</option>
              <option value="Azure">Azure</option>
              <option value="GCP">GCP</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => { setSelectedPeriod(e.target.value); setCurrentPage(1); }}
              className="appearance-none rounded-md px-4 py-2 pr-8 text-white"
              style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
            >
              <option value="2025, Q1">2025, Q1</option>
              <option value="2024, Q4">2024, Q4</option>
              <option value="2024, Q3">2024, Q3</option>
              <option value="2024, Q2">2024, Q2</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="appearance-none rounded-lg px-3 py-2 pr-8 text-sm text-white"
              style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
            >
              <option value="">Sort by</option>
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${sortOrder === 'asc' ? 'text-blue-400' : 'text-slate-300'}`}
            style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
          >
            <Filter className="h-4 w-4 mr-2" />
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </button>

          <button
            onClick={onReset}
            className="px-3 py-2 rounded-md text-sm text-slate-300 hover:text-white"
            style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilters;