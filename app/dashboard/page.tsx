'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../utils/api';
import { 
  Users, CreditCard, Clock, RefreshCw, ShoppingBag, 
  ExternalLink, Copy, Check, Globe, ArrowUpRight, ArrowRight,
  AlertTriangle, Sparkles
} from 'lucide-react';
import PermissionGuard from '../components/PermissionGuard';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [gateways, setGateways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, companyData, gatewaysData] = await Promise.all([
        apiRequest('/admin/stats').catch(() => null),
        apiRequest('/auth/company-profile').catch(() => null),
        apiRequest('/payments/gateways').catch(() => []),
      ]);
      if (statsData) setStats(statsData);
      if (companyData) setCompanyInfo(companyData);
      if (gatewaysData && Array.isArray(gatewaysData)) setGateways(gatewaysData);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const userBaseUrl = process.env.NEXT_PUBLIC_USER_APP_URL || 'http://localhost:3000';
  const companyId = companyInfo?.id || companyInfo?._id || '';
  const storefrontUrl = companyId ? `${userBaseUrl}/company/${companyId}` : userBaseUrl;

  const handleCopyUrl = () => {
    if (!storefrontUrl) return;
    navigator.clipboard.writeText(storefrontUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleOpenStorefront = () => {
    window.open(storefrontUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F9FBE7] text-[#111827] font-sans items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-10 w-10 animate-spin text-[#BBD915]" />
          <p className="text-zinc-600 font-semibold">Loading HQ Dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { name: 'Active Subscribers', value: stats?.activeSubscriptions || 0, icon: Users, color: 'text-[#111827] bg-[#BBD915]' },
    { name: 'Monthly Recurring Revenue', value: `₹${stats?.monthlyRevenue || 0}`, icon: CreditCard, color: 'text-[#111827] bg-[#FFF44F]' },
    { name: 'Deliveries Scheduled Today', value: stats?.pendingDeliveries || 0, icon: Clock, color: 'text-[#111827] bg-[#BBD915]' },
    { name: 'Total Users registered', value: stats?.totalUsers || 0, icon: ShoppingBag, color: 'text-white bg-[#111827]' },
  ];

  const hasActiveGateway = 
    Boolean(companyInfo?.isPaymentGatewayIntegrated) || 
    Boolean(companyInfo?.hasRazorpay) || 
    (Array.isArray(gateways) && gateways.length > 0 && gateways.some((g: any) => g.isEnabled !== false));

  return (
    <PermissionGuard permission="dashboard">
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-black text-[#111827] tracking-tight">
                {companyInfo?.name || 'Company HQ'}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Storefront Live
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-semibold mt-1">
              Manage your food subscription menus, pricing plans, dispatches, and live storefront.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchDashboardData}
              className="flex items-center gap-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-[#111827] font-bold text-xs px-4 py-2.5 shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <button
              onClick={() => handleOpenStorefront()}
              className="flex items-center gap-2 rounded-xl bg-[#111827] hover:bg-black text-white font-bold text-xs px-4 py-2.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#BBD915]" />
              Visit Storefront
            </button>
          </div>
        </div>

        {/* --- RAZORPAY PAYMENT GATEWAY SETUP CALLOUT BANNER (Only shown if no payment gateway is added) --- */}
        {!hasActiveGateway && (
          <div className="rounded-3xl border-2 border-amber-300/80 bg-gradient-to-r from-amber-50 via-yellow-50/70 to-white p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-[#111827] flex items-center justify-center shrink-0 shadow-md shadow-amber-400/30">
                <CreditCard className="h-6 w-6 text-amber-950" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2 py-0.5 rounded-md">
                    Action Required
                  </span>
                  <span className="text-xs font-black text-amber-950">Subscription Gateway</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-950 font-bold leading-relaxed">
                  Currently, your customers can only view the prices and menus, but cannot subscribe to your meal plans. Integrate Razorpay so they can subscribe to your meal plans.
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/payment-settings')}
              className="shrink-0 flex items-center justify-center gap-2 rounded-2xl bg-[#111827] hover:bg-black text-[#BBD915] font-black text-xs px-6 py-3.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <CreditCard className="h-4 w-4" />
              <span>Payment Gateways &amp; Settings</span>
              <ArrowRight className="h-4 w-4 text-[#BBD915]" />
            </button>
          </div>
        )}

        {/* --- CUSTOMER STOREFRONT URL CARD --- */}
        <div className="rounded-3xl border-2 border-[#BBD915]/60 bg-gradient-to-br from-white via-white to-lime-50/50 p-6 sm:p-8 shadow-lg relative overflow-hidden">
          
          {/* Background Decorative Accent */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-[#BBD915]/15 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 space-y-6">
            
            {/* Top row: Storefront Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#BBD915] text-[#111827] flex items-center justify-center shadow-md shadow-lime-500/20 font-black text-xl">
                🌐
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-[#111827] tracking-tight">
                    Customer Ordering Storefront Link
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#BBD915]/30 text-lime-950 px-2 py-0.5 rounded-md">
                    Multi-Tenant URL
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-medium">
                  Share this dedicated URL with your customers to accept subscriptions and meal orders.
                </p>
              </div>
            </div>

            {/* URL Input Bar with Direct Action Buttons */}
            <div className="bg-white rounded-2xl p-2.5 sm:p-3 border-2 border-zinc-200 shadow-inner flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 flex-1 min-w-0">
                <Globe className="h-4 w-4 text-[#BBD915] shrink-0" />
                <input
                  type="text"
                  readOnly
                  value={storefrontUrl}
                  className="w-full text-xs sm:text-sm font-mono font-bold text-[#111827] bg-transparent outline-none truncate select-all cursor-text"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyUrl}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all shadow-xs cursor-pointer ${
                    copiedUrl
                      ? 'bg-green-600 text-white'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-[#111827]'
                  }`}
                >
                  {copiedUrl ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy URL
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleOpenStorefront()}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#BBD915] hover:bg-[#a8c412] text-[#111827] font-black text-xs transition-all shadow-md shadow-lime-500/20 active:scale-95 cursor-pointer"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Open Live Storefront
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <div key={idx} className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{stat.name}</span>
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shadow-sm ${stat.color}`}>
                  <stat.icon className="h-5.5 w-5.5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold tracking-tight mt-4 text-[#111827]">{stat.value}</p>
              <span className="text-[10px] text-green-600 font-bold block mt-1.5">↑ Stable performance</span>
            </div>
          ))}
        </div>

        {/* --- CHARTS & BREAKDOWN --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Dispatch Deliveries distribution */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#111827] mb-6">Delivery Dispatch Breakdown</h3>
            <div className="space-y-4">
              {stats?.deliveriesByStatus && Object.entries(stats.deliveriesByStatus).map(([status, count]: [string, any]) => {
                const total = Object.values(stats.deliveriesByStatus).reduce((a: any, b: any) => a + b, 0) as number || 1;
                const percentage = Math.round((count / total) * 100);
                
                let color = 'bg-[#BBD915]';
                if (status === 'delivered') color = 'bg-green-500';
                if (status === 'out_for_delivery') color = 'bg-[#FFF44F]';
                if (status === 'failed') color = 'bg-red-500';

                return (
                  <div key={status} className="space-y-1.5 text-sm">
                    <div className="flex justify-between font-bold text-[#111827]">
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                      <span className="text-zinc-500">{count} logs ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {(!stats?.deliveriesByStatus || Object.keys(stats.deliveriesByStatus).length === 0) && (
                <p className="text-center text-sm text-zinc-500 py-10">No delivery logs for today yet.</p>
              )}
            </div>
          </div>

          {/* Active Subscriptions per plan */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#111827] mb-6">Active Plan Subscriptions</h3>
            <div className="space-y-4">
              {stats?.subscriptionsByPlan && Object.entries(stats.subscriptionsByPlan).map(([planName, count]: [string, any]) => {
                const total = Object.values(stats.subscriptionsByPlan).reduce((a: any, b: any) => a + b, 0) as number || 1;
                const percentage = Math.round((count / total) * 100);

                return (
                  <div key={planName} className="space-y-1.5 text-sm">
                    <div className="flex justify-between font-bold text-[#111827]">
                      <span>{planName}</span>
                      <span className="text-zinc-500">{count} subs ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#BBD915] transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {stats?.activeSubscriptions === 0 && (
                <p className="text-center text-sm text-zinc-500 py-10">No active subscriptions yet.</p>
              )}
            </div>
          </div>
        </div>

      </main>
    </PermissionGuard>
  );
}
