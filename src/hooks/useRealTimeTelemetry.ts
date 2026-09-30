import { useState, useEffect, useRef, useCallback } from 'react';
import { WasteBin, AlertItem, DashboardSummary } from '../types';

export interface RealTimeTelemetryOptions {
  onBinUpdated?: (data: { bin: WasteBin; alertCreated?: AlertItem | null; summary?: DashboardSummary }) => void;
  onAlertUpdated?: (data: { alert: AlertItem; summary?: DashboardSummary }) => void;
  onCollectionUpdated?: (data: { task: unknown; bin?: WasteBin; summary?: DashboardSummary }) => void;
  onFeedbackUpdated?: (data: { feedback?: unknown; summary?: DashboardSummary }) => void;
  onDamageUpdated?: (data: { report?: unknown; summary?: DashboardSummary }) => void;
  onUsersUpdated?: (data: { users: unknown }) => void;
  onSnapshot?: (data: { bins: WasteBin[]; summary?: DashboardSummary }) => void;
}

export function useRealTimeTelemetry(options: RealTimeTelemetryOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEventTime, setLastEventTime] = useState<string | null>(null);
  const [recentlyUpdatedBinId, setRecentlyUpdatedBinId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const nowStr = new Date().toLocaleTimeString();
          setLastEventTime(nowStr);

          if (message.type === 'init' && optionsRef.current.onSnapshot) {
            optionsRef.current.onSnapshot(message.data);
          } else if (message.type === 'bin:updated') {
            const updatedBin = message.data.bin as WasteBin;
            setRecentlyUpdatedBinId(updatedBin.id);
            // Clear recent flag after 2.5s
            setTimeout(() => setRecentlyUpdatedBinId((curr) => (curr === updatedBin.id ? null : curr)), 2500);

            if (optionsRef.current.onBinUpdated) {
              optionsRef.current.onBinUpdated(message.data);
            }
          } else if (message.type === 'bins:list_changed' && optionsRef.current.onSnapshot) {
            optionsRef.current.onSnapshot(message.data);
          } else if (message.type === 'alert:updated' && optionsRef.current.onAlertUpdated) {
            optionsRef.current.onAlertUpdated(message.data);
          } else if (message.type === 'collection:updated' && optionsRef.current.onCollectionUpdated) {
            optionsRef.current.onCollectionUpdated(message.data);
          } else if ((message.type === 'feedback:created' || message.type === 'feedback:updated') && optionsRef.current.onFeedbackUpdated) {
            optionsRef.current.onFeedbackUpdated(message.data);
          } else if ((message.type === 'damage:created' || message.type === 'damage:updated') && optionsRef.current.onDamageUpdated) {
            optionsRef.current.onDamageUpdated(message.data);
          } else if (message.type === 'users:updated' && optionsRef.current.onUsersUpdated) {
            optionsRef.current.onUsersUpdated(message.data);
          }
        } catch (err) {
          console.error('[SmartWaste WS] Message parse error:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (err) => {
        console.warn('[SmartWaste WS] WebSocket connection error:', err);
        ws.close();
      };
    } catch (err) {
      console.error('[SmartWaste WS] Connect failed:', err);
    }
  }, []);

  useEffect(() => {
    connect();

    // Heartbeat ping every 25 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    lastEventTime,
    recentlyUpdatedBinId,
  };
}
