import {
  EcoLocation,
  EcoBin,
  EcoAlert,
  EcoFeedback,
  EcoCollectionTask,
  EcoUser,
  EcoAdminProfile,
  WasteType,
  BinStatus
} from '../types';

export const INITIAL_ADMIN_PROFILE: EcoAdminProfile = {
  adminName: 'Dr. Suresh Kumar',
  groupProjectName: 'Team EcoSort CUSAT · Batch 2026',
  email: 'suresh.campus@cusat.ac.in',
  phone: '+91 98470 11001',
  profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  institution: 'Cochin University of Science and Technology',
};

export const INITIAL_LOCATIONS: EcoLocation[] = [
  {
    id: 'LOC-01',
    name: 'Old SOE',
    code: 'SOE-OLD',
    zone: 'West Academic Zone',
    latitude: 10.0442,
    longitude: 76.3268,
    description: 'Main historic engineering classrooms and administrative offices.',
    image: '/src/assets/images/cusat_soe_building_1790757924488.jpg',
    binIds: ['BIN-001', 'BIN-002', 'BIN-003', 'BIN-004'],
  },
  {
    id: 'LOC-02',
    name: 'Seminar Complex',
    code: 'SEM-CMP',
    zone: 'Central Conference Zone',
    latitude: 10.0448,
    longitude: 76.3275,
    description: 'National and international symposia auditorium and conference halls.',
    image: '/src/assets/images/cusat_campus_aerial_1790757892486.jpg',
    binIds: ['BIN-005', 'BIN-006', 'BIN-007', 'BIN-008'],
  },
  {
    id: 'LOC-03',
    name: 'College Library',
    code: 'LIB-CENT',
    zone: 'Central Academic Zone',
    latitude: 10.0455,
    longitude: 76.3282,
    description: 'Central university library and digital learning commons.',
    image: '/src/assets/images/cusat_campus_aerial_1790757892486.jpg',
    binIds: ['BIN-009', 'BIN-010', 'BIN-011', 'BIN-012'],
  },
  {
    id: 'LOC-04',
    name: 'CEECEE',
    code: 'CEE-FAC',
    zone: 'East Lab Zone',
    latitude: 10.0438,
    longitude: 76.3259,
    description: 'Center for Employee Education & Continuing Engineering.',
    image: '/src/assets/images/cusat_soe_building_1790757924488.jpg',
    binIds: ['BIN-013', 'BIN-014', 'BIN-015', 'BIN-016'],
  },
  {
    id: 'LOC-05',
    name: 'CR',
    code: 'CR-DEPT',
    zone: 'South Innovation Hub',
    latitude: 10.0432,
    longitude: 76.3264,
    description: 'Rural technology and sustainable ecosystem research labs.',
    image: '/src/assets/images/cusat_campus_aerial_1790757892486.jpg',
    binIds: ['BIN-017', 'BIN-018', 'BIN-019'],
  },
  {
    id: 'LOC-06',
    name: 'SLS',
    code: 'SLS-BLDG',
    zone: 'Legal & Humanities Zone',
    latitude: 10.0425,
    longitude: 76.3280,
    description: 'School of Legal Studies with moot courts and seminar halls.',
    image: '/src/assets/images/cusat_soe_building_1790757924488.jpg',
    binIds: ['BIN-020', 'BIN-021', 'BIN-022', 'BIN-023'],
  },
  {
    id: 'LOC-07',
    name: 'Aminity',
    code: 'AMN-CTR',
    zone: 'Central Student Hub',
    latitude: 10.0445,
    longitude: 76.3288,
    description: 'Campus amenity centre, post office, stationery, and cooperative store.',
    image: '/src/assets/images/smart_waste_bin_1790757905872.jpg',
    binIds: ['BIN-024', 'BIN-025', 'BIN-026', 'BIN-027'],
  },
  {
    id: 'LOC-08',
    name: 'Auditorium',
    code: 'AUD-MAIN',
    zone: 'Cultural Zone',
    latitude: 10.0450,
    longitude: 76.3292,
    description: 'CUSAT central open-air and indoor convocation auditorium.',
    image: '/src/assets/images/cusat_campus_aerial_1790757892486.jpg',
    binIds: ['BIN-028', 'BIN-029', 'BIN-030', 'BIN-031'],
  },
  {
    id: 'LOC-09',
    name: 'Ground',
    code: 'GRD-MAIN',
    zone: 'Sports & Athletics Zone',
    latitude: 10.0465,
    longitude: 76.3285,
    description: 'Main athletic turf ground, running track, and spectator pavilions.',
    image: '/src/assets/images/collection_truck_staff_1790757941097.jpg',
    binIds: ['BIN-032', 'BIN-033', 'BIN-034'],
  },
  {
    id: 'LOC-10',
    name: 'New SOE',
    code: 'SOE-NEW',
    zone: 'West Engineering Campus',
    latitude: 10.0428,
    longitude: 76.3248,
    description: 'Contemporary multistory engineering wing housing CS, IT and EC departments.',
    image: '/src/assets/images/cusat_soe_building_1790757924488.jpg',
    binIds: ['BIN-035', 'BIN-036', 'BIN-037', 'BIN-038'],
  },
  {
    id: 'LOC-11',
    name: 'Administrative Block',
    code: 'ADM-HQ',
    zone: 'Vice Chancellor & Secretariat',
    latitude: 10.0459,
    longitude: 76.3271,
    description: 'University administrative headquarters and registrar division.',
    image: '/src/assets/images/cusat_campus_aerial_1790757892486.jpg',
    binIds: ['BIN-039', 'BIN-040', 'BIN-041', 'BIN-042'],
  },
  {
    id: 'LOC-12',
    name: 'Student Centre',
    code: 'STU-CTR',
    zone: 'Student Welfare Zone',
    latitude: 10.0440,
    longitude: 76.3281,
    description: 'University Union office, cultural activity rooms, and club spaces.',
    image: '/src/assets/images/cusat_campus_aerial_1790757892486.jpg',
    binIds: ['BIN-043', 'BIN-044', 'BIN-045', 'BIN-046'],
  },
  {
    id: 'LOC-13',
    name: 'Central Cafeteria',
    code: 'CAFE-01',
    zone: 'Food & Refreshment Zone',
    latitude: 10.0449,
    longitude: 76.3285,
    description: 'Campus dining court with heavy organic and food waste influx.',
    image: '/src/assets/images/smart_waste_bin_1790757905872.jpg',
    binIds: ['BIN-047', 'BIN-048', 'BIN-049', 'BIN-050'],
  },
  {
    id: 'LOC-14',
    name: 'Science Block',
    code: 'SCI-BLK',
    zone: 'Pure Sciences Quad',
    latitude: 10.0468,
    longitude: 76.3304,
    description: 'Mathematics, Statistics, and Marine Sciences academic wing.',
    image: '/src/assets/images/cusat_campus_aerial_1790757892486.jpg',
    binIds: ['BIN-051', 'BIN-052', 'BIN-053'],
  },
  {
    id: 'LOC-15',
    name: 'Applied Chemistry Labs',
    code: 'CHEM-LAB',
    zone: 'Science Research Quad',
    latitude: 10.0461,
    longitude: 76.3298,
    description: 'Applied Chemistry, Physics, and Polymer Science laboratories.',
    image: '/src/assets/images/cusat_soe_building_1790757924488.jpg',
    binIds: ['BIN-054', 'BIN-055', 'BIN-056', 'BIN-057'],
  },
  {
    id: 'LOC-16',
    name: 'Engineering Workshops',
    code: 'ENG-WKP',
    zone: 'Industrial Labs Zone',
    latitude: 10.0435,
    longitude: 76.3252,
    description: 'Mechanical heavy workshop, fluid mechanics and CNC fabrication bays.',
    image: '/src/assets/images/cusat_soe_building_1790757924488.jpg',
    binIds: ['BIN-058', 'BIN-059', 'BIN-060', 'BIN-061'],
  },
  {
    id: 'LOC-17',
    name: 'Hostel Siberia',
    code: 'HSTL-SIB',
    zone: 'Residential Zone 1',
    latitude: 10.0418,
    longitude: 76.3295,
    description: 'Senior men student residences with shared dining halls.',
    image: '/src/assets/images/smart_waste_bin_1790757905872.jpg',
    binIds: ['BIN-062', 'BIN-063', 'BIN-064', 'BIN-065'],
  },
  {
    id: 'LOC-18',
    name: 'Hostel Sanathana',
    code: 'HSTL-SAN',
    zone: 'Residential Zone 2',
    latitude: 10.0412,
    longitude: 76.3288,
    description: 'Ladies campus residence with attached green composting pit.',
    image: '/src/assets/images/smart_waste_bin_1790757905872.jpg',
    binIds: ['BIN-066', 'BIN-067', 'BIN-068', 'BIN-069'],
  },
  {
    id: 'LOC-19',
    name: 'Indoor Sports Complex',
    code: 'SPRT-CMP',
    zone: 'Fitness & Recreation Zone',
    latitude: 10.0470,
    longitude: 76.3276,
    description: 'Badminton wooden courts, gymnasium, and recreation pavilions.',
    image: '/src/assets/images/collection_truck_staff_1790757941097.jpg',
    binIds: ['BIN-070', 'BIN-071', 'BIN-072'],
  },
  {
    id: 'LOC-20',
    name: 'Main Kalamassery Gate',
    code: 'GATE-MAIN',
    zone: 'Transit & Highway Checkpoint',
    latitude: 10.0475,
    longitude: 76.3262,
    description: 'CUSAT ceremonial entrance archway and transit bus stop on NH 544.',
    image: '/src/assets/images/smart_waste_bin_1790757905872.jpg',
    binIds: ['BIN-073', 'BIN-074', 'BIN-075', 'BIN-076'],
  },
];

const WASTE_STREAMS: Array<{ type: WasteType; label: string; defaultCap: number }> = [
  { type: 'PLASTIC', label: 'Plastic', defaultCap: 240 },
  { type: 'PAPER', label: 'Paper', defaultCap: 240 },
  { type: 'METAL', label: 'Metal', defaultCap: 120 },
  { type: 'FOOD', label: 'Food Waste', defaultCap: 360 },
];

function calculateStatus(fill: number, isOnline = true, physical = 'GOOD'): BinStatus {
  if (!isOnline) return 'OFFLINE';
  if (physical === 'BROKEN') return 'URGENT';
  if (fill >= 95) return 'URGENT';
  if (fill >= 75) return 'COLLECTION_REQUIRED';
  if (fill >= 50) return 'WARNING';
  return 'NORMAL';
}

export function generateInitialBins(): EcoBin[] {
  const bins: EcoBin[] = [];
  let binCounter = 1;

  INITIAL_LOCATIONS.forEach((loc, locIndex) => {
    const streamCount = loc.binIds.length;
    const streams = WASTE_STREAMS.slice(0, streamCount);

    streams.forEach((stream, streamIndex) => {
      const binId = `BIN-${String(binCounter).padStart(3, '0')}`;
      binCounter++;

      // Seeded realistic presets for prominent locations
      let fill = 35 + ((locIndex * 9 + streamIndex * 23) % 55);
      let wrongWaste = false;
      let wrongDetail = null;
      let isOpen = false;
      let unexpectedOpening = false;
      let condition: any = 'GOOD';
      let isOnline = true;
      let temp = 29 + (locIndex % 4) + (stream.type === 'FOOD' ? 3.5 : 0);
      let humidity = 60 + (locIndex % 15) + (stream.type === 'FOOD' ? 12 : 0);

      // New SOE (LOC-10) specific showcase values
      if (loc.id === 'LOC-10') {
        if (stream.type === 'PLASTIC') {
          fill = 78;
          wrongWaste = true;
          wrongDetail = {
            expected: 'Plastic',
            detected: 'Food Waste (Organic)',
            timestamp: '12 min ago',
            confidencePct: 94,
          };
        } else if (stream.type === 'PAPER') {
          fill = 43;
        } else if (stream.type === 'METAL') {
          fill = 22;
        } else if (stream.type === 'FOOD') {
          fill = 91; // Critical level
        }
      }

      // Cafeteria (LOC-13)
      if (loc.id === 'LOC-13') {
        if (stream.type === 'FOOD') {
          fill = 96;
          isOpen = true;
          unexpectedOpening = true;
        }
      }

      // Hostel Siberia (LOC-17)
      if (loc.id === 'LOC-17') {
        if (stream.type === 'FOOD') {
          fill = 98;
          condition = 'MINOR_DAMAGE';
        }
      }

      // Sports Complex (LOC-19)
      if (loc.id === 'LOC-19' && stream.type === 'METAL') {
        isOnline = false;
      }

      const status = calculateStatus(fill, isOnline, condition);

      bins.push({
        id: binId,
        name: `${loc.name} · ${stream.label} Bin`,
        locationId: loc.id,
        locationName: loc.name,
        wasteType: stream.type,
        wasteLabel: stream.label,
        fillLevel: fill,
        capacityLiters: stream.defaultCap,
        status,
        isOnline,
        isOpen,
        unexpectedOpening,
        latitude: +(loc.latitude + (streamIndex - 1.5) * 0.00015).toFixed(6),
        longitude: +(loc.longitude + (streamIndex - 1.5) * 0.00015).toFixed(6),
        batteryLevel: Math.max(45, 96 - (locIndex % 18)),
        temperatureC: +temp.toFixed(1),
        humidityPct: Math.min(95, Math.max(40, humidity)),
        thermalCondition: temp >= 40 ? 'HEAT_WARNING' : 'NORMAL',
        physicalCondition: condition,
        wrongWasteDetected: wrongWaste,
        wrongWasteDetail: wrongDetail,
        lastUpdated: new Date(Date.now() - (locIndex * 3 + streamIndex * 2) * 60000).toISOString(),
        assignedCollector: fill >= 75 ? (locIndex % 2 === 0 ? 'Manoj K.V.' : 'Santhosh Babu') : null,
        collectionStatus: fill >= 95 ? 'IN_PROGRESS' : fill >= 75 ? 'ASSIGNED' : 'PENDING',
        binImage: '/src/assets/images/smart_waste_bin_1790757905872.jpg',
        locationImage: loc.image,
        qrCodeUrl: `/citizen-report?bin=${binId}`,
      });
    });
  });

  return bins;
}

export const INITIAL_USERS: EcoUser[] = [
  {
    id: 'USR-01',
    name: 'Dr. Suresh Kumar',
    email: 'admin.suresh@cusat.ac.in',
    role: 'ADMIN',
    phone: '+91 98470 11001',
    department: 'Campus Administration & Green Initiative',
    status: 'ACTIVE',
    lastActive: 'Just now',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'USR-02',
    name: 'Anjali Menon',
    email: 'menon.anjali@cusat.ac.in',
    role: 'STAFF',
    phone: '+91 98470 22002',
    department: 'Environmental Safety Wing',
    status: 'ACTIVE',
    lastActive: '5 min ago',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'USR-03',
    name: 'Rajeev Nair',
    email: 'rajeev.nair@cusat.ac.in',
    role: 'STAFF',
    phone: '+91 98470 33003',
    department: 'Central Sanitation & Fleet Division',
    status: 'ACTIVE',
    lastActive: '12 min ago',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'USR-04',
    name: 'Manoj K.V.',
    email: 'manoj.fleet@cusat.ac.in',
    role: 'COLLECTOR',
    phone: '+91 98470 44004',
    department: 'Route 1 - Engineering Campus Squad',
    status: 'ACTIVE',
    lastActive: 'En Route',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'USR-05',
    name: 'Santhosh Babu',
    email: 'santhosh.ops@cusat.ac.in',
    role: 'COLLECTOR',
    phone: '+91 98470 55005',
    department: 'Route 2 - Hostel & Amenities Squad',
    status: 'ACTIVE',
    lastActive: 'En Route',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'USR-06',
    name: 'Prof. Divya Pillai',
    email: 'divya.observer@cusat.ac.in',
    role: 'VIEWER',
    phone: '+91 98470 66006',
    department: 'Green Campus Audit Committee',
    status: 'ACTIVE',
    lastActive: '1 hr ago',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
  },
];

export const INITIAL_ALERTS: EcoAlert[] = [
  {
    id: 'ALT-101',
    binId: 'BIN-035',
    binName: 'New SOE · Plastic Bin',
    locationName: 'New SOE',
    wasteType: 'PLASTIC',
    type: 'WRONG_WASTE',
    title: 'Wrong Waste Detected',
    description: 'Food Waste (Organic) detected in Plastic bin (94% confidence). Requires sorting.',
    severity: 'WARNING',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    isRead: false,
    isResolved: false,
  },
  {
    id: 'ALT-102',
    binId: 'BIN-038',
    binName: 'New SOE · Food Waste Bin',
    locationName: 'New SOE',
    wasteType: 'FOOD',
    type: 'OVERFLOW',
    title: 'Critical Fill Level (91%)',
    description: 'Food bin reached 91% capacity. Priority collection required to avoid odor.',
    severity: 'CRITICAL',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    isRead: false,
    isResolved: false,
  },
  {
    id: 'ALT-103',
    binId: 'BIN-050',
    binName: 'Central Cafeteria · Food Waste Bin',
    locationName: 'Central Cafeteria',
    wasteType: 'FOOD',
    type: 'BIN_OPENED',
    title: 'Bin Opened Unexpectedly',
    description: 'Lid open continuously for >20 minutes during non-collection hours.',
    severity: 'WARNING',
    timestamp: new Date(Date.now() - 38 * 60000).toISOString(),
    isRead: true,
    isResolved: false,
  },
  {
    id: 'ALT-104',
    binId: 'BIN-065',
    binName: 'Hostel Siberia · Food Waste Bin',
    locationName: 'Hostel Siberia',
    wasteType: 'FOOD',
    type: 'OVERFLOW',
    title: 'Urgent Overflow Hazard (98%)',
    description: 'Heavy weekend organic waste accumulation. Squad dispatched.',
    severity: 'CRITICAL',
    timestamp: new Date(Date.now() - 50 * 60000).toISOString(),
    isRead: false,
    isResolved: false,
  },
  {
    id: 'ALT-105',
    binId: 'BIN-072',
    binName: 'Indoor Sports Complex · Metal Bin',
    locationName: 'Indoor Sports Complex',
    wasteType: 'METAL',
    type: 'SENSOR_OFFLINE',
    title: 'Sensor Offline',
    description: 'Ultrasonic sensor telemetry timeout >60 minutes. Check battery/connection.',
    severity: 'INFO',
    timestamp: new Date(Date.now() - 75 * 60000).toISOString(),
    isRead: true,
    isResolved: false,
  },
];

export const INITIAL_FEEDBACK: EcoFeedback[] = [
  {
    id: 'FB-501',
    binId: 'BIN-035',
    locationName: 'New SOE',
    wasteType: 'PLASTIC',
    rating: 4,
    complaintType: 'WRONG_WASTE',
    comment: 'Someone threw paper lunch cups and food boxes into the plastic recycling chamber.',
    citizenName: 'Adithyan G.',
    contact: '+91 94470 12345',
    submittedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    status: 'IN_PROGRESS',
    assignedTo: 'Manoj K.V.',
  },
  {
    id: 'FB-502',
    binId: 'BIN-050',
    locationName: 'Central Cafeteria',
    wasteType: 'FOOD',
    rating: 4,
    complaintType: 'OVERFLOW',
    comment: 'Food waste is overflowing onto the walkway near juice counter. Flies gathering.',
    citizenName: 'Meera Nambiar',
    contact: '+91 94470 55667',
    submittedAt: new Date(Date.now() - 40 * 60000).toISOString(),
    status: 'PENDING',
  },
  {
    id: 'FB-503',
    binId: 'BIN-009',
    locationName: 'College Library',
    wasteType: 'PLASTIC',
    rating: 5,
    complaintType: 'OTHER',
    comment: 'Smart bin sensor was very quick to respond and clean. Great initiative for CUSAT!',
    citizenName: 'Rahul V.',
    contact: 'rahul.student@cusat.ac.in',
    submittedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    status: 'RESOLVED',
    resolutionNote: 'Reviewed by library sanitation squad.',
  },
];

export const INITIAL_COLLECTIONS: EcoCollectionTask[] = [
  {
    id: 'COL-101',
    binId: 'BIN-038',
    binName: 'New SOE · Food Waste Bin',
    locationName: 'New SOE',
    wasteType: 'FOOD',
    fillLevel: 91,
    priority: 'URGENT',
    assignedCollector: 'Manoj K.V.',
    status: 'ASSIGNED',
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    previousFillLevel: 91,
    notes: 'Urgent collection triggered by food bin threshold.',
  },
  {
    id: 'COL-102',
    binId: 'BIN-065',
    binName: 'Hostel Siberia · Food Waste Bin',
    locationName: 'Hostel Siberia',
    wasteType: 'FOOD',
    fillLevel: 98,
    priority: 'URGENT',
    assignedCollector: 'Santhosh Babu',
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    previousFillLevel: 98,
    notes: 'Hostel sanitation squad dispatched with EV collection cart.',
  },
  {
    id: 'COL-103',
    binId: 'BIN-015',
    binName: 'CEECEE · Metal Bin',
    locationName: 'CEECEE',
    wasteType: 'METAL',
    fillLevel: 79,
    priority: 'HIGH',
    assignedCollector: 'Manoj K.V.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    previousFillLevel: 79,
    notes: 'Scheduled for afternoon route.',
  },
];
