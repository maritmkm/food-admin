'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../utils/api';
import { Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import PermissionGuard from '../components/PermissionGuard';
import ModalAlert from '../components/ModalAlert';

export default function AdminPlans() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  
  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [meals, setMeals] = useState('');
  const [razorpayPlanId, setRazorpayPlanId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/plans');
      setPlans(data);
    } catch (err: any) {
      console.error(err);
      showAlert(err.message || 'Failed to fetch plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan?: any) => {
    if (plan) {
      setEditingId(plan.id);
      setName(plan.name);
      setPrice(plan.price.toString());
      setDescription(plan.description || '');
      setMeals(Array.isArray(plan.meals) ? plan.meals.join(', ') : plan.meals || '');
      setRazorpayPlanId(plan.razorpayPlanId || '');
      setImageUrl(plan.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600');
      setTagsInput(Array.isArray(plan.tags) ? plan.tags.join(', ') : plan.tags || '');
    } else {
      setEditingId(null);
      setName('');
      setPrice('');
      setDescription('');
      setMeals('');
      setRazorpayPlanId('');
      setImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600');
      setTagsInput('Organic, Fresh, Chef-Crafted');
    }
    setIsOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showAlert('Please enter a Subscription Plan Name', 'warning');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      showAlert('Please enter a valid plan price greater than 0', 'warning');
      return;
    }

    const planData = {
      name: name.trim(),
      price: numPrice,
      description: description.trim(),
      meals: meals.split(',').map((m) => m.trim()).filter(Boolean),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      imageUrl: imageUrl.trim() || undefined,
      razorpayPlanId: razorpayPlanId.trim() || undefined
    };

    try {
      if (!editingId) {
        await apiRequest('/plans', {
          method: 'POST',
          body: JSON.stringify(planData),
        });
      } else {
        await apiRequest(`/plans/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(planData),
        });
      }
      setIsOpen(false);
      showAlert(editingId ? 'Plan updated successfully!' : 'New plan created successfully!', 'success');
      fetchPlans();
    } catch (err: any) {
      showAlert(err.message || 'Failed to save plan', 'error');
    }
  };

  const handleDeletePlan = async (id: string) => {
    setModalAlert({
      isOpen: true,
      type: 'warning',
      title: 'Deactivate Plan',
      message: 'Are you sure you want to deactivate this subscription plan? Users will no longer be able to subscribe to it.',
      isConfirm: true,
      confirmText: 'Deactivate',
      onConfirm: async () => {
        try {
          await apiRequest(`/plans/${id}`, { method: 'DELETE' });
          showAlert('Subscription plan deactivated successfully!', 'success');
          fetchPlans();
        } catch (err: any) {
          showAlert(err.message || 'Failed to delete plan', 'error');
        }
      }
    });
  };

  if (loading && plans.length === 0) {
    return (
      <div className="flex min-h-screen bg-[#F9FBE7] text-[#111827] font-sans items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-10 w-10 animate-spin text-[#BBD915]" />
          <p className="text-zinc-600 font-semibold">Loading Meal Plans...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="plans">
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <div className="flex justify-between items-center gap-4 mb-10 pb-6 border-b border-zinc-200/80">
            <div>
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">Plan Directory</span>
              <span className="text-[10px] text-zinc-400 font-semibold block">Configure and manage active dining tiers.</span>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 rounded-xl bg-[#BBD915] hover:bg-[#a6c212] text-[#111827] font-bold text-xs px-4 py-2.5 shadow-md shadow-[#BBD915]/10 transition-all active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Create Plan
            </button>
          </div>

        {/* Plans Table */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">Plan Name</th>
                <th className="p-4">Price</th>
                <th className="p-4">Meals Catalog</th>
                <th className="p-4">Tags</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-semibold text-[#111827]">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-[#111827]">{plan.name}</td>
                  <td className="p-4 font-black">₹{plan.price}</td>
                  <td className="p-4 font-normal text-zinc-600">
                    <div className="max-w-[250px] truncate" title={Array.isArray(plan.meals) ? plan.meals.join(', ') : plan.meals}>
                      {Array.isArray(plan.meals) ? plan.meals.join(', ') : plan.meals || '—'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(plan.tags) && plan.tags.map((tag: string) => (
                        <span key={tag} className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded text-[10px] font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(plan)}
                        className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[#111827] transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-2 rounded-lg bg-zinc-100 hover:bg-red-50 hover:text-red-600 text-zinc-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500 font-semibold">
                    No active meal plans found. Click "Create Plan" to make one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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

      {/* Editor Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-zinc-200 shadow-2xl overflow-hidden relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <form onSubmit={handleSavePlan} className="p-6 md:p-8 space-y-4 text-[#111827]">
              <h2 className="text-xl font-bold text-[#111827] mb-6">
                {!editingId ? 'Create Subscription Plan' : 'Edit Subscription Plan'}
              </h2>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Plan Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Keto Cleanse"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-[#111827] focus:border-[#BBD915] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-orange-600 uppercase">Razorpay Plan ID</label>
                <input
                  type="text"
                  value={razorpayPlanId}
                  onChange={(e) => setRazorpayPlanId(e.target.value)}
                  placeholder="e.g. plan_N1a2B3c4D5e6F7"
                  className="w-full rounded-xl border border-orange-200 bg-orange-50/40 px-4 py-2.5 text-sm font-mono text-[#111827] focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what meals are tailored for this tier..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-[#111827] focus:border-[#BBD915] focus:outline-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Price per Week (₹)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="99"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-[#111827] focus:border-[#BBD915] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Cover Image URL</label>
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-[#111827] focus:border-[#BBD915] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Plan Tags (comma-separated)</label>
                <input
                  type="text"
                  required
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Keto, Low-Carb, Weight-Loss"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-[#111827] focus:border-[#BBD915] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Meals Catalog (comma-separated)</label>
                <textarea
                  required
                  value={meals}
                  onChange={(e) => setMeals(e.target.value)}
                  placeholder="Grilled Salmon, Bacon Egg Muffins, Ribeye Steak"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-[#111827] focus:border-[#BBD915] focus:outline-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-bold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#BBD915] hover:bg-[#a6c212] px-6 py-2.5 text-sm font-bold text-[#111827] transition-all shadow-md shadow-[#BBD915]/10"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PermissionGuard>
  );
}
