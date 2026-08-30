'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../utils/api';
import { RefreshCw, Save, User, Mail, MapPin, Phone, Lock, KeyRound, CheckCircle2 } from 'lucide-react';
import ModalAlert from '../components/ModalAlert';

export default function AdminProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Profile Form Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Password Form Inputs
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Modal Alert State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    message: '',
  });

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string) => {
    setAlertConfig({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const prof = await apiRequest('/auth/profile');
      setProfile(prof);
      setName(prof.name || '');
      setEmail(prof.email || '');
      setAddress(prof.address || '');
      setPhone(prof.phone || '');
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showAlert('Please enter your Full Name', 'warning');
      return;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length !== 10) {
      showAlert('Please enter a valid 10-digit Phone Number', 'warning');
      return;
    }

    if (!address.trim()) {
      showAlert('Please enter your Office Address / Coordinates', 'warning');
      return;
    }

    setSaving(true);
    setSuccess(false);

    try {
      const updated = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          phone: phoneDigits,
          dietaryPreferences: profile?.dietaryPreferences || [],
          deliveryTimeSlot: profile?.deliveryTimeSlot || '07:00 AM - 09:00 AM',
        }),
      });

      // Synchronize changes to localstorage for header display
      localStorage.setItem('admin_profile', JSON.stringify({
        ...profile,
        name: name.trim(),
        address: address.trim(),
        phone: phoneDigits,
      }));

      setProfile(updated);
      setSuccess(true);
      showAlert('Profile details updated successfully!', 'success');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      showAlert(err.message || 'Failed to save profile changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword.trim()) {
      showAlert('Please enter your current password', 'warning');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showAlert('New password must be at least 6 characters long', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('New password and confirm password do not match', 'warning');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          oldPassword: oldPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      showAlert(res.message || 'Password updated successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showAlert(err.message || 'Failed to update password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F9FBE7] text-[#111827] font-sans items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-10 w-10 animate-spin text-[#BBD915]" />
          <p className="text-zinc-600 font-semibold">Loading Account Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto bg-[#F9FBE7] min-h-screen text-[#111827] font-sans">
      
      {/* Sleek Popup Modal Alert */}
      <ModalAlert
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
      />

      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div>
          <span className="text-xs text-zinc-500 font-extrabold uppercase tracking-wider block">Account & Security</span>
          <h1 className="text-2xl font-black text-[#111827] mt-0.5 flex items-center gap-2">
            <User className="h-6 w-6 text-[#BBD915]" />
            Account Settings
          </h1>
          <p className="text-xs text-zinc-500 font-semibold mt-1">
            Manage your personal administrative profile details and login security credentials.
          </p>
        </div>

        {/* Card 1: Personal Profile Settings */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
            <div>
              <h3 className="text-lg font-black text-[#111827]">Personal Profile Information</h3>
              <p className="text-xs text-zinc-500 font-semibold mt-0.5">Update contact numbers and office coordinates.</p>
            </div>
            {success && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="h-3.5 w-3.5" /> Profile updated!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4.5 w-4.5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-11 pr-4 py-2.5 text-xs font-bold text-[#111827] focus:border-zinc-400 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Email (Readonly) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase">Email Address (Locked)</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-zinc-300" />
                  <input
                    type="email"
                    readOnly
                    disabled
                    value={email}
                    className="w-full rounded-xl border border-zinc-150 bg-zinc-100/50 pl-11 pr-4 py-2.5 text-xs font-bold text-zinc-400 cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">Phone Number (10 Digits)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4.5 w-4.5 text-zinc-400" />
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-11 pr-4 py-2.5 text-xs font-bold text-[#111827] focus:border-zinc-400 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase">HQ Coordinates / Office Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-400" />
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-11 pr-4 py-2.5 text-xs font-bold text-[#111827] focus:border-zinc-400 focus:outline-none focus:bg-white"
                  rows={2}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-2xl bg-[#BBD915] text-[#111827] hover:bg-[#a8c413] px-6 py-2.5 text-xs font-black shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving Profile...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Security & Password Change */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-sm space-y-6">
          <div className="pb-4 border-b border-zinc-100">
            <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-600" />
              Change Account Password
            </h3>
            <p className="text-xs text-zinc-500 font-semibold mt-0.5">
              Update your account password to ensure your admin session security.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase">Current Password *</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-4.5 w-4.5 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-11 pr-4 py-2.5 text-xs font-bold text-[#111827] focus:border-zinc-400 focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">New Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-11 pr-4 py-2.5 text-xs font-bold text-[#111827] focus:border-zinc-400 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">Confirm New Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-11 pr-4 py-2.5 text-xs font-bold text-[#111827] focus:border-zinc-400 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex justify-end">
              <button
                type="submit"
                disabled={changingPassword}
                className="flex items-center gap-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 text-xs font-black shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Lock className="h-4 w-4 text-[#BBD915]" />
                {changingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </main>
  );
}
