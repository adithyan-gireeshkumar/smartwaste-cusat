import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  X,
  Battery,
  Wifi,
  Clock,
  Truck,
  AlertTriangle,
  Send,
  CheckCircle,
  Thermometer,
  Layers,
  MapPin,
  QrCode,
  Wrench,
  MessageSquare,
  ShieldAlert,
  Flame,
  Droplets,
  DoorOpen,
  DoorClosed,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { WasteBin, WasteCategory, LidState } from '../types';
import { api } from '../services/api';

interface BinDetailDrawerProps {
  bin: WasteBin | null;
  onClose: () => void;
  onUpdateSuccess: () => void;
  onOpenCollectionModal: (bin: WasteBin) => void;
  onOpenQRModal: (bin: WasteBin) => void;
  onOpenFeedbackModal: (bin: WasteBin) => void;
  onOpenDamageModal: (bin: WasteBin) => void;
}

export const BinDetailDrawer: React.FC<BinDetailDrawerProps> = ({
  bin,
  onClose,
  onUpdateSuccess,
  onOpenCollectionModal,
  onOpenQRModal,
  onOpenFeedbackModal,
  onOpenDamageModal,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Local state for inline sensor simulation slider
  const [simFill, setSimFill] = useState<number>(bin ? bin.fill_level : 50);
  const [simBattery, setSimBattery] = useState<number>(bin ? bin.battery_level : 90);
  const [isSubmittingSim, setIsSubmittingSim] = useState(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);
  const [isTogglingDevice, setIsTogglingDevice] = useState(false);
  const [isTogglingMismatch, setIsTogglingMismatch] = useState(false);
  const [isTogglingLid, setIsTogglingLid] = useState(false);

  useEffect(() => {
    if (bin) {
      setSimFill(bin.fill_level);
      setSimBattery(bin.battery_level);
      setSimMessage(null);
    }
  }, [bin]);

  useEffect(() => {
    if (bin && drawerRef.current && backdropRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: 'power2.out' }
      );
      gsap.fromTo(
        drawerRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.35, ease: 'power3.out' }
      );
    }
  }, [bin]);

  const handleClose = () => {
    if (drawerRef.current && backdropRef.current) {
      gsap.to(drawerRef.current, { x: '100%', duration: 0.25, ease: 'power2.in' });
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
    } else {
      onClose();
    }
  };

  const handleToggleDeviceStatus = async () => {
    if (!bin) return;
    setIsTogglingDevice(true);
    try {
      await api.toggleBinDeviceStatus(bin.id);
      onUpdateSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Toggle status failed';
      alert(message);
    } finally {
      setIsTogglingDevice(false);
    }
  };

  const handleToggleMismatch = async () => {
    if (!bin) return;
    setIsTogglingMismatch(true);
    try {
      if (bin.mismatch_detected) {
        await api.clearMismatch(bin.id);
      } else {
        const foreign = bin.category === 'PLASTIC' ? 'Food/Organic' : 'Plastic Recyclables';
        await api.simulateMismatch({ bin_id: bin.id, foreign_category: foreign, confidence: 0.94 });
      }
      onUpdateSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingMismatch(false);
    }
  };

  const handleCycleLidState = async () => {
    if (!bin) return;
    setIsTogglingLid(true);
    try {
      const nextState: LidState =
        bin.lid_status === 'CLOSED'
          ? 'OPEN'
          : bin.lid_status === 'OPEN'
          ? 'ABNORMALLY_OPEN'
          : 'CLOSED';
      await api.simulateLidStatus({ bin_id: bin.id, lid_status: nextState });
      onUpdateSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingLid(false);
    }
  };

  const handleSendSimulation = async () => {
    if (!bin) return;
    setIsSubmittingSim(true);
    setSimMessage(null);
    try {
      const res = await api.sendTelemetry({
        bin_id: bin.id,
        fill_level: simFill,
        battery_level: simBattery,
        temperature_c: bin.temperature_c,
        humidity_pct: bin.humidity_pct,
      });
      if (res.data.alertCreated) {
        setSimMessage(`Threshold Alert Generated: ${res.data.alertCreated.severity} ${res.data.alertCreated.type} (${simFill}%)`);
      } else {
        setSimMessage(`Telemetry ingested: ${simFill}%. No duplicate alert required.`);
      }
      onUpdateSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Simulation failed';
      setSimMessage(`Error: ${message}`);
    } finally {
      setIsSubmittingSim(false);
    }
  };

  if (!bin) return null;

  const getCategoryTheme = (category: WasteCategory) => {
    switch (category) {
      case 'PLASTIC':
        return {
          label: 'Plastic',
          badge: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
          bar: 'bg-blue-500',
          glow: 'shadow-blue-500/30',
        };
      case 'PAPER':
        return {
          label: 'Paper',
          badge: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          bar: 'bg-amber-400',
          glow: 'shadow-amber-400/30',
        };
      case 'METAL':
        return {
          label: 'Metal',
          badge: 'text-slate-300 bg-slate-500/10 border-slate-500/30',
          bar: 'bg-slate-400',
          glow: 'shadow-slate-400/30',
        };
      case 'ORGANIC':
        return {
          label: 'Food/Organic',
          badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          bar: 'bg-emerald-500',
          glow: 'shadow-emerald-500/30',
        };
    }
  };

  const theme = getCategoryTheme(bin.category);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        ref={backdropRef}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {bin.id}
                </span>
                <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${theme.badge}`}>
                  {theme.label}
                </span>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                    bin.status === 'FULL'
                      ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                      : bin.status === 'CRITICAL'
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                      : bin.status === 'WARNING'
                      ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                      : bin.status === 'OFFLINE'
                      ? 'text-slate-400 bg-slate-500/10 border-slate-500/30'
                      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  }`}
                >
                  {bin.status}
                </span>
              </div>
              <h2 className="text-base font-semibold text-white mt-1">{bin.location_name}</h2>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Station: {bin.station_code}</span>
                <span>·</span>
                <span className="font-mono text-slate-400">
                  Updated: {new Date(bin.last_updated).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* ALERT BANNER: Waste-Type Mismatch Detection (Requirement 2) */}
            {bin.mismatch_detected && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-500/50 rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Waste-Type Mismatch Detected</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {Math.round((bin.mismatch_confidence || 0.94) * 100)}% Match
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">{bin.mismatch_detail}</p>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={handleToggleMismatch}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] rounded font-medium transition-colors"
                  >
                    Clear Mismatch (Sorted)
                  </button>
                </div>
              </div>
            )}

            {/* ALERT BANNER: Lid Abnormally Open (Requirement 4) */}
            {bin.lid_status === 'ABNORMALLY_OPEN' && (
              <div className="p-3.5 bg-yellow-950/40 border border-yellow-500/50 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-yellow-300 font-semibold text-xs">
                  <DoorOpen className="w-4 h-4 text-yellow-400" />
                  <span>Bin Lid Abnormally Open for Too Long</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Lid has remained open for {bin.lid_open_duration_minutes} minutes. Rain water contamination and pest hazard detected.
                </p>
              </div>
            )}

            {/* Visual Images Section */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>Campus Location</span>
                </div>
                <div className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                  <img
                    src={bin.location_image || '/src/assets/images/cusat_soe_building_1790757924488.jpg'}
                    alt={bin.location_name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <span className="absolute bottom-1.5 left-2 text-[10px] text-white font-medium drop-shadow">
                    {bin.ward}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-blue-400" />
                  <span>Segregated {theme.label} Bin</span>
                </div>
                <div className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                  <img
                    src={bin.bin_image || '/src/assets/images/smart_waste_bin_1790757905872.jpg'}
                    alt={bin.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <span className="absolute bottom-1.5 left-2 text-[10px] text-emerald-300 font-mono drop-shadow">
                    {bin.capacity_liters}L · {theme.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Fill Level Gauge Card */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-400">Current Fill Level</span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Updated: {new Date(bin.last_updated).toLocaleTimeString()}
                  </div>
                </div>
                <span className="text-2xl font-bold font-mono text-white tabular-nums">
                  {bin.fill_level}%
                </span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    bin.fill_level >= 90
                      ? 'bg-rose-500'
                      : bin.fill_level >= 75
                      ? 'bg-amber-400'
                      : theme.bar
                  }`}
                  style={{ width: `${bin.fill_level}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Capacity: {bin.capacity_liters} Liters</span>
                <span className="font-mono text-slate-300">
                  {Math.round((bin.fill_level / 100) * bin.capacity_liters)}L occupied
                </span>
              </div>
            </div>

            {/* Environmental & Health Condition Sensors (Prompt Requirement 4) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {/* Temperature */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Temperature</span>
                </div>
                <div className="font-mono font-bold text-white tabular-nums">
                  {bin.temperature_c}°C
                </div>
                <span className="text-[9px] font-mono text-slate-500 block truncate">
                  {bin.thermal_condition}
                </span>
              </div>

              {/* Humidity */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  <span>Humidity</span>
                </div>
                <div className="font-mono font-bold text-white tabular-nums">
                  {bin.humidity_pct}%
                </div>
                <span className="text-[9px] font-mono text-slate-500 block">Atmospheric</span>
              </div>

              {/* Lid State */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                    <DoorClosed className="w-3.5 h-3.5 text-purple-400" />
                    <span>Lid State</span>
                  </div>
                  <button
                    onClick={handleCycleLidState}
                    disabled={isTogglingLid}
                    title="Cycle Lid state (Closed / Open / Abnormally Open)"
                    className="text-[8px] font-mono text-slate-400 hover:text-white"
                  >
                    Cycle
                  </button>
                </div>
                <div className={`font-mono font-bold text-[11px] truncate ${bin.lid_status === 'ABNORMALLY_OPEN' ? 'text-amber-400' : 'text-slate-200'}`}>
                  {bin.lid_status.replace('_', ' ')}
                </div>
                <span className="text-[9px] font-mono text-slate-500 block">
                  {bin.lid_status === 'ABNORMALLY_OPEN' ? '>20m Open' : 'Sealed'}
                </span>
              </div>

              {/* Battery & Health */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Battery</span>
                </div>
                <div className="font-mono font-bold text-white tabular-nums">
                  {bin.battery_level}%
                </div>
                <span className="text-[9px] font-mono text-emerald-400 block">Solar Charged</span>
              </div>
            </div>

            {/* Device Status & Physical Damage Banner */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">IoT Connectivity</span>
                  <span className={`font-mono font-bold ${bin.device_status === 'ONLINE' ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {bin.device_status}
                  </span>
                </div>
                <button
                  onClick={handleToggleDeviceStatus}
                  disabled={isTogglingDevice}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded"
                >
                  {isTogglingDevice ? '...' : bin.device_status === 'ONLINE' ? 'Go Offline' : 'Go Online'}
                </button>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Physical Chassis</span>
                  <span className={`font-mono font-bold ${bin.damage_status === 'DAMAGED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {bin.damage_status}
                  </span>
                </div>
                <button
                  onClick={() => onOpenDamageModal(bin)}
                  className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] rounded"
                >
                  Report Damage
                </button>
              </div>
            </div>

            {/* QR Code & Citizen Feedback Portal Button (Prompt Requirement 6) */}
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Smart Bin QR Code</h4>
                  <p className="text-[11px] text-slate-400">
                    Scannable decal for student & citizen complaint reporting.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenQRModal(bin)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
                >
                  View QR
                </button>
                <button
                  onClick={() => onOpenFeedbackModal(bin)}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Feedback</span>
                </button>
              </div>
            </div>

            {/* Quick Testing & Telemetry Simulation Console */}
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  Sensor Telemetry Simulator
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Live Engine</span>
              </div>

              {/* Waste Mismatch Simulation Button */}
              <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                <div>
                  <span className="font-semibold text-white">Waste Mismatch Test:</span>
                  <div className="text-[10px] text-slate-400">
                    {bin.mismatch_detected ? 'Mismatch is currently active' : 'Simulate improper waste in bin'}
                  </div>
                </div>
                <button
                  onClick={handleToggleMismatch}
                  disabled={isTogglingMismatch}
                  className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                    bin.mismatch_detected
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {bin.mismatch_detected ? 'Clear Mismatch' : 'Simulate Mismatch'}
                </button>
              </div>

              {/* Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Fill Level Telemetry:</span>
                  <span className="text-emerald-400 font-bold tabular-nums">{simFill}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simFill}
                  onChange={(e) => setSimFill(Number(e.target.value))}
                  className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <button
                onClick={handleSendSimulation}
                disabled={isSubmittingSim}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSubmittingSim ? (
                  <span>Sending to DRF Engine...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Telemetry to Backend</span>
                  </>
                )}
              </button>

              {simMessage && (
                <div className="p-2 bg-slate-900 border border-slate-700 rounded text-[11px] font-mono text-emerald-300">
                  {simMessage}
                </div>
              )}
            </div>

            {/* Collection Dispatch Action */}
            <div className="pt-1">
              <button
                onClick={() => onOpenCollectionModal(bin)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Truck className="w-4 h-4" />
                <span>Create Collection Task for {theme.label} Bin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
