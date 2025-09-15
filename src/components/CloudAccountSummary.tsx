import React from 'react';
import { CloudAccountSummary as CloudAccountSummaryType } from '../types';

interface CloudAccountSummaryProps {
  data: CloudAccountSummaryType[];
  onAccountClick: (cloudAccount: string) => void;
}

const CloudAccountSummary: React.FC<CloudAccountSummaryProps> = ({ data, onAccountClick }) => {
  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Cloud Account Summary</h2>
        <p className="text-slate-400 mt-1">Overview of all cloud accounts with aggregated metrics</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
          <div className="text-sm font-medium text-slate-400 mb-1">Total Cloud Accounts</div>
          <div className="text-3xl font-bold text-white">{data.length}</div>
        </div>
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
          <div className="text-sm font-medium text-slate-400 mb-1">Total Applications</div>
          <div className="text-3xl font-bold text-white">{data.reduce((sum, acc) => sum + acc.applications, 0)}</div>
        </div>
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
          <div className="text-sm font-medium text-slate-400 mb-1">Total VMs</div>
          <div className="text-3xl font-bold text-white">{data.reduce((sum, acc) => sum + acc.vms, 0)}</div>
        </div>
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
          <div className="text-sm font-medium text-slate-400 mb-1">Total Storage (TB)</div>
          <div className="text-3xl font-bold text-white">{data.reduce((sum, acc) => sum + acc.storage, 0)}</div>
        </div>
      </div>

      {/* Cloud Accounts Table */}
      <div className="rounded-lg shadow-sm overflow-hidden mb-8" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead style={{ backgroundColor: '#334155' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Cloud Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Applications</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">VMs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Storage (TB)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Total Spends</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Total Savings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Potential Savings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Efficiency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#334155' }}>
              {data.map((account, index) => (
                <tr key={index} className="hover:opacity-80">
                  <td className="px-6 py-4 text-sm text-blue-400 cursor-pointer hover:text-blue-300" onClick={() => onAccountClick(account.cloudAccount)}>
                    {account.cloudAccount}
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{account.applications}</td>
                  <td className="px-6 py-4 text-sm text-white">{account.vms}</td>
                  <td className="px-6 py-4 text-sm text-white">{account.storage}</td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">{account.totalSpends}</td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">{account.totalSavings}</td>
                  <td className="px-6 py-4 text-sm text-green-400 font-semibold">{account.potentialSavings}</td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">{account.efficiency}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{account.provider}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{account.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CloudAccountSummary;