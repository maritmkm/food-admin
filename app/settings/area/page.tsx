'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../utils/api';
import { 
  Plus, Edit, Trash2, ArrowLeft, RefreshCw, MapPin, AlertCircle, CheckCircle2 
} from 'lucide-react';
import PermissionGuard from '../../components/PermissionGuard';
import ModalAlert from '../../components/ModalAlert';

export default function AreaSettingsPage() {
  const router = useRouter();
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalAlert, setModalAlert] = useState<{
    isOpen: boolean;
    type?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    isConfirm?: boolean;
    confirmText?: string;
    onConfirm?: () => void;
  }>({ isOpen: false, message: '' });

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string) => {
    setModalAlert({ isOpen: true, message, type, title, isConfirm: false });
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [areaName, setAreaName] = useState('');
  const [duplicateError, setDuplicateError] = useState('');

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/payments/areas');
      setAreas(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setAreaName('');
    setDuplicateError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (area: any) => {
    setEditingId(area.id);
    setAreaName(area.name || '');
    setDuplicateError('');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setAreaName(val);
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) {
      setDuplicateError('');
      return;
    }
    // Case-insensitive duplicate validation check
    const isDuplicate = areas.some(
      (a) => a.id !== editingId && (a.name || '').trim().toLowerCase() === trimmed
    );
    if (isDuplicate) {
      setDuplicateError(`Area name "${val.trim()}" already exists. Duplicate area names are not allowed.`);
    } else {
      setDuplicateError('');
    }
  };

  const handleSaveArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaName.trim()) {
      showAlert('Please enter a valid area name.', 'warning');
      return;
    }
    if (duplicateError) {
      return;
    }

    setSaving(true);
    try {
      await apiRequest('/payments/areas', {
        method: 'POST',
        body: JSON.stringify({
          id: editingId || undefined,
          name: areaName.trim(),
          isEnabled: true,
        }),
      });

      showAlert('Delivery Area saved successfully!', 'success');
      setIsModalOpen(false);
      await fetchAreas();
    } catch (err: any) {
      showAlert(err.message || 'Failed to save delivery area', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (area: any) => {
    try {
      await apiRequest(`/payments/areas/${area.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ isEnabled: !area.isEnabled }),
      });
      await fetchAreas();
    } catch (err: any) {
      showAlert(err.message || 'Failed to update area status', 'error');
    }
  };

  const handleDeleteArea = async (id: string) => {
    setModalAlert({
      isOpen: true,
      type: 'warning',
      title: 'Delete Delivery Area',
      message: 'Are you sure you want to delete this delivery area?',
      isConfirm: true,
      confirmText: 'Delete Area',
      onConfirm: async () => {
        try {
          await apiRequest(`/payments/areas/${id}`, {
            method: 'DELETE',
          });
          showAlert('Delivery Area deleted successfully!', 'success');
          await fetchAreas();
        } catch (err: any) {
          showAlert(err.message || 'Failed to delete area', 'error');
        }
      }
    });
  };

  return (
    <PermissionGuard permission="settings">
      <main className="flex-1 p-6 md:p-10 font-sans bg-[#F9FBE7] min-h-screen text-[#111827]">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/settings')}
                className="p-2 rounded-2xl bg-white border border-zinc-200/80 hover:bg-zinc-100 text-zinc-700 shadow-sm transition-colors"
                title="Back to Settings"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-black text-[#111827]">Delivery Area Settings</h1>
            </div>
            <p className="text-xs text-zinc-500 font-semibold mt-1">
              Manage active deliverable locations and service coverage zones for your store
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAreas}
              className="p-3 rounded-2xl bg-white border border-zinc-200/80 hover:bg-zinc-50 text-zinc-600 shadow-sm transition-colors"
              title="Refresh Areas"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 rounded-2xl bg-[#111827] text-white hover:bg-zinc-800 font-black text-xs px-5 py-3.5 shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 text-[#BBD915]" />
              Add Area
            </button>
          </div>
        </div>

        {/* Delivery Areas Table List */}
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <RefreshCw className="h-8 w-8 animate-spin text-[#BBD915]" />
          </div>
        ) : (
          <div className="rounded-3xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 bg-white text-zinc-500 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6 pl-6 font-bold">Area Name</th>
                    <th className="py-4 px-4 font-bold">Status</th>
                    <th className="py-4 px-4 font-bold">Date Added</th>
                    <th className="py-4 px-6 pr-6 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs text-[#111827]">
                  {areas.map((area) => (
                    <tr key={area.id} className="hover:bg-zinc-50/50 transition-colors">
                      {/* Area Name */}
                      <td className="py-4 px-6 pl-6 font-extrabold text-[#111827] text-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-zinc-100 text-[#111827]">
                            <MapPin className="h-4 w-4 text-[#111827]" />
                          </div>
                          <span>{area.name}</span>
                        </div>
                      </td>

                      {/* Status Toggle & Badge */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={area.isEnabled !== false} 
                              onChange={() => handleToggleStatus(area)} 
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BBD915]"></div>
                          </label>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            area.isEnabled !== false
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                          }`}>
                            {area.isEnabled !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      {/* Date Added */}
                      <td className="py-4 px-4 text-xs font-semibold text-zinc-500">
                        {area.createdAt ? new Date(area.createdAt).toLocaleDateString() : 'Active Zone'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(area)}
                            title="Edit Area"
                            className="p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-zinc-700 font-bold text-xs transition-colors"
                          >
                            <Edit className="h-4 w-4 text-zinc-600" />
                          </button>

                          <button
                            onClick={() => handleDeleteArea(area.id)}
                            title="Delete Area"
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-600 font-bold text-xs transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {areas.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-zinc-400 font-semibold">
                        No delivery areas added yet. Click "+ Add Area" to configure service zones.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Add / Edit Delivery Area (Theme Styled with Duplicate Check) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/30 backdrop-blur-sm overflow-y-auto">
            <div className="relative bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200/80 p-6 md:p-8 animate-in fade-in-50 duration-200 text-[#111827]">
              
              {/* Header with Back Arrow */}
              <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-600"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold text-[#111827]">
                  {editingId ? 'Edit Delivery Area' : 'Add Delivery Area'}
                </h2>
              </div>

              <form onSubmit={handleSaveArea} className="space-y-5 font-sans">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                    Area Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Downtown District, North Zone, West End"
                    value={areaName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={`w-full rounded-full border px-4 py-3 text-xs font-semibold focus:outline-none shadow-sm transition-colors ${
                      duplicateError 
                        ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-500' 
                        : 'border-zinc-200 focus:border-zinc-400 text-[#111827]'
                    }`}
                  />
                  {duplicateError && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200/80 p-2.5 rounded-2xl">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                      <span>{duplicateError}</span>
                    </div>
                  )}
                </div>

                {/* Modal Action Buttons matching theme colors */}
                <div className="flex items-center justify-center gap-4 pt-6 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-8 py-3 text-xs font-bold border border-zinc-200/80 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !!duplicateError || !areaName.trim()}
                    className="rounded-full bg-[#111827] hover:bg-zinc-800 disabled:opacity-50 text-white px-10 py-3 text-xs font-extrabold shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
                  >
                    <span className="text-[#BBD915] font-black">+</span>
                    {saving ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Area')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ModalAlert
          isOpen={modalAlert.isOpen}
          type={modalAlert.type}
          title={modalAlert.title}
          message={modalAlert.message}
          isConfirm={modalAlert.isConfirm}
          confirmText={modalAlert.confirmText}
          onConfirm={modalAlert.onConfirm}
          onClose={() => setModalAlert({ ...modalAlert, isOpen: false })}
        />
      </main>
    </PermissionGuard>
  );
}
