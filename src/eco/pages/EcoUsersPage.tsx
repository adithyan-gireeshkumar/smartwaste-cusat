import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  Building,
  Sparkles,
  Search,
  Filter,
  X
} from 'lucide-react';
import { useEco } from '../state/EcoContext';
import { EcoUser, UserRole } from '../types';

export const EcoUsersPage: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, toggleUserStatus } = useEco();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EcoUser | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('STAFF');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchDept = u.department.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchDept) return false;
    }
    return true;
  });

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('STAFF');
    setPhone('');
    setDepartment('Campus Maintenance & Engineering');
    setStatus('ACTIVE');
    setModalOpen(true);
  };

  const openEditModal = (u: EcoUser) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setPhone(u.phone);
    setDepartment(u.department);
    setStatus(u.status);
    setModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, {
        name,
        email,
        role,
        phone,
        department,
        status,
      });
    } else {
      addUser({
        name,
        email,
        role,
        phone,
        department,
        status,
        avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + users.length * 100}?auto=format&fit=crop&w=250&q=80`,
      });
    }
    setModalOpen(false);
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'ADMIN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1b4332] text-white">
            ADMIN · Full Access
          </span>
        );
      case 'STAFF':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
            STAFF · Operations
          </span>
        );
      case 'COLLECTOR':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
            COLLECTOR · Squad
          </span>
        );
      case 'VIEWER':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
            VIEWER · Read Only
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbfdfa] border border-[#dbe6dc] p-5 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">👥</span>
            <h1 className="text-base font-serif font-bold text-[#143826]">
              User Management & Access Roles ({users.length} Users)
            </h1>
          </div>
          <p className="text-xs text-[#52796f] mt-0.5">
            Configure accounts, operational roles, contact info, and activation states for CUSAT campus personnel.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-center shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 bg-[#fbfdfa] border border-[#dbe6dc] rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#143826]">
            <ShieldCheck className="w-4 h-4 text-[#1b4332]" />
            <span>Admin</span>
          </div>
          <p className="text-[11px] text-[#52796f]">
            Full system control, profile customization, user management, and global config.
          </p>
        </div>

        <div className="p-3 bg-[#fbfdfa] border border-[#dbe6dc] rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Staff</span>
          </div>
          <p className="text-[11px] text-[#52796f]">
            Can monitor bins, view live campus maps, and inspect station alerts.
          </p>
        </div>

        <div className="p-3 bg-[#fbfdfa] border border-[#dbe6dc] rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Users className="w-4 h-4 text-amber-600" />
            <span>Collector</span>
          </div>
          <p className="text-[11px] text-[#52796f]">
            Assigned to field collection tasks, updates bin pickup, resets fill level.
          </p>
        </div>

        <div className="p-3 bg-[#fbfdfa] border border-[#dbe6dc] rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Shield className="w-4 h-4 text-slate-600" />
            <span>Viewer</span>
          </div>
          <p className="text-[11px] text-[#52796f]">
            Read-only access to analytics dashboards, reports, and public station status.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#fbfdfa] border border-[#dbe6dc] p-4 rounded-3xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#52796f] text-xs font-medium mr-1">Role:</span>
          {['ALL', 'ADMIN', 'STAFF', 'COLLECTOR', 'VIEWER'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl transition-colors font-medium ${
                roleFilter === r
                  ? 'bg-[#1b4332] text-white shadow-2xs font-semibold'
                  : 'bg-[#f0f6ef] text-[#2d3732] hover:bg-[#e4efe3]'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 bg-[#f0f6ef] border border-[#d3e2d5] rounded-xl text-xs w-48 focus:outline-none focus:border-[#2d6a4f]"
          />
        </div>
      </div>

      {/* Users Table / Cards */}
      <div className="bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f2f7f1] border-b border-[#dbe6dc] text-[#52796f] font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role & Access</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf3ec]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#f6f9f5] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
                        {user.name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-[#143826] block">{user.name}</span>
                        <span className="text-[11px] text-[#52796f] font-mono">{user.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">{getRoleBadge(user.role)}</td>

                  <td className="py-3 px-4 text-[#52796f]">
                    <span className="text-[#143826] font-medium">{user.department}</span>
                  </td>

                  <td className="py-3 px-4 text-[#52796f] font-mono text-[11px]">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#84a98c]" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-[#84a98c]" />
                      <span>{user.phone}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold transition-colors ${
                        user.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                      title="Click to toggle Active / Inactive state"
                    >
                      {user.status === 'ACTIVE' ? '● ACTIVE' : '○ INACTIVE'}
                    </button>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-[#6d9178]">
                    {new Date(user.lastActive).toLocaleDateString()}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1.5 bg-[#f0f6ef] hover:bg-[#e2ece3] rounded-lg text-[#143826] border border-[#d3e2d5]"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Remove ${user.name} from CUSAT SmartWaste system?`)) {
                            deleteUser(user.id);
                          }
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-700 border border-rose-200"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#143826]/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#fcfdfb] border border-[#cce0ce] rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2ece3] pb-3">
              <h3 className="text-sm font-serif font-bold text-[#143826]">
                {editingUser ? 'Edit User Profile' : 'Add New Campus User'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#52796f] hover:text-[#143826]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#143826] font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826] focus:outline-none focus:border-[#2d6a4f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#143826] font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@cusat.ac.in"
                    className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826] focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>

                <div>
                  <label className="block text-[#143826] font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98470 12345"
                    className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826] focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#143826] font-medium mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826]"
                  >
                    <option value="ADMIN">Admin (Full Access)</option>
                    <option value="STAFF">Staff (Monitoring)</option>
                    <option value="COLLECTOR">Collector (Squad)</option>
                    <option value="VIEWER">Viewer (Read Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#143826] font-medium mb-1">Account State</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                    className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826]"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive / Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#143826] font-medium mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. School of Engineering / Estate Office"
                  className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826] focus:outline-none focus:border-[#2d6a4f]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e2ece3]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-[#52796f] hover:text-[#143826]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1b4332] text-white rounded-xl font-semibold"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
