import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEco } from '../state/EcoContext';
import { EcoLocation, EcoBin } from '../types';

interface EcoCampusMapProps {
  className?: string;
  onSelectLocation?: (loc: EcoLocation) => void;
  onSelectBin?: (bin: EcoBin) => void;
}

export const EcoCampusMap: React.FC<EcoCampusMapProps> = ({
  className = 'h-[500px]',
  onSelectLocation,
  onSelectBin,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const { locations, bins, setSelectedLocation, setSelectedBin } = useEco();

  // Helper to determine location condition
  const getLocationCondition = (loc: EcoLocation) => {
    const locBins = bins.filter((b) => b.locationId === loc.id);
    const hasWrongWaste = locBins.some((b) => b.wrongWasteDetected);
    const hasDamaged = locBins.some((b) => b.physicalCondition === 'BROKEN');
    const maxFill = Math.max(...locBins.map((b) => b.fillLevel), 0);

    if (hasWrongWaste || hasDamaged || maxFill >= 95) {
      return { level: 'CRITICAL', color: '#e63946', label: '🚨 Critical' };
    }
    if (maxFill >= 75) {
      return { level: 'COLLECTION_REQUIRED', color: '#d90429', label: '🔴 Collection Required' };
    }
    if (maxFill >= 50) {
      return { level: 'ATTENTION', color: '#f77f00', label: '🟠 Attention' };
    }
    return { level: 'NORMAL', color: '#2d6a4f', label: '🟢 Normal' };
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [10.0442, 76.3275],
        zoom: 15,
        minZoom: 14,
        maxZoom: 18,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      ).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add marker for each location
    locations.forEach((loc) => {
      const condition = getLocationCondition(loc);
      const locBins = bins.filter((b) => b.locationId === loc.id);
      const avgFill = Math.round(
        locBins.reduce((acc, curr) => acc + curr.fillLevel, 0) / (locBins.length || 1)
      );

      const markerHtml = `
        <div style="
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid ${condition.color};
          box-shadow: 0 4px 12px rgba(20, 56, 38, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          font-weight: bold;
          color: #143826;
          transition: transform 0.2s ease;
        ">
          ${avgFill}%
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'eco-campus-marker',
        html: markerHtml,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="font-family: inherit; width: 230px; padding: 4px;">
          <div style="font-weight: bold; color: #143826; font-size: 13px; margin-bottom: 2px;">
            🌿 ${loc.name}
          </div>
          <div style="font-size: 11px; color: #52796f; margin-bottom: 8px;">
            ${loc.zone} · ${condition.label}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 8px; font-size: 10px;">
            ${locBins
              .map(
                (b) => `
              <div style="background: #f0f6ef; border: 1px solid #d3e2d5; border-radius: 6px; padding: 4px; text-align: center;">
                <span style="font-weight: 600; color: #1f2923;">${b.wasteLabel}</span><br/>
                <span style="font-family: monospace; font-weight: bold; color: ${b.fillLevel >= 75 ? '#d90429' : '#2d6a4f'};">${b.fillLevel}%</span>
              </div>
            `
              )
              .join('')}
          </div>
          <button id="btn-inspect-${loc.id}" style="
            width: 100%;
            padding: 6px;
            background: #1b4332;
            color: #ffffff;
            border: none;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
          ">
            Inspect Location Bins
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 260 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${loc.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectLocation) onSelectLocation(loc);
            else setSelectedLocation(loc);
            marker.closePopup();
          };
        }
      });

      markersRef.current.push(marker);
    });

    if (locations.length > 0) {
      map.fitBounds(
        L.latLngBounds(locations.map((loc) => [loc.latitude, loc.longitude] as [number, number])),
        { padding: [28, 28], maxZoom: 16 }
      );
    }
  }, [locations, bins, onSelectLocation, setSelectedLocation]);

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-[#d3e2d5] shadow-xs bg-[#f4f7f2] ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-xs border border-[#cce0ce] p-2.5 rounded-2xl shadow-md text-[11px] space-y-1 text-[#2d3732]">
        <div className="font-semibold text-xs text-[#143826] pb-1 border-b border-[#e2ece3] flex items-center gap-1.5">
          <span>🌿 CUSAT Map Status</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2d6a4f]"></span>
          <span>Normal (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f77f00]"></span>
          <span>Attention (50–74%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d90429]"></span>
          <span>Collection Req (75–94%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e63946] animate-pulse"></span>
          <span>Critical / Urgent (&ge;95%)</span>
        </div>
      </div>
    </div>
  );
};
