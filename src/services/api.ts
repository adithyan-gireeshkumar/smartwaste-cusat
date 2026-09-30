import {
  WasteBin,
  LocationItem,
  AlertItem,
  CollectionTask,
  UserAccount,
  OrganizationSettings,
  DashboardSummary,
  ReportsSummary,
  IntegrationsData,
  SensorReading,
  DamageReport,
  CitizenFeedback,
  LidState
} from '../types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.error) errorDetail = body.error;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Dashboard & Summary
  getDashboardSummary: () => fetchJson<DashboardSummary>('/api/dashboard/summary/'),

  // Organization
  getOrganization: () => fetchJson<OrganizationSettings>('/api/organization/'),
  updateOrganization: (data: Partial<OrganizationSettings>) =>
    fetchJson<OrganizationSettings>('/api/organization/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Locations
  getLocations: () => fetchJson<LocationItem[]>('/api/locations/'),

  // Bins
  getBins: (params?: { status?: string; category?: string; location?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') q.set('status', params.status);
    if (params?.category && params.category !== 'ALL') q.set('category', params.category);
    if (params?.location && params.location !== 'ALL') q.set('location', params.location);
    if (params?.search) q.set('search', params.search);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return fetchJson<WasteBin[]>(`/api/bins/${queryStr}`);
  },
  getBinDetails: (id: string) => fetchJson<WasteBin>(`/api/bins/${id}/`),
  updateBin: (id: string, data: Partial<WasteBin>) =>
    fetchJson<WasteBin>(`/api/bins/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  createBin: (data: { name: string; location_id: string; capacity_liters: number }) =>
    fetchJson<WasteBin>('/api/bins/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteBin: (id: string) =>
    fetchJson<{ message: string; bin: WasteBin }>(`/api/bins/${id}/`, {
      method: 'DELETE',
    }),
  toggleBinDeviceStatus: (id: string) =>
    fetchJson<WasteBin>(`/api/bins/${id}/toggle-device-status/`, {
      method: 'POST',
    }),
  getBinReadings: (id: string) => fetchJson<SensorReading[]>(`/api/bins/${id}/readings/`),

  // Telemetry (Simulation & ESP32 ingestion)
  sendTelemetry: (payload: {
    bin_id: string;
    fill_level: number;
    battery_level?: number;
    temperature_c?: number;
    humidity_pct?: number;
    lid_status?: LidState;
    mismatch_detected?: boolean;
    mismatch_detail?: string;
  }) =>
    fetchJson<{
      success: boolean;
      message: string;
      data: { bin: WasteBin; alertCreated: AlertItem | null };
    }>('/api/telemetry/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Waste-Type Mismatch Simulation (Requirement 2)
  simulateMismatch: (data: { bin_id: string; foreign_category?: string; confidence?: number }) =>
    fetchJson<{ success: boolean; bin: WasteBin; alert: AlertItem }>('/api/telemetry/simulate-mismatch/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  clearMismatch: (bin_id: string) =>
    fetchJson<{ success: boolean; bin: WasteBin }>('/api/telemetry/clear-mismatch/', {
      method: 'POST',
      body: JSON.stringify({ bin_id }),
    }),

  // Lid State Simulation (Requirement 4)
  simulateLidStatus: (data: { bin_id: string; lid_status: LidState }) =>
    fetchJson<{ success: boolean; bin: WasteBin }>('/api/telemetry/simulate-lid/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Damage Reports (Requirement 3)
  getDamageReports: () => fetchJson<DamageReport[]>('/api/damage-reports/'),
  createDamageReport: (data: Partial<DamageReport>) =>
    fetchJson<DamageReport>('/api/damage-reports/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDamageReport: (id: string, data: Partial<DamageReport>) =>
    fetchJson<DamageReport>(`/api/damage-reports/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Citizen Feedback via QR Scan (Requirement 6)
  getCitizenFeedback: () => fetchJson<CitizenFeedback[]>('/api/citizen-feedback/'),
  submitCitizenFeedback: (data: {
    bin_id: string;
    feedback_type: string;
    citizen_name?: string;
    citizen_contact?: string;
    comments: string;
  }) =>
    fetchJson<CitizenFeedback>('/api/citizen-feedback/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCitizenFeedback: (id: string, data: Partial<CitizenFeedback>) =>
    fetchJson<CitizenFeedback>(`/api/citizen-feedback/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Alerts
  getAlerts: () => fetchJson<AlertItem[]>('/api/alerts/'),
  acknowledgeAlert: (id: string, acknowledged_by?: string) =>
    fetchJson<AlertItem>(`/api/alerts/${id}/acknowledge/`, {
      method: 'PATCH',
      body: JSON.stringify({ acknowledged_by }),
    }),
  resolveAlert: (id: string, notes?: string, resolved_by?: string) =>
    fetchJson<AlertItem>(`/api/alerts/${id}/resolve/`, {
      method: 'PATCH',
      body: JSON.stringify({ resolution_notes: notes, resolved_by }),
    }),

  // Collections
  getCollections: () => fetchJson<CollectionTask[]>('/api/collections/'),
  createCollectionTask: (data: { bin_id: string; assigned_staff?: string; priority?: string; notes?: string }) =>
    fetchJson<CollectionTask>('/api/collections/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  assignCollectionTask: (id: string, assigned_staff: string) =>
    fetchJson<CollectionTask>(`/api/collections/${id}/assign/`, {
      method: 'PATCH',
      body: JSON.stringify({ assigned_staff }),
    }),
  startCollectionTask: (id: string) =>
    fetchJson<CollectionTask>(`/api/collections/${id}/start/`, {
      method: 'PATCH',
    }),
  completeCollectionTask: (id: string, new_fill_level: number, notes?: string) =>
    fetchJson<CollectionTask>(`/api/collections/${id}/complete/`, {
      method: 'PATCH',
      body: JSON.stringify({ new_fill_level, notes }),
    }),

  // Users & Team
  getUsers: () => fetchJson<UserAccount[]>('/api/users/'),
  createUser: (data: Partial<UserAccount>) =>
    fetchJson<UserAccount>('/api/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (id: string, data: Partial<UserAccount>) =>
    fetchJson<UserAccount>(`/api/users/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteUser: (id: string) =>
    fetchJson<{ message: string; user?: UserAccount }>(`/api/users/${id}/`, {
      method: 'DELETE',
    }),
  toggleUserStatus: (id: string) =>
    fetchJson<UserAccount>(`/api/users/${id}/toggle-status/`, {
      method: 'POST',
    }),
  resetUserPassword: (id: string) =>
    fetchJson<{ success: boolean; message: string; temp_password?: string }>(`/api/users/${id}/reset-password/`, {
      method: 'POST',
    }),

  // Reports
  getReportsSummary: () => fetchJson<ReportsSummary>('/api/reports/summary/'),

  // Integrations
  getIntegrations: () => fetchJson<IntegrationsData>('/api/integrations/'),
  publishInstagramUpdate: (caption: string) =>
    fetchJson<{ success: boolean; log: unknown }>('/api/integrations/instagram/post-update/', {
      method: 'POST',
      body: JSON.stringify({ caption }),
    }),
};
