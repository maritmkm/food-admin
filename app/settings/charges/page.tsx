'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Receipt, Package, Truck, Percent, AlertCircle, CheckCircle2 } from 'lucide-react';
import PermissionGuard from '../../components/PermissionGuard';
import { apiRequest } from '../../utils/api';

export default function ChargesSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Charges State
  const [packingChargeType, setPackingChargeType] = useState<'percentage' | 'amount'>('amount');
  const [packingChargeValue, setPackingChargeValue] = useState<string>('20');

  const [deliveryChargeType, setDeliveryChargeType] = useState<'percentage' | 'amount'>('amount');
  const [deliveryChargeValue, setDeliveryChargeValue] = useState<string>('40');

  const [taxType, setTaxType] = useState<'percentage' | 'amount'>('percentage');
  const [taxValue, setTaxValue] = useState<string>('5');

  // Input Validation Errors
  const [packingError, setPackingError] = useState('');
  const [deliveryError, setDeliveryError] = useState('');
  const [taxError, setTaxError] = useState('');

  useEffect(() => {
    fetchCharges();
  }, []);

  const fetchCharges = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest('/payments/charges');
      if (data) {
        setPackingChargeType(data.packingChargeType || 'amount');
        setPackingChargeValue(String(data.packingChargeValue ?? 20));

        setDeliveryChargeType(data.deliveryChargeType || 'amount');
        setDeliveryChargeValue(String(data.deliveryChargeValue ?? 40));

        setTaxType(data.taxType || 'percentage');
        setTaxValue(String(data.taxValue ?? 5));
      }
    } catch (err: any) {
      console.error('Fetch charges error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Validation Handler
  const validateInputs = () => {
    let isValid = true;
    setPackingError('');
    setDeliveryError('');
    setTaxError('');

    // Packing Charge Validation
    const pVal = Number(packingChargeValue);
    if (isNaN(pVal) || packingChargeValue.trim() === '') {
      setPackingError('Please enter a valid number');
      isValid = false;
    } else if (pVal < 0) {
      setPackingError('Packing charge cannot be negative');
      isValid = false;
    } else if (packingChargeType === 'percentage' && pVal > 100) {
      setPackingError('Percentage cannot exceed 100%');
      isValid = false;
    }

    // Delivery Charge Validation
    const dVal = Number(deliveryChargeValue);
    if (isNaN(dVal) || deliveryChargeValue.trim() === '') {
      setDeliveryError('Please enter a valid number');
      isValid = false;
    } else if (dVal < 0) {
      setDeliveryError('Delivery charge cannot be negative');
      isValid = false;
    } else if (deliveryChargeType === 'percentage' && dVal > 100) {
      setDeliveryError('Percentage cannot exceed 100%');
      isValid = false;
    }

    // Tax Validation
    const tVal = Number(taxValue);
    if (isNaN(tVal) || taxValue.trim() === '') {
      setTaxError('Please enter a valid number');
      isValid = false;
    } else if (tVal < 0) {
      setTaxError('Tax value cannot be negative');
      isValid = false;
    } else if (taxType === 'percentage' && tVal > 100) {
      setTaxError('Tax percentage cannot exceed 100%');
      isValid = false;
    }

    return isValid;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateInputs()) {
      setError('Please fix the validation errors before saving.');
      return;
    }

    try {
      setSaving(true);
      await apiRequest('/payments/charges', {
        method: 'POST',
        body: JSON.stringify({
          packingChargeType,
          packingChargeValue: Number(packingChargeValue),
          deliveryChargeType,
          deliveryChargeValue: Number(deliveryChargeValue),
          taxType,
          taxValue: Number(taxValue)
        })
      });

      setSuccess('Order charges and tax configuration saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save charges configuration.');
    } finally {
      setSaving(false);
    }
  };

  // Sample Order Preview Calculation (Subtotal = ₹500)
  const sampleSubtotal = 500;
  const pVal = Math.max(0, Number(packingChargeValue) || 0);
  const calcPacking = packingChargeType === 'percentage' ? (sampleSubtotal * pVal) / 100 : pVal;

  const dVal = Math.max(0, Number(deliveryChargeValue) || 0);
  const calcDelivery = deliveryChargeType === 'percentage' ? (sampleSubtotal * dVal) / 100 : dVal;

  const tVal = Math.max(0, Number(taxValue) || 0);
  const subtotalWithCharges = sampleSubtotal + calcPacking + calcDelivery;
  const calcTax = taxType === 'percentage' ? (subtotalWithCharges * tVal) / 100 : tVal;
  const grandTotal = subtotalWithCharges + calcTax;

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
              <h1 className="text-2xl font-black text-[#111827]">Order Charges & Taxes</h1>
            </div>
            <p className="text-xs text-zinc-500 font-semibold mt-1">
              Configure packing charges, delivery fees, and tax percentage calculations.
            </p>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold shadow-xs">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-zinc-200 shadow-sm text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#111827] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-xs font-bold text-zinc-500">Loading charges configuration...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8 max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 1. Packing Charge Card */}
              <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-sm flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#111827]">Packing Charge</h3>
                      <p className="text-[11px] text-zinc-500 font-semibold">Packaging & container fee</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">Charge Type</label>
                      <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setPackingChargeType('percentage')}
                          className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
                            packingChargeType === 'percentage'
                              ? 'bg-[#111827] text-white shadow-xs'
                              : 'text-zinc-600 hover:text-black'
                          }`}
                        >
                          Percentage (%)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPackingChargeType('amount')}
                          className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
                            packingChargeType === 'amount'
                              ? 'bg-[#111827] text-white shadow-xs'
                              : 'text-zinc-600 hover:text-black'
                          }`}
                        >
                          Fixed Rate (₹)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
                        {packingChargeType === 'percentage' ? 'Packing Charge (%)' : 'Packing Charge Amount (₹)'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={packingChargeValue}
                          onChange={(e) => {
                            setPackingChargeValue(e.target.value);
                            setPackingError('');
                          }}
                          placeholder="e.g. 20"
                          className={`w-full rounded-2xl border bg-zinc-50 px-4 py-3 text-sm font-extrabold text-[#111827] focus:bg-white focus:outline-none transition-all ${
                            packingError ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 focus:border-[#BBD915]'
                          }`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">
                          {packingChargeType === 'percentage' ? '%' : '₹'}
                        </span>
                      </div>
                      {packingError && (
                        <p className="mt-1.5 text-[11px] font-bold text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" /> {packingError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 text-[11px] font-bold text-zinc-500">
                  Applied to each placed order.
                </div>
              </div>

              {/* 2. Delivery Charge Card */}
              <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-sm flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#111827]">Delivery Charges</h3>
                      <p className="text-[11px] text-zinc-500 font-semibold">Logistics & transport fee</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">Charge Type</label>
                      <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setDeliveryChargeType('percentage')}
                          className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
                            deliveryChargeType === 'percentage'
                              ? 'bg-[#111827] text-white shadow-xs'
                              : 'text-zinc-600 hover:text-black'
                          }`}
                        >
                          Percentage (%)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryChargeType('amount')}
                          className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
                            deliveryChargeType === 'amount'
                              ? 'bg-[#111827] text-white shadow-xs'
                              : 'text-zinc-600 hover:text-black'
                          }`}
                        >
                          Fixed Rate (₹)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
                        {deliveryChargeType === 'percentage' ? 'Delivery Charge (%)' : 'Delivery Charge Amount (₹)'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={deliveryChargeValue}
                          onChange={(e) => {
                            setDeliveryChargeValue(e.target.value);
                            setDeliveryError('');
                          }}
                          placeholder="e.g. 40"
                          className={`w-full rounded-2xl border bg-zinc-50 px-4 py-3 text-sm font-extrabold text-[#111827] focus:bg-white focus:outline-none transition-all ${
                            deliveryError ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 focus:border-[#BBD915]'
                          }`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">
                          {deliveryChargeType === 'percentage' ? '%' : '₹'}
                        </span>
                      </div>
                      {deliveryError && (
                        <p className="mt-1.5 text-[11px] font-bold text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" /> {deliveryError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 text-[11px] font-bold text-zinc-500">
                  Applied to doorstep deliveries.
                </div>
              </div>

              {/* 3. Tax Card */}
              <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-sm flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-[#BBD915]/20 text-[#111827] border border-[#BBD915]/40">
                      <Percent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#111827]">Order Tax (GST / VAT)</h3>
                      <p className="text-[11px] text-zinc-500 font-semibold">Government tax calculation</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">Tax Mode</label>
                      <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setTaxType('percentage')}
                          className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
                            taxType === 'percentage'
                              ? 'bg-[#111827] text-white shadow-xs'
                              : 'text-zinc-600 hover:text-black'
                          }`}
                        >
                          Percentage (%)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaxType('amount')}
                          className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
                            taxType === 'amount'
                              ? 'bg-[#111827] text-white shadow-xs'
                              : 'text-zinc-600 hover:text-black'
                          }`}
                        >
                          Fixed Tax (₹)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
                        {taxType === 'percentage' ? 'Tax Percentage (%)' : 'Fixed Tax Amount (₹)'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={taxValue}
                          onChange={(e) => {
                            setTaxValue(e.target.value);
                            setTaxError('');
                          }}
                          placeholder="e.g. 5"
                          className={`w-full rounded-2xl border bg-zinc-50 px-4 py-3 text-sm font-extrabold text-[#111827] focus:bg-white focus:outline-none transition-all ${
                            taxError ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 focus:border-[#BBD915]'
                          }`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">
                          {taxType === 'percentage' ? '%' : '₹'}
                        </span>
                      </div>
                      {taxError && (
                        <p className="mt-1.5 text-[11px] font-bold text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" /> {taxError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 text-[11px] font-bold text-zinc-500">
                  Computed on checkout summary.
                </div>
              </div>

            </div>

            {/* Live Calculation Preview Box */}
            <div className="bg-white rounded-3xl border border-zinc-200/90 p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h4 className="text-sm font-black text-[#111827] uppercase tracking-wider">Live Checkout Breakdown Preview</h4>
                  <p className="text-xs text-zinc-500 font-semibold">Simulated calculation on a sample ₹500 food order</p>
                </div>
                <span className="text-[10px] font-black uppercase bg-[#BBD915] text-[#111827] px-3 py-1 rounded-full">
                  Sample Order: ₹500
                </span>
              </div>

              <div className="space-y-3 text-xs font-semibold text-zinc-700">
                <div className="flex justify-between">
                  <span>Food Items Subtotal</span>
                  <span className="font-extrabold text-[#111827]">₹{sampleSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>
                    Packing Charge ({packingChargeType === 'percentage' ? `${pVal}%` : `Fixed ₹${pVal}`})
                  </span>
                  <span className="font-extrabold text-[#111827]">+ ₹{calcPacking.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>
                    Delivery Charge ({deliveryChargeType === 'percentage' ? `${dVal}%` : `Fixed ₹${dVal}`})
                  </span>
                  <span className="font-extrabold text-[#111827]">+ ₹{calcDelivery.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-t border-zinc-100 pt-2">
                  <span>
                    Tax / GST ({taxType === 'percentage' ? `${tVal}%` : `Fixed ₹${tVal}`})
                  </span>
                  <span className="font-extrabold text-[#111827]">+ ₹{calcTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-base font-black text-[#111827] border-t-2 border-zinc-200 pt-3">
                  <span>Estimated Customer Total</span>
                  <span className="text-orange-600">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Submit Action Row */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-zinc-200/80">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-2xl bg-[#111827] text-white hover:bg-zinc-800 disabled:opacity-50 font-black text-xs px-8 py-4 shadow-lg shadow-[#111827]/10 transition-all active:scale-[0.98]"
              >
                <Save className="h-4 w-4 text-[#BBD915]" />
                {saving ? 'Saving Changes...' : 'Save Charges & Tax Settings'}
              </button>
            </div>
          </form>
        )}
      </main>
    </PermissionGuard>
  );
}
