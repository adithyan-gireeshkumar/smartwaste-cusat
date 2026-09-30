import React from 'react';
import {
  LayoutDashboard,
  Map,
  Trash2,
  AlertTriangle,
  Truck,
  BarChart3,
  Users,
  Share2,
  Settings,
  Cpu,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeAlertsCount: number;
  pendingCollectionsCount: number;
  pendingFeedbackCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeAlertsCount,
  pendingCollectionsCount,
  pendingFeedbackCount = 0,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Live Campus Map', icon: Map },
    { id: 'bins', label: 'Bins Directory', icon: Trash2 },
    {
      id: 'alerts',
      label: 'Alert Center',
      icon: AlertTriangle,
      badge: activeAlertsCount > 0 ? activeAlertsCount : null,
      badgeColor: 'text-amber-300 bg-amber-500/20 border-amber-500/30',
    },
    {
      id: 'collections',
      label: 'Collections',
      icon: Truck,
      badge: pendingCollectionsCount > 0 ? pendingCollectionsCount : null,
      badgeColor: 'text-blue-300 bg-blue-500/20 border-blue-500/30',
    },
    {
      id: 'feedback',
      label: 'Citizen QR & Damage',
      icon: ShieldCheck,
      badge: pendingFeedbackCount > 0 ? pendingFeedbackCount : null,
      badgeColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30',
    },
    { id: 'simulator', label: 'Sensor Simulator', icon: Cpu, highlight: true },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'team', label: 'Team & Roles', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-61px)]">
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 px-2 py-1.5 bg-slate-950/60 rounded-lg border border-slate-800">
          <div className="w-7 h-7 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">Operations Console</div>
            <div className="text-[10px] text-slate-400 font-mono">CUSAT Smart IoT v1.0</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : item.highlight
                  ? 'text-emerald-400/90 hover:text-emerald-300 hover:bg-emerald-950/30 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : ''}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Campus Info Widget in Sidebar */}
      <div className="p-3 m-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>Kalamassery Campus</span>
          <span className="font-mono text-emerald-400">Live</span>
        </div>
        <div className="space-y-1 text-[10px] text-slate-500">
          <div>Area: ~180 Acres</div>
          <div>Sensors: ESP32 Ultrasonic + Tilt</div>
          <div>Telemetry Cycle: ~5 Min Sync</div>
        </div>
      </div>
    </aside>
  );
};
