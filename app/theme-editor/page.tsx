'use client';

import { useState, useEffect } from 'react';
import { 
  Palette, Image as ImageIcon, LayoutTemplate, Phone, Globe, 
  Save, Check, ExternalLink, Upload, Eye, X, 
  Smartphone, Monitor, Tablet, ArrowRight, ShieldCheck, RefreshCw,
  FileText, CheckCircle2, AlertCircle, ChevronRight, Layers
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import PermissionGuard from '../components/PermissionGuard';

const THEMES = [
  {
    id: 'default',
    name: 'Theme 0 — Citrus Lime Minimalist',
    tagline: 'Modern & Clean Macro Nutrition',
    primaryColor: '#BBD915',
    accentColor: '#111827',
    bgColor: '#F9FBE7',
    previewUrl: 'http://localhost:3000/?theme=default',
    tags: ['Fresh', 'Minimalist', 'Organic', 'Modern'],
  },
  {
    id: '1',
    name: 'Theme 1 — Warm Rose Bistro',
    tagline: 'Artisan Bistro & Gourmet Dining',
    primaryColor: '#F43F5E',
    accentColor: '#1A1A1A',
    bgColor: '#FFF9F6',
    previewUrl: 'http://localhost:3000/home-1?theme=1',
    tags: ['Bistro', 'Artisan', 'Warm', 'Serif'],
  },
  {
    id: '2',
    name: 'Theme 2 — Deep Forest Emerald & Terracotta',
    tagline: 'Farm-to-Table Express & Fresh Harvest',
    primaryColor: '#E06A4E',
    accentColor: '#0B4F37',
    bgColor: '#FDF5EC',
    previewUrl: 'http://localhost:3000/home-2?theme=2',
    tags: ['Farm Fresh', 'Emerald', 'Express', 'Rustic'],
  },
  {
    id: '3',
    name: 'Theme 3 — Dark Espresso & Golden Amber',
    tagline: 'Tech-Forward Cyber Kitchen & Meal Lab',
    primaryColor: '#FFB800',
    accentColor: '#1C100B',
    bgColor: '#2D1810',
    previewUrl: 'http://localhost:3000/home-3?theme=3',
    tags: ['Dark Mode', 'Cyber', 'Gold', 'Tech'],
  },
  {
    id: '4',
    name: 'Theme 4 — Midnight Slate & Electric Indigo',
    tagline: 'High-Performance Athlete Nutrition',
    primaryColor: '#6366F1',
    accentColor: '#1E1B4B',
    bgColor: '#F3F0FF',
    previewUrl: 'http://localhost:3000/home-4?theme=4',
    tags: ['Fitness', 'Indigo', 'High-Protein', 'Athletic'],
  },
  {
    id: '5',
    name: 'Theme 5 — Onyx Black & Fiery Crimson',
    tagline: 'Bold Flavor Feast & Gourmet Nights',
    primaryColor: '#FF385C',
    accentColor: '#0F0F11',
    bgColor: '#18181B',
    previewUrl: 'http://localhost:3000/home-5?theme=5',
    tags: ['Bold', 'Crimson', 'Luxury', 'Dark UI'],
  },
  {
    id: '6',
    name: 'Theme 6 — Bubblegum Pink & Royal Purple',
    tagline: 'Joyful & Vibrant Lifestyle Food Delivery',
    primaryColor: '#EC4899',
    accentColor: '#581C87',
    bgColor: '#FDF2F8',
    previewUrl: 'http://localhost:3000/home-6?theme=6',
    tags: ['Vibrant', 'Playful', 'Pink & Purple', 'Gen-Z'],
  },
];

export default function ThemeAndContentEditorPage() {
  const [activeTab, setActiveTab] = useState<'theme' | 'branding' | 'hero' | 'about' | 'contact' | 'footer'>('theme');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [companyId, setCompanyId] = useState('');

  // Live preview popup modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewDeviceMode, setPreviewDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Form State
  const [theme, setTheme] = useState('default');
  const [brandName, setBrandName] = useState('');
  const [tagline, setTagline] = useState('');
  const [desktopLogo, setDesktopLogo] = useState('');
  const [mobileLogo, setMobileLogo] = useState('');
  const [favicon, setFavicon] = useState('');

  // Hero Section
  const [heroBadge, setHeroBadge] = useState('🌱 100% ORGANIC & CHEF-CRAFTED');
  const [heroHeadline, setHeroHeadline] = useState('Healthy, Chef-Prepared Meals Delivered Daily');
  const [heroSubheadline, setHeroSubheadline] = useState('Nutritious, portion-controlled meals designed by expert nutritionists and cooked fresh each morning.');
  const [heroPrimaryCtaText, setHeroPrimaryCtaText] = useState('Explore Meal Plans');
  const [heroPrimaryCtaLink, setHeroPrimaryCtaLink] = useState('#pricing');
  const [heroSecondaryCtaText, setHeroSecondaryCtaText] = useState('Calculate Custom Plan');
  const [heroSecondaryCtaLink, setHeroSecondaryCtaLink] = useState('#estimator');
  const [heroImage, setHeroImage] = useState('');

  // About Section
  const [aboutBadge, setAboutBadge] = useState('OUR STORY & PHILOSOPHY');
  const [aboutTitle, setAboutTitle] = useState('Crafting Wholesome Nutrition For Modern Lifestyles');
  const [aboutSubtitle, setAboutSubtitle] = useState('We make healthy eating effortless, delicious, and consistent every single day.');
  const [aboutPara1, setAboutPara1] = useState('Our mission is to help busy individuals and families maintain peak health without spending hours grocery shopping, prepping, or cooking.');
  const [aboutPara2, setAboutPara2] = useState('Every meal is crafted using farm-fresh ingredients, zero artificial additives, and strict macro calculations.');
  const [aboutHighlight1, setAboutHighlight1] = useState('100% Farm Fresh Organic Produce');
  const [aboutHighlight2, setAboutHighlight2] = useState('Calorie & Macro-Balanced by Nutritionists');
  const [aboutHighlight3, setAboutHighlight3] = useState('Daily Morning Delivery Before 8:30 AM');
  const [aboutImage, setAboutImage] = useState('');

  // Contact & Delivery Section
  const [supportPhone, setSupportPhone] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [deliveryTiming, setDeliveryTiming] = useState('6:00 AM – 9:00 AM Daily');
  const [kitchenAddress, setKitchenAddress] = useState('');

  // Footer Section
  const [footerAbout, setFooterAbout] = useState('100% Organic, macro-balanced daily meal delivery straight to your doorstep.');
  const [copyrightText, setCopyrightText] = useState(`© ${new Date().getFullYear()} All Rights Reserved.`);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const currentThemeObj = THEMES.find(t => {
    const rawT = String(theme || 'default').toLowerCase().trim();
    if (t.id === rawT) return true;
    if (t.id === '1' && (rawT === '1' || rawT === 'theme-1' || rawT === 'home-1' || rawT === 'bistro')) return true;
    if (t.id === '2' && (rawT === '2' || rawT === 'theme-2' || rawT === 'home-2' || rawT === 'zeal')) return true;
    if (t.id === '3' && (rawT === '3' || rawT === 'theme-3' || rawT === 'home-3' || rawT === 'brewlab')) return true;
    if (t.id === '4' && (rawT === '4' || rawT === 'theme-4' || rawT === 'home-4' || rawT === 'tech')) return true;
    if (t.id === '5' && (rawT === '5' || rawT === 'theme-5' || rawT === 'home-5' || rawT === 'gourmet')) return true;
    if (t.id === '6' && (rawT === '6' || rawT === 'theme-6' || rawT === 'home-6' || rawT === 'joyfest')) return true;
    return false;
  }) || THEMES[0];

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/auth/company-profile');
      if (data) {
        if (data.id || data._id) setCompanyId(data.id || data._id);
        if (data.theme) setTheme(data.theme);
        if (data.name) setBrandName(data.name);
        if (data.brandName) setBrandName(data.brandName);
        if (data.tagline) setTagline(data.tagline);
        if (data.desktopLogo) setDesktopLogo(data.desktopLogo);
        if (data.mobileLogo) setMobileLogo(data.mobileLogo);
        if (data.favicon) setFavicon(data.favicon);
        if (data.phone) setSupportPhone(data.phone);
        if (data.adminEmail) setSupportEmail(data.adminEmail);

        // Hero Section
        if (data.heroSection) {
          if (data.heroSection.badgeText) setHeroBadge(data.heroSection.badgeText);
          if (data.heroSection.headline) setHeroHeadline(data.heroSection.headline);
          if (data.heroSection.subheadline) setHeroSubheadline(data.heroSection.subheadline);
          if (data.heroSection.ctaPrimaryText) setHeroPrimaryCtaText(data.heroSection.ctaPrimaryText);
          if (data.heroSection.ctaPrimaryLink) setHeroPrimaryCtaLink(data.heroSection.ctaPrimaryLink);
          if (data.heroSection.ctaSecondaryText) setHeroSecondaryCtaText(data.heroSection.ctaSecondaryText);
          if (data.heroSection.ctaSecondaryLink) setHeroSecondaryCtaLink(data.heroSection.ctaSecondaryLink);
          if (data.heroSection.heroImage) setHeroImage(data.heroSection.heroImage);
        }

        // About Section
        if (data.aboutSection) {
          if (data.aboutSection.badgeText) setAboutBadge(data.aboutSection.badgeText);
          if (data.aboutSection.title) setAboutTitle(data.aboutSection.title);
          if (data.aboutSection.subtitle) setAboutSubtitle(data.aboutSection.subtitle);
          if (data.aboutSection.storyParagraph1) setAboutPara1(data.aboutSection.storyParagraph1);
          if (data.aboutSection.storyParagraph2) setAboutPara2(data.aboutSection.storyParagraph2);
          if (data.aboutSection.highlight1) setAboutHighlight1(data.aboutSection.highlight1);
          if (data.aboutSection.highlight2) setAboutHighlight2(data.aboutSection.highlight2);
          if (data.aboutSection.highlight3) setAboutHighlight3(data.aboutSection.highlight3);
          if (data.aboutSection.aboutImage) setAboutImage(data.aboutImage || data.aboutSection.aboutImage);
        }

        // Contact Section
        if (data.contactSection) {
          if (data.contactSection.supportPhone) setSupportPhone(data.contactSection.supportPhone);
          if (data.contactSection.supportEmail) setSupportEmail(data.contactSection.supportEmail);
          if (data.contactSection.whatsappNumber) setWhatsappNumber(data.contactSection.whatsappNumber);
          if (data.contactSection.deliveryTiming) setDeliveryTiming(data.contactSection.deliveryTiming);
          if (data.contactSection.address) setKitchenAddress(data.contactSection.address);
        }

        // Footer Section
        if (data.footerSection) {
          if (data.footerSection.aboutText) setFooterAbout(data.footerSection.aboutText);
          if (data.footerSection.copyrightText) setCopyrightText(data.footerSection.copyrightText);
          if (data.footerSection.instagramUrl) setInstagramUrl(data.footerSection.instagramUrl);
          if (data.footerSection.facebookUrl) setFacebookUrl(data.footerSection.facebookUrl);
          if (data.footerSection.twitterUrl) setTwitterUrl(data.footerSection.twitterUrl);
        }
      }
    } catch (err: any) {
      console.error('Failed to load company profile:', err);
      setErrorMessage(err?.message || 'Failed to load company settings');
    } finally {
      setLoading(false);
    }
  };

  // Convert uploaded image file to Base64 data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image file size must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    // Phone / Email validations
    const phoneDigits = supportPhone.replace(/\D/g, '');
    if (supportPhone.trim() && phoneDigits.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Support Phone Number');
      setSaving(false);
      return;
    }

    const waDigits = whatsappNumber.replace(/\D/g, '');
    if (whatsappNumber.trim() && waDigits.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit WhatsApp Support Number');
      setSaving(false);
      return;
    }

    const emailTrimmed = supportEmail.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailTrimmed && !emailRegex.test(emailTrimmed)) {
      setErrorMessage('Please enter a valid Support Email Address (e.g. support@kitchen.com)');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        theme,
        name: brandName,
        brandName,
        tagline,
        desktopLogo,
        mobileLogo,
        favicon,
        phone: phoneDigits || supportPhone,
        heroSection: {
          badgeText: heroBadge,
          headline: heroHeadline,
          subheadline: heroSubheadline,
          ctaPrimaryText: heroPrimaryCtaText,
          ctaPrimaryLink: heroPrimaryCtaLink,
          ctaSecondaryText: heroSecondaryCtaText,
          ctaSecondaryLink: heroSecondaryCtaLink,
          heroImage: heroImage,
        },
        aboutSection: {
          badgeText: aboutBadge,
          title: aboutTitle,
          subtitle: aboutSubtitle,
          storyParagraph1: aboutPara1,
          storyParagraph2: aboutPara2,
          highlight1: aboutHighlight1,
          highlight2: aboutHighlight2,
          highlight3: aboutHighlight3,
          aboutImage: aboutImage,
        },
        contactSection: {
          supportPhone,
          supportEmail,
          whatsappNumber,
          deliveryTiming,
          address: kitchenAddress,
        },
        footerSection: {
          aboutText: footerAbout,
          copyrightText,
          instagramUrl,
          facebookUrl,
          twitterUrl,
        }
      };

      await apiRequest('/auth/company/branding', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setErrorMessage(err?.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const userBaseUrl = process.env.NEXT_PUBLIC_USER_APP_URL || 'http://localhost:3000';
  const customerStorefrontUrl = companyId ? `${userBaseUrl}/company/${companyId}` : userBaseUrl;

  const dynamicPreviewUrl = `${currentThemeObj.previewUrl}${currentThemeObj.previewUrl.includes('?') ? '&' : '?'}${companyId ? `companyId=${companyId}` : ''}`;

  if (loading) {
    return (
      <PermissionGuard permission="settings">
        <main className="flex-1 p-6 md:p-10 font-sans bg-[#F9FBE7] min-h-screen text-[#111827] flex flex-col items-center justify-center gap-3">
          <div className="p-4 rounded-3xl bg-white border border-zinc-200 shadow-sm flex items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-[#BBD915]" />
            <span className="text-sm font-bold text-zinc-700">Loading Theme &amp; Content Editor...</span>
          </div>
        </main>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permission="settings">
      <main className="flex-1 p-4 sm:p-6 md:p-10 font-sans bg-[#F9FBE7] min-h-screen text-[#111827] space-y-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
          <span>Dashboard</span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
          <span>Storefront</span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-bold">Theme &amp; Content Editor</span>
        </div>

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-4 rounded-2xl bg-[#111827] text-white shadow-md shrink-0">
              <Palette className="h-7 w-7 text-[#BBD915]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">
                  Theme &amp; Content Editor
                </h1>
                <span className="bg-[#BBD915]/30 text-[#111827] border border-[#111827]/15 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Live Customizer
                </span>
              </div>
              <p className="text-xs text-zinc-600 font-medium mt-1 leading-relaxed">
                Manage your storefront theme preview, logos (Desktop &amp; Mobile), hero banner copy, kitchen story, and customer contact information.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setPreviewModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-zinc-50 text-[#111827] border border-zinc-300 px-4 py-3 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Eye className="h-4 w-4 text-[#BBD915]" />
              <span>Theme Preview</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#111827] hover:bg-black text-[#BBD915] px-6 py-3 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="h-4 w-4 text-[#BBD915] font-black" />
                  <span>Saved Live!</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 text-[#BBD915]" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success / Error Banners */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-3 animate-in fade-in shadow-xs">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>Your storefront logos and section contents have been saved and published live!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-3 animate-in fade-in shadow-xs">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Navigation Tabs Pill Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'theme', label: '1. Storefront Theme', icon: Palette },
            { id: 'branding', label: '2. Logos & Brand Identity', icon: ImageIcon },
            { id: 'hero', label: '3. Hero Section', icon: LayoutTemplate },
            { id: 'about', label: '4. About Us & Story', icon: FileText },
            { id: 'contact', label: '5. Contact & Delivery', icon: Phone },
            { id: 'footer', label: '6. Footer & Socials', icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive 
                    ? 'bg-[#111827] text-white shadow-md border border-[#111827]' 
                    : 'bg-white text-zinc-600 hover:text-black hover:bg-zinc-50 border border-zinc-200/90 shadow-xs'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#BBD915]' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: DESIGNATED THEME CARD & PREVIEW */}
        {activeTab === 'theme' && (
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-sm space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-zinc-100">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#111827] flex items-center gap-2">
                  <span>Your Designated Storefront Theme</span>
                </h2>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  This theme was selected during company registration and defines your storefront&apos;s layout and aesthetic styling.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Locked &amp; Active
                </span>
              </div>
            </div>

            {/* Showcase Theme Card */}
            <div className="rounded-3xl p-6 sm:p-8 bg-[#F9FBE7]/60 border-2 border-[#BBD915]/60 shadow-md">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Visual Palette Strip with Predefined Swatches */}
                <div className="lg:col-span-5">
                  <div 
                    className="h-48 sm:h-56 rounded-3xl p-6 flex flex-col justify-between border-2 border-white/60 shadow-xl relative overflow-hidden transition-colors"
                    style={{ backgroundColor: currentThemeObj.bgColor }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-7 w-7 rounded-full shadow-md border-2 border-white" 
                          style={{ backgroundColor: currentThemeObj.primaryColor }} 
                          title={`Primary Color: ${currentThemeObj.primaryColor}`}
                        />
                        <div 
                          className="h-7 w-7 rounded-full shadow-md border-2 border-white" 
                          style={{ backgroundColor: currentThemeObj.accentColor }} 
                          title={`Accent Color: ${currentThemeObj.accentColor}`}
                        />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-black/80 bg-white/80 px-2.5 py-1 rounded-lg backdrop-blur-xs shadow-xs">
                        {currentThemeObj.id.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-base sm:text-lg font-black text-black block drop-shadow-xs">
                        {currentThemeObj.name}
                      </span>
                      <span className="text-xs text-black/80 font-bold block">
                        {currentThemeObj.tagline}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Theme Specs & Controls */}
                <div className="lg:col-span-7 space-y-5">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500">
                      CURRENT ACTIVE DESIGN
                    </span>
                    <h3 className="text-2xl font-black text-[#111827] mt-1">
                      {currentThemeObj.name}
                    </h3>
                    <p className="text-xs text-zinc-600 font-medium mt-2 leading-relaxed">
                      {currentThemeObj.tagline}. All customer pages automatically adapt to this designated visual layout and its optimized culinary palette.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentThemeObj.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs font-bold px-3 py-1 rounded-xl bg-white text-zinc-700 border border-zinc-200 shadow-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-zinc-200/60 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPreviewModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#111827] hover:bg-black text-[#BBD915] px-5 py-3 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Live Theme Preview in Popup</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.open(customerStorefrontUrl, '_blank', 'noopener,noreferrer')}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-zinc-50 text-[#111827] border border-zinc-300 px-5 py-3 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Globe className="h-4 w-4 text-[#BBD915]" />
                      <span>Open Customer Storefront</span>
                      <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: LOGOS & BRAND IDENTITY */}
        {activeTab === 'branding' && (
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-sm space-y-8">
            
            <div className="pb-6 border-b border-zinc-100">
              <h2 className="text-lg sm:text-xl font-black text-[#111827] flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#BBD915]" />
                <span>Logos &amp; Brand Identity</span>
              </h2>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                Upload your official kitchen logos. Desktop and mobile headers automatically adapt to your uploaded logos.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* 1. Desktop Logo */}
              <div className="space-y-4 p-6 rounded-3xl bg-[#F9FBE7]/40 border border-zinc-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#111827] font-black text-sm">
                    <Monitor className="h-4 w-4 text-[#111827]" />
                    <span>Desktop Header Logo</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">220×60px Recommended</span>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={desktopLogo}
                      onChange={(e) => setDesktopLogo(e.target.value)}
                      placeholder="https://example.com/desktop-logo.png or upload below"
                      className="flex-1 bg-white border border-zinc-300 rounded-2xl px-4 py-3 text-xs text-[#111827] placeholder:text-zinc-400 focus:outline-none focus:border-[#111827] focus:ring-2 focus:ring-[#BBD915]/20"
                    />
                    {desktopLogo && (
                      <button
                        type="button"
                        onClick={() => setDesktopLogo('')}
                        className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-2xl text-xs font-bold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 bg-[#111827] hover:bg-black text-[#BBD915] text-xs font-black px-4 py-2.5 rounded-2xl cursor-pointer transition-all shadow-xs active:scale-95">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Desktop Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setDesktopLogo)}
                      />
                    </label>
                    <span className="text-[11px] text-zinc-500 font-medium">PNG, JPG, SVG, WebP (Max 2MB)</span>
                  </div>
                </div>

                {/* Preview Box */}
                <div className="mt-4 p-4 rounded-2xl bg-white border border-zinc-200 space-y-2">
                  <span className="text-[10px] uppercase font-black text-zinc-400 block">Live Desktop Logo Preview</span>
                  <div className="h-20 bg-zinc-50 rounded-xl border border-zinc-200/80 flex items-center justify-center p-3">
                    {desktopLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={desktopLogo} alt="Desktop Logo Preview" className="max-h-14 max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-zinc-400 font-medium italic">No custom desktop logo uploaded (displays brand name text)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Mobile Logo */}
              <div className="space-y-4 p-6 rounded-3xl bg-[#F9FBE7]/40 border border-zinc-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#111827] font-black text-sm">
                    <Smartphone className="h-4 w-4 text-[#111827]" />
                    <span>Mobile Navbar Logo / Icon</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">64×64px Square</span>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mobileLogo}
                      onChange={(e) => setMobileLogo(e.target.value)}
                      placeholder="https://example.com/mobile-icon.png or upload below"
                      className="flex-1 bg-white border border-zinc-300 rounded-2xl px-4 py-3 text-xs text-[#111827] placeholder:text-zinc-400 focus:outline-none focus:border-[#111827] focus:ring-2 focus:ring-[#BBD915]/20"
                    />
                    {mobileLogo && (
                      <button
                        type="button"
                        onClick={() => setMobileLogo('')}
                        className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-2xl text-xs font-bold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 bg-[#111827] hover:bg-black text-[#BBD915] text-xs font-black px-4 py-2.5 rounded-2xl cursor-pointer transition-all shadow-xs active:scale-95">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Mobile Icon</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setMobileLogo)}
                      />
                    </label>
                    <span className="text-[11px] text-zinc-500 font-medium">Square icon recommended</span>
                  </div>
                </div>

                {/* Preview Box */}
                <div className="mt-4 p-4 rounded-2xl bg-white border border-zinc-200 space-y-2">
                  <span className="text-[10px] uppercase font-black text-zinc-400 block">Live Mobile Icon Preview</span>
                  <div className="h-20 bg-zinc-50 rounded-xl border border-zinc-200/80 flex items-center justify-center p-3">
                    {mobileLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mobileLogo} alt="Mobile Logo Preview" className="h-12 w-12 rounded-xl object-contain shadow-xs" />
                    ) : (
                      <span className="text-xs text-zinc-400 font-medium italic">No custom mobile icon uploaded</span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Brand Name & Tagline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Brand Display Name *</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Gourmet Kitchen"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] font-bold focus:bg-white focus:outline-none focus:border-[#111827] focus:ring-2 focus:ring-[#BBD915]/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Brand Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. 100% Organic, macro-balanced daily meal delivery"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827] focus:ring-2 focus:ring-[#BBD915]/20"
                />
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: HERO SECTION EDITOR */}
        {activeTab === 'hero' && (
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="pb-6 border-b border-zinc-100">
              <h2 className="text-lg sm:text-xl font-black text-[#111827] flex items-center gap-2">
                <LayoutTemplate className="h-5 w-5 text-[#BBD915]" />
                <span>Hero Section Content Editor</span>
              </h2>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                Customize the main banner headline, subtext, call-to-action buttons, and banner food imagery.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Hero Badge Pill Text</label>
                <input
                  type="text"
                  value={heroBadge}
                  onChange={(e) => setHeroBadge(e.target.value)}
                  placeholder="e.g. 🌱 100% ORGANIC & CHEF-CRAFTED"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] font-bold focus:bg-white focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Main Hero Headline</label>
                <input
                  type="text"
                  value={heroHeadline}
                  onChange={(e) => setHeroHeadline(e.target.value)}
                  placeholder="e.g. Healthy, Chef-Prepared Meals Delivered Daily"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] font-bold focus:bg-white focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Sub-headline Description</label>
                <textarea
                  rows={3}
                  value={heroSubheadline}
                  onChange={(e) => setHeroSubheadline(e.target.value)}
                  placeholder="e.g. Nutritious, portion-controlled meals designed by expert nutritionists..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Primary CTA Button Label</label>
                  <input
                    type="text"
                    value={heroPrimaryCtaText}
                    onChange={(e) => setHeroPrimaryCtaText(e.target.value)}
                    placeholder="e.g. Explore Meal Plans"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Primary CTA Target Link</label>
                  <input
                    type="text"
                    value={heroPrimaryCtaLink}
                    onChange={(e) => setHeroPrimaryCtaLink(e.target.value)}
                    placeholder="e.g. #pricing or /meals"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Secondary CTA Button Label</label>
                  <input
                    type="text"
                    value={heroSecondaryCtaText}
                    onChange={(e) => setHeroSecondaryCtaText(e.target.value)}
                    placeholder="e.g. Calculate Custom Plan"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Secondary CTA Target Link</label>
                  <input
                    type="text"
                    value={heroSecondaryCtaLink}
                    onChange={(e) => setHeroSecondaryCtaLink(e.target.value)}
                    placeholder="e.g. #estimator or /build"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Hero Banner Food Image (URL or Upload)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... or upload"
                    className="flex-1 bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-xs text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                  />
                  <label className="inline-flex items-center justify-center gap-1.5 bg-[#111827] hover:bg-black text-[#BBD915] text-xs font-black px-5 py-3 rounded-2xl cursor-pointer shrink-0 transition-all shadow-xs">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setHeroImage)}
                    />
                  </label>
                </div>
                {heroImage && (
                  <div className="mt-3 h-36 max-w-md rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={heroImage} alt="Hero Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ABOUT US & STORY */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="pb-6 border-b border-zinc-100">
              <h2 className="text-lg sm:text-xl font-black text-[#111827] flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#BBD915]" />
                <span>About Us &amp; Kitchen Story Editor</span>
              </h2>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                Customize your brand story, culinary principles, and highlights displayed on the storefront.
              </p>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-700">About Section Badge</label>
                  <input
                    type="text"
                    value={aboutBadge}
                    onChange={(e) => setAboutBadge(e.target.value)}
                    placeholder="e.g. OUR STORY & PHILOSOPHY"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] font-bold focus:bg-white focus:outline-none focus:border-[#111827]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-700">About Section Title</label>
                  <input
                    type="text"
                    value={aboutTitle}
                    onChange={(e) => setAboutTitle(e.target.value)}
                    placeholder="e.g. Crafting Wholesome Nutrition For Modern Lifestyles"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] font-bold focus:bg-white focus:outline-none focus:border-[#111827]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Story Paragraph 1</label>
                <textarea
                  rows={3}
                  value={aboutPara1}
                  onChange={(e) => setAboutPara1(e.target.value)}
                  placeholder="First paragraph of your brand story..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Story Paragraph 2</label>
                <textarea
                  rows={3}
                  value={aboutPara2}
                  onChange={(e) => setAboutPara2(e.target.value)}
                  placeholder="Second paragraph describing ingredients and preparation..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Quality Highlight 1</label>
                  <input
                    type="text"
                    value={aboutHighlight1}
                    onChange={(e) => setAboutHighlight1(e.target.value)}
                    placeholder="e.g. 100% Farm Fresh Produce"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Quality Highlight 2</label>
                  <input
                    type="text"
                    value={aboutHighlight2}
                    onChange={(e) => setAboutHighlight2(e.target.value)}
                    placeholder="e.g. Calorie & Macro-Balanced"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Quality Highlight 3</label>
                  <input
                    type="text"
                    value={aboutHighlight3}
                    onChange={(e) => setAboutHighlight3(e.target.value)}
                    placeholder="e.g. Daily Morning Delivery"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CONTACT & DELIVERY */}
        {activeTab === 'contact' && (
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="pb-6 border-b border-zinc-100">
              <h2 className="text-lg sm:text-xl font-black text-[#111827] flex items-center gap-2">
                <Phone className="h-5 w-5 text-[#BBD915]" />
                <span>Contact &amp; Delivery Support Details</span>
              </h2>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                Provide customer care contact numbers, WhatsApp support, and delivery dispatch window.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Support Phone Number (10 Digits)</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-700">WhatsApp Support Number (10 Digits)</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Customer Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="e.g. support@kitchenbrand.com"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Morning Delivery Window</label>
                <input
                  type="text"
                  value={deliveryTiming}
                  onChange={(e) => setDeliveryTiming(e.target.value)}
                  placeholder="e.g. 6:00 AM – 9:00 AM Daily"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Kitchen / Dispatch Hub Address</label>
                <input
                  type="text"
                  value={kitchenAddress}
                  onChange={(e) => setKitchenAddress(e.target.value)}
                  placeholder="e.g. 104 Culinary Boulevard, Sector 4, Silicon Hub"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: FOOTER & SOCIAL LINKS */}
        {activeTab === 'footer' && (
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="pb-6 border-b border-zinc-100">
              <h2 className="text-lg sm:text-xl font-black text-[#111827] flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#BBD915]" />
                <span>Footer &amp; Social Media Links</span>
              </h2>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                Configure footer copyright notice and your brand&apos;s social profiles.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Footer Short Description</label>
                <input
                  type="text"
                  value={footerAbout}
                  onChange={(e) => setFooterAbout(e.target.value)}
                  placeholder="e.g. 100% Organic, macro-balanced daily meal delivery."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Copyright Notice Text</label>
                <input
                  type="text"
                  value={copyrightText}
                  onChange={(e) => setCopyrightText(e.target.value)}
                  placeholder="e.g. © 2026 Kitchen Brand Inc. All Rights Reserved."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Instagram Profile Link</label>
                  <input
                    type="text"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Facebook Page Link</label>
                  <input
                    type="text"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-700">Twitter / X Profile Link</label>
                  <input
                    type="text"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://x.com/yourhandle"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3 text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIVE STOREFRONT THEME PREVIEW POPUP MODAL */}
        {previewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-6xl h-[92vh] bg-white rounded-3xl border border-zinc-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Modal Header with Device Mode */}
              <div className="flex flex-wrap items-center justify-between px-6 py-3.5 border-b border-zinc-200 bg-[#F9FBE7] gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span 
                      className="h-5 w-5 rounded-full border-2 border-white shadow-xs" 
                      style={{ backgroundColor: currentThemeObj.primaryColor }} 
                    />
                    <span className="text-sm font-black text-[#111827]">{currentThemeObj.name}</span>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] font-black uppercase px-2.5 py-0.5 bg-[#BBD915] text-[#111827] rounded-full border border-[#111827]/20">
                    Live Preview
                  </span>
                </div>

                {/* Device Switcher */}
                <div className="flex items-center bg-white border border-zinc-300 rounded-2xl p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDeviceMode('desktop')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      previewDeviceMode === 'desktop' ? 'bg-[#111827] text-white shadow-xs' : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDeviceMode('tablet')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      previewDeviceMode === 'tablet' ? 'bg-[#111827] text-white shadow-xs' : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    <Tablet className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Tablet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDeviceMode('mobile')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      previewDeviceMode === 'mobile' ? 'bg-[#111827] text-white shadow-xs' : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Mobile</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={dynamicPreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-black px-3 py-1.5 rounded-xl bg-white border border-zinc-200"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(false)}
                    className="p-1.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 hover:text-black border border-zinc-200 transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Iframe Storefront Container with Responsive Width Wrapper */}
              <div className="flex-1 w-full bg-zinc-100 flex items-center justify-center overflow-hidden p-2 sm:p-4">
                <div 
                  className={`h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-300 transition-all duration-300 ${
                    previewDeviceMode === 'mobile' 
                      ? 'w-[390px]' 
                      : previewDeviceMode === 'tablet' 
                        ? 'w-[768px]' 
                        : 'w-full'
                  }`}
                >
                  <iframe
                    src={dynamicPreviewUrl}
                    title="Storefront Theme Live Preview"
                    className="w-full h-full border-none"
                  />
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="px-6 py-3 border-t border-zinc-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-zinc-600">
                  <span>Selected Theme: <strong className="text-[#111827]">{currentThemeObj.name}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#111827] hover:bg-black text-[#BBD915] text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </PermissionGuard>
  );
}
