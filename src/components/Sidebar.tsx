import React, { useState, useRef } from 'react';
import { Home, Layers, AlertTriangle, TrendingUp, FileText, Settings, User, ChevronDown, ChevronRight } from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: 'dashboard' | 'applications') => void;
  onRecommendationNavigate?: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onRecommendationNavigate }) => {
  const [recommendationsDropdownOpen, setRecommendationsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', active: currentView === 'dashboard' },
    { icon: Layers, label: 'Applications', active: currentView === 'applications' },
    { icon: AlertTriangle, label: 'Alerts', active: false },
    { icon: FileText, label: 'Reports', active: false },
  ];

  const bottomSidebarItems = [
    { icon: Settings, label: 'Settings', active: false },
    { icon: User, label: 'Arun Mehta', active: false },
  ];

  const handleRecommendationsClick = () => {
    setRecommendationsDropdownOpen(!recommendationsDropdownOpen);
  };

  const handleDropdownOptionClick = (option: string) => {
    if (onRecommendationNavigate) {
      onRecommendationNavigate(option);
    }
  };

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

          {/* Recommendations with Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={handleRecommendationsClick}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-slate-400 hover:text-white`}
            >
              <div className="flex items-center">
                <TrendingUp className="mr-3 h-5 w-5" />
                <span>Recommendations</span>
              </div>
              {recommendationsDropdownOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {/* Dropdown Menu - Recommendations */}
            {recommendationsDropdownOpen && (
              <div className="ml-8 mt-1 space-y-1 border-l-2 border-slate-600 pl-4">
                <button
                  onClick={() => handleDropdownOptionClick('VM Recommendations')}
                  className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
                >
                  VM Recommendations
                </button>
                <button
                  onClick={() => handleDropdownOptionClick('DB Recommendations')}
                  className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
                >
                  DB Recommendations
                </button>
                <button
                  onClick={() => handleDropdownOptionClick('Unattached Disks')}
                  className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
                >
                  Unattached Disks
                </button>
                <button
                  onClick={() => handleDropdownOptionClick('Idle Disks')}
                  className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
                >
                  Idle Disks
                </button>
                <button
                  onClick={() => handleDropdownOptionClick('Size Recommendations')}
                  className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
                >
                  Size Recommendations
                </button>
                <button
                  onClick={() => handleDropdownOptionClick('IOPS Recommendations')}
                  className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
                >
                  IOPS Recommendations
                </button>
                <button
                  onClick={() => handleDropdownOptionClick('Application Recommendations')}
                  className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
                >
                  Application Recommendations
                </button>
              </div>
            )}
          </div>
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