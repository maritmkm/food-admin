'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, ChevronDown, X, ShieldAlert, Award, Clock, Menu, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuToggle?: () => void;
}

export default function Header({ title, onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Alex Turner');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedProfile = localStorage.getItem('admin_profile');
      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          if (parsed?.name) {
            setAdminName(parsed.name);
          }
        } catch (e) {
          // fallback
        }
      }
    }
  }, []);

  const notifications = [
    { id: 1, title: 'New subscription booked', desc: 'Customer John Doe subscribed to Daily Balance.', time: '5m ago', icon: Award, color: 'text-green-600 bg-green-50' },
    { id: 2, title: 'Delivery Dispatch active', desc: 'Delivery #del-3 set to Out for Delivery.', time: '20m ago', icon: Clock, color: 'text-blue-600 bg-blue-50' },
    { id: 3, title: 'New plan request', desc: 'Dietary updates requested for Keto Cleanse.', time: '2h ago', icon: ShieldAlert, color: 'text-orange-600 bg-orange-50' },
    { id: 4, title: 'Database Backup Completed', desc: 'Automated file-system db backup completed.', time: '12h ago', icon: Award, color: 'text-zinc-600 bg-zinc-100' },
  ];

  return (
    <header className="h-16 md:h-20 bg-white border-b border-zinc-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm text-[#111827]">
      {/* Mobile View: Hamburger Menu + Logo Icon */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={onMenuToggle}
          className="text-[#111827] hover:bg-zinc-100 transition-colors focus:outline-none p-1.5 rounded-lg"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link href="/dashboard" className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#BBD915] text-[#111827]">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </Link>
      </div>

      {/* Desktop View: Page Title */}
      <h2 className="hidden md:block text-xl font-black tracking-tight text-[#111827]">
        {title}
      </h2>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-6">
        
        {/* Bell notification button */}
        <button
          onClick={() => setIsNotifOpen(true)}
          className="relative p-2 rounded-full hover:bg-zinc-100 transition-colors text-[#111827] focus:outline-none"
        >
          <Bell className="h-5.5 w-5.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* Profile Card toggler/button */}
        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-1.5 md:gap-3 text-left focus:outline-none p-1.5 hover:bg-zinc-50 rounded-xl transition-all"
          >
            {/* Round Avatar Container with Light-Brown Border */}
            <div className="h-9 w-9 rounded-full border-2 border-[#E1C593] bg-zinc-100 flex items-center justify-center overflow-hidden shrink-0">
              <svg className="w-5 h-5 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="hidden md:block">
              <div className="text-xs font-black text-[#111827] tracking-tight">{adminName}</div>
              <div className="text-[10px] text-zinc-400 font-bold leading-tight">Admin</div>
            </div>
            
            <ChevronDown className="hidden md:block h-4 w-4 text-zinc-500 shrink-0" />
          </button>

          {/* Profile Dropdown */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-zinc-200/80 shadow-xl py-2 z-50 animate-fade-in text-sm font-bold text-[#111827]">
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  router.push('/profile');
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 transition-colors"
              >
                View Profile Page
              </button>
              <hr className="my-1.5 border-zinc-100" />
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  localStorage.removeItem('admin_profile');
                  localStorage.removeItem('admin_auth_token');
                  router.push('/login');
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Notifications panel (Right to Left) */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs">
          {/* Backdrop Closer */}
          <div className="absolute inset-0 -z-10" onClick={() => setIsNotifOpen(false)}></div>

          {/* Drawer Sidebar */}
          <div className="w-80 max-w-full bg-white h-full border-l border-zinc-200/80 shadow-2xl flex flex-col p-6 animate-slide-in relative text-[#111827]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
              <h3 className="text-lg font-black">Notifications</h3>
              <button
                onClick={() => setIsNotifOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-150 text-zinc-500 hover:text-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-zinc-200/80 transition-all">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                    <n.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#111827] truncate">{n.title}</h4>
                    <p className="text-[10px] text-zinc-500 font-semibold mt-0.5 leading-relaxed">{n.desc}</p>
                    <span className="text-[9px] text-zinc-400 font-bold block mt-1.5">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <button
                onClick={() => {
                  alert('Notifications cleared');
                  setIsNotifOpen(false);
                }}
                className="w-full text-center rounded-xl bg-zinc-100 hover:bg-zinc-200 py-3 text-xs font-bold transition-all"
              >
                Clear All Notifications
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
