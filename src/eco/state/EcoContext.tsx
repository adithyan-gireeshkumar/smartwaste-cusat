import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  EcoBin,
  EcoLocation,
  EcoAlert,
  EcoFeedback,
  EcoCollectionTask,
  EcoUser,
  EcoAdminProfile,
  PhysicalCondition,
  FeedbackStatus,
  CollectionStatus,
  WasteType,
  BinStatus
} from '../types';
import {
  INITIAL_LOCATIONS,
  INITIAL_ADMIN_PROFILE,
  INITIAL_USERS,
  INITIAL_ALERTS,
  INITIAL_FEEDBACK,
  INITIAL_COLLECTIONS,
  generateInitialBins
} from '../data/initialData';

interface EcoContextType {
  locations: EcoLocation[];
  bins: EcoBin[];
  alerts: EcoAlert[];
  feedback: EcoFeedback[];
  collections: EcoCollectionTask[];
  users: EcoUser[];
  profile: EcoAdminProfile;
  activeTab: string;
  searchQuery: string;
  selectedBin: EcoBin | null;
  selectedLocation: EcoLocation | null;
  qrModalBin: EcoBin | null;
  damageModalBin: EcoBin | null;
  feedbackModalBin: EcoBin | null;
  profileModalOpen: boolean;
  notificationOpen: boolean;
  lastSimulationEvent: string | null;

  // Actions
  setActiveTab: (tab: string) => void;
  setSearchQuery: (q: string) => void;
  setSelectedBin: (bin: EcoBin | null) => void;
  setSelectedLocation: (loc: EcoLocation | null) => void;
  setQrModalBin: (bin: EcoBin | null) => void;
  setDamageModalBin: (bin: EcoBin | null) => void;
  setFeedbackModalBin: (bin: EcoBin | null) => void;
  setProfileModalOpen: (open: boolean) => void;
  setNotificationOpen: (open: boolean) => void;

  // Profile & User CRUD
  updateAdminProfile: (p: Partial<EcoAdminProfile>) => void;
  addUser: (user: Omit<EcoUser, 'id' | 'lastActive'>) => void;
  updateUser: (id: string, user: Partial<EcoUser>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;

  // Alerts
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;
  resolveAlert: (id: string, note?: string) => void;

  // Collections
  assignCollector: (taskId: string, collector: string) => void;
  markAsCollected: (binId: string, customNewFill?: number) => void;
  createCollectionTask: (binId: string, priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT', collector?: string) => void;

  // Feedback & Damage
  submitFeedback: (fb: Omit<EcoFeedback, 'id' | 'submittedAt' | 'status'>) => string;
  updateFeedbackStatus: (id: string, status: FeedbackStatus, assignedTo?: string, note?: string) => void;
  reportDamage: (binId: string, condition: PhysicalCondition, desc?: string) => void;

  // Simulation Controls (Requirement 28)
  simulateFillLevel: (binId: string, fill: number) => void;
  simulateWrongWaste: (binId: string, detectedType?: string) => void;
  clearWrongWaste: (binId: string) => void;
  simulateLidOpen: (binId: string, unexpected?: boolean) => void;
  closeLid: (binId: string) => void;
  simulateOffline: (binId: string, offline?: boolean) => void;
  simulateAbnormalTemp: (binId: string, temp?: number) => void;
  drainBin: (binId: string) => void;

  // Computed summary metrics
  metrics: {
    totalLocations: number;
    totalBins: number;
    normalBins: number;
    collectionRequired: number;
    urgentBins: number;
    damagedBins: number;
    openBins: number;
    offlineSensors: number;
    unreadAlertsCount: number;
  };
}

const EcoContext = createContext<EcoContextType | undefined>(undefined);

export const EcoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locations] = useState<EcoLocation[]>(INITIAL_LOCATIONS);
  const [bins, setBins] = useState<EcoBin[]>(() => {
    const saved = localStorage.getItem('smartwaste_eco_bins');
    return saved ? JSON.parse(saved) : generateInitialBins();
  });
  const [alerts, setAlerts] = useState<EcoAlert[]>(() => {
    const saved = localStorage.getItem('smartwaste_eco_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });
  const [feedback, setFeedback] = useState<EcoFeedback[]>(() => {
    const saved = localStorage.getItem('smartwaste_eco_feedback');
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACK;
  });
  const [collections, setCollections] = useState<EcoCollectionTask[]>(() => {
    const saved = localStorage.getItem('smartwaste_eco_collections');
    return saved ? JSON.parse(saved) : INITIAL_COLLECTIONS;
  });
  const [users, setUsers] = useState<EcoUser[]>(() => {
    const saved = localStorage.getItem('smartwaste_eco_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [profile, setProfile] = useState<EcoAdminProfile>(() => {
    const saved = localStorage.getItem('smartwaste_eco_profile');
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_PROFILE;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBin, setSelectedBin] = useState<EcoBin | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<EcoLocation | null>(null);
  const [qrModalBin, setQrModalBin] = useState<EcoBin | null>(null);
  const [damageModalBin, setDamageModalBin] = useState<EcoBin | null>(null);
  const [feedbackModalBin, setFeedbackModalBin] = useState<EcoBin | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
  const [lastSimulationEvent, setLastSimulationEvent] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smartwaste_eco_bins', JSON.stringify(bins));
    } catch {}
  }, [bins]);

  useEffect(() => {
    try {
      localStorage.setItem('smartwaste_eco_alerts', JSON.stringify(alerts));
    } catch {}
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem('smartwaste_eco_profile', JSON.stringify(profile));
    } catch {}
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('smartwaste_eco_users', JSON.stringify(users));
    } catch {}
  }, [users]);

  // Keep selected bin up to date
  useEffect(() => {
    if (selectedBin) {
      const fresh = bins.find((b) => b.id === selectedBin.id);
      if (fresh) setSelectedBin(fresh);
    }
  }, [bins, selectedBin]);

  // Subtle real-time periodic update to timestamps every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBins((prev) =>
        prev.map((b, idx) => {
          // Subtle refresh of 1-2 random bins timestamps
          if (idx % 7 === 0) {
            return { ...b, lastUpdated: new Date().toISOString() };
          }
          return b;
        })
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update Admin Profile (Requirement 3)
  const updateAdminProfile = useCallback((p: Partial<EcoAdminProfile>) => {
    setProfile((curr) => ({ ...curr, ...p }));
  }, []);

  // User CRUD (Requirement 4)
  const addUser = useCallback((userData: Omit<EcoUser, 'id' | 'lastActive'>) => {
    setUsers((curr) => {
      const newId = `USR-${String(curr.length + 1).padStart(2, '0')}`;
      const newUser: EcoUser = {
        ...userData,
        id: newId,
        lastActive: 'Just registered',
      };
      return [...curr, newUser];
    });
  }, []);

  const updateUser = useCallback((id: string, userData: Partial<EcoUser>) => {
    setUsers((curr) => curr.map((u) => (u.id === id ? { ...u, ...userData } : u)));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers((curr) => curr.filter((u) => u.id !== id));
  }, []);

  const toggleUserStatus = useCallback((id: string) => {
    setUsers((curr) =>
      curr.map((u) => (u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u))
    );
  }, []);

  // Alerts Management (Requirement 11)
  const markAlertRead = useCallback((id: string) => {
    setAlerts((curr) => curr.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
  }, []);

  const markAllAlertsRead = useCallback(() => {
    setAlerts((curr) => curr.map((a) => ({ ...a, isRead: true })));
  }, []);

  const resolveAlert = useCallback((id: string, note?: string) => {
    setAlerts((curr) =>
      curr.map((a) =>
        a.id === id
          ? {
              ...a,
              isResolved: true,
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'Dr. Suresh Kumar (Admin)',
            }
          : a
      )
    );
  }, []);

  // Collections (Requirement 18)
  const assignCollector = useCallback((taskId: string, collector: string) => {
    setCollections((curr) =>
      curr.map((t) => (t.id === taskId ? { ...t, assignedCollector: collector, status: 'ASSIGNED' } : t))
    );
  }, []);

  const markAsCollected = useCallback((binId: string, customNewFill = 12) => {
    const now = new Date().toISOString();
    // 1. Reset bin fill level
    setBins((prev) =>
      prev.map((b) => {
        if (b.id === binId) {
          return {
            ...b,
            fillLevel: customNewFill,
            status: 'NORMAL',
            collectionStatus: 'COLLECTED',
            isOpen: false,
            unexpectedOpening: false,
            wrongWasteDetected: false,
            wrongWasteDetail: null,
            lastUpdated: now,
          };
        }
        return b;
      })
    );

    // 2. Mark collection task completed
    setCollections((prev) =>
      prev.map((t) =>
        t.binId === binId && t.status !== 'COLLECTED'
          ? { ...t, status: 'COLLECTED', completedAt: now, notes: `Emptied to ${customNewFill}%. Sanitized.` }
          : t
      )
    );

    // 3. Auto-resolve related overflow alerts
    setAlerts((prev) =>
      prev.map((a) =>
        a.binId === binId && (a.type === 'OVERFLOW' || a.type === 'WRONG_WASTE')
          ? { ...a, isResolved: true, resolvedAt: now, resolvedBy: 'Manoj K.V. (Collector)' }
          : a
      )
    );

    setLastSimulationEvent(`Bin ${binId} successfully emptied and collected (Fill reset to ${customNewFill}%).`);
  }, []);

  const createCollectionTask = useCallback((binId: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'HIGH', collector = 'Manoj K.V.') => {
    const bin = bins.find((b) => b.id === binId);
    if (!bin) return;
    const newTask: EcoCollectionTask = {
      id: `COL-${100 + collections.length + 1}`,
      binId: bin.id,
      binName: bin.name,
      locationName: bin.locationName,
      wasteType: bin.wasteType,
      fillLevel: bin.fillLevel,
      priority,
      assignedCollector: collector,
      status: 'ASSIGNED',
      createdAt: new Date().toISOString(),
      previousFillLevel: bin.fillLevel,
      notes: `Manual dispatch created for ${bin.locationName}.`,
    };
    setCollections((prev) => [newTask, ...prev]);
    setBins((prev) => prev.map((b) => (b.id === binId ? { ...b, collectionStatus: 'ASSIGNED' } : b)));
    setLastSimulationEvent(`Collection dispatch created for ${bin.name}.`);
  }, [bins, collections.length]);

  // Feedback (Requirement 16 & 17)
  const submitFeedback = useCallback((fbData: Omit<EcoFeedback, 'id' | 'submittedAt' | 'status'>) => {
    const newId = `FB-${500 + feedback.length + 1}`;
    const newEntry: EcoFeedback = {
      ...fbData,
      id: newId,
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
    };
    setFeedback((prev) => [newEntry, ...prev]);

    // Create corresponding alert/notification (Requirement 17)
    const newAlert: EcoAlert = {
      id: `ALT-FB-${Date.now()}`,
      binId: fbData.binId,
      binName: `Bin ${fbData.binId}`,
      locationName: fbData.locationName,
      wasteType: fbData.wasteType,
      type: fbData.complaintType === 'OVERFLOW' ? 'OVERFLOW' : 'WRONG_WASTE',
      title: `Citizen Feedback: ${fbData.complaintType.replace('_', ' ')}`,
      description: `Rating: ${fbData.rating}★ · "${fbData.comment}" (from ${fbData.citizenName})`,
      severity: fbData.rating <= 2 ? 'CRITICAL' : 'WARNING',
      timestamp: new Date().toISOString(),
      isRead: false,
      isResolved: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setLastSimulationEvent(`Citizen Feedback logged for ${fbData.locationName} (${newId}).`);
    return newId;
  }, [feedback.length]);

  const updateFeedbackStatus = useCallback((id: string, status: FeedbackStatus, assignedTo?: string, note?: string) => {
    setFeedback((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status, assignedTo: assignedTo || f.assignedTo, resolutionNote: note || f.resolutionNote } : f))
    );
  }, []);

  // Damage Reporting (Requirement 14)
  const reportDamage = useCallback((binId: string, condition: PhysicalCondition, desc?: string) => {
    const now = new Date().toISOString();
    setBins((prev) =>
      prev.map((b) => {
        if (b.id === binId) {
          return {
            ...b,
            physicalCondition: condition,
            status: condition === 'BROKEN' ? 'URGENT' : b.status,
            lastUpdated: now,
          };
        }
        return b;
      })
    );

    const bin = bins.find((b) => b.id === binId);
    if (bin && condition !== 'GOOD') {
      const newAlert: EcoAlert = {
        id: `ALT-DMG-${Date.now()}`,
        binId: bin.id,
        binName: bin.name,
        locationName: bin.locationName,
        wasteType: bin.wasteType,
        type: 'BIN_DAMAGED',
        title: `Bin Damaged: ${condition.replace('_', ' ')}`,
        description: desc || `Chassis physical damage reported on ${bin.name}. Maintenance scheduled.`,
        severity: condition === 'BROKEN' ? 'CRITICAL' : 'WARNING',
        timestamp: now,
        isRead: false,
        isResolved: false,
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }
    setLastSimulationEvent(`Damage reported on bin ${binId}: ${condition}.`);
  }, [bins]);

  // Simulation Methods (Requirement 28)
  const simulateFillLevel = useCallback((binId: string, fill: number) => {
    const now = new Date().toISOString();
    setBins((prev) =>
      prev.map((b) => {
        if (b.id === binId) {
          let status: BinStatus = 'NORMAL';
          if (fill >= 95) status = 'URGENT';
          else if (fill >= 75) status = 'COLLECTION_REQUIRED';
          else if (fill >= 50) status = 'WARNING';
          return {
            ...b,
            fillLevel: fill,
            status: b.isOnline ? status : 'OFFLINE',
            lastUpdated: now,
          };
        }
        return b;
      })
    );

    const bin = bins.find((b) => b.id === binId);
    if (bin && fill >= 75) {
      const isUrgent = fill >= 95;
      const newAlert: EcoAlert = {
        id: `ALT-FILL-${Date.now()}`,
        binId: bin.id,
        binName: bin.name,
        locationName: bin.locationName,
        wasteType: bin.wasteType,
        type: 'OVERFLOW',
        title: isUrgent ? `Urgent Overflow Level (${fill}%)` : `Collection Required (${fill}%)`,
        description: `Bin capacity crossed threshold. Instant IoT telemetry recorded.`,
        severity: isUrgent ? 'CRITICAL' : 'WARNING',
        timestamp: now,
        isRead: false,
        isResolved: false,
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }
    setLastSimulationEvent(`Telemetry updated: ${binId} fill adjusted to ${fill}%.`);
  }, [bins]);

  const simulateWrongWaste = useCallback((binId: string, detectedType = 'Food Waste (Organic)') => {
    const now = new Date().toISOString();
    const bin = bins.find((b) => b.id === binId);
    if (!bin) return;

    setBins((prev) =>
      prev.map((b) => {
        if (b.id === binId) {
          return {
            ...b,
            wrongWasteDetected: true,
            wrongWasteDetail: {
              expected: b.wasteLabel,
              detected: detectedType,
              timestamp: 'Just now',
              confidencePct: 94,
            },
            lastUpdated: now,
          };
        }
        return b;
      })
    );

    const newAlert: EcoAlert = {
      id: `ALT-WRONG-${Date.now()}`,
      binId: bin.id,
      binName: bin.name,
      locationName: bin.locationName,
      wasteType: bin.wasteType,
      type: 'WRONG_WASTE',
      title: 'Wrong Waste Detected',
      description: `${detectedType} identified in designated ${bin.wasteLabel} bin (94% AI confidence).`,
      severity: 'WARNING',
      timestamp: now,
      isRead: false,
      isResolved: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setLastSimulationEvent(`Wrong waste simulated on ${bin.id}: ${detectedType} in ${bin.wasteLabel} bin.`);
  }, [bins]);

  const clearWrongWaste = useCallback((binId: string) => {
    setBins((prev) =>
      prev.map((b) =>
        b.id === binId ? { ...b, wrongWasteDetected: false, wrongWasteDetail: null, lastUpdated: new Date().toISOString() } : b
      )
    );
    setAlerts((prev) =>
      prev.map((a) => (a.binId === binId && a.type === 'WRONG_WASTE' ? { ...a, isResolved: true } : a))
    );
    setLastSimulationEvent(`Wrong waste alert cleared for bin ${binId}.`);
  }, []);

  const simulateLidOpen = useCallback((binId: string, unexpected = true) => {
    const now = new Date().toISOString();
    const bin = bins.find((b) => b.id === binId);
    if (!bin) return;

    setBins((prev) =>
      prev.map((b) => (b.id === binId ? { ...b, isOpen: true, unexpectedOpening: unexpected, lastUpdated: now } : b))
    );

    if (unexpected) {
      const newAlert: EcoAlert = {
        id: `ALT-LID-${Date.now()}`,
        binId: bin.id,
        binName: bin.name,
        locationName: bin.locationName,
        wasteType: bin.wasteType,
        type: 'BIN_OPENED',
        title: 'Bin Opened Unexpectedly',
        description: `Lid open anomaly detected outside regular collection hours on ${bin.name}.`,
        severity: 'WARNING',
        timestamp: now,
        isRead: false,
        isResolved: false,
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }
    setLastSimulationEvent(`Lid opened on ${bin.id}${unexpected ? ' (Unexpected trigger alert)' : ''}.`);
  }, [bins]);

  const closeLid = useCallback((binId: string) => {
    setBins((prev) =>
      prev.map((b) => (b.id === binId ? { ...b, isOpen: false, unexpectedOpening: false, lastUpdated: new Date().toISOString() } : b))
    );
    setAlerts((prev) =>
      prev.map((a) => (a.binId === binId && a.type === 'BIN_OPENED' ? { ...a, isResolved: true } : a))
    );
    setLastSimulationEvent(`Lid closed and secured on ${binId}.`);
  }, []);

  const simulateOffline = useCallback((binId: string, offline = true) => {
    const now = new Date().toISOString();
    setBins((prev) =>
      prev.map((b) => (b.id === binId ? { ...b, isOnline: !offline, status: offline ? 'OFFLINE' : 'NORMAL', lastUpdated: now } : b))
    );
    if (offline) {
      const bin = bins.find((b) => b.id === binId);
      if (bin) {
        const newAlert: EcoAlert = {
          id: `ALT-OFF-${Date.now()}`,
          binId: bin.id,
          binName: bin.name,
          locationName: bin.locationName,
          wasteType: bin.wasteType,
          type: 'SENSOR_OFFLINE',
          title: 'Sensor Offline',
          description: `No ultrasonic ping received from ${bin.name} ESP32 unit.`,
          severity: 'INFO',
          timestamp: now,
          isRead: false,
          isResolved: false,
        };
        setAlerts((prev) => [newAlert, ...prev]);
      }
    }
    setLastSimulationEvent(`Bin ${binId} sensor connectivity set to ${offline ? 'OFFLINE' : 'ONLINE'}.`);
  }, [bins]);

  const simulateAbnormalTemp = useCallback((binId: string, temp = 43.5) => {
    const now = new Date().toISOString();
    setBins((prev) =>
      prev.map((b) =>
        b.id === binId
          ? {
              ...b,
              temperatureC: temp,
              thermalCondition: temp >= 40 ? 'HEAT_WARNING' : 'NORMAL',
              lastUpdated: now,
            }
          : b
      )
    );

    const bin = bins.find((b) => b.id === binId);
    if (bin) {
      const newAlert: EcoAlert = {
        id: `ALT-TEMP-${Date.now()}`,
        binId: bin.id,
        binName: bin.name,
        locationName: bin.locationName,
        wasteType: bin.wasteType,
        type: 'ABNORMAL_TEMP',
        title: `Abnormal Temperature (${temp}°C)`,
        description: `Thermal chamber detected elevated heat at ${bin.locationName}. Inspect for smoldering.`,
        severity: 'CRITICAL',
        timestamp: now,
        isRead: false,
        isResolved: false,
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }
    setLastSimulationEvent(`Thermal surge simulated on ${binId}: ${temp}°C.`);
  }, [bins]);

  const drainBin = useCallback((binId: string) => {
    markAsCollected(binId, 10);
  }, [markAsCollected]);

  // Computed Metrics (Requirement 5)
  const metrics = useMemo(() => {
    const totalLocations = locations.length;
    const totalBins = bins.length;
    const normalBins = bins.filter((b) => b.status === 'NORMAL').length;
    const collectionRequired = bins.filter((b) => b.status === 'COLLECTION_REQUIRED').length;
    const urgentBins = bins.filter((b) => b.status === 'URGENT').length;
    const damagedBins = bins.filter((b) => b.physicalCondition !== 'GOOD').length;
    const openBins = bins.filter((b) => b.isOpen).length;
    const offlineSensors = bins.filter((b) => !b.isOnline).length;
    const unreadAlertsCount = alerts.filter((a) => !a.isRead && !a.isResolved).length;

    return {
      totalLocations,
      totalBins,
      normalBins,
      collectionRequired,
      urgentBins,
      damagedBins,
      openBins,
      offlineSensors,
      unreadAlertsCount,
    };
  }, [locations.length, bins, alerts]);

  return (
    <EcoContext.Provider
      value={{
        locations,
        bins,
        alerts,
        feedback,
        collections,
        users,
        profile,
        activeTab,
        searchQuery,
        selectedBin,
        selectedLocation,
        qrModalBin,
        damageModalBin,
        feedbackModalBin,
        profileModalOpen,
        notificationOpen,
        lastSimulationEvent,
        setActiveTab,
        setSearchQuery,
        setSelectedBin,
        setSelectedLocation,
        setQrModalBin,
        setDamageModalBin,
        setFeedbackModalBin,
        setProfileModalOpen,
        setNotificationOpen,
        updateAdminProfile,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        markAlertRead,
        markAllAlertsRead,
        resolveAlert,
        assignCollector,
        markAsCollected,
        createCollectionTask,
        submitFeedback,
        updateFeedbackStatus,
        reportDamage,
        simulateFillLevel,
        simulateWrongWaste,
        clearWrongWaste,
        simulateLidOpen,
        closeLid,
        simulateOffline,
        simulateAbnormalTemp,
        drainBin,
        metrics,
      }}
    >
      {children}
    </EcoContext.Provider>
  );
};

export const useEco = () => {
  const context = useContext(EcoContext);
  if (!context) {
    throw new Error('useEco must be used within an EcoProvider');
  }
  return context;
};
