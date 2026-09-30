import React from 'react';
import { Bell, Cpu, RefreshCw, Shield, MapPin } from 'lucide-react';
import { DashboardSummary, OrganizationSettings } from '../types';

interface HeaderProps {
  summary: DashboardSummary | null;
  org: OrganizationSettings | null;
  onOpenSimulator: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  activeTab: string;
  isWsConnected?: boolean;
  onSwitchToEco?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  org,
  onOpenSimulator,
  onRefresh,
  isRefreshing,
  activeTab,
  isWsConnected = true,
  onSwitchToEco,
}) => {
  const activeAlertsCount = summary?.active_alerts || 0;
  const criticalCount = summary?.critical || 0;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Zone 1: Brand wordmark & view indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base shadow-sm">
            SW
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
              <span>{org?.name || 'SmartWaste CUSAT'}</span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="hidden sm:inline-block text-xs font-normal text-slate-400">
                Kochi Campus
              </span>
            </h1>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-800 pl-4">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span className="truncate max-w-[280px]">
            {org?.campus || 'Cochin University of Science and Technology'}
          </span>
        </div>
      </div>

      {/* Zone 2: Status & Tab breadcrumb */}
      <div className="hidden md:flex items-center gap-4 text-xs font-mono tabular-nums text-slate-400">
        <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300">20 Bins Active</span>
          <span className="text-slate-600">·</span>
          <span className={criticalCount > 0 ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
            {criticalCount} Critical
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-amber-400">
            {activeAlertsCount} Alerts
          </span>
          <span className="text-slate-600">·</span>
          <span className={isWsConnected ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
            {isWsConnected ? 'WS Live' : 'Reconnecting'}
          </span>
        </div>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Sync live telemetry"
          className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>

        {onSwitchToEco && (
          <button
            onClick={onSwitchToEco}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            title="Switch to New Eco-Tech Nature Edition (v2)"
          >
            <span>🌿</span>
            <span>Eco Mode (v2)</span>
          </button>
        )}

        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-lg transition-colors shadow-sm"
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>Simulate Sensor</span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
            SK
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-medium text-slate-200 leading-tight">Dr. Suresh Kumar</p>
            <p className="text-[10px] text-emerald-400 font-mono">SUPER ADMIN</p>
          </div>
        </div>
      </div>
    </header>
  );
};
