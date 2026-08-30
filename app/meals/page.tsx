'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../utils/api';
import { 
  Plus, Edit, Trash2, Star, Clock, Flame, Utensils, RefreshCw, X, Check, Filter, History as HistoryIcon
} from 'lucide-react';
import PermissionGuard from '../components/PermissionGuard';
import ModalAlert from '../components/ModalAlert';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const FOOD_TYPES = ['Veg', 'Non Veg', 'Vegan', 'Egg', 'Other'];
const ITEM_TYPES = ['Main Course', 'Side Dishes', 'Soups', 'Starters', 'Desserts', 'Drinks', 'Others'];

export default function AdminMealsPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters (Food Type, Category, Days)
  const [selectedFoodType, setSelectedFoodType] = useState('All');
  const [selectedItemType, setSelectedItemType] = useState('All');
  const [selectedDay, setSelectedDay] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [badge, setBadge] = useState('Main');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(4.5);
  const [price, setPrice] = useState(120);
  const [prepTime, setPrepTime] = useState('25 min');
  const [calories, setCalories] = useState('280 kcal');
  const [ingredientsStr, setIngredientsStr] = useState('rice flour, potatoes, onions, coconut');
  const [foodType, setFoodType] = useState('Veg');
  const [itemType, setItemType] = useState('Main Course');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
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

  useEffect(() => {
    fetchItems();
  }, [selectedDay, selectedFoodType, selectedItemType]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      let query = `/meals?1=1`;
      if (selectedDay !== 'All') query += `&day=${selectedDay}`;
      if (selectedFoodType !== 'All') query += `&foodType=${selectedFoodType}`;
      if (selectedItemType !== 'All') query += `&itemType=${selectedItemType}`;
      const data = await apiRequest(query);
      setItems(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setBadge('Main');
    setDescription('');
    setRating(4.5);
    setPrice(120);
    setPrepTime('25 min');
    setCalories('280 kcal');
    setIngredientsStr('rice flour, potatoes, onions, coconut');
    setFoodType('Veg');
    setItemType('Main Course');
    setSelectedDays(DAYS);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingId(item.id);
    setName(item.name || '');
    setBadge(item.badge || 'Main');
    setDescription(item.description || '');
    setRating(item.rating || 4.5);
    setPrice(item.price || 0);
    setPrepTime(item.prepTime || '25 min');
    setCalories(item.calories || '280 kcal');
    setIngredientsStr(Array.isArray(item.ingredients) ? item.ingredients.join(', ') : '');
    setFoodType(item.foodType || 'Veg');
    setItemType(item.itemType || 'Main Course');
    setSelectedDays(Array.isArray(item.days) ? item.days : DAYS);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showAlert('Please enter a meal item title', 'warning');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      showAlert('Please enter a valid price (must be 0 or higher)', 'warning');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        id: editingId || undefined,
        name: name.trim(),
        badge: badge.trim(),
        description: description.trim(),
        rating: Number(rating) || 4.5,
        price: numPrice,
        prepTime: prepTime.trim() || '25 min',
        calories: calories.trim() || '280 kcal',
        ingredients: ingredientsStr.split(',').map((s) => s.trim()).filter(Boolean),
        foodType,
        itemType,
        days: selectedDays
      };

      await apiRequest('/meals', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showAlert(editingId ? 'Meal item updated successfully!' : 'New meal item added successfully!', 'success');
      setIsModalOpen(false);
      await fetchItems();
    } catch (err: any) {
      showAlert(err.message || 'Failed to save meal item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setModalAlert({
      isOpen: true,
      type: 'warning',
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this meal item?',
      isConfirm: true,
      confirmText: 'Delete Meal',
      onConfirm: async () => {
        try {
          await apiRequest(`/meals/${id}`, {
            method: 'DELETE'
          });
          showAlert('Meal item deleted successfully!', 'success');
          await fetchItems();
        } catch (err: any) {
          showAlert(err.message || 'Failed to delete meal item', 'error');
        }
      }
    });
  };

  const toggleDaySelection = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const getFoodTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'Veg':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      case 'Non Veg':
        return 'bg-rose-50 text-rose-600 border border-rose-200';
      case 'Vegan':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'Egg':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      default:
        return 'bg-zinc-100 text-zinc-600 border border-zinc-200';
    }
  };

  return (
    <PermissionGuard permission="plans">
      <main className="flex-1 overflow-y-auto p-6 md:p-10 font-sans bg-[#F9FBE7] text-[#111827]">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white border border-zinc-200/80 text-[#111827] shadow-sm">
                <Utensils className="h-6 w-6 text-[#111827]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#111827]">Menu Management</h1>
                <p className="text-xs text-zinc-500 font-semibold mt-0.5">
                  Configure daily meal items, food types, categories, prep times, and prices
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchItems}
              className="p-3 rounded-2xl bg-white border border-zinc-200/80 hover:bg-zinc-50 text-zinc-600 shadow-sm transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              onClick={() => router.push('/meals/history')}
              className="flex items-center gap-2 rounded-2xl bg-white border border-zinc-200/80 hover:bg-zinc-100 text-zinc-700 font-extrabold text-xs px-4 py-3.5 shadow-sm transition-all active:scale-[0.98]"
              title="View Audit History Log"
            >
              <HistoryIcon className="h-4 w-4 text-[#111827]" />
              <span>Activity History</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 rounded-2xl bg-[#111827] text-white hover:bg-zinc-800 font-black text-xs px-5 py-3.5 shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 text-[#BBD915]" />
              <span>Add New Meal Item</span>
            </button>
          </div>
        </div>

        {/* Filters Bar: Food Type (Image 2), Category (Image 3), & 7 Days Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Food Type Dropdown Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase">Food Type:</span>
              <select
                value={selectedFoodType}
                onChange={(e) => setSelectedFoodType(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-extrabold text-[#111827] focus:outline-none cursor-pointer"
              >
                <option value="All">All Food Types</option>
                {FOOD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Item Category Dropdown Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase">Category:</span>
              <select
                value={selectedItemType}
                onChange={(e) => setSelectedItemType(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-extrabold text-[#111827] focus:outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {ITEM_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* 7 Days Filter Dropdown (Placed right after Category) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase">Day:</span>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-extrabold text-[#111827] focus:outline-none cursor-pointer"
              >
                <option value="All">All Days</option>
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <span className="text-xs font-extrabold text-zinc-500">
            Showing <strong className="text-[#111827]">{items.length}</strong> meal item(s)
          </span>
        </div>

        {/* Table List View */}
        {loading ? (
          <div className="py-20 text-center text-zinc-400 font-bold text-sm bg-white rounded-3xl border border-zinc-200/80">
            Loading meal items table list...
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 bg-white rounded-3xl border border-zinc-200/80 text-center p-8">
            <Utensils className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-zinc-600">No meal items found matching filter criteria</p>
            <p className="text-xs text-zinc-400 mt-1">Click "Add New Meal Item" to create one.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-zinc-500 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-4 px-6 font-bold">Meal Title & Description</th>
                    <th className="py-4 px-4">Price (₹)</th>
                    <th className="py-4 px-4">Metrics</th>
                    <th className="py-4 px-4">Ingredients</th>
                    <th className="py-4 px-4">Available Days</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                      {/* Title & Description */}
                      <td className="py-4 px-6 max-w-xs">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <strong className="text-sm font-extrabold text-[#111827]">{item.name}</strong>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${getFoodTypeBadgeStyle(item.foodType)}`}>
                            {item.foodType || 'Veg'}
                          </span>
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                            {item.itemType || 'Main Course'}
                          </span>
                        </div>
                        <p className="text-zinc-500 text-xs truncate max-w-sm" title={item.description}>
                          {item.description}
                        </p>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-black text-base text-orange-600 whitespace-nowrap">
                        ₹{item.price}
                      </td>

                      {/* Metrics (Rating, Prep Time, Calories) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1 font-bold text-zinc-600">
                          <div className="flex items-center gap-1 text-amber-500 font-black">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span>{item.rating || 4.5}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-semibold">
                            <span>⏱ {item.prepTime || '25 min'}</span>
                            <span className="text-orange-600 font-bold">🔥 {item.calories || '280 kcal'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Ingredients */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {(item.ingredients || []).map((ing: string, i: number) => (
                            <span key={i} className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded text-[10px] font-bold border border-zinc-200/60">
                              {ing}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Available Days */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {(item.days || DAYS).map((d: string) => (
                            <span key={d} className="bg-zinc-100 text-zinc-700 font-extrabold px-1.5 py-0.5 rounded text-[9px] uppercase border border-zinc-200/50">
                              {d.slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 border border-zinc-200/80 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Add / Edit Meal Item */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs overflow-y-auto">
            <div className="relative bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200/80 p-6 md:p-8 text-[#111827]">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-[#F9FBE7] border border-zinc-200/80 text-[#111827]">
                  <Utensils className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black">{editingId ? 'Edit Meal Item' : 'Add New Meal Item'}</h3>
                  <p className="text-xs text-zinc-500 font-semibold">Configure dish info, food type, category, and active days.</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Meal Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Masala Dosa with Coconut Chutney"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Food Type Dropdown (Image 2) */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Food Type *</label>
                    <select
                      required
                      value={foodType}
                      onChange={(e) => setFoodType(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none bg-white cursor-pointer"
                    >
                      {FOOD_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Item Type / Category Dropdown (Image 3) */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Item Category *</label>
                    <select
                      required
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none bg-white cursor-pointer"
                    >
                      {ITEM_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="120"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Prep Time</label>
                    <input
                      type="text"
                      placeholder="25 min"
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Calories</label>
                    <input
                      type="text"
                      placeholder="280 kcal"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of dish..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Ingredients (comma separated)</label>
                  <input
                    type="text"
                    placeholder="rice flour, potatoes, onions, coconut"
                    value={ingredientsStr}
                    onChange={(e) => setIngredientsStr(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none"
                  />
                </div>

                {/* Days Assignment (7 Days) */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Available Days</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => {
                      const isChecked = selectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDaySelection(day)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isChecked
                              ? 'bg-[#111827] text-[#BBD915] border-[#111827]'
                              : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          {isChecked ? '✓ ' : '+ '}{day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200/80 font-bold text-xs px-5 py-3 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-2xl bg-[#111827] text-white hover:bg-zinc-800 font-black text-xs px-6 py-3 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}
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
