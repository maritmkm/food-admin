'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
}

export default function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState('/profile');

  useEffect(() => {
    const raw = localStorage.getItem('admin_profile');
    if (!raw) {
      router.push('/login');
      return;
    }

    try {
      const profile = JSON.parse(raw);
      
      // Super admins and company admins always have full access to everything
      if (profile.isSuperAdmin || profile.role === 'admin') {
        setAuthorized(true);
        return;
      }

      // Define default fallback URLs based on their permissions
      const perms = profile.permissions || [];
      if (perms.includes('dashboard')) setFallbackUrl('/dashboard');
      else if (perms.includes('plans') || perms.includes('customPlan')) setFallbackUrl('/custom-plan');
      else if (perms.includes('subscriptions')) setFallbackUrl('/subscriptions');
      else if (perms.includes('deliveries')) setFallbackUrl('/deliveries');
      else setFallbackUrl('/profile');

      // Special check for user/staff management route
      if (permission === 'users') {
        if (profile.isSuperAdmin || profile.role === 'admin') {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
        return;
      }

      // Check modular permissions
      if (permission === 'customPlan' || permission === 'plans') {
        if (perms.includes('customPlan') || perms.includes('plans')) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
        return;
      }

      if (perms.includes(permission)) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    } catch (e) {
      setAuthorized(true);
    }
  }, [permission, router]);

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-[#F9FBE7] flex items-center justify-center">
        <span className="animate-spin h-8 w-8 border-4 border-[#BBD915] border-t-transparent rounded-full"></span>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-[#F9FBE7] text-[#111827] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 text-center shadow-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 border border-red-100 mx-auto mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black">Access Denied</h2>
          <p className="text-sm text-zinc-500 font-bold mt-2">
            You do not have the required permissions to access this administrative module.
          </p>
          <Link
            href={fallbackUrl}
            className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-[#BBD915] hover:bg-[#a6c212] px-6 py-3 text-sm font-black text-[#111827] shadow-lg shadow-[#BBD915]/10 transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="h-4.5 w-4.5 stroke-[3px]" />
            <span>Go to My Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
