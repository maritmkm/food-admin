'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../utils/api';
import { 
  Plus, Edit, Trash2, ArrowLeft, RefreshCw, CheckCircle2, ShieldCheck, 
  CreditCard, Key, Lock
} from 'lucide-react';
import PermissionGuard from '../components/PermissionGuard';
import ModalAlert from '../components/ModalAlert';

export default function PaymentSettingsPage() {
  const router = useRouter();
  const [gateways, setGateways] = useState<any[]>([]);
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
  const [saving, setSaving] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State defaulting to Razorpay as requested
  const [paymentType, setPaymentType] = useState<'razorpay' | 'cod' | 'payu' | 'ccavenue' | 'paypal' | 'stripe'>('razorpay');
  const [buttonName, setButtonName] = useState('Pay via Razorpay');
  
  // Razorpay Fields (Default selected gateway)
  const [storeName, setStoreName] = useState('Demo Store');
  const [businessTagline, setBusinessTagline] = useState('');
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');

  // COD Fields
  const [codCharges, setCodCharges] = useState('0');
  const [maxOrderAmount, setMaxOrderAmount] = useState('1000');
  const [enableSmsValidation, setEnableSmsValidation] = useState(false);

  // PayU Fields
  const [merchantKey, setMerchantKey] = useState('');
  const [merchantSalt, setMerchantSalt] = useState('');
  const [payuPaymentMode, setPayuPaymentMode] = useState('Sandbox');

  // CCAvenue Fields
  const [merchantId, setMerchantId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [workingKey, setWorkingKey] = useState('');

  // PayPal Fields
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [paypalPaymentMode, setPaypalPaymentMode] = useState('Sandbox');

  // Stripe Fields
  const [stripeToken, setStripeToken] = useState('');
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/payments/gateways');
      setGateways(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (type: 'razorpay' | 'cod' | 'payu' | 'ccavenue' | 'paypal' | 'stripe' = 'razorpay') => {
    setEditingId(null);
    setPaymentType(type);
    setButtonName(
      type === 'razorpay' ? 'Pay via Razorpay' :
      type === 'cod' ? 'Cash on Delivery' :
      type === 'payu' ? 'Pay via PayU' :
      type === 'ccavenue' ? 'Pay via CCAvenue' :
      type === 'paypal' ? 'Pay via PayPal' : 'Pay via Stripe'
    );
    
    setStoreName('Demo Store');
    setBusinessTagline('');
    setKeyId('');
    setKeySecret('');

    setCodCharges('0');
    setMaxOrderAmount('1000');
    setEnableSmsValidation(false);

    setMerchantKey('');
    setMerchantSalt('');
    setPayuPaymentMode('Sandbox');

    setMerchantId('');
    setAccessCode('');
    setWorkingKey('');

    setClientId('');
    setClientSecret('');
    setPaypalPaymentMode('Sandbox');

    setStripeToken('');
    setStripeWebhookSecret('');
  };

  const handleOpenAddModal = (type: 'razorpay' | 'cod' | 'payu' | 'ccavenue' | 'paypal' | 'stripe' = 'razorpay') => {
    resetForm(type);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (gw: any) => {
    setEditingId(gw.id);
    setPaymentType(gw.type || 'razorpay');
    setButtonName(gw.buttonName || 'Pay via Razorpay');

    setStoreName(gw.storeName || 'Demo Store');
    setBusinessTagline(gw.businessTagline || '');
    setKeyId(gw.keyId || '');
    setKeySecret(gw.keySecret || '');

    setCodCharges(gw.codCharges || '0');
    setMaxOrderAmount(gw.maxOrderAmount || '1000');
    setEnableSmsValidation(!!gw.enableSmsValidation);

    setMerchantKey(gw.merchantKey || '');
    setMerchantSalt(gw.merchantSalt || '');
    setPayuPaymentMode(gw.paymentMode || 'Sandbox');

    setMerchantId(gw.merchantId || '');
    setAccessCode(gw.accessCode || '');
    setWorkingKey(gw.workingKey || '');

    setClientId(gw.clientId || '');
    setClientSecret(gw.clientSecret || '');
    setPaypalPaymentMode(gw.paymentMode || 'Sandbox');

    setStripeToken(gw.stripeToken || '');
    setStripeWebhookSecret(gw.stripeWebhookSecret || '');

    setIsModalOpen(true);
  };

  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!buttonName.trim()) {
      showAlert('Please enter a display button label (e.g. Pay via Razorpay)', 'warning');
      return;
    }

    if (paymentType === 'razorpay') {
      if (!keyId.trim()) {
        showAlert('Please enter your Razorpay Key ID', 'warning');
        return;
      }
      if (!keySecret.trim()) {
        showAlert('Please enter your Razorpay Key Secret', 'warning');
        return;
      }
    } else if (paymentType === 'cod') {
      const cCharges = Number(codCharges);
      const maxAmt = Number(maxOrderAmount);
      if (isNaN(cCharges) || cCharges < 0) {
        showAlert('Please enter valid COD charges (0 or higher)', 'warning');
        return;
      }
      if (isNaN(maxAmt) || maxAmt <= 0) {
        showAlert('Please enter a valid Maximum Order Amount greater than 0', 'warning');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: any = {
        id: editingId || undefined,
        type: paymentType,
        buttonName: buttonName.trim(),
        isEnabled: true
      };

      if (paymentType === 'razorpay') {
        payload.storeName = storeName.trim() || 'Demo Store';
        payload.businessTagline = businessTagline.trim();
        payload.keyId = keyId.trim();
        payload.keySecret = keySecret.trim();
      } else if (paymentType === 'cod') {
        payload.codCharges = Number(codCharges) || 0;
        payload.maxOrderAmount = Number(maxOrderAmount) || 0;
        payload.enableSmsValidation = enableSmsValidation;
      } else if (paymentType === 'payu') {
        payload.merchantKey = merchantKey;
        payload.merchantSalt = merchantSalt;
        payload.paymentMode = payuPaymentMode;
      } else if (paymentType === 'ccavenue') {
        payload.merchantId = merchantId;
        payload.accessCode = accessCode;
        payload.workingKey = workingKey;
      } else if (paymentType === 'paypal') {
        payload.clientId = clientId;
        payload.clientSecret = clientSecret;
        payload.paymentMode = paypalPaymentMode;
      } else if (paymentType === 'stripe') {
        payload.stripeToken = stripeToken;
        payload.stripeWebhookSecret = stripeWebhookSecret;
      }

      await apiRequest('/payments/gateways', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showAlert('Payment Gateway saved successfully!', 'success');
      setIsModalOpen(false);
      await fetchGateways();
    } catch (err: any) {
      showAlert(err.message || 'Failed to save payment gateway', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (gw: any) => {
    try {
      await apiRequest(`/payments/gateways/${gw.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ isEnabled: !gw.isEnabled })
      });
      await fetchGateways();
    } catch (err: any) {
      showAlert(err.message || 'Failed to update gateway status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    setModalAlert({
      isOpen: true,
      type: 'warning',
      title: 'Delete Gateway Configuration',
      message: 'Are you sure you want to delete this payment gateway configuration?',
      isConfirm: true,
      confirmText: 'Delete Gateway',
      onConfirm: async () => {
        try {
          await apiRequest(`/payments/gateways/${id}`, {
            method: 'DELETE'
          });
          showAlert('Payment gateway deleted successfully!', 'success');
          await fetchGateways();
        } catch (err: any) {
          showAlert(err.message || 'Failed to delete gateway', 'error');
        }
      }
    });
  };

  const getGatewayTitle = (type: string) => {
    switch(type) {
      case 'razorpay': return 'Razorpay';
      case 'cod': return 'Cash on Delivery';
      case 'payu': return 'PayU';
      case 'ccavenue': return 'CCAvenue';
      case 'paypal': return 'PayPal';
      case 'stripe': return 'Stripe';
      default: return type.toUpperCase();
    }
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
              <h1 className="text-2xl font-black text-[#111827]">Payment Gateways & Settings</h1>
            </div>
            <p className="text-xs text-zinc-500 font-semibold mt-1">
              Configure payment methods, API credentials, and webhooks for your store
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchGateways}
              className="p-3 rounded-2xl bg-white border border-zinc-200/80 hover:bg-zinc-50 text-zinc-600 shadow-sm transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleOpenAddModal('razorpay')}
              className="flex items-center gap-2 rounded-2xl bg-[#111827] text-white hover:bg-zinc-800 font-black text-xs px-5 py-3.5 shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 text-[#BBD915]" />
              Add Payment Gateway
            </button>
          </div>
        </div>

        {/* Configured Payment Gateways Table List */}
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
                    <th className="py-4 px-6 pl-6 font-bold">Payment Gateway</th>
                    <th className="py-4 px-4 font-bold">Button Label</th>
                    <th className="py-4 px-4 font-bold">Credentials & Setup</th>
                    <th className="py-4 px-4 font-bold">Status</th>
                    <th className="py-4 px-6 pr-6 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs text-[#111827]">
                  {gateways.map((gw) => (
                    <tr key={gw.id} className="hover:bg-zinc-50/50 transition-colors">
                      {/* Payment Gateway Title */}
                      <td className="py-4 px-6 pl-6 font-extrabold text-[#111827] text-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-zinc-100 text-[#111827]">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <span>{getGatewayTitle(gw.type)}</span>
                        </div>
                      </td>

                      {/* Button Label */}
                      <td className="py-4 px-4 font-semibold text-zinc-600">
                        {gw.buttonName || 'Default Button'}
                      </td>

                      {/* Credentials Summary */}
                      <td className="py-4 px-4 text-xs font-semibold text-zinc-600">
                        {gw.type === 'razorpay' && (
                          <span>Key ID: <strong className="font-mono text-zinc-800">{gw.keyId ? `${gw.keyId.substring(0, 10)}...` : 'Not set'}</strong> ({gw.storeName || 'Demo Store'})</span>
                        )}
                        {gw.type === 'cod' && (
                          <span>Charges: <strong className="text-zinc-800">₹{gw.codCharges || 0}</strong> | Max: <strong className="text-zinc-800">₹{gw.maxOrderAmount || 'Unlimited'}</strong></span>
                        )}
                        {gw.type === 'payu' && (
                          <span>Merchant Key: <strong className="font-mono text-zinc-800">{gw.merchantKey ? `${gw.merchantKey.substring(0, 8)}...` : 'Not set'}</strong> ({gw.paymentMode || 'Sandbox'})</span>
                        )}
                        {gw.type === 'ccavenue' && (
                          <span>Merchant ID: <strong className="font-mono text-zinc-800">{gw.merchantId || 'Not set'}</strong></span>
                        )}
                        {gw.type === 'paypal' && (
                          <span>Client ID: <strong className="font-mono text-zinc-800">{gw.clientId ? `${gw.clientId.substring(0, 10)}...` : 'Not set'}</strong> ({gw.paymentMode || 'Sandbox'})</span>
                        )}
                        {gw.type === 'stripe' && (
                          <span>Token: <strong className="font-mono text-zinc-800">{gw.stripeToken ? `${gw.stripeToken.substring(0, 10)}...` : 'Not set'}</strong></span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={gw.isEnabled} 
                            onChange={() => handleToggleStatus(gw)} 
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BBD915]"></div>
                        </label>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(gw)}
                            title="Edit Gateway"
                            className="p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-zinc-700 font-bold text-xs transition-colors"
                          >
                            <Edit className="h-4 w-4 text-zinc-600" />
                          </button>

                          <button
                            onClick={() => handleDelete(gw.id)}
                            title="Delete Gateway"
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-600 font-bold text-xs transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {gateways.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-400 font-semibold">
                        No payment gateways configured yet. Click "+ Add Payment Gateway" to set up Razorpay.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Add / Edit Payment Gateway (Default Razorpay Selected) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/30 backdrop-blur-sm overflow-y-auto">
            <div className="relative bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200/80 p-6 md:p-8 animate-in fade-in-50 duration-200 text-[#111827]">
              
              {/* Header with Back Arrow */}
              <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-600"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold text-[#111827]">
                  {editingId ? 'Edit Payment Gateway' : 'Add Payment Gateway'}
                </h2>
              </div>

              <form onSubmit={handleSaveGateway} className="space-y-5 font-sans">
                {/* Row 1: Payment Types & Button Name (Razorpay Default Selected) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Payment Types</label>
                    <div className="relative">
                      <select
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value as any)}
                        className="w-full rounded-full border border-zinc-200 bg-white px-4 py-3 text-xs font-bold text-[#111827] focus:border-zinc-400 focus:outline-none appearance-none cursor-pointer shadow-sm"
                      >
                        <option value="razorpay">Razorpay</option>
                        <option value="cod">Cash on Delivery</option>
                        <option value="payu">PayU</option>
                        <option value="ccavenue">CCAvenue</option>
                        <option value="paypal">PayPal</option>
                        <option value="stripe">Stripe</option>
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Button Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Pay via Razorpay"
                      value={buttonName}
                      onChange={(e) => setButtonName(e.target.value)}
                      className="w-full rounded-full border border-zinc-200 px-4 py-3 text-xs font-semibold focus:border-zinc-400 focus:outline-none shadow-sm"
                    />
                  </div>
                </div>

                {/* Form Inputs for RAZORPAY (Default Selected) */}
                {paymentType === 'razorpay' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Store Name</label>
                        <input
                          type="text"
                          placeholder="Demo Store"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          className="w-full rounded-full border border-zinc-200 px-4 py-3 text-xs font-semibold focus:border-zinc-400 focus:outline-none shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Business Tagline</label>
                        <input
                          type="text"
                          placeholder="e.g. Best Meals Delivered"
                          value={businessTagline}
                          onChange={(e) => setBusinessTagline(e.target.value)}
                          className="w-full rounded-full border border-zinc-200 px-4 py-3 text-xs font-semibold focus:border-zinc-400 focus:outline-none shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Key Id</label>
                        <input
                          type="text"
                          placeholder="rzp_test_..."
                          value={keyId}
                          onChange={(e) => setKeyId(e.target.value)}
                          className="w-full rounded-full border border-zinc-200 px-4 py-3 text-xs font-semibold focus:border-zinc-400 focus:outline-none shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Key Secret</label>
                        <input
                          type="password"
                          placeholder="••••••••••••"
                          value={keySecret}
                          onChange={(e) => setKeySecret(e.target.value)}
                          className="w-full rounded-full border border-zinc-200 px-4 py-3 text-xs font-semibold focus:border-zinc-400 focus:outline-none shadow-sm"
                        />
                      </div>
                    </div>

                    {/* WEBHOOK SETUP Section */}
                    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 space-y-2 text-xs">
                      <h4 className="font-extrabold text-[#111827] uppercase tracking-wider text-[11px]">WEBHOOK SETUP</h4>
                      <p className="text-zinc-600">
                        <strong className="text-zinc-800">Webhook URL:</strong> <span className="font-mono text-zinc-500 break-all">https://yourstore.io/api/store_details/razorpay_webhook/5d0ca4c89f21de0314f98f24</span>
                      </p>
                      <p className="text-zinc-600">
                        <strong className="text-zinc-800">Secret:</strong> <span className="font-mono text-zinc-500">5d0ca4c89f21de0314f98f24</span>
                      </p>
                      <p className="text-zinc-600">
                        <strong className="text-zinc-800">Active Events:</strong> <span className="text-zinc-700">order.paid</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Inputs for CASH ON DELIVERY */}
                {paymentType === 'cod' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-600 mb-1.5">COD Charges</label>
                        <input
                          type="number"
                          placeholder="e.g. 10"
                          value={codCharges}
                          onChange={(e) => setCodCharges(e.target.value)}
                          className="w-full rounded-full border border-zinc-200 px-4 py-3 text-xs font-semibold focus:border-zinc-400 focus:outline-none shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Maximum Order Amount</label>
                        <input
                          type="number"
                          placeholder="e.g. 1000"
                          value={maxOrderAmount}
                          onChange={(e) => setMaxOrderAmount(e.target.value)}
                          className="w-full rounded-full border border-zinc-200 px-4 py-3 text-xs font-semibold focus:border-zinc-400 focus:outline-none shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="smsVal"
                        checked={enableSmsValidation}
                        onChange={(e) => setEnableSmsValidation(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 text-[#111827] focus:ring-zinc-400"
                      />
                      <label htmlFor="smsVal" className="text-xs font-semibold text-zinc-700 cursor-pointer">
                        Enable SMS Validation
                      </label>
                    </div>
                  </div>
                )}

                {/* Form Inputs for PAYU */}
                {paymentType === 'payu' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Merchant Key</label>
                      <input
                        type="text"
                        placeholder="Enter merchant key"
                        value={merchantKey}
                        onChange={(e) => setMerchantKey(e.target.value)}
                        className="w-full rounded-full border border-zinc-200 px-4 py-3 text-xs font-semibold focus:border-zinc-400 focus:outline-none shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Merchant Salt</label>
                      <input
                        type="password"
                        placeholder="Enter merchant salt"
                        value={merchantSalt}
                        onChange={(e) => setMerchantSalt(e.target.value)}
                        className="w-full rounded-full border border-zinc-200 px-4 py-3 text-xs font-semibold focus:border-zinc-400 focus:outline-none shadow-sm"
                      />
                    </div>

                    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 space-y-1.5 text-xs">
                      <h4 className="font-extrabold text-[#111827] uppercase tracking-wider text-[11px]">WEBHOOK SETUP</h4>
                      <p className="text-zinc-600">
                        <strong className="text-zinc-800">Webhook URL:</strong> <span className="font-mono text-zinc-500 break-all">https://yourstore.io/api/store_details/payu_webhook</span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Payment Mode</label>
                      <div className="relative">
                        <select
                          value={payuPaymentMode}
                          onChange={(e) => setPayuPaymentMode(e.target.value)}
                          className="w-full rounded-full border border-zinc-200 bg-white px-4 py-3 text-xs font-semibold text-zinc-800 focus:outline-none appearance-none cursor-pointer shadow-sm"
                        >
                          <option value="Sandbox">Sandbox</option>
                          <option value="Live">Live</option>
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Inputs for CCAVENUE */}
                {paymentType === 'ccavenue' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Merchant Id</label>
                      <input
                        type="text"
                        placeholder="Enter merchant id"
                        value={merchantId}
                        onChange={(e) => setMerchantId(e.target.value)}
                        className="w-full rounded-full border border-zinc-200 px-4 py-3 text-xs font-semibold focus:border-zinc-400 focus:outline-none shadow-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Access Code</label>
                        <input
                          type="text"
                          placeholder="Enter access code"
                          value={accessCode}
                          onChange={(e) => setAccessCode(e.target.value)}
                          className="w-full rounded-full border border-zinc-200 px-4 py-3 text-xs font-semibold focus:border-zinc-400 focus:outline-none shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Working Key</label>
                        <input
                          type="password"
                          placeholder="Enter working key"
                          value={workingKey}
                          onChange={(e) => setWorkingKey(e.target.value)}
                          className="w-full rounded-full border border-zinc-200 px-4 py-3 text-xs font-semibold focus:border-zinc-400 focus:outline-none shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 space-y-2 text-xs">
                      <h4 className="font-extrabold text-[#111827] uppercase tracking-wider text-[11px]">WEBHOOK SETUP</h4>
                      <p className="text-zinc-600">
                        <strong className="text-zinc-800">Webhook URL:</strong> <span className="font-mono text-zinc-500 break-all">https://yourstore.io/api/store_details/ccavenue_webhook/5d0ca4c89f21de0314f98f24</span>
                      </p>
                      <p className="text-zinc-500 font-medium pt-1">
                        Add under Dynamic Event Notification &gt; Order status echo URL
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Inputs for PAYPAL */}
                {paymentType === 'paypal' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Client Id</label>
                        <input
                          type="text"
                          placeholder="Enter client id"
                          value={clientId}
                          onChange={(e) => setClientId(e.target.value)}
                          className="w-full rounded-full border border-zinc-200 px-4 py-3 text-xs font-semibold focus:border-zinc-400 focus:outline-none shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Client Secret</label>
                        <input
                          type="password"
                          placeholder="Enter client secret"
                          value={clientSecret}
                          onChange={(e) => setClientSecret(e.target.value)}
                          className="w-full rounded-full border border-zinc-200 px-4 py-3 text-xs font-semibold focus:border-zinc-400 focus:outline-none shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Payment Mode</label>
                      <div className="relative">
                        <select
                          value={paypalPaymentMode}
                          onChange={(e) => setPaypalPaymentMode(e.target.value)}
                          className="w-full rounded-full border border-zinc-200 bg-white px-4 py-3 text-xs font-semibold text-zinc-800 focus:outline-none appearance-none cursor-pointer shadow-sm"
                        >
                          <option value="Sandbox">Sandbox</option>
                          <option value="Live">Live</option>
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Inputs for STRIPE */}
                {paymentType === 'stripe' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Token</label>
                      <input
                        type="password"
                        placeholder="sk_test_... / token"
                        value={stripeToken}
                        onChange={(e) => setStripeToken(e.target.value)}
                        className="w-full rounded-full border border-zinc-200 px-4 py-3 text-xs font-semibold focus:border-zinc-400 focus:outline-none shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Webhook Secret</label>
                      <input
                        type="password"
                        placeholder="whsec_..."
                        value={stripeWebhookSecret}
                        onChange={(e) => setStripeWebhookSecret(e.target.value)}
                        className="w-full rounded-full border border-zinc-200 px-4 py-3 text-xs font-semibold focus:border-zinc-400 focus:outline-none shadow-sm"
                      />
                    </div>

                    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 space-y-2 text-xs">
                      <h4 className="font-extrabold text-[#111827] uppercase tracking-wider text-[11px]">WEBHOOK SETUP</h4>
                      <p className="text-zinc-600">
                        <strong className="text-zinc-800">Webhook URL:</strong> <span className="font-mono text-zinc-500 break-all">https://yourstore.io/api/store_details/stripe_webhook/5d0ca4c89f21de0314f98f24</span>
                      </p>
                      <p className="text-zinc-600">
                        <strong className="text-zinc-800">Select Events:</strong> <span className="text-zinc-700 font-mono text-[11px]">checkout.session.async_payment_succeeded, checkout.session.completed</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Modal Action Buttons */}
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
                    disabled={saving}
                    className="rounded-full bg-[#111827] hover:bg-zinc-800 text-white px-10 py-3 text-xs font-extrabold shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
                  >
                    <span className="text-[#BBD915] font-black">+</span>
                    {saving ? 'Saving...' : (editingId ? 'Save Changes' : 'Add')}
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

function ChevronDownIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
