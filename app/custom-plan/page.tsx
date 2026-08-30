'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../utils/api';
import { 
  RefreshCw, Trash2, Plus, Eye, Save, X, AlertCircle, CheckCircle2, Info, ChevronDown, ChevronUp, Lock, Edit, Sliders, Check
} from 'lucide-react';
import PermissionGuard from '../components/PermissionGuard';

export default function AdminCustomPlanPricing() {
  const router = useRouter();
  const [companyPlanType, setCompanyPlanType] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<'meal-selection' | 'pricing-cards' | 'pricing-matrix'>('pricing-cards');
  const [isEditMode, setIsEditMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Success / Error alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Preview Modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Collapsed state for pricing cards editor
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({});

  // Full Configuration State (combining Meal Selection & Pricing Cards)
  const [config, setConfig] = useState<any>({
    mealTypes: [],
    dietOptions: [],
    packageTypes: [],
    deliveryTimings: [],
    mealSelectionRules: [],
    durationsPricing: [],
    pricingCards: [],
    enhancements: []
  });

  // Customizations States
  const [activeCustomizationId, setActiveCustomizationId] = useState<string | null>(null);
  const [isCustGroupModalOpen, setIsCustGroupModalOpen] = useState(false);
  const [isCustItemModalOpen, setIsCustItemModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  
  // Customization Group Form State
  const [custGroupName, setCustGroupName] = useState('');
  const [custGroupTier, setCustGroupTier] = useState('standard');
  const [custGroupType, setCustGroupType] = useState<'addons' | 'variant'>('addons');
  const [custGroupChoiceType, setCustGroupChoiceType] = useState<'multiple' | 'limited' | 'mandatory'>('multiple');
  const [custGroupLimitCount, setCustGroupLimitCount] = useState(1);
  const [custGroupRateType, setCustGroupRateType] = useState<'per_meal' | 'per_day'>('per_meal');
  
  // Customization Item Form State
  const [custItemName, setCustItemName] = useState('');
  const [custItemPrice, setCustItemPrice] = useState(0);
  const [custItemType, setCustItemType] = useState('Veg');
  const [custItemIsActive, setCustItemIsActive] = useState(true);
  const [custItemIsDefault, setCustItemIsDefault] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  const addCustomizationGroup = () => {
    if (!custGroupName) {
      alert('Please enter a customization name');
      return;
    }
    if (editingGroupId) {
      const updated = (config.customizations || []).map((g: any) => {
        if (g.id === editingGroupId) {
          return {
            ...g,
            name: custGroupName,
            tier: custGroupTier,
            type: custGroupType,
            choiceType: custGroupType === 'addons' ? custGroupChoiceType : undefined,
            limitCount: custGroupType === 'addons' && custGroupChoiceType !== 'multiple' ? Number(custGroupLimitCount) : undefined,
            rateType: custGroupRateType
          };
        }
        return g;
      });
      setConfig({ ...config, customizations: updated });
      setEditingGroupId(null);
    } else {
      const newGroup = {
        id: `cust-${Date.now()}`,
        name: custGroupName,
        tier: custGroupTier,
        type: custGroupType,
        choiceType: custGroupType === 'addons' ? custGroupChoiceType : undefined,
        limitCount: custGroupType === 'addons' && custGroupChoiceType !== 'multiple' ? Number(custGroupLimitCount) : undefined,
        rateType: custGroupRateType,
        items: []
      };
      setConfig({
        ...config,
        customizations: [...(config.customizations || []), newGroup]
      });
    }
    setIsCustGroupModalOpen(false);
    setCustGroupName('');
    setCustGroupTier('standard');
    setCustGroupType('addons');
    setCustGroupChoiceType('multiple');
    setCustGroupLimitCount(1);
    setCustGroupRateType('per_meal');
  };

  const deleteCustomizationGroup = (groupId: string) => {
    if (confirm('Are you sure you want to delete this customization group?')) {
      setConfig({
        ...config,
        customizations: (config.customizations || []).filter((g: any) => g.id !== groupId)
      });
      if (activeCustomizationId === groupId) {
        setActiveCustomizationId(null);
      }
    }
  };

  const saveCustomizationItem = () => {
    if (!custItemName) {
      alert('Please enter an item name');
      return;
    }
    const items = (config.customizations || []).map((g: any) => {
      if (g.id === activeCustomizationId) {
        const newItems = [...(g.items || [])];
        const newItem = {
          id: editingItemIndex !== null && newItems[editingItemIndex] ? newItems[editingItemIndex].id : `item-${Date.now()}`,
          name: custItemName,
          price: Number(custItemPrice),
          type: custItemType,
          isActive: custItemIsActive,
          isDefault: custItemIsDefault
        };
        if (editingItemIndex !== null) {
          newItems[editingItemIndex] = newItem;
        } else {
          newItems.push(newItem);
        }
        return { ...g, items: newItems };
      }
      return g;
    });
    setConfig({ ...config, customizations: items });
    setIsCustItemModalOpen(false);
    resetCustItemForm();
  };

  const resetCustItemForm = () => {
    setCustItemName('');
    setCustItemPrice(0);
    setCustItemType('Veg');
    setCustItemIsActive(true);
    setCustItemIsDefault(false);
    setEditingItemIndex(null);
  };

  const deleteCustomizationItem = (itemIndex: number) => {
    if (confirm('Are you sure you want to delete this customization item?')) {
      const items = (config.customizations || []).map((g: any) => {
        if (g.id === activeCustomizationId) {
          const newItems = [...(g.items || [])];
          newItems.splice(itemIndex, 1);
          return { ...g, items: newItems };
        }
        return g;
      });
      setConfig({ ...config, customizations: items });
    }
  };

  const toggleItemActive = (groupIndex: number, itemIndex: number) => {
    const items = [...(config.customizations || [])];
    const group = { ...items[groupIndex] };
    const groupItems = [...(group.items || [])];
    groupItems[itemIndex] = { ...groupItems[itemIndex], isActive: !groupItems[itemIndex].isActive };
    group.items = groupItems;
    items[groupIndex] = group;
    setConfig({ ...config, customizations: items });
  };

  const toggleItemDefault = (groupIndex: number, itemIndex: number) => {
    const items = [...(config.customizations || [])];
    const group = { ...items[groupIndex] };
    const groupItems = [...(group.items || [])];
    
    if (group.type === 'variant') {
      // Variants can only have one default item
      groupItems.forEach((it: any, idx: number) => {
        it.isDefault = idx === itemIndex ? !it.isDefault : false;
      });
    } else {
      groupItems[itemIndex] = { ...groupItems[itemIndex], isDefault: !groupItems[itemIndex].isDefault };
    }
    
    group.items = groupItems;
    items[groupIndex] = group;
    setConfig({ ...config, customizations: items });
  };

  // Tab 3: Custom Price rules matrix state
  const [rules, setRules] = useState<any[]>([]);
  const [showAddonsInTab3, setShowAddonsInTab3] = useState(false);
  const [savingAddons, setSavingAddons] = useState(false);
  const [ruleDietType, setRuleDietType] = useState<string>('');
  const [ruleMeals, setRuleMeals] = useState<Record<string, boolean>>({});
  const [ruleTier, setRuleTier] = useState<string>('');
  const [rulePrices, setRulePrices] = useState<Record<string, string>>({});
  const [ruleStrikeouts, setRuleStrikeouts] = useState<Record<string, string>>({});
  const [ruleShowStrikeouts, setRuleShowStrikeouts] = useState<Record<string, boolean>>({});
  const [ruleRazorpayPlanIds, setRuleRazorpayPlanIds] = useState<Record<string, string>>({});
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [optionsActiveTab, setOptionsActiveTab] = useState<'diet' | 'meals' | 'tiers' | 'durations'>('diet');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [configData, companyData] = await Promise.all([
        apiRequest('/plans/config').catch(() => null),
        apiRequest('/auth/company-profile').catch(() => null),
      ]);

      const pt = Number(configData?.planType || companyData?.planType || 2);
      setCompanyPlanType(pt);

      if (configData) {
        setConfig(configData);
      }

      if (pt === 2) {
        setActiveTab('pricing-cards');
      } else if (pt === 3) {
        setActiveTab('pricing-matrix');
      } else {
        setActiveTab('meal-selection');
      }

      // Fetch Tab 3 Override Rules
      const rulesData = await apiRequest('/plans/custom-prices').catch(() => []);
      if (rulesData && Array.isArray(rulesData)) {
        setRules(rulesData);
      }
    } catch (err: any) {
      console.error('Failed to fetch plan configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle card collapse
  const toggleCollapse = (cardId: string) => {
    setCollapsedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  // --- ACTIONS FOR TAB 1 CONFIG ---

  // Meal Types
  const addMealType = () => {
    const newItems = [...(config.mealTypes || []), { id: `mt-${Date.now()}`, name: '', isActive: true }];
    setConfig({ ...config, mealTypes: newItems });
  };
  const updateMealType = (index: number, key: string, val: any) => {
    const items = [...(config.mealTypes || [])];
    items[index] = { ...items[index], [key]: val };
    setConfig({ ...config, mealTypes: items });
  };
  const deleteMealType = (index: number) => {
    const items = [...(config.mealTypes || [])];
    items.splice(index, 1);
    setConfig({ ...config, mealTypes: items });
  };

  // Diet Options
  const addDietOption = () => {
    const newItems = [...(config.dietOptions || []), { id: `do-${Date.now()}`, name: '', isActive: true }];
    setConfig({ ...config, dietOptions: newItems });
  };
  const updateDietOption = (index: number, key: string, val: any) => {
    const items = [...(config.dietOptions || [])];
    items[index] = { ...items[index], [key]: val };
    setConfig({ ...config, dietOptions: items });
  };
  const deleteDietOption = (index: number) => {
    const items = [...(config.dietOptions || [])];
    items.splice(index, 1);
    setConfig({ ...config, dietOptions: items });
  };

  // Package Types
  const addPackageType = () => {
    const newItems = [
      ...(config.packageTypes || []), 
      { id: `pt-${Date.now()}`, label: '', dietPricing: { Veg: 1000, NonVeg: 1200 }, isActive: true }
    ];
    setConfig({ ...config, packageTypes: newItems });
  };
  const updatePackageType = (index: number, key: string, val: any) => {
    const items = [...(config.packageTypes || [])];
    items[index] = { ...items[index], [key]: val };
    setConfig({ ...config, packageTypes: items });
  };
  const updatePackagePricing = (index: number, dietKey: string, val: any) => {
    const items = [...(config.packageTypes || [])];
    const dietPricing = { ...items[index].dietPricing, [dietKey]: Number(val) };
    items[index] = { ...items[index], dietPricing };
    setConfig({ ...config, packageTypes: items });
  };
  const deletePackageType = (index: number) => {
    const items = [...(config.packageTypes || [])];
    items.splice(index, 1);
    setConfig({ ...config, packageTypes: items });
  };

  // Delivery Timings
  const addDeliveryTiming = () => {
    const newItems = [
      ...(config.deliveryTimings || []),
      { id: `dt-${Date.now()}`, mealTime: 'Breakfast', label: '', timeRange: '08:00 AM - 10:00 AM', isActive: true }
    ];
    setConfig({ ...config, deliveryTimings: newItems });
  };
  const updateDeliveryTiming = (index: number, key: string, val: any) => {
    const items = [...(config.deliveryTimings || [])];
    items[index] = { ...items[index], [key]: val };
    setConfig({ ...config, deliveryTimings: items });
  };
  const deleteDeliveryTiming = (index: number) => {
    const items = [...(config.deliveryTimings || [])];
    items.splice(index, 1);
    setConfig({ ...config, deliveryTimings: items });
  };

  // Meal Selection Rules
  const addSelectionRule = () => {
    const newItems = [
      ...(config.mealSelectionRules || []),
      { id: `msr-${Date.now()}`, mealLabel: '', orderBefore: '', isActive: true }
    ];
    setConfig({ ...config, mealSelectionRules: newItems });
  };
  const updateSelectionRule = (index: number, key: string, val: any) => {
    const items = [...(config.mealSelectionRules || [])];
    items[index] = { ...items[index], [key]: val };
    setConfig({ ...config, mealSelectionRules: items });
  };
  const deleteSelectionRule = (index: number) => {
    const items = [...(config.mealSelectionRules || [])];
    items.splice(index, 1);
    setConfig({ ...config, mealSelectionRules: items });
  };

  // Durations & Pricing
  const addDurationPricing = () => {
    const packagePricingInit: Record<string, number> = {};
    (config.packageTypes || []).forEach((p: any) => {
      packagePricingInit[p.label || 'Standard'] = 1000;
    });

    const newItems = [
      ...(config.durationsPricing || []),
      { id: `dp-${Date.now()}`, days: 7, currency: '₹', packagePricing: packagePricingInit }
    ];
    setConfig({ ...config, durationsPricing: newItems });
  };
  const updateDurationPricing = (index: number, key: string, val: any) => {
    const items = [...(config.durationsPricing || [])];
    items[index] = { ...items[index], [key]: val };
    setConfig({ ...config, durationsPricing: items });
  };
  const updateDurationPackagePricing = (index: number, pkgLabel: string, val: any) => {
    const items = [...(config.durationsPricing || [])];
    const packagePricing = { ...items[index].packagePricing, [pkgLabel]: Number(val) };
    items[index] = { ...items[index], packagePricing };
    setConfig({ ...config, durationsPricing: items });
  };
  const deleteDurationPricing = (index: number) => {
    const items = [...(config.durationsPricing || [])];
    items.splice(index, 1);
    setConfig({ ...config, durationsPricing: items });
  };

  // --- ACTIONS FOR TAB 2 CONFIG ---

  const addPricingCard = () => {
    const newId = `pc-${Date.now()}`;
    const newCard = {
      id: newId,
      name: 'New Meal Plan',
      razorpayPlanId: '',
      tag: '',
      dietType: 'veg',
      description: 'Describe plan benefits here...',
      currency: '₹',
      price: 2999,
      period: 'month',
      durationDays: 30,
      durationLabel: '/month',
      showPrice: true,
      includedMeals: { breakfast: true, lunch: true, dinner: true },
      featureList: ['Fresh daily ingredients', 'Free delivery'],
      ctaLabel: 'Choose Plan',
      ctaStyle: 'Primary',
      mostPopular: false,
      highlightBorder: false
    };
    const newItems = [...(config.pricingCards || []), newCard];
    setConfig({ ...config, pricingCards: newItems });
    setEditingCardId(newId);
  };

  const updatePricingCard = (index: number, key: string, val: any) => {
    setConfig((prev: any) => {
      const items = [...(prev.pricingCards || [])];
      items[index] = { ...items[index], [key]: val };
      return { ...prev, pricingCards: items };
    });
  };

  const updatePricingCardFields = (index: number, fields: Record<string, any>) => {
    setConfig((prev: any) => {
      const items = [...(prev.pricingCards || [])];
      items[index] = { ...items[index], ...fields };
      return { ...prev, pricingCards: items };
    });
  };

  const deletePricingCard = async (index: number) => {
    const cardToDelete = (config.pricingCards || [])[index];
    const items = [...(config.pricingCards || [])];
    items.splice(index, 1);
    const updatedConfig = { ...config, pricingCards: items };
    setConfig(updatedConfig);
    if (cardToDelete && editingCardId === cardToDelete.id) {
      setEditingCardId(null);
    }
    try {
      await apiRequest('/plans/config', {
        method: 'POST',
        body: JSON.stringify(updatedConfig),
      });
      setSuccess('Card removed successfully.');
    } catch (e) {}
  };

  // Features inside Pricing Card
  const addCardFeature = (cardIndex: number) => {
    setConfig((prev: any) => {
      const cards = [...(prev.pricingCards || [])];
      const features = [...(cards[cardIndex]?.featureList || []), ''];
      cards[cardIndex] = { ...cards[cardIndex], featureList: features };
      return { ...prev, pricingCards: cards };
    });
  };

  const updateCardFeature = (cardIndex: number, featureIndex: number, val: string) => {
    setConfig((prev: any) => {
      const cards = [...(prev.pricingCards || [])];
      const features = [...(cards[cardIndex]?.featureList || [])];
      features[featureIndex] = val;
      cards[cardIndex] = { ...cards[cardIndex], featureList: features };
      return { ...prev, pricingCards: cards };
    });
  };

  const deleteCardFeature = (cardIndex: number, featureIndex: number) => {
    setConfig((prev: any) => {
      const cards = [...(prev.pricingCards || [])];
      const features = [...(cards[cardIndex]?.featureList || [])];
      features.splice(featureIndex, 1);
      cards[cardIndex] = { ...cards[cardIndex], featureList: features };
      return { ...prev, pricingCards: cards };
    });
  };

  const getCardMealStatus = (card: any, mealKey: 'breakfast' | 'lunch' | 'dinner') => {
    if (!card || !card.includedMeals) return true;
    if (Array.isArray(card.includedMeals)) {
      return card.includedMeals.map((m: string) => String(m).toLowerCase()).includes(mealKey.toLowerCase());
    }
    return !!card.includedMeals[mealKey];
  };

  const toggleCardMeal = (cardIndex: number, mealKey: 'breakfast' | 'lunch' | 'dinner', checked: boolean) => {
    setConfig((prev: any) => {
      const cards = [...(prev.pricingCards || [])];
      const currentCard = cards[cardIndex] || {};
      let inc: any = currentCard.includedMeals;
      if (!inc || Array.isArray(inc)) {
        const existing = Array.isArray(inc)
          ? inc.map((m: string) => String(m).toLowerCase())
          : ['breakfast', 'lunch', 'dinner'];
        inc = {
          breakfast: existing.includes('breakfast'),
          lunch: existing.includes('lunch'),
          dinner: existing.includes('dinner'),
        };
      } else {
        inc = { ...inc };
      }
      inc[mealKey] = checked;
      cards[cardIndex] = { ...cards[cardIndex], includedMeals: inc };
      return { ...prev, pricingCards: cards };
    });
  };

  // Submit full Configuration
  const handleSaveConfig = async () => {
    setError('');
    setSuccess('');

    // Validations
    if (config.mealTypes.some((m: any) => !m.name.trim())) {
      setError('Please provide a name for all Meal Types.');
      return;
    }
    if (config.dietOptions.some((d: any) => !d.name.trim())) {
      setError('Please provide a name for all Diet Options.');
      return;
    }
    if (config.packageTypes.some((p: any) => !p.label.trim())) {
      setError('Please provide a label for all Package Types.');
      return;
    }

    setSaving(true);
    try {
      await apiRequest('/plans/config', {
        method: 'POST',
        body: JSON.stringify(config),
      });

      setSuccess('Configurations saved successfully!');
      setIsEditMode(false);
      fetchInitialData();
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration updates.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddons = async () => {
    setError('');
    setSuccess('');
    setSavingAddons(true);
    try {
      await apiRequest('/plans/config', {
        method: 'POST',
        body: JSON.stringify(config),
      });
      setSuccess('Add-ons configuration saved successfully!');
      fetchInitialData();
    } catch (err: any) {
      setError(err.message || 'Failed to save Add-ons.');
    } finally {
      setSavingAddons(false);
    }
  };

  // Dynamic Diet Options
  const handleAddDietOptionObj = () => {
    const name = prompt('Enter new Dietary Blueprint Option name (e.g. Vegan, Keto):');
    if (name && name.trim()) {
      const newItems = [...(config.dietOptions || []), { id: `do-${Date.now()}`, name: name.trim(), isActive: true }];
      setConfig({ ...config, dietOptions: newItems });
    }
  };
  const updateDietOptionObj = (index: number, key: string, val: any) => {
    const items = [...(config.dietOptions || [])];
    items[index] = { ...items[index], [key]: val };
    setConfig({ ...config, dietOptions: items });
  };
  const deleteDietOptionObj = (index: number) => {
    const items = [...(config.dietOptions || [])];
    items.splice(index, 1);
    setConfig({ ...config, dietOptions: items });
  };

  // Dynamic Meal Options
  const handleAddMealOptionObj = () => {
    const name = prompt('Enter new Meal Category name (e.g. Snacks, Drinks):');
    if (name && name.trim()) {
      const newItems = [...(config.mealOptions || []), { 
        id: `mo-${Date.now()}`, 
        name: name.trim(), 
        deliveryTimeFrom: '07:00 AM',
        deliveryTimeTo: '09:00 AM',
        isActive: true 
      }];
      setConfig({ ...config, mealOptions: newItems });
    }
  };
  const updateMealOptionObj = (index: number, key: string, val: any) => {
    const items = [...(config.mealOptions || [])];
    items[index] = { ...items[index], [key]: val };
    setConfig({ ...config, mealOptions: items });
  };
  const deleteMealOptionObj = (index: number) => {
    const items = [...(config.mealOptions || [])];
    items.splice(index, 1);
    setConfig({ ...config, mealOptions: items });
  };

  // Dynamic Tier Options
  const handleAddTierOptionObj = () => {
    const name = prompt('Enter new Plan Tier name (e.g. VIP, Basic):');
    if (name && name.trim()) {
      const newItems = [...(config.tierOptions || []), { id: `to-${Date.now()}`, name: name.trim(), isActive: true }];
      setConfig({ ...config, tierOptions: newItems });
    }
  };
  const updateTierOptionObj = (index: number, key: string, val: any) => {
    const items = [...(config.tierOptions || [])];
    items[index] = { ...items[index], [key]: val };
    setConfig({ ...config, tierOptions: items });
  };
  const deleteTierOptionObj = (index: number) => {
    const items = [...(config.tierOptions || [])];
    items.splice(index, 1);
    setConfig({ ...config, tierOptions: items });
  };

  // Dynamic Duration Options
  const handleAddDurationOptionObj = () => {
    const daysStr = prompt('Enter new Duration cycle in days (e.g. 20, 45, 60):');
    if (daysStr && daysStr.trim()) {
      const days = parseInt(daysStr.trim(), 10);
      if (isNaN(days) || days <= 0) {
        alert('Please enter a valid positive integer.');
        return;
      }
      const newItems = [...(config.durationOptions || []), { id: `du-${Date.now()}`, value: days, isActive: true }].sort((a, b) => a.value - b.value);
      setConfig({ ...config, durationOptions: newItems });
    }
  };
  const updateDurationOptionObj = (index: number, key: string, val: any) => {
    const items = [...(config.durationOptions || [])];
    items[index] = { ...items[index], [key]: val };
    setConfig({ ...config, durationOptions: items });
  };
  const deleteDurationOptionObj = (index: number) => {
    const items = [...(config.durationOptions || [])];
    items.splice(index, 1);
    setConfig({ ...config, durationOptions: items });
  };

  const handleSaveOptionsConfig = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await apiRequest('/plans/config', {
        method: 'POST',
        body: JSON.stringify(config),
      });
      setSuccess('Customizer blueprint options saved successfully!');
      setIsOptionsModalOpen(false);
      fetchInitialData();
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration updates.');
    } finally {
      setSaving(false);
    }
  };

  const openRuleModal = () => {
    setEditingRuleId(null);

    // 1. Dietary Option preselection
    const firstActiveDiet = (config.dietOptions || []).find((d: any) => d.isActive);
    setRuleDietType(firstActiveDiet ? firstActiveDiet.name : '');
    
    // 2. Meal Categories preselection
    const initialMeals: Record<string, boolean> = {};
    (config.mealOptions || []).forEach((m: any) => {
      if (m.isActive) {
        initialMeals[m.name.toLowerCase()] = true;
      }
    });
    setRuleMeals(initialMeals);

    // 3. Plan Tier preselection
    const firstActiveTier = (config.tierOptions || []).find((t: any) => t.isActive);
    setRuleTier(firstActiveTier ? firstActiveTier.name.toLowerCase() : '');

    // Clear dynamic pricing overrides states
    setRulePrices({});
    setRuleStrikeouts({});
    setRuleShowStrikeouts({});
    setRuleRazorpayPlanIds({});

    setIsRuleModalOpen(true);
  };

  const openEditRuleModal = (rule: any) => {
    setEditingRuleId(rule.id);
    setRuleDietType(rule.dietType || '');
    setRuleTier((rule.tier || '').toLowerCase());

    const mealsMap: Record<string, boolean> = {};
    (rule.meals || []).forEach((m: string) => {
      mealsMap[m.toLowerCase()] = true;
    });
    setRuleMeals(mealsMap);

    const durKey = String(rule.duration);
    setRulePrices({ [durKey]: String(rule.price ?? '') });
    setRuleStrikeouts({ [durKey]: rule.strikeoutPrice ? String(rule.strikeoutPrice) : '' });
    setRuleShowStrikeouts({ [durKey]: !!rule.showStrikeout });
    setRuleRazorpayPlanIds({ [durKey]: rule.razorpayPlanId || '' });

    setIsRuleModalOpen(true);
  };

  // --- ACTIONS FOR TAB 3 CONFIG (OVERRIDE RULES) ---

  const handleSaveOverrideRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const selectedMeals = config.isMealsStepActive !== false
      ? Object.keys(ruleMeals).filter(k => ruleMeals[k])
      : [];

    if (config.isMealsStepActive !== false && selectedMeals.length === 0) {
      setError('Select at least one meal category for the pricing override.');
      return;
    }

    const activeDurationsList = (config.durationOptions || [])
      .filter((d: any) => d.isActive)
      .map((d: any) => Number(d.value));
    const durations = activeDurationsList.length > 0 ? activeDurationsList : [7, 15, 30];
    const isDurationsActive = config.isDurationsStepActive !== false;
    const coords = [];

    if (isDurationsActive) {
      for (const d of durations) {
        const valStr = rulePrices[String(d)];
        if (editingRuleId && !valStr) continue;

        const val = valStr ? Number(valStr) : 0;
        if (isNaN(val) || val <= 0) {
          setError(`Please provide a positive rate for ${d} Days duration.`);
          return;
        }
        const sValStr = ruleStrikeouts[String(d)];
        const s = sValStr ? Number(sValStr) : undefined;
        const rzpId = (ruleRazorpayPlanIds[String(d)] || '').trim();
        coords.push({
          value: d,
          price: val,
          strikeoutPrice: s,
          showStrikeout: !!ruleShowStrikeouts[String(d)],
          razorpayPlanId: rzpId,
        });
      }
    }

    if (coords.length === 0) {
      setError('Please provide price details for at least one duration.');
      return;
    }

    setSaving(true);
    try {
      // First save the updated active states in config
      await apiRequest('/plans/config', {
        method: 'POST',
        body: JSON.stringify(config),
      });

      for (const c of coords) {
        await apiRequest('/plans/custom-prices', {
          method: 'POST',
          body: JSON.stringify({
            ...(editingRuleId ? { id: editingRuleId } : {}),
            dietType: config.isDietaryBlueprintActive !== false ? ruleDietType : '',
            tier: config.isTiersStepActive !== false ? ruleTier : '',
            meals: selectedMeals,
            duration: c.value,
            price: c.price,
            strikeoutPrice: c.strikeoutPrice,
            showStrikeout: c.showStrikeout,
            razorpayPlanId: c.razorpayPlanId || '',
          }),
        });
      }

      setSuccess(editingRuleId ? 'Pricing override rule updated successfully.' : 'Pricing override rule coordinate registered successfully.');
      setIsRuleModalOpen(false);
      // Reset inputs
      setRulePrices({});
      setRuleStrikeouts({});
      setRuleShowStrikeouts({});
      setRuleRazorpayPlanIds({});
      setEditingRuleId(null);
      fetchInitialData();
    } catch (err: any) {
      setError(err.message || 'Failed to save price rule override.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to remove this price coordinate rule?')) return;
    try {
      await apiRequest(`/plans/custom-prices/${id}`, {
        method: 'DELETE',
      });
      fetchInitialData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete rule.');
    }
  };

  const formatMealsList = (mealsList: string[]) => {
    return (mealsList || []).map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ');
  };

  if (loading) {
    return (
      <PermissionGuard permission="customPlan">
        <main className="flex-1 flex items-center justify-center h-[80vh] bg-[#F9FBE7]">
          <div className="text-center space-y-3">
            <div className="h-9 w-9 border-4 border-[#BBD915] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-black text-zinc-600">Loading plan configurations...</p>
          </div>
        </main>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permission="customPlan">
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-6">
          
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/50 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                {companyPlanType === 2 ? (
                  <span className="bg-[#BBD915] text-[#111827] font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    Plan Type 2: Pre-defined Cards
                  </span>
                ) : companyPlanType === 3 ? (
                  <span className="bg-emerald-600 text-white font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    Plan Type 3: Custom Price Matrix
                  </span>
                ) : (
                  <span className="bg-[#111827] text-white font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    Plan Type 1: Meal Selection
                  </span>
                )}
                <span className="text-[11px] text-zinc-400 font-bold">• Company Designated Model</span>
              </div>
              <h1 className="text-2xl font-black text-[#111827]">
                {companyPlanType === 2 ? 'Pricing Cards Configuration' :
                 companyPlanType === 3 ? 'Custom Plan Pricing Matrix' :
                 'Meal Selection Plan Configuration'}
              </h1>
              <p className="text-xs text-zinc-500 font-semibold mt-0.5">
                {companyPlanType === 2 ? 'Configure subscription marketing cards, duration pricing, and meal features.' :
                 companyPlanType === 3 ? 'Configure interactive multi-variable pricing matrix overrides and customization add-ons.' :
                 'Configure meal selection rules, dietary preferences, and delivery timings.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {companyPlanType !== 3 && (
                <>
                  {/* Preview Button (Launch Modal matching screenshot 2) */}
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-white border border-zinc-250 text-zinc-700 hover:bg-zinc-50 font-bold text-xs px-4.5 py-2.5 shadow-sm"
                  >
                    <Eye className="h-4 w-4 text-zinc-500" />
                    Preview Plan
                  </button>

                  {/* Save Configuration Trigger (Hidden on Plan Type 2 as each card has its own Save button) */}
                  {companyPlanType !== 2 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveConfig}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-[#BBD915] hover:bg-[#a6c212] text-[#111827] font-black text-xs px-5 py-2.5 shadow-md shadow-[#BBD915]/10 transition-all active:scale-[0.98]"
                      >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Configuration'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-2 text-xs font-bold text-red-750 bg-red-50 border border-red-200 p-4 rounded-2xl shadow-sm">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-xs font-bold text-green-750 bg-green-50 border border-green-200 p-4 rounded-2xl shadow-sm">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Active Company Plan Model Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                companyPlanType === 2 ? 'bg-[#BBD915] text-[#111827]' :
                companyPlanType === 3 ? 'bg-emerald-600 text-white' :
                'bg-[#111827] text-white'
              }`}>
                {companyPlanType === 2 ? 'P2' : companyPlanType === 3 ? 'P3' : 'P1'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    companyPlanType === 2 ? 'bg-[#BBD915]/20 text-[#111827]' :
                    companyPlanType === 3 ? 'bg-emerald-100 text-emerald-800' :
                    'bg-zinc-100 text-zinc-800'
                  }`}>
                    {companyPlanType === 2 ? 'Plan Type 2 — Pre-defined Pricing Cards' :
                     companyPlanType === 3 ? 'Plan Type 3 — Custom Pricing Matrix' :
                     'Plan Type 1 — Meal Selection Blueprint'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold">• Active Company Model</span>
                </div>
                <p className="text-xs text-zinc-600 font-medium mt-0.5">
                  {companyPlanType === 2 ? 'Your customer storefront uses fixed pricing cards. Add, edit, or configure tier cards below.' :
                   companyPlanType === 3 ? 'Your customer storefront uses multi-dimensional pricing matrix overrides. Manage rates and add-ons below.' :
                   'Your customer storefront uses meal selection blueprint rules. Configure dietary preferences and timings below.'}
                </p>
              </div>
            </div>
          </div>

          {/* Tab 1: Meal Selection Design Board (Plan Type 1) */}
          {companyPlanType === 1 && (
            <div className="space-y-8">
              
              {/* Row 1: Dietary Blueprint Preference */}
              <div className="max-w-2xl">
                <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-black text-[#111827]">Dietary Blueprint Preference</h3>
                    {isEditMode && (
                      <button
                        onClick={addDietOption}
                        className="flex items-center gap-1.5 text-[10px] font-black text-[#BBD915] bg-[#111827] hover:bg-zinc-850 px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        <Plus className="h-3 w-3" /> Add Dietary Blueprint
                      </button>
                    )}
                  </div>

                  <div className="space-y-3.5">
                    {(config.dietOptions || []).map((doItem: any, index: number) => (
                      <div key={doItem.id} className="flex items-center gap-3">
                        <input
                          type="text"
                          disabled={!isEditMode}
                          value={doItem.name}
                          onChange={(e) => updateDietOption(index, 'name', e.target.value)}
                          placeholder="e.g. Veg"
                          className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-[#111827] focus:border-[#BBD915] focus:outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase">Active</span>
                          <button
                            type="button"
                            disabled={!isEditMode}
                            onClick={() => updateDietOption(index, 'isActive', !doItem.isActive)}
                            className={`h-6 w-11 rounded-full p-0.5 transition-colors focus:outline-none ${
                              doItem.isActive ? 'bg-[#BBD915]' : 'bg-zinc-300'
                            }`}
                          >
                            <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
                              doItem.isActive ? 'transform translate-x-5' : ''
                            }`} />
                          </button>
                        </div>
                        {isEditMode && (
                          <button
                            onClick={() => deleteDietOption(index)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-red-655 hover:bg-red-50"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Package Types */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-[#111827]">Package Types</h3>
                  {isEditMode && (
                    <button
                      onClick={addPackageType}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#111827] bg-white border border-zinc-250 hover:bg-zinc-50 px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                      <Plus className="h-4 w-4" /> Add Package Type
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(config.packageTypes || []).map((pt: any, index: number) => (
                    <div key={pt.id} className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-sm space-y-4 relative">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 w-full max-w-[200px]">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">LABEL</label>
                          <input
                            type="text"
                            disabled={!isEditMode}
                            value={pt.label}
                            onChange={(e) => updatePackageType(index, 'label', e.target.value)}
                            placeholder="e.g. Standard"
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-[#111827] focus:border-[#BBD915] focus:outline-none"
                          />
                        </div>
                        {isEditMode && (
                          <button
                            onClick={() => deletePackageType(index)}
                            className="p-2 rounded-lg text-zinc-455 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">DIET PRICING</span>
                        
                        <div className="flex justify-between items-center gap-3">
                          <span className="text-xs font-bold text-zinc-700">Veg</span>
                          <div className="relative w-28">
                            <span className="absolute left-2.5 top-1.5 text-xs text-zinc-400 font-bold">₹</span>
                            <input
                              type="number"
                              disabled={!isEditMode}
                              value={pt.dietPricing?.Veg || 0}
                              onChange={(e) => updatePackagePricing(index, 'Veg', e.target.value)}
                              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-6 pr-2 py-1 text-xs font-black text-[#111827] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center gap-3">
                          <span className="text-xs font-bold text-zinc-700">Non-Veg</span>
                          <div className="relative w-28">
                            <span className="absolute left-2.5 top-1.5 text-xs text-zinc-400 font-bold">₹</span>
                            <input
                              type="number"
                              disabled={!isEditMode}
                              value={pt.dietPricing?.NonVeg || 0}
                              onChange={(e) => updatePackagePricing(index, 'NonVeg', e.target.value)}
                              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-6 pr-2 py-1 text-xs font-black text-[#111827] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2.5 border-t border-zinc-100">
                        <span className="text-xs font-bold text-zinc-650">Active Status</span>
                        <button
                          type="button"
                          disabled={!isEditMode}
                          onClick={() => updatePackageType(index, 'isActive', !pt.isActive)}
                          className={`h-6 w-11 rounded-full p-0.5 transition-colors focus:outline-none ${
                            pt.isActive ? 'bg-[#BBD915]' : 'bg-zinc-300'
                          }`}
                        >
                          <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
                            pt.isActive ? 'transform translate-x-5' : ''
                          }`} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3: Delivery Timings */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-[#111827]">Delivery Timings</h3>
                  {isEditMode && (
                    <button
                      onClick={addDeliveryTiming}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#111827] bg-white border border-zinc-250 hover:bg-zinc-50 px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                      <Plus className="h-4 w-4" /> Add Timing
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(config.deliveryTimings || []).map((dt: any, index: number) => (
                    <div key={dt.id} className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 w-full max-w-[200px]">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">MEAL TIME</label>
                          <select
                            disabled={!isEditMode}
                            value={dt.mealTime}
                            onChange={(e) => updateDeliveryTiming(index, 'mealTime', e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-[#111827] focus:outline-none"
                          >
                            <option value="Breakfast">Breakfast</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                          </select>
                        </div>
                        {isEditMode && (
                          <button
                            onClick={() => deleteDeliveryTiming(index)}
                            className="p-2 rounded-lg text-zinc-455 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3 pt-2.5 border-t border-zinc-100">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">LABEL</label>
                          <input
                            type="text"
                            disabled={!isEditMode}
                            value={dt.label}
                            onChange={(e) => updateDeliveryTiming(index, 'label', e.target.value)}
                            placeholder="e.g. Breakfast"
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-[#111827] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">TIME RANGE</label>
                          <input
                            type="text"
                            disabled={!isEditMode}
                            value={dt.timeRange}
                            onChange={(e) => updateDeliveryTiming(index, 'timeRange', e.target.value)}
                            placeholder="e.g. 07:00 AM - 09:00 AM"
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-[#111827] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2.5 border-t border-zinc-100">
                        <span className="text-xs font-bold text-zinc-650">Active Status</span>
                        <button
                          type="button"
                          disabled={!isEditMode}
                          onClick={() => updateDeliveryTiming(index, 'isActive', !dt.isActive)}
                          className={`h-6 w-11 rounded-full p-0.5 transition-colors focus:outline-none ${
                            dt.isActive ? 'bg-[#BBD915]' : 'bg-zinc-300'
                          }`}
                        >
                          <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
                            dt.isActive ? 'transform translate-x-5' : ''
                          }`} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 4: Meal Selection Rules */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-[#111827]">Meal Selection Rules</h3>
                  {isEditMode && (
                    <button
                      onClick={addSelectionRule}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#111827] bg-white border border-zinc-250 hover:bg-zinc-50 px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                      <Plus className="h-4 w-4" /> Add Rule
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(config.mealSelectionRules || []).map((msr: any, index: number) => (
                    <div key={msr.id} className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 w-full max-w-[200px]">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">MEAL LABEL</label>
                          <input
                            type="text"
                            disabled={!isEditMode}
                            value={msr.mealLabel}
                            onChange={(e) => updateSelectionRule(index, 'mealLabel', e.target.value)}
                            placeholder="e.g. Breakfast"
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-[#111827] focus:outline-none"
                          />
                        </div>
                        {isEditMode && (
                          <button
                            onClick={() => deleteSelectionRule(index)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-red-650 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-1 pt-2">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">ORDER BEFORE</label>
                        <input
                          type="text"
                          disabled={!isEditMode}
                          value={msr.orderBefore}
                          onChange={(e) => updateSelectionRule(index, 'orderBefore', e.target.value)}
                          placeholder="e.g. Previous day, 9:00 PM"
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-[#111827] focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2.5 border-t border-zinc-100">
                        <span className="text-xs font-bold text-zinc-650">Active Status</span>
                        <button
                          type="button"
                          disabled={!isEditMode}
                          onClick={() => updateSelectionRule(index, 'isActive', !msr.isActive)}
                          className={`h-6 w-11 rounded-full p-0.5 transition-colors focus:outline-none ${
                            msr.isActive ? 'bg-[#BBD915]' : 'bg-zinc-300'
                          }`}
                        >
                          <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
                            msr.isActive ? 'transform translate-x-5' : ''
                          }`} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 5: Duration & Pricing */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-[#111827]">Duration & Pricing</h3>
                  {isEditMode && (
                    <button
                      onClick={addDurationPricing}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#111827] bg-white border border-zinc-250 hover:bg-zinc-50 px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                      <Plus className="h-4 w-4" /> Add Duration
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(config.durationsPricing || []).map((dp: any, index: number) => (
                    <div key={dp.id} className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-zinc-700">Duration Settings</span>
                        {isEditMode && (
                          <button
                            onClick={() => deleteDurationPricing(index)}
                            className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-655"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Days</label>
                          <input
                            type="number"
                            disabled={!isEditMode}
                            value={dp.days}
                            onChange={(e) => updateDurationPricing(index, 'days', Number(e.target.value))}
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-[#111827] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Currency</label>
                          <select
                            disabled={!isEditMode}
                            value={dp.currency}
                            onChange={(e) => updateDurationPricing(index, 'currency', e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-[#111827] focus:outline-none"
                          >
                            <option value="₹">Rupees (₹)</option>
                            <option value="$">Dollars ($)</option>
                            <option value="€">Euros (€)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block font-sans">PACKAGE PRICING</span>
                        
                        {(config.packageTypes || []).map((pt: any) => {
                          const pkgLabel = pt.label || 'Standard';
                          const pkgPrice = dp.packagePricing?.[pkgLabel] || 0;
                          return (
                            <div key={pt.id} className="flex justify-between items-center gap-3">
                              <span className="text-xs font-bold text-zinc-700 capitalize">{pkgLabel}</span>
                              <div className="relative w-28">
                                <span className="absolute left-2.5 top-1.5 text-xs text-zinc-400 font-bold">{dp.currency}</span>
                                <input
                                  type="number"
                                  disabled={!isEditMode}
                                  value={pkgPrice}
                                  onChange={(e) => updateDurationPackagePricing(index, pkgLabel, e.target.value)}
                                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-6 pr-2 py-1 text-xs font-black text-[#111827] focus:outline-none"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  ) ) }
                </div>
              </div>

            </div>
          )}

          {/* Tab 2: Pricing Cards Configurator (Plan Type 2) */}
          {companyPlanType === 2 && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div>
                  <h3 className="text-lg font-black text-[#111827]">Marketing & Pricing Cards Configuration</h3>
                  <p className="text-xs text-zinc-500 font-semibold mt-0.5">Manage subscription plan cards displayed on your user plans page</p>
                </div>
                <button
                  type="button"
                  disabled={editingCardId !== null}
                  onClick={addPricingCard}
                  className="flex items-center gap-2 rounded-2xl bg-[#111827] text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed font-black text-xs px-5 py-3 shadow-md transition-all active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4 text-[#BBD915]" />
                  Add Pricing Card
                </button>
              </div>

              {/* Pricing Cards List */}
              <div className="grid grid-cols-1 gap-6">
                {(config.pricingCards || []).map((card: any, index: number) => {
                  const cardKey = card.id || `card-${index}`;
                  const isEditing = editingCardId === cardKey;
                  const isPopular = card.mostPopular || card.highlightBorder || card.tag === 'Most Popular';
                  const isAnotherEditing = editingCardId !== null && editingCardId !== cardKey;

                  return (
                    <div 
                      key={cardKey}
                      className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                        isEditing 
                          ? 'border-2 border-[#111827] shadow-md' 
                          : 'border-zinc-200/90 shadow-sm hover:border-zinc-300'
                      }`}
                    >
                      {/* Card Summary Header (Always visible) */}
                      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4.5 bg-zinc-50 border-b border-zinc-150">
                        <div className="flex items-center gap-4">
                          <span className="text-base font-black text-[#111827]">{card.name || `Card #${index + 1}`}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-orange-600">
                              {card.currency || '₹'}{Number(card.price || 0).toLocaleString()}
                              <span className="text-xs text-zinc-500 font-semibold ml-1">
                                {card.period === 'week' ? '/week (7 days)' : card.period === 'days' ? `/${card.durationDays || 14} days` : '/month (30 days)'}
                              </span>
                            </span>
                            {isPopular && (
                              <span className="bg-amber-100 text-amber-800 border border-amber-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                {card.tag || 'Most Popular'}
                              </span>
                            )}
                            {card.razorpayPlanId && (
                              <span className="bg-orange-100 text-orange-800 border border-orange-300 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                Razorpay ID: {card.razorpayPlanId}
                              </span>
                            )}
                            <div className="flex items-center gap-1 ml-2">
                              {['breakfast', 'lunch', 'dinner'].map((m) => {
                                const isInc = getCardMealStatus(card, m as any);
                                if (!isInc) return null;
                                return (
                                  <span key={m} className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[9px] px-2 py-0.5 rounded-md capitalize">
                                    {m}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isAnotherEditing}
                            onClick={() => setEditingCardId(isEditing ? null : cardKey)}
                            className={`flex items-center gap-1.5 text-xs font-extrabold px-4 py-2 rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                              isEditing
                                ? 'bg-[#111827] text-white border-[#111827]'
                                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                            }`}
                          >
                            <Edit className="h-3.5 w-3.5" />
                            {isEditing ? 'Close Editor' : 'Edit Card'}
                          </button>

                          <button
                            type="button"
                            disabled={isAnotherEditing}
                            onClick={() => deletePricingCard(index)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title="Delete Card"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Inline Card Inputs Editor (Only rendered when Edit Card is clicked) */}
                      {isEditing && (
                        <div className="p-6 bg-zinc-50/50 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Plan Title</label>
                                <input
                                  type="text"
                                  value={card.name || ''}
                                  onChange={(e) => updatePricingCard(index, 'name', e.target.value)}
                                  placeholder="e.g. Single Meal Plan"
                                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#111827] focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest block mb-1">Razorpay Plan ID</label>
                                <input
                                  type="text"
                                  value={card.razorpayPlanId || ''}
                                  onChange={(e) => updatePricingCard(index, 'razorpayPlanId', e.target.value)}
                                  placeholder="e.g. plan_N1a2B3c4D5e6F7"
                                  className="w-full rounded-xl border border-orange-200 bg-orange-50/40 px-3.5 py-2.5 text-xs font-mono font-bold text-[#111827] focus:outline-none focus:border-orange-500"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Badge / Tag</label>
                                  <input
                                    type="text"
                                    value={card.tag || ''}
                                    onChange={(e) => updatePricingCard(index, 'tag', e.target.value)}
                                    placeholder="e.g. Most Popular"
                                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#111827] focus:outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Price (₹)</label>
                                  <input
                                    type="number"
                                    value={card.price ?? 0}
                                    onChange={(e) => updatePricingCard(index, 'price', Number(e.target.value))}
                                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#111827] focus:outline-none"
                                  />
                                </div>
                              </div>

                              {/* Duration Options: Week, Month, Days */}
                              <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 space-y-3">
                                <label className="text-[10px] font-black text-[#111827] uppercase tracking-widest block">
                                  Plan Duration Option
                                </label>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Duration Cycle</label>
                                    <select
                                      value={card.period || 'month'}
                                      onChange={(e) => {
                                        const p = e.target.value;
                                        let days = card.durationDays || (p === 'week' ? 7 : p === 'days' ? 14 : 30);
                                        if (p === 'week') days = 7;
                                        if (p === 'month') days = 30;
                                        const label = p === 'week' ? '/week' : p === 'days' ? `/${days} days` : '/month';
                                        updatePricingCardFields(index, {
                                          period: p,
                                          durationDays: days,
                                          durationLabel: label,
                                        });
                                      }}
                                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#111827] focus:outline-none cursor-pointer"
                                    >
                                      <option value="week">Week (7 Days)</option>
                                      <option value="month">Month (30 Days)</option>
                                      <option value="days">Custom Days</option>
                                    </select>
                                  </div>

                                  {(card.period === 'days') ? (
                                    <div>
                                      <label className="text-[10px] font-bold text-orange-600 uppercase mb-1 block">Number of Days *</label>
                                      <input
                                        type="number"
                                        min={1}
                                        value={card.durationDays || 14}
                                        onChange={(e) => {
                                          const numDays = Math.max(1, Number(e.target.value) || 1);
                                          updatePricingCardFields(index, {
                                            durationDays: numDays,
                                            durationLabel: `/${numDays} days`,
                                          });
                                        }}
                                        placeholder="e.g. 15"
                                        className="w-full rounded-xl border-2 border-orange-300 bg-orange-50/40 px-3.5 py-2.5 text-xs font-black text-[#111827] focus:outline-none focus:border-orange-500"
                                      />
                                    </div>
                                  ) : (
                                    <div>
                                      <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">Cycle Days</label>
                                      <div className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-bold text-zinc-600">
                                        {card.period === 'week' ? '7 Days' : '30 Days'}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                                  <span>ℹ️ Subscription end date will be calculated as:</span>
                                  <strong className="font-mono">Start Date + {card.period === 'week' ? 7 : card.period === 'days' ? (card.durationDays || 14) : 30} Days</strong>
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Short Description</label>
                                <textarea
                                  value={card.description || ''}
                                  onChange={(e) => updatePricingCard(index, 'description', e.target.value)}
                                  rows={3}
                                  placeholder="Short description of the plan..."
                                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#111827] focus:outline-none resize-none"
                                />
                              </div>

                              <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-700">
                                  <input
                                    type="checkbox"
                                    checked={!!(card.mostPopular || card.highlightBorder)}
                                    onChange={(e) => {
                                      updatePricingCardFields(index, {
                                        mostPopular: e.target.checked,
                                        highlightBorder: e.target.checked,
                                      });
                                    }}
                                    className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                                  />
                                  <span>Highlight as Most Popular</span>
                                </label>
                              </div>

                              <div className="space-y-2 pt-2 border-t border-zinc-200/80">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">
                                  Daily Meals Included
                                </label>
                                <div className="flex flex-wrap items-center gap-5 bg-white p-3.5 rounded-xl border border-zinc-200">
                                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-700 select-none">
                                    <input
                                      type="checkbox"
                                      checked={getCardMealStatus(card, 'breakfast')}
                                      onChange={(e) => toggleCardMeal(index, 'breakfast', e.target.checked)}
                                      className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                                    />
                                    <span>Breakfast</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-700 select-none">
                                    <input
                                      type="checkbox"
                                      checked={getCardMealStatus(card, 'lunch')}
                                      onChange={(e) => toggleCardMeal(index, 'lunch', e.target.checked)}
                                      className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                                    />
                                    <span>Lunch</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-700 select-none">
                                    <input
                                      type="checkbox"
                                      checked={getCardMealStatus(card, 'dinner')}
                                      onChange={(e) => toggleCardMeal(index, 'dinner', e.target.checked)}
                                      className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                                    />
                                    <span>Dinner</span>
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Features List</label>
                                <div className="space-y-2">
                                  {(card.featureList || []).map((feat: string, featIdx: number) => (
                                    <div key={featIdx} className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={feat}
                                        onChange={(e) => updateCardFeature(index, featIdx, e.target.value)}
                                        className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#111827] focus:outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => deleteCardFeature(index, featIdx)}
                                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addCardFeature(index)}
                                  className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#111827] hover:text-orange-600 transition-colors"
                                >
                                  <Plus className="h-3.5 w-3.5" /> Add Feature Item
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end pt-4 border-t border-zinc-200/80">
                            <button
                              type="button"
                              onClick={async () => {
                                await handleSaveConfig();
                                setEditingCardId(null);
                              }}
                              disabled={saving}
                              className="flex items-center gap-2 rounded-xl bg-[#BBD915] text-[#111827] hover:bg-[#a6c212] font-black text-xs px-6 py-2.5 shadow-md transition-all"
                            >
                              <Save className="h-4 w-4" />
                              {saving ? 'Saving...' : 'Save Card'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Custom Price Override Matrix Rules (Plan Type 3) */}
          {companyPlanType === 3 && (
            <div className="space-y-6">
              
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <h3 className="text-lg font-black text-[#111827]">Active Pricing Matrix Overrides</h3>
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowAddonsInTab3(!showAddonsInTab3)}
                    className={`flex-1 lg:flex-initial flex items-center justify-center gap-2 rounded-xl border text-xs font-black px-5 py-2.5 transition-all active:scale-[0.98] ${
                      showAddonsInTab3
                        ? 'bg-[#111827] border-[#111827] text-white hover:bg-zinc-800'
                        : 'bg-white border-zinc-250 hover:bg-zinc-50 text-[#111827]'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    {showAddonsInTab3 ? 'Hide Add-ons' : 'Manage Add-ons'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOptionsModalOpen(true)}
                    className="flex-1 lg:flex-initial flex items-center justify-center gap-2 rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 text-[#111827] font-black text-xs px-5 py-2.5 transition-all active:scale-[0.98]"
                  >
                    <Sliders className="h-4 w-4" />
                    Manage Options
                  </button>

                  <button
                    type="button"
                    onClick={openRuleModal}
                    className="flex-1 lg:flex-initial flex items-center justify-center gap-2 rounded-xl bg-[#BBD915] hover:bg-[#a6c212] text-[#111827] font-black text-xs px-5 py-2.5 shadow-md shadow-[#BBD915]/10 transition-all active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Pricing Override
                  </button>
                </div>
              </div>

              {/* Conditionally render Plan Customizations Blueprint */}
              {showAddonsInTab3 && (
                <div className="bg-white rounded-3xl border border-zinc-200 p-4 sm:p-6 shadow-sm space-y-6">
                  
                  {activeCustomizationId === null ? (
                    // 1. CUSTOMIZATION GROUPS LIST
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                          <h3 className="text-base font-black text-[#111827]">Plan Customizations</h3>
                          <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Manage modular customizations, variants, and addons for different plan tiers.</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => {
                              setCustGroupName('');
                              setCustGroupTier((config.tierOptions?.find((t: any) => t.isActive)?.name || 'standard').toLowerCase());
                              setCustGroupType('addons');
                              setCustGroupChoiceType('multiple');
                              setCustGroupLimitCount(1);
                              setCustGroupRateType('per_meal');
                              setIsCustGroupModalOpen(true);
                            }}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-[10px] font-black text-[#BBD915] bg-[#111827] hover:bg-zinc-850 px-3.5 py-2 rounded-lg transition-all active:scale-[0.98]"
                          >
                            <Plus className="h-3 w-3" /> Add Customization
                          </button>
                          <button
                            onClick={handleSaveAddons}
                            disabled={savingAddons}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-[10px] font-black text-white bg-green-600 hover:bg-green-700 px-3.5 py-2 rounded-lg transition-all shadow-sm active:scale-[0.98]"
                          >
                            <Save className="h-3 w-3" /> {savingAddons ? 'Saving...' : 'Save Configuration'}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-white overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                              <th className="p-4 pl-6">Customization Name</th>
                              <th className="p-4">Target Tier</th>
                              <th className="p-4">Type</th>
                              <th className="p-4">Billing Rate</th>
                              <th className="p-4">Options Count</th>
                              <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(config.customizations || []).length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-8 text-center font-bold text-zinc-400">
                                  No customizations configured. Click "Add Customization" to begin.
                                </td>
                              </tr>
                            ) : (
                              (config.customizations || []).map((g: any) => (
                                <tr key={g.id} className="border-b border-zinc-150 hover:bg-zinc-50/50">
                                  <td className="p-4 pl-6 font-bold text-[#111827]">{g.name}</td>
                                  <td className="p-4 capitalize font-semibold text-zinc-650">{g.tier}</td>
                                  <td className="p-4 font-semibold text-zinc-600">
                                    {g.type === 'variant' ? (
                                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-[10px] font-bold">Variant (Single Choice)</span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-md text-[10px] font-bold">
                                        Addons ({g.choiceType === 'multiple' ? 'Multiple' : g.choiceType === 'limited' ? `Limit: ${g.limitCount}` : `Mandatory: ${g.limitCount}`})
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-4 font-semibold text-zinc-600">
                                    {g.rateType === 'per_meal' ? 'Per Meal' : 'Per Day'}
                                  </td>
                                  <td className="p-4 font-bold text-zinc-700">{g.items?.length || 0}</td>
                                  <td className="p-4 pr-6 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => setActiveCustomizationId(g.id)}
                                        title="Manage Items"
                                        className="text-indigo-600 hover:text-indigo-850 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors"
                                      >
                                        <Sliders className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setCustGroupName(g.name);
                                          setCustGroupTier(g.tier);
                                          setCustGroupType(g.type);
                                          setCustGroupChoiceType(g.choiceType || 'multiple');
                                          setCustGroupLimitCount(g.limitCount || 1);
                                          setCustGroupRateType(g.rateType);
                                          setEditingGroupId(g.id);
                                          setIsCustGroupModalOpen(true);
                                        }}
                                        title="Edit Group"
                                        className="text-amber-600 hover:text-amber-800 p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => deleteCustomizationGroup(g.id)}
                                        title="Delete Group"
                                        className="text-red-500 hover:text-red-750 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    // 2. CUSTOMIZATION GROUP ITEMS TABLE
                    <div>
                      {(() => {
                        const groupIndex = (config.customizations || []).findIndex((g: any) => g.id === activeCustomizationId);
                        const group = (config.customizations || [])[groupIndex];
                        if (!group) return null;
                        return (
                          <div>
                            <div className="flex justify-between items-center mb-6">
                              <button
                                onClick={() => setActiveCustomizationId(null)}
                                className="flex items-center gap-1 text-[10px] font-black text-zinc-500 hover:text-zinc-800 transition-colors"
                              >
                                ← Back to Customizations
                              </button>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    resetCustItemForm();
                                    setIsCustItemModalOpen(true);
                                  }}
                                  className="flex items-center gap-1.5 text-[10px] font-black text-[#BBD915] bg-[#111827] hover:bg-zinc-850 px-3.5 py-2 rounded-lg transition-all active:scale-[0.98]"
                                >
                                  <Plus className="h-3 w-3" /> Add Item
                                </button>
                                <button
                                  onClick={handleSaveAddons}
                                  disabled={savingAddons}
                                  className="flex items-center gap-1.5 text-[10px] font-black text-white bg-green-600 hover:bg-green-700 px-3.5 py-2 rounded-lg transition-all shadow-sm active:scale-[0.98]"
                                >
                                  <Save className="h-3 w-3" /> {savingAddons ? 'Saving...' : 'Save Configuration'}
                                </button>
                              </div>
                            </div>

                            <div className="mb-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200 text-left space-y-1">
                              <h4 className="text-sm font-black text-[#111827]">{group.name}</h4>
                              <p className="text-[10px] text-zinc-500 font-semibold">
                                Tier: <span className="capitalize font-black text-zinc-700">{group.tier}</span> &nbsp;|&nbsp; 
                                Type: <span className="capitalize font-black text-zinc-700">{group.type}</span> &nbsp;|&nbsp;
                                Rate: <span className="font-black text-zinc-700">{group.rateType === 'per_meal' ? 'Per Meal' : 'Per Day'}</span>
                                {group.type === 'addons' && (
                                  <span> &nbsp;|&nbsp; Selection: <span className="font-black text-zinc-700 capitalize">{group.choiceType} ({group.choiceType !== 'multiple' ? group.limitCount : 'Any'})</span></span>
                                )}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-white overflow-x-auto">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="p-4 pl-6">Option Name</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">Food Type</th>
                                    <th className="p-4">Active Status</th>
                                    <th className="p-4">Default Selected</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(group.items || []).length === 0 ? (
                                    <tr>
                                      <td colSpan={6} className="p-8 text-center font-bold text-zinc-400">
                                        No items added. Click "Add Item" to add selections.
                                      </td>
                                    </tr>
                                  ) : (
                                    (group.items || []).map((it: any, itemIndex: number) => (
                                      <tr key={it.id} className="border-b border-zinc-150 hover:bg-zinc-50/50">
                                        <td className="p-4 pl-6 font-bold text-[#111827]">{it.name}</td>
                                        <td className="p-4 font-bold text-zinc-650">${Number(it.price).toFixed(2)}</td>
                                        <td className="p-4 font-semibold text-zinc-500">{it.type}</td>
                                        <td className="p-4">
                                          <button
                                            type="button"
                                            onClick={() => toggleItemActive(groupIndex, itemIndex)}
                                            className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black tracking-wide border transition-all ${
                                              it.isActive
                                                ? 'bg-green-50 text-green-600 border-green-200'
                                                : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                                            }`}
                                          >
                                            {it.isActive ? 'ACTIVE' : 'INACTIVE'}
                                          </button>
                                        </td>
                                        <td className="p-4">
                                          <button
                                            type="button"
                                            onClick={() => toggleItemDefault(groupIndex, itemIndex)}
                                            className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black tracking-wide border transition-all ${
                                              it.isDefault
                                                ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                                                : 'bg-zinc-100 text-zinc-400 border border-zinc-250'
                                            }`}
                                          >
                                            {it.isDefault ? 'DEFAULT: ON' : 'DEFAULT: OFF'}
                                          </button>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                          <div className="flex items-center justify-end gap-1.5">
                                            <button
                                              onClick={() => {
                                                setCustItemName(it.name);
                                                setCustItemPrice(it.price);
                                                setCustItemType(it.type || 'Veg');
                                                setCustItemIsActive(it.isActive);
                                                setCustItemIsDefault(it.isDefault);
                                                setEditingItemIndex(itemIndex);
                                                setIsCustItemModalOpen(true);
                                              }}
                                              title="Edit Item"
                                              className="text-amber-600 hover:text-amber-850 p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                                            >
                                              <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                              onClick={() => deleteCustomizationItem(itemIndex)}
                                              title="Delete Item"
                                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                </div>
              )}

              {/* Table of explicit rules */}
              <div className="rounded-3xl border border-zinc-200/80 bg-white overflow-hidden overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-zinc-50 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="p-4 pl-6">Diet Blueprint</th>
                      <th className="p-4">Plan Tier</th>
                      <th className="p-4">Meals Included</th>
                      <th className="p-4">Duration Cycle</th>
                      <th className="p-4">Explicit Price</th>
                      <th className="p-4">Razorpay Plan ID</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-sm">
                    {rules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-4 pl-6">
                          <span className={`px-2.5 py-1 text-[10px] uppercase font-extrabold rounded-full ${
                            String(rule.dietType).toLowerCase() === 'veg'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : String(rule.dietType).toLowerCase() === 'non-veg'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {rule.dietType || 'All Diets'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-extrabold text-xs capitalize text-[#111827]">
                            {rule.tier || 'All Tiers'}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-500 font-semibold text-xs">
                          {formatMealsList(rule.meals)}
                        </td>
                        <td className="p-4 font-bold text-[#111827] text-xs">
                          {rule.duration} Days
                        </td>
                        <td className="p-4 font-black text-[#111827]">
                          ${Number(rule.price).toFixed(2)}
                          {rule.showStrikeout && rule.strikeoutPrice && (
                            <span className="text-zinc-400 line-through text-xs font-semibold ml-2">
                              ${Number(rule.strikeoutPrice).toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {rule.razorpayPlanId ? (
                            <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-800 border border-orange-200 font-mono font-bold text-[10px] px-2.5 py-1 rounded-lg">
                              {rule.razorpayPlanId}
                            </span>
                          ) : (
                            <span className="text-zinc-350 text-xs font-semibold">—</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditRuleModal(rule)}
                              title="Edit Override Rule"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              <Edit className="h-4.5 w-4.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRule(rule.id)}
                              title="Delete Override Rule"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {rules.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-zinc-500 font-bold">
                          No custom plan pricing rules configured. Custom plans fall back to dynamic calculations.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>

      {/* --- PREVIEW MODAL --- */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-6xl rounded-3xl bg-[#F9FBE7] border border-zinc-200 shadow-2xl overflow-hidden relative text-[#111827] flex flex-col max-h-[90vh]">
            
            {/* Modal Closer Header */}
            <div className="flex justify-between items-center px-6 py-4.5 bg-white border-b border-zinc-200">
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-[#111827]">
                  Preview – Plan Type {companyPlanType === 1 ? '1' : companyPlanType === 2 ? '2' : '3'}
                </h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  {companyPlanType === 1 
                    ? 'Meal selection & subscription configurations' 
                    : companyPlanType === 2
                    ? 'Marketing & pricing card configuration'
                    : 'Custom Matrix price overrides'
                  }
                </p>
              </div>
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-650 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Container */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12">
              {companyPlanType === 1 ? (
                // Tab 1 Summary
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm">
                    <h4 className="text-sm font-black text-[#111827] uppercase tracking-wider mb-4 pb-2 border-b border-zinc-100">Dietary Blueprint Preference</h4>
                    <div className="flex flex-wrap gap-2">
                      {(config.dietOptions || []).filter((d: any) => d.isActive).map((d: any) => (
                        <span key={d.id} className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-850 text-xs font-bold border border-zinc-200">{d.name}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm">
                    <h4 className="text-sm font-black text-[#111827] uppercase tracking-wider mb-4 pb-2 border-b border-zinc-100">Plan Tiers & Packages</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(config.packageTypes || []).filter((p: any) => p.isActive).map((p: any) => (
                        <div key={p.id} className="p-4 border rounded-2xl bg-zinc-50 border-zinc-200">
                          <span className="text-[9px] font-black uppercase bg-[#BBD915] text-[#111827] px-2 py-0.5 rounded tracking-wide">{p.label}</span>
                          <div className="mt-3 space-y-1 text-xs font-bold text-zinc-650">
                            <p>Veg Price: ₹{p.dietPricing?.Veg || 0}</p>
                            <p>Non-Veg Price: ₹{p.dietPricing?.NonVeg || 0}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : companyPlanType === 2 ? (
                // Tab 2 Cards Side-by-Side (Matching screenshot 2 exactly!)
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-center items-stretch gap-8">
                  {(config.pricingCards || []).map((card: any) => (
                    <div 
                      key={card.id}
                      className={`flex-1 max-w-sm bg-white rounded-3xl border border-zinc-200 p-8 shadow-md relative flex flex-col justify-between min-h-[480px] transition-all overflow-visible ${
                        card.highlightBorder ? 'border-t-4 border-t-[#BBD915]' : ''
                      }`}
                    >
                      {card.mostPopular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#BBD915] text-[#111827] text-[10px] font-black uppercase tracking-wider shadow-sm">
                          SAVE 10%
                        </div>
                      )}

                      <div className="space-y-4 flex-1 flex flex-col">
                        <div className="flex gap-2 items-center flex-wrap">
                          {card.tag && (
                            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md w-max bg-purple-100 text-purple-750">
                              {card.tag}
                            </span>
                          )}
                          <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md w-max border ${
                            card.dietType === 'non-veg'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {card.dietType === 'non-veg' ? 'Non-Veg' : 'Veg'}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                          {card.description || 'Ideal if you want to scale your team fast.'}
                        </p>

                        <div className="mt-6 flex items-baseline gap-0.5">
                          {card.showPrice ? (
                            <>
                              <span className="text-xl font-black text-[#111827]">{card.currency || '$'}</span>
                              <span className="text-4xl font-black text-[#111827]">{card.price ?? 0}</span>
                              <span className="text-xs text-zinc-400 font-bold ml-1">{card.durationLabel || '/month'}</span>
                            </>
                          ) : (
                            <span className="text-3xl font-black text-[#111827] leading-none py-1">Let's Talk!</span>
                          )}
                        </div>

                        <ul className="mt-8 space-y-3 flex-1">
                          {(card.featureList || []).map((feat: string, fIdx: number) => (
                            <li key={fIdx} className="flex items-center gap-2.5 text-xs text-zinc-650 font-bold">
                              <div className="h-4.5 w-4.5 rounded-full bg-[#BBD915]/20 flex items-center justify-center text-[#BBD915] shrink-0">
                                <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        className={`w-full mt-8 py-3.5 rounded-xl text-xs font-black transition-all shadow-sm ${
                          card.ctaStyle === 'Primary'
                            ? 'bg-[#BBD915] hover:bg-[#a6c212] text-[#111827]'
                            : 'bg-white border border-[#111827] text-[#111827] hover:bg-zinc-50'
                        }`}
                      >
                        {card.ctaLabel || 'Get Started'}
                      </button>

                    </div>
                  ))}
                </div>
              ) : (
                // Tab 3 Override Rules list
                <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm">
                  <h4 className="text-sm font-black text-[#111827] uppercase tracking-wider mb-4 pb-2 border-b border-zinc-100">
                    Pricing overrides summary ({rules.length} Active rules)
                  </h4>
                  <div className="space-y-3">
                    {rules.map((rule: any) => (
                      <div key={rule.id} className="flex justify-between items-center text-xs font-bold text-zinc-600 border-b border-zinc-50 pb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>
                            [{rule.dietType === 'veg' ? 'Veg' : 'Non-Veg'}] • {rule.tier.toUpperCase()} • {formatMealsList(rule.meals)}
                          </span>
                          {rule.razorpayPlanId && (
                            <span className="bg-orange-100 text-orange-800 border border-orange-200 font-mono text-[9px] px-2 py-0.5 rounded-md">
                              Razorpay: {rule.razorpayPlanId}
                            </span>
                          )}
                        </div>
                        <strong className="text-[#111827] font-black">
                          {rule.duration} Days: ${rule.price}
                          {rule.showStrikeout && rule.strikeoutPrice && (
                            <span className="text-zinc-400 line-through font-semibold text-[10px] ml-1.5">
                              (${rule.strikeoutPrice})
                            </span>
                          )}
                        </strong>
                      </div>
                    ))}
                    {rules.length === 0 && (
                      <p className="text-center text-zinc-450 py-4">No pricing overrides configured.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end items-center px-6 py-4 bg-white border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-xl bg-[#BBD915] hover:bg-[#a6c212] px-6 py-2.5 text-xs font-bold text-[#111827] shadow-md transition-all"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Pricing Rule Override Add Modal (Tab 3) */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-zinc-200 shadow-2xl overflow-hidden relative text-[#111827] flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-zinc-100 relative">
              <h3 className="text-lg font-black">{editingRuleId ? 'Edit Pricing Matrix Override' : 'Configure Custom Matrix Price'}</h3>
              <p className="text-xs text-zinc-500 font-semibold mt-0.5">
                {editingRuleId ? 'Update price and gateway settings for this matrix coordinate.' : 'Specify rules to override checkout plan costs.'}
              </p>
              <button 
                onClick={() => {
                  setIsRuleModalOpen(false);
                  setEditingRuleId(null);
                }}
                className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSaveOverrideRule} className="flex flex-col flex-1 overflow-hidden">
              
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Step 0: Veg or Non-Veg Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-zinc-555 uppercase tracking-wider block">0. Dietary Blueprint Preference</span>
                  </div>
                  <div className="flex justify-center flex-wrap gap-2 items-center">
                    <div className={`bg-zinc-100 p-1 flex flex-wrap gap-2 rounded-full w-full max-w-lg border border-zinc-250 bg-white transition-all items-center justify-center ${
                      config.isDietaryBlueprintActive === false ? 'opacity-50 pointer-events-none bg-zinc-50' : ''
                    }`}>
                      {(config.dietOptions || []).filter((d: any) => d.isActive).map((d: any) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setRuleDietType(d.name)}
                          className={`rounded-full py-2 px-4 text-xs font-black transition-all text-center ${
                            ruleDietType.toLowerCase() === d.name.toLowerCase() && config.isDietaryBlueprintActive !== false
                              ? 'bg-[#BBD915] text-[#111827] shadow-sm'
                              : 'text-zinc-555 hover:text-[#111827]'
                          }`}
                        >
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                                       {/* Step 1: Choose Meals */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-zinc-555 uppercase tracking-wider block">1. Choose your meals</span>
                  </div>
                  <div className="flex justify-center flex-wrap gap-2 items-center">
                    <div className={`bg-zinc-100 p-1 flex flex-wrap gap-2 rounded-full w-full max-w-lg border border-zinc-250 bg-white transition-all items-center justify-center ${
                      config.isMealsStepActive === false ? 'opacity-50 pointer-events-none bg-zinc-50' : ''
                    }`}>
                      {(config.mealOptions || []).filter((m: any) => m.isActive).map((m: any) => {
                        const lowM = m.name.toLowerCase();
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setRuleMeals({ ...ruleMeals, [lowM]: !ruleMeals[lowM] })}
                            className={`rounded-full py-2 px-4 text-xs font-black transition-all text-center ${
                              ruleMeals[lowM] && config.isMealsStepActive !== false
                                ? 'bg-[#BBD915] text-[#111827] shadow-sm'
                                : 'text-zinc-555 hover:text-[#111827]'
                            }`}
                          >
                            {m.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Step 2: Choose Plan Tier */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-zinc-555 uppercase tracking-wider block">2. Choose Plan Tier</span>
                  </div>
                  <div className="flex justify-center flex-wrap gap-2 items-center">
                    <div className={`bg-zinc-100 p-1 flex flex-wrap gap-2 rounded-full w-full max-w-lg border border-zinc-250 bg-white transition-all items-center justify-center ${
                      config.isTiersStepActive === false ? 'opacity-50 pointer-events-none bg-zinc-50' : ''
                    }`}>
                      {(config.tierOptions || []).filter((t: any) => t.isActive).map((t: any) => {
                        const lowT = t.name.toLowerCase();
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setRuleTier(lowT as any)}
                            className={`rounded-full py-2 px-4 text-xs font-black transition-all text-center ${
                              ruleTier === lowT && config.isTiersStepActive !== false
                                ? 'bg-[#BBD915] text-[#111827] shadow-sm'
                                : 'text-zinc-555 hover:text-[#111827]'
                            }`}
                          >
                            {t.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Step 3: Prices for Durations */}
                <div className="space-y-3 pt-2 border-t border-zinc-100 max-h-[350px] overflow-y-auto pr-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-zinc-555 uppercase tracking-wider block">3. Select Duration Rates & Gateway Settings</span>
                  </div>
                  
                  <div className={`space-y-4 transition-all ${
                    config.isDurationsStepActive === false ? 'opacity-50 pointer-events-none' : ''
                  }`}>
                    {(config.durationOptions || []).filter((d: any) => d.isActive).map((d: any) => {
                      const isActive = config.isDurationsStepActive !== false;
                      const sD = String(d.value);
                      return (
                        <div key={d.id} className={`p-3.5 rounded-2xl border transition-all space-y-3 bg-zinc-50 border-zinc-150`}>
                          <span className="text-[10px] font-black text-[#111827] uppercase tracking-wider block">{d.value} Days Duration</span>
                          <div className="grid grid-cols-3 gap-3.5 items-end">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase">Discount Price</label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-2 text-xs text-zinc-400 font-bold">$</span>
                                <input
                                  type="number"
                                  required={isActive && !editingRuleId}
                                  disabled={!isActive}
                                  step="0.01"
                                  value={rulePrices[sD] || ''}
                                  onChange={(e) => setRulePrices({ ...rulePrices, [sD]: e.target.value })}
                                  placeholder="99.00"
                                  className="w-full rounded-lg border border-zinc-200 bg-white pl-6 pr-2 py-1.5 text-xs font-bold text-[#111827] focus:border-[#BBD915] focus:outline-none disabled:bg-zinc-100 disabled:text-zinc-400"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase">Original Price</label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-2 text-xs text-zinc-400 font-bold">$</span>
                                <input
                                  type="number"
                                  disabled={!isActive}
                                  step="0.01"
                                  value={ruleStrikeouts[sD] || ''}
                                  onChange={(e) => setRuleStrikeouts({ ...ruleStrikeouts, [sD]: e.target.value })}
                                  placeholder="120.00"
                                  className="w-full rounded-lg border border-zinc-200 bg-white pl-6 pr-2 py-1.5 text-xs font-bold text-[#111827] focus:border-[#BBD915] focus:outline-none disabled:bg-zinc-100 disabled:text-zinc-400"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-center pb-2">
                              <label className={`flex items-center gap-1.5 select-none text-[9px] font-bold text-zinc-500 uppercase ${isActive ? 'cursor-pointer' : 'opacity-50 pointer-events-none'}`}>
                                <input
                                  type="checkbox"
                                  disabled={!isActive}
                                  checked={!!ruleShowStrikeouts[sD]}
                                  onChange={(e) => setRuleShowStrikeouts({ ...ruleShowStrikeouts, [sD]: e.target.checked })}
                                  className="rounded text-[#BBD915] focus:ring-[#BBD915] h-3.5 w-3.5"
                                />
                                <span>Strikeout On</span>
                              </label>
                            </div>
                          </div>

                          {/* Razorpay Plan ID Configuration for this duration coordinate */}
                          <div className="space-y-1 pt-1 border-t border-zinc-200/60">
                            <label className="text-[9px] font-black text-orange-600 uppercase tracking-wider flex items-center gap-1">
                              Razorpay Plan ID <span className="text-zinc-400 font-normal text-[8px]">(Optional)</span>
                            </label>
                            <input
                              type="text"
                              disabled={!isActive}
                              value={ruleRazorpayPlanIds[sD] || ''}
                              onChange={(e) => setRuleRazorpayPlanIds({ ...ruleRazorpayPlanIds, [sD]: e.target.value })}
                              placeholder="e.g. plan_N1a2B3c4D5e6F7"
                              className="w-full rounded-lg border border-orange-200 bg-orange-50/40 px-3 py-1.5 text-xs font-mono font-bold text-[#111827] focus:border-orange-500 focus:outline-none disabled:bg-zinc-100 disabled:text-zinc-400"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 p-6 bg-zinc-50 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsRuleModalOpen(false);
                    setEditingRuleId(null);
                  }}
                  className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-bold text-zinc-500 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#BBD915] hover:bg-[#a6c212] px-6 py-2.5 text-xs font-bold text-[#111827] shadow-md shadow-[#BBD915]/10 active:scale-95 transition-all"
                >
                  {saving ? 'Saving...' : editingRuleId ? 'Save Changes' : 'Save Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customization Group Add/Edit Modal */}
      {isCustGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-zinc-200 shadow-2xl overflow-hidden relative text-[#111827] flex flex-col">
            <div className="p-6 pb-4 border-b border-zinc-100 relative">
              <h3 className="text-lg font-black">{editingGroupId ? 'Edit Customization Group' : 'Add Customization Group'}</h3>
              <p className="text-xs text-zinc-500 font-semibold mt-0.5">{editingGroupId ? 'Update parameter coordinates for the customization group.' : 'Create a new customization group for your custom plan customization.'}</p>
              <button 
                onClick={() => setIsCustGroupModalOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-655 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Customization Name</label>
                <input
                  type="text"
                  value={custGroupName}
                  onChange={(e) => setCustGroupName(e.target.value)}
                  placeholder="e.g. Select Side Protein"
                  className="w-full rounded-xl border border-zinc-250 bg-white px-3 py-2 text-xs font-bold text-[#111827] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Target Tier (Select One)</label>
                <select
                  value={custGroupTier}
                  onChange={(e) => setCustGroupTier(e.target.value)}
                  className="w-full rounded-xl border border-zinc-250 bg-white px-3 py-2 text-xs font-bold text-[#111827] focus:outline-none capitalize"
                >
                  {((config.tierOptions || []).length > 0
                    ? config.tierOptions
                    : [{ id: 'standard', name: 'Standard' }, { id: 'premium', name: 'Premium' }, { id: 'platinum', name: 'Platinum' }]
                  ).map((t: any) => (
                    <option key={t.id} value={t.name.toLowerCase()}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Customization Type</label>
                  <select
                    value={custGroupType}
                    onChange={(e) => setCustGroupType(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-250 bg-white px-3 py-2 text-xs font-bold text-[#111827] focus:outline-none"
                  >
                    <option value="addons">Add-ons</option>
                    <option value="variant">Variant</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Billing Rate Type</label>
                  <select
                    value={custGroupRateType}
                    onChange={(e) => setCustGroupRateType(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-250 bg-white px-3 py-2 text-xs font-bold text-[#111827] focus:outline-none"
                  >
                    <option value="per_meal">Per Meal</option>
                    <option value="per_day">Per Day</option>
                  </select>
                </div>
              </div>

              {custGroupType === 'addons' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Choice Type</label>
                    <select
                      value={custGroupChoiceType}
                      onChange={(e) => setCustGroupChoiceType(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-250 bg-white px-3 py-2 text-xs font-bold text-[#111827] focus:outline-none"
                    >
                      <option value="multiple">Multiple (Any)</option>
                      <option value="limited">Limited</option>
                      <option value="mandatory">Mandatory</option>
                    </select>
                  </div>

                  {custGroupChoiceType !== 'multiple' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Selection Limit</label>
                      <select
                        value={custGroupLimitCount}
                        onChange={(e) => setCustGroupLimitCount(Number(e.target.value))}
                        className="w-full rounded-xl border border-zinc-250 bg-white px-3 py-2 text-xs font-bold text-[#111827] focus:outline-none"
                      >
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-zinc-100 flex justify-end gap-2 bg-zinc-50/50">
              <button
                type="button"
                onClick={() => setIsCustGroupModalOpen(false)}
                className="rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 px-5 py-2.5 text-xs font-bold text-zinc-500 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addCustomizationGroup}
                className="rounded-xl bg-[#BBD915] hover:bg-[#a6c212] px-6 py-2.5 text-xs font-bold text-[#111827] shadow-md active:scale-95 transition-all"
              >
                {editingGroupId ? 'Save Changes' : 'Add Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customization Item Add/Edit Modal */}
      {isCustItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-zinc-200 shadow-2xl overflow-hidden relative text-[#111827] flex flex-col">
            <div className="p-6 pb-4 border-b border-zinc-100 relative">
              <h3 className="text-lg font-black">{editingItemIndex !== null ? 'Edit Item' : 'Add Item'}</h3>
              <p className="text-xs text-zinc-500 font-semibold mt-0.5">Specify option parameters for the customization list choice.</p>
              <button 
                onClick={() => setIsCustItemModalOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-650 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Item Name</label>
                <input
                  type="text"
                  value={custItemName}
                  onChange={(e) => setCustItemName(e.target.value)}
                  placeholder="e.g. Chicken Breast Extra"
                  className="w-full rounded-xl border border-zinc-250 bg-white px-3 py-2 text-xs font-bold text-[#111827] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={custItemPrice}
                    onChange={(e) => setCustItemPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-250 bg-white px-3 py-2 text-xs font-bold text-[#111827] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Food Type</label>
                  <select
                    value={custItemType}
                    onChange={(e) => setCustItemType(e.target.value)}
                    className="w-full rounded-xl border border-zinc-250 bg-white px-3 py-2 text-xs font-bold text-[#111827] focus:outline-none"
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Egg">Egg</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-650 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={custItemIsActive}
                    onChange={(e) => setCustItemIsActive(e.target.checked)}
                    className="rounded text-[#BBD915] focus:ring-[#BBD915] h-4 w-4 border-zinc-300"
                  />
                  <span>Active Status (Available to customers)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-zinc-650 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={custItemIsDefault}
                    onChange={(e) => setCustItemIsDefault(e.target.checked)}
                    className="rounded text-[#BBD915] focus:ring-[#BBD915] h-4 w-4 border-zinc-300"
                  />
                  <span>Default Checked (Automatically selected on load)</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-100 flex justify-end gap-2 bg-zinc-50/50">
              <button
                type="button"
                onClick={() => setIsCustItemModalOpen(false)}
                className="rounded-xl border border-zinc-255 bg-white hover:bg-zinc-50 px-5 py-2.5 text-xs font-bold text-zinc-500 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCustomizationItem}
                className="rounded-xl bg-[#BBD915] hover:bg-[#a6c212] px-6 py-2.5 text-xs font-bold text-[#111827] shadow-md active:scale-95 transition-all"
              >
                {editingItemIndex !== null ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Customizer Options Modal */}
      {isOptionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-zinc-200 shadow-2xl overflow-hidden relative text-[#111827] flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-zinc-100 relative">
              <h3 className="text-lg font-black">Manage Customizer Options</h3>
              <p className="text-xs text-zinc-500 font-semibold mt-0.5">Configure dietary preferences, meals, tiers, and cycle options.</p>
              <button 
                onClick={() => setIsOptionsModalOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-650 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Tabs Header */}
            <div className="flex overflow-x-auto whitespace-nowrap border-b border-zinc-100 bg-zinc-50/50 p-2 gap-1.5 scrollbar-none">
              {(['diet', 'meals', 'tiers', 'durations'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setOptionsActiveTab(tab)}
                  className={`shrink-0 px-4 py-2 text-xs font-black rounded-xl transition-all capitalize ${
                    optionsActiveTab === tab
                      ? 'bg-[#111827] text-white'
                      : 'text-zinc-555 hover:bg-zinc-100 hover:text-[#111827]'
                  }`}
                >
                  {tab === 'diet' ? '0. Dietary Preferences' :
                   tab === 'meals' ? '1. Meal Categories' :
                   tab === 'tiers' ? '2. Plan Tiers' :
                   '3. Cycle Durations'}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 max-h-[calc(70vh-140px)]">
              {optionsActiveTab === 'diet' && (
                <div className="space-y-4">
                  {/* Overall step status toggle */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50 border border-zinc-200/85 p-4 rounded-2xl">
                    <div>
                      <span className="text-xs font-black text-[#111827]">Dietary Preference Step Status</span>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Toggle whether the dietary choice step is visible to customer checkout flow.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, isDietaryBlueprintActive: config.isDietaryBlueprintActive === false });
                      }}
                      className={`flex items-center justify-center gap-2 rounded-xl text-xs font-black px-4 py-2 border transition-all active:scale-[0.98] ${
                        config.isDietaryBlueprintActive !== false
                          ? 'text-green-600 bg-green-50 border-green-200'
                          : 'text-zinc-500 bg-zinc-100 border-zinc-250'
                      }`}
                    >
                      {config.isDietaryBlueprintActive !== false ? 'DIET: ACTIVE' : 'DIET: INACTIVE'}
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-black text-zinc-400 uppercase tracking-wider block">Dietary Options List</span>
                    <button
                      type="button"
                      onClick={handleAddDietOptionObj}
                      className="flex items-center gap-1.5 text-[10px] font-black text-[#BBD915] bg-[#111827] hover:bg-zinc-800 px-3 py-2 rounded-xl transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Diet Option
                    </button>
                  </div>
                  <div className="space-y-3.5">
                    {(config.dietOptions || []).map((item: any, idx: number) => (
                      <div key={item.id} className="flex flex-col sm:flex-row gap-3 bg-zinc-50/55 p-3.5 rounded-2xl border border-zinc-150 items-stretch sm:items-center">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateDietOptionObj(idx, 'name', e.target.value)}
                          placeholder="e.g. Veg"
                          className="flex-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-[#111827] focus:border-[#BBD915] focus:outline-none"
                        />
                        <div className="flex items-center justify-between sm:justify-start gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase">Active</span>
                            <button
                              type="button"
                              onClick={() => updateDietOptionObj(idx, 'isActive', !item.isActive)}
                              className={`h-6 w-11 rounded-full p-0.5 transition-colors focus:outline-none ${
                                item.isActive ? 'bg-[#BBD915]' : 'bg-zinc-300'
                              }`}
                            >
                              <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
                                item.isActive ? 'transform translate-x-5' : ''
                              }`} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteDietOptionObj(idx)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-red-655 hover:bg-red-50 border border-transparent sm:border-none"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(config.dietOptions || []).length === 0 && (
                      <div className="py-8 text-center text-xs font-bold text-zinc-400">
                        No dietary preferences added yet. Click "Add Diet Option" to begin.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {optionsActiveTab === 'meals' && (
                <div className="space-y-4">
                  {/* Overall step status toggle */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50 border border-zinc-200/85 p-4 rounded-2xl">
                    <div>
                      <span className="text-xs font-black text-[#111827]">Meal Categories Step Status</span>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Toggle whether the choose meals step is visible to customer checkout flow.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, isMealsStepActive: config.isMealsStepActive === false });
                      }}
                      className={`flex items-center justify-center gap-2 rounded-xl text-xs font-black px-4 py-2 border transition-all active:scale-[0.98] ${
                        config.isMealsStepActive !== false
                          ? 'text-green-600 bg-green-50 border-green-200'
                          : 'text-zinc-500 bg-zinc-100 border-zinc-250'
                      }`}
                    >
                      {config.isMealsStepActive !== false ? 'MEALS: ACTIVE' : 'MEALS: INACTIVE'}
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-black text-zinc-400 uppercase tracking-wider block">Meal Categories List</span>
                    <button
                      type="button"
                      onClick={handleAddMealOptionObj}
                      className="flex items-center gap-1.5 text-[10px] font-black text-[#BBD915] bg-[#111827] hover:bg-zinc-850 px-3 py-2 rounded-xl transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Meal Category
                    </button>
                  </div>
                  <div className="space-y-3.5">
                    {(config.mealOptions || []).map((item: any, idx: number) => (
                      <div key={item.id} className="flex flex-col gap-3 bg-zinc-50/55 p-3.5 rounded-2xl border border-zinc-150">
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateMealOptionObj(idx, 'name', e.target.value)}
                            placeholder="e.g. Breakfast"
                            className="flex-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-[#111827] focus:border-[#BBD915] focus:outline-none"
                          />
                          <div className="flex items-center justify-between sm:justify-start gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase">Active</span>
                              <button
                                type="button"
                                onClick={() => updateMealOptionObj(idx, 'isActive', !item.isActive)}
                                className={`h-6 w-11 rounded-full p-0.5 transition-colors focus:outline-none ${
                                  item.isActive ? 'bg-[#BBD915]' : 'bg-zinc-300'
                                }`}
                              >
                                <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
                                  item.isActive ? 'transform translate-x-5' : ''
                                }`} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteMealOptionObj(idx)}
                              className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent sm:border-none"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </div>

                        {/* Delivery Time Window Selectors (From Dropdown + AM/PM & To Dropdown + AM/PM) */}
                        {(() => {
                          const parseTimeParts = (timeStr: string, defaultTime = '07:00', defaultAmPm = 'AM') => {
                            if (!timeStr) return { time: defaultTime, ampm: defaultAmPm };
                            const parts = timeStr.trim().split(/\s+/);
                            const time = parts[0] || defaultTime;
                            const ampm = (parts[1] || defaultAmPm).toUpperCase();
                            return { time, ampm };
                          };

                          const timeOptions = [
                            '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30',
                            '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
                            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'
                          ];

                          const fromParts = parseTimeParts(item.deliveryTimeFrom, '07:00', 'AM');
                          const toParts = parseTimeParts(item.deliveryTimeTo, '09:00', 'AM');

                          return (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-2 border-t border-zinc-200/60 bg-white/80 p-2.5 rounded-xl">
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider shrink-0">
                                Delivery Time:
                              </span>
                              <div className="flex flex-wrap items-center gap-3 flex-1 w-full">
                                {/* FROM SELECTORS */}
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase">From:</span>
                                  <select
                                    value={fromParts.time}
                                    onChange={(e) => updateMealOptionObj(idx, 'deliveryTimeFrom', `${e.target.value} ${fromParts.ampm}`)}
                                    className="rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#111827] focus:border-[#BBD915] focus:outline-none cursor-pointer"
                                  >
                                    {timeOptions.map((t) => (
                                      <option key={t} value={t}>{t}</option>
                                    ))}
                                  </select>
                                  <select
                                    value={fromParts.ampm}
                                    onChange={(e) => updateMealOptionObj(idx, 'deliveryTimeFrom', `${fromParts.time} ${e.target.value}`)}
                                    className="rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#111827] focus:border-[#BBD915] focus:outline-none cursor-pointer"
                                  >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                  </select>
                                </div>

                                <span className="text-xs text-zinc-400 font-extrabold">to</span>

                                {/* TO SELECTORS */}
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase">To:</span>
                                  <select
                                    value={toParts.time}
                                    onChange={(e) => updateMealOptionObj(idx, 'deliveryTimeTo', `${e.target.value} ${toParts.ampm}`)}
                                    className="rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#111827] focus:border-[#BBD915] focus:outline-none cursor-pointer"
                                  >
                                    {timeOptions.map((t) => (
                                      <option key={t} value={t}>{t}</option>
                                    ))}
                                  </select>
                                  <select
                                    value={toParts.ampm}
                                    onChange={(e) => updateMealOptionObj(idx, 'deliveryTimeTo', `${toParts.time} ${e.target.value}`)}
                                    className="rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#111827] focus:border-[#BBD915] focus:outline-none cursor-pointer"
                                  >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                    {(config.mealOptions || []).length === 0 && (
                      <div className="py-8 text-center text-xs font-bold text-zinc-400">
                        No meal categories added yet. Click "Add Meal Category" to begin.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {optionsActiveTab === 'tiers' && (
                <div className="space-y-4">
                  {/* Overall step status toggle */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50 border border-zinc-200/85 p-4 rounded-2xl">
                    <div>
                      <span className="text-xs font-black text-[#111827]">Plan Tiers Step Status</span>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Toggle whether the choose plan tier step is visible to customer checkout flow.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, isTiersStepActive: config.isTiersStepActive === false });
                      }}
                      className={`flex items-center justify-center gap-2 rounded-xl text-xs font-black px-4 py-2 border transition-all active:scale-[0.98] ${
                        config.isTiersStepActive !== false
                          ? 'text-green-600 bg-green-50 border-green-200'
                          : 'text-zinc-500 bg-zinc-100 border-zinc-250'
                      }`}
                    >
                      {config.isTiersStepActive !== false ? 'TIERS: ACTIVE' : 'TIERS: INACTIVE'}
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-black text-zinc-400 uppercase tracking-wider block">Plan Tiers List</span>
                    <button
                      type="button"
                      onClick={handleAddTierOptionObj}
                      className="flex items-center gap-1.5 text-[10px] font-black text-[#BBD915] bg-[#111827] hover:bg-zinc-850 px-3 py-2 rounded-xl transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Plan Tier
                    </button>
                  </div>
                  <div className="space-y-3.5">
                    {(config.tierOptions || []).map((item: any, idx: number) => (
                      <div key={item.id} className="flex flex-col sm:flex-row gap-3 bg-zinc-50/55 p-3.5 rounded-2xl border border-zinc-150 items-stretch sm:items-center">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateTierOptionObj(idx, 'name', e.target.value)}
                          placeholder="e.g. Standard"
                          className="flex-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-[#111827] focus:border-[#BBD915] focus:outline-none"
                        />
                        <div className="flex items-center justify-between sm:justify-start gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase">Active</span>
                            <button
                              type="button"
                              onClick={() => updateTierOptionObj(idx, 'isActive', !item.isActive)}
                              className={`h-6 w-11 rounded-full p-0.5 transition-colors focus:outline-none ${
                                item.isActive ? 'bg-[#BBD915]' : 'bg-zinc-300'
                              }`}
                            >
                              <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
                                item.isActive ? 'transform translate-x-5' : ''
                              }`} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteTierOptionObj(idx)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-red-655 hover:bg-red-50 border border-transparent sm:border-none"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(config.tierOptions || []).length === 0 && (
                      <div className="py-8 text-center text-xs font-bold text-zinc-400">
                        No plan tiers added yet. Click "Add Plan Tier" to begin.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {optionsActiveTab === 'durations' && (
                <div className="space-y-4">
                  {/* Overall step status toggle */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50 border border-zinc-200/85 p-4 rounded-2xl">
                    <div>
                      <span className="text-xs font-black text-[#111827]">Cycle Durations Step Status</span>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Toggle whether the select cycle durations step is visible to customer checkout flow.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, isDurationsStepActive: config.isDurationsStepActive === false });
                      }}
                      className={`flex items-center justify-center gap-2 rounded-xl text-xs font-black px-4 py-2 border transition-all active:scale-[0.98] ${
                        config.isDurationsStepActive !== false
                          ? 'text-green-600 bg-green-50 border-green-200'
                          : 'text-zinc-500 bg-zinc-100 border-zinc-250'
                      }`}
                    >
                      {config.isDurationsStepActive !== false ? 'DURATIONS: ACTIVE' : 'DURATIONS: INACTIVE'}
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-black text-zinc-400 uppercase tracking-wider block">Duration Cycles List</span>
                    <button
                      type="button"
                      onClick={handleAddDurationOptionObj}
                      className="flex items-center gap-1.5 text-[10px] font-black text-[#BBD915] bg-[#111827] hover:bg-zinc-850 px-3 py-2 rounded-xl transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Duration
                    </button>
                  </div>
                  <div className="space-y-3.5">
                    {(config.durationOptions || []).map((item: any, idx: number) => (
                      <div key={item.id} className="flex flex-col sm:flex-row gap-3 bg-zinc-50/55 p-3.5 rounded-2xl border border-zinc-150 items-stretch sm:items-center">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            value={item.value}
                            onChange={(e) => updateDurationOptionObj(idx, 'value', parseInt(e.target.value, 10))}
                            placeholder="7"
                            className="w-full rounded-xl border border-zinc-200 bg-white pl-3.5 pr-12 py-2 text-xs font-bold text-[#111827] focus:border-[#BBD915] focus:outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-[10px] font-black text-zinc-400 uppercase">Days</span>
                        </div>
                        <div className="flex items-center justify-between sm:justify-start gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase">Active</span>
                            <button
                              type="button"
                              onClick={() => updateDurationOptionObj(idx, 'isActive', !item.isActive)}
                              className={`h-6 w-11 rounded-full p-0.5 transition-colors focus:outline-none ${
                                item.isActive ? 'bg-[#BBD915]' : 'bg-zinc-300'
                              }`}
                            >
                              <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
                                item.isActive ? 'transform translate-x-5' : ''
                              }`} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteDurationOptionObj(idx)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-red-655 hover:bg-red-50 border border-transparent sm:border-none"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(config.durationOptions || []).length === 0 && (
                      <div className="py-8 text-center text-xs font-bold text-zinc-400">
                        No duration cycles added yet. Click "Add Duration" to begin.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="flex justify-end gap-3 p-6 bg-zinc-50 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsOptionsModalOpen(false)}
                className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-bold text-zinc-500 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOptionsConfig}
                disabled={saving}
                className="rounded-xl bg-[#BBD915] hover:bg-[#a6c212] px-6 py-2.5 text-xs font-bold text-[#111827] shadow-md shadow-[#BBD915]/10 active:scale-95 transition-all"
              >
                {saving ? 'Saving...' : 'Save Options'}
              </button>
            </div>

          </div>
        </div>
      )}
    </PermissionGuard>
  );
}
