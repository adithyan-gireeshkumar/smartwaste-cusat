export type WasteType = 'PLASTIC' | 'PAPER' | 'METAL' | 'FOOD';

export type BinStatus = 'NORMAL' | 'WARNING' | 'COLLECTION_REQUIRED' | 'URGENT' | 'OFFLINE';

export type PhysicalCondition = 'GOOD' | 'MINOR_DAMAGE' | 'MAJOR_DAMAGE' | 'BROKEN';

export type ThermalCondition = 'NORMAL' | 'HEAT_WARNING' | 'FIRE_RISK' | 'COLD_WARNING';

export type AlertType =
  | 'OVERFLOW'
  | 'WRONG_WASTE'
  | 'BIN_DAMAGED'
  | 'ABNORMAL_TEMP'
  | 'ABNORMAL_HUMIDITY'
  | 'BIN_OPENED'
  | 'SENSOR_OFFLINE'
  | 'LOW_BATTERY'
  | 'COLLECTION_OVERDUE';

export type UserRole = 'ADMIN' | 'STAFF' | 'COLLECTOR' | 'VIEWER';

export type CollectionStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COLLECTED';

export type FeedbackStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export interface EcoBin {
  id: string; // e.g. "BIN-001"
  name: string;
  locationId: string;
  locationName: string;
  wasteType: WasteType;
  wasteLabel: string;
  fillLevel: number; // 0 - 100
  capacityLiters: number;
  status: BinStatus;
  isOnline: boolean;
  isOpen: boolean; // lid state
  unexpectedOpening: boolean;
  latitude: number;
  longitude: number;
  batteryLevel: number;
  temperatureC: number;
  humidityPct: number;
  thermalCondition: ThermalCondition;
  physicalCondition: PhysicalCondition;
  wrongWasteDetected: boolean;
  wrongWasteDetail: {
    expected: string;
    detected: string;
    timestamp: string;
    confidencePct: number;
  } | null;
  lastUpdated: string;
  assignedCollector: string | null;
  collectionStatus: CollectionStatus;
  binImage: string;
  locationImage: string;
  qrCodeUrl: string;
}

export interface EcoLocation {
  id: string;
  name: string;
  code: string;
  zone: string;
  latitude: number;
  longitude: number;
  description: string;
  image: string;
  binIds: string[];
}

export interface EcoAlert {
  id: string;
  binId: string;
  binName: string;
  locationName: string;
  wasteType: WasteType;
  type: AlertType;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: string;
  isRead: boolean;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface EcoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastActive: string;
  avatarUrl?: string;
}

export interface EcoFeedback {
  id: string;
  binId: string;
  locationName: string;
  wasteType: WasteType;
  rating: number; // 1 to 5
  complaintType: 'OVERFLOW' | 'WRONG_WASTE' | 'DAMAGED_BIN' | 'ODOR_HYGIENE' | 'LOCATION_ISSUE' | 'OTHER';
  comment: string;
  citizenName: string;
  contact: string;
  photoUrl?: string;
  submittedAt: string;
  status: FeedbackStatus;
  assignedTo?: string;
  resolutionNote?: string;
}

export interface EcoCollectionTask {
  id: string;
  binId: string;
  binName: string;
  locationName: string;
  wasteType: WasteType;
  fillLevel: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedCollector: string;
  status: CollectionStatus;
  createdAt: string;
  completedAt?: string;
  previousFillLevel: number;
  notes?: string;
}

export interface EcoAdminProfile {
  adminName: string;
  groupProjectName: string;
  email: string;
  phone: string;
  profileImage: string;
  institution: string;
}
