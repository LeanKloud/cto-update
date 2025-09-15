import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ComputeResource, DetailCategory, SortOrder } from '../types';

interface ResourcesTableProps {
  resources: ComputeResource[];
  category: DetailCategory;
  searchTerm: string;
  sortBy: string;
  sortOrder: SortOrder;
  onResourceClick: (computeId: string) => void;
}

const ResourcesTable: React.FC<ResourcesTableProps> = ({
  resources,
  category,
  searchTerm,
  sortBy,
  sortOrder,
  onResourceClick
}) => {
  const getColumnHeaders = () => {
    switch (category) {
      case 'Compute':
        return {
          type: 'COMPUTE TYPE',
          id: 'COMPUTE ID',
          server: 'CURRENT SERVER'
        };
      case 'Storage':
        return {
          type: 'STORAGE TYPE',
          id: 'STORAGE ID',
          server: 'CURRENT TIER'
        };
      case 'Database':
        return {
          type: 'DATABASE TYPE',
          id: 'DATABASE ID',
          server: 'DB ENGINE'
        };
    }
  };

  const headers = getColumnHeaders();

  // Filter resources based on search term
  const filteredResources = searchTerm
    ? resources.filter((r) =>
        [r.computeType, r.computeId, r.currentServer, r.spends, r.savings, r.potentialSavings, r.efficiency]
          .some((v) => v.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : resources;

  // Sort resources if sortBy is selected
  const sortedResources = sortBy
    ? [...filteredResources].sort((a, b) => {
        let aValue: any = a[sortBy as keyof ComputeResource];
        let bValue: any = b[sortBy as keyof ComputeResource];

        // Handle numeric values (remove $ and k, then convert to number)
        if (typeof aValue === 'string' && aValue.includes('$')) {
          aValue = parseFloat(aValue.replace(/[$,k]/g, ''));
          bValue = parseFloat(bValue.replace(/[$,k]/g, ''));
        }

        // Handle percentage values
        if (typeof aValue === 'string' && aValue.includes('%')) {
          aValue = parseFloat(aValue.replace('%', ''));
          bValue = parseFloat(bValue.replace('%', ''));
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      })
    : filteredResources;

  return (
    <div className="px-6 py-6">
      <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead style={{ backgroundColor: '#334155' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {headers.type}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {headers.id}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {headers.server}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">SPENDS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">SAVINGS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">POTENTIAL SAVINGS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">EFFICIENCY</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#334155' }}>
              {sortedResources.map((resource, index) => (
                <tr key={index} className="hover:bg-slate-600 cursor-pointer" onClick={() => onResourceClick(resource.computeId)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{resource.computeType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 hover:text-blue-300">{resource.computeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{resource.currentServer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">{resource.spends}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">{resource.savings}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-semibold">{resource.potentialSavings}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">{resource.efficiency}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    <ChevronRight className="h-4 w-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between" style={{ backgroundColor: '#334155', borderTop: '1px solid #475569' }}>
          <div className="text-sm text-slate-400">
            Showing 12 of 90 results
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm text-slate-400 hover:text-white">←</button>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">1</button>
            <button className="px-3 py-1 text-sm text-slate-400 hover:text-white">2</button>
            <button className="px-3 py-1 text-sm text-slate-400 hover:text-white">3</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesTable;