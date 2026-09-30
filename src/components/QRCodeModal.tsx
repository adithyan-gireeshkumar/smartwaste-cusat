import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Download, ExternalLink, Copy, Check, MessageSquare, ShieldCheck } from 'lucide-react';
import { WasteBin } from '../types';

interface QRCodeModalProps {
  bin: WasteBin | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedbackPortal: (bin: WasteBin) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  bin,
  isOpen,
  onClose,
  onOpenFeedbackPortal,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (bin) {
      const publicUrl = `${window.location.origin}/public/feedback/${bin.id}`;
      QRCode.toDataURL(publicUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [bin]);

  if (!isOpen || !bin) return null;

  const publicUrl = `${window.location.origin}/public/feedback/${bin.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `CUSAT_QR_${bin.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'PLASTIC':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'PAPER':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'METAL':
        return 'text-slate-300 bg-slate-500/10 border-slate-500/30';
      case 'ORGANIC':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Smart Bin QR Code</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Printable Decal View */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col items-center">
            {/* Decal Header */}
            <div className="text-[11px] font-bold tracking-tight text-slate-900 uppercase">
              CUSAT — {bin.location_name}
            </div>
            <div className="text-[10px] font-mono text-slate-600 mb-2">
              {bin.id} · {bin.category_label} Station
            </div>

            {/* Scannable QR Code */}
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Bin QR Code" className="w-48 h-48 rounded" />
            ) : (
              <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                Generating QR...
              </div>
            )}

            <div className="mt-2 text-[10px] font-semibold text-slate-800 flex items-center gap-1">
              <span>SCAN TO REPORT OR SUBMIT FEEDBACK</span>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xs font-bold text-white">{bin.id}</span>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${getCategoryColor(bin.category)}`}>
                {bin.category_label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Citizens, students, and faculty can scan this physical QR code on the bin to report issues or cleanliness feedback.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-2 pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenFeedbackPortal(bin);
              }}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Simulate Citizen QR Scan / Feedback</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopy}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy URL'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PNG</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
