import React from 'react';
import {
  LayoutDashboard,
  Map,
  Trash2,
  AlertTriangle,
  BarChart3,
  Truck,
  Users,
  MessageSquare,
  FileText,
  Settings,
  Leaf,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useEco } from '../state/EcoContext';

interface EcoSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const EcoSidebar: React.FC<EcoSidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, metrics, profile } = useEco();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', count: null },
    { id: 'map', label: 'Campus Map', icon: '🗺️', count: null },
    { id: 'bins', label: 'All Bins', icon: '🗑️', count: metrics.totalBins },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: '🚨',
      count: metrics.unreadAlertsCount > 0 ? metrics.unreadAlertsCount : null,
      urgent: true,
    },
    { id: 'analytics', label: 'Analytics', icon: '📊', count: null },
    {
      id: 'collections',
      label: 'Collection Management',
      icon: '📦',
      count: metrics.collectionRequired + metrics.urgentBins,
    },
    { id: 'users', label: 'Users', icon: '👥', count: null },
    { id: 'feedback', label: 'Citizen Feedback', icon: '💬', count: null },
    { id: 'reports', label: 'Reports', icon: '📋', count: null },
    { id: 'settings', label: 'Settings', icon: '⚙️', count: null },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#143826]/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-[#f8faf7] border-r border-[#dbe6dc] flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header / Branding */}
        <div>
          <div className="p-5 border-b border-[#e2ece3] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] flex items-center justify-center text-white shadow-md shadow-[#1b4332]/20">
                <Leaf className="w-5 h-5 text-[#b7e4c7]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-base tracking-tight text-[#143826]">
                    SmartWaste
                  </span>
                  <span className="text-[10px] font-sans font-semibold uppercase px-1.5 py-0.5 rounded-full bg-[#d8f3dc] text-[#1b4332]">
                    v2 Eco
                  </span>
                </div>
                <div className="text-[11px] text-[#52796f] font-medium flex items-center gap-1">
                  <span>CUSAT Campus</span>
                  <span className="text-[#84a98c]">·</span>
                  <span className="text-[10px] text-[#6d9178] truncate max-w-[90px]" title={profile.groupProjectName}>
                    {profile.groupProjectName.split('·')[0]}
                  </span>
                </div>
              </div>
            </div>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 text-[#52796f] hover:text-[#143826] rounded-lg"
              >
                ✕
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#1b4332] text-white shadow-sm shadow-[#1b4332]/25 font-semibold'
                      : 'text-[#2d3732] hover:bg-[#ebf3ea] hover:text-[#143826]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base select-none">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.count !== null && item.count !== undefined && item.count > 0 && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-[#b7e4c7] text-[#143826]'
                            : item.urgent
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-[#d8f3dc] text-[#1b4332]'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#b7e4c7]" />}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Status (Requirement 2) */}
        <div className="p-4 border-t border-[#e2ece3] bg-[#f2f7f1] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#52796f] font-medium">System Status</span>
            <div className="flex items-center gap-1.5 font-semibold text-[#1b4332] font-mono text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Online</span>
            </div>
          </div>

          <div className="text-[10px] text-[#6d9178] flex items-center justify-between font-mono pt-1 border-t border-[#e2ece3]/60">
            <span>20 CUSAT Hubs</span>
            <span>{metrics.totalBins} IoT Streams</span>
          </div>
        </div>
      </aside>
    </>
  );
};
