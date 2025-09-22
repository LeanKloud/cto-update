import React from 'react';
import { Home, Layers, AlertTriangle, TrendingUp, FileText, Settings, User } from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: 'dashboard' | 'applications') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const sidebarItems = [
    { icon: Home, label: 'Dashboard', active: currentView === 'dashboard' },
    { icon: Layers, label: 'Applications', active: currentView === 'applications' },
    { icon: AlertTriangle, label: 'Alerts', active: false },
    { icon: TrendingUp, label: 'Recommendations', active: false },
    { icon: FileText, label: 'Reports', active: false },
  ];

  const bottomSidebarItems = [
    { icon: Settings, label: 'Settings', active: false },
    { icon: User, label: 'Arun Mehta', active: false },
  ];

  return (
    <div className="w-64 shadow-sm flex flex-col" style={{ backgroundColor: '#1e293b', borderRight: '1px solid #334155' }}>
      <div className="flex-1 py-6">
        <nav className="space-y-1 px-3">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (item.label === 'Dashboard') onNavigate('dashboard');
                if (item.label === 'Applications') onNavigate('applications');
              }}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                item.active ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
              style={{ backgroundColor: item.active ? '#334155' : 'transparent' }}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="py-4" style={{ borderTop: '1px solid #334155' }}>
        <nav className="space-y-1 px-3">
          {bottomSidebarItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-slate-400 rounded-md hover:text-white"
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;