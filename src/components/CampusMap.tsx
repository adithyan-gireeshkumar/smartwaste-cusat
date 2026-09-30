import React, { useState, useMemo, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import L from 'leaflet';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  Battery,
  AlertCircle,
  Wifi,
  WifiOff,
  Radio,
  Clock,
  Compass,
  Layers,
  MapPin,
  Send,
  Zap
} from 'lucide-react';
import { WasteBin } from '../types';

interface CampusMapProps {
  bins: WasteBin[];
  selectedBin: WasteBin | null;
  onSelectBin: (bin: WasteBin) => void;
  onQuickSimulate?: (bin: WasteBin) => void;
  recentlyUpdatedBinId?: string | null;
  isWsConnected?: boolean;
  className?: string;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  bins,
  selectedBin,
  onSelectBin,
  onQuickSimulate,
  recentlyUpdatedBinId,
  isWsConnected = true,
  className = '',
}) => {
  const [mapMode, setMapMode] = useState<'leaflet' | 'blueprint' | 'satellite'>('leaflet');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NORMAL' | 'WARNING' | 'CRITICAL' | 'FULL' | 'OFFLINE'>('ALL');
  const [hoveredBin, setHoveredBin] = useState<WasteBin | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // References for Leaflet map
  const leafletContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  // References for SVG Blueprint markers for GSAP
  const blueprintMarkersRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // CUSAT campus center coordinates (Kalamassery, Kochi)
  const CUSAT_CENTER: [number, number] = [10.0445, 76.3275];

  // SVG blueprint coordinate bounds
  const minLat = 10.0402;
  const maxLat = 10.0488;
  const minLng = 76.3240;
  const maxLng = 76.3315;

  const projectCoords = (lat: number, lng: number) => {
    const xPct = Math.max(5, Math.min(95, ((lng - minLng) / (maxLng - minLng)) * 100));
    const yPct = Math.max(5, Math.min(95, ((maxLat - lat) / (maxLat - minLat)) * 100));
    return { x: xPct, y: yPct };
  };

  const filteredBins = useMemo(() => {
    return bins.filter((bin) => {
      const matchSearch =
        bin.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bin.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bin.ward && bin.ward.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || bin.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bins, searchQuery, statusFilter]);

  const getMarkerStyles = (bin: WasteBin) => {
    if (bin.device_status === 'OFFLINE' || bin.status === 'OFFLINE') {
      return {
        bg: '#475569',
        border: '#94a3b8',
        text: '#f1f5f9',
        glow: 'rgba(100, 116, 139, 0.4)',
        ping: false,
      };
    }
    if (bin.fill_level >= 100) {
      return {
        bg: '#f43f5e',
        border: '#fda4af',
        text: '#0b0f19',
        glow: 'rgba(244, 63, 94, 0.7)',
        ping: true,
      };
    }
    if (bin.fill_level >= 90) {
      return {
        bg: '#f59e0b',
        border: '#fde68a',
        text: '#0b0f19',
        glow: 'rgba(245, 158, 11, 0.7)',
        ping: true,
      };
    }
    if (bin.fill_level >= 75) {
      return {
        bg: '#eab308',
        border: '#fef08a',
        text: '#0b0f19',
        glow: 'rgba(234, 179, 8, 0.5)',
        ping: false,
      };
    }
    return {
      bg: '#10b981',
      border: '#6ee7b7',
      text: '#0b0f19',
      glow: 'rgba(16, 185, 129, 0.4)',
      ping: false,
    };
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (mapMode !== 'leaflet') {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      return;
    }

    if (!leafletContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(leafletContainerRef.current, {
        center: CUSAT_CENTER,
        zoom: 16,
        minZoom: 14,
        maxZoom: 19,
        zoomControl: false,
      });

      // CartoDB Dark Matter tiles for modern municipal IoT operations look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> · CUSAT Kalamassery',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      leafletMapRef.current = map;
    }

    return () => {
      // cleanup on mode switch
    };
  }, [mapMode]);

  // Update Leaflet markers when bins change
  useEffect(() => {
    if (mapMode !== 'leaflet' || !leafletMapRef.current) return;
    const map = leafletMapRef.current;

    // Remove existing markers that are not in filteredBins
    leafletMarkersRef.current.forEach((marker, id) => {
      if (!filteredBins.find((b) => b.id === id)) {
        marker.remove();
        leafletMarkersRef.current.delete(id);
      }
    });

    filteredBins.forEach((bin) => {
      const isSelected = selectedBin?.id === bin.id;
      const isUpdated = recentlyUpdatedBinId === bin.id;
      const style = getMarkerStyles(bin);

      const htmlContent = `
        <div class="cusat-marker-wrapper relative group" style="transform: translate(-50%, -50%);">
          ${
            style.ping
              ? `<span class="absolute -inset-1 rounded-full animate-ping opacity-75" style="background-color: ${style.bg};"></span>`
              : ''
          }
          <div class="cusat-pin-body flex items-center justify-center rounded-full shadow-lg cursor-pointer transition-all duration-300"
               style="
                 width: ${isSelected ? '38px' : '32px'};
                 height: ${isSelected ? '38px' : '32px'};
                 background-color: ${style.bg};
                 border: 2px solid ${style.border};
                 box-shadow: 0 0 ${isUpdated ? '16px 4px' : '8px 1px'} ${style.glow};
                 transform: ${isUpdated ? 'scale(1.2)' : isSelected ? 'scale(1.15)' : 'scale(1)'};
               ">
            <span style="font-size: 11px; font-weight: 700; font-family: monospace; color: ${style.text};">
              ${bin.device_status === 'OFFLINE' ? 'OFF' : `${bin.fill_level}%`}
            </span>
          </div>
          <div class="location-tooltip absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap pointer-events-none shadow"
               style="background: rgba(11, 15, 25, 0.92); color: #f1f5f9; border: 1px solid rgba(255,255,255,0.15);">
            ${bin.location_name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'cusat-leaflet-div-icon',
        html: htmlContent,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      let marker = leafletMarkersRef.current.get(bin.id);

      if (!marker) {
        marker = L.marker([bin.latitude, bin.longitude], { icon: customIcon });
        marker.on('click', () => onSelectBin(bin));
        marker.addTo(map);
        leafletMarkersRef.current.set(bin.id, marker);
      } else {
        marker.setLatLng([bin.latitude, bin.longitude]);
        marker.setIcon(customIcon);
      }

      // Smooth GSAP animation on Leaflet marker element if recently updated
      if (isUpdated) {
        const markerEl = marker.getElement();
        if (markerEl) {
          gsap.fromTo(
            markerEl,
            { scale: 1.5, filter: 'brightness(2)' },
            { scale: 1, filter: 'brightness(1)', duration: 0.65, ease: 'back.out(2)' }
          );
        }
      }
    });
  }, [filteredBins, selectedBin, recentlyUpdatedBinId, mapMode]);

  // GSAP animation for SVG Blueprint markers on real-time update
  useEffect(() => {
    if (recentlyUpdatedBinId && mapMode !== 'leaflet') {
      const el = blueprintMarkersRef.current.get(recentlyUpdatedBinId);
      if (el) {
        gsap.fromTo(
          el,
          { scale: 1.7, filter: 'brightness(2.2)' },
          { scale: 1, filter: 'brightness(1)', duration: 0.65, ease: 'back.out(2.5)' }
        );
      }
    }
  }, [recentlyUpdatedBinId, mapMode]);

  return (
    <div className={`relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col ${className}`}>
      {/* Top Map Control Bar */}
      <div className="p-3 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-20 backdrop-blur-md">
        {/* Left: Search input */}
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search CUSAT locations or Bin ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>
        </div>

        {/* Middle: Real-time WebSocket Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs">
          <Radio className={`w-3.5 h-3.5 ${isWsConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="font-mono text-[11px] text-slate-300">
            {isWsConnected ? 'Real-Time IoT WebSocket: Connected' : 'Connecting to Telemetry stream...'}
          </span>
          {recentlyUpdatedBinId && (
            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 animate-pulse">
              Live: {recentlyUpdatedBinId} updated!
            </span>
          )}
        </div>

        {/* Map Layer Mode Switcher: Original CUSAT Map (Leaflet) / Blueprint / Satellite */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950/90 rounded-lg border border-slate-800 p-0.5">
            <button
              onClick={() => setMapMode('leaflet')}
              title="Official CUSAT Interactive Street Map (OpenStreetMap / Carto)"
              className={`px-2.5 py-1 text-[11px] rounded font-medium transition-colors ${
                mapMode === 'leaflet'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Original CUSAT Map
            </button>
            <button
              onClick={() => setMapMode('blueprint')}
              title="CUSAT Campus Master Plan Blueprint"
              className={`px-2.5 py-1 text-[11px] rounded font-medium transition-colors ${
                mapMode === 'blueprint'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Master Blueprint
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              title="Aerial Satellite Backdrop"
              className={`px-2.5 py-1 text-[11px] rounded font-medium transition-colors ${
                mapMode === 'satellite'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Status Filter Segmented Buttons */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            {(['ALL', 'NORMAL', 'WARNING', 'CRITICAL', 'FULL'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  statusFilter === s ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s === 'ALL' ? 'All' : s === 'WARNING' ? 'Near Full' : s}
              </button>
            ))}
          </div>

          {/* Reset Zoom */}
          {mapMode === 'leaflet' ? (
            <div className="flex items-center bg-slate-950/80 rounded-lg border border-slate-800">
              <button
                onClick={() => leafletMapRef.current?.zoomIn()}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => leafletMapRef.current?.zoomOut()}
                className="p-1.5 text-slate-400 hover:text-white transition-colors border-l border-slate-800"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => leafletMapRef.current?.setView(CUSAT_CENTER, 16)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors border-l border-slate-800"
                title="Center CUSAT Campus"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center bg-slate-950/80 rounded-lg border border-slate-800">
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.6, +(z + 0.15).toFixed(2)))}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.85, +(z - 0.15).toFixed(2)))}
                className="p-1.5 text-slate-400 hover:text-white transition-colors border-l border-slate-800"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors border-l border-slate-800"
                title="Reset View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map Viewport Area */}
      <div className="relative flex-1 min-h-[500px] overflow-hidden bg-slate-950 flex items-center justify-center">
        {/* MODE 1: ORIGINAL CUSAT INTERACTIVE MAP (LEAFLET) */}
        {mapMode === 'leaflet' && (
          <div
            ref={leafletContainerRef}
            className="w-full h-full min-h-[500px] z-10"
            style={{ minHeight: '500px' }}
          />
        )}

        {/* MODE 2 & 3: CUSAT MASTER BLUEPRINT OR SATELLITE VECTOR CANVAS */}
        {mapMode !== 'leaflet' && (
          <div
            className="relative w-full h-full transition-transform duration-300 ease-out origin-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {mapMode === 'satellite' ? (
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950 via-slate-950 to-slate-950">
                <img
                  src="/src/assets/images/cusat_campus_aerial_1790757892486.jpg"
                  alt="CUSAT Campus Aerial View"
                  className="w-full h-full object-cover mix-blend-luminosity filter contrast-125"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px]"></div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-[#070b14] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-90"></div>
            )}

            {/* SVG Roads & Buildings Layout */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Campus Boundary */}
              <path
                d="M 12% 14% L 45% 10% L 88% 12% L 92% 78% L 76% 92% L 32% 90% L 10% 70% Z"
                fill="rgba(16, 185, 129, 0.02)"
                stroke="rgba(16, 185, 129, 0.2)"
                strokeWidth="2"
                strokeDasharray="6 4"
              />

              {/* Kalamassery Main Highway (NH 544 at Top) */}
              <line x1="5%" y1="12%" x2="95%" y2="14%" stroke="#475569" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
              <line x1="5%" y1="12%" x2="95%" y2="14%" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.7" />

              {/* Campus Roads */}
              <path d="M 38% 12% L 40% 36% L 54% 48% L 55% 72% L 42% 88%" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
              <path d="M 40% 36% L 20% 40% L 18% 66% L 32% 86%" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
              <path d="M 54% 48% L 75% 38% L 82% 52% L 72% 76% L 55% 72%" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round" />

              {/* Zones */}
              <ellipse cx="64%" cy="26%" rx="9%" ry="6%" fill="rgba(16, 185, 129, 0.06)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5" />
              <rect x="15%" y="42%" width="12%" height="15%" rx="6" fill="rgba(59, 130, 246, 0.08)" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" />
              <rect x="52%" y="42%" width="14%" height="10%" rx="6" fill="rgba(245, 158, 11, 0.06)" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="1.5" />
              <rect x="68%" y="74%" width="16%" height="12%" rx="6" fill="rgba(244, 63, 94, 0.06)" stroke="rgba(244, 63, 94, 0.25)" strokeWidth="1.5" />
            </svg>

            {/* Labels */}
            <div className="absolute top-[8%] left-[25%] pointer-events-none text-[10px] uppercase font-mono tracking-widest text-slate-500/70 font-semibold">
              NH 544 · Kalamassery Highway Arch
            </div>
            <div className="absolute top-[23%] left-[58%] pointer-events-none text-[10px] uppercase font-mono tracking-widest text-emerald-500/60 font-semibold">
              Athletic Ground & Turf
            </div>
            <div className="absolute top-[48%] left-[16%] pointer-events-none text-[10px] uppercase font-mono tracking-widest text-blue-400/60 font-semibold">
              SOE Engineering Quad
            </div>
            <div className="absolute top-[38%] left-[54%] pointer-events-none text-[10px] uppercase font-mono tracking-widest text-amber-400/60 font-semibold">
              Central Library & Amenity
            </div>
            <div className="absolute top-[78%] left-[70%] pointer-events-none text-[10px] uppercase font-mono tracking-widest text-rose-400/60 font-semibold">
              Hostels Sector (Siberia/Sanathana)
            </div>

            {/* Markers */}
            {filteredBins.map((bin) => {
              const { x, y } = projectCoords(bin.latitude, bin.longitude);
              const isSelected = selectedBin?.id === bin.id;
              const isUpdated = recentlyUpdatedBinId === bin.id;
              const style = getMarkerStyles(bin);

              return (
                <div
                  key={bin.id}
                  ref={(el) => {
                    if (el) blueprintMarkersRef.current.set(bin.id, el);
                    else blueprintMarkersRef.current.delete(bin.id);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 hover:scale-125 z-20 group"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => onSelectBin(bin)}
                  onMouseEnter={() => setHoveredBin(bin)}
                  onMouseLeave={() => setHoveredBin(null)}
                >
                  {style.ping && (
                    <span
                      className="absolute -inset-1 rounded-full animate-ping opacity-75"
                      style={{ backgroundColor: style.bg }}
                    ></span>
                  )}

                  <div
                    className="relative flex items-center justify-center rounded-full shadow-lg transition-all"
                    style={{
                      width: isSelected ? '36px' : '30px',
                      height: isSelected ? '36px' : '30px',
                      backgroundColor: style.bg,
                      border: `2px solid ${style.border}`,
                      boxShadow: `0 0 ${isUpdated ? '16px 4px' : '6px 1px'} ${style.glow}`,
                    }}
                  >
                    <span
                      className="font-mono font-bold text-[10px] tabular-nums"
                      style={{ color: style.text }}
                    >
                      {bin.device_status === 'OFFLINE' ? 'OFF' : `${bin.fill_level}%`}
                    </span>
                  </div>

                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 bg-slate-950/90 border border-slate-800 rounded text-[9px] font-medium text-slate-300 whitespace-nowrap pointer-events-none group-hover:border-emerald-500/50 group-hover:text-emerald-300">
                    {bin.location_name}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend Overlay at Bottom Right */}
        <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-[10px] text-slate-300 space-y-1.5 shadow-xl pointer-events-auto">
          <div className="font-medium text-slate-400 pb-1 border-b border-slate-800 flex items-center justify-between gap-4">
            <span className="font-semibold text-slate-200">CUSAT Smart Telemetry</span>
            <Compass className="w-3 h-3 text-slate-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>0–74% Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
            <span>75–89% Near Full (Warning)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>90–99% Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>100% Full (Overflow)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span>Offline / Sensor Error</span>
          </div>
        </div>

        {/* Real-time Push Activity Toast */}
        {recentlyUpdatedBinId && (
          <div className="absolute top-4 right-4 z-30 px-3.5 py-2 bg-emerald-950/90 border border-emerald-500/40 rounded-xl shadow-2xl backdrop-blur-md text-xs text-emerald-200 flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
            <Zap className="w-4 h-4 text-emerald-400 animate-bounce" />
            <div>
              <p className="font-semibold text-white leading-tight">Live Telemetry Pushed via WebSocket</p>
              <p className="text-[10px] font-mono text-emerald-300">
                Bin #{recentlyUpdatedBinId} marker updated in real time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
