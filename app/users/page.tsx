'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { ShieldCheck, Plus, User, Mail, ShieldAlert, Key, Edit, Trash2, X, Check } from 'lucide-react';
import PermissionGuard from '../components/PermissionGuard';
import ModalAlert from '../components/ModalAlert';

const PERMISSIONS_LIST = [
  { key: 'dashboard', name: 'Dashboard Analytics' },
  { key: 'plans', name: 'Subscription Plans Management' },
  { key: 'customPlan', name: 'Custom Plan Pricing Override' },
  { key: 'subscriptions', name: 'Customer Subscriptions' },
  { key: 'deliveries', name: 'Daily Dispatch Logs' }
];

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Modal Alert State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    isConfirm?: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    message: '',
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/auth/staff');
      setStaff(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load staff accounts');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('staff');
    setSelectedPermissions([]);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (member: any) => {
    setEditingId(member.id);
    setName(member.name || '');
    setEmail(member.email || '');
    setPassword('');
    setRole(member.role || 'staff');
    setSelectedPermissions(member.permissions || []);
    setError('');
    setShowModal(true);
  };

  const handleTogglePermission = (permKey: string) => {
    if (selectedPermissions.includes(permKey)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permKey));
    } else {
      setSelectedPermissions([...selectedPermissions, permKey]);
    }
  };

  const handleDelete = async (id: string) => {
    setAlertConfig({
      isOpen: true,
      type: 'warning',
      title: 'Remove Staff User',
      message: 'Are you sure you want to remove this staff user?',
      isConfirm: true,
      onConfirm: async () => {
        try {
          await apiRequest(`/auth/staff/${id}`, { method: 'DELETE' });
          setStaff(staff.filter(s => s.id !== id));
          setAlertConfig({
            isOpen: true,
            type: 'success',
            title: 'User Removed',
            message: 'Staff user removed successfully.',
            isConfirm: false,
          });
        } catch (err: any) {
          setAlertConfig({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: err.message || 'Failed to delete user.',
            isConfirm: false,
          });
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter the staff member Full Name');
      return;
    }

    const emailTrimmed = email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailTrimmed) {
      setError('Please enter an email address');
      return;
    }
    if (!emailRegex.test(emailTrimmed)) {
      setError('Please enter a valid email address (e.g. staff@company.com)');
      return;
    }

    if (!editingId && (!password || password.length < 6)) {
      setError('Initial password must be at least 6 characters long');
      return;
    }

    if (editingId && password && password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setSaving(true);

    const payload: any = {
      name: name.trim(),
      email: emailTrimmed.toLowerCase(),
      role,
      permissions: selectedPermissions
    };
    if (password) {
      payload.password = password;
    }

    try {
      if (editingId) {
        // Update staff member
        const updated = await apiRequest(`/auth/staff/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setStaff(staff.map(s => s.id === editingId ? updated : s));
      } else {
        // Create new staff member
        const created = await apiRequest('/auth/staff', {
          method: 'POST',
          body: JSON.stringify({ ...payload, password: password || 'staff123' })
        });
        setStaff([...staff, created]);
      }
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save staff credentials.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PermissionGuard permission="users">
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto overflow-y-auto">
        <ModalAlert
          isOpen={alertConfig.isOpen}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          isConfirm={alertConfig.isConfirm}
          onConfirm={alertConfig.onConfirm}
          onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        />

        {/* Top Actions */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-[#111827]">Company Administrators & Staff</h2>
            <p className="text-sm text-zinc-500 font-bold">Assign granular module permissions to your team members.</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#BBD915] hover:bg-[#a6c212] px-5 py-3 text-sm font-black text-[#111827] shadow-lg shadow-[#BBD915]/10 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4.5 w-4.5 stroke-[3px]" />
            <span>Add Staff Member</span>
          </button>
        </div>

        {/* Staff Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="animate-spin h-8 w-8 border-4 border-[#BBD915] border-t-transparent rounded-full"></span>
          </div>
        ) : staff.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center shadow-sm">
            <ShieldAlert className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-[#111827]">No Staff Members Found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto font-semibold">
              Create sub-accounts for your team members and assign specific admin module access.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map((member) => (
              <div 
                key={member.id}
                className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-[#BBD915]/20 flex items-center justify-center text-[#111827] font-black text-lg">
                        {member.name ? member.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-[#111827]">{member.name}</h4>
                        <span className="inline-block mt-0.5 text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md border border-zinc-200">
                          {member.role || 'staff'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
                      <Mail className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{member.email}</span>
                    </div>
                  </div>

                  {/* Module Permissions Badges */}
                  <div className="pt-4 border-t border-zinc-100">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-2">
                      Assigned Permissions ({member.permissions?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {member.permissions && member.permissions.length > 0 ? (
                        member.permissions.map((permKey: string) => {
                          const pObj = PERMISSIONS_LIST.find(p => p.key === permKey);
                          return (
                            <span 
                              key={permKey}
                              className="text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-lg"
                            >
                              {pObj ? pObj.name : permKey}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-[11px] font-medium text-zinc-400 italic">No specific permissions assigned</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-6 mt-6 border-t border-zinc-100">
                  <button
                    onClick={() => openEditModal(member)}
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-all"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add / Edit Staff Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/30 backdrop-blur-sm overflow-y-auto">
            <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-zinc-200/80 p-6 md:p-8 animate-in fade-in-50 duration-200 text-[#111827]">
              
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-xl font-black mb-6 border-b border-zinc-100 pb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#BBD915]" />
                <span>{editingId ? 'Edit Staff Credentials' : 'Add New Staff Member'}</span>
              </h3>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-zinc-500 tracking-wider mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold focus:border-[#BBD915] focus:outline-none bg-zinc-50/50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-zinc-500 tracking-wider mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold focus:border-[#BBD915] focus:outline-none bg-zinc-50/50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-zinc-500 tracking-wider mb-1">
                    {editingId ? 'Password (Leave blank to keep unchanged)' : 'Initial Password *'}
                  </label>
                  <input
                    type="password"
                    required={!editingId}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold focus:border-[#BBD915] focus:outline-none bg-zinc-50/50 focus:bg-white"
                  />
                </div>

                {/* Module Permissions Checkboxes */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-zinc-500 tracking-wider mb-2">Module Access Permissions</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                    {PERMISSIONS_LIST.map((perm) => {
                      const isChecked = selectedPermissions.includes(perm.key);
                      return (
                        <label 
                          key={perm.key}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm.key)}
                            className="h-4 w-4 rounded text-[#BBD915] focus:ring-[#BBD915]"
                          />
                          <span className="text-xs font-extrabold text-[#111827]">{perm.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-6 py-2.5 text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-[#BBD915] text-[#111827] hover:bg-[#a6c212] px-8 py-2.5 text-xs font-black shadow-md transition-all active:scale-[0.98]"
                  >
                    {saving ? 'Saving...' : editingId ? 'Update Credentials' : 'Create Staff Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </PermissionGuard>
  );
}
