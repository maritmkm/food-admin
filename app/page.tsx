'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuthToken } from './utils/api';
import { 
  Zap, Check, ShieldCheck, MessageSquare, Smartphone, ArrowRight, 
  Sparkles, Layers, Users, Calendar, Award, ChevronRight, HelpCircle, CheckCircle2, Star,
  PlayCircle, Building2, Sliders, Clock, LayoutGrid, Plus, X, Send, Activity, ShieldAlert,
  BarChart3, Globe, Lock, Mail, Phone, ChevronDown, UserPlus, Menu
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState<boolean>(true); // Default to yearly 20% discount
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [animTab, setAnimTab] = useState<'dispatch' | 'calendar' | 'whatsapp' | 'zones'>('dispatch');

  // Price Matrix Calculator State
  const [calcDiet, setCalcDiet] = useState<string>('Veg');
  const [calcDuration, setCalcDuration] = useState<number>(1);
  const [calcTier, setCalcTier] = useState<string>('standard');

  // Price Matrix data (Diet × Duration × Tier)
  const matrixPrices: Record<string, Record<number, Record<string, number>>> = {
    'Veg':    { 1: { basic: 1199, standard: 1799, premium: 2299 }, 3: { basic: 3399, standard: 4999, premium: 6399 }, 6: { basic: 6499, standard: 9499, premium: 11999 }, 12: { basic: 11999, standard: 17999, premium: 22999 } },
    'Non-Veg': { 1: { basic: 1499, standard: 2199, premium: 2799 }, 3: { basic: 4199, standard: 6099, premium: 7799 }, 6: { basic: 7999, standard: 11499, premium: 14499 }, 12: { basic: 14999, standard: 21499, premium: 26999 } },
    'Jain':   { 1: { basic: 1299, standard: 1899, premium: 2399 }, 3: { basic: 3699, standard: 5299, premium: 6799 }, 6: { basic: 7099, standard: 9999, premium: 12799 }, 12: { basic: 12999, standard: 18999, premium: 23999 } },
  };
  const calcPrice = matrixPrices[calcDiet]?.[calcDuration]?.[calcTier] ?? 0;

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Pricing Data Matrix (Monthly vs Yearly 20% Discount)
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      capacity: 'Up to 50 Customers',
      description: 'Ideal for small kitchen operations and local tiffin services starting out.',
      monthlyPrice: 3999,
      yearlyPrice: 3199, // 20% Off
      yearlyTotal: 38388,
      savings: 9600,
      highlight: false,
      badge: 'Starter Pack',
      features: [
        'All Admin Features Enabled',
        'Up to 50 Active Subscribers',
        'Daily Dispatch Checklist Generator',
        'Multi-meal Category Management (Breakfast, Lunch, Dinner)',
        'Basic SMS & Standard Alerts',
        'Export CSV / Excel / PDF Reports',
        'Standard Email Support'
      ]
    },
    {
      id: 'growth',
      name: 'Growth',
      capacity: 'Up to 150 Customers',
      description: 'Perfect for growing meal kit providers & catering kitchens expanding reach.',
      monthlyPrice: 6999,
      yearlyPrice: 5599, // 20% Off
      yearlyTotal: 67188,
      savings: 16800,
      highlight: true, // Most Popular Card
      badge: 'Most Popular',
      features: [
        'All Admin Features Enabled',
        'Up to 150 Active Subscribers',
        'Daily Dispatch Checklist Generator',
        'Custom Plan Pricing Matrix (Diet, Tier & Duration)',
        'Staff Permission Role Delegation',
        'Automated Invoice Generator & Payment History',
        'Priority Phone & Chat Support'
      ]
    },
    {
      id: 'business',
      name: 'Business',
      capacity: 'Up to 300 Customers',
      description: 'Comprehensive solution for established cloud kitchens & multi-location caterers.',
      monthlyPrice: 9999,
      yearlyPrice: 7999, // 20% Off
      yearlyTotal: 95988,
      savings: 24000,
      highlight: false,
      badge: 'Scale Business',
      features: [
        'All Admin Features Enabled',
        'Up to 300 Active Subscribers',
        'Daily Dispatch Checklist Generator',
        'Advanced Multi-Tenant Isolation',
        'Unlimited Staff Sub-Accounts',
        'Custom Payment Gateway Settings',
        'Dedicated Technical Onboarding'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      capacity: '300+ Customers',
      description: 'Tailored enterprise infrastructure for large meal production networks.',
      monthlyPrice: 'Custom',
      yearlyPrice: 'Custom',
      yearlyTotal: 'Custom Quote',
      savings: 0,
      highlight: false,
      badge: 'Enterprise SLA',
      features: [
        'All Admin Features Enabled',
        'Unlimited Active Subscribers (300+)',
        'Dedicated High-Availability Database',
        'Custom API & Webhook Integrations',
        '99.99% Uptime Guarantee & SLA',
        'Custom Domain & Whitelabeling',
        '24/7 Dedicated Account Manager'
      ]
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');
    if (!contactName.trim()) {
      setContactError('Please enter your full name');
      return;
    }
    const emailTrimmed = contactEmail.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      setContactError('Please enter a valid email address (e.g. name@example.com)');
      return;
    }
    const phoneDigits = contactPhone.replace(/\D/g, '');
    if (contactPhone.trim() && phoneDigits.length !== 10) {
      setContactError('Please enter a valid 10-digit phone number');
      return;
    }
    if (!contactMessage.trim()) {
      setContactError('Please enter your message');
      return;
    }

    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setIsContactModalOpen(false);
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setContactMessage('');
      setContactError('');
    }, 2500);
  };

  const faqs = [
    {
      q: 'How does the 7-Day Free Trial work?',
      a: 'When you register a new company account, you receive a 7-Day Free Trial supporting up to 25 active registered customers. During the 7 days, 100% of all admin platform features are unlocked. Once the 7-day trial ends or 25 customers are registered, admin features pause until you subscribe to any plan.'
    },
    {
      q: 'Are all admin features enabled across all subscription tiers?',
      a: 'Yes! Every tier (Starter, Growth, Business, Enterprise) comes with 100% of all platform features enabled — including Daily Dispatch Checklist, Custom Plan Matrix, Multi-tenant Isolation, and Invoicing. Tiers are based purely on your active customer capacity.'
    },
    {
      q: 'How does the 20% Yearly Discount work?',
      a: 'When you choose Yearly Billing, you receive an instant 20% discount on your monthly subscription price. For example, the Growth plan drops from ₹6,999/mo to ₹5,599/mo, saving you ₹16,800 every year.'
    },
    {
      q: 'How does the Meta WhatsApp Cloud API Add-on work?',
      a: 'The WhatsApp Add-on (₹999/mo) links directly to your official WhatsApp Business Phone Number ID and Meta Access Token. It automatically sends dispatch alerts, order confirmations, and delivery updates with strict duplicate send prevention.'
    },
    {
      q: 'Can I upgrade my customer limit at any time?',
      a: 'Absolutey. As your subscriber base expands from Starter (50) to Growth (150) or Business (300), you can upgrade your plan instantly from your account dashboard with pro-rated billing.'
    },
    {
      q: 'How are Custom Design and Bespoke Feature requests priced?',
      a: 'Custom designs, tailored UI themes, specialized business logic, or custom integrations are charged based strictly on your scope of work. Before starting, our engineering team provides a transparent, milestone-based cost proposal after reviewing your requirements.'
    },
    {
      q: 'Is my company data strictly isolated?',
      a: 'Yes, our platform employs enterprise multi-tenant database isolation. All customers, meal plans, pricing matrices, and dispatch logs are strictly scoped to your specific company ID.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9FBE7] text-[#111827] font-sans selection:bg-[#BBD915] selection:text-[#111827]">
      
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <img 
              src="/logo.png" 
              alt="serveflow.in logo" 
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl object-contain shadow-xs group-hover:scale-105 transition-transform" 
            />
            <div>
              <span className="text-base sm:text-lg font-black text-[#111827] tracking-tight block leading-tight">serveflow<span className="text-emerald-600">.in</span></span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-extrabold text-zinc-600 uppercase tracking-wider">
            <a href="#live-operations" className="hover:text-black transition-colors">Showcase</a>
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#datamodel" className="hover:text-black transition-colors">Data Model</a>
            <a href="#pricing" className="hover:text-black transition-colors">Pricing Tiers</a>
            <a href="#metrics" className="hover:text-black transition-colors">Metrics</a>
            <a href="#testimonials" className="hover:text-black transition-colors">Stories</a>
            <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
          </nav>

          {/* Desktop & Tablet Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Contact Sales CTA - Shown on sm+ screens */}
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-2xl bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 font-bold text-xs px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-xs transition-all cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5 text-emerald-600" />
              <span>Contact</span>
            </button>

            {/* Auth Buttons */}
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 rounded-2xl bg-[#111827] text-white hover:bg-zinc-800 font-extrabold text-xs px-4 sm:px-5 py-2 sm:py-2.5 shadow-md transition-all active:scale-[0.98]"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#BBD915]" />
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-2xl bg-white border border-zinc-200/80 text-[#111827] hover:bg-zinc-50 font-extrabold text-xs px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-xs transition-all active:scale-[0.98]"
                >
                  <span>Log In</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 rounded-2xl bg-[#BBD915] text-[#111827] hover:bg-[#a8c413] font-black text-xs px-4 sm:px-5 py-2 sm:py-2.5 shadow-md transition-all active:scale-[0.98]"
                >
                  <UserPlus className="h-3.5 w-3.5 text-[#111827]" />
                  <span>Register</span>
                </Link>
              </div>
            )}

            {/* Mobile Contact Quick Icon (< sm screens) */}
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="p-2 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors sm:hidden"
              title="Contact Sales"
            >
              <Mail className="h-4 w-4 text-emerald-600" />
            </button>

            {/* Hamburger Menu Button - Visible on ALL screens below 1024px (< lg, including 636px-1014px tablets) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 sm:p-2.5 rounded-xl bg-zinc-100 text-[#111827] hover:bg-zinc-200 transition-colors lg:hidden flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-zinc-200 px-5 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3 text-xs font-black text-zinc-700 uppercase tracking-wider">
              <a 
                href="#live-operations" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1.5 px-3 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                Showcase
              </a>
              <a 
                href="#features" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1.5 px-3 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                Features
              </a>
              <a 
                href="#datamodel" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1.5 px-3 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                Data Model
              </a>
              <a 
                href="#pricing" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1.5 px-3 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                Pricing Tiers
              </a>
              <a 
                href="#metrics" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1.5 px-3 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                Metrics
              </a>
              <a 
                href="#testimonials" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1.5 px-3 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                Stories
              </a>
              <a 
                href="#faq" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1.5 px-3 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                FAQ
              </a>
            </nav>

            <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2.5">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#111827] text-white py-3 text-xs font-black shadow-sm"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-4 w-4 text-[#BBD915]" />
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-zinc-100 text-[#111827] py-2.5 text-xs font-black"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-[#BBD915] text-[#111827] py-2.5 text-xs font-black shadow-sm"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Register Free</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          
          <div className="space-y-5 sm:space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-zinc-200/80 px-3.5 sm:px-4 py-1.5 text-xs font-black text-[#111827] shadow-2xs max-w-full flex-wrap">
              <span className="bg-[#BBD915] text-[#111827] text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">7-DAY FREE TRIAL</span>
              <span className="text-[11px] sm:text-xs">Register up to 25 Customers Free</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#111827] tracking-tight leading-[1.15]">
              The Smartest Way to Manage Your <span className="bg-gradient-to-r from-[#111827] via-emerald-800 to-emerald-950 bg-clip-text text-transparent underline decoration-[#BBD915] decoration-4 underline-offset-8">Food Business.</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 font-semibold leading-relaxed max-w-xl">
              Simplify your meal kit business with automated billing, daily dispatch checklists, smarter deliveries, custom pricing matrices, and seamless growth tools.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#BBD915] text-[#111827] hover:bg-[#a8c413] font-black text-sm px-7 py-3.5 shadow-lg shadow-[#BBD915]/20 transition-all active:scale-[0.98] text-center"
              >
                <UserPlus className="h-4 w-4" />
                <span>Start 7-Day Free Trial</span>
              </Link>
              
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-2xl bg-white border border-zinc-200 text-[#111827] hover:bg-zinc-50 font-bold text-sm px-7 py-3.5 shadow-xs transition-all active:scale-[0.98] text-center"
              >
                <PlayCircle className="h-5 w-5 text-emerald-600" />
                <span>Login to Portal</span>
              </Link>
            </div>

            <div className="pt-5 border-t border-zinc-200/60 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold text-zinc-500">
              <span>Trusted by 4,000+ companies</span>
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          </div>

          {/* Hero Mockup Graphic */}
          <div className="relative w-full">
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-zinc-100 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-[11px] font-mono font-bold text-zinc-400 ml-1 sm:ml-2 truncate max-w-[150px] sm:max-w-none">serveflow.in/dashboard</span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-black bg-emerald-50 text-emerald-800 px-2 sm:px-2.5 py-0.5 rounded-full uppercase border border-emerald-200">
                  Live Dispatch System
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-zinc-50 p-3.5 sm:p-4 rounded-2xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Today&apos;s Dispatch</span>
                  <span className="text-xl sm:text-2xl font-black text-[#111827] block">142 Meals</span>
                </div>
                <div className="bg-zinc-50 p-3.5 sm:p-4 rounded-2xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">WhatsApp Sent</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 block">100% Skip Dups</span>
                </div>
              </div>

              <div className="bg-zinc-900 text-white rounded-2xl p-3.5 sm:p-4 space-y-2">
                <div className="flex flex-wrap justify-between items-center text-[11px] font-mono gap-1">
                  <span className="text-zinc-400">Dispatch Date: Today</span>
                  <span className="text-[#BBD915] font-bold">Categories: Breakfast, Lunch</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#BBD915] w-[85%]"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Brands Section */}
      <section className="py-10 bg-white border-y border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-6">Powering Next-Gen Food & Tech Companies</p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-75 grayscale hover:grayscale-0 transition-all text-lg font-black text-zinc-700">
            <span>Acme<span className="text-[#BBD915]">Corp</span></span>
            <span>Global<span className="text-[#BBD915]">Tech</span></span>
            <span>Nebula<span className="text-[#BBD915]">AI</span></span>
            <span>Dev<span className="text-[#BBD915]">Flow</span></span>
            <span>Stratos<span className="text-[#BBD915]">Cloud</span></span>
          </div>
        </div>
      </section>

      {/* 3.5 LIVE ANIMATED OPERATIONS SHOWCASE SECTION */}
      <section id="live-operations" className="py-16 sm:py-24 bg-[#111827] text-white relative overflow-hidden">
        {/* Ambient background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[200px] sm:h-[300px] bg-[#BBD915]/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-12 sm:space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] sm:text-xs font-extrabold text-[#BBD915] uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-[#BBD915]" />
              <span>Interactive Operations Showcase</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              See How Your Kitchen Runs on <span className="text-[#BBD915] underline decoration-wavy decoration-[#BBD915]/60 underline-offset-8">Autopilot</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-zinc-400 font-semibold leading-relaxed max-w-2xl mx-auto">
              From real-time order intake to thermal-packaged dispatch, manage every daily meal subscription workflow effortlessly.
            </p>
          </div>

          {/* Real-time Interactive Pipeline Workflow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Step 1: Order Intake */}
            <div className="relative group p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-[#BBD915]/60 transition-all duration-300 shadow-xl overflow-hidden hover:scale-[1.02]">
              <div className="absolute top-0 right-0 p-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-[#BBD915]/20 text-[#BBD915] border border-[#BBD915]/30 flex items-center justify-center mb-3 sm:mb-4 font-black text-sm sm:text-base">
                01
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">Order Intake</h3>
              <p className="text-xs text-zinc-400 font-semibold mt-1">Automatic sync from customer portal into kitchen queue.</p>
              
              <div className="mt-4 sm:mt-5 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 text-[11px] font-mono">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>#ORD-9482</span>
                  <span className="text-emerald-400 font-bold">Keto Plan</span>
                </div>
                <div className="flex items-center gap-2 text-white font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#BBD915]" />
                  <span>Breakfast + Lunch</span>
                </div>
              </div>
            </div>

            {/* Step 2: Chef Prep */}
            <div className="relative group p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-[#BBD915]/60 transition-all duration-300 shadow-xl overflow-hidden hover:scale-[1.02]">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-3 sm:mb-4 font-black text-sm sm:text-base">
                02
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">Chef Portioning</h3>
              <p className="text-xs text-zinc-400 font-semibold mt-1">Calorie-counted &amp; macro-balanced meal prep.</p>

              <div className="mt-4 sm:mt-5 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 text-[11px] font-mono">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Macros Locked</span>
                  <span className="text-amber-400 font-bold">540 kcal</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[85%] animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Step 3: Packaging */}
            <div className="relative group p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-[#BBD915]/60 transition-all duration-300 shadow-xl overflow-hidden hover:scale-[1.02]">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-3 sm:mb-4 font-black text-sm sm:text-base">
                03
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">Thermal Packaging</h3>
              <p className="text-xs text-zinc-400 font-semibold mt-1">Insulated thermal box tagging with customer details.</p>

              <div className="mt-4 sm:mt-5 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 text-[11px] font-mono">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Thermal Seal</span>
                  <span className="text-blue-400 font-bold">Zone B4</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                  <span>Barcode Printed</span>
                </div>
              </div>
            </div>

            {/* Step 4: Dispatch */}
            <div className="relative group p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-[#BBD915]/60 transition-all duration-300 shadow-xl overflow-hidden hover:scale-[1.02]">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3 sm:mb-4 font-black text-sm sm:text-base">
                04
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">Route Dispatch</h3>
              <p className="text-xs text-zinc-400 font-semibold mt-1">Insulated delivery driver dispatched to coordinates.</p>

              <div className="mt-4 sm:mt-5 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 text-[11px] font-mono">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Driver En Route</span>
                  <span className="text-emerald-400 font-bold">ETA 12m</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>On-Time Guarantee</span>
                </div>
              </div>
            </div>

          </div>

          {/* Interactive Feature Demo Tabbed Card */}
          <div className="bg-zinc-900/90 rounded-3xl border border-zinc-800 p-5 sm:p-6 md:p-8 shadow-2xl space-y-6 sm:space-y-8 backdrop-blur-md">
            
            {/* Tabs Control */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5 sm:pb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">Live Kitchen Operating System Preview</h3>
                <p className="text-xs text-zinc-400 font-semibold mt-1">Select a module below to preview the live interactive interface.</p>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 overflow-x-auto max-w-full w-full lg:w-auto">
                <button
                  onClick={() => setAnimTab('dispatch')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    animTab === 'dispatch' 
                      ? 'bg-[#BBD915] text-[#111827] shadow-md' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  Daily Dispatch Checklist
                </button>
                <button
                  onClick={() => setAnimTab('calendar')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    animTab === 'calendar' 
                      ? 'bg-[#BBD915] text-[#111827] shadow-md' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  Smart Calendar Skip
                </button>
                <button
                  onClick={() => setAnimTab('whatsapp')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    animTab === 'whatsapp' 
                      ? 'bg-[#BBD915] text-[#111827] shadow-md' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  WhatsApp Alerts
                </button>
                <button
                  onClick={() => setAnimTab('zones')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    animTab === 'zones' 
                      ? 'bg-[#BBD915] text-[#111827] shadow-md' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  Multi-Zone Routes
                </button>
              </div>
            </div>

            {/* Tab 1: Dispatch Checklist */}
            {animTab === 'dispatch' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center animate-in fade-in-50 duration-300">
                <div className="lg:col-span-5 space-y-3 sm:space-y-4 text-left">
                  <span className="text-[10px] font-black bg-[#BBD915]/20 text-[#BBD915] px-3 py-1 rounded-full uppercase tracking-wider border border-[#BBD915]/30 inline-block">
                    Automated Packing Lists
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-white">Daily Dispatch Checklist Matrix</h4>
                  <p className="text-xs sm:text-sm text-zinc-400 font-semibold leading-relaxed">
                    Automatically compile daily meal prep requirements, portion labels, and customer delivery routes with zero manual spreadsheet calculation errors.
                  </p>
                  <div className="space-y-2 pt-2 text-xs font-bold text-zinc-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#BBD915] shrink-0" />
                      <span>Categorized by Breakfast, Lunch &amp; Dinner</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#BBD915] shrink-0" />
                      <span>Instant PDF, Excel &amp; Thermal Printer Export</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-zinc-950 p-4 sm:p-6 rounded-3xl border border-zinc-800 space-y-3 sm:space-y-4 shadow-inner w-full">
                  <div className="flex flex-wrap justify-between items-center border-b border-zinc-800 pb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                      <span className="text-xs font-mono font-bold text-white">Today&apos;s Dispatch List</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                      Total: 184 Meals
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
                          ✓
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-white truncate">Rahul Sharma</div>
                          <div className="text-[10px] text-zinc-400 truncate">High Protein • Lunch • Zone A</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30 shrink-0">
                        PACKED
                      </span>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shrink-0">
                          ⏳
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-white truncate">Priya Sundaram</div>
                          <div className="text-[10px] text-zinc-400 truncate">Keto Plan • Lunch+Dinner • Zone B</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/30 shrink-0">
                        PORTIONING
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Smart Calendar */}
            {animTab === 'calendar' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center animate-in fade-in-50 duration-300">
                <div className="lg:col-span-5 space-y-3 sm:space-y-4 text-left">
                  <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-500/30 inline-block">
                    Self-Service Flexibility
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-white">Smart Pause &amp; Date Skip Calendar</h4>
                  <p className="text-xs sm:text-sm text-zinc-400 font-semibold leading-relaxed">
                    Customers can pause dates or skip specific meal times directly from their portal. Subscriptions auto-extend without kitchen revenue loss.
                  </p>
                </div>

                <div className="lg:col-span-7 bg-zinc-950 p-4 sm:p-6 rounded-3xl border border-zinc-800 space-y-3 sm:space-y-4 shadow-inner w-full">
                  <div className="flex flex-wrap justify-between items-center border-b border-zinc-800 pb-3 text-xs gap-1">
                    <span className="font-mono text-zinc-400">Customer Calendar Management</span>
                    <span className="text-[#BBD915] font-bold">Auto-Extended by 3 Days</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-mono">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                      <div key={d} className="text-zinc-500 font-bold py-1 text-[9px] sm:text-[10px] uppercase">{d}</div>
                    ))}
                    {[12, 13, 14, 15, 16, 17, 18].map(day => (
                      <div 
                        key={day} 
                        className={`p-2 sm:p-3 rounded-xl border text-[11px] sm:text-xs font-bold transition-all ${
                          day === 14 
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                            : day === 15 
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 line-through' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: WhatsApp Alerts */}
            {animTab === 'whatsapp' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center animate-in fade-in-50 duration-300">
                <div className="lg:col-span-5 space-y-3 sm:space-y-4 text-left">
                  <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-500/30 inline-block">
                    Automated Engagement
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-white">WhatsApp &amp; SMS Dispatch Notifications</h4>
                  <p className="text-xs sm:text-sm text-zinc-400 font-semibold leading-relaxed">
                    Keep subscribers updated automatically with thermal dispatch notifications, delivery tracking links, and renewal reminders.
                  </p>
                </div>

                <div className="lg:col-span-7 bg-zinc-950 p-4 sm:p-6 rounded-3xl border border-zinc-800 space-y-4 shadow-inner max-w-sm mx-auto w-full">
                  <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-xs space-y-1.5 text-left">
                    <div className="flex justify-between items-center text-[10px] text-emerald-400 font-bold">
                      <span>WhatsApp Notification</span>
                      <span>12:04 PM</span>
                    </div>
                    <p className="text-emerald-100 font-medium text-[11px] leading-relaxed">
                      🥗 <strong>Cloud Kitchen:</strong> Hi Rahul! Your hot lunch meal has been thermal sealed &amp; dispatched. Track your delivery en route.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Multi-Zone Routes */}
            {animTab === 'zones' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center animate-in fade-in-50 duration-300">
                <div className="lg:col-span-5 space-y-3 sm:space-y-4 text-left">
                  <span className="text-[10px] font-black bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full uppercase tracking-wider border border-purple-500/30 inline-block">
                    Smart Logistics
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-white">Multi-Zone Route &amp; Charges Control</h4>
                  <p className="text-xs sm:text-sm text-zinc-400 font-semibold leading-relaxed">
                    Define custom delivery zones by pincode or area, automatically applying specific delivery fees and route grouping.
                  </p>
                </div>

                <div className="lg:col-span-7 bg-zinc-950 p-4 sm:p-6 rounded-3xl border border-zinc-800 space-y-3 shadow-inner w-full">
                  <div className="p-3 sm:p-3.5 bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono gap-1 sm:gap-2">
                    <span className="text-white font-bold">Zone 1: Central City (600001 - 600010)</span>
                    <span className="text-emerald-400 font-bold shrink-0">Free Delivery</span>
                  </div>
                  <div className="p-3 sm:p-3.5 bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono gap-1 sm:gap-2">
                    <span className="text-white font-bold">Zone 2: Outer Ring (600011 - 600030)</span>
                    <span className="text-[#BBD915] font-bold shrink-0">₹40 / Delivery</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Animated Metrics Ticker Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 pt-2 sm:pt-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-1">
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-[#BBD915]">1,482+</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Meals Cooked Today</span>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-1">
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-white">348</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Active Subscribers</span>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-1">
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-400">99.9%</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">On-Time Delivery</span>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-1">
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-amber-400">4.95 ★</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Satisfaction Rate</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Data Model Section */}
      <section id="datamodel" className="py-16 sm:py-20 bg-[#F9FBE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          <div className="space-y-5 sm:space-y-6">
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wider inline-block">
              Data Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111827] leading-tight">
              The Ultimate Data Model for Go-to-Market Success
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-semibold leading-relaxed">
              Leverage insights from your business, customer, and product data to drive and enhance your team&apos;s performance and success.
            </p>

            <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
              <div className="flex items-start gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs">
                <div className="p-2.5 sm:p-3 rounded-xl bg-[#BBD915]/20 text-[#111827] shrink-0">
                  <Sliders className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#111827]">Custom Attributes</h4>
                  <p className="text-xs text-zinc-500 font-semibold mt-0.5">Store and update any kind of data your subscription business needs.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs">
                <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#111827]">Activity Timelines</h4>
                  <p className="text-xs text-zinc-500 font-semibold mt-0.5">Get instant visibility into the full history of every order &amp; dispatch interaction.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs">
                <div className="p-2.5 sm:p-3 rounded-xl bg-blue-100 text-blue-800 shrink-0">
                  <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#111827]">Detailed Views</h4>
                  <p className="text-xs text-zinc-500 font-semibold mt-0.5">From customer profiles to dispatch matrices, visualize your data the way that works for you.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Data Model Card */}
          <div className="bg-white p-5 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-xl space-y-5 sm:space-y-6 w-full">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-900 text-white">
                  <Building2 className="h-5 w-5 text-[#BBD915]" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-[#111827]">Company Multi-Tenant Isolation</h4>
                  <span className="text-xs text-zinc-400 font-bold">Scoped by Company ID</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-3 text-xs font-bold text-zinc-700">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 gap-1 sm:gap-2">
                <span className="flex items-center gap-2"><Building2 className="h-4 w-4 text-zinc-400 shrink-0" /> Active Customers</span>
                <span className="text-emerald-700 font-extrabold">20 Available Attributes</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 gap-1 sm:gap-2">
                <span className="flex items-center gap-2"><Layers className="h-4 w-4 text-zinc-400 shrink-0" /> Meal Categories</span>
                <span className="text-emerald-700 font-extrabold">Breakfast, Lunch, Dinner, Snacks</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 gap-1 sm:gap-2">
                <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-zinc-400 shrink-0" /> Delivery Coverage Areas</span>
                <span className="text-emerald-700 font-extrabold">Multi-Zone Pin Codes</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Features Section */}
      <section id="features" className="py-16 sm:py-20 bg-white border-y border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider block">Features</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111827] mt-1 leading-tight">
              Everything You Need to Scale Your Operations
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            
            <div className="bg-zinc-50/80 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 space-y-3">
              <div className="p-3.5 rounded-2xl bg-blue-100 text-blue-800 w-fit">
                <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#111827]">Unified Dashboard</h3>
              <p className="text-xs text-zinc-600 font-semibold leading-relaxed">
                Track all your subscriptions, customer orders, and kitchen team interactions in one centralized, customizable view.
              </p>
            </div>

            <div className="bg-zinc-50/80 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 space-y-3">
              <div className="p-3.5 rounded-2xl bg-purple-100 text-purple-800 w-fit">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#111827]">Daily Dispatch Checklist</h3>
              <p className="text-xs text-zinc-600 font-semibold leading-relaxed">
                Auto-generate courier dispatch order lists for target dates with meal category filters and 1-click status updates.
              </p>
            </div>

            <div className="bg-zinc-50/80 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 space-y-3">
              <div className="p-3.5 rounded-2xl bg-pink-100 text-pink-800 w-fit">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#111827]">Enterprise Security</h3>
              <p className="text-xs text-zinc-600 font-semibold leading-relaxed">
                Multi-tenant isolation, role permission controls, and permanent access token credentials ensure your data stays safe.
              </p>
            </div>

            <div className="bg-zinc-50/80 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-100 text-amber-800 w-fit">
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#111827]">Real-time Collaboration</h3>
              <p className="text-xs text-zinc-600 font-semibold leading-relaxed">
                Assign staff sub-accounts with granular module permissions so team members work together seamlessly.
              </p>
            </div>

            <div className="bg-zinc-50/80 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 space-y-3">
              <div className="p-3.5 rounded-2xl bg-cyan-100 text-cyan-800 w-fit">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#111827]">Advanced Analytics</h3>
              <p className="text-xs text-zinc-600 font-semibold leading-relaxed">
                Gain deep insights into subscription renewal rates, revenue trends, and kitchen dispatch bottlenecks.
              </p>
            </div>

            <div className="bg-zinc-50/80 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 space-y-3">
              <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-800 w-fit">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#111827]">WhatsApp Cloud API</h3>
              <p className="text-xs text-zinc-600 font-semibold leading-relaxed">
                Send dispatch alerts directly to customer WhatsApp numbers with log history tracking and duplicate send prevention.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Plan Type Showcase Section */}
      <section id="plan-types" className="py-16 sm:py-20 bg-white border-y border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider block">Flexible Plan Structures</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111827] mt-2 leading-tight">
              Choose How You Structure Your Pricing
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-semibold mt-2 max-w-xl mx-auto">
              serveflow.in supports two powerful plan types. Pick the structure that fits your kitchen business model when you register.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">

            {/* --- PLAN TYPE 2: PRICE CARD --- */}
            <div className="rounded-3xl border-2 border-zinc-200 bg-[#F9FBE7] p-5 sm:p-8 flex flex-col gap-5 sm:gap-6 hover:border-[#BBD915] hover:shadow-xl transition-all group">

              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#111827] bg-[#BBD915] px-3 py-1 rounded-full inline-block">Plan Type 2</span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#111827] mt-3">Price Card</h3>
                  <p className="text-xs text-zinc-500 font-semibold mt-1">Simple, flat-rate plan cards with monthly billing.</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-2xl bg-[#BBD915]/20 shrink-0">
                  <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6 text-[#111827]" />
                </div>
              </div>

              {/* Demo Preview — 3 mini cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { label: 'Basic', price: '₹999', color: 'bg-zinc-100 border-zinc-200', badge: '' },
                  { label: 'Standard', price: '₹1,799', color: 'bg-white border-[#BBD915] ring-2 ring-[#BBD915]/20', badge: '★ Popular' },
                  { label: 'Premium', price: '₹2,499', color: 'bg-zinc-100 border-zinc-200', badge: '' },
                ].map((card) => (
                  <div key={card.label} className={`relative rounded-2xl border p-2 sm:p-3 text-center ${card.color}`}>
                    {card.badge && (
                      <span className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] font-black bg-[#BBD915] text-[#111827] px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">{card.badge}</span>
                    )}
                    <span className="text-[9px] sm:text-[10px] font-black text-zinc-500 block mt-1">{card.label}</span>
                    <span className="text-sm sm:text-base font-black text-[#111827] block">{card.price}</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-zinc-400">/month</span>
                    <div className="mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1">
                      <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-bold text-zinc-600 justify-center"><Check className="h-2.5 w-2.5 text-emerald-500 shrink-0" /> 30 meals</div>
                      <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-bold text-zinc-600 justify-center"><Check className="h-2.5 w-2.5 text-emerald-500 shrink-0" /> Delivery</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="space-y-2">
                {[
                  'Fixed monthly plan tiers',
                  'Simple one-click plan selection',
                  'Monthly billing only',
                  'Customize your plan easily',
                  'Ideal for standard tiffin services',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-xs font-bold text-zinc-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link href="/register" className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111827] text-white hover:bg-zinc-800 font-black text-xs px-6 py-3.5 shadow-sm transition-all active:scale-[0.98]">
                <UserPlus className="h-4 w-4 text-[#BBD915]" />
                <span>Register with Price Card</span>
              </Link>
            </div>

            {/* --- PLAN TYPE 3: PRICE MATRIX (Interactive Calculator) --- */}
            <div className="rounded-3xl border-2 border-zinc-200 bg-[#F9FBE7] p-5 sm:p-8 flex flex-col gap-5 sm:gap-6 hover:border-emerald-500 hover:shadow-xl transition-all">

              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-white bg-emerald-700 px-3 py-1 rounded-full inline-block">Plan Type 3</span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#111827] mt-3">Price Matrix</h3>
                  <p className="text-xs text-zinc-500 font-semibold mt-1">Fully customizable pricing with diet type, plan duration &amp; tier combinations.</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-100 shrink-0">
                  <Sliders className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-700" />
                </div>
              </div>

              {/* Interactive Calculator Widget */}
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 sm:p-5 space-y-4 sm:space-y-5 shadow-xs">
                <h4 className="text-xs font-black text-[#111827] flex items-center gap-2 border-b border-zinc-100 pb-3">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                  Interactive Pricing Calculator
                </h4>

                {/* Diet Blueprint */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Diet Blueprint</label>
                  <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-200 gap-1">
                    {['Veg', 'Non-Veg', 'Jain'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setCalcDiet(d)}
                        className={`flex-1 text-center py-1.5 sm:py-2 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                          calcDiet === d ? 'bg-[#BBD915] text-[#111827] border border-[#111827]/10 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Duration</label>
                  <div className="flex gap-1.5 sm:gap-2">
                    {[1, 3, 6, 12].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setCalcDuration(d)}
                        className={`flex-1 py-1.5 sm:py-2 text-[10px] font-black rounded-xl border transition-all cursor-pointer ${
                          calcDuration === d
                            ? 'bg-[#BBD915] border-[#111827] text-[#111827] shadow-sm'
                            : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'
                        }`}
                      >
                        {d}M
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tier */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Plan Tier</label>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {[{ key: 'basic', label: 'Basic' }, { key: 'standard', label: 'Standard' }, { key: 'premium', label: 'Premium' }].map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setCalcTier(t.key)}
                        className={`py-2 sm:py-2.5 text-[10px] font-black rounded-xl border transition-all cursor-pointer ${
                          calcTier === t.key
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                            : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Price Output */}
                <div className="bg-zinc-900 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">Estimated Total</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl sm:text-2xl font-black text-white">₹{calcPrice.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-bold text-zinc-400">/ {calcDuration} month{calcDuration > 1 ? 's' : ''}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-semibold mt-0.5 block">
                      {calcDiet} • {calcDuration}M • {calcTier.charAt(0).toUpperCase() + calcTier.slice(1)}
                    </span>
                  </div>
                  <Link
                    href="/register"
                    className="w-full sm:w-auto text-center shrink-0 rounded-xl bg-[#BBD915] hover:bg-[#a8c413] text-[#111827] px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-[0.98] whitespace-nowrap"
                  >
                    Register
                  </Link>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                {[
                  'Veg / Non-Veg / Jain diet type pricing',
                  '1, 3, 6, 12-month duration tiers',
                  'Basic / Standard / Premium per matrix cell',
                  'Ideal for meal kit & subscription boxes',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-xs font-bold text-zinc-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link href="/register" className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 text-white hover:bg-emerald-800 font-black text-xs px-6 py-3.5 shadow-sm transition-all active:scale-[0.98]">
                <UserPlus className="h-4 w-4 text-white" />
                <span>Register with Price Matrix</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Pricing Section (THE CORE REQUIREMENT WITH 20% DISCOUNT) */}
      <section id="pricing" className="py-16 sm:py-20 bg-[#F9FBE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wider inline-block">
              Transparent SaaS Pricing Tiers
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111827] mt-3 leading-tight">
              Simple, Predictable Pricing for Kitchens of Any Scale
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-semibold mt-2">
              Every tier unlocks <strong className="text-[#111827]">100% of all Admin Features</strong>. Choose based on your active customer subscriber capacity.
            </p>

            {/* 7-Day Free Trial Announcement Card */}
            <div className="bg-[#111827] text-white rounded-3xl p-5 sm:p-8 mt-6 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 shadow-xl text-left">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-[#BBD915] text-[#111827] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>7-DAY FREE TRIAL INCLUDED ON REGISTER</span>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white">
                  Register Now &amp; Get 7 Days Free Trial (Up to 25 Customers)
                </h3>
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed max-w-2xl">
                  Every new kitchen company gets <strong className="text-white">7 Days of 100% Free Access</strong> for up to 25 active registered customers. Once the 7-day trial ends, features are disabled until you subscribe to any plan below.
                </p>
              </div>

              <Link
                href="/register"
                className="w-full md:w-auto text-center shrink-0 rounded-2xl bg-[#BBD915] hover:bg-[#a8c413] text-[#111827] px-6 py-3.5 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.98] whitespace-nowrap flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Start Free Trial</span>
              </Link>
            </div>

            {/* Monthly vs. Yearly Toggle Switch (20% DISCOUNT) */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 flex-wrap">
              <span className={`text-xs font-extrabold ${!isYearly ? 'text-[#111827]' : 'text-zinc-400'}`}>
                Monthly Billing
              </span>

              <button
                type="button"
                onClick={() => setIsYearly(!isYearly)}
                className="relative inline-flex h-8 w-16 items-center rounded-full bg-zinc-900 p-1 transition-colors focus:outline-none cursor-pointer"
                aria-label="Toggle annual billing"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-[#BBD915] transition-transform ${
                    isYearly ? 'translate-x-8' : 'translate-x-0'
                  }`}
                />
              </button>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold ${isYearly ? 'text-[#111827]' : 'text-zinc-400'}`}>
                  Yearly Billing
                </span>
                <span className="bg-[#BBD915] text-[#111827] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-[#111827]/10 animate-bounce">
                  Save 20% OFF
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
            {plans.map((plan) => {
              const displayPrice = typeof plan.monthlyPrice === 'number'
                ? (isYearly ? plan.yearlyPrice : plan.monthlyPrice)
                : plan.monthlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-5 sm:p-6 md:p-7 flex flex-col justify-between transition-all duration-200 relative ${
                    plan.highlight
                      ? 'bg-white border-2 border-[#BBD915] shadow-xl ring-4 ring-[#BBD915]/20 scale-[1.01] sm:scale-[1.02] z-10'
                      : 'bg-white border border-zinc-200/80 hover:border-zinc-300 shadow-xs'
                  }`}
                >
                  {/* Top Badge */}
                  {plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#BBD915] text-[#111827] text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3.5 sm:px-4 py-1 rounded-full border border-[#111827]/10 flex items-center gap-1 shadow-sm whitespace-nowrap">
                      <Star className="h-3.5 w-3.5 fill-[#111827]" />
                      <span>{plan.badge}</span>
                    </div>
                  )}

                  <div>
                    {/* Header Details */}
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-[#111827]">{plan.name}</h3>
                        <span className="text-[11px] sm:text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80 inline-block mt-1">
                          {plan.capacity}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-500 font-semibold leading-relaxed mb-4 sm:mb-6">
                      {plan.description}
                    </p>

                    {/* Price Display */}
                    <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-zinc-200/60">
                      {typeof displayPrice === 'number' ? (
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-black text-[#111827]">
                              ₹{displayPrice.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs font-bold text-zinc-500">/ month</span>
                          </div>
                          {isYearly && (
                            <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-700 block mt-1">
                              Billed annually (Save ₹{plan.savings.toLocaleString('en-IN')}/yr)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-2xl sm:text-3xl font-black text-[#111827]">Custom Quote</span>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                      <span className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 tracking-wider block mb-1">
                        What&apos;s Included:
                      </span>
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs font-bold text-zinc-700">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  {plan.id === 'enterprise' ? (
                    <button
                      type="button"
                      onClick={() => setIsContactModalOpen(true)}
                      className="w-full py-3 sm:py-3.5 px-4 rounded-2xl text-xs font-black text-center transition-all shadow-sm active:scale-[0.98] bg-[#111827] text-white hover:bg-zinc-800 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Mail className="h-4 w-4 text-[#BBD915]" />
                      <span>Contact Sales</span>
                    </button>
                  ) : (
                    <Link
                      href="/register"
                      className={`w-full py-3 sm:py-3.5 px-4 rounded-2xl text-xs font-black text-center transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 ${
                        plan.highlight
                          ? 'bg-[#BBD915] text-[#111827] hover:bg-[#a8c413] shadow-md'
                          : 'bg-[#111827] text-white hover:bg-zinc-800'
                      }`}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Start 7-Day Free Trial</span>
                    </Link>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 7. WhatsApp Add-on Module */}
      <section id="addons" className="py-12 sm:py-16 bg-white border-y border-zinc-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="bg-[#F9FBE7] rounded-3xl border border-zinc-200/80 p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
              
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-black border border-emerald-200">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  <span>RECOMMENDED ADD-ON MODULE</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-[#111827] leading-tight">
                  Meta WhatsApp Cloud API Integration Add-on
                </h3>

                <p className="text-xs sm:text-sm text-zinc-600 font-semibold leading-relaxed">
                  Enable automated WhatsApp dispatch alerts, daily order delivery status notifications, and customer subscription renewals directly from your official WhatsApp Business number.
                </p>

                <div className="flex flex-wrap gap-3 sm:gap-4 pt-2 text-xs font-bold text-zinc-700">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-600 stroke-[3px]" />
                    <span>Official Meta API Token Support</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-600 stroke-[3px]" />
                    <span>Custom Template Manager</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-600 stroke-[3px]" />
                    <span>100% Duplicate Prevention</span>
                  </div>
                </div>
              </div>

              {/* Addon Pricing Box */}
              <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 sm:p-6 w-full lg:w-72 shrink-0 text-center space-y-3 sm:space-y-4 shadow-sm">
                <span className="text-xs text-zinc-400 font-bold uppercase block">Add-on Pricing</span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-[#111827]">₹999</span>
                  <span className="text-xs font-bold text-zinc-500">/ month</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-extrabold block">
                  Addable to any subscription plan
                </span>

                <Link
                  href="/login"
                  className="block w-full py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  Include WhatsApp Add-on
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 8. Custom Design & Work-Based Charges Section */}
      <section id="custom-design" className="py-16 sm:py-20 bg-[#111827] text-white border-y border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 rounded-3xl border border-zinc-800 p-6 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden">
            
            {/* Top Badge & Header */}
            <div className="max-w-3xl space-y-3 sm:space-y-4 mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 bg-[#BBD915]/10 text-[#BBD915] px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-black border border-[#BBD915]/30">
                <Sliders className="h-4 w-4 text-[#BBD915]" />
                <span>BESPOKE CUSTOM DESIGN &amp; FEATURE SERVICES</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
                Need Custom Themes, Tailored UI or Specialized Workflows?
              </h2>

              <p className="text-xs sm:text-sm text-zinc-400 font-semibold leading-relaxed">
                Beyond our standard SaaS subscription tiers, we offer custom design and bespoke software development tailored to your exact kitchen business model. <strong className="text-white">Customization charges are calculated based strictly on your scope of work</strong> — ensuring transparent, milestone-based pricing for your bespoke requirements.
              </p>
            </div>

            {/* 4 Feature Cards Explaining Work-Based Charges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-2.5 sm:space-y-3 hover:border-[#BBD915]/50 transition-all group">
                <div className="p-3 rounded-xl bg-[#BBD915]/10 text-[#BBD915] w-fit group-hover:bg-[#BBD915] group-hover:text-[#111827] transition-all">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-white">Transparent Scope Quotes</h3>
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                  Upfront cost estimation calculated strictly from your agreed wireframes, design complexity, and functional scope.
                </p>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-2.5 sm:space-y-3 hover:border-[#BBD915]/50 transition-all group">
                <div className="p-3 rounded-xl bg-[#BBD915]/10 text-[#BBD915] w-fit group-hover:bg-[#BBD915] group-hover:text-[#111827] transition-all">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-white">Custom Brand UI &amp; Themes</h3>
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                  Dedicated brand color palettes, custom typography styling, logo integration, and custom domain setup.
                </p>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-2.5 sm:space-y-3 hover:border-[#BBD915]/50 transition-all group">
                <div className="p-3 rounded-xl bg-[#BBD915]/10 text-[#BBD915] w-fit group-hover:bg-[#BBD915] group-hover:text-[#111827] transition-all">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-white">Custom Business Logic</h3>
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                  Tailored meal matrix pricing rules, bespoke invoice templates, or custom third-party ERP &amp; gateway integrations.
                </p>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-2.5 sm:space-y-3 hover:border-[#BBD915]/50 transition-all group">
                <div className="p-3 rounded-xl bg-[#BBD915]/10 text-[#BBD915] w-fit group-hover:bg-[#BBD915] group-hover:text-[#111827] transition-all">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-white">Milestone Payment Plan</h3>
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                  Stage-by-stage delivery payments tied to verified milestones, with dedicated developer support &amp; QA validation.
                </p>
              </div>

            </div>

            {/* Bottom CTA Banner */}
            <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#BBD915] animate-ping shrink-0" />
                <p className="text-xs text-zinc-300 font-bold">
                  Have custom design ideas or specific feature requests? Contact our team for a free scope evaluation &amp; quote.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="w-full sm:w-auto shrink-0 rounded-2xl bg-[#BBD915] hover:bg-[#a8c413] text-[#111827] px-6 py-3.5 text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-[0.98] text-center cursor-pointer"
              >
                Request Custom Design Quote
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 9. Metrics Section */}
      <section id="metrics" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-10 sm:space-y-12">
          <div>
            <span className="text-xs font-extrabold text-[#BBD915] bg-[#111827] px-3.5 py-1 rounded-full uppercase tracking-wider inline-block">Growth Metrics</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111827] mt-3 leading-tight">Our Impact by the Numbers</h2>
            <p className="text-xs text-zinc-500 font-semibold mt-1">Trusted by thousands of teams to scale operations reliably.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 bg-zinc-50 rounded-3xl border border-zinc-200/80">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111827]">10,000+</span>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-500 mt-1 uppercase">Active Users</p>
            </div>
            <div className="p-4 sm:p-6 bg-zinc-50 rounded-3xl border border-zinc-200/80">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-600">99.9%</span>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-500 mt-1 uppercase">Uptime SLA</p>
            </div>
            <div className="p-4 sm:p-6 bg-zinc-50 rounded-3xl border border-zinc-200/80">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111827]">24/7</span>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-500 mt-1 uppercase">Expert Support</p>
            </div>
            <div className="p-4 sm:p-6 bg-zinc-50 rounded-3xl border border-zinc-200/80">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111827]">500M+</span>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-500 mt-1 uppercase">Requests Processed</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section id="faq" className="py-16 sm:py-20 bg-[#F9FBE7] border-t border-zinc-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider block">FAQ</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111827] mt-1">Common Questions</h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-2xs">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-black text-xs sm:text-sm text-[#111827] flex justify-between items-center gap-4 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>

                {activeFaq === idx && (
                  <div className="p-4 sm:p-5 pt-0 text-xs font-semibold text-zinc-600 leading-relaxed border-t border-zinc-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-[#111827] text-white py-10 sm:py-12 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="serveflow.in logo" 
              className="h-9 w-9 rounded-xl object-contain shrink-0 bg-white/10 p-0.5" 
            />
            <div>
              <span className="text-sm font-black text-white block">serveflow.in</span>
              <span className="text-[10px] text-zinc-400 font-semibold">© 2026 serveflow.in. All rights reserved. SaaS Provider for Meal Subscription Businesses.</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-zinc-400">
            <Link href="/login" className="hover:text-white transition-colors">Admin Login</Link>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a>
            <a href="#addons" className="hover:text-white transition-colors">WhatsApp Add-on</a>
          </div>
        </div>
      </footer>

      {/* 11. Interactive Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/40 backdrop-blur-sm overflow-y-auto">
          <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-zinc-200/80 p-5 sm:p-8 animate-in fade-in-50 duration-200 text-[#111827] my-auto max-h-[92vh] overflow-y-auto">
            
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5 sm:mb-6 border-b border-zinc-100 pb-4 pr-8">
              <h3 className="text-lg sm:text-xl font-black flex items-center gap-2">
                <Send className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 shrink-0" />
                <span>Get in Touch with Sales</span>
              </h3>
              <p className="text-xs text-zinc-500 font-semibold mt-1">
                Fill out the form below and our team will respond shortly.
              </p>
            </div>

            {contactSent ? (
              <div className="py-8 text-center space-y-3">
                <div className="p-3.5 rounded-full bg-emerald-50 text-emerald-600 w-fit mx-auto border border-emerald-200">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-base font-black text-[#111827]">Message Sent Successfully!</h4>
                <p className="text-xs text-zinc-500 font-semibold">Thank you for reaching out. We will contact you back shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                {contactError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                    {contactError}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-[#111827] focus:border-zinc-400 focus:outline-none bg-zinc-50/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Phone Number (10 Digits)</label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="e.g. 9876543210"
                      className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-[#111827] focus:border-zinc-400 focus:outline-none bg-zinc-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-[#111827] focus:border-zinc-400 focus:outline-none bg-zinc-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="How can we help you scale your kitchen operations?"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-[#111827] focus:border-zinc-400 focus:outline-none bg-zinc-50/50"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2.5 sm:gap-3 pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(false)}
                    className="rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-6 py-2.5 text-xs font-bold transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-[#BBD915] text-[#111827] hover:bg-[#a8c413] px-8 py-2.5 text-xs font-black shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Send Message</span>
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
