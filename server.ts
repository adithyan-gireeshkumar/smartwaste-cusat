import express from 'express';
import type { Request, Response } from 'express';
import http from 'node:http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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
  station_code: string;
  location_id: string;
  location_name: string;
  category: WasteCategory;
  category_label: string;
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

export interface NotificationLog {
  id: string;
  channel: 'EMAIL' | 'WHATSAPP' | 'INSTAGRAM';
  title: string;
  message: string;
  recipient: string;
  status: 'SENT' | 'PENDING' | 'QUEUED';
  timestamp: string;
}

// Global In-Memory Database State
const organization: OrganizationSettings = {
  name: 'CUSAT Smart Waste Management',
  campus: 'Cochin University of Science and Technology',
  address: 'Kalamassery, South Kalamassery, Kochi, Kerala 682022',
  contact_email: 'smartwaste@cusat.ac.in',
  contact_phone: '+91 484 257 5396',
  alert_threshold_warning: 75,
  alert_threshold_critical: 90,
  alert_threshold_full: 100,
  offline_timeout_minutes: 60,
  whatsapp_enabled: true,
  whatsapp_recipient: '+91 98470 12345',
  email_notifications_enabled: true,
  email_recipients: 'sanitation-ops@cusat.ac.in, campus-admin@cusat.ac.in',
  instagram_connected: true,
  instagram_handle: '@green_cusat_initiative',
};

const users: UserAccount[] = [
  { id: 'USR-001', name: 'Dr. Suresh Kumar', email: 'admin.suresh@cusat.ac.in', role: 'SUPER ADMIN', phone: '+91 98470 11001', department: 'Campus Administration & Estate Office', status: 'ACTIVE', last_active: new Date().toISOString() },
  { id: 'USR-002', name: 'Anjali Menon', email: 'menon.anjali@cusat.ac.in', role: 'ADMIN', phone: '+91 98470 22002', department: 'Environmental Safety Wing', status: 'ACTIVE', last_active: new Date().toISOString() },
  { id: 'USR-003', name: 'Rajeev Nair', email: 'rajeev.nair@cusat.ac.in', role: 'SUPERVISOR', phone: '+91 98470 33003', department: 'Central Sanitation & Fleet Division', status: 'ACTIVE', last_active: new Date().toISOString() },
  { id: 'USR-004', name: 'Manoj K.V.', email: 'manoj.fleet@cusat.ac.in', role: 'COLLECTION STAFF', phone: '+91 98470 44004', department: 'Route 1 - Engineering Campus Squad', status: 'ACTIVE', last_active: new Date().toISOString() },
  { id: 'USR-005', name: 'Santhosh Babu', email: 'santhosh.ops@cusat.ac.in', role: 'COLLECTION STAFF', phone: '+91 98470 55005', department: 'Route 2 - Hostel & Amenities Squad', status: 'ACTIVE', last_active: new Date().toISOString() },
  { id: 'USR-006', name: 'Prof. Divya Pillai', email: 'divya.observer@cusat.ac.in', role: 'VIEWER', phone: '+91 98470 66006', department: 'Green Campus Audit Committee', status: 'ACTIVE', last_active: new Date().toISOString() }
];

// 20 CUSAT Campus Locations
const locations: LocationItem[] = [
  { id: 'LOC-01', name: 'Old SOE (School of Engineering)', code: 'SOE-OLD', zone: 'West Academic Zone', latitude: 10.0442, longitude: 76.3268, bin_count: 4, description: 'Main historic engineering classrooms and administrative offices.', image: '/src/assets/images/cusat_soe_building_1790757924488.jpg' },
  { id: 'LOC-02', name: 'Seminar Complex', code: 'SEM-CMP', zone: 'Central Conference Zone', latitude: 10.0448, longitude: 76.3275, bin_count: 4, description: 'National and international symposia auditorium and conference halls.', image: '/src/assets/images/cusat_campus_aerial_1790757892486.jpg' },
  { id: 'LOC-03', name: 'College Library (Central Library)', code: 'LIB-CENT', zone: 'Central Academic Zone', latitude: 10.0455, longitude: 76.3282, bin_count: 4, description: 'Central university library and digital learning commons.', image: '/src/assets/images/cusat_campus_aerial_1790757892486.jpg' },
  { id: 'LOC-04', name: 'CEE / CEECE Complex', code: 'CEE-FAC', zone: 'East Lab Zone', latitude: 10.0438, longitude: 76.3259, bin_count: 4, description: 'Center for Employee Education & Continuing Engineering.', image: '/src/assets/images/cusat_soe_building_1790757924488.jpg' },
  { id: 'LOC-05', name: 'CR (Rural Development Tech)', code: 'CR-DEPT', zone: 'South Innovation Hub', latitude: 10.0432, longitude: 76.3264, bin_count: 3, description: 'Rural technology and sustainable ecosystem research labs.', image: '/src/assets/images/cusat_campus_aerial_1790757892486.jpg' },
  { id: 'LOC-06', name: 'SLS (School of Legal Studies)', code: 'SLS-BLDG', zone: 'Legal & Humanities Zone', latitude: 10.0425, longitude: 76.3280, bin_count: 4, description: 'Prestigious law faculty building with moot courts and seminar halls.', image: '/src/assets/images/cusat_soe_building_1790757924488.jpg' },
  { id: 'LOC-07', name: 'Amenity Centre', code: 'AMN-CTR', zone: 'Central Student Hub', latitude: 10.0445, longitude: 76.3288, bin_count: 4, description: 'Student convenience hub with post office, bank branch, and stationery.', image: '/src/assets/images/smart_waste_bin_1790757905872.jpg' },
  { id: 'LOC-08', name: 'University Auditorium', code: 'AUD-MAIN', zone: 'Cultural Zone', latitude: 10.0450, longitude: 76.3292, bin_count: 4, description: 'Large capacity cultural auditorium for convocation and annual festivals.', image: '/src/assets/images/cusat_campus_aerial_1790757892486.jpg' },
  { id: 'LOC-09', name: 'University Ground', code: 'GRD-MAIN', zone: 'Sports & Athletics Zone', latitude: 10.0465, longitude: 76.3285, bin_count: 3, description: 'Main athletic turf ground, 400m track and spectator pavilions.', image: '/src/assets/images/collection_truck_staff_1790757941097.jpg' },
  { id: 'LOC-010', name: 'New SOE (School of Engineering New Block)', code: 'SOE-NEW', zone: 'West Engineering Campus', latitude: 10.0428, longitude: 76.3248, bin_count: 4, description: 'Multi-story contemporary engineering wing housing CS, IT and EC departments.', image: '/src/assets/images/cusat_soe_building_1790757924488.jpg' },
  { id: 'LOC-011', name: 'Administrative Block (CUSAT HQ)', code: 'ADM-HQ', zone: 'Vice Chancellor & Secretariat', latitude: 10.0459, longitude: 76.3271, bin_count: 4, description: 'University headquarters, Syndicate hall, and registrar division.', image: '/src/assets/images/cusat_campus_aerial_1790757892486.jpg' },
  { id: 'LOC-012', name: 'Main Gate (Kalamassery Highway Entrance)', code: 'GATE-01', zone: 'Security & Access Checkpoint', latitude: 10.0475, longitude: 76.3262, bin_count: 4, description: 'Main ceremonial arch and vehicular transit security gate on NH 544.', image: '/src/assets/images/smart_waste_bin_1790757905872.jpg' },
  { id: 'LOC-013', name: 'Student Centre', code: 'STU-CTR', zone: 'Student Welfare Zone', latitude: 10.0440, longitude: 76.3281, bin_count: 4, description: 'University Union office, cultural activity rooms, and club spaces.', image: '/src/assets/images/cusat_campus_aerial_1790757892486.jpg' },
  { id: 'LOC-014', name: 'Cafeteria / Food Court', code: 'CAFE-01', zone: 'Food & Refreshment Zone', latitude: 10.0449, longitude: 76.3285, bin_count: 4, description: 'Central campus dining court with high footfall during afternoon hours.', image: '/src/assets/images/smart_waste_bin_1790757905872.jpg' },
  { id: 'LOC-015', name: 'Department Area (Applied Sciences)', code: 'DEPT-SCI', zone: 'Science Research Quad', latitude: 10.0461, longitude: 76.3298, bin_count: 4, description: 'Applied Chemistry, Physics, and Polymer Science laboratories.', image: '/src/assets/images/cusat_soe_building_1790757924488.jpg' },
  { id: 'LOC-016', name: 'Science Block', code: 'SCI-BLK', zone: 'Pure Sciences Quad', latitude: 10.0468, longitude: 76.3304, bin_count: 3, description: 'Mathematics, Statistics, and Marine Sciences academic wing.', image: '/src/assets/images/cusat_campus_aerial_1790757892486.jpg' },
  { id: 'LOC-017', name: 'Engineering Block (Labs & Workshops)', code: 'ENG-LAB', zone: 'Industrial Labs Zone', latitude: 10.0435, longitude: 76.3252, bin_count: 4, description: 'Mechanical heavy workshop, fluid mechanics and CAD simulation labs.', image: '/src/assets/images/cusat_soe_building_1790757924488.jpg' },
  { id: 'LOC-018', name: 'Hostel Area (Siberia / Sanathana)', code: 'HSTL-01', zone: 'Residential & Dining Zone', latitude: 10.0418, longitude: 76.3295, bin_count: 4, description: 'Student residential halls cluster with shared dining halls.', image: '/src/assets/images/smart_waste_bin_1790757905872.jpg' },
  { id: 'LOC-019', name: 'Sports Complex & Indoor Stadium', code: 'SPRT-CMP', zone: 'Fitness & Recreation Zone', latitude: 10.0470, longitude: 76.3276, bin_count: 3, description: 'Wooden badminton courts, gym center, and table tennis facilities.', image: '/src/assets/images/collection_truck_staff_1790757941097.jpg' },
  { id: 'LOC-020', name: 'Parking & Campus South Exit', code: 'PARK-EXT', zone: 'Transit & Logistics Zone', latitude: 10.0412, longitude: 76.3260, bin_count: 3, description: 'Vehicular parking area, EV charging bay, and service entrance.', image: '/src/assets/images/smart_waste_bin_1790757905872.jpg' },
];

function computeStatus(fill: number, isOnline = true): 'NORMAL' | 'WARNING' | 'CRITICAL' | 'FULL' | 'OFFLINE' {
  if (!isOnline) return 'OFFLINE';
  if (fill >= organization.alert_threshold_full) return 'FULL';
  if (fill >= organization.alert_threshold_critical) return 'CRITICAL';
  if (fill >= organization.alert_threshold_warning) return 'WARNING';
  return 'NORMAL';
}

function computeThermalCondition(tempC: number): ThermalCondition {
  if (tempC >= 50) return 'FIRE_RISK';
  if (tempC >= 38) return 'ELEVATED_HEAT';
  if (tempC <= 18) return 'COLD';
  return 'NOMINAL';
}

// Generate 3 to 4 categorized bins per location (Plastic, Paper, Metal, Food/Organic)
const CATEGORIES: Array<{ key: WasteCategory; label: string; suffix: string; defaultCap: number }> = [
  { key: 'PLASTIC', label: 'Plastic', suffix: 'PL', defaultCap: 240 },
  { key: 'PAPER', label: 'Paper', suffix: 'PA', defaultCap: 240 },
  { key: 'METAL', label: 'Metal', suffix: 'ME', defaultCap: 120 },
  { key: 'ORGANIC', label: 'Food/Organic', suffix: 'FO', defaultCap: 360 },
];

// Seeded specific test values for prominent locations
const PROMINENT_PRESETS: Record<string, Record<WasteCategory, number>> = {
  'LOC-010': { PLASTIC: 78, PAPER: 43, METAL: 22, ORGANIC: 91 }, // New SOE matching user request!
  'LOC-014': { PLASTIC: 65, PAPER: 38, METAL: 45, ORGANIC: 96 }, // Cafeteria
  'LOC-018': { PLASTIC: 82, PAPER: 55, METAL: 31, ORGANIC: 98 }, // Hostel Area
  'LOC-004': { PLASTIC: 92, PAPER: 40, METAL: 19, ORGANIC: 74 }, // CEECE
  'LOC-001': { PLASTIC: 42, PAPER: 61, METAL: 18, ORGANIC: 53 }, // Old SOE
  'LOC-003': { PLASTIC: 35, PAPER: 72, METAL: 12, ORGANIC: 28 }, // Central Library
};

const initialBins: WasteBin[] = [];

locations.forEach((loc, locIndex) => {
  const numBins = loc.bin_count; // 3 or 4
  const catsToUse = CATEGORIES.slice(0, numBins);
  const stationNum = String(locIndex + 1).padStart(3, '0');

  catsToUse.forEach((cat, catIdx) => {
    const binId = `CUSAT-WB-${stationNum}-${cat.suffix}`;
    const presetFill = PROMINENT_PRESETS[loc.id]?.[cat.key];
    const fill = presetFill !== undefined ? presetFill : Math.floor(25 + ((locIndex * 7 + catIdx * 19) % 65));
    const isOffline = locIndex === 19 && cat.key === 'METAL';
    const isMismatch = loc.id === 'LOC-010' && cat.key === 'PLASTIC'; // Food detected in plastic at New SOE!
    const isLidOpen = loc.id === 'LOC-014' && cat.key === 'ORGANIC'; // Food bin lid open at Cafeteria

    const temp = +(28 + (locIndex % 4) + (cat.key === 'ORGANIC' ? 3.5 : 0)).toFixed(1);
    const humidity = Math.min(95, Math.max(45, 62 + (cat.key === 'ORGANIC' ? 18 : -5)));

    initialBins.push({
      id: binId,
      name: `${loc.name} · ${cat.label} Bin`,
      station_code: `CUSAT-STN-${stationNum}`,
      location_id: loc.id,
      location_name: loc.name,
      category: cat.key,
      category_label: cat.label,
      latitude: +(loc.latitude + (catIdx - 1.5) * 0.00015).toFixed(6),
      longitude: +(loc.longitude + (catIdx - 1.5) * 0.00015).toFixed(6),
      fill_level: fill,
      capacity_liters: cat.defaultCap,
      status: computeStatus(fill, !isOffline),
      device_id: `DEV-ESP32-${stationNum}-${cat.suffix}`,
      device_status: isOffline ? 'OFFLINE' : 'ONLINE',
      battery_level: Math.max(65, 96 - (locIndex % 15)),
      temperature_c: temp,
      humidity_pct: humidity,
      thermal_condition: computeThermalCondition(temp),
      lid_status: isLidOpen ? 'ABNORMALLY_OPEN' : 'CLOSED',
      lid_open_duration_minutes: isLidOpen ? 24 : 0,
      mismatch_detected: isMismatch,
      mismatch_detail: isMismatch ? 'Organic food waste detected in designated Plastic recycling bin.' : null,
      mismatch_confidence: isMismatch ? 0.94 : null,
      damage_status: loc.id === 'LOC-018' && cat.key === 'ORGANIC' ? 'DAMAGED' : 'INTACT',
      damage_reports_count: loc.id === 'LOC-018' && cat.key === 'ORGANIC' ? 1 : 0,
      citizen_feedbacks_count: loc.id === 'LOC-010' ? 1 : 0,
      last_updated: new Date(Date.now() - (locIndex * 3 + catIdx * 2) * 60000).toISOString(),
      bin_image: '/src/assets/images/smart_waste_bin_1790757905872.jpg',
      location_image: loc.image || '/src/assets/images/cusat_soe_building_1790757924488.jpg',
      ward: loc.zone,
      today_collections: cat.key === 'ORGANIC' ? 2 : 1,
      qr_code_url: `/public/feedback/${binId}`,
    });
  });
});

let bins: WasteBin[] = [...initialBins];

// Seeded Damage Reports (Section 3 of prompt)
let damageReports: DamageReport[] = [
  {
    id: 'DMG-101',
    bin_id: 'CUSAT-WB-018-FO',
    bin_name: 'Hostel Area · Food/Organic Bin',
    location_name: 'Hostel Area (Siberia / Sanathana)',
    damage_type: 'WHEEL_DAMAGED',
    severity: 'MEDIUM',
    description: 'Left caster wheel fractured during morning truck emptying operation.',
    reported_by: 'Manoj K.V. (Fleet Staff)',
    reporter_type: 'STAFF',
    created_at: new Date(Date.now() - 110 * 60000).toISOString(),
    status: 'IN_REPAIR',
    assigned_staff: 'Rajeev Nair',
    resolved_at: null,
  },
  {
    id: 'DMG-102',
    bin_id: 'CUSAT-WB-014-FO',
    bin_name: 'Cafeteria / Food Court · Food/Organic Bin',
    location_name: 'Cafeteria / Food Court',
    damage_type: 'LID_DAMAGED',
    severity: 'HIGH',
    description: 'Hydraulic lid damper loose; lid remains open attracting campus birds.',
    reported_by: 'Ananya S. (Student)',
    reporter_type: 'CITIZEN',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    status: 'REPORTED',
    assigned_staff: 'Manoj K.V.',
    resolved_at: null,
  }
];

// Seeded Citizen Feedback (Section 6 of prompt: Scanned from QR)
let citizenFeedbacks: CitizenFeedback[] = [
  {
    id: 'CFB-201',
    bin_id: 'CUSAT-WB-010-PL',
    bin_name: 'New SOE · Plastic Bin',
    location_name: 'New SOE (School of Engineering New Block)',
    category: 'PLASTIC',
    feedback_type: 'MISMATCH',
    citizen_name: 'Gautham R.',
    citizen_contact: 'gautham.eng@cusat.ac.in',
    comments: 'Found wet lunch food packets thrown into the blue plastic recycling bin.',
    created_at: new Date(Date.now() - 35 * 60000).toISOString(),
    status: 'ASSIGNED',
    assigned_to: 'Manoj K.V.',
    resolved_at: null,
  },
  {
    id: 'CFB-202',
    bin_id: 'CUSAT-WB-014-FO',
    bin_name: 'Cafeteria · Food/Organic Bin',
    location_name: 'Cafeteria / Food Court',
    category: 'ORGANIC',
    feedback_type: 'OVERFLOW',
    citizen_name: 'Meera Nambiar',
    citizen_contact: '+91 94470 88991',
    comments: 'Food bin overflowing around lunch hour; waste falling onto walkway.',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    status: 'NEW',
    assigned_to: null,
    resolved_at: null,
  }
];

// Seeded Alerts including Mismatch and Lid state
let alerts: AlertItem[] = [
  {
    id: 'ALT-1001',
    bin_id: 'CUSAT-WB-010-PL',
    bin_name: 'New SOE · Plastic Bin',
    location_name: 'New SOE',
    category: 'PLASTIC',
    type: 'WASTE_MISMATCH',
    severity: 'HIGH',
    fill_level: 78,
    threshold: 0,
    status: 'ACTIVE',
    details: 'AI Sensor Mismatch: Food/Organic waste detected in designated Plastic recycling bin (94% confidence).',
    created_time: new Date(Date.now() - 28 * 60000).toISOString(),
    acknowledged_by: null,
    acknowledged_time: null,
    resolved_by: null,
    resolved_time: null,
  },
  {
    id: 'ALT-1002',
    bin_id: 'CUSAT-WB-010-FO',
    bin_name: 'New SOE · Food/Organic Bin',
    location_name: 'New SOE',
    category: 'ORGANIC',
    type: 'CRITICAL',
    severity: 'CRITICAL',
    fill_level: 91,
    threshold: 90,
    status: 'ACTIVE',
    details: 'Food bin reached critical fill level (91% >= 90%). Immediate pickup required.',
    created_time: new Date(Date.now() - 18 * 60000).toISOString(),
    acknowledged_by: null,
    acknowledged_time: null,
    resolved_by: null,
    resolved_time: null,
  },
  {
    id: 'ALT-1003',
    bin_id: 'CUSAT-WB-014-FO',
    bin_name: 'Cafeteria · Food/Organic Bin',
    location_name: 'Cafeteria / Food Court',
    category: 'ORGANIC',
    type: 'LID_ABNORMALLY_OPEN',
    severity: 'MEDIUM',
    fill_level: 96,
    threshold: 0,
    status: 'ACKNOWLEDGED',
    details: 'Bin lid open continuously for 24 minutes. Rain and odor hazard.',
    created_time: new Date(Date.now() - 50 * 60000).toISOString(),
    acknowledged_by: 'Rajeev Nair (SUPERVISOR)',
    acknowledged_time: new Date(Date.now() - 35 * 60000).toISOString(),
    resolved_by: null,
    resolved_time: null,
  },
  {
    id: 'ALT-1004',
    bin_id: 'CUSAT-WB-018-FO',
    bin_name: 'Hostel Area · Food/Organic Bin',
    location_name: 'Hostel Area',
    category: 'ORGANIC',
    type: 'CRITICAL',
    severity: 'CRITICAL',
    fill_level: 98,
    threshold: 90,
    status: 'ACTIVE',
    details: 'Heavy organic waste accumulation at Hostel Siberia.',
    created_time: new Date(Date.now() - 70 * 60000).toISOString(),
    acknowledged_by: null,
    acknowledged_time: null,
    resolved_by: null,
    resolved_time: null,
  }
];

// Seeded Collection Tasks
let collectionTasks: CollectionTask[] = [
  {
    id: 'COL-501',
    bin_id: 'CUSAT-WB-010-FO',
    bin_name: 'New SOE · Food/Organic Bin',
    location_name: 'New SOE',
    category: 'ORGANIC',
    alert_id: 'ALT-1002',
    assigned_staff: 'Manoj K.V.',
    supervisor: 'Rajeev Nair',
    priority: 'URGENT',
    status: 'ASSIGNED',
    scheduled_time: new Date(Date.now() - 10 * 60000).toISOString(),
    started_at: null,
    completed_at: null,
    previous_fill_level: 91,
    notes: 'Urgent collection triggered by food bin threshold.',
  },
  {
    id: 'COL-502',
    bin_id: 'CUSAT-WB-018-FO',
    bin_name: 'Hostel Area · Food/Organic Bin',
    location_name: 'Hostel Area',
    category: 'ORGANIC',
    alert_id: 'ALT-1004',
    assigned_staff: 'Santhosh Babu',
    supervisor: 'Rajeev Nair',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    scheduled_time: new Date(Date.now() - 25 * 60000).toISOString(),
    started_at: new Date(Date.now() - 12 * 60000).toISOString(),
    completed_at: null,
    previous_fill_level: 98,
    notes: 'Hostel sanitation squad dispatched with EV truck #2.',
  }
];

// Notification Logs
const notificationLogs: NotificationLog[] = [
  {
    id: 'NOTIF-01',
    channel: 'WHATSAPP',
    title: 'Waste Mismatch Alert: New SOE',
    message: '⚠️ [SmartWaste CUSAT] Mismatch detected at New SOE Plastic Bin: Food waste identified in recycling chamber.',
    recipient: '+91 98470 12345 (Sanitation Fleet)',
    status: 'SENT',
    timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
  },
  {
    id: 'NOTIF-02',
    channel: 'EMAIL',
    title: 'Critical Fill Alert: New SOE Organic Bin (91%)',
    message: 'Fill level reached 91% in Food/Organic bin at New SOE. Staff assigned: Manoj K.V.',
    recipient: 'sanitation-ops@cusat.ac.in',
    status: 'SENT',
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
  }
];

// Summary computation
function getDashboardSummaryData() {
  const totalBins = bins.length;
  const normalBins = bins.filter(b => b.status === 'NORMAL').length;
  const warningBins = bins.filter(b => b.status === 'WARNING').length;
  const criticalBins = bins.filter(b => b.status === 'CRITICAL').length;
  const fullBins = bins.filter(b => b.status === 'FULL').length;
  const offlineBins = bins.filter(b => b.status === 'OFFLINE' || b.device_status === 'OFFLINE').length;
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE').length;
  const pendingCollections = collectionTasks.filter(c => c.status === 'PENDING' || c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
  const averageFillLevel = Math.round(bins.reduce((acc, b) => acc + b.fill_level, 0) / (totalBins || 1));

  const plasticBins = bins.filter(b => b.category === 'PLASTIC');
  const paperBins = bins.filter(b => b.category === 'PAPER');
  const metalBins = bins.filter(b => b.category === 'METAL');
  const organicBins = bins.filter(b => b.category === 'ORGANIC');

  const plasticAvg = Math.round(plasticBins.reduce((a, b) => a + b.fill_level, 0) / (plasticBins.length || 1));
  const paperAvg = Math.round(paperBins.reduce((a, b) => a + b.fill_level, 0) / (paperBins.length || 1));
  const metalAvg = Math.round(metalBins.reduce((a, b) => a + b.fill_level, 0) / (metalBins.length || 1));
  const organicAvg = Math.round(organicBins.reduce((a, b) => a + b.fill_level, 0) / (organicBins.length || 1));

  return {
    total_stations: locations.length,
    total_bins: totalBins,
    normal: normalBins,
    near_full: warningBins,
    critical: criticalBins,
    full: fullBins,
    offline: offlineBins,
    mismatch_alerts_count: bins.filter(b => b.mismatch_detected).length,
    damage_reports_count: damageReports.filter(d => d.status !== 'RESOLVED').length,
    citizen_feedbacks_count: citizenFeedbacks.filter(c => c.status !== 'RESOLVED').length,
    active_alerts: activeAlerts,
    pending_collections: pendingCollections,
    average_fill_level: averageFillLevel,
    category_breakdown: {
      plastic_avg: plasticAvg,
      paper_avg: paperAvg,
      metal_avg: metalAvg,
      organic_avg: organicAvg,
    },
    last_sync: new Date().toISOString(),
  };
}

// WebSocket broadcast
const wsClients = new Set<WebSocket>();

function broadcast(event: { type: string; data: unknown }) {
  const msg = JSON.stringify(event);
  for (const client of wsClients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(msg);
      } catch (err) {
        console.error('[SmartWaste WS] Error:', err);
      }
    }
  }
}

// Telemetry processing with Mismatch and Lid state
function processTelemetryReading(
  binId: string,
  fillLevel: number,
  batteryLevel?: number,
  tempC?: number,
  humidityPct?: number,
  lidState?: LidState,
  mismatchDetected?: boolean,
  mismatchDetail?: string,
  deviceStatus?: 'ONLINE' | 'OFFLINE'
) {
  const binIndex = bins.findIndex(b => b.id === binId);
  if (binIndex === -1) {
    throw new Error(`Bin with ID ${binId} not found`);
  }

  const bin = bins[binIndex];
  const newFill = Math.min(100, Math.max(0, fillLevel));
  bin.fill_level = newFill;
  if (batteryLevel !== undefined) bin.battery_level = Math.min(100, Math.max(0, batteryLevel));
  if (tempC !== undefined) {
    bin.temperature_c = tempC;
    bin.thermal_condition = computeThermalCondition(tempC);
  }
  if (humidityPct !== undefined) bin.humidity_pct = Math.min(100, Math.max(0, humidityPct));
  if (lidState !== undefined) {
    bin.lid_status = lidState;
    if (lidState === 'ABNORMALLY_OPEN') {
      bin.lid_open_duration_minutes = Math.max(16, bin.lid_open_duration_minutes + 5);
    } else {
      bin.lid_open_duration_minutes = 0;
    }
  }
  if (mismatchDetected !== undefined) {
    bin.mismatch_detected = mismatchDetected;
    bin.mismatch_detail = mismatchDetected ? (mismatchDetail || 'Waste mismatch detected by camera/spectral sensor.') : null;
  }
  if (deviceStatus) {
    bin.device_status = deviceStatus;
  }

  bin.last_updated = new Date().toISOString();
  bin.status = computeStatus(newFill, bin.device_status === 'ONLINE');

  // Trigger alerts based on thresholds, mismatch, lid, or thermal
  let alertCreated: AlertItem | null = null;

  // 1. Waste Mismatch Alert
  if (bin.mismatch_detected) {
    const existingMismatch = alerts.find(a => a.bin_id === bin.id && a.type === 'WASTE_MISMATCH' && a.status === 'ACTIVE');
    if (!existingMismatch) {
      alertCreated = {
        id: `ALT-${1000 + alerts.length + 1}`,
        bin_id: bin.id,
        bin_name: bin.name,
        location_name: bin.location_name,
        category: bin.category,
        type: 'WASTE_MISMATCH',
        severity: 'HIGH',
        fill_level: newFill,
        threshold: 0,
        status: 'ACTIVE',
        details: bin.mismatch_detail || 'Waste type mismatch detected.',
        created_time: new Date().toISOString(),
        acknowledged_by: null,
        acknowledged_time: null,
        resolved_by: null,
        resolved_time: null,
      };
      alerts.unshift(alertCreated);
    }
  }

  // 2. Abnormally Open Lid Alert
  if (bin.lid_status === 'ABNORMALLY_OPEN') {
    const existingLid = alerts.find(a => a.bin_id === bin.id && a.type === 'LID_ABNORMALLY_OPEN' && a.status === 'ACTIVE');
    if (!existingLid) {
      alertCreated = {
        id: `ALT-${1000 + alerts.length + 1}`,
        bin_id: bin.id,
        bin_name: bin.name,
        location_name: bin.location_name,
        category: bin.category,
        type: 'LID_ABNORMALLY_OPEN',
        severity: 'MEDIUM',
        fill_level: newFill,
        threshold: 0,
        status: 'ACTIVE',
        details: `Bin lid has been open for >${bin.lid_open_duration_minutes} minutes.`,
        created_time: new Date().toISOString(),
        acknowledged_by: null,
        acknowledged_time: null,
        resolved_by: null,
        resolved_time: null,
      };
      alerts.unshift(alertCreated);
    }
  }

  // 3. Fill Threshold Alert
  if (newFill >= organization.alert_threshold_warning && bin.device_status === 'ONLINE') {
    const existingFillAlert = alerts.find(a => a.bin_id === bin.id && (a.type === 'NEAR_FULL' || a.type === 'CRITICAL' || a.type === 'FULL') && (a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED'));
    const alertType = newFill >= organization.alert_threshold_full ? 'FULL' : newFill >= organization.alert_threshold_critical ? 'CRITICAL' : 'NEAR_FULL';
    const severity = newFill >= organization.alert_threshold_full ? 'CRITICAL' : newFill >= organization.alert_threshold_critical ? 'CRITICAL' : 'MEDIUM';
    const threshold = newFill >= organization.alert_threshold_full ? organization.alert_threshold_full : newFill >= organization.alert_threshold_critical ? organization.alert_threshold_critical : organization.alert_threshold_warning;

    if (!existingFillAlert) {
      alertCreated = {
        id: `ALT-${1000 + alerts.length + 1}`,
        bin_id: bin.id,
        bin_name: bin.name,
        location_name: bin.location_name,
        category: bin.category,
        type: alertType,
        severity,
        fill_level: newFill,
        threshold,
        status: 'ACTIVE',
        details: `${bin.category_label} bin exceeded ${threshold}% fill threshold.`,
        created_time: new Date().toISOString(),
        acknowledged_by: null,
        acknowledged_time: null,
        resolved_by: null,
        resolved_time: null,
      };
      alerts.unshift(alertCreated);
    } else {
      existingFillAlert.fill_level = newFill;
      existingFillAlert.type = alertType;
      existingFillAlert.severity = severity;
    }
  }

  // Broadcast real-time update
  broadcast({
    type: 'bin:updated',
    data: {
      bin,
      alertCreated,
      summary: getDashboardSummaryData(),
    }
  });

  return { bin, alertCreated };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. Auth endpoints
  app.post('/api/auth/login/', (req: Request, res: Response) => {
    const user = users.find(u => u.email.toLowerCase() === (req.body.email || '').toLowerCase()) || users[0];
    res.json({ access: 'demo-token', user });
  });

  app.get('/api/users/me/', (_req: Request, res: Response) => res.json(users[0]));
  app.get('/api/users/', (_req: Request, res: Response) => res.json(users));

  app.get('/api/users/:id/', (req: Request, res: Response) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  });

  app.post('/api/users/', (req: Request, res: Response) => {
    const { name, email, role, phone, department } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required.' });
      return;
    }
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(400).json({ error: 'A team member with this email address already exists.' });
      return;
    }
    const newId = `USR-${String(users.length + 1).padStart(3, '0')}`;
    const newUser: UserAccount = {
      id: newId,
      name,
      email,
      role: role || 'COLLECTION STAFF',
      phone: phone || '+91 98470 00000',
      department: department || 'Campus Sanitation Fleet',
      status: 'ACTIVE',
      last_active: new Date().toISOString(),
    };
    users.push(newUser);
    broadcast({ type: 'users:updated', data: { users } });
    res.status(201).json(newUser);
  });

  app.patch('/api/users/:id/', (req: Request, res: Response) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    // Prevent removing SUPER ADMIN role if it's USR-001
    if (user.id === 'USR-001' && req.body.role && req.body.role !== 'SUPER ADMIN') {
      res.status(400).json({ error: 'Cannot demote the primary university super administrator.' });
      return;
    }
    Object.assign(user, req.body);
    user.last_active = new Date().toISOString();
    broadcast({ type: 'users:updated', data: { users } });
    res.json(user);
  });

  app.delete('/api/users/:id/', (req: Request, res: Response) => {
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (users[index].id === 'USR-001') {
      res.status(400).json({ error: 'Cannot delete the primary campus super administrator account.' });
      return;
    }
    const deleted = users.splice(index, 1)[0];
    broadcast({ type: 'users:updated', data: { users } });
    res.json({ message: `User ${deleted.name} (${deleted.id}) has been removed.`, user: deleted });
  });

  app.post('/api/users/:id/toggle-status/', (req: Request, res: Response) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (user.id === 'USR-001' && user.status === 'ACTIVE') {
      res.status(400).json({ error: 'Cannot deactivate the primary super administrator.' });
      return;
    }
    user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    broadcast({ type: 'users:updated', data: { users } });
    res.json(user);
  });

  app.post('/api/users/:id/reset-password/', (req: Request, res: Response) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const tempPass = `Cusat#${Math.floor(1000 + Math.random() * 9000)}!`;
    const newLog: NotificationLog = {
      id: `NOTIF-${Date.now()}-PWD`,
      channel: 'EMAIL',
      title: `Credentials Reset for ${user.name}`,
      message: `Password reset requested for ${user.email}. Temporary login credential: ${tempPass}`,
      recipient: user.email,
      status: 'SENT',
      timestamp: new Date().toISOString(),
    };
    notificationLogs.unshift(newLog);
    res.json({
      success: true,
      message: `Password reset link and temporary passkey dispatched to ${user.email}.`,
      temp_password: tempPass,
    });
  });

  // 2. Organization & Settings
  app.get('/api/organization/', (_req: Request, res: Response) => res.json(organization));
  app.patch('/api/organization/', (req: Request, res: Response) => {
    Object.assign(organization, req.body);
    broadcast({ type: 'organization:updated', data: organization });
    res.json(organization);
  });

  // 3. Locations
  app.get('/api/locations/', (_req: Request, res: Response) => res.json(locations));

  // 4. Bins endpoints (with category filter, station grouping)
  app.get('/api/bins/', (req: Request, res: Response) => {
    let result = [...bins];
    const { status, category, location, search } = req.query;
    if (status && status !== 'ALL') result = result.filter(b => b.status === status);
    if (category && category !== 'ALL') result = result.filter(b => b.category === category);
    if (location && location !== 'ALL') result = result.filter(b => b.location_id === location || b.location_name === location);
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      result = result.filter(b => b.id.toLowerCase().includes(q) || b.name.toLowerCase().includes(q) || b.location_name.toLowerCase().includes(q));
    }
    res.json(result);
  });

  app.get('/api/bins/:id/', (req: Request, res: Response) => {
    const bin = bins.find(b => b.id === req.params.id);
    if (!bin) {
      res.status(404).json({ error: 'Bin not found' });
      return;
    }
    const binAlerts = alerts.filter(a => a.bin_id === bin.id);
    const binCollections = collectionTasks.filter(c => c.bin_id === bin.id);
    const binDamages = damageReports.filter(d => d.bin_id === bin.id);
    const binFeedback = citizenFeedbacks.filter(c => c.bin_id === bin.id);
    res.json({
      ...bin,
      alerts: binAlerts,
      collections: binCollections,
      damage_reports: binDamages,
      citizen_feedbacks: binFeedback,
    });
  });

  app.patch('/api/bins/:id/', (req: Request, res: Response) => {
    const bin = bins.find(b => b.id === req.params.id);
    if (!bin) {
      res.status(404).json({ error: 'Bin not found' });
      return;
    }
    Object.assign(bin, req.body);
    bin.last_updated = new Date().toISOString();
    broadcast({ type: 'bin:updated', data: { bin, summary: getDashboardSummaryData() } });
    res.json(bin);
  });

  app.post('/api/bins/:id/toggle-device-status/', (req: Request, res: Response) => {
    const bin = bins.find(b => b.id === req.params.id);
    if (!bin) {
      res.status(404).json({ error: 'Bin not found' });
      return;
    }
    const newStatus = bin.device_status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    bin.device_status = newStatus;
    bin.status = computeStatus(bin.fill_level, newStatus === 'ONLINE');
    bin.last_updated = new Date().toISOString();
    broadcast({ type: 'bin:updated', data: { bin, summary: getDashboardSummaryData() } });
    res.json(bin);
  });

  // 5. Telemetry & Simulation Endpoints
  app.post('/api/telemetry/', (req: Request, res: Response) => {
    try {
      const { bin_id, fill_level, battery_level, temperature_c, humidity_pct, lid_status, mismatch_detected, mismatch_detail, device_status } = req.body;
      if (!bin_id || fill_level === undefined) {
        res.status(400).json({ error: 'bin_id and fill_level are required in telemetry payload.' });
        return;
      }
      const result = processTelemetryReading(
        bin_id,
        Number(fill_level),
        battery_level !== undefined ? Number(battery_level) : undefined,
        temperature_c !== undefined ? Number(temperature_c) : undefined,
        humidity_pct !== undefined ? Number(humidity_pct) : undefined,
        lid_status,
        mismatch_detected,
        mismatch_detail,
        device_status
      );
      res.json({ success: true, message: 'Telemetry processed and broadcast.', data: result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error processing telemetry';
      res.status(400).json({ error: message });
    }
  });

  // Simulate Waste Mismatch (Prompt requirement 2)
  app.post('/api/telemetry/simulate-mismatch/', (req: Request, res: Response) => {
    const { bin_id, foreign_category, confidence } = req.body;
    const bin = bins.find(b => b.id === bin_id) || bins[0];
    const foreign = foreign_category || 'Food/Organic';
    const detail = `Mismatch Alert: ${foreign} waste detected inside ${bin.category_label} bin (${Math.round((confidence || 0.94) * 100)}% sensor confidence).`;

    bin.mismatch_detected = true;
    bin.mismatch_detail = detail;
    bin.mismatch_confidence = confidence || 0.94;
    bin.last_updated = new Date().toISOString();

    const alertId = `ALT-${1000 + alerts.length + 1}`;
    const alertItem: AlertItem = {
      id: alertId,
      bin_id: bin.id,
      bin_name: bin.name,
      location_name: bin.location_name,
      category: bin.category,
      type: 'WASTE_MISMATCH',
      severity: 'HIGH',
      fill_level: bin.fill_level,
      threshold: 0,
      status: 'ACTIVE',
      details: detail,
      created_time: new Date().toISOString(),
      acknowledged_by: null,
      acknowledged_time: null,
      resolved_by: null,
      resolved_time: null,
    };
    alerts.unshift(alertItem);

    broadcast({ type: 'bin:updated', data: { bin, alertCreated: alertItem, summary: getDashboardSummaryData() } });
    broadcast({ type: 'alert:updated', data: { alert: alertItem, summary: getDashboardSummaryData() } });

    res.json({ success: true, bin, alert: alertItem });
  });

  // Clear Mismatch
  app.post('/api/telemetry/clear-mismatch/', (req: Request, res: Response) => {
    const { bin_id } = req.body;
    const bin = bins.find(b => b.id === bin_id);
    if (!bin) {
      res.status(404).json({ error: 'Bin not found' });
      return;
    }
    bin.mismatch_detected = false;
    bin.mismatch_detail = null;
    bin.mismatch_confidence = null;
    bin.last_updated = new Date().toISOString();

    // Resolve matching alert
    const activeMismatchAlert = alerts.find(a => a.bin_id === bin.id && a.type === 'WASTE_MISMATCH' && a.status !== 'RESOLVED');
    if (activeMismatchAlert) {
      activeMismatchAlert.status = 'RESOLVED';
      activeMismatchAlert.resolved_by = 'Sanitation Staff (Sorted & Cleared)';
      activeMismatchAlert.resolved_time = new Date().toISOString();
      activeMismatchAlert.resolution_notes = 'Impurities removed from recycling bin.';
    }

    broadcast({ type: 'bin:updated', data: { bin, summary: getDashboardSummaryData() } });
    res.json({ success: true, bin });
  });

  // Simulate Lid State (CLOSED / OPEN / ABNORMALLY_OPEN)
  app.post('/api/telemetry/simulate-lid/', (req: Request, res: Response) => {
    const { bin_id, lid_status } = req.body;
    const bin = bins.find(b => b.id === bin_id);
    if (!bin) {
      res.status(404).json({ error: 'Bin not found' });
      return;
    }
    bin.lid_status = lid_status || 'OPEN';
    bin.lid_open_duration_minutes = lid_status === 'ABNORMALLY_OPEN' ? 25 : 0;
    bin.last_updated = new Date().toISOString();

    if (bin.lid_status === 'ABNORMALLY_OPEN') {
      const alertId = `ALT-${1000 + alerts.length + 1}`;
      const alertItem: AlertItem = {
        id: alertId,
        bin_id: bin.id,
        bin_name: bin.name,
        location_name: bin.location_name,
        category: bin.category,
        type: 'LID_ABNORMALLY_OPEN',
        severity: 'MEDIUM',
        fill_level: bin.fill_level,
        threshold: 0,
        status: 'ACTIVE',
        details: `Lid left open for >25 minutes at ${bin.location_name}. Cleanliness & rainwater hazard.`,
        created_time: new Date().toISOString(),
        acknowledged_by: null,
        acknowledged_time: null,
        resolved_by: null,
        resolved_time: null,
      };
      alerts.unshift(alertItem);
    }

    broadcast({ type: 'bin:updated', data: { bin, summary: getDashboardSummaryData() } });
    res.json({ success: true, bin });
  });

  // 6. Damage Reports Endpoints (Prompt requirement 3)
  app.get('/api/damage-reports/', (req: Request, res: Response) => {
    res.json(damageReports);
  });

  app.post('/api/damage-reports/', (req: Request, res: Response) => {
    const { bin_id, damage_type, severity, description, reported_by, reporter_type } = req.body;
    const bin = bins.find(b => b.id === bin_id);
    if (!bin) {
      res.status(400).json({ error: 'Invalid bin_id provided.' });
      return;
    }

    const newReport: DamageReport = {
      id: `DMG-${100 + damageReports.length + 1}`,
      bin_id: bin.id,
      bin_name: bin.name,
      location_name: bin.location_name,
      damage_type: damage_type || 'OTHER',
      severity: severity || 'MEDIUM',
      description: description || 'Physical damage reported on campus bin station.',
      reported_by: reported_by || 'Campus Community Member',
      reporter_type: reporter_type || 'CITIZEN',
      created_at: new Date().toISOString(),
      status: 'REPORTED',
      assigned_staff: 'Rajeev Nair',
    };

    damageReports.unshift(newReport);
    bin.damage_status = 'DAMAGED';
    bin.damage_reports_count += 1;
    bin.last_updated = new Date().toISOString();

    // Create corresponding Damage Alert
    const alertId = `ALT-${1000 + alerts.length + 1}`;
    alerts.unshift({
      id: alertId,
      bin_id: bin.id,
      bin_name: bin.name,
      location_name: bin.location_name,
      category: bin.category,
      type: 'DAMAGE_REPORTED',
      severity: newReport.severity,
      fill_level: bin.fill_level,
      threshold: 0,
      status: 'ACTIVE',
      details: `${newReport.damage_type}: ${newReport.description}`,
      created_time: new Date().toISOString(),
      acknowledged_by: null,
      acknowledged_time: null,
      resolved_by: null,
      resolved_time: null,
    });

    broadcast({ type: 'damage:created', data: { report: newReport, summary: getDashboardSummaryData() } });
    broadcast({ type: 'bin:updated', data: { bin, summary: getDashboardSummaryData() } });

    res.status(201).json(newReport);
  });

  app.patch('/api/damage-reports/:id/', (req: Request, res: Response) => {
    const report = damageReports.find(d => d.id === req.params.id);
    if (!report) {
      res.status(404).json({ error: 'Damage report not found' });
      return;
    }
    Object.assign(report, req.body);
    if (req.body.status === 'RESOLVED') {
      report.resolved_at = new Date().toISOString();
      const bin = bins.find(b => b.id === report.bin_id);
      if (bin) {
        bin.damage_status = 'INTACT';
        bin.last_updated = new Date().toISOString();
      }
    }
    broadcast({ type: 'damage:updated', data: { report, summary: getDashboardSummaryData() } });
    res.json(report);
  });

  // 7. Citizen Feedback Endpoints (Prompt requirement 6 - Scanned from QR)
  app.get('/api/citizen-feedback/', (req: Request, res: Response) => {
    res.json(citizenFeedbacks);
  });

  app.post('/api/citizen-feedback/', (req: Request, res: Response) => {
    const { bin_id, feedback_type, citizen_name, citizen_contact, comments } = req.body;
    const bin = bins.find(b => b.id === bin_id);
    if (!bin) {
      res.status(400).json({ error: 'Invalid bin_id provided for QR feedback.' });
      return;
    }

    const newFeedback: CitizenFeedback = {
      id: `CFB-${200 + citizenFeedbacks.length + 1}`,
      bin_id: bin.id,
      bin_name: bin.name,
      location_name: bin.location_name,
      category: bin.category,
      feedback_type: feedback_type || 'CLEANLINESS',
      citizen_name: citizen_name || 'Anonymous Student / Visitor',
      citizen_contact: citizen_contact || 'N/A',
      comments: comments || 'Feedback submitted via smart bin QR code.',
      created_at: new Date().toISOString(),
      status: 'NEW',
      assigned_to: null,
    };

    citizenFeedbacks.unshift(newFeedback);
    bin.citizen_feedbacks_count += 1;
    bin.last_updated = new Date().toISOString();

    broadcast({ type: 'feedback:created', data: { feedback: newFeedback, summary: getDashboardSummaryData() } });
    broadcast({ type: 'bin:updated', data: { bin, summary: getDashboardSummaryData() } });

    res.status(201).json(newFeedback);
  });

  app.patch('/api/citizen-feedback/:id/', (req: Request, res: Response) => {
    const item = citizenFeedbacks.find(c => c.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Feedback not found' });
      return;
    }
    Object.assign(item, req.body);
    if (req.body.status === 'RESOLVED') {
      item.resolved_at = new Date().toISOString();
    }
    broadcast({ type: 'feedback:updated', data: { feedback: item, summary: getDashboardSummaryData() } });
    res.json(item);
  });

  // 8. Alerts endpoints
  app.get('/api/alerts/', (_req: Request, res: Response) => res.json(alerts));
  app.patch('/api/alerts/:id/acknowledge/', (req: Request, res: Response) => {
    const alert = alerts.find(a => a.id === req.params.id);
    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }
    alert.status = 'ACKNOWLEDGED';
    alert.acknowledged_by = req.body.acknowledged_by || 'Dr. Suresh Kumar (SUPER ADMIN)';
    alert.acknowledged_time = new Date().toISOString();
    broadcast({ type: 'alert:updated', data: { alert, summary: getDashboardSummaryData() } });
    res.json(alert);
  });

  app.patch('/api/alerts/:id/resolve/', (req: Request, res: Response) => {
    const alert = alerts.find(a => a.id === req.params.id);
    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }
    alert.status = 'RESOLVED';
    alert.resolved_by = req.body.resolved_by || 'Rajeev Nair (SUPERVISOR)';
    alert.resolved_time = new Date().toISOString();
    alert.resolution_notes = req.body.resolution_notes || 'Resolved and verified by campus ops team.';

    const bin = bins.find(b => b.id === alert.bin_id);
    if (bin) {
      if (alert.type === 'NEAR_FULL' || alert.type === 'CRITICAL' || alert.type === 'FULL') {
        bin.fill_level = 15;
        bin.status = 'NORMAL';
        bin.today_collections += 1;
      } else if (alert.type === 'WASTE_MISMATCH') {
        bin.mismatch_detected = false;
        bin.mismatch_detail = null;
      } else if (alert.type === 'LID_ABNORMALLY_OPEN') {
        bin.lid_status = 'CLOSED';
        bin.lid_open_duration_minutes = 0;
      }
      bin.last_updated = new Date().toISOString();
      broadcast({ type: 'bin:updated', data: { bin, summary: getDashboardSummaryData() } });
    }

    broadcast({ type: 'alert:updated', data: { alert, summary: getDashboardSummaryData() } });
    res.json(alert);
  });

  // 9. Collections endpoints
  app.get('/api/collections/', (_req: Request, res: Response) => res.json(collectionTasks));
  app.post('/api/collections/', (req: Request, res: Response) => {
    const { bin_id, assigned_staff, priority, notes } = req.body;
    const bin = bins.find(b => b.id === bin_id);
    if (!bin) {
      res.status(400).json({ error: 'Invalid bin_id provided.' });
      return;
    }
    const matchingAlert = alerts.find(a => a.bin_id === bin.id && a.status === 'ACTIVE');
    const newTask: CollectionTask = {
      id: `COL-${500 + collectionTasks.length + 1}`,
      bin_id: bin.id,
      bin_name: bin.name,
      location_name: bin.location_name,
      category: bin.category,
      alert_id: matchingAlert ? matchingAlert.id : null,
      assigned_staff: assigned_staff || 'Manoj K.V.',
      supervisor: 'Rajeev Nair',
      priority: priority || (bin.fill_level >= 90 ? 'URGENT' : 'MEDIUM'),
      status: 'ASSIGNED',
      scheduled_time: new Date().toISOString(),
      started_at: null,
      completed_at: null,
      previous_fill_level: bin.fill_level,
      notes: notes || 'Scheduled pickup.',
    };
    collectionTasks.unshift(newTask);
    broadcast({ type: 'collection:updated', data: { task: newTask, summary: getDashboardSummaryData() } });
    res.status(201).json(newTask);
  });

  app.patch('/api/collections/:id/start/', (req: Request, res: Response) => {
    const task = collectionTasks.find(t => t.id === req.params.id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    task.status = 'IN_PROGRESS';
    task.started_at = new Date().toISOString();
    broadcast({ type: 'collection:updated', data: { task, summary: getDashboardSummaryData() } });
    res.json(task);
  });

  app.patch('/api/collections/:id/complete/', (req: Request, res: Response) => {
    const task = collectionTasks.find(t => t.id === req.params.id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    const newLevel = req.body.new_fill_level !== undefined ? Number(req.body.new_fill_level) : 10;
    task.status = 'COMPLETED';
    task.completed_at = new Date().toISOString();
    task.new_fill_level = newLevel;
    task.notes = req.body.notes || 'Emptied, washed and sanitization spray applied.';

    const bin = bins.find(b => b.id === task.bin_id);
    if (bin) {
      bin.fill_level = newLevel;
      bin.status = computeStatus(newLevel, true);
      bin.today_collections += 1;
      bin.mismatch_detected = false;
      bin.mismatch_detail = null;
      bin.lid_status = 'CLOSED';
      bin.last_updated = new Date().toISOString();
      broadcast({ type: 'bin:updated', data: { bin, summary: getDashboardSummaryData() } });
    }

    if (task.alert_id) {
      const alert = alerts.find(a => a.id === task.alert_id);
      if (alert && alert.status !== 'RESOLVED') {
        alert.status = 'RESOLVED';
        alert.resolved_by = `${task.assigned_staff} (COLLECTION STAFF)`;
        alert.resolved_time = new Date().toISOString();
        alert.resolution_notes = `Collection #${task.id} completed. Fill reduced to ${newLevel}%.`;
        broadcast({ type: 'alert:updated', data: { alert, summary: getDashboardSummaryData() } });
      }
    }

    broadcast({ type: 'collection:updated', data: { task, summary: getDashboardSummaryData() } });
    res.json(task);
  });

  // 10. Dashboard summary & Reports
  app.get('/api/dashboard/summary/', (_req: Request, res: Response) => res.json(getDashboardSummaryData()));

  app.get('/api/reports/summary/', (_req: Request, res: Response) => {
    const zoneStats: Record<string, { total: number; full_or_critical: number; total_fill: number }> = {};
    bins.forEach(b => {
      const z = b.ward || 'Central';
      if (!zoneStats[z]) zoneStats[z] = { total: 0, full_or_critical: 0, total_fill: 0 };
      zoneStats[z].total += 1;
      if (b.fill_level >= 75) zoneStats[z].full_or_critical += 1;
      zoneStats[z].total_fill += b.fill_level;
    });

    const wardStatistics = Object.entries(zoneStats).map(([name, stat]) => ({
      zone: name,
      bin_count: stat.total,
      high_fill_count: stat.full_or_critical,
      average_fill: Math.round(stat.total_fill / stat.total),
    }));

    res.json({
      utilization_rate_pct: 78.4,
      collection_completion_rate_pct: 94.2,
      average_response_time_minutes: 24,
      total_collected_kg_estimate: 1420,
      segregation_accuracy_pct: 91.8,
      ward_statistics: wardStatistics,
      frequently_full_bins: bins.filter(b => b.fill_level >= 75).slice(0, 10).map(b => ({
        id: b.id,
        name: b.name,
        location: b.location_name,
        category: b.category,
        current_fill: b.fill_level,
        collections_today: b.today_collections,
      })),
    });
  });

  // 11. Integrations
  app.get('/api/integrations/', (_req: Request, res: Response) => {
    res.json({
      email: {
        enabled: organization.email_notifications_enabled,
        recipients: organization.email_recipients,
        last_dispatched: notificationLogs.find(n => n.channel === 'EMAIL')?.timestamp || null,
        daily_count: 8,
      },
      whatsapp: {
        enabled: organization.whatsapp_enabled,
        phone: organization.whatsapp_recipient,
        provider: 'Meta WhatsApp Business Cloud API',
        webhook_status: 'ACTIVE_CONNECTED',
        template_name: 'cusat_bin_alert_v2',
        daily_count: 14,
      },
      instagram: {
        connected: organization.instagram_connected,
        handle: organization.instagram_handle,
        last_awareness_post: 'CUSAT Zero Waste Drive - Campus Green Initiative (142 likes)',
        status: 'CONNECTED',
      },
      logs: notificationLogs.slice(0, 10),
    });
  });

  app.post('/api/integrations/instagram/post-update/', (req: Request, res: Response) => {
    const newLog: NotificationLog = {
      id: `NOTIF-${Date.now()}-IG`,
      channel: 'INSTAGRAM',
      title: 'Sustainability Post Published',
      message: req.body.caption || 'CUSAT Smart Waste Milestone reached! Keeping our campus green & clean.',
      recipient: organization.instagram_handle,
      status: 'SENT',
      timestamp: new Date().toISOString(),
    };
    notificationLogs.unshift(newLog);
    res.json({ success: true, log: newLog });
  });

  // 12. Mount Vite middleware or static
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // Create HTTP server and bind WebSocketServer
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    wsClients.add(ws);
    try {
      ws.send(JSON.stringify({
        type: 'init',
        data: {
          bins,
          summary: getDashboardSummaryData(),
          alerts: alerts.filter(a => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED').slice(0, 10),
          damage_reports: damageReports.filter(d => d.status !== 'RESOLVED'),
          citizen_feedbacks: citizenFeedbacks.filter(c => c.status !== 'RESOLVED'),
        }
      }));
    } catch (e) {
      console.error(e);
    }

    ws.on('message', (message) => {
      try {
        const payload = JSON.parse(message.toString());
        if (payload.type === 'ping') ws.send(JSON.stringify({ type: 'pong' }));
      } catch {}
    });

    ws.on('close', () => wsClients.delete(ws));
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[SmartWaste CUSAT] Multi-Bin Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SmartWaste CUSAT] Failed to start server:', err);
});
