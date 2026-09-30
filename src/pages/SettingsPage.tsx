import React, { useState, useEffect } from 'react';
import { Settings, Save, Building, Sliders, Bell, CheckCircle2, Shield } from 'lucide-react';
import { OrganizationSettings } from '../types';
import { api } from '../services/api';

interface SettingsPageProps {
  org: OrganizationSettings | null;
  onRefresh: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ org, onRefresh }) => {
  const [formData, setFormData] = useState<OrganizationSettings | null>(org);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (org) setFormData(org);
  }, [org]);

  if (!formData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateOrganization(formData);
      setSaveSuccess(true);
      onRefresh();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error updating settings';
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-white">System & Threshold Configuration</h2>
        <p className="text-xs text-slate-400">
          Administer organization brand identity, contact channels, and backend IoT threshold parameters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Section 1: Organization & Campus Details */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-sm font-semibold text-white">
            <Building className="w-4 h-4 text-emerald-400" />
            <span>Organization Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Platform Brand Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">University / Entity</label>
              <input
                type="text"
                value={formData.campus}
                onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">Campus Physical Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Operations Contact Email</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Emergency Dispatch Hotline</label>
              <input
                type="text"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Configurable Threshold Engine (Section 4) */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-sm font-semibold text-white">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Backend Fill-Level Threshold Rules (Section 4 Engine)</span>
          </div>

          <p className="text-slate-400 text-xs">
            These thresholds are executed on the backend upon sensor telemetry ingestion to trigger alarms and prevent duplicate alerts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-yellow-300">Near Full (Warning)</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {formData.alert_threshold_warning}%
                </span>
              </div>
              <input
                type="number"
                min="50"
                max="85"
                value={formData.alert_threshold_warning}
                onChange={(e) =>
                  setFormData({ ...formData, alert_threshold_warning: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
              <span className="text-[10px] text-slate-500 block">Default: 75%</span>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-amber-300">Critical Alarm</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {formData.alert_threshold_critical}%
                </span>
              </div>
              <input
                type="number"
                min="80"
                max="98"
                value={formData.alert_threshold_critical}
                onChange={(e) =>
                  setFormData({ ...formData, alert_threshold_critical: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
              <span className="text-[10px] text-slate-500 block">Default: 90%</span>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-rose-300">Full (Overflow)</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {formData.alert_threshold_full}%
                </span>
              </div>
              <input
                type="number"
                min="95"
                max="100"
                value={formData.alert_threshold_full}
                onChange={(e) =>
                  setFormData({ ...formData, alert_threshold_full: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
              <span className="text-[10px] text-slate-500 block">Default: 100%</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-slate-300 font-medium mb-1">
              Sensor Offline Inactivity Threshold (Minutes)
            </label>
            <input
              type="number"
              min="15"
              max="240"
              value={formData.offline_timeout_minutes}
              onChange={(e) =>
                setFormData({ ...formData, offline_timeout_minutes: Number(e.target.value) })
              }
              className="w-full sm:w-48 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              If an ESP32 bin fails to transmit a heartbeat within this period, an OFFLINE_SENSOR alert is raised.
            </span>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings and threshold engine successfully updated!</span>
            </div>
          ) : (
            <div className="text-slate-500 text-[11px]">
              Changes are immediately applied to the live threshold engine.
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
