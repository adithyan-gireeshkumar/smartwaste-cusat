import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  Menu,
  Check,
  AlertTriangle,
  MessageSquare,
  Wrench,
  Truck,
  WifiOff,
  User,
  ExternalLink,
  ChevronDown,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useEco } from '../state/EcoContext';

interface EcoHeaderProps {
  onToggleMobileMenu: () => void;
  onSwitchToClassic: () => void;
}

export const EcoHeader: React.FC<EcoHeaderProps> = ({ onToggleMobileMenu, onSwitchToClassic }) => {
  const {
    profile,
    alerts,
    searchQuery,
    setSearchQuery,
    metrics,
    markAlertRead,
    markAllAlertsRead,
    setProfileModalOpen,
    setActiveTab,
    setSelectedBin,
    bins
  } = useEco();

  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadAlerts = alerts.filter((a) => !a.isRead && !a.isResolved);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'WRONG_WASTE':
        return '⚠️';
      case 'BIN_DAMAGED':
        return '🔧';
      case 'BIN_OPENED':
        return '🔓';
      case 'SENSOR_OFFLINE':
        return '📡';
      default:
        return '🚨';
    }
  };

  return (
    <header className="h-16 bg-[#fbfdfa] border-b border-[#dbe6dc] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Mobile hamburger + Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-[#2d3732] hover:bg-[#eef5ed] rounded-xl"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5 text-[#143826]" />
        </button>

        <div className="relative w-full max-w-xs sm:max-w-sm">
          <Search className="w-4 h-4 text-[#84a98c] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Bin ID, Location, Category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#f0f6ef] border border-[#d3e2d5] rounded-xl text-xs text-[#1f2923] placeholder-[#84a98c] focus:outline-none focus:border-[#2d6a4f] focus:bg-white transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#84a98c] hover:text-[#1f2923]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions, Notification Bell, Admin Profile, Version Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Switcher to Classic Dark Mode (Preserves existing project!) */}
        <button
          onClick={onSwitchToClassic}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#edf5ec] hover:bg-[#e1ede0] text-[#1b4332] border border-[#cce0ce] rounded-xl text-xs font-medium transition-colors"
          title="Switch to original Classic Dark Theme"
        >
          <span className="text-xs">⚡</span>
          <span>Classic Mode</span>
        </button>

        {/* Notification Bell Dropdown (Requirement 20) */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setBellOpen(!bellOpen)}
            className="relative p-2 text-[#2d3732] hover:bg-[#eef5ed] rounded-xl transition-colors"
            title="Campus Notifications & Alerts"
          >
            <Bell className="w-5 h-5 text-[#1b4332]" />
            {metrics.unreadAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-white font-mono text-[9px] font-bold shadow-xs">
                {metrics.unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Bell Dropdown Panel */}
          {bellOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#fbfdfa] border border-[#cce0ce] rounded-2xl shadow-xl z-50 overflow-hidden text-xs">
              <div className="p-3.5 border-b border-[#e2ece3] bg-[#f2f7f1] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#143826]">Notifications & Alerts</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#d8f3dc] text-[#1b4332] font-mono text-[10px] font-bold">
                    {unreadAlerts.length} Unread
                  </span>
                </div>
                {unreadAlerts.length > 0 && (
                  <button
                    onClick={() => {
                      markAllAlertsRead();
                    }}
                    className="text-[11px] text-[#2d6a4f] hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#edf3ec]">
                {unreadAlerts.length === 0 ? (
                  <div className="p-6 text-center text-[#52796f] space-y-1">
                    <p className="font-medium text-xs text-[#2d3732]">No unread alerts</p>
                    <p className="text-[11px]">All CUSAT smart waste stations are operating nominally.</p>
                  </div>
                ) : (
                  unreadAlerts.map((alt) => (
                    <div
                      key={alt.id}
                      className="p-3 hover:bg-[#f4f8f3] transition-colors flex items-start gap-2.5 cursor-pointer"
                      onClick={() => {
                        markAlertRead(alt.id);
                        const targetBin = bins.find((b) => b.id === alt.binId);
                        if (targetBin) setSelectedBin(targetBin);
                        setActiveTab('alerts');
                        setBellOpen(false);
                      }}
                    >
                      <span className="text-base shrink-0 mt-0.5">{getAlertIcon(alt.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#143826] truncate">{alt.title}</span>
                          <span className="text-[10px] font-mono text-[#84a98c]">
                            {new Date(alt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#52796f] line-clamp-2 mt-0.5">{alt.description}</p>
                        <div className="text-[10px] font-mono text-[#2d6a4f] mt-1 font-medium">
                          {alt.locationName} · {alt.binId}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-[#f4f7f2] border-t border-[#e2ece3] text-center">
                <button
                  onClick={() => {
                    setActiveTab('alerts');
                    setBellOpen(false);
                  }}
                  className="text-xs font-semibold text-[#1b4332] hover:text-[#2d6a4f] flex items-center justify-center gap-1 mx-auto"
                >
                  <span>Open Full Alerts Command Center</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Widget (Requirement 3: Editable Admin Name & Group/Project Name) */}
        <button
          onClick={() => setProfileModalOpen(true)}
          className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-[#d3e2d5] hover:border-[#2d6a4f] bg-[#f4f8f3] hover:bg-[#eef5ed] transition-all text-left group shadow-2xs"
          title="Click to edit Admin Profile & Group/Project Name"
        >
          <div className="relative">
            <img
              src={profile.profileImage}
              alt={profile.adminName}
              className="w-8 h-8 rounded-full object-cover border border-[#b7e4c7]"
              onError={(e) => {
                // fallback
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80';
              }}
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white"></span>
          </div>

          <div className="hidden sm:block text-left max-w-[140px]">
            <div className="text-xs font-bold text-[#143826] truncate group-hover:text-[#2d6a4f] transition-colors">
              {profile.adminName}
            </div>
            <div className="text-[10px] text-[#52796f] truncate font-medium">
              {profile.groupProjectName}
            </div>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-[#84a98c] group-hover:text-[#143826] transition-colors hidden sm:block" />
        </button>
      </div>
    </header>
  );
};
