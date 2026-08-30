'use client';

import Link from 'next/link';
import { CreditCard, MapPin, ArrowRight, Settings, Receipt, FileText } from 'lucide-react';
import PermissionGuard from '../components/PermissionGuard';

export default function SettingsOverviewPage() {
  const settingModules = [
    {
      id: 'payment-settings',
      title: 'Payment Gateways',
      description: 'Configure Razorpay, Cash on Delivery, Stripe, PayU, CCAvenue, and payment webhooks.',
      icon: CreditCard,
      href: '/payment-settings',
      badge: 'Active Gateways',
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      id: 'area-settings',
      title: 'Delivery Areas',
      description: 'Manage deliverable locations, active delivery zones, and service coverage areas.',
      icon: MapPin,
      href: '/settings/area',
      badge: 'Location Coverage',
      color: 'bg-[#BBD915]/20 text-[#111827]',
    },
    {
      id: 'charges-settings',
      title: 'Order Charges & Taxes',
      description: 'Configure packing charges, delivery fees, tax percentages, and order surcharge rules.',
      icon: Receipt,
      href: '/settings/charges',
      badge: 'Fee & Taxes',
      color: 'bg-orange-500/10 text-orange-600',
    },
    {
      id: 'invoice-settings',
      title: 'Invoice Number Settings',
      description: 'Configure invoice prefix, number padding, separator, date inclusion, and the starting invoice number.',
      icon: FileText,
      href: '/settings/invoice',
      badge: 'Invoice Format',
      color: 'bg-purple-500/10 text-purple-600',
    },
  ];

  return (
    <PermissionGuard permission="settings">
      <main className="flex-1 p-6 md:p-10 font-sans bg-[#F9FBE7] min-h-screen text-[#111827]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-6">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-zinc-700 font-bold">Settings</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-[#111827] text-white shadow-md">
            <Settings className="h-6 w-6 text-[#BBD915]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#111827]">Platform Settings</h1>
            <p className="text-xs text-zinc-500 font-semibold mt-1">
              Select a module card to manage system configurations, payment gateways, and delivery zones.
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
          {settingModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.id}
                href={module.href}
                className="group relative bg-white rounded-3xl border border-zinc-200/80 p-8 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all flex flex-col justify-between space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-4 rounded-2xl ${module.color} transition-transform group-hover:scale-105`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full border border-zinc-200/60">
                      {module.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-[#111827] group-hover:text-black transition-colors mb-2">
                    {module.title}
                  </h3>
                  <p className="text-xs font-semibold text-zinc-500 leading-relaxed">
                    {module.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 font-extrabold text-xs text-[#111827] group-hover:translate-x-1 transition-transform">
                  <span>Manage Module Settings</span>
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#111827] text-white group-hover:bg-[#BBD915] group-hover:text-[#111827] transition-colors">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </PermissionGuard>
  );
}
