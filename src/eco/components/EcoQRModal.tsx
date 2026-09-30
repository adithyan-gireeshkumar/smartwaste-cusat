import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Download, MessageSquare, ExternalLink, Leaf } from 'lucide-react';
import { useEco } from '../state/EcoContext';
import { EcoBin } from '../types';

interface EcoQRModalProps {
  bin: EcoBin | null;
  onClose: () => void;
}

export const EcoQRModal: React.FC<EcoQRModalProps> = ({ bin, onClose }) => {
  const { setFeedbackModalBin } = useEco();
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (bin) {
      const publicUrl = `${window.location.origin}/citizen-feedback?bin=${bin.id}`;
      QRCode.toDataURL(publicUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#143826',
          light: '#ffffff',
        },
      })
        .then(setQrUrl)
        .catch(console.error);
    }
  }, [bin]);

  if (!bin) return null;

  const handleDownload = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `CUSAT_${bin.id}_QR_Decal.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#143826]/45 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#fcfdfb] border border-[#cce0ce] rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col text-center">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e2ece3] bg-[#f4f8f3] flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#1b4332]" />
            <h3 className="text-xs font-serif font-bold text-[#143826]">Smart Bin QR Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#52796f] hover:text-[#143826] rounded-lg hover:bg-[#e2ece3] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Decal View */}
        <div className="p-6 flex flex-col items-center space-y-4">
          <div className="p-5 bg-white rounded-2xl border-2 border-[#1b4332] shadow-md flex flex-col items-center max-w-[280px] w-full">
            <div className="flex items-center gap-1.5 text-[#1b4332] font-serif font-bold text-xs uppercase tracking-wider mb-0.5">
              <Leaf className="w-3.5 h-3.5 text-[#2d6a4f]" />
              <span>SmartWaste CUSAT</span>
            </div>
            <div className="text-[10px] text-[#52796f] font-mono mb-2">
              Scan to Report / Feedback
            </div>

            {qrUrl ? (
              <img src={qrUrl} alt="Bin QR Code" className="w-48 h-48 rounded-lg" />
            ) : (
              <div className="w-48 h-48 bg-slate-100 rounded-lg animate-pulse flex items-center justify-center text-xs text-slate-400">
                Generating QR...
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-[#e2ece3] w-full space-y-0.5">
              <div className="font-mono font-bold text-xs text-[#143826]">{bin.id}</div>
              <div className="text-[11px] font-semibold text-[#2d6a4f]">{bin.locationName}</div>
              <div className="text-[10px] text-[#52796f] uppercase font-bold tracking-wider">
                {bin.wasteLabel} Bin
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#52796f] max-w-xs">
            Affixed directly to the physical receptacle. Students and campus citizens scan this to report issues or submit cleanliness ratings.
          </p>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 w-full pt-1">
            <button
              onClick={handleDownload}
              className="px-3 py-2 bg-[#f0f6ef] hover:bg-[#e4ede3] text-[#143826] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#cce0ce]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Decal</span>
            </button>

            <button
              onClick={() => {
                setFeedbackModalBin(bin);
                onClose();
              }}
              className="px-3 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Test Report Form</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
