import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Shield,
  Mail,
  Phone,
  Building,
  CheckCircle,
  Trash2,
  Key,
  Edit2,
  UserCheck,
  UserX,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldAlert,
  Sparkles,
  Info,
  Clock,
  Briefcase
} from 'lucide-react';
import { UserAccount } from '../types';
import { api } from '../services/api';

interface TeamPageProps {
  users: UserAccount[];
  onRefresh: () => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({ users, onRefresh }) => {
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [resettingUser, setResettingUser] = useState<UserAccount | null>(null);
  const [tempPasswordResult, setTempPasswordResult] = useState<{ email: string; pass: string } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'PERMISSIONS'>('MEMBERS');

  // Form fields for Add
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserAccount['role']>('COLLECTION STAFF');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserAccount['role']>('COLLECTION STAFF');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartment, setEditDepartment] = useState('');

  // Open Edit Modal
  const handleOpenEdit = (u: UserAccount) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditPhone(u.phone);
    setEditDepartment(u.department);
    setErrorMsg(null);
  };

  // Submit Edit
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.updateUser(editingUser.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        phone: editPhone.trim(),
        department: editDepartment.trim(),
      });
      setEditingUser(null);
      onRefresh();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error updating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Create
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        phone: phone.trim() || '+91 98470 00000',
        department: department.trim() || 'Campus Sanitation Fleet',
      });
      setIsAddModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setDepartment('');
      onRefresh();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error creating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (u: UserAccount) => {
    try {
      await api.toggleUserStatus(u.id);
      onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error toggling status');
    }
  };

  // Reset Credentials
  const handleResetPassword = async (u: UserAccount) => {
    try {
      const res = await api.resetUserPassword(u.id);
      setTempPasswordResult({
        email: u.email,
        pass: res.temp_password || 'Cusat#Ops2026!',
      });
      onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error resetting credentials');
    }
  };

  // Delete User
  const handleDeleteUser = async (u: UserAccount) => {
    if (u.id === 'USR-001') {
      alert('Cannot delete the primary campus super administrator account.');
      return;
    }
    if (!confirm(`Are you sure you want to remove ${u.name} (${u.role}) from SmartWaste CUSAT?`)) return;
    try {
      await api.deleteUser(u.id);
      onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error removing user');
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone.includes(searchQuery);
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const getRoleBadge = (roleName: UserAccount['role']) => {
    switch (roleName) {
      case 'SUPER ADMIN':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'ADMIN':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'SUPERVISOR':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'COLLECTION STAFF':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const copyTempPassword = () => {
    if (tempPasswordResult) {
      navigator.clipboard.writeText(tempPasswordResult.pass);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  // Metrics
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const superAdminCount = users.filter((u) => u.role === 'SUPER ADMIN' || u.role === 'ADMIN').length;
  const supervisorCount = users.filter((u) => u.role === 'SUPERVISOR').length;
  const fleetStaffCount = users.filter((u) => u.role === 'COLLECTION STAFF').length;

  // Permissions Matrix Definition
  const permissionsList = [
    {
      action: 'View Campus Map & Real-Time Fill Levels',
      roles: { 'SUPER ADMIN': true, 'ADMIN': true, 'SUPERVISOR': true, 'COLLECTION STAFF': true, 'VIEWER': true },
    },
    {
      action: 'Trigger Sensor Telemetry Simulation',
      roles: { 'SUPER ADMIN': true, 'ADMIN': true, 'SUPERVISOR': true, 'COLLECTION STAFF': false, 'VIEWER': false },
    },
    {
      action: 'Acknowledge & Resolve Fill/Mismatch Alerts',
      roles: { 'SUPER ADMIN': true, 'ADMIN': true, 'SUPERVISOR': true, 'COLLECTION STAFF': false, 'VIEWER': false },
    },
    {
      action: 'Dispatch & Reassign Collection Tasks',
      roles: { 'SUPER ADMIN': true, 'ADMIN': true, 'SUPERVISOR': true, 'COLLECTION STAFF': false, 'VIEWER': false },
    },
    {
      action: 'Complete Collection & Record Weight/Level',
      roles: { 'SUPER ADMIN': true, 'ADMIN': true, 'SUPERVISOR': true, 'COLLECTION STAFF': true, 'VIEWER': false },
    },
    {
      action: 'Assign & Sign-off Bin Damage Work Orders',
      roles: { 'SUPER ADMIN': true, 'ADMIN': true, 'SUPERVISOR': true, 'COLLECTION STAFF': true, 'VIEWER': false },
    },
    {
      action: 'Review & Resolve Citizen QR Grievances',
      roles: { 'SUPER ADMIN': true, 'ADMIN': true, 'SUPERVISOR': true, 'COLLECTION STAFF': false, 'VIEWER': false },
    },
    {
      action: 'Configure Thresholds & Offline Timeouts',
      roles: { 'SUPER ADMIN': true, 'ADMIN': true, 'SUPERVISOR': false, 'COLLECTION STAFF': false, 'VIEWER': false },
    },
    {
      action: 'Manage WhatsApp & Instagram Integrations',
      roles: { 'SUPER ADMIN': true, 'ADMIN': true, 'SUPERVISOR': false, 'COLLECTION STAFF': false, 'VIEWER': false },
    },
    {
      action: 'Add, Edit, and Revoke Team Role Access',
      roles: { 'SUPER ADMIN': true, 'ADMIN': false, 'SUPERVISOR': false, 'COLLECTION STAFF': false, 'VIEWER': false },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <span>Team & Role-Based Access Control (RBAC)</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              5 Access Tiers
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Personnel directory, role provisioning, and field operational permissions for CUSAT Smart Waste Management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsAddModalOpen(true);
              setErrorMsg(null);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Total Personnel</span>
          <div className="text-xl font-bold font-mono text-white tabular-nums">{totalCount}</div>
          <span className="text-[10px] text-slate-500 font-mono">Registered accounts</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-emerald-400">Active Operators</span>
          <div className="text-xl font-bold font-mono text-emerald-300 tabular-nums">{activeCount}</div>
          <span className="text-[10px] text-slate-500 font-mono">Status: Nominal</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-purple-400">Admins & Super</span>
          <div className="text-xl font-bold font-mono text-purple-300 tabular-nums">{superAdminCount}</div>
          <span className="text-[10px] text-slate-500 font-mono">System controllers</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-blue-400">Supervisors</span>
          <div className="text-xl font-bold font-mono text-blue-300 tabular-nums">{supervisorCount}</div>
          <span className="text-[10px] text-slate-500 font-mono">Fleet dispatchers</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-amber-400">Collection Fleet</span>
          <div className="text-xl font-bold font-mono text-amber-300 tabular-nums">{fleetStaffCount}</div>
          <span className="text-[10px] text-slate-500 font-mono">Field ground squad</span>
        </div>
      </div>

      {/* Main Tab Navigation & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('MEMBERS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'MEMBERS'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Personnel Directory ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PERMISSIONS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'PERMISSIONS'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Role Permissions Matrix</span>
          </button>
        </div>

        {activeTab === 'MEMBERS' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, email, dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 w-52 focus:outline-none focus:border-slate-700"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER ADMIN">SUPER ADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPERVISOR">SUPERVISOR</option>
              <option value="COLLECTION STAFF">COLLECTION STAFF</option>
              <option value="VIEWER">VIEWER</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: MEMBERS DIRECTORY */}
      {activeTab === 'MEMBERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-medium text-slate-300">No personnel found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No users match the search query or active filter settings.
              </p>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isSuper = u.role === 'SUPER ADMIN';
              const isActive = u.status === 'ACTIVE';

              return (
                <div
                  key={u.id}
                  className={`p-5 bg-slate-900 border rounded-2xl flex flex-col justify-between space-y-4 transition-all duration-200 hover:border-slate-700 ${
                    !isActive ? 'opacity-60 border-slate-800/60' : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Member Top Bar */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-full border flex items-center justify-center font-bold text-sm text-slate-100 ${
                            isSuper
                              ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                              : u.role === 'ADMIN'
                              ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
                              : u.role === 'SUPERVISOR'
                              ? 'bg-blue-950/60 border-blue-500/50 text-blue-300'
                              : u.role === 'COLLECTION STAFF'
                              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                              : 'bg-slate-800 border-slate-700'
                          }`}
                        >
                          {u.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-semibold text-white">{u.name}</h3>
                            <span className="font-mono text-[10px] text-slate-500">#{u.id}</span>
                          </div>
                          <span
                            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border inline-block mt-0.5 ${getRoleBadge(
                              u.role
                            )}`}
                          >
                            {u.role}
                          </span>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                          isActive
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                            : 'text-slate-400 bg-slate-800 border-slate-700'
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>

                    {/* Member Info Details */}
                    <div className="space-y-2 text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate text-slate-300">{u.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{u.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{u.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                        <Clock className="w-3 h-3 text-slate-600 shrink-0" />
                        <span>Active Session: Today</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        title="Edit profile & role"
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3 text-slate-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleResetPassword(u)}
                        title="Dispatch temporary login credentials"
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
                      >
                        <Key className="w-3 h-3 text-amber-400" />
                        <span>Reset Key</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {u.id !== 'USR-001' && (
                        <>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            title={isActive ? 'Deactivate account' : 'Reactivate account'}
                            className={`p-1.5 rounded transition-colors ${
                              isActive
                                ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                                : 'text-emerald-400 hover:bg-emerald-950/40'
                            }`}
                          >
                            {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u)}
                            title="Remove team access"
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: ROLE PERMISSIONS MATRIX */}
      {activeTab === 'PERMISSIONS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm space-y-4 p-5">
          <div>
            <h3 className="text-sm font-semibold text-white">CUSAT Smart Waste Permission Matrix</h3>
            <p className="text-xs text-slate-400">
              Role-based authorization mapping across administrative, dispatch, and ground collection operations.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3 px-4">Operational Capability</th>
                  <th className="py-3 px-4 text-center text-rose-400">SUPER ADMIN</th>
                  <th className="py-3 px-4 text-center text-purple-400">ADMIN</th>
                  <th className="py-3 px-4 text-center text-blue-400">SUPERVISOR</th>
                  <th className="py-3 px-4 text-center text-emerald-400">COLLECTION STAFF</th>
                  <th className="py-3 px-4 text-center text-slate-400">VIEWER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {permissionsList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-200">{item.action}</td>
                    {(['SUPER ADMIN', 'ADMIN', 'SUPERVISOR', 'COLLECTION STAFF', 'VIEWER'] as const).map((r) => (
                      <td key={r} className="py-3 px-4 text-center">
                        {item.roles[r] ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
                            ✓
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD TEAM MEMBER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Add Team Member</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Nair"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">CUSAT Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh.ops@cusat.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserAccount['role'])}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="SUPER ADMIN">SUPER ADMIN — Full Administrative Oversight</option>
                  <option value="ADMIN">ADMIN — Campus Operations & Integrations</option>
                  <option value="SUPERVISOR">SUPERVISOR — Fleet Route & Task Dispatch</option>
                  <option value="COLLECTION STAFF">COLLECTION STAFF — Field Ground Squad</option>
                  <option value="VIEWER">VIEWER — Read-Only Environmental Audit</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98470 77007"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Department / Division</label>
                <input
                  type="text"
                  placeholder="e.g. Route 3 - Science & Research Quad Squad"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg shadow-sm"
                >
                  {isSubmitting ? 'Creating...' : 'Confirm Team Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MEMBER & ROLE */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Edit Team Member #{editingUser.id}</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">CUSAT Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Role / Authorization Level</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserAccount['role'])}
                  disabled={editingUser.id === 'USR-001'}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                >
                  <option value="SUPER ADMIN">SUPER ADMIN</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPERVISOR">SUPERVISOR</option>
                  <option value="COLLECTION STAFF">COLLECTION STAFF</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
                {editingUser.id === 'USR-001' && (
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Primary campus super administrator role cannot be altered.
                  </span>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Department</label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TEMPORARY PASSWORD CREDENTIALS GENERATED */}
      {tempPasswordResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <Key className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">Temporary Key Generated</h3>
              <p className="text-xs text-slate-400">
                Credentials dispatched to <span className="text-slate-200">{tempPasswordResult.email}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between font-mono text-xs">
              <span className="text-emerald-400 font-bold tracking-wider">{tempPasswordResult.pass}</span>
              <button
                onClick={copyTempPassword}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors"
                title="Copy to clipboard"
              >
                {copiedPass ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={() => setTempPasswordResult(null)}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
