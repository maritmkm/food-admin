'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, FileText, Hash, Eye, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import PermissionGuard from '../../components/PermissionGuard';
import { apiRequest } from '../../utils/api';

export default function InvoiceSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Settings State
  const [prefix, setPrefix] = useState('INV');
  const [separator, setSeparator] = useState('-');
  const [nextNumber, setNextNumber] = useState<string>('1001');
  const [padLength, setPadLength] = useState<string>('4');
  const [includeDate, setIncludeDate] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest('/payments/invoice-settings');
      if (data) {
        setPrefix(data.prefix || 'INV');
        setSeparator(data.separator !== undefined ? data.separator : '-');
        setNextNumber(String(data.nextNumber || 1001));
        setPadLength(String(data.padLength || 4));
        setIncludeDate(!!data.includeDate);
      }
    } catch (err: any) {
      setError('Failed to load invoice settings.');
    } finally {
      setLoading(false);
    }
  };

  const getPreview = () => {
    const sep = separator;
    const pad = Number(padLength) || 4;
    const num = Number(nextNumber) || 1001;
    const paddedNum = String(num).padStart(pad, '0');
    const upperPrefix = (prefix || 'INV').toUpperCase();
    if (includeDate) {
      const d = new Date();
      const datePart = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
      return `${upperPrefix}${sep}${datePart}${sep}${paddedNum}`;
    }
    return `${upperPrefix}${sep}${paddedNum}`;
  };

  const validate = () => {
    if (!prefix.trim()) return 'Invoice prefix is required.';
    if (prefix.trim().length > 10) return 'Prefix must be 10 characters or less.';
    if (Number(nextNumber) < 1) return 'Next invoice number must be at least 1.';
    if (Number(nextNumber) > 999999999) return 'Next invoice number is too large.';
    if (Number(padLength) < 1 || Number(padLength) > 10) return 'Pad length must be between 1 and 10.';
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiRequest('/payments/invoice-settings', {
        method: 'POST',
        body: JSON.stringify({
          prefix: prefix.toUpperCase().trim(),
          separator,
          nextNumber: Number(nextNumber),
          padLength: Number(padLength),
          includeDate,
        }),
      });
      setSuccess('Invoice settings saved successfully! All new invoices will use these settings.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save invoice settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PermissionGuard permission="settings">
        <main className="flex-1 p-6 md:p-10 font-sans bg-[#F9FBE7] min-h-screen text-[#111827]">
          <div className="flex h-64 items-center justify-center">
            <div className="flex items-center gap-3 rounded-2xl bg-white p-6 shadow-xl">
              <div className="h-5 w-5 animate-spin rounded-full border-3 border-[#BBD915] border-t-transparent"></div>
              <span className="text-sm font-bold text-zinc-700">Loading invoice settings...</span>
            </div>
          </div>
        </main>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permission="settings">
      <main className="flex-1 p-6 md:p-10 font-sans bg-[#F9FBE7] min-h-screen text-[#111827]">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-6">
          <span>Dashboard</span>
          <span>/</span>
          <Link href="/settings" className="hover:text-zinc-700 transition-colors">Settings</Link>
          <span>/</span>
          <span className="text-zinc-700 font-bold">Invoice Number Settings</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/settings"
            className="p-2.5 rounded-2xl bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-5 w-5 text-zinc-600" />
          </Link>
          <div className="p-3 rounded-2xl bg-[#111827] text-white shadow-md">
            <FileText className="h-6 w-6 text-[#BBD915]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#111827]">Invoice Number Settings</h1>
            <p className="text-xs text-zinc-500 font-semibold mt-1">
              Configure how invoice numbers are generated for every payment.
            </p>
          </div>
        </div>

        {/* Success/Error Alerts */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-800">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Form */}
          <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">

            {/* Prefix & Separator */}
            <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-extrabold text-[#111827] mb-6 flex items-center gap-2">
                <Hash className="h-5 w-5 text-[#BBD915]" />
                Invoice Number Format
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prefix */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Invoice Prefix
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    maxLength={10}
                    placeholder="e.g. INV, FP, BILL"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-900 focus:border-[#BBD915] focus:outline-none focus:ring-2 focus:ring-[#BBD915]/30 uppercase placeholder:normal-case placeholder:font-normal"
                    required
                  />
                  <p className="text-[11px] text-zinc-400 font-medium">Letters only, max 10 characters. Always displayed in uppercase.</p>
                </div>

                {/* Separator */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Separator Character
                  </label>
                  <select
                    value={separator}
                    onChange={(e) => setSeparator(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-900 focus:border-[#BBD915] focus:outline-none focus:ring-2 focus:ring-[#BBD915]/30"
                  >
                    <option value="-">Hyphen ( - )</option>
                    <option value="/">Slash ( / )</option>
                    <option value="_">Underscore ( _ )</option>
                    <option value="">None (no separator)</option>
                  </select>
                  <p className="text-[11px] text-zinc-400 font-medium">Character between prefix and number parts.</p>
                </div>

                {/* Next Invoice Number */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Next Invoice Number
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={nextNumber}
                    onChange={(e) => setNextNumber(e.target.value)}
                    min={1}
                    max={999999999}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-900 focus:border-[#BBD915] focus:outline-none focus:ring-2 focus:ring-[#BBD915]/30"
                    required
                  />
                  <p className="text-[11px] text-zinc-400 font-medium">This number will be used for the next invoice generated. Increments automatically.</p>
                </div>

                {/* Pad Length */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Number Padding (digits)
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <select
                    value={padLength}
                    onChange={(e) => setPadLength(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-900 focus:border-[#BBD915] focus:outline-none focus:ring-2 focus:ring-[#BBD915]/30"
                  >
                    <option value="3">3 digits (e.g. 001)</option>
                    <option value="4">4 digits (e.g. 0001)</option>
                    <option value="5">5 digits (e.g. 00001)</option>
                    <option value="6">6 digits (e.g. 000001)</option>
                  </select>
                  <p className="text-[11px] text-zinc-400 font-medium">Left-pad the number with zeros to this length.</p>
                </div>
              </div>
            </div>

            {/* Include Date Toggle */}
            <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-extrabold text-[#111827] mb-6 flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#BBD915]" />
                Optional: Include Date in Number
              </h2>

              <label className="flex items-start gap-4 cursor-pointer">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={includeDate}
                    onChange={(e) => setIncludeDate(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="h-6 w-11 rounded-full bg-zinc-200 peer-checked:bg-[#BBD915] transition-colors relative">
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${includeDate ? 'translate-x-5' : ''}`}></span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-zinc-900">Include Generation Date</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    When enabled, invoice numbers include the date in YYYYMMDD format.<br />
                    Example: <strong>{(() => {
                      const sep = separator;
                      const d = new Date();
                      const datePart = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
                      const paddedNum = String(Number(nextNumber) || 1001).padStart(Number(padLength) || 4, '0');
                      return `${(prefix || 'INV').toUpperCase()}${sep}${datePart}${sep}${paddedNum}`;
                    })()}</strong>
                  </p>
                </div>
              </label>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-[#111827] text-white py-4 text-sm font-extrabold shadow-lg hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving Invoice Settings...' : 'Save Invoice Settings'}
            </button>
          </form>

          {/* Preview Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-sm sticky top-6">
              <h2 className="text-sm font-extrabold text-[#111827] mb-5 flex items-center gap-2">
                <Eye className="h-4 w-4 text-[#BBD915]" />
                Live Preview
              </h2>

              <div className="bg-gradient-to-br from-[#111827] to-zinc-700 rounded-2xl p-6 text-center mb-6">
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-3">Next Invoice Will Be</p>
                <p className="text-2xl font-black text-[#BBD915] font-mono break-all">{getPreview()}</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 font-semibold">Prefix</span>
                  <span className="font-extrabold text-zinc-900 font-mono">{prefix.toUpperCase() || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 font-semibold">Separator</span>
                  <span className="font-extrabold text-zinc-900 font-mono">{separator || '(none)'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 font-semibold">Next Number</span>
                  <span className="font-extrabold text-zinc-900 font-mono">{String(Number(nextNumber) || 1001).padStart(Number(padLength) || 4, '0')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 font-semibold">Padding</span>
                  <span className="font-extrabold text-zinc-900 font-mono">{padLength} digits</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-500 font-semibold">Include Date</span>
                  <span className={`font-extrabold ${includeDate ? 'text-green-600' : 'text-zinc-400'}`}>{includeDate ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchSettings}
                className="mt-5 w-full flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reload from Server
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-800 space-y-2">
              <p className="font-extrabold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Important Notes
              </p>
              <ul className="space-y-1.5 font-semibold list-disc pl-4 text-amber-700">
                <li>Invoice numbers automatically increment with each payment.</li>
                <li>Changing the prefix or format will apply to future invoices only.</li>
                <li>Avoid manually changing <strong>Next Invoice Number</strong> to avoid gaps or duplicates.</li>
                <li>Existing invoices will retain their original numbers.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </PermissionGuard>
  );
}
