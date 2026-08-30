'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { AlertTriangle, Clock, Lock, Sparkles, UserPlus, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<any>(null);

  const handleLogoutAndGoHome = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('food_auth_token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('admin_auth_token');
      localStorage.removeItem('admin_profile');
      localStorage.removeItem('user_profile');
    }
    window.location.href = '/';
  };

  useEffect(() => {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('auth_token') || localStorage.getItem('admin_auth_token'))
      : null;

    // If already logged in and user navigates or enters /login or /register, redirect immediately to dashboard
    if (token && (pathname === '/login' || pathname === '/register')) {
      router.replace('/dashboard');
      return;
    }

    // Only fetch for authenticated dashboard routes
    if (pathname === '/login' || pathname === '/register' || pathname === '/') return;

    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/company-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setCompanyProfile(data);
        })
        .catch(() => {});
    }
  }, [pathname, router]);

  // On login, register, or root landing page paths, render container-free without sidebar/header
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    return <>{children}</>;
  }

  const getPageTitle = () => {
    if (pathname.includes('/theme-editor')) return 'Theme & Content Editor';
    if (pathname.includes('/plans')) return 'Subscription Plans';
    if (pathname.includes('/custom-plan')) return 'Plan Management';
    if (pathname.includes('/subscriptions')) return 'Customer Subscriptions';
    if (pathname.includes('/deliveries')) return 'Daily Dispatch Checklist';
    if (pathname.includes('/users')) return 'Manage Staff & Permissions';
    if (pathname.includes('/payment-settings')) return 'Payment Gateways & Settings';
    if (pathname.includes('/settings/area')) return 'Delivery Area Settings';
    if (pathname.includes('/settings')) return 'Platform Settings';
    if (pathname.includes('/profile')) return 'Admin Profile';
    return 'Plans Dashboard';
  };

  const isTrial = companyProfile?.subscriptionStatus === 'trial';
  const isExpired = companyProfile?.isTrialExpired;
  const customerCount = companyProfile?.customerCount || 0;
  const maxCustomers = companyProfile?.trialMaxCustomers || 25;

  // Calculate days remaining
  let daysRemaining = 7;
  if (companyProfile?.trialEndsAt) {
    const diff = new Date(companyProfile.trialEndsAt).getTime() - new Date().getTime();
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F9FBE7] text-[#111827] font-sans overflow-hidden relative">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Trial Active Notification Top Bar */}
        {isTrial && !isExpired && (
          <div className="bg-[#111827] text-white px-4 py-2 text-xs font-bold flex items-center justify-between gap-3 border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="bg-[#BBD915] text-[#111827] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                7-DAY TRIAL ACTIVE
              </span>
              <span>
                Register up to {maxCustomers} customers ({Math.max(0, maxCustomers - customerCount)} slots left) • {daysRemaining} Day{daysRemaining !== 1 ? 's' : ''} Remaining
              </span>
            </div>
            <Link
              href="/"
              className="text-[#BBD915] hover:underline font-black flex items-center gap-1 shrink-0"
            >
              <span>Subscribe to Plan</span>
              <Sparkles className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        <Header title={getPageTitle()} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex-1 overflow-y-auto relative">
          {children}

          {/* 🔒 Full-Screen Feature Locking Modal when 7-Day Trial is Expired */}
          {isExpired && (
            <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl border border-zinc-200 animate-in fade-in-50">
                
                <div className="h-16 w-16 bg-red-100 border border-red-200 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-black bg-red-100 text-red-700 px-3 py-1 rounded-full uppercase tracking-wider">
                    7-Day Trial Expired
                  </span>
                  <h2 className="text-2xl font-black text-[#111827]">
                    Free Trial Ended — Features Disabled
                  </h2>
                  <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                    Your 7-day free trial period has expired. All admin panel management features (menu, subscriptions, dispatch &amp; settings) are currently disabled.
                  </p>
                </div>

                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 text-left space-y-2 text-xs font-bold text-zinc-700">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Customer Limit: Max 25 customers during trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-500 shrink-0" />
                    <span>Trial Duration: 7 days expired</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleLogoutAndGoHome}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#BBD915] hover:bg-[#a8c413] text-[#111827] font-black text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout &amp; Go to Home Page</span>
                  </button>

                  <p className="text-[10px] text-zinc-400 font-bold">
                    Logging out will take you back to the home landing page. Choose any plan to reactivate your admin features.
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
