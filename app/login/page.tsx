'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest, setAuthToken } from '../utils/api';
import { AlertCircle } from 'lucide-react';
import ModalAlert from '../components/ModalAlert';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState('');

  const [modalAlert, setModalAlert] = useState<{
    isOpen: boolean;
    type?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
  }>({ isOpen: false, message: '' });

  useEffect(() => {
    const checkSession = async () => {
      const token = typeof window !== 'undefined'
        ? (localStorage.getItem('admin_auth_token') || localStorage.getItem('auth_token') || localStorage.getItem('food_auth_token'))
        : null;

      if (!token) {
        setCheckingAuth(false);
        return;
      }

      const storedProfile = typeof window !== 'undefined' ? localStorage.getItem('admin_profile') : null;
      let user: any = null;
      if (storedProfile) {
        try { user = JSON.parse(storedProfile); } catch (e) {}
      }

      // If user profile is already present in localStorage with valid role, immediately redirect
      if (user && (user.isSuperAdmin || user.role === 'admin' || user.role === 'staff')) {
        if (user.isSuperAdmin || user.role === 'admin') {
          router.replace('/dashboard');
        } else {
          const perms = user.permissions || [];
          if (perms.includes('dashboard')) router.replace('/dashboard');
          else if (perms.includes('plans')) router.replace('/plans');
          else if (perms.includes('customPlan')) router.replace('/custom-plan');
          else if (perms.includes('subscriptions')) router.replace('/subscriptions');
          else if (perms.includes('deliveries')) router.replace('/deliveries');
          else router.replace('/profile');
        }
        return;
      }

      try {
        const profile = await apiRequest('/auth/profile');
        if (profile && (profile.role === 'admin' || profile.role === 'staff' || profile.isSuperAdmin)) {
          localStorage.setItem('admin_profile', JSON.stringify(profile));
          if (profile.isSuperAdmin || profile.role === 'admin') {
            router.replace('/dashboard');
          } else {
            const perms = profile.permissions || [];
            if (perms.includes('dashboard')) router.replace('/dashboard');
            else if (perms.includes('plans')) router.replace('/plans');
            else if (perms.includes('customPlan')) router.replace('/custom-plan');
            else if (perms.includes('subscriptions')) router.replace('/subscriptions');
            else if (perms.includes('deliveries')) router.replace('/deliveries');
            else router.replace('/profile');
          }
          return;
        }
      } catch (err) {
        // Token invalid / expired
        setAuthToken(null);
        localStorage.removeItem('admin_profile');
      }

      setCheckingAuth(false);
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailTrimmed = email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailTrimmed) {
      setError('Please enter your email address');
      return;
    }
    if (!emailRegex.test(emailTrimmed)) {
      setError('Please enter a valid email address (e.g. admin@example.com)');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: emailTrimmed.toLowerCase(), password, type: 'admin' }),
      });
      
      if (data.user.role !== 'admin' && data.user.role !== 'staff') {
        throw new Error('Access denied. Admin or Staff credentials required.');
      }

      setAuthToken(data.token);
      localStorage.setItem('admin_profile', JSON.stringify(data.user));

      if (data.user.isSuperAdmin || data.user.role === 'admin') {
        router.push('/dashboard');
      } else {
        const perms = data.user.permissions || [];
        if (perms.includes('dashboard')) {
          router.push('/dashboard');
        } else if (perms.includes('plans')) {
          router.push('/plans');
        } else if (perms.includes('customPlan')) {
          router.push('/custom-plan');
        } else if (perms.includes('subscriptions')) {
          router.push('/subscriptions');
        } else if (perms.includes('deliveries')) {
          router.push('/deliveries');
        } else {
          router.push('/profile');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F9FBE7] text-[#111827] font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#BBD915] border-t-transparent"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Checking admin session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen overflow-hidden bg-[#F9FBE7] text-[#111827] font-sans">
      {/* Left Column: Low-Poly Geometric Abstract Gradient Background */}
      <div className="hidden md:block relative w-full h-full overflow-hidden">
        <img 
          src="/low_poly_bg.png" 
          alt="Geometric Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#F9FBE7]/10"></div>
      </div>

      {/* Right Column: Sleek Form Panel */}
      <div className="flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 bg-[#F9FBE7] w-full h-full overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link href="/" className="inline-block mb-6 hover:scale-105 transition-transform">
            <img 
              src="/logo.png" 
              alt="serveflow.in logo" 
              className="h-12 w-12 rounded-2xl object-contain shadow-md shadow-[#BBD915]/20" 
            />
          </Link>

          <h2 className="text-3xl font-black tracking-tight text-[#111827]">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-zinc-500 font-bold">
            Log in to continue to your account.
          </p>

          {error && (
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-xs text-red-600 border border-red-100">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-[#111827] shadow-sm transition-all focus:border-[#BBD915] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-zinc-200 bg-white pl-4 pr-20 py-3 text-sm text-[#111827] shadow-sm transition-all focus:border-[#BBD915] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 hover:text-zinc-600 focus:outline-none"
                >
                  visibility
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="button"
                onClick={(e) => { 
                  e.preventDefault(); 
                  setModalAlert({ 
                    isOpen: true, 
                    type: 'info', 
                    title: 'Password Support', 
                    message: 'Please contact administrative support or company super admin to reset your credentials.' 
                  }); 
                }}
                className="text-xs font-bold text-[#111827] hover:underline underline-offset-2 cursor-pointer"
              >
                Forgot your password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#BBD915] hover:bg-[#a6c212] py-3.5 text-sm font-bold text-[#111827] shadow-lg shadow-[#BBD915]/10 mt-6 active:scale-[0.98] transition-all disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-zinc-500 font-bold">
            Don&apos;t have an account?{' '}
            <Link 
              href="/register"
              className="text-[#111827] font-black underline underline-offset-2 hover:text-black"
            >
              Sign up
            </Link>
          </div>
        </div>

        <ModalAlert
          isOpen={modalAlert.isOpen}
          type={modalAlert.type}
          title={modalAlert.title}
          message={modalAlert.message}
          onClose={() => setModalAlert({ ...modalAlert, isOpen: false })}
        />
      </div>
    </div>
  );
}
