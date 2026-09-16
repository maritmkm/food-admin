'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest, setAuthToken } from '../utils/api';
import { 
  AlertCircle, CheckCircle2, Building, User, Mail, Phone, 
  Lock, Eye, EyeOff, CreditCard, ArrowRight, ArrowLeft,
  ShieldCheck, Sparkles, ExternalLink, Check, Palette, X, Maximize2
} from 'lucide-react';

interface ThemeOption {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  colors: string[];
  previewPath: string;
  description: string;
}

const THEMES: ThemeOption[] = [
  {
    id: 'default',
    name: 'Theme 0 — Citrus Lime Minimalist',
    tagline: 'Citrus Lime & Charcoal Minimalist Dining',
    badge: 'Popular • Clean',
    badgeBg: 'bg-lime-100 border-lime-300',
    badgeText: 'text-lime-900',
    colors: ['#BBD915', '#111827', '#F9FBE7'],
    previewPath: '/?theme=default',
    description: 'Crisp, contemporary design ideal for fresh salads, organic bowls, and macro-balanced weekly diet subscriptions.'
  },
  {
    id: '1',
    name: 'Theme 1 — Bistro Foody',
    tagline: 'Warm Rose & Artisanal Italian Bistro Vibe',
    badge: 'Artisanal • Gourmet',
    badgeBg: 'bg-rose-100 border-rose-300',
    badgeText: 'text-rose-900',
    colors: ['#F43F5E', '#1A1A1A', '#FFEFE8'],
    previewPath: '/home-1?theme=1',
    description: 'Warm, appetizing layout tailored for chef-crafted dinner boxes, artisanal kitchens, and gourmet meal deliveries.'
  },
  {
    id: '2',
    name: 'Theme 2 — Organic Forest',
    tagline: 'Deep Forest Emerald & Terracotta Nutrition',
    badge: 'Organic • Earthy',
    badgeBg: 'bg-emerald-100 border-emerald-300',
    badgeText: 'text-emerald-900',
    colors: ['#0B4F37', '#E06A4E', '#F4F7F4'],
    previewPath: '/home-2?theme=2',
    description: 'Earth-toned rustic theme built for farm-to-table health kitchens, organic meal prep, and nutritionist diet plans.'
  },
  {
    id: '3',
    name: 'Theme 3 — Golden Amber',
    tagline: 'Dark Espresso & Warm Amber Luxury Dining',
    badge: 'Luxury • Premium',
    badgeBg: 'bg-amber-100 border-amber-300',
    badgeText: 'text-amber-900',
    colors: ['#FFB800', '#1C100B', '#2A1810'],
    previewPath: '/home-3?theme=3',
    description: 'High-end dark luxury theme engineered for executive corporate dining, luxury barbecue grills, and VIP feasts.'
  },
  {
    id: '4',
    name: 'Theme 4 — Indigo Modern',
    tagline: 'Midnight Slate & Electric Indigo Modern Tech',
    badge: 'Fitness • Tech',
    badgeBg: 'bg-indigo-100 border-indigo-300',
    badgeText: 'text-indigo-900',
    colors: ['#6366F1', '#0F172A', '#F8FAFC'],
    previewPath: '/home-4?theme=4',
    description: 'Sleek and dynamic tech layout built for fitness athletes, high-protein bodybuilding meal preps, and busy professionals.'
  },
  {
    id: '5',
    name: 'Theme 5 — Dark Gourmet',
    tagline: 'Onyx Black & Fiery Crimson Culinary Ambiance',
    badge: 'Dark Mode • Elegant',
    badgeBg: 'bg-zinc-800 border-zinc-700',
    badgeText: 'text-red-400',
    colors: ['#FF3E24', '#181A1B', '#232527'],
    previewPath: '/home-5?theme=5',
    description: 'Dramatic dark-mode culinary aesthetic perfect for authentic roasted dishes, spicy hot pots, and rich dinners.'
  },
  {
    id: '6',
    name: 'Theme 6 — JoyFest Playful',
    tagline: 'Bubblegum Pink & Royal Purple Party Theme',
    badge: 'Events • Playful',
    badgeBg: 'bg-pink-100 border-pink-300',
    badgeText: 'text-pink-900',
    colors: ['#FF5983', '#281643', '#FFF0F5'],
    previewPath: '/home-6?theme=6',
    description: 'Fun, colorful and vibrant theme designed for kids bento boxes, party catering, and festive birthday celebration food.'
  }
];

export default function AdminRegisterPage() {
  const router = useRouter();

  // Wizard Step: 1 = Form, 2 = Theme Selection
  const [step, setStep] = useState<1 | 2>(1);

  // Form Inputs
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [planType, setPlanType] = useState('2'); // '2' = Price Card, '3' = Price Matrix
  
  // Selected Theme (Defaults to 'default', required selection)
  const [selectedTheme, setSelectedTheme] = useState<string>('default');

  // Preview Modal State
  const [previewTheme, setPreviewTheme] = useState<ThemeOption | null>(null);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const userBaseUrl = process.env.NEXT_PUBLIC_USER_APP_URL || 'http://localhost:3000';

  useEffect(() => {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('admin_auth_token') || localStorage.getItem('auth_token') || localStorage.getItem('food_auth_token'))
      : null;

    if (token) {
      router.replace('/dashboard');
      return;
    }
    setCheckingAuth(false);
  }, [router]);

  // Step 1 validation -> moves to Step 2 without calling API
  const handleProceedToThemeSelection = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!companyName.trim()) {
      setError('Please enter your Company / Kitchen Name');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your Full Name');
      return;
    }
    
    // Strict email format validation
    const emailTrimmed = email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailTrimmed) {
      setError('Please enter your Email Address');
      return;
    }
    if (!emailRegex.test(emailTrimmed)) {
      setError('Please enter a valid Email Address (e.g. name@example.com)');
      return;
    }

    // Phone validation: exactly 10 digits if provided
    const phoneDigits = phone.replace(/\D/g, '');
    if (phone.trim() && phoneDigits.length !== 10) {
      setError('Please enter a valid 10-digit Phone Number');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match');
      return;
    }

    // Advance to theme selection step
    setStep(2);
  };

  // Step 2 final confirmation -> Calls the backend API
  const handleFinalRegister = async () => {
    setError('');
    if (!selectedTheme) {
      setError('Please select a theme for your storefront');
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          companyName: companyName.trim(),
          phone: phone.trim(),
          role: 'admin',
          planType: Number(planType),
          theme: selectedTheme,
        }),
      });

      // Do NOT auto-login. Require email verification first.
      setAuthToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_auth_token');
        localStorage.removeItem('admin_profile');
      }
      
      // Open the success notice modal instructing user to verify email
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
      setStep(1); // Return to form if error occurs
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
    <div className="min-h-screen bg-[#F9FBE7] text-[#111827] font-sans">
      
      {/* ── STEP 1: REGISTRATION DETAILS FORM ── */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 h-screen overflow-hidden">
          
          {/* Left Column: Low-Poly Geometric Abstract Gradient Background */}
          <div className="hidden md:block relative w-full h-full overflow-hidden">
            <img 
              src="/low_poly_bg.png" 
              alt="Geometric Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#F9FBE7]/10"></div>
          </div>

          {/* Right Column: Sleek Register Form Panel */}
          <div className="flex flex-col items-center justify-center p-6 md:p-12 lg:p-14 bg-[#F9FBE7] w-full h-full overflow-y-auto">
            <div className="w-full max-w-md my-auto py-8">
              
              {/* Logo Badge & Step indicator */}
              <div className="flex items-center justify-between mb-6">
                <Link href="/" className="inline-flex hover:scale-105 transition-transform">
                  <img 
                    src="/logo.png" 
                    alt="serveflow.in logo" 
                    className="h-11 w-11 rounded-2xl object-contain shadow-md shadow-[#BBD915]/20" 
                  />
                </Link>
                <div className="flex items-center gap-1.5 bg-white border border-zinc-200/80 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider text-zinc-600 shadow-xs">
                  <span className="text-[#BBD915] bg-[#111827] w-4 h-4 rounded-full inline-flex items-center justify-center text-[9px]">1</span>
                  <span>Step 1 of 2: Account</span>
                </div>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-[#111827]">
                Create Admin Account
              </h2>
              <p className="mt-2 text-sm text-zinc-500 font-bold">
                Sign up to start managing your kitchen subscriptions &amp; storefront.
              </p>

              {/* Error Banner */}
              {error && (
                <div className="mt-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-xs text-red-600 border border-red-100 animate-in fade-in-50">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleProceedToThemeSelection} className="mt-6 space-y-4">
                
                {/* Company / Kitchen Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">
                    Company / Kitchen Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Urban Gourmet Kitchens"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-[#111827] shadow-xs transition-all focus:border-[#BBD915] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Admin Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">
                    Admin Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-[#111827] shadow-xs transition-all focus:border-[#BBD915] focus:outline-none"
                  />
                </div>

                {/* Email Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-[#111827] shadow-xs transition-all focus:border-[#BBD915] focus:outline-none"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">
                      Phone Number (10 Digits)
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="e.g. 9876543210"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-[#111827] shadow-xs transition-all focus:border-[#BBD915] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 chars"
                        className="w-full rounded-xl border border-zinc-200 bg-white pl-4 pr-10 py-2.5 text-xs font-bold text-[#111827] shadow-xs transition-all focus:border-[#BBD915] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">
                      Confirm Password *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-[#111827] shadow-xs transition-all focus:border-[#BBD915] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Plan Type Dropdown */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">
                    Plan Type *
                  </label>
                  <select
                    required
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-[#111827] shadow-xs transition-all focus:border-[#BBD915] focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="2">Plan Type 2 — Price Card</option>
                    <option value="3">Plan Type 3 — Price Matrix</option>
                  </select>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-1">
                    <span className="font-bold text-zinc-500">Price Card</span>: Fixed price tier cards.&nbsp;&nbsp;
                    <span className="font-bold text-zinc-500">Price Matrix</span>: Custom duration &amp; tier calculator.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#111827] hover:bg-black py-3.5 text-sm font-black text-[#BBD915] shadow-lg shadow-black/10 mt-6 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Continue to Select Theme</span>
                  <ArrowRight className="h-4 w-4 text-[#BBD915]" />
                </button>
              </form>

              <div className="mt-8 text-center text-xs text-zinc-500 font-bold">
                Already have an account?{' '}
                <Link 
                  href="/login"
                  className="text-[#111827] underline underline-offset-2 font-black hover:text-black"
                >
                  Log In
                </Link>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: THEME SELECTION & LIVE PREVIEW CARDS ── */}
      {step === 2 && (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-300">
          
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-zinc-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#BBD915] text-[#111827] shadow-xs">
                  <Palette className="h-3.5 w-3.5" />
                  Step 2 of 2
                </span>
                <span className="text-xs text-zinc-500 font-bold">Storefront Appearance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight mt-2">
                Select Your Storefront Theme
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 font-semibold mt-1">
                Choose the visual style for <strong className="text-[#111827]">{companyName}</strong>. Click preview to view any theme live!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-50 text-[#111827] font-bold text-xs px-5 py-3 shadow-xs transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Form
              </button>
              
              <button
                type="button"
                onClick={handleFinalRegister}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-[#BBD915] hover:bg-[#a8c412] text-[#111827] font-black text-xs px-6 py-3 shadow-md shadow-lime-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <span>Confirm &amp; Register</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error notice if any */}
          {error && (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-xs text-red-600 border border-red-200">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Grid of 7 Theme Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {THEMES.map((t) => {
              const isSelected = selectedTheme === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={`rounded-3xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between relative bg-white border-2 ${
                    isSelected
                      ? 'border-[#BBD915] ring-4 ring-[#BBD915]/30 shadow-xl scale-[1.01]'
                      : 'border-zinc-200/90 hover:border-zinc-400 hover:shadow-md'
                  }`}
                >
                  {/* Top Row: Badge & Select Indicator */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${t.badgeBg} ${t.badgeText}`}>
                        {t.badge}
                      </span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                        isSelected 
                          ? 'bg-[#111827] border-[#111827] text-[#BBD915]' 
                          : 'border-zinc-300 bg-white'
                      }`}>
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Theme Header */}
                    <div>
                      <h3 className="text-lg font-black text-[#111827] tracking-tight">
                        {t.name}
                      </h3>
                      <p className="text-xs font-bold text-zinc-500 mt-0.5">
                        {t.tagline}
                      </p>
                    </div>

                    {/* Color Swatches */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Palette:</span>
                      <div className="flex items-center gap-1.5">
                        {t.colors.map((c, cIdx) => (
                          <span 
                            key={cIdx} 
                            className="w-4 h-4 rounded-full border border-black/10 shadow-xs" 
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  {/* Bottom Actions: Live Preview Button & Select Pill */}
                  <div className="pt-6 mt-6 border-t border-zinc-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTheme(t);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-[#111827] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-zinc-600" />
                      <span>Live Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTheme(t.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#111827] text-[#BBD915] shadow-xs'
                          : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      {isSelected ? '✓ Selected' : 'Select Theme'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Confirmation Bar */}
          <div className="bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#BBD915] text-[#111827] flex items-center justify-center font-black">
                ✨
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500">Selected Theme:</p>
                <p className="text-sm font-black text-[#111827]">
                  {THEMES.find(t => t.id === selectedTheme)?.name || 'Default Theme'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-[#111827] font-bold text-xs px-5 py-3 transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Form
              </button>
              
              <button
                type="button"
                onClick={handleFinalRegister}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-[#111827] hover:bg-black text-[#BBD915] font-black text-xs px-8 py-3.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Registering Account...' : 'Complete Registration & Launch 🎉'}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ── LIVE THEME PREVIEW POPUP MODAL (IFRAME) ── */}
      {previewTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-[32px] overflow-hidden shadow-2xl border-2 border-zinc-800 flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header Bar */}
            <div className="bg-[#111827] text-white px-6 py-4 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#BBD915] text-[#111827] flex items-center justify-center font-black text-xs">
                  👁️
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Live Preview: {previewTheme.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    {previewTheme.tagline}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTheme(previewTheme.id);
                    setPreviewTheme(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#BBD915] text-[#111827] text-xs font-black uppercase tracking-wider hover:bg-[#a5c210] shadow-sm transition-all cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  Select This Theme
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewTheme(null)}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Live Interactive Preview Iframe */}
            <div className="flex-1 bg-zinc-100 relative">
              <iframe
                src={`${userBaseUrl}${previewTheme.previewPath}`}
                title={previewTheme.name}
                className="w-full h-full border-0"
              />
            </div>

          </div>
        </div>
      )}

      {/* ── POST-REGISTRATION SUCCESS & RAZORPAY NOTICE MODAL ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border-2 border-[#BBD915] text-center space-y-6 animate-in zoom-in-95 duration-200">
            
            {/* Header Icon */}
            <div className="w-16 h-16 rounded-3xl bg-lime-100 border-2 border-[#BBD915] text-[#111827] flex items-center justify-center mx-auto shadow-md shadow-lime-500/20">
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                Registration Successful
              </div>
              <h3 className="text-2xl font-black text-[#111827] tracking-tight">
                Welcome to {companyName || 'serveflow.in'}!
              </h3>
            </div>

            {/* Email Verification Box */}
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-left space-y-1 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-xs uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Verification Email Sent</span>
              </div>
              <p className="text-xs text-emerald-950 font-bold leading-relaxed">
                A verification link was sent to <span className="underline font-black">{email}</span>. Please click the link in your email inbox to verify your email address.
              </p>
            </div>

            {/* Important Notice Box */}
            <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300/80 text-left space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider">
                <CreditCard className="h-4 w-4 text-amber-700 shrink-0" />
                <span>Subscription Payment Gateway Notice</span>
              </div>
              <p className="text-xs text-amber-950 font-bold leading-relaxed">
                Currently, your customers can only view the prices and menus, but cannot subscribe to your meal plans. Integrate Razorpay so they can subscribe to your meal plans.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <button
                onClick={() => router.push('/login?registered=true')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#111827] hover:bg-black text-[#BBD915] py-3.5 px-5 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Go to Admin Login Page
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
