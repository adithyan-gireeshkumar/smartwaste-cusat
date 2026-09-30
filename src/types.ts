export type WasteCategory = 'PLASTIC' | 'PAPER' | 'METAL' | 'ORGANIC';

export type LidState = 'CLOSED' | 'OPEN' | 'ABNORMALLY_OPEN';

export type ThermalCondition = 'NOMINAL' | 'ELEVATED_HEAT' | 'FIRE_RISK' | 'COLD';

export type DamageType =
  | 'BROKEN'
  | 'CRACKED'
  | 'OVERFLOWING'
  | 'LID_DAMAGED'
  | 'WHEEL_DAMAGED'
  | 'FIRE_HEAT'
  | 'OTHER';

export interface WasteBin {
  id: string; // e.g. "CUSAT-WB-010-PL"
  name: string;
  station_code: string; // e.g. "CUSAT-STN-010"
  location_id: string;
  location_name: string;
  category: WasteCategory;
  category_label: string; // "Plastic", "Paper", "Metal", "Food/Organic"
  latitude: number;
  longitude: number;
  fill_level: number;
  capacity_liters: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'FULL' | 'OFFLINE';
  device_id: string;
  device_status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  battery_level: number;
  temperature_c: number;
  humidity_pct: number;
  thermal_condition: ThermalCondition;
  lid_status: LidState;
  lid_open_duration_minutes: number;
  mismatch_detected: boolean;
  mismatch_detail: string | null;
  mismatch_confidence?: number | null;
  damage_status: 'INTACT' | 'DAMAGED';
  damage_reports_count: number;
  citizen_feedbacks_count: number;
  last_updated: string;
  bin_image: string;
  location_image: string;
  ward: string;
  today_collections: number;
  qr_code_url?: string;
  alerts?: AlertItem[];
  collections?: CollectionTask[];
  readings?: SensorReading[];
  damage_reports?: DamageReport[];
  citizen_feedbacks?: CitizenFeedback[];
}

export interface WasteStation {
  id: string;
  name: string;
  code: string;
  location_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  ward: string;
  bins: WasteBin[];
  worst_status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'FULL' | 'OFFLINE';
  has_mismatch: boolean;
  has_damage: boolean;
  total_fill_avg: number;
}

export interface LocationItem {
  id: string;
  name: string;
  code: string;
  zone: string;
  latitude: number;
  longitude: number;
  bin_count: number;
  description: string;
  image: string;
}

export interface AlertItem {
  id: string;
  bin_id: string;
  bin_name: string;
  location_name: string;
  category?: WasteCategory;
  type:
    | 'NEAR_FULL'
    | 'CRITICAL'
    | 'FULL'
    | 'OFFLINE_SENSOR'
    | 'WASTE_MISMATCH'
    | 'LID_ABNORMALLY_OPEN'
    | 'THERMAL_ANOMALY'
    | 'DAMAGE_REPORTED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  fill_level: number;
  threshold: number;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  created_time: string;
  details?: string;
  acknowledged_by?: string | null;
  acknowledged_time?: string | null;
  resolved_by?: string | null;
  resolved_time?: string | null;
  resolution_notes?: string | null;
}

export interface CollectionTask {
  id: string;
  bin_id: string;
  bin_name: string;
  location_name: string;
  category?: WasteCategory;
  alert_id?: string | null;
  assigned_staff: string;
  supervisor: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduled_time: string;
  started_at?: string | null;
  completed_at?: string | null;
  previous_fill_level: number;
  new_fill_level?: number | null;
  notes?: string;
  photo_url?: string;
}

export interface DamageReport {
  id: string;
  bin_id: string;
  bin_name: string;
  location_name: string;
  damage_type: DamageType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  reported_by: string;
  reporter_type: 'CITIZEN' | 'STAFF' | 'ADMIN';
  created_at: string;
  status: 'REPORTED' | 'IN_REPAIR' | 'RESOLVED';
  assigned_staff?: string | null;
  resolved_at?: string | null;
  resolution_notes?: string | null;
}

export interface CitizenFeedback {
  id: string;
  bin_id: string;
  bin_name: string;
  location_name: string;
  category: WasteCategory;
  feedback_type: 'OVERFLOW' | 'ODOR_SMELL' | 'MISMATCH' | 'DAMAGED' | 'CLEANLINESS' | 'OTHER';
  citizen_name: string;
  citizen_contact: string;
  comments: string;
  created_at: string;
  status: 'NEW' | 'ASSIGNED' | 'RESOLVED';
  assigned_to?: string | null;
  resolved_at?: string | null;
  resolution_notes?: string | null;
}

export interface SensorReading {
  id: string;
  bin_id: string;
  timestamp: string;
  fill_level: number;
  battery_level: number;
  temperature_c: number;
  humidity_pct: number;
  lid_status: LidState;
  rssi_dbm: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'SUPER ADMIN' | 'ADMIN' | 'SUPERVISOR' | 'COLLECTION STAFF' | 'VIEWER';
  phone: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
  last_active: string;
}

export interface OrganizationSettings {
  name: string;
  campus: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  alert_threshold_warning: number;
  alert_threshold_critical: number;
  alert_threshold_full: number;
  offline_timeout_minutes: number;
  whatsapp_enabled: boolean;
  whatsapp_recipient: string;
  email_notifications_enabled: boolean;
  email_recipients: string;
  instagram_connected: boolean;
  instagram_handle: string;
}

export interface DashboardSummary {
  total_stations: number;
  total_bins: number;
  normal: number;
  near_full: number;
  critical: number;
  full: number;
  offline: number;
  mismatch_alerts_count: number;
  damage_reports_count: number;
  citizen_feedbacks_count: number;
  active_alerts: number;
  pending_collections: number;
  average_fill_level: number;
  category_breakdown: {
    plastic_avg: number;
    paper_avg: number;
    metal_avg: number;
    organic_avg: number;
  };
  last_sync: string;
}

export interface ReportsSummary {
  utilization_rate_pct: number;
  collection_completion_rate_pct: number;
  average_response_time_minutes: number;
  total_collected_kg_estimate: number;
  segregation_accuracy_pct: number;
  ward_statistics: Array<{
    zone: string;
    bin_count: number;
    high_fill_count: number;
    average_fill: number;
  }>;
  frequently_full_bins: Array<{
    id: string;
    name: string;
    location: string;
    category: WasteCategory;
    current_fill: number;
    collections_today: number;
  }>;
}

export interface NotificationLog {
  id: string;
  channel: 'EMAIL' | 'WHATSAPP' | 'INSTAGRAM';
  title: string;
  message: string;
  recipient: string;
  status: 'SENT' | 'PENDING' | 'QUEUED';
  timestamp: string;
}

export interface IntegrationsData {
  email: {
    enabled: boolean;
    recipients: string;
    last_dispatched: string | null;
    daily_count: number;
  };
  whatsapp: {
    enabled: boolean;
    phone: string;
    provider: string;
    webhook_status: string;
    template_name: string;
    daily_count: number;
  };
  instagram: {
    connected: boolean;
    handle: string;
    last_awareness_post: string;
    status: string;
  };
  logs: NotificationLog[];
}
