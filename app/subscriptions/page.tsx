'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../utils/api';
import { 
  Search, ChevronDown, Eye, Edit2, 
  UserX, UserCheck, X, RefreshCw, Save, Pause, Play, ChevronLeft, ChevronRight, Plus,
  Receipt, Download, CreditCard
} from 'lucide-react';
import PermissionGuard from '../components/PermissionGuard';
import Pagination from '../components/Pagination';
import ModalAlert from '../components/ModalAlert';

export default function AdminSubscriptions() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [plans, setPlans] = useState<Record<string, any>>({});
  const [planConfig, setPlanConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal Alert State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    isConfirm?: boolean;
    confirmText?: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    message: '',
  });

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string) => {
    setAlertConfig({
      isOpen: true,
      type,
      title,
      message,
      isConfirm: false,
    });
  };

  const showConfirm = (message: string, onConfirm: () => void, title: string = 'Confirm Action') => {
    setAlertConfig({
      isOpen: true,
      type: 'warning',
      title,
      message,
      isConfirm: true,
      confirmText: 'Confirm',
      onConfirm,
    });
  };

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState('all');

  // Customer Payment History Modal State
  const [historyCustomer, setHistoryCustomer] = useState<any | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Inspector Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Basic Info View/Edit Mode State
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [isSavingBasicInfo, setIsSavingBasicInfo] = useState(false);

  // Add Customer Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addAddress, setAddAddress] = useState('');
  const [addPassword, setAddPassword] = useState('customer123');
  const [areas, setAreas] = useState<any[]>([]);
  const [addAreaId, setAddAreaId] = useState('');
  
  // Subscription toggle inside Add Customer
  const [attachSub, setAttachSub] = useState(true);
  const [addPaymentMethod, setAddPaymentMethod] = useState('Manual Cash');
  const [subPlanMode, setSubPlanMode] = useState<'card' | 'custom'>('card');
  const [selectedCardId, setSelectedCardId] = useState('');
  const [subPlanName, setSubPlanName] = useState('');
  const [subDietType, setSubDietType] = useState('Keto');
  const [subTier, setSubTier] = useState('standard');
  const [subDuration, setSubDuration] = useState(7);
  const [subStartDate, setSubStartDate] = useState(() => {
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    return tom.toISOString().split('T')[0];
  });
  const [subPrice, setSubPrice] = useState(99);
  const [subSelectedMeals, setSubSelectedMeals] = useState<string[]>(['Breakfast', 'Lunch', 'Dinner']);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string[]>>({});
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch all users/customers
      const allUsers = await apiRequest('/auth/users');
      // Filter only customer roles
      const clientUsers = allUsers.filter((u: any) => u.role === 'user');
      setCustomers(clientUsers);

      // 2. Fetch subscriptions
      const subs = await apiRequest('/subscriptions');
      setSubscriptions(subs);

      // 3. Fetch payments from payments service
      try {
        const payList = await apiRequest('/payments');
        if (payList && Array.isArray(payList)) {
          setPayments(payList);
        }
      } catch (err) {
        console.error('Failed to fetch payments:', err);
      }

      // 4. Fetch plans
      const plansList = await apiRequest('/plans');
      const plansMap: Record<string, any> = {};
      plansList.forEach((p: any) => {
        plansMap[p.id] = p;
      });
      setPlans(plansMap);

      // 4. Fetch company plan configuration details
      try {
        const configData = await apiRequest('/plans/config');
        setPlanConfig(configData);

        if (configData) {
          const isCardType = Number(configData.planType || 3) === 2;
          setSubPlanMode(isCardType ? 'card' : 'custom');

          if (configData.pricingCards && configData.pricingCards.length > 0) {
            const firstCard = configData.pricingCards[0];
            setSelectedCardId(firstCard.id || 'card-1');
            setSubPlanName(firstCard.name || 'Pre-defined Plan');
            setSubPrice(Number(firstCard.price) || 2999);
            setSubDuration(firstCard.period === 'month' ? 30 : firstCard.period === 'week' ? 7 : (Number(firstCard.durationDays) || 30));
          }

          const diets = (configData.dietOptions || []).map((d: any) => getFeatureString(d)).filter(Boolean);
          if (diets.length > 0) setSubDietType(diets[0]);

          const tiers = (configData.tierOptions || configData.pricingCards || []).map((t: any) => getFeatureString(t)).filter(Boolean);
          if (tiers.length > 0) setSubTier(tiers[0].toLowerCase());

          const durations = (configData.durationsPricing || []).map((d: any) => d.durationDays).filter(Boolean);
          if (durations.length > 0) setSubDuration(durations[0]);

          const meals = (configData.mealOptions || []).filter((m: any) => m.isActive !== false).map((m: any) => getFeatureString(m)).filter(Boolean);
          if (meals.length > 0) setSubSelectedMeals(meals);
          else if (configData.mealCategories) setSubSelectedMeals((configData.mealCategories || []).map((m: any) => getFeatureString(m)).filter(Boolean));
        }
      } catch (err) {
        // Ignore fallback
      }

      // 5. Fetch delivery areas
      try {
        const areaList = await apiRequest('/payments/areas');
        if (areaList && Array.isArray(areaList)) {
          const activeAreas = areaList.filter((a: any) => a.isEnabled !== false);
          setAreas(activeAreas);
          if (activeAreas.length > 0) setAddAreaId(activeAreas[0].id);
        }
      } catch (err) {}

    } catch (err: any) {
      console.error('Failed to fetch subscriptions data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSubEndDate = () => {
    if (!subStartDate) return '';
    const d = new Date(subStartDate);
    d.setDate(d.getDate() + (Number(subDuration) || 7));
    return d.toISOString().split('T')[0];
  };

  const handleToggleCustomizationItem = (groupId: string, itemId: string, isVariant: boolean) => {
    setSelectedCustomizations(prev => {
      const currentList = prev[groupId] || [];
      if (isVariant) {
        return { ...prev, [groupId]: [itemId] };
      } else {
        const exists = currentList.includes(itemId);
        const nextList = exists 
          ? currentList.filter(id => id !== itemId) 
          : [...currentList, itemId];
        return { ...prev, [groupId]: nextList };
      }
    });
  };

  const compileCustomizationsPayload = () => {
    const result: any[] = [];
    const activeGroups = (planConfig?.customizations || []).filter((g: any) => {
      if (!g.targetTier || g.targetTier === 'all') return true;
      return g.targetTier.toLowerCase() === subTier.toLowerCase();
    });

    activeGroups.forEach((g: any) => {
      const groupId = g.id || g._id;
      const selectedItemIds = selectedCustomizations[groupId] || [];
      if (selectedItemIds.length > 0) {
        const selectedItems = (g.items || [])
          .filter((it: any) => selectedItemIds.includes(it.id || it._id))
          .map((it: any) => ({
            id: it.id || it._id,
            name: it.name,
            price: Number(it.price || 0)
          }));

        if (selectedItems.length > 0) {
          result.push({
            groupId: groupId,
            groupName: g.name,
            selectedItems
          });
        }
      }
    });

    return result;
  };

  const getFeatureString = (f: any): string => {
    if (!f) return '';
    if (typeof f === 'string') return f;
    if (typeof f === 'object') {
      return f.text || f.name || f.label || f.title || '';
    }
    return String(f);
  };

  const handleCardSelect = (cardId: string) => {
    setSelectedCardId(cardId);
    const card = (planConfig?.pricingCards || []).find((c: any) => c.id === cardId);
    if (card) {
      setSubPlanName(card.name);
      setSubPrice(Number(card.price) || 0);
      const periodDays = card.period === 'month' ? 30 : card.period === 'week' ? 7 : (Number(card.durationDays) || 30);
      setSubDuration(periodDays);

      if (card.features && Array.isArray(card.features)) {
        const featureMeals = card.features.map((f: any) => getFeatureString(f)).filter(Boolean);
        if (featureMeals.length > 0) {
          setSubSelectedMeals(featureMeals);
        }
      }
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addName.trim()) {
      showAlert('Please enter the customer Full Name', 'warning');
      return;
    }

    const emailTrimmed = addEmail.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailTrimmed) {
      showAlert('Please enter the customer Email Address', 'warning');
      return;
    }
    if (!emailRegex.test(emailTrimmed)) {
      showAlert('Please enter a valid customer Email Address (e.g. name@example.com)', 'warning');
      return;
    }

    const phoneDigits = addPhone.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length !== 10) {
      showAlert('Please enter a valid 10-digit Customer Phone Number', 'warning');
      return;
    }

    if (!addAreaId) {
      showAlert('Please select a Delivery Area for the customer', 'warning');
      return;
    }

    if (!addAddress.trim()) {
      showAlert('Please enter the Customer Delivery Address', 'warning');
      return;
    }

    setIsCreatingCustomer(true);
    try {
      const payload: any = {
        name: addName.trim(),
        email: emailTrimmed.toLowerCase(),
        phone: phoneDigits,
        address: addAddress.trim(),
        areaId: addAreaId,
        password: addPassword || 'customer123',
        status: 'active'
      };

      if (attachSub) {
        const isType2 = Number(planConfig?.planType || 3) === 2;
        const isCard = isType2 || (subPlanMode === 'card' && selectedCardId);
        const chosenCard = (planConfig?.pricingCards || []).find((c: any) => (c._id === selectedCardId || c.id === selectedCardId)) || (planConfig?.pricingCards || [])[0];
        const formattedMeals = (subSelectedMeals || []).map(m => getFeatureString(m)).filter(Boolean);
        const isOnlinePayment = !addPaymentMethod.startsWith('Manual');
        const resolvedPlanId = isCard 
          ? (chosenCard?._id || chosenCard?.id || planConfig?._id || planConfig?.id)
          : (planConfig?._id || planConfig?.id);

        if (isCard) {
          const cardFeatures = (chosenCard?.featureList || chosenCard?.features || []).map((f: any) => getFeatureString(f)).filter(Boolean);
          payload.subscription = {
            planId: resolvedPlanId,
            name: chosenCard?.name || 'Pre-defined Meal Plan',
            price: Number(subPrice),
            duration: Number(subDuration),
            startDate: subStartDate,
            endDate: getSubEndDate(),
            tag: chosenCard?.tag || '',
            dietType: chosenCard?.dietType || 'veg',
            meals: cardFeatures.length > 0 ? cardFeatures : ['Breakfast', 'Lunch', 'Dinner'],
            entryType: 'manual',
            paymentMethod: addPaymentMethod,
            payment: addPaymentMethod,
            paymentMode: isOnlinePayment ? 'online' : 'manual',
            paymentStatus: 'paid',
            status: 'active'
          };
        } else {
          const compiledCustomizations = compileCustomizationsPayload();
          payload.subscription = {
            planId: resolvedPlanId,
            name: subPlanName || `Custom ${subDietType} ${subTier.charAt(0).toUpperCase() + subTier.slice(1)} Plan`,
            price: Number(subPrice),
            duration: Number(subDuration),
            startDate: subStartDate,
            endDate: getSubEndDate(),
            dietType: subDietType,
            tier: subTier,
            meals: formattedMeals,
            ...(compiledCustomizations.length > 0 ? { customizations: compiledCustomizations } : {}),
            entryType: 'manual',
            paymentMethod: addPaymentMethod,
            payment: addPaymentMethod,
            paymentMode: isOnlinePayment ? 'online' : 'manual',
            paymentStatus: 'paid',
            status: 'active'
          };
        }
      }

      await apiRequest('/auth/customers', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showAlert('New customer record created successfully!', 'success');
      setIsAddModalOpen(false);
      
      // Reset form
      setAddName('');
      setAddEmail('');
      setAddPhone('');
      setAddAddress('');
      setSelectedCustomizations({});
      await fetchData();
    } catch (err: any) {
      showAlert(err.message || 'Failed to create customer record', 'error');
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handleUpdateSubscriptionStatus = async (subId: string, status: 'active' | 'paused' | 'cancelled') => {
    setActionLoading(subId);
    try {
      await apiRequest(`/subscriptions/${subId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      const subs = await apiRequest('/subscriptions');
      setSubscriptions(subs);
      
      if (selectedCustomer) {
        const updatedSub = subs.find((s: any) => s.userId === selectedCustomer.id);
        setSelectedCustomer((prev: any) => ({
          ...prev,
          subscription: updatedSub || null
        }));
      }
    } catch (err: any) {
      showAlert(err.message || 'Failed to update subscription status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleCustomerAccountStatus = async (customer: any) => {
    const nextStatus = (customer.status || 'active') === 'active' ? 'inactive' : 'active';
    setActionLoading(customer.id);
    try {
      await apiRequest(`/auth/users/${customer.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address || '',
          status: nextStatus
        })
      });
      await fetchData();
    } catch (err: any) {
      showAlert(err.message || 'Failed to update customer status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenPaymentHistory = (customer: any) => {
    setHistoryCustomer(customer);
    setIsHistoryModalOpen(true);
  };

  const getCustomerPaymentInfo = (customer: any) => {
    if (!customer) {
      return {
        sub: null,
        status: 'unpaid',
        statusLabel: 'Unpaid',
        statusBadgeClass: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
        capturedAmount: 0,
        razorpayPaymentId: '—',
        razorpaySubscriptionId: '—',
        matchedPayments: [],
        capturedPayments: []
      };
    }

    const custId = (customer.id || customer._id || '').toString();
    const custEmail = (customer.email || '').toLowerCase().trim();

    // 1. First get that user's subscription data
    const sub = subscriptions.find((s: any) => {
      const sUserId = (s.userId || '').toString();
      const sEmail = (s.customerDetails?.email || s.customerEmail || s.recipientEmail || '').toLowerCase().trim();
      return (sUserId && sUserId === custId) || (sEmail && custEmail && sEmail === custEmail);
    });

    // Extract identifiers from subscription data and customer
    const subUserId = (sub?.userId || custId).toString();
    const subRazorpaySubId = sub?.razorpaySubscriptionId || sub?.subscriptionId;
    const subRazorpayPaymentId = sub?.razorpayPaymentId || sub?.paymentId;

    // 2. Match IDs in payments collection
    const matchedPayments = payments.filter((p: any) => {
      const pUserId = (p.userId || '').toString();
      const pEmail = (p.customerEmail || p.email || '').toLowerCase().trim();
      const pSubId = p.subscriptionId || p.razorpaySubscriptionId;
      const pPayId = p.razorpayPaymentId || p.paymentId || p.id;

      const isSubMatch = Boolean(subRazorpaySubId && pSubId && pSubId === subRazorpaySubId);
      const isPayMatch = Boolean(subRazorpayPaymentId && pPayId && pPayId === subRazorpayPaymentId);
      const isUserMatch = Boolean(pUserId && pUserId !== 'guest' && (pUserId === subUserId || pUserId === custId));
      const isEmailMatch = Boolean(pEmail && custEmail && pEmail === custEmail);

      return isSubMatch || isPayMatch || isUserMatch || isEmailMatch;
    });

    // 3. Payment captured amount ONLY paid amount
    const capturedPayments = matchedPayments.filter((p: any) =>
      p.paymentStatus === 'captured' ||
      p.paymentStatus === 'paid' ||
      p.status === 'captured' ||
      p.status === 'paid' ||
      p.paymentStatus === 'success'
    );

    let capturedAmount = capturedPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

    // If subscription is explicitly marked paymentCaptured or has razorpayPaymentId
    const isExplicitlyCaptured = sub?.paymentCaptured === true || Boolean(sub?.razorpayPaymentId);
    if (isExplicitlyCaptured && capturedAmount === 0) {
      capturedAmount = Number(sub?.capturedAmount || sub?.amount || sub?.price || sub?.buildPlanDetails?.totalPrice || 0);
    }

    const isManualCash = sub?.paymentMethod === 'Manual Cash' || sub?.payment === 'Manual Cash';
    if (!isExplicitlyCaptured && capturedPayments.length === 0 && isManualCash && (sub?.status === 'active' || sub?.paymentStatus === 'paid')) {
      capturedAmount = Number(sub?.amount || sub?.price || sub?.buildPlanDetails?.totalPrice || 0);
    }

    let status = 'unpaid';
    let statusLabel = 'Unpaid';
    let statusBadgeClass = 'bg-zinc-100 text-zinc-600 border border-zinc-200';

    if (capturedPayments.length > 0 || isExplicitlyCaptured) {
      status = 'captured';
      statusLabel = 'Captured';
      statusBadgeClass = 'bg-emerald-100/90 text-emerald-800 border border-emerald-200 font-black';
    } else if (sub) {
      if (isManualCash || sub.paymentStatus === 'paid' || sub.status === 'active') {
        status = 'paid';
        statusLabel = isManualCash ? 'Manual Cash' : 'Paid';
        statusBadgeClass = 'bg-emerald-100/90 text-emerald-800 border border-emerald-200 font-black';
      } else {
        status = 'pending';
        statusLabel = 'Pending';
        statusBadgeClass = 'bg-amber-100/90 text-amber-800 border border-amber-200 font-bold';
      }
    }

    return {
      sub,
      matchedPayments,
      capturedPayments,
      capturedAmount,
      status,
      statusLabel,
      statusBadgeClass,
      razorpayPaymentId: subRazorpayPaymentId || capturedPayments[0]?.razorpayPaymentId || '—',
      razorpaySubscriptionId: subRazorpaySubId || capturedPayments[0]?.razorpaySubscriptionId || '—',
    };
  };

  const getCustomerPaymentHistory = (customer: any) => {
    if (!customer) return [];
    const custId = (customer.id || customer._id || '').toString();
    const custEmail = (customer.email || '').toLowerCase().trim();

    // 1. Get ALL subscriptions for this customer
    const userSubs = subscriptions.filter((s: any) => {
      const sUserId = (s.userId || '').toString();
      const sEmail = (s.customerDetails?.email || s.customerEmail || s.recipientEmail || '').toLowerCase().trim();
      return (sUserId && sUserId === custId) || (sEmail && custEmail && sEmail === custEmail);
    });

    const records: any[] = [];
    const processedSubIds = new Set<string>();
    const processedPayIds = new Set<string>();

    const formatDateStr = (d: any) => {
      if (!d) return '—';
      if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) return d.split('T')[0];
      try {
        const dt = new Date(d);
        if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
      } catch (e) {}
      return String(d);
    };

    // Process every subscription in the customer's subscription list
    for (const sub of userSubs) {
      const subId = (sub.id || sub._id || sub.subscriptionId || '').toString();
      const subRazorpaySubId = sub.razorpaySubscriptionId || sub.subscriptionId;
      const subRazorpayPaymentId = sub.razorpayPaymentId || sub.paymentId;
      if (subId) processedSubIds.add(subId);
      if (subRazorpaySubId) processedSubIds.add(subRazorpaySubId);

      // Find matching payment in payments collection
      const matchedPay = payments.find((p: any) => {
        const pPayId = p.razorpayPaymentId || p.paymentId;
        const pSubId = p.subscriptionId || p.razorpaySubscriptionId;
        const isPayMatch = Boolean(subRazorpayPaymentId && pPayId && pPayId === subRazorpayPaymentId);
        const isSubMatch = Boolean(subRazorpaySubId && pSubId && pSubId === subRazorpaySubId);
        return isPayMatch || isSubMatch;
      });

      if (matchedPay?.id || matchedPay?._id || matchedPay?.razorpayPaymentId) {
        processedPayIds.add((matchedPay.razorpayPaymentId || matchedPay.id || matchedPay._id).toString());
      }

      const isCaptured =
        matchedPay?.paymentStatus === 'captured' ||
        matchedPay?.paymentStatus === 'paid' ||
        matchedPay?.status === 'captured' ||
        matchedPay?.status === 'paid' ||
        sub.paymentCaptured === true ||
        Boolean(sub.razorpayPaymentId);

      const isManualCash = sub.paymentMethod === 'Manual Cash' || sub.payment === 'Manual Cash';

      let status = 'pending';
      let statusLabel = 'Payment Pending';
      let amount = 0;

      if (isCaptured) {
        status = 'paid';
        statusLabel = 'Payment Success';
        amount = Number(matchedPay?.amount || sub.capturedAmount || sub.amount || sub.price || sub.buildPlanDetails?.totalPrice || 0);
      } else if (isManualCash && (sub.status === 'active' || sub.paymentStatus === 'paid')) {
        status = 'paid';
        statusLabel = 'Payment Success (Cash)';
        amount = Number(sub.amount || sub.price || sub.buildPlanDetails?.totalPrice || 0);
      } else if (sub.status === 'cancelled') {
        status = 'cancelled';
        statusLabel = 'Subscription Cancelled';
        amount = 0;
      } else {
        status = 'pending';
        statusLabel = 'Payment Pending';
        amount = 0;
      }

      const planTitle =
        sub.buildPlanDetails?.name ||
        sub.planName ||
        sub.name ||
        plans[sub.planId]?.name ||
        'Meal Subscription Plan';

      records.push({
        id: subRazorpayPaymentId || matchedPay?.razorpayPaymentId || matchedPay?.id || subRazorpaySubId || subId,
        planName: planTitle,
        dietType: sub.buildPlanDetails?.dietType || sub.dietType || null,
        tier: sub.buildPlanDetails?.tier || sub.tier || null,
        duration: sub.buildPlanDetails?.duration || sub.duration || null,
        startDate: formatDateStr(sub.startDate || sub.subscriptionStartDate || sub.createdAt),
        endDate: formatDateStr(sub.endDate || sub.subscriptionEndDate),
        amount,
        nominalAmount: Number(sub.amount || sub.price || sub.buildPlanDetails?.totalPrice || 0),
        paymentMethod: sub.paymentMethod || sub.payment || (sub.razorpaySubscriptionId ? 'Razorpay Online' : 'Manual Cash'),
        paymentDate: matchedPay?.createdAt ? new Date(matchedPay.createdAt).toLocaleString() : (sub.createdAt ? new Date(sub.createdAt).toLocaleString() : '—'),
        status,
        statusLabel,
        isCaptured,
        razorpaySubscriptionId: subRazorpaySubId || '—',
        razorpayPaymentId: subRazorpayPaymentId || matchedPay?.razorpayPaymentId || '—',
      });
    }

    // Also include standalone payment records from payments collection for this user
    const remainingPayments = payments.filter((p: any) => {
      const pId = (p.razorpayPaymentId || p.id || p._id || '').toString();
      const pSubId = (p.subscriptionId || p.razorpaySubscriptionId || '').toString();
      const pUserId = (p.userId || '').toString();
      const pEmail = (p.customerEmail || p.email || '').toLowerCase().trim();

      if (processedPayIds.has(pId)) return false;
      if (pSubId && processedSubIds.has(pSubId)) return false;

      const isUserMatch = Boolean(pUserId && pUserId !== 'guest' && (pUserId === custId));
      const isEmailMatch = Boolean(pEmail && custEmail && pEmail === custEmail);

      return isUserMatch || isEmailMatch;
    });

    for (const p of remainingPayments) {
      const isCaptured = p.paymentStatus === 'captured' || p.paymentStatus === 'paid' || p.status === 'captured' || p.status === 'paid';
      records.push({
        id: p.razorpayPaymentId || p.id || p._id,
        planName: p.planName || 'Meal Subscription Plan',
        dietType: null,
        tier: null,
        duration: null,
        startDate: formatDateStr(p.startDate || p.createdAt),
        endDate: formatDateStr(p.endDate),
        amount: isCaptured ? (Number(p.amount) || 0) : 0,
        nominalAmount: Number(p.amount) || 0,
        paymentMethod: p.paymentMethod || 'Razorpay Online',
        paymentDate: p.createdAt ? new Date(p.createdAt).toLocaleString() : '—',
        status: isCaptured ? 'paid' : 'pending',
        statusLabel: isCaptured ? 'Payment Success' : 'Payment Pending',
        isCaptured,
        razorpaySubscriptionId: p.razorpaySubscriptionId || p.subscriptionId || '—',
        razorpayPaymentId: p.razorpayPaymentId || p.id || '—',
      });
    }

    return records;
  };

  const exportCustomerPaymentHistoryCSV = (customer: any) => {
    const records = getCustomerPaymentHistory(customer);
    if (records.length === 0) {
      showAlert('No subscription payment records to export.', 'warning');
      return;
    }
    const headers = ['Transaction / Payment ID', 'Customer Name', 'Customer Email', 'Plan Name', 'Start Date', 'End Date', 'Paid Amount (INR)', 'Payment Method', 'Payment Date', 'Payment Status'];
    const rows = records.map((r: any) => [
      `"${(r.id || '').replace(/"/g, '""')}"`,
      `"${(customer.name || '').replace(/"/g, '""')}"`,
      `"${(customer.email || '').replace(/"/g, '""')}"`,
      `"${(r.planName || '').replace(/"/g, '""')}"`,
      `"${(r.startDate || '').replace(/"/g, '""')}"`,
      `"${(r.endDate || '').replace(/"/g, '""')}"`,
      `"${r.amount || 0}"`,
      `"${(r.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(r.paymentDate || '').replace(/"/g, '""')}"`,
      `"${(r.statusLabel || r.status || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `subscription_payment_history_${(customer.name || 'customer').toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInspector = (customer: any) => {
    const custSub = subscriptions.find(s => s.userId === customer.id);
    setSelectedCustomer({
      ...customer,
      subscription: custSub || null
    });
    
    setEditName(customer.name || '');
    setEditEmail(customer.email || '');
    setEditPhone(customer.phone || '');
    setEditAddress(customer.address || '');
    setEditStatus(customer.status || 'active');

    setIsEditingBasicInfo(false);
    setIsModalOpen(true);
  };

  const handleSaveBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    if (!editName.trim()) {
      showAlert('Please enter customer Full Name', 'warning');
      return;
    }

    const emailTrimmed = editEmail.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailTrimmed) {
      showAlert('Please enter customer Email Address', 'warning');
      return;
    }
    if (!emailRegex.test(emailTrimmed)) {
      showAlert('Please enter a valid customer Email Address (e.g. name@example.com)', 'warning');
      return;
    }

    const phoneDigits = editPhone.replace(/\D/g, '');
    if (editPhone.trim() && phoneDigits.length !== 10) {
      showAlert('Please enter a valid 10-digit Phone Number', 'warning');
      return;
    }

    setIsSavingBasicInfo(true);
    try {
      const updated = await apiRequest(`/auth/users/${selectedCustomer.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editName.trim(),
          email: emailTrimmed.toLowerCase(),
          phone: phoneDigits,
          address: editAddress.trim(),
          status: editStatus
        })
      });
      
      setSelectedCustomer((prev: any) => ({
        ...prev,
        ...updated
      }));

      await fetchData();
      setIsModalOpen(false);
      showAlert('Customer information updated successfully.', 'success');
      await fetchData();
    } catch (err: any) {
      showAlert(err.message || 'Failed to update customer basic info', 'error');
    } finally {
      setIsSavingBasicInfo(false);
    }
  };

  // Helper avatar generator
  const getAvatarUrl = (customer: any) => {
    if (customer.avatarUrl) return customer.avatarUrl;
    const seed = encodeURIComponent(customer.name || 'User');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  };

  // Dynamic lists from planConfig
  const dietOptionsList = (planConfig?.dietOptions || []).map((d: any) => getFeatureString(d)).filter(Boolean);
  const finalDietOptions = dietOptionsList.length > 0 ? dietOptionsList : ['Keto', 'Veg', 'Non-Veg', 'Vegan'];

  const tierOptionsList = (planConfig?.tierOptions || planConfig?.pricingCards || []).map((t: any) => getFeatureString(t)).filter(Boolean);
  const finalTierOptions = tierOptionsList.length > 0 ? tierOptionsList : ['Standard', 'Premium', 'Platinum'];

  const durationOptionsList = (planConfig?.durationsPricing || []).map((d: any) => d.durationDays).filter(Boolean);
  const finalDurationOptions = durationOptionsList.length > 0 ? durationOptionsList : [7, 14, 30];

  // Active customization groups targeting selected tier
  const activeTierGroups = (planConfig?.customizations || []).filter((g: any) => {
    if (!g.targetTier || g.targetTier === 'all') return true;
    return g.targetTier.toLowerCase() === subTier.toLowerCase();
  });

  // Filter customers logic
  const filteredCustomers = customers.filter((c: any) => {
    const sub = subscriptions.find(s => s.userId === c.id);
    const matchSearch = 
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || '').toLowerCase().includes(searchTerm.toLowerCase());

    const accountStatus = c.status || 'active';
    const matchStatus = selectedStatus === 'all' || accountStatus === selectedStatus;

    let matchArea = true;
    if (selectedAreaFilter !== 'all') {
      const cAreaId = c.area?.areaId ? String(c.area.areaId) : (typeof c.area === 'string' ? c.area : '');
      const cAreaName = c.area?.area ? String(c.area.area) : (typeof c.area === 'string' ? c.area : '');
      matchArea = (cAreaId === selectedAreaFilter) || (cAreaName.toLowerCase() === selectedAreaFilter.toLowerCase());
    }

    return matchSearch && matchStatus && matchArea;
  });

  // Pagination bounds
  const totalResults = filteredCustomers.length;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResults);
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  if (loading && customers.length === 0) {
    return (
      <div className="flex min-h-screen bg-[#F9FBE7] text-[#111827] font-sans items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-10 w-10 animate-spin text-[#BBD915]" />
          <p className="text-zinc-500 font-semibold text-sm">Loading Customers...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="subscriptions">
      <main className="flex-1 p-6 md:p-10 font-sans bg-[#F9FBE7] min-h-screen text-[#111827]">
        <ModalAlert
          isOpen={alertConfig.isOpen}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          isConfirm={alertConfig.isConfirm}
          onConfirm={alertConfig.onConfirm}
          onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        />
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-6">
          <span>Dashboard</span>
          <span>/</span>
          <span>Customers</span>
          <span>/</span>
          <span className="text-zinc-700 font-bold">List</span>
        </div>

        {/* Top Search & Add Customer Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-4xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter customers by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-2xl border border-zinc-200/80 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-[#111827] placeholder-zinc-400 shadow-sm focus:border-zinc-300 focus:outline-none"
            />
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#111827] text-white hover:bg-zinc-800 font-black text-xs px-5 py-3.5 shadow-md transition-all active:scale-[0.98] shrink-0"
          >
            <Plus className="h-4 w-4 text-[#BBD915]" />
            Add Customer
          </button>
        </div>

        {/* Filter Dropdowns Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-zinc-200/80 bg-white px-4 py-2.5 pr-9 text-xs font-bold text-[#111827] shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          </div>

          {/* Delivery Area Filter */}
          <div className="relative">
            <select
              value={selectedAreaFilter}
              onChange={(e) => {
                setSelectedAreaFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-zinc-200/80 bg-white px-4 py-2.5 pr-9 text-xs font-bold text-[#111827] shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="all">All Delivery Areas</option>
              {areas.map((a: any) => (
                <option key={a.id || a._id} value={a.id || a._id}>{a.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          </div>

          <button
            onClick={fetchData}
            title="Refresh List"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white px-3 py-2.5 text-xs font-bold text-zinc-600 shadow-sm hover:bg-zinc-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-zinc-500" />
          </button>
        </div>

        {/* Customer Registry Table Card */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-white text-zinc-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 pl-6 font-bold">Customer</th>
                  <th className="py-4 px-4 font-bold">Contact Phone</th>
                  <th className="py-4 px-4 font-bold">Period Dates</th>
                  <th className="py-4 px-4 font-bold">Account Status</th>
                  <th className="py-4 px-4 font-bold">Payment</th>
                  <th className="py-4 px-6 pr-6 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs text-[#111827]">
                {currentCustomers.map((customer) => {
                  const payInfo = getCustomerPaymentInfo(customer);
                  const sub = payInfo.sub;
                  const isAccountActive = (customer.status || 'active') === 'active';

                  return (
                    <tr key={customer.id} className="hover:bg-zinc-50/50 transition-colors">
                      {/* Customer (Avatar + Name & Email) */}
                      <td className="py-4 px-6 pl-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={getAvatarUrl(customer)}
                            alt={customer.name}
                            className="h-10 w-10 rounded-full object-cover bg-zinc-50 border border-zinc-200/60 shrink-0"
                          />
                          <div>
                            <strong className="text-[#111827] text-sm block font-extrabold">{customer.name}</strong>
                            <span className="text-zinc-400 font-semibold">{customer.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Phone */}
                      <td className="py-4 px-4 font-semibold text-zinc-600">
                        {customer.phone || '—'}
                      </td>

                      {/* Period Dates */}
                      <td className="py-4 px-4 text-[10px] text-zinc-500 font-semibold">
                        {sub ? (
                          <>
                            <div>S: {sub.startDate}</div>
                            <div>E: {sub.endDate}</div>
                          </>
                        ) : (
                          <span className="text-zinc-400 font-normal">No active schedule</span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                          isAccountActive 
                            ? 'bg-emerald-100/80 text-emerald-800' 
                            : 'bg-rose-100/80 text-rose-800'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isAccountActive ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                          {isAccountActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Payment Status & Captured Paid Amount */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black ${payInfo.statusBadgeClass}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${payInfo.status === 'captured' || payInfo.status === 'paid' ? 'bg-emerald-600' : 'bg-amber-500'}`}></span>
                            {payInfo.statusLabel}
                          </span>
                          <div className="text-xs font-black text-emerald-700">
                            ₹{payInfo.capturedAmount.toLocaleString()}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 pr-6 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {/* 1. Toggle Account Active / Inactive Action Icon */}
                          <button
                            onClick={() => handleToggleCustomerAccountStatus(customer)}
                            disabled={actionLoading === customer.id}
                            title={isAccountActive ? 'Deactivate Customer Account' : 'Activate Customer Account'}
                            className={`p-2 rounded-xl transition-colors border border-zinc-200/70 ${
                              isAccountActive 
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-600' 
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                            }`}
                          >
                            {isAccountActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>

                          {/* 2. View & Edit Details Eye Action Icon */}
                          <button
                            onClick={() => handleOpenInspector(customer)}
                            title="View & Edit Details"
                            className="p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/70 text-zinc-700 transition-colors"
                          >
                            <Eye className="h-4 w-4 text-zinc-600" />
                          </button>

                          {/* 3. Payment History Button */}
                          <button
                            onClick={() => handleOpenPaymentHistory(customer)}
                            title="View Selected Customer Payment History"
                            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 transition-colors flex items-center gap-1 text-xs font-black cursor-pointer shadow-2xs"
                          >
                            <Receipt className="h-4 w-4 text-amber-700" />
                            <span className="hidden lg:inline">History</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {currentCustomers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-400 font-semibold">
                      No customers match your search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={totalResults}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />

        {/* Modal 1: Add New Customer & Subscription Manual Entry */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/30 backdrop-blur-sm overflow-y-auto">
            <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200/80 p-6 md:p-8 animate-in fade-in-50 duration-200 text-[#111827]">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-xl font-extrabold mb-6 border-b border-zinc-100 pb-4">
                Manual Customer Registration & Subscription
              </h3>

              <form onSubmit={handleCreateCustomer} className="space-y-6">
                {/* Basic Customer Profile */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">1. Customer Basic Profile</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={addName}
                        onChange={(e) => setAddName(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={addEmail}
                        onChange={(e) => setAddEmail(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Phone Number (10 Digits) *</label>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        placeholder="e.g. 9876543210"
                        value={addPhone}
                        onChange={(e) => setAddPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Account Password</label>
                      <input
                        type="password"
                        placeholder="customer123"
                        value={addPassword}
                        onChange={(e) => setAddPassword(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">
                        Delivery Area * <span className="text-rose-500 text-[10px] font-extrabold">(Mandatory)</span>
                      </label>
                      <select
                        required
                        value={addAreaId}
                        onChange={(e) => setAddAreaId(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none bg-white cursor-pointer"
                      >
                        <option value="">-- Select Delivery Area --</option>
                        {areas.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Delivery Address *</label>
                      <input
                        type="text"
                        required
                        placeholder="Street, City, Zipcode..."
                        value={addAddress}
                        onChange={(e) => setAddAddress(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Subscription Attach Toggle */}
                <div className="border-t border-zinc-100 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">2. Dining Subscription Setup</h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300/60">
                          ENTRY TYPE: MANUAL
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                        Attach an initial subscription plan (Dynamic based on company plan type configuration).
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={attachSub} 
                        onChange={(e) => setAttachSub(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BBD915]"></div>
                    </label>
                  </div>

                  {attachSub && (
                    <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 space-y-4 animate-in fade-in-50 duration-150">
                      
                      {/* Show ONLY the company's default plan type configuration */}
                      {(Number(planConfig?.planType || 3) === 2 && (planConfig?.pricingCards || []).length > 0) ? (
                        /* Company Default: Pre-defined Card Plan (Type 2) */
                        <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
                          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span className="text-xs font-black text-[#111827] uppercase tracking-wider">Plan Type 2: Pre-defined Cards</span>
                            </div>
                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              ACTIVE PLAN TYPE 2 CONFIGURATION
                            </span>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                              Select Company Pre-defined Plan Card *
                            </label>
                            <select
                              value={selectedCardId}
                              onChange={(e) => handleCardSelect(e.target.value)}
                              className="w-full rounded-xl border border-zinc-200/80 bg-white px-3.5 py-2.5 text-xs font-bold text-[#111827] focus:border-zinc-400 focus:outline-none cursor-pointer"
                            >
                              {(planConfig?.pricingCards || []).map((card: any) => {
                                const cardDays = card.period === 'week' ? '7 Days' : card.period === 'days' ? `${card.durationDays || 14} Days` : '30 Days';
                                return (
                                  <option key={card.id} value={card.id}>
                                    {card.name} — ₹{card.price} / {cardDays} {card.tag ? `[${card.tag}]` : ''}
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {/* Selected Card Preview Box */}
                          {(() => {
                            const card = (planConfig?.pricingCards || []).find((c: any) => c.id === selectedCardId) || (planConfig?.pricingCards || [])[0];
                            if (!card) return null;
                            return (
                              <div className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-200/60 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-xs text-[#111827]">{card.name}</span>
                                  <span className="text-[10px] font-black uppercase bg-[#BBD915] text-[#111827] px-2 py-0.5 rounded-full border border-[#111827]/20">
                                    {card.tag || 'Popular'}
                                  </span>
                                </div>
                                {card.desc && <p className="text-[11px] text-zinc-500 leading-relaxed">{card.desc}</p>}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Daily Meals Included:</span>
                                  {['breakfast', 'lunch', 'dinner'].map((m) => {
                                    const inc = card.includedMeals;
                                    const isInc = !inc || (Array.isArray(inc) ? inc.map((x: string) => String(x).toLowerCase()).includes(m) : !!inc[m]);
                                    if (!isInc) return null;
                                    return (
                                      <span key={m} className="bg-emerald-100 text-emerald-800 font-extrabold text-[9px] px-2 py-0.5 rounded-md capitalize">
                                        ✓ {m}
                                      </span>
                                    );
                                  })}
                                </div>
                                {card.features && card.features.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {card.features.map((feat: any, idx: number) => {
                                      const featText = getFeatureString(feat);
                                      if (!featText) return null;
                                      return (
                                        <span key={idx} className="text-[9px] font-bold bg-white text-zinc-700 px-2 py-0.5 rounded border border-zinc-200">
                                          ✓ {featText}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-zinc-100 pt-3">
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Plan Total Price (₹)</label>
                              <input
                                type="number"
                                value={subPrice}
                                onChange={(e) => setSubPrice(Number(e.target.value))}
                                className="w-full rounded-xl border border-zinc-200/80 bg-white px-3 py-2 text-xs font-bold focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Duration (Days)</label>
                              <input
                                type="number"
                                min={1}
                                value={subDuration}
                                onChange={(e) => setSubDuration(Number(e.target.value))}
                                className="w-full rounded-xl border border-zinc-200/80 bg-white px-3 py-2 text-xs font-bold focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Start Date</label>
                              <input
                                type="date"
                                value={subStartDate}
                                onChange={(e) => setSubStartDate(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200/80 bg-white px-3 py-2 text-xs font-bold focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Calculated End Date</label>
                              <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs font-mono font-bold text-emerald-900">
                                {getSubEndDate() || '—'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Company Default: Custom Blueprint Plan */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2 mb-1">
                            <span className="text-xs font-extrabold text-[#111827] uppercase tracking-wider">Company Active Plan Type: Custom Blueprint</span>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Default Plan Configuration</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Dietary Blueprint</label>
                              <select
                                value={subDietType}
                                onChange={(e) => setSubDietType(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200/80 bg-white px-3 py-2 text-xs font-bold focus:outline-none"
                              >
                                {finalDietOptions.map((opt: string) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Plan Tier</label>
                              <select
                                value={subTier}
                                onChange={(e) => setSubTier(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200/80 bg-white px-3 py-2 text-xs font-bold focus:outline-none"
                              >
                                {finalTierOptions.map((opt: string) => (
                                  <option key={opt} value={opt.toLowerCase()}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Duration (Days)</label>
                              <select
                                value={subDuration}
                                onChange={(e) => setSubDuration(Number(e.target.value))}
                                className="w-full rounded-xl border border-zinc-200/80 bg-white px-3 py-2 text-xs font-bold focus:outline-none"
                              >
                                {finalDurationOptions.map((days: number) => (
                                  <option key={days} value={days}>{days} Days</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Start Date</label>
                              <input
                                type="date"
                                value={subStartDate}
                                onChange={(e) => setSubStartDate(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200/80 bg-white px-3 py-2 text-xs font-bold focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Calculated End Date</label>
                              <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs font-mono font-bold text-emerald-900">
                                {getSubEndDate() || '—'}
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Plan Total Price (₹)</label>
                              <input
                                type="number"
                                value={subPrice}
                                onChange={(e) => setSubPrice(Number(e.target.value))}
                                className="w-full rounded-xl border border-zinc-200/80 bg-white px-3 py-2 text-xs font-bold focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Included Meal Categories Selection (Custom Blueprint Only) */}
                          <div className="space-y-1.5 pt-2 border-t border-zinc-200/60">
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase">
                              Selected Meal Categories ({subSelectedMeals.length})
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {((planConfig?.mealOptions || []).length > 0
                                ? (planConfig.mealOptions || []).filter((m: any) => m.isActive !== false).map((m: any) => getFeatureString(m))
                                : (planConfig?.mealCategories || ['Breakfast', 'Lunch', 'Dinner'])
                              ).map((rawMeal: any, idx: number) => {
                                const mealName = getFeatureString(rawMeal);
                                if (!mealName) return null;
                                const isSelected = subSelectedMeals.some(m => getFeatureString(m) === mealName);
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        if (subSelectedMeals.length > 1) {
                                          setSubSelectedMeals(subSelectedMeals.filter((m) => getFeatureString(m) !== mealName));
                                        }
                                      } else {
                                        setSubSelectedMeals([...subSelectedMeals, mealName]);
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                      isSelected
                                        ? 'bg-[#111827] text-[#BBD915] border-[#111827] shadow-xs'
                                        : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                                    }`}
                                  >
                                    {isSelected ? '✓ ' : '+ '}{mealName}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Tier Targeted Customizations & Addons Selector (Custom Blueprint Only) */}
                          {activeTierGroups.length > 0 && (
                            <div className="border-t border-zinc-200/60 pt-3 space-y-3">
                              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                Select Customizations & Addons ({subTier.toUpperCase()} Tier)
                              </span>
                              <div className="space-y-3">
                                {activeTierGroups.map((group: any) => {
                                  const gId = group.id || group._id;
                                  const isVariant = group.type === 'variant';
                                  const groupSelectedIds = selectedCustomizations[gId] || [];

                                  return (
                                    <div key={gId} className="bg-white p-3 rounded-xl border border-zinc-200/80 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-[#111827]">{getFeatureString(group.name || group)}</span>
                                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-500">
                                          {group.type || 'addons'}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {(group.items || []).filter((it: any) => it.isActive !== false).map((item: any) => {
                                          const itId = item.id || item._id;
                                          const isChecked = groupSelectedIds.includes(itId);

                                          return (
                                            <label 
                                              key={itId} 
                                              className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                                isChecked 
                                                  ? 'border-[#111827] bg-zinc-50 font-bold' 
                                                  : 'border-zinc-200/60 hover:bg-zinc-50 text-zinc-600'
                                              }`}
                                            >
                                              <div className="flex items-center gap-2">
                                                <input
                                                  type={isVariant ? "radio" : "checkbox"}
                                                  name={`group-${gId}`}
                                                  checked={isChecked}
                                                  onChange={() => handleToggleCustomizationItem(gId, itId, isVariant)}
                                                  className="accent-[#111827]"
                                                />
                                                <span>{getFeatureString(item.name || item)}</span>
                                              </div>
                                              {Number(item.price) > 0 && (
                                                <span className="text-[10px] text-emerald-700 font-extrabold">+₹{Number(item.price).toFixed(2)}</span>
                                              )}
                                            </label>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="text-[10px] text-zinc-400 font-semibold border-t border-zinc-200/60 pt-2">
                        Subscription active period: <strong className="text-zinc-700">{subStartDate}</strong> to <strong className="text-zinc-700">{getSubEndDate()}</strong> ({subDuration} Days).
                      </div>
                      {/* Payment Mode / Payment Gateway Selector */}
                      <div className="border-t border-zinc-200/60 pt-4 mt-2">
                        <label className="block text-[11px] font-black uppercase text-zinc-500 tracking-wider mb-1.5">
                          3. Payment Mode & Gateway Capture *
                        </label>
                        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#111827]">Payment Gateway / Method</span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              addPaymentMethod.startsWith('Manual')
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}>
                              {addPaymentMethod.startsWith('Manual') ? 'Manual Offline Mode' : 'Online Gateway Mode'}
                            </span>
                          </div>
                          
                          <select
                            value={addPaymentMethod}
                            onChange={(e) => setAddPaymentMethod(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-bold text-[#111827] focus:bg-white focus:border-zinc-400 focus:outline-none cursor-pointer"
                          >
                            <optgroup label="Manual Payment Options (Offline)">
                              <option value="Manual Cash">Manual Cash Payment</option>
                              <option value="Manual Bank Transfer">Manual Bank Transfer</option>
                              <option value="Manual POS / Card">Manual POS Card Swipe</option>
                              <option value="Manual Cheque">Manual Cheque / Deposit</option>
                            </optgroup>
                            <optgroup label="Online Payment Gateways">
                              <option value="Razorpay (Online)">Razorpay Payment Gateway (Online)</option>
                              <option value="Online UPI / Card">Online UPI / NetBanking / Card</option>
                            </optgroup>
                          </select>
                          
                          <p className="text-[10px] text-zinc-400 font-semibold pt-1">
                            {addPaymentMethod.startsWith('Manual')
                              ? '✓ Recorded as Manual payment (Status: Paid / Captured).'
                              : '✓ Recorded as Online gateway payment via Razorpay / Online (Status: Paid / Captured).'}
                          </p>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-3 border-t border-zinc-100 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-8 py-3 text-xs font-bold border border-zinc-200/80 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCustomer}
                    className="flex items-center gap-2 rounded-full bg-[#111827] text-white hover:bg-zinc-800 px-10 py-3 text-xs font-extrabold shadow-md transition-all active:scale-[0.98]"
                  >
                    <span className="text-[#BBD915] font-black">+</span>
                    {isCreatingCustomer ? 'Creating Customer...' : 'Create Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Customer Details & Subscription Inspector */}
        {isModalOpen && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/30 backdrop-blur-sm overflow-y-auto">
            <div className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200/80 p-6 md:p-8 animate-in fade-in-50 duration-200 text-[#111827]">
              {/* Close Modal Button */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-xl font-extrabold mb-8 border-b border-zinc-100 pb-4">
                Customer Profile & Dining Subscription
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Column 1: Basic Information */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Basic Information</h4>
                    {!isEditingBasicInfo ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingBasicInfo(true)}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#111827] bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit Info
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingBasicInfo(false)}
                        className="text-xs font-bold text-zinc-400 hover:text-zinc-600 px-2 py-1"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {!isEditingBasicInfo ? (
                    /* Read-Only View */
                    <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 space-y-4 text-xs font-semibold text-[#111827]">
                      <div>
                        <span className="text-zinc-400 block text-[10px] font-bold uppercase">Full Name</span>
                        <span className="text-sm font-extrabold text-[#111827]">{selectedCustomer.name}</span>
                      </div>

                      <div>
                        <span className="text-zinc-400 block text-[10px] font-bold uppercase">Email Address</span>
                        <span className="text-zinc-700">{selectedCustomer.email}</span>
                      </div>

                      <div>
                        <span className="text-zinc-400 block text-[10px] font-bold uppercase">Phone Number</span>
                        <span className="text-zinc-700">{selectedCustomer.phone || '—'}</span>
                      </div>

                      <div>
                        <span className="text-zinc-400 block text-[10px] font-bold uppercase">Delivery Address</span>
                        <span className="text-zinc-700">{selectedCustomer.address || '—'}</span>
                      </div>

                      <div>
                        <span className="text-zinc-400 block text-[10px] font-bold uppercase">Account Status</span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 mt-1 text-[10px] font-bold uppercase tracking-wider ${
                          (selectedCustomer.status || 'active') === 'active'
                            ? 'bg-emerald-100/80 text-emerald-800'
                            : 'bg-rose-100/80 text-rose-800'
                        }`}>
                          {(selectedCustomer.status || 'active') === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Edit Form View */
                    <form onSubmit={handleSaveBasicInfo} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1.5">Full Name</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1.5">Email Address</label>
                        <input
                          type="email"
                          required
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1.5">Phone Number (10 Digits)</label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="e.g. 9876543210"
                          className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1.5">Delivery Address</label>
                        <textarea
                          rows={2}
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1.5">Account Status</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="w-full rounded-xl border border-zinc-200/80 px-4 py-2.5 text-xs font-bold focus:border-zinc-400 focus:outline-none"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingBasicInfo(false)}
                          className="flex-1 rounded-xl border border-zinc-200/80 text-zinc-600 font-bold text-xs py-3 hover:bg-zinc-50 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingBasicInfo}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#111827] text-white hover:bg-zinc-800 font-extrabold text-xs py-3 shadow-sm transition-all active:scale-[0.98]"
                        >
                          <Save className="h-4 w-4" />
                          {isSavingBasicInfo ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Column 2: Subscription Specifications */}
                <div className="space-y-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Subscription Specifications</h4>
                  
                  {!selectedCustomer.subscription ? (
                    <div className="rounded-2xl bg-zinc-50 border border-dashed border-zinc-200/80 p-6 text-center text-zinc-400 font-semibold text-xs">
                      This customer does not have any active or past food subscriptions.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-zinc-400 block text-[10px] font-bold uppercase">Plan Info</span>
                            <strong className="text-[#111827] text-base font-black">
                              {selectedCustomer.subscription.buildPlanDetails?.name || plans[selectedCustomer.subscription.planId]?.name || 'Custom Built Plan'}
                            </strong>
                          </div>
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            selectedCustomer.subscription.status === 'active' ? 'bg-emerald-100/80 text-emerald-800' : 'bg-amber-100/80 text-amber-800'
                          }`}>
                            {selectedCustomer.subscription.status}
                          </span>
                        </div>

                        {(() => {
                          const inspectorPayInfo = getCustomerPaymentInfo(selectedCustomer);
                          return (
                            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                              <div>
                                <span className="text-zinc-400 block text-[10px] font-bold uppercase">Start Date</span>
                                <span className="text-zinc-700">{selectedCustomer.subscription.startDate}</span>
                              </div>
                              <div>
                                <span className="text-zinc-400 block text-[10px] font-bold uppercase">End Date</span>
                                <span className="text-zinc-700">{selectedCustomer.subscription.endDate}</span>
                              </div>
                              <div>
                                <span className="text-zinc-400 block text-[10px] font-bold uppercase">Payment Status</span>
                                <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${inspectorPayInfo.statusBadgeClass}`}>
                                  {inspectorPayInfo.statusLabel}
                                </span>
                              </div>
                              <div>
                                <span className="text-zinc-400 block text-[10px] font-bold uppercase">Captured Paid Amount</span>
                                <span className="text-emerald-700 text-sm font-black">₹{inspectorPayInfo.capturedAmount.toLocaleString()}</span>
                              </div>
                              {inspectorPayInfo.razorpaySubscriptionId !== '—' && (
                                <div>
                                  <span className="text-zinc-400 block text-[10px] font-bold uppercase">Razorpay Subscription ID</span>
                                  <span className="font-mono text-[11px] text-zinc-700 font-bold">{inspectorPayInfo.razorpaySubscriptionId}</span>
                                </div>
                              )}
                              {inspectorPayInfo.razorpayPaymentId !== '—' && (
                                <div>
                                  <span className="text-zinc-400 block text-[10px] font-bold uppercase">Razorpay Payment ID</span>
                                  <span className="font-mono text-[11px] text-zinc-700 font-bold">{inspectorPayInfo.razorpayPaymentId}</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {selectedCustomer.subscription.buildPlanDetails && (
                          <div className="border-t border-zinc-200/80 pt-4 space-y-3 text-xs">
                            <span className="text-zinc-400 block text-[10px] font-bold uppercase">Custom Built Details</span>
                            {selectedCustomer.subscription.buildPlanDetails.dietType && (
                              <div>
                                <span className="text-zinc-400 block text-[10px]">Dietary blueprint</span>
                                <strong className="text-zinc-700 capitalize">{selectedCustomer.subscription.buildPlanDetails.dietType}</strong>
                              </div>
                            )}
                            {selectedCustomer.subscription.buildPlanDetails.tier && (
                              <div>
                                <span className="text-zinc-400 block text-[10px]">Chosen Plan Tier</span>
                                <strong className="text-zinc-700 capitalize">{selectedCustomer.subscription.buildPlanDetails.tier}</strong>
                              </div>
                            )}
                            {selectedCustomer.subscription.buildPlanDetails.duration && (
                              <div>
                                <span className="text-zinc-400 block text-[10px]">Select duration</span>
                                <strong className="text-zinc-700">{selectedCustomer.subscription.buildPlanDetails.duration} Days</strong>
                              </div>
                            )}
                            {selectedCustomer.subscription.buildPlanDetails.selectedDays && selectedCustomer.subscription.buildPlanDetails.selectedDays.length > 0 && (
                              <div>
                                <span className="text-zinc-400 block text-[10px]">Selected Days/Meals</span>
                                <strong className="text-zinc-700">{selectedCustomer.subscription.buildPlanDetails.selectedDays.join(', ')}</strong>
                              </div>
                            )}

                            {selectedCustomer.subscription.buildPlanDetails.customizations && selectedCustomer.subscription.buildPlanDetails.customizations.length > 0 && (
                              <div className="space-y-1.5 pt-2">
                                <span className="text-zinc-400 block text-[10px] font-bold uppercase">Addons & Customizations</span>
                                <div className="space-y-1 bg-white p-3 rounded-xl border border-zinc-200/80 text-[11px] font-semibold">
                                  {selectedCustomer.subscription.buildPlanDetails.customizations.map((g: any) => (
                                    <div key={g.groupId}>
                                      <span className="text-zinc-400">{g.groupName}: </span>
                                      <span className="text-zinc-700">
                                        {g.selectedItems.map((it: any) => `${it.name} (+₹${Number(it.price).toFixed(2)})`).join(', ')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Override control buttons */}
                      <div className="space-y-2">
                        <span className="block text-[11px] font-bold text-zinc-400 uppercase">Override Subscription Status</span>
                        <div className="flex flex-col sm:flex-row gap-2">
                          {selectedCustomer.subscription.status === 'active' ? (
                            <button
                              onClick={() => handleUpdateSubscriptionStatus(selectedCustomer.subscription.id, 'paused')}
                              disabled={actionLoading === selectedCustomer.subscription.id}
                              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/50 text-amber-800 py-2.5 text-xs font-semibold hover:bg-amber-50 transition-all active:scale-[0.98]"
                            >
                              <Pause className="h-4 w-4" />
                              Pause Plan
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateSubscriptionStatus(selectedCustomer.subscription.id, 'active')}
                              disabled={actionLoading === selectedCustomer.subscription.id}
                              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/50 text-emerald-800 py-2.5 text-xs font-semibold hover:bg-emerald-50 transition-all active:scale-[0.98]"
                            >
                              <Play className="h-4 w-4" />
                              Resume Plan
                            </button>
                          )}

                          <button
                            onClick={() => {
                              showConfirm('Are you sure you want to cancel this subscription?', () => {
                                handleUpdateSubscriptionStatus(selectedCustomer.subscription.id, 'cancelled');
                              }, 'Cancel Subscription');
                            }}
                            disabled={actionLoading === selectedCustomer.subscription.id}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-rose-200/80 bg-rose-50/50 text-rose-700 py-2.5 text-xs font-semibold hover:bg-rose-50 transition-all active:scale-[0.98]"
                          >
                            <X className="h-4 w-4" />
                            Cancel Plan
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Customer Payment History Modal Dialog */}
        {isHistoryModalOpen && historyCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs animate-in fade-in-50">
            <div className="w-full max-w-4xl bg-white rounded-3xl border border-zinc-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
              
              {/* Header */}
              <div className="p-6 pb-4 border-b border-zinc-150 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <img
                    src={getAvatarUrl(historyCustomer)}
                    alt={historyCustomer.name}
                    className="h-12 w-12 rounded-full object-cover bg-zinc-50 border border-zinc-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-[#111827]">{historyCustomer.name}</h3>
                      <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                        Payment History Ledger
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-semibold mt-0.5">
                      {historyCustomer.email} • {historyCustomer.phone || 'No Phone'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => exportCustomerPaymentHistoryCSV(historyCustomer)}
                    className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => setIsHistoryModalOpen(false)}
                    className="p-2 text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Body: Summary Cards + Payment History Table */}
              <div className="p-6 space-y-6 overflow-y-auto">
                {(() => {
                  const records = getCustomerPaymentHistory(historyCustomer);
                  const totalSpent = records.reduce((acc: number, r: any) => acc + (Number(r.amount) || 0), 0);
                  const successfulCount = records.filter((r: any) => r.status === 'paid' || r.status === 'completed').length;

                  return (
                    <>
                      {/* Summary Stat Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-zinc-50 border border-zinc-200/80 p-4 rounded-2xl">
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">Total Amount Paid</span>
                          <span className="text-xl font-black text-emerald-700">₹{totalSpent.toLocaleString()}</span>
                        </div>

                        <div className="bg-zinc-50 border border-zinc-200/80 p-4 rounded-2xl">
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">Total Transactions</span>
                          <span className="text-xl font-black text-[#111827]">{records.length} Records</span>
                        </div>

                        <div className="bg-zinc-50 border border-zinc-200/80 p-4 rounded-2xl">
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">Completed Payments</span>
                          <span className="text-xl font-black text-blue-700">{successfulCount} Successful</span>
                        </div>
                      </div>

                      {/* Payment History Table */}
                      <div className="rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-200/80 bg-zinc-50 text-zinc-500 text-[10px] font-black uppercase tracking-wider">
                              <th className="p-3.5 pl-5">Plan / Subscription</th>
                              <th className="p-3.5">Start Date</th>
                              <th className="p-3.5">End Date</th>
                              <th className="p-3.5">Paid Amount</th>
                              <th className="p-3.5">Payment Method</th>
                              <th className="p-3.5">Transaction ID</th>
                              <th className="p-3.5 pr-5 text-right">Payment Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200/50 text-xs text-[#111827]">
                            {records.map((rec: any, idx: number) => (
                              <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="p-3.5 pl-5">
                                  <div className="font-bold text-[#111827]">{rec.planName}</div>
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    {rec.dietType && (
                                      <span className="text-[9px] font-bold bg-zinc-100 text-zinc-600 px-1.5 py-0.2 rounded capitalize">{rec.dietType}</span>
                                    )}
                                    {rec.tier && (
                                      <span className="text-[9px] font-bold bg-zinc-100 text-zinc-600 px-1.5 py-0.2 rounded capitalize">{rec.tier}</span>
                                    )}
                                    {rec.duration && (
                                      <span className="text-[9px] font-bold bg-zinc-100 text-zinc-600 px-1.5 py-0.2 rounded">{rec.duration} Days</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3.5 font-mono font-bold text-zinc-700 text-xs">
                                  {rec.startDate}
                                </td>
                                <td className="p-3.5 font-mono font-bold text-zinc-700 text-xs">
                                  {rec.endDate}
                                </td>
                                <td className="p-3.5">
                                  <span className="font-black text-emerald-700 text-sm">
                                    ₹{Number(rec.amount).toLocaleString()}
                                  </span>
                                  {rec.amount === 0 && rec.nominalAmount > 0 && (
                                    <div className="text-[10px] text-zinc-400 font-semibold">(Plan: ₹{rec.nominalAmount})</div>
                                  )}
                                </td>
                                <td className="p-3.5 font-semibold text-zinc-600">
                                  {rec.paymentMethod}
                                </td>
                                <td className="p-3.5 font-mono text-[11px] text-zinc-500 max-w-[140px] truncate" title={rec.id}>
                                  {rec.id}
                                </td>
                                <td className="p-3.5 pr-5 text-right">
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                                    rec.status === 'paid' || rec.isCaptured
                                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                      : rec.status === 'pending'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                                  }`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${
                                      rec.status === 'paid' || rec.isCaptured ? 'bg-emerald-600' : rec.status === 'pending' ? 'bg-amber-600' : 'bg-rose-600'
                                    }`}></span>
                                    {rec.statusLabel || (rec.status === 'paid' ? 'Payment Success' : 'Payment Pending')}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {records.length === 0 && (
                              <tr>
                                <td colSpan={7} className="p-8 text-center text-zinc-400 font-semibold">
                                  No subscription or payment records found for this customer.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-150 bg-zinc-50 flex justify-between items-center text-xs font-bold text-zinc-500">
                <span>serveflow.in Customer Financial Ledger</span>
                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 text-[#111827] rounded-xl font-bold transition-all shadow-xs cursor-pointer"
                >
                  Close History
                </button>
              </div>

            </div>
          </div>
        )}

        <ModalAlert
          isOpen={alertConfig.isOpen}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          isConfirm={alertConfig.isConfirm}
          confirmText={alertConfig.confirmText}
          onConfirm={alertConfig.onConfirm}
          onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        />

      </main>
    </PermissionGuard>
  );
}
