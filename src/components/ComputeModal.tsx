import React from 'react';

interface ComputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  computeId: string;
}

interface ComputeConfig {
  computeType: string;
  computeId: string;
  server: string;
  spends: string;
  savings: string;
  potentialSavings: string;
  efficiency: string;
  cpuUsage: string;
  memoryUsage: string;
  network: string;
  maxCpu: string;
  maxMemory: string;
  maxNetwork: string;
}

const ComputeModal: React.FC<ComputeModalProps> = ({ isOpen, onClose, computeId }) => {
  if (!isOpen) return null;

  const computeDetails: ComputeConfig = {
    computeType: 'Virtual Machine',
    computeId: computeId,
    server: 't3a.medium',
    spends: '$700k',
    savings: '$300k',
    potentialSavings: '-',
    efficiency: '50%',
    cpuUsage: '80%',
    memoryUsage: '80%',
    network: '80%',
    maxCpu: '97%',
    maxMemory: '80%'
  };

  const currentConfig: ComputeConfig = { ...computeDetails };

  const safeConfig: ComputeConfig = {
    ...computeDetails,
    server: 't3a.small',
    potentialSavings: '$700k',
    efficiency: '60%',
    cpuUsage: '60%',
    memoryUsage: '60%',
    network: '60%',
    maxCpu: '65%',
    maxMemory: '62%'
  };

  const alternateConfig: ComputeConfig = {
    ...computeDetails,
    server: 't3a.small',
    potentialSavings: '$800k',
    efficiency: '80%',
    cpuUsage: '80%',
    memoryUsage: '80%',
    network: '80%',
    maxCpu: '70%',
    maxMemory: '68%'
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#1e293b', border: '2px solid #3b82f6' }}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid #334155' }}>
          <h2 className="text-lg font-semibold text-white">
            Details & Recommendation of Compute ID - {computeId}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:opacity-80 rounded-full text-slate-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <th className="text-left py-3 px-4 font-medium text-white">Compute details</th>
                <th className="text-center py-3 px-4 font-medium text-white">Current</th>
                <th className="text-center py-3 px-4 font-medium text-white">Safe</th>
                <th className="text-center py-3 px-4 font-medium text-white">Alternate</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td className="py-3 px-4 text-slate-300 font-medium">Compute type</td>
                <td className="py-3 px-4 text-center text-white">Virtual Machine</td>
                <td className="py-3 px-4 text-center text-white">Virtual Machine</td>
                <td className="py-3 px-4 text-center text-white">Virtual Machine</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td className="py-3 px-4 text-slate-300 font-medium">Compute ID</td>
                <td className="py-3 px-4 text-center text-white font-mono text-sm">{computeId}</td>
                <td className="py-3 px-4 text-center text-white font-mono text-sm">{computeId}</td>
                <td className="py-3 px-4 text-center text-white font-mono text-sm">{computeId}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td className="py-3 px-4 text-slate-300 font-medium">Server</td>
                <td className="py-3 px-4 text-center text-white">t3a.medium</td>
                <td className="py-3 px-4 text-center text-white">t3a.small</td>
                <td className="py-3 px-4 text-center text-white">t3a.small</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td className="py-3 px-4 text-slate-300 font-medium">Spends</td>
                <td className="py-3 px-4 text-center text-white">$700k</td>
                <td className="py-3 px-4 text-center text-white">$700k</td>
                <td className="py-3 px-4 text-center text-white">$700k</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td className="py-3 px-4 text-slate-300 font-medium">Savings</td>
                <td className="py-3 px-4 text-center text-white">$300k</td>
                <td className="py-3 px-4 text-center text-white"></td>
                <td className="py-3 px-4 text-center text-white"></td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td className="py-3 px-4 text-slate-300 font-medium">Potential savings</td>
                <td className="py-3 px-4 text-center text-white"></td>
                <td className="py-3 px-4 text-center text-white">$700k</td>
                <td className="py-3 px-4 text-center text-white">$800k</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td className="py-3 px-4 text-slate-300 font-medium">Efficiency</td>
                <td className="py-3 px-4 text-center text-white">50%</td>
                <td className="py-3 px-4 text-center text-white">60%</td>
                <td className="py-3 px-4 text-center text-white">80%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td className="py-3 px-4 text-slate-300 font-medium">CPU usage</td>
                <td className="py-3 px-4 text-center text-white">80%</td>
                <td className="py-3 px-4 text-center text-white">60%</td>
                <td className="py-3 px-4 text-center text-white">80%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td className="py-3 px-4 text-slate-300 font-medium">Memory usage</td>
                <td className="py-3 px-4 text-center text-white">80%</td>
                <td className="py-3 px-4 text-center text-white">60%</td>
                <td className="py-3 px-4 text-center text-white">80%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td className="py-3 px-4 text-slate-300 font-medium">Network</td>
                <td className="py-3 px-4 text-center text-white">80%</td>
                <td className="py-3 px-4 text-center text-white">60%</td>
                <td className="py-3 px-4 text-center text-white">80%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td className="py-3 px-4 text-slate-300 font-medium">Max CPU</td>
                <td className="py-3 px-4 text-center text-white">90</td>
                <td className="py-3 px-4 text-center text-white">85</td>
                <td className="py-3 px-4 text-center text-white">95</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td className="py-3 px-4 text-slate-300 font-medium">Max Memory</td>
                <td className="py-3 px-4 text-center text-white">80</td>
                <td className="py-3 px-4 text-center text-white">75</td>
                <td className="py-3 px-4 text-center text-white">85</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td className="py-3 px-4 text-slate-300 font-medium">Max Network</td>
                <td className="py-3 px-4 text-center text-white">30</td>
                <td className="py-3 px-4 text-center text-white">25</td>
                <td className="py-3 px-4 text-center text-white">35</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td className="py-3 px-4 text-slate-300 font-medium">Profile</td>
                <td className="py-3 px-4 text-center text-white">-</td>
                <td className="py-3 px-4 text-center text-white">-</td>
                <td className="py-3 px-4 text-center text-white">-</td>
              </tr>
            </tbody>
          </table>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            <div></div>
            <button className="px-6 py-2 text-slate-300 rounded-md text-sm font-medium" style={{ backgroundColor: '#334155' }}>
              Selected
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
              Choose & update
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
              Choose & update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComputeModal;