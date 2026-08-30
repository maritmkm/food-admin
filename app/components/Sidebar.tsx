'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, LayoutDashboard, Utensils, Users, Truck, LogOut, Menu, X, Sliders, CreditCard, Settings, MessageSquare, ExternalLink, Globe, Palette } from 'lucide-react';
import { setAuthToken } from '../utils/api';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [showMessaging, setShowMessaging] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('admin_profile');
      if (raw) {
        try {
          const profile = JSON.parse(raw);
          setAdminProfile(profile);
          if (profile.companyId) setCompanyId(profile.companyId);
        } catch (e) { }
      }
    }

    // Fetch company profile to check notification addon flags & company ID
    const token = localStorage.getItem('auth_token') ?? localStorage.getItem('admin_auth_token');
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/company-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(company => {
          if (company) {
            setCompanyName(company.name || '');
            if (company.id || company._id) setCompanyId(company.id || company._id);
            const hasWhats = !!company.isWhatsNotification;
            const hasSms = !!company.isSmsNotification;
            setShowMessaging(hasWhats || hasSms);
          }
        })
        .catch(() => { });
    }
  }, []);

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('admin_profile');
    router.push('/login');
  };

  const userBaseUrl = process.env.NEXT_PUBLIC_USER_APP_URL || 'http://localhost:3000';
  const storefrontUrl = companyId ? `${userBaseUrl}/company/${companyId}` : userBaseUrl;

  const handleOpenStorefront = () => {
    window.open(storefrontUrl, '_blank', 'noopener,noreferrer');
  };

  const baseMenuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Menu Management', href: '/meals', icon: Utensils },
    { name: 'Custom Plan Pricing', href: '/custom-plan', icon: Sliders },
    { name: 'Customer Subscriptions', href: '/subscriptions', icon: Users },
    { name: 'Daily Dispatch', href: '/deliveries', icon: Truck },
    { name: 'Theme & Content Editor', href: '/theme-editor', icon: Palette },
    ...(showMessaging ? [{ name: 'WhatsApp & SMS', href: '/settings/messaging', icon: MessageSquare }] : []),
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Filter menu items by user permissions
  const allowedMenuItems = baseMenuItems.filter(item => {
    if (!adminProfile) return false;
    // Super admins and company admins always have access to all modules
    if (adminProfile.isSuperAdmin || adminProfile.role === 'admin') return true;

    const keyMap: Record<string, string> = {
      '/dashboard': 'dashboard',
      '/plans': 'plans',
      '/custom-plan': 'customPlan',
      '/subscriptions': 'subscriptions',
      '/deliveries': 'deliveries',
      '/theme-editor': 'themeEditor',
      '/settings': 'settings',
      '/payment-settings': 'paymentSettings'
    };
    const permissionKey = keyMap[item.href];
    if (!permissionKey) return true;
    if (permissionKey === 'customPlan' || permissionKey === 'plans') {
      return adminProfile.permissions?.includes('customPlan') || adminProfile.permissions?.includes('plans');
    }
    return adminProfile.permissions?.includes(permissionKey);
  });

  // Super admins see the Manage Staff option in the sidebar
  const hasStaffAccess = adminProfile?.isSuperAdmin || adminProfile?.role === 'admin';
  const menuWithStaff = [...allowedMenuItems];
  if (hasStaffAccess) {
    menuWithStaff.push({ name: 'Manage Staff', href: '/users', icon: ShieldCheck });
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#111827] border-r border-zinc-800 text-zinc-300 h-screen flex-col shrink-0 overflow-y-auto sticky top-0">
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-zinc-800">
          <img 
            src="/logo.png" 
            alt="serveflow.in" 
            className="h-9 w-9 rounded-xl object-contain shadow-md bg-white/10 p-0.5 shrink-0" 
          />
          <div className="min-w-0 flex-1">
            <span className="text-base font-extrabold tracking-tight text-white block">
              serveflow<span className="text-[#BBD915]">.in</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mt-0.5 truncate">{companyName}</span>
          </div>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {menuWithStaff.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold tracking-wide transition-all ${isActive
                  ? 'bg-[#BBD915] text-[#111827] shadow-md shadow-[#BBD915]/10'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                  }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Storefront Quick Link & Logout */}
        <div className="p-4 border-t border-zinc-800 space-y-2">
          {companyId && (
            <button
              onClick={handleOpenStorefront}
              className="w-full flex items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-xs font-black bg-[#BBD915]/15 hover:bg-[#BBD915] text-[#BBD915] hover:text-[#111827] border border-[#BBD915]/30 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <span className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" />
                Customer Storefront
              </span>
              <ExternalLink className="h-3 w-3" />
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-400 hover:bg-red-950/20 hover:text-red-400 transition-all active:scale-[0.98] cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Visible when toggled on small screens) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#111827] flex flex-col p-6 text-zinc-300">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <img 
                src="/logo.png" 
                alt="serveflow.in" 
                className="h-8 w-8 rounded-lg object-contain bg-white/10 p-0.5" 
              />
              <span className="font-extrabold text-sm tracking-tight text-white">
                serveflow<span className="text-[#BBD915]">.in</span>
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#BBD915] hover:text-white p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuWithStaff.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold tracking-wide transition-all ${isActive
                    ? 'bg-[#BBD915] text-[#111827]'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                    }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-zinc-800 space-y-2">
            {companyId && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleOpenStorefront();
                }}
                className="w-full flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-xs font-black bg-[#BBD915] text-[#111827]"
              >
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Open Customer Storefront
                </span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-red-400 hover:bg-red-950/20"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
