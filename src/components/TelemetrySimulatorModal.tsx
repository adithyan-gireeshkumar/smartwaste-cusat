import React, { useState } from 'react';
import { X, Send, Cpu, CheckCircle2, ArrowRight, Zap, RefreshCw, MessageSquare } from 'lucide-react';
import { WasteBin } from '../types';
import { api } from '../services/api';

interface TelemetrySimulatorModalProps {
  bins: WasteBin[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultBinId?: string;
}

export const TelemetrySimulatorModal: React.FC<TelemetrySimulatorModalProps> = ({
  bins,
  isOpen,
  onClose,
  onSuccess,
  defaultBinId,
}) => {
  const [selectedBinId, setSelectedBinId] = useState<string>(
    defaultBinId || (bins.find((b) => b.id === 'CUSAT-WB-010')?.id || bins[0]?.id || '')
  );
  const [fillLevel, setFillLevel] = useState<number>(76);
  const [batteryLevel, setBatteryLevel] = useState<number>(84);
  const [temperature, setTemperature] = useState<number>(30.5);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [lastResponse, setLastResponse] = useState<unknown | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBin = bins.find((b) => b.id === selectedBinId) || bins[0];

  const handleSend = async (customFill?: number) => {
    const targetFill = customFill !== undefined ? customFill : fillLevel;
    setIsSending(true);
    setErrorMsg(null);
    try {
      const res = await api.sendTelemetry({
        bin_id: selectedBinId,
        fill_level: targetFill,
        battery_level: batteryLevel,
        temperature_c: temperature,
      });
      setLastResponse(res);
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Telemetry simulation failed';
      setErrorMsg(message);
    } finally {
      setIsSending(false);
    }
  };

  const payloadPreview = {
    bin_id: selectedBinId,
    fill_level: fillLevel,
    battery_level: batteryLevel,
    temperature_c: temperature,
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">IoT Sensor Telemetry Simulator</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Hardware Emulation Studio · Section 20 REST Endpoint
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Quick MVP Scenario Presets */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Quick Test Presets (MVP Workflow)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedBinId('CUSAT-WB-010');
                  setFillLevel(76);
                  handleSend(76);
                }}
                className="p-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-left transition-colors"
              >
                <div className="font-semibold text-yellow-300">1. Simulate 76% on New SOE</div>
                <div className="text-[10px] text-slate-400">Crosses 75% threshold → Generates Warning Alert</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedBinId('CUSAT-WB-004');
                  setFillLevel(92);
                  handleSend(92);
                }}
                className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-left transition-colors"
              >
                <div className="font-semibold text-amber-300">2. Simulate 92% on CEE Block</div>
                <div className="text-[10px] text-slate-400">Crosses 90% threshold → Generates Critical Alert</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedBinId('CUSAT-WB-018');
                  setFillLevel(100);
                  handleSend(100);
                }}
                className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-left transition-colors"
              >
                <div className="font-semibold text-rose-300">3. Simulate 100% on Hostel Area</div>
                <div className="text-[10px] text-slate-400">Maximum overflow → Urgent collection trigger</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentBin) {
                    setFillLevel(12);
                    handleSend(12);
                  }
                }}
                className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-left transition-colors"
              >
                <div className="font-semibold text-emerald-300">4. Drain Bin to 12% (Empty)</div>
                <div className="text-[10px] text-slate-400">Returns to normal → Auto-resolves active alert</div>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsSending(true);
                  setErrorMsg(null);
                  try {
                    const plasticBin = bins.find((b) => b.category === 'PLASTIC') || currentBin;
                    const res = await api.simulateMismatch({
                      bin_id: plasticBin.id,
                      foreign_category: 'Food/Organic',
                      confidence: 0.94,
                    });
                    setLastResponse(res);
                    onSuccess();
                  } catch (err: unknown) {
                    setErrorMsg(err instanceof Error ? err.message : 'Mismatch simulation failed');
                  } finally {
                    setIsSending(false);
                  }
                }}
                className="p-2.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 rounded-lg text-left transition-colors"
              >
                <div className="font-semibold text-rose-300">5. ⚠️ Simulate Waste Mismatch</div>
                <div className="text-[10px] text-slate-400">Food detected in Plastic bin → Generates high-confidence alert</div>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsSending(true);
                  setErrorMsg(null);
                  try {
                    const res = await api.simulateLidStatus({
                      bin_id: currentBin.id,
                      lid_status: 'ABNORMALLY_OPEN',
                    });
                    setLastResponse(res);
                    onSuccess();
                  } catch (err: unknown) {
                    setErrorMsg(err instanceof Error ? err.message : 'Lid simulation failed');
                  } finally {
                    setIsSending(false);
                  }
                }}
                className="p-2.5 bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/40 rounded-lg text-left transition-colors"
              >
                <div className="font-semibold text-yellow-300">6. 🚪 Simulate Lid Open &gt;25 min</div>
                <div className="text-[10px] text-slate-400">Rain & odor hazard → Triggers hygiene alert</div>
              </button>
            </div>
          </div>

          {/* Form Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Target Waste Bin</label>
              <select
                value={selectedBinId}
                onChange={(e) => setSelectedBinId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {bins.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.location_name} (Now: {b.fill_level}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-300">Simulate Fill Level</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">{fillLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={fillLevel}
                onChange={(e) => setFillLevel(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer mt-2"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-300">Battery Level</span>
                <span className="font-mono text-slate-300 tabular-nums">{batteryLevel}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={batteryLevel}
                onChange={(e) => setBatteryLevel(Number(e.target.value))}
                className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-300">Internal Sensor Temp</span>
                <span className="font-mono text-slate-300 tabular-nums">{temperature}°C</span>
              </div>
              <input
                type="number"
                step="0.5"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          {/* JSON Payload Preview & Action */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>POST /api/telemetry/</span>
              <span className="text-emerald-400">Content-Type: application/json</span>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto">
              {JSON.stringify(payloadPreview, null, 2)}
            </pre>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {Boolean(lastResponse) && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs space-y-2">
              <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Backend Response Received</span>
              </div>
              <pre className="p-2 bg-slate-950/80 rounded font-mono text-[10px] text-slate-300 overflow-x-auto">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Duplicate prevention active: No duplicate alerts for same threshold tier.
          </div>
          <button
            onClick={() => handleSend()}
            disabled={isSending}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Telemetry</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
