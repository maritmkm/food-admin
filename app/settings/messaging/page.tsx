'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../utils/api';
import {
  MessageSquare, Smartphone, Key, Plus, Clock, Trash2, Edit3, X,
  CheckCircle2, RefreshCw, AlertCircle, Send, Calendar, ShieldCheck, Zap
} from 'lucide-react';
import PermissionGuard from '../../components/PermissionGuard';
import Pagination from '../../components/Pagination';
import ModalAlert from '../../components/ModalAlert';

export default function MessagingSettingsPage() {
  const router = useRouter();

  // Company notification addon flags
  const [isWhatsEnabled, setIsWhatsEnabled] = useState<boolean | null>(null);
  const [isSmsEnabled, setIsSmsEnabled] = useState<boolean | null>(null);
  const [accessChecked, setAccessChecked] = useState(false);

  // Active Tab State: 'whatsapp' | 'sms'
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'sms'>('whatsapp');

  // Configuration State
  const [config, setConfig] = useState<any>({
    whatsappAccessToken: '',
    whatsappPhoneId: '',
    smsApiKey: '',
    smsSenderId: ''
  });

  // Templates & Loading State
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Modals State
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);

  // Send Bulk Message Modals State
  const [isSendBulkModalOpen, setIsSendBulkModalOpen] = useState<boolean>(false);
  const [isConfirmBulkModalOpen, setIsConfirmBulkModalOpen] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isSendingBulk, setIsSendingBulk] = useState<boolean>(false);

  // Modal Alert State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    isConfirm?: boolean;
    confirmText?: string;
    onConfirm?: () => void;
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
      isConfirm: false,
    });
  };

  const showConfirm = (message: string, onConfirm: () => void, title: string = 'Confirm Action') => {
    setAlertConfig({
      isOpen: true,
      type: 'warning',
      title,
      message,
      isConfirm: true,
      confirmText: 'Confirm',
      onConfirm,
    });
  };

  // Token Modal Form Inputs
  const [tokenAccessToken, setTokenAccessToken] = useState<string>('');
  const [tokenPhoneId, setTokenPhoneId] = useState<string>('');

  // Add/Edit Template Modal Form Inputs
  const [templateNameInput, setTemplateNameInput] = useState<string>('');
  const [templateIdInput, setTemplateIdInput] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  // Route guard: check company addon flags on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token') ?? localStorage.getItem('admin_auth_token');
    if (!token) { router.push('/login'); return; }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/company-profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(company => {
        const hasWhats = !!company?.isWhatsNotification;
        const hasSms = !!company?.isSmsNotification;
        setIsWhatsEnabled(hasWhats);
        setIsSmsEnabled(hasSms);
        setAccessChecked(true);

        if (!hasWhats && !hasSms) {
          // Neither addon is enabled — redirect to dashboard
          router.replace('/dashboard');
          return;
        }

        // Auto-select the first enabled tab
        if (!hasWhats && hasSms) setActiveTab('sms');
        else setActiveTab('whatsapp');
      })
      .catch(() => {
        setAccessChecked(true);
        router.replace('/dashboard');
      });
  }, []);

  useEffect(() => {
    if (accessChecked && (isWhatsEnabled || isSmsEnabled)) {
      fetchData();
    }
  }, [activeTab, accessChecked]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Config
      const configRes = await apiRequest('/messaging/config');
      if (configRes) {
        setConfig(configRes);
        setTokenAccessToken(configRes.whatsappAccessToken || '');
        setTokenPhoneId(configRes.whatsappPhoneId || '');
      }

      // Fetch Templates for Active Channel (auto-seeds default Dispatch & Delivery templates if empty)
      const templatesRes = await apiRequest(`/messaging/templates?channel=${activeTab}`);
      setTemplates(templatesRes || []);
      if (templatesRes && templatesRes.length > 0) {
        setSelectedTemplateId(templatesRes[0].id || templatesRes[0].templateId || '');
      }
    } catch (err) {
      console.error('Failed to load messaging settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTokenConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        whatsappAccessToken: tokenAccessToken,
        whatsappPhoneId: tokenPhoneId
      };
      const updated = await apiRequest('/messaging/config', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setConfig(updated);
      showAlert('WhatsApp Token & Phone ID saved successfully for your company!', 'success');
      setIsTokenModalOpen(false);
    } catch (err: any) {
      showAlert(err.message || 'Failed to save WhatsApp Token', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const isSystemTemplate = (tpl: any) => {
    if (!tpl) return false;
    const name = (tpl.templateName || tpl.name || '').toLowerCase();
    return Boolean(tpl.isDefault || name.includes('dispatch') || name.includes('delivery'));
  };

  const handleOpenAddModal = () => {
    setEditingTemplate(null);
    setTemplateNameInput('');
    setTemplateIdInput('');
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditModal = (tpl: any) => {
    setEditingTemplate(tpl);
    setTemplateNameInput(tpl.templateName || tpl.name || '');
    setTemplateIdInput(tpl.templateId || '');
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSys = isSystemTemplate(editingTemplate);
    if (!isSys && !templateNameInput.trim()) {
      showAlert('Please enter a Template Name', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      if (editingTemplate) {
        // Update existing template (for Dispatch & Delivery system templates, preserve templateName)
        const nameToSave = isSys
          ? (editingTemplate.templateName || editingTemplate.name)
          : templateNameInput.trim();

        await apiRequest(`/messaging/templates/${editingTemplate.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            templateName: nameToSave,
            templateId: templateIdInput.trim()
          })
        });
        showAlert(isSys ? 'Template ID updated successfully!' : 'Template updated successfully!', 'success');
      } else {
        // Create new template
        await apiRequest('/messaging/templates', {
          method: 'POST',
          body: JSON.stringify({
            channel: activeTab,
            templateName: templateNameInput.trim(),
            templateId: templateIdInput.trim(),
            status: 'active'
          })
        });
        showAlert('New Template added successfully!', 'success');
      }

      setIsTemplateModalOpen(false);
      await fetchData();
    } catch (err: any) {
      showAlert(err.message || 'Failed to save template', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    showConfirm('Are you sure you want to delete this template?', async () => {
      try {
        await apiRequest(`/messaging/templates/${id}`, {
          method: 'DELETE'
        });
        showAlert('Template deleted successfully', 'success');
        await fetchData();
      } catch (err: any) {
        showAlert(err.message || 'Failed to delete template', 'error');
      }
    }, 'Delete Template');
  };

  // Bulk Message Flow Handlers
  const handleOpenSendBulkModal = () => {
    if (templates.length === 0) {
      showAlert('No templates found. Please add or configure a template first.', 'warning');
      return;
    }
    if (!selectedTemplateId) {
      setSelectedTemplateId(templates[0].id || templates[0].templateId || '');
    }
    setIsSendBulkModalOpen(true);
  };

  const handleProceedToBulkConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId) {
      showAlert('Please select a template from the dropdown list', 'warning');
      return;
    }
    setIsSendBulkModalOpen(false);
    setIsConfirmBulkModalOpen(true);
  };

  const handleConfirmSendBulkMessage = async () => {
    setIsSendingBulk(true);
    try {
      const res = await apiRequest('/messaging/send-bulk-template', {
        method: 'POST',
        body: JSON.stringify({
          templateId: selectedTemplateId,
          channel: activeTab
        })
      });

      showAlert(res.message || 'Template message broadcasted successfully to all company customers!', 'success');
      setIsConfirmBulkModalOpen(false);
    } catch (err: any) {
      showAlert(err.message || 'Failed to send bulk template message', 'error');
    } finally {
      setIsSendingBulk(false);
    }
  };

  const getSelectedTemplateObject = () => {
    return templates.find(t => t.id === selectedTemplateId || t.templateId === selectedTemplateId) || templates[0];
  };

  // Pagination Calculations
  const totalResults = templates.length;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;
  const currentTemplates = templates.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Show nothing while checking access
  if (!accessChecked) {
    return (
      <main className="flex-1 flex items-center justify-center h-screen bg-[#F9FBE7]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-4 border-[#BBD915] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-zinc-500">Checking access...</p>
        </div>
      </main>
    );
  }

  return (
    <PermissionGuard permission="settings">
      <main className="flex-1 overflow-y-auto p-6 md:p-10 font-sans bg-[#F9FBE7] text-[#111827]">

        {/* Universal Sleek Modal Alert */}
        <ModalAlert
          isOpen={alertConfig.isOpen}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          isConfirm={alertConfig.isConfirm}
          confirmText={alertConfig.confirmText}
          onConfirm={alertConfig.onConfirm}
          onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        />

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-200/80">
          <div>
            <span className="text-xs text-zinc-500 font-extrabold uppercase tracking-wider block">Communication & Alerts</span>
            <h1 className="text-2xl font-black text-[#111827] mt-0.5 flex items-center gap-2">
              <Zap className="h-6 w-6 text-[#BBD915]" />
              WhatsApp & SMS Settings
            </h1>
            <p className="text-xs text-zinc-500 font-semibold mt-1">
              Configure META WhatsApp API tokens, Phone IDs, and automated messaging templates for your company.
            </p>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 rounded-2xl bg-white border border-zinc-200/80 px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-xs hover:bg-zinc-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#BBD915]' : ''}`} />
            Refresh
          </button>
        </div>

        {/* 2 Integration Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Card 1: WhatsApp Integration — only shown if addon enabled */}
          {isWhatsEnabled && (
            <div
              onClick={() => { setActiveTab('whatsapp'); setCurrentPage(1); }}
              className={`cursor-pointer rounded-3xl p-6 border transition-all duration-200 relative overflow-hidden ${activeTab === 'whatsapp'
                  ? 'bg-white border-[#BBD915] shadow-lg ring-2 ring-[#BBD915]/30'
                  : 'bg-white/80 border-zinc-200/80 hover:border-zinc-300 shadow-sm opacity-90'
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#111827]">WhatsApp Cloud API</h3>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      META CLOUD API
                    </span>
                  </div>
                </div>

                {activeTab === 'whatsapp' && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-[#BBD915] text-[#111827] px-3 py-1 rounded-full border border-[#111827]/10">
                    <CheckCircle2 className="h-3 w-3" /> Active View
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-500 font-semibold leading-relaxed mb-4">
                Send automated courier dispatch updates, subscription renewal alerts, and order delivery status messages to customer WhatsApp numbers.
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-100 text-xs">
                <span className="font-bold text-zinc-500">Token Status:</span>
                <span className={`font-extrabold px-2.5 py-1 rounded-lg text-[11px] ${config.whatsappAccessToken && config.whatsappPhoneId
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                  {config.whatsappAccessToken && config.whatsappPhoneId
                    ? `Configured (Phone ID: ${config.whatsappPhoneId})`
                    : 'Not Configured (Missing Token)'}
                </span>
              </div>
            </div>
          )}

          {/* Card 2: SMS Gateway Integration — only shown if addon enabled */}
          {isSmsEnabled && (
            <div
              onClick={() => { setActiveTab('sms'); setCurrentPage(1); }}
              className={`cursor-pointer rounded-3xl p-6 border transition-all duration-200 relative overflow-hidden ${activeTab === 'sms'
                  ? 'bg-white border-[#BBD915] shadow-lg ring-2 ring-[#BBD915]/30'
                  : 'bg-white/80 border-zinc-200/80 hover:border-zinc-300 shadow-sm opacity-90'
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/80">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#111827]">SMS Gateway API</h3>
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      BULK SMS GATEWAY
                    </span>
                  </div>
                </div>

                {activeTab === 'sms' && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-[#BBD915] text-[#111827] px-3 py-1 rounded-full border border-[#111827]/10">
                    <CheckCircle2 className="h-3 w-3" /> Active View
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-500 font-semibold leading-relaxed mb-4">
                Fallback text message channel for instant OTP verification, daily dispatch alerts, and critical system notifications.
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-100 text-xs">
                <span className="font-bold text-zinc-500">Gateway Status:</span>
                <span className={`font-extrabold px-2.5 py-1 rounded-lg text-[11px] ${config.smsApiKey
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                  }`}>
                  {config.smsApiKey ? 'API Key Configured' : 'Optional Channel'}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Action Header & Templates Table Container */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm p-6 sm:p-8 space-y-6">

          {/* Action Buttons Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
            <div>
              <h2 className="text-lg font-black text-[#111827] flex items-center gap-2">
                {activeTab === 'whatsapp' ? <MessageSquare className="h-5 w-5 text-emerald-600" /> : <Smartphone className="h-5 w-5 text-blue-600" />}
                {activeTab === 'whatsapp' ? 'WhatsApp Templates & Credentials' : 'SMS Templates & Credentials'}
              </h2>
              <p className="text-xs text-zinc-500 font-semibold mt-0.5">
                Manage token credentials and template IDs for {activeTab === 'whatsapp' ? 'WhatsApp Cloud API' : 'SMS Gateway'}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Manage Token Button */}
              <button
                onClick={() => setIsTokenModalOpen(true)}
                className="flex items-center gap-2 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 font-bold text-xs px-4 py-2.5 shadow-sm transition-all active:scale-[0.98]"
              >
                <Key className="h-4 w-4 text-[#BBD915]" />
                Manage Token
              </button>

              {/* Send Message Button */}
              <button
                onClick={handleOpenSendBulkModal}
                className="flex items-center gap-2 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 font-black text-xs px-4 py-2.5 shadow-sm transition-all active:scale-[0.98]"
              >
                <Send className="h-4 w-4 text-white" />
                Send Message
              </button>

              {/* Add Template Button */}
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 rounded-2xl bg-[#BBD915] text-[#111827] hover:bg-[#a8c413] font-black text-xs px-4 py-2.5 shadow-sm transition-all active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                Add Template
              </button>
            </div>
          </div>

          {/* Current Credentials Status Banner */}
          <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 shadow-2xs">
                <Key className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-black text-[#111827] block">
                  {activeTab === 'whatsapp' ? 'META WhatsApp Access Token & Phone ID' : 'SMS API Gateway Credentials'}
                </span>
                <span className="text-[11px] text-zinc-500 font-semibold block">
                  {activeTab === 'whatsapp'
                    ? (config.whatsappPhoneId ? `Phone ID: ${config.whatsappPhoneId} • Access Token: ${config.whatsappAccessToken ? config.whatsappAccessToken.slice(0, 15) + '...' : 'Not Set'}` : 'No WhatsApp Token Configured for this company.')
                    : (config.smsApiKey ? `SMS API Key: ${config.smsApiKey.slice(0, 12)}...` : 'No SMS Gateway API Key Configured.')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsTokenModalOpen(true)}
              className="text-xs font-bold text-zinc-700 hover:text-black underline underline-offset-4"
            >
              Edit Credentials
            </button>
          </div>

          {/* Table List View */}
          <div className="overflow-x-auto border border-zinc-200/80 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-zinc-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Template Name</th>
                  <th className="py-3.5 px-4">Template ID</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs text-[#111827]">
                {currentTemplates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-zinc-50/60 transition-colors">

                    {/* Template Name */}
                    <td className="py-4 px-6 font-extrabold text-sm text-[#111827]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <MessageSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{tpl.templateName || tpl.name || 'Unnamed Template'}</span>
                        {isSystemTemplate(tpl) && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                            <ShieldCheck className="h-3 w-3 text-emerald-600" />
                            System Default
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Template ID */}
                    <td className="py-4 px-4 font-mono font-bold text-zinc-700">
                      {tpl.templateId ? (
                        <span className="bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-md text-[11px] border border-zinc-200">
                          {tpl.templateId}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenEditModal(tpl)}
                          className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md text-[11px] font-extrabold hover:bg-amber-100 transition-colors cursor-pointer"
                        >
                          <AlertCircle className="h-3 w-3" />
                          Not Configured (Click to set ID)
                        </button>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                        {tpl.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(tpl)}
                          className="p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
                          title={isSystemTemplate(tpl) ? "Edit Template ID" : "Edit Template"}
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        {!isSystemTemplate(tpl) ? (
                          <button
                            onClick={() => handleDeleteTemplate(tpl.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                            title="Delete Template"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <span
                            className="p-1.5 rounded-lg text-zinc-300 border border-zinc-100 bg-zinc-50 cursor-not-allowed inline-block"
                            title="Default System Template (Cannot be deleted)"
                          >
                            <Trash2 className="h-4 w-4 text-zinc-300" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty State Table Row */}
                {templates.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-zinc-500 font-bold bg-white">
                      <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                        <div className="p-4 rounded-3xl bg-zinc-50 border border-zinc-200 text-zinc-400">
                          <MessageSquare className="h-8 w-8" />
                        </div>
                        <h4 className="text-sm font-black text-[#111827] mt-1">No Templates Added Yet</h4>
                        <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                          Click &quot;Add Template&quot; button above to define template names and Meta WhatsApp template IDs.
                        </p>
                        <button
                          onClick={handleOpenAddModal}
                          className="mt-2 flex items-center gap-1.5 rounded-xl bg-[#BBD915] text-[#111827] font-black text-xs px-4 py-2 shadow-xs hover:bg-[#a8c413] transition-all"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add First Template
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Component */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={totalResults}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />

        </div>

        {/* Modal 1: Manage Token Popup */}
        {isTokenModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/30 backdrop-blur-sm overflow-y-auto">
            <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200/80 p-6 md:p-8 animate-in fade-in-50 duration-200 text-[#111827]">

              <button
                onClick={() => setIsTokenModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-xl font-extrabold mb-6 border-b border-zinc-100 pb-4 flex items-center gap-2">
                <Key className="h-5.5 w-5.5 text-[#BBD915]" />
                Manage {activeTab === 'whatsapp' ? 'WhatsApp Token' : 'SMS Gateway Key'}
              </h3>

              <p className="text-xs text-zinc-500 font-semibold mb-6 -mt-3">
                Saved API credentials apply strictly to your specific company ID.
              </p>

              <form onSubmit={handleSaveTokenConfig} className="space-y-5">

                {activeTab === 'whatsapp' ? (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        Meta WhatsApp Access Token *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={tokenAccessToken}
                        onChange={(e) => setTokenAccessToken(e.target.value)}
                        placeholder="EAAGm0PX4ZC... (System User Permanent Access Token)"
                        className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-mono text-[#111827] focus:border-zinc-400 focus:outline-none bg-zinc-50/50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        WhatsApp Phone Number ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={tokenPhoneId}
                        onChange={(e) => setTokenPhoneId(e.target.value)}
                        placeholder="10594382910..."
                        className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-mono font-bold text-[#111827] focus:border-zinc-400 focus:outline-none bg-zinc-50/50 focus:bg-white"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      SMS Gateway API Key *
                    </label>
                    <input
                      type="text"
                      required
                      value={tokenAccessToken}
                      onChange={(e) => setTokenAccessToken(e.target.value)}
                      placeholder="SMS_API_KEY_SECRET..."
                      className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-mono font-bold text-[#111827] focus:border-zinc-400 focus:outline-none bg-zinc-50/50 focus:bg-white"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setIsTokenModalOpen(false)}
                    className="rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-6 py-2.5 text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-full bg-[#111827] text-white hover:bg-zinc-800 px-8 py-2.5 text-xs font-extrabold shadow-md transition-all active:scale-[0.98]"
                  >
                    {isSaving ? 'Saving Details...' : 'Save Token Credentials'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Add / Edit Template Popup */}
        {isTemplateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/30 backdrop-blur-sm overflow-y-auto">
            <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200/80 p-6 md:p-8 animate-in fade-in-50 duration-200 text-[#111827]">

              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-xl font-extrabold mb-6 border-b border-zinc-100 pb-4 flex items-center gap-2">
                {editingTemplate ? <Edit3 className="h-5.5 w-5.5 text-[#BBD915]" /> : <Plus className="h-5.5 w-5.5 text-[#BBD915]" />}
                {isSystemTemplate(editingTemplate)
                  ? `Edit Template ID — ${editingTemplate.templateName || editingTemplate.name}`
                  : editingTemplate
                  ? 'Edit Template'
                  : `Add ${activeTab === 'whatsapp' ? 'WhatsApp' : 'SMS'} Template`}
              </h3>

              <p className="text-xs text-zinc-500 font-semibold mb-6 -mt-3">
                {isSystemTemplate(editingTemplate)
                  ? `Configure the Meta WhatsApp Template ID for automated ${((editingTemplate.templateName || editingTemplate.name) || '').toLowerCase().includes('dispatch') ? 'daily dispatch' : 'order delivery'} notifications.`
                  : 'Specify template name and Meta WhatsApp template ID.'}
              </p>

              <form onSubmit={handleSaveTemplate} className="space-y-5">

                {/* Template Name */}
                {isSystemTemplate(editingTemplate) ? (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                        Template Name (System Fixed)
                      </label>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        Core System Template
                      </span>
                    </div>
                    <input
                      type="text"
                      disabled
                      value={templateNameInput}
                      className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-500 bg-zinc-100/90 cursor-not-allowed select-none"
                    />
                    <p className="text-[10px] text-zinc-400 font-semibold mt-1">
                      Template Name is fixed so that automated dispatch &amp; delivery notifications route correctly.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={templateNameInput}
                      onChange={(e) => setTemplateNameInput(e.target.value)}
                      placeholder="e.g. Dispatch Template or Order Delivery Template"
                      className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold text-[#111827] focus:border-zinc-400 focus:outline-none bg-zinc-50/50 focus:bg-white"
                    />
                  </div>
                )}

                {/* Template ID */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Meta WhatsApp Template ID {isSystemTemplate(editingTemplate) && '*'}
                  </label>
                  <input
                    type="text"
                    autoFocus={isSystemTemplate(editingTemplate)}
                    value={templateIdInput}
                    onChange={(e) => setTemplateIdInput(e.target.value)}
                    placeholder={
                      (templateNameInput || '').toLowerCase().includes('dispatch')
                        ? 'e.g. dispatch_alert_v1'
                        : 'e.g. order_delivery_v1'
                    }
                    className="w-full rounded-xl border-2 border-emerald-500/60 bg-emerald-50/20 px-4 py-2.5 text-xs font-mono font-bold text-[#111827] focus:border-emerald-600 focus:outline-none focus:bg-white shadow-2xs"
                  />
                  <p className="text-[10px] text-zinc-500 font-semibold mt-1">
                    Must match approved template ID created in your Meta WhatsApp Business Manager.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setIsTemplateModalOpen(false)}
                    className="rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-6 py-2.5 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-full bg-[#BBD915] text-[#111827] hover:bg-[#a8c413] px-8 py-2.5 text-xs font-black shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {isSaving
                      ? 'Saving...'
                      : isSystemTemplate(editingTemplate)
                      ? 'Update Template ID'
                      : editingTemplate
                      ? 'Update Template'
                      : 'Save Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Send Message Dropdown Selection Popup */}
        {isSendBulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/30 backdrop-blur-sm overflow-y-auto">
            <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200/80 p-6 md:p-8 animate-in fade-in-50 duration-200 text-[#111827]">

              <button
                onClick={() => setIsSendBulkModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-xl font-extrabold mb-6 border-b border-zinc-100 pb-4 flex items-center gap-2">
                <Send className="h-5.5 w-5.5 text-emerald-600" />
                Send Template Message
              </h3>

              <p className="text-xs text-zinc-500 font-semibold mb-6 -mt-3">
                Select an added template from the dropdown list to broadcast to all customers of your company.
              </p>

              <form onSubmit={handleProceedToBulkConfirm} className="space-y-6">

                {/* Template Select Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Select Added Template *
                  </label>
                  <select
                    required
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200/80 px-4 py-3 text-xs font-bold text-[#111827] focus:border-zinc-400 focus:outline-none bg-zinc-50/50 focus:bg-white cursor-pointer shadow-2xs"
                  >
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.templateName || tpl.name || 'Unnamed Template'} {tpl.templateId ? `(${tpl.templateId})` : '(No Template ID)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Template Preview Card */}
                {getSelectedTemplateObject() && (
                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-emerald-100">
                      <span className="font-bold text-zinc-500">Selected Template Name:</span>
                      <span className="font-black text-emerald-950">
                        {getSelectedTemplateObject()?.templateName || getSelectedTemplateObject()?.name}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-emerald-100">
                      <span className="font-bold text-zinc-500">Meta Template ID:</span>
                      <span className="font-mono font-bold text-emerald-900">
                        {getSelectedTemplateObject()?.templateId || 'Not Configured'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-bold text-zinc-500">Target Audience:</span>
                      <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                        All Company Customers
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setIsSendBulkModalOpen(false)}
                    className="rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-6 py-2.5 text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 text-xs font-black shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 4: Bulk Confirmation Popup */}
        {isConfirmBulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/30 backdrop-blur-sm overflow-y-auto">
            <div className="relative bg-white rounded-3xl w-full max-w-md overflow-y-auto shadow-2xl border border-zinc-200/80 p-6 md:p-8 animate-in fade-in-50 duration-200 text-[#111827]">

              <button
                onClick={() => setIsConfirmBulkModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-xl font-extrabold mb-4 border-b border-zinc-100 pb-4 flex items-center gap-2 text-[#111827]">
                <AlertCircle className="h-5.5 w-5.5 text-emerald-600" />
                Confirm Message Send
              </h3>

              <p className="text-sm text-zinc-600 font-bold leading-relaxed mb-6">
                Are you sure you want to send &quot;{getSelectedTemplateObject()?.templateName || getSelectedTemplateObject()?.name}&quot; message to all customers?
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsConfirmBulkModalOpen(false)}
                  className="rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-6 py-2.5 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSendBulkMessage}
                  disabled={isSendingBulk}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 text-xs font-black shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
                >
                  {isSendingBulk ? 'Sending...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </PermissionGuard>
  );
}
