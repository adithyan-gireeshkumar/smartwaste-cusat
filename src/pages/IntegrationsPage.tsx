import React, { useState, useEffect } from 'react';
import {
  Share2,
  Mail,
  MessageSquare,
  Instagram,
  CheckCircle2,
  Send,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { IntegrationsData } from '../types';
import { api } from '../services/api';

export const IntegrationsPage: React.FC = () => {
  const [data, setData] = useState<IntegrationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [igCaption, setIgCaption] = useState('');
  const [isPostingIg, setIsPostingIg] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const res = await api.getIntegrations();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishInstagram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!igCaption) return;
    setIsPostingIg(true);
    setPostSuccess(false);
    try {
      await api.publishInstagramUpdate(igCaption);
      setIgCaption('');
      setPostSuccess(true);
      await loadIntegrations();
      setTimeout(() => setPostSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error publishing post';
      alert(message);
    } finally {
      setIsPostingIg(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-white">Integrations & Notification Dispatch</h2>
        <p className="text-xs text-slate-400">
          Official notification layers for WhatsApp Business API, Campus Email broadcasts, and Green CUSAT social media awareness.
        </p>
      </div>

      {/* 3 Main Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* WhatsApp Business Cloud API Card */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                ACTIVE
              </span>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">WhatsApp Business API</h3>
              <p className="text-xs text-slate-400 mt-1">
                Dispatches instant WhatsApp alerts when bins exceed 75% or 90% fill levels to the on-duty sanitation fleet.
              </p>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient Phone:</span>
                <span className="font-mono text-white">{data?.whatsapp.phone || '+91 98470 12345'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Template ID:</span>
                <span className="font-mono text-emerald-400">cusat_bin_alert_v2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Webhook Status:</span>
                <span className="font-mono text-emerald-400">Connected (TLS)</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800">
            {data?.whatsapp.daily_count || 14} messages dispatched today
          </div>
        </div>

        {/* Email Alerts Card */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold">
                ACTIVE
              </span>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Campus Email Alerts</h3>
              <p className="text-xs text-slate-400 mt-1">
                Automated SMTP mailer for formal incident escalation, daily digests, and weekly zero-waste audit reports.
              </p>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Primary Channel:</span>
                <span className="font-mono text-white">SMTP TLS / Port 587</span>
              </div>
              <div className="flex flex-col gap-0.5 pt-1">
                <span className="text-slate-400">Subscribed Recipient:</span>
                <span className="font-mono text-[11px] text-slate-300 truncate">
                  {data?.email.recipients || 'sanitation-ops@cusat.ac.in'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800">
            {data?.email.daily_count || 8} digests sent today
          </div>
        </div>

        {/* Instagram Campus Awareness Card */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Instagram className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 font-semibold">
                CONNECTED
              </span>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Instagram Awareness</h3>
              <p className="text-xs text-slate-400 mt-1">
                Campus sustainability engagement channel for publishing student cleanliness milestones and drive updates.
              </p>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Handle:</span>
                <span className="font-mono text-purple-300">{data?.instagram.handle || '@green_cusat_initiative'}</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Last broadcast: {data?.instagram.last_awareness_post}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800">
            Social integration active
          </div>
        </div>
      </div>

      {/* Publish Awareness Announcement to Instagram */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Instagram className="w-4 h-4 text-purple-400" />
          <span>Publish Clean Campus Milestone to Instagram</span>
        </h3>
        <p className="text-xs text-slate-400">
          Share verified CUSAT zero-waste achievement metrics or upcoming volunteer clean-up drives directly to the linked account.
        </p>

        <form onSubmit={handlePublishInstagram} className="space-y-3">
          <textarea
            rows={2}
            value={igCaption}
            onChange={(e) => setIgCaption(e.target.value)}
            placeholder="e.g. 🌿 CUSAT Zero-Waste Week Update: Over 1,420kg of sorted recyclables collected across 20 smart campus bins! #GreenCUSAT #SmartCampus"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Posts will be submitted to the official @green_cusat_initiative story and feed queue.
            </span>
            <button
              type="submit"
              disabled={isPostingIg || !igCaption}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isPostingIg ? (
                <span>Publishing...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish to Instagram</span>
                </>
              )}
            </button>
          </div>

          {postSuccess && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Awareness update published successfully to Instagram!</span>
            </div>
          )}
        </form>
      </div>

      {/* Notification Dispatch History Audit Log */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Real-Time Notification Dispatch Log</h3>
            <p className="text-xs text-slate-400">
              Auditable transmission trail for all automated SMS, WhatsApp, and Email triggers.
            </p>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="space-y-2">
          {data?.logs?.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                      log.channel === 'WHATSAPP'
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                        : log.channel === 'EMAIL'
                        ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                        : 'text-purple-400 bg-purple-500/10 border-purple-500/30'
                    }`}
                  >
                    {log.channel}
                  </span>
                  <span className="font-semibold text-white">{log.title}</span>
                </div>
                <p className="text-[11px] text-slate-400">{log.message}</p>
              </div>

              <div className="text-right text-[10px] font-mono text-slate-500 shrink-0">
                <div>To: {log.recipient}</div>
                <div>{new Date(log.timestamp).toLocaleTimeString()} · Status: {log.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
