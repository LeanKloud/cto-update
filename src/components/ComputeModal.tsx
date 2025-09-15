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

  const ConfigColumn: React.FC<{ title: string; config: ComputeConfig; isSelected?: boolean }> = ({ title, config, isSelected = false }) => (
    <div>
      <h3 className="text-sm font-medium text-white mb-4 pb-2 border-b-2 border-blue-500">{title}</h3>
      <div className="space-y-4">
        <div className="text-sm text-white">{config.computeType}</div>
        <div className="text-sm text-white font-mono">{config.computeId}</div>
        <div className="text-sm text-white">{config.server}</div>
        <div className="text-sm text-white font-semibold">{config.spends}</div>
        <div className="text-sm text-white font-semibold">{config.savings}</div>
        <div className="text-sm text-green-400 font-semibold">{config.potentialSavings}</div>
        <div className="text-sm text-white font-semibold">{config.efficiency}</div>
        <div className="text-sm text-white font-semibold">{config.cpuUsage}</div>
        <div className="text-sm text-white font-semibold">{config.memoryUsage}</div>
        <div className="text-sm text-white font-semibold">{config.network}</div>
        <div className="text-sm text-white font-semibold">{config.maxCpu}</div>
        <div className="text-sm text-white font-semibold">{config.maxMemory}</div>
      </div>
      <div className="mt-6">
        {isSelected ? (
          <button className="w-full px-4 py-2 text-slate-300 rounded-md text-sm font-medium" style={{ backgroundColor: '#334155' }}>
            Selected
          </button>
        ) : (
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
            Choose & update
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#1e293b' }}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #334155' }}>
          <h2 className="text-lg font-semibold text-white">
            Details & Recommendation of Compute ID - {computeId}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="grid grid-cols-4 gap-8">
            {/* Compute Details Column */}
            <div>
              <h3 className="text-sm font-medium text-white mb-4 pb-2 border-b-2 border-blue-500">
                Compute details
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Compute type</div>
                  <div className="text-sm text-white">{computeDetails.computeType}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Compute ID</div>
                  <div className="text-sm text-white font-mono">{computeDetails.computeId}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Server</div>
                  <div className="text-sm text-white">{computeDetails.server}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Spends</div>
                  <div className="text-sm text-white font-semibold">{computeDetails.spends}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Savings</div>
                  <div className="text-sm text-white font-semibold">{computeDetails.savings}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Potential savings</div>
                  <div className="text-sm text-green-400 font-semibold">{computeDetails.potentialSavings}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Efficiency</div>
                  <div className="text-sm text-white font-semibold">{computeDetails.efficiency}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">CPU usage</div>
                  <div className="text-sm text-white font-semibold">{computeDetails.cpuUsage}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Memory usage</div>
                  <div className="text-sm text-white font-semibold">{computeDetails.memoryUsage}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Network</div>
                  <div className="text-sm text-white font-semibold">{computeDetails.network}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Max CPU</div>
                  <div className="text-sm text-white font-semibold">{computeDetails.maxCpu}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Max Memory</div>
                  <div className="text-sm text-white font-semibold">{computeDetails.maxMemory}</div>
                </div>
              </div>
            </div>

            <ConfigColumn title="Current" config={currentConfig} isSelected />
            <ConfigColumn title="Safe" config={safeConfig} />
            <ConfigColumn title="Alternate" config={alternateConfig} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComputeModal;