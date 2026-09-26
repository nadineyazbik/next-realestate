import React, { useState, useRef } from 'react';
import {
  X,
  Lock,
  Plus,
  Trash2,
  BellRing,
  CheckCircle2,
  Building,
  LogOut,
  Archive,
  ArchiveRestore,
  Sparkles,
  Layers,
  Store,
  Warehouse,
  Briefcase,
  Home,
  Clock,
  Filter,
  UploadCloud,
  Image as ImageIcon,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Property, Language } from '../types';
import { notificationService } from '../services/notificationService';
import { apiService } from '../services/apiService';
import { LEBANON_REGIONS } from '../data/properties';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onAddProperty: (newProp: Property) => void;
  onDeleteProperty: (id: string) => void;
  onUpdateProperty: (updatedProp: Property) => void;
  lang?: Language;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  properties,
  onAddProperty,
  onDeleteProperty,
  onUpdateProperty,
  lang = 'en',
}) => {
  const isArabic = lang === 'ar';

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return Boolean(apiService.getAdminToken());
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verify session with server on modal open
  React.useEffect(() => {
    if (isOpen) {
      apiService.checkAdminSession().then((valid) => {
        setIsAdminAuthenticated(valid);
        if (!valid) {
          apiService.setAdminToken(null);
        }
      });
    }
  }, [isOpen]);

  // Active tab inside Admin Portal
  const [activeTab, setActiveTab] = useState<'listings' | 'new_listing'>('listings');
  const [listingsFilter, setListingsFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  // New property form state
  const [newProp, setNewProp] = useState<Partial<Property>>({
    title: '',
    titleAr: '',
    category: 'residential',
    type: 'Apartment',
    typeAr: 'شقة سكنية',
    commercialSubtype: 'shop',
    district: 'Beirut',
    districtAr: 'بيروت',
    zone: 'Al Mazraa & Surroundings',
    zoneAr: 'المزرعة ومحيطها',
    neighborhood: 'Corniche Al Mazraa',
    neighborhoodAr: 'كورنيش المزرعة',
    price: 180000,
    isRental: false, // Strictly Sale (false) or Rental (true)
    beds: 3, // Highlighted 3-bed / 4-bed
    baths: 3,
    areaSqm: 165,
    floor: '3rd Floor',
    imageUrl:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=85',
    referenceNo: `NXT-${Math.floor(1000 + Math.random() * 9000)}`,
    isPlatinum: true,
    isFeatured: true,
    isArchived: false,
    buildingAge: '0_2',
    condition: 'ready',
    paymentType: 'cash',
  });

  // Admin Drag & Drop Image Uploader State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError(
        isArabic
          ? 'يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP).'
          : 'Please select a valid image file (PNG, JPG, WEBP).'
      );
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setNewProp((prev) => ({
          ...prev,
          imageUrl: e.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  if (!isOpen) return null;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    const res = await apiService.loginAdmin(username.trim(), password);
    setIsSubmitting(false);

    if (res.success) {
      setIsAdminAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError(
        res.error ||
          (isArabic
            ? 'بيانات تسجيل الدخول غير صحيحة. هذا القسم مخصص لمدير النظام فقط.'
            : 'Invalid administrator credentials. Access restricted to authorized admin.')
      );
    }
  };

  const handleAdminLogout = async () => {
    await apiService.logoutAdmin();
    setIsAdminAuthenticated(false);
  };

  const handleToggleArchive = async (prop: Property) => {
    await apiService.toggleArchiveProperty(prop.id);
    const updated: Property = {
      ...prop,
      isArchived: !prop.isArchived,
      archivedAt: !prop.isArchived ? new Date().toISOString() : undefined,
    };
    onUpdateProperty(updated);

    setBroadcastSuccess(
      isArabic
        ? updated.isArchived
          ? 'تم أرشفة العقار بنجاح (مخفي عن الزوار في الموقع).'
          : 'تم إلغاء أرشفة العقار وإعادته للعرض المباشر.'
        : updated.isArchived
        ? 'Property moved to archive (hidden from public view).'
        : 'Property restored to active public listings.'
    );

    setTimeout(() => setBroadcastSuccess(null), 2500);
  };

  const handleDeleteListing = async (propId: string) => {
    if (
      confirm(
        isArabic
          ? 'هل أنت متأكد من حذف هذا العقار نهائياً؟'
          : 'Are you sure you want to permanently delete this listing?'
      )
    ) {
      await apiService.deleteProperty(propId);
      onDeleteProperty(propId);
      setBroadcastSuccess(
        isArabic ? 'تم حذف العقار نهائياً بنجاح.' : 'Property deleted permanently.'
      );
      setTimeout(() => setBroadcastSuccess(null), 2500);
    }
  };

  const handleAutoArchiveOld = () => {
    // Automatically archive listings with IDs older or marked as older
    let archivedCount = 0;
    properties.forEach((p, idx) => {
      if (!p.isArchived && idx > 8) {
        onUpdateProperty({ ...p, isArchived: true, archivedAt: new Date().toISOString() });
        archivedCount++;
      }
    });

    setBroadcastSuccess(
      isArabic
        ? `تمت أرشفة ${archivedCount} عقاراً قديماً تلقائياً لحفظ حداثة القائمة.`
        : `Auto-archived ${archivedCount} older listings to keep the catalog fresh.`
    );
    setTimeout(() => setBroadcastSuccess(null), 3000);
  };

  const handlePublishProperty = async (e: React.FormEvent) => {
    e.preventDefault();

    const isCommercial = newProp.category === 'commercial';
    let typeName = newProp.type || 'Apartment';
    let typeNameAr = newProp.typeAr || 'شقة سكنية';

    if (isCommercial) {
      if (newProp.commercialSubtype === 'shop') {
        typeName = 'Shop';
        typeNameAr = 'محل تجاري';
      } else if (newProp.commercialSubtype === 'warehouse') {
        typeName = 'Warehouse';
        typeNameAr = 'مستودع';
      } else if (newProp.commercialSubtype === 'office') {
        typeName = 'Office';
        typeNameAr = 'مكتب';
      } else {
        typeName = 'Commercial';
        typeNameAr = 'عقارات تجارية';
      }
    }

    const created: Property = {
      id: `prop-${Date.now()}`,
      title: newProp.title || `${typeName} in Prime Location`,
      titleAr: newProp.titleAr || newProp.title || `${typeNameAr} في موقع مميز`,
      type: typeName,
      typeAr: typeNameAr,
      category: isCommercial ? 'commercial' : 'residential',
      commercialSubtype: isCommercial ? newProp.commercialSubtype : undefined,
      district: newProp.district || 'Beirut',
      districtAr: newProp.districtAr || 'بيروت',
      zone: newProp.zone || 'Al Mazraa & Surroundings',
      zoneAr: newProp.zoneAr || 'المزرعة ومحيطها',
      neighborhood: newProp.neighborhood || 'Corniche Al Mazraa',
      neighborhoodAr: newProp.neighborhoodAr || 'كورنيش المزرعة',
      location: `${newProp.neighborhood || 'Corniche Al Mazraa'}, ${newProp.district || 'Beirut'}`,
      locationAr: `${newProp.neighborhoodAr || 'كورنيش المزرعة'}، ${newProp.districtAr || 'بيروت'}`,
      price: Number(newProp.price) || 150000,
      isRental: Boolean(newProp.isRental),
      beds: isCommercial ? undefined : Number(newProp.beds) || 3,
      baths: Number(newProp.baths) || 2,
      areaSqm: Number(newProp.areaSqm) || 150,
      floor: newProp.floor || '3rd Floor',
      imageUrl:
        newProp.imageUrl ||
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=85',
      referenceNo: newProp.referenceNo || `NXT-${Math.floor(1000 + Math.random() * 9000)}`,
      isPlatinum: Boolean(newProp.isPlatinum),
      isFeatured: Boolean(newProp.isFeatured),
      isArchived: false,
      buildingAge: newProp.buildingAge || '0_2',
      buildingAgeLabel: 'Brand New (0 - 2 Years)',
      buildingAgeLabelAr: 'جديد كلياً (٠ - ٢ سنة)',
      condition: newProp.condition || 'ready',
      paymentType: newProp.paymentType || 'cash',
      createdAt: new Date().toISOString(),
    };

    // 1. Add to backend with RBAC & CSRF verification
    const apiRes = await apiService.addProperty(created);
    const finalProp = apiRes.property || created;
    onAddProperty(finalProp);

    // 2. Trigger smart PWA notification
    await notificationService.notifyNewProperty(created, lang);

    setBroadcastSuccess(
      isArabic
        ? 'تم نشر العقار بنجاح وإرسال إشعار فوري لمستخدمي التطبيق!'
        : 'Listing published successfully and smart PWA alert dispatched to subscribers!'
    );

    setTimeout(() => {
      setBroadcastSuccess(null);
      setActiveTab('listings');
    }, 2000);
  };

  const handleSendManualPush = async (prop: Property) => {
    await notificationService.notifyNewProperty(prop, lang);
    setBroadcastSuccess(
      isArabic
        ? `تم إرسال إشعار فوري للعقار (REF: ${prop.referenceNo}) بنجاح!`
        : `Push notification dispatched for listing REF: ${prop.referenceNo}!`
    );
    setTimeout(() => setBroadcastSuccess(null), 2500);
  };

  // Filtered properties for CMS view
  const displayProperties = properties.filter((p) => {
    if (listingsFilter === 'active') return !p.isArchived;
    if (listingsFilter === 'archived') return p.isArchived;
    return true;
  });

  const activeCount = properties.filter((p) => !p.isArchived).length;
  const archivedCount = properties.filter((p) => p.isArchived).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-gray-100 my-6">
        {/* Top Header */}
        <div className="bg-[#18191a] text-white px-5 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c4191a] flex items-center justify-center text-white">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3
                className="text-sm sm:text-base font-bold text-white flex items-center gap-2"
                style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
              >
                <span>{isArabic ? 'لوحة تحكم إدارة Next Real Estate' : 'Next Real Estate CMS & Admin Portal'}</span>
                <span className="text-[10px] bg-red-900/60 text-red-200 border border-red-700/50 px-2 py-0.5 rounded-full font-mono">
                  STAFF ONLY
                </span>
              </h3>
              <p className="text-[11px] text-white/60">
                {isArabic
                  ? 'إدارة ونشر العقارات اليومية • أرشفة العقارات القديمة • إشعارات PWA'
                  : 'Daily property catalog management • Archive workflow • PWA push alerts'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminAuthenticated && (
              <button
                type="button"
                onClick={handleAdminLogout}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs inline-flex items-center gap-1 cursor-pointer transition"
                title={isArabic ? 'تسجيل الخروج' : 'Logout'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isArabic ? 'خروج' : 'Logout'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Broadcast Toast Banner */}
        {broadcastSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{broadcastSuccess}</span>
          </div>
        )}

        {/* 1. If NOT authenticated: Secure Single-Admin Login Form */}
        {!isAdminAuthenticated ? (
          <div className="p-6 sm:p-8">
            <div className="max-w-sm mx-auto text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#c4191a] flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-1">
                {isArabic ? 'تسجيل دخول مدير النظام' : 'Authorized Admin Sign In'}
              </h4>
              <p className="text-xs text-gray-500 mb-6">
                {isArabic
                  ? 'هذه المنطقة مخصصة حصرياً لفريق إدارة Next Real Estate لإضافة وأرشفة العقارات'
                  : 'Exclusive access to manage daily properties, archive listings & dispatch alerts'}
              </p>

              {loginError && (
                <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-[#c4191a] text-xs font-medium">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-3.5 text-start">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    {isArabic ? 'اسم المستخدم أو البريد' : 'Username or Email'}
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#c4191a] focus:ring-1 focus:ring-[#c4191a] text-xs outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    {isArabic ? 'كلمة المرور' : 'Password'}
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#c4191a] focus:ring-1 focus:ring-[#c4191a] text-xs outline-none transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#c4191a] hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    {isArabic ? 'دخول لوحة التحكم' : 'Authenticate Admin'}
                  </button>
                </div>

                <p className="text-[10px] text-gray-400 text-center pt-2">
                  {isArabic
                    ? 'بيانات الدخول المعتمدة: admin / Next2026!'
                    : 'Designated credentials: admin / Next2026!'}
                </p>
              </form>
            </div>
          </div>
        ) : (
          /* 2. Authenticated Admin Dashboard */
          <div className="p-4 sm:p-6">
            {/* Top Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('listings')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'listings'
                      ? 'bg-[#c4191a] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>
                    {isArabic
                      ? `إدارة العقارات (${properties.length})`
                      : `Manage Listings (${properties.length})`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('new_listing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
                    activeTab === 'new_listing'
                      ? 'bg-[#c4191a] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'إضافة عقار جديد' : 'Add New Listing'}</span>
                </button>
              </div>

              {activeTab === 'listings' && (
                <button
                  type="button"
                  onClick={handleAutoArchiveOld}
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 flex items-center gap-1 cursor-pointer transition"
                  title="Auto-archive older properties"
                >
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>{isArabic ? 'أرشفة تلقائية للقديم' : 'Auto-Archive Older'}</span>
                </button>
              )}
            </div>

            {/* TAB 1: Manage Existing Listings & Archive Workflow */}
            {activeTab === 'listings' && (
              <div className="space-y-3">
                {/* Archive Status Filters */}
                <div className="flex items-center justify-between text-xs pb-1">
                  <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setListingsFilter('active')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                        listingsFilter === 'active'
                          ? 'bg-white text-[#c4191a] shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {isArabic ? `النشطة في الموقع (${activeCount})` : `Active (${activeCount})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setListingsFilter('archived')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                        listingsFilter === 'archived'
                          ? 'bg-white text-gray-900 shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Archive className="w-3 h-3 text-amber-600" />
                      <span>{isArabic ? `المؤرشفة (${archivedCount})` : `Archived (${archivedCount})`}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setListingsFilter('all')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                        listingsFilter === 'all'
                          ? 'bg-white text-gray-900 shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {isArabic ? `الكل (${properties.length})` : `All (${properties.length})`}
                    </button>
                  </div>

                  <span className="text-[11px] text-gray-400 hidden sm:inline">
                    {isArabic
                      ? 'العقارات المؤرشفة تظل محفوظة للإدارة لكن لا تظهر للعامة'
                      : 'Archived properties stay saved in CMS but hidden from public search'}
                  </span>
                </div>

                {/* Listings Items */}
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {displayProperties.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-xs">
                      {isArabic
                        ? 'لا توجد عقارات في هذا التصنيف حالياً.'
                        : 'No listings found under this filter.'}
                    </div>
                  ) : (
                    displayProperties.map((prop) => (
                      <div
                        key={prop.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                          prop.isArchived
                            ? 'bg-gray-50/80 border-gray-200 opacity-80'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={prop.imageUrl}
                            alt={prop.title}
                            className="w-14 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-gray-900 truncate">
                                {isArabic ? prop.titleAr : prop.title}
                              </span>
                              {prop.isArchived ? (
                                <span className="bg-gray-200 text-gray-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  {isArabic ? 'مؤرشف' : 'Archived'}
                                </span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  {isArabic ? 'نشط' : 'Active'}
                                </span>
                              )}
                              {prop.isPlatinum && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  Platinum
                                </span>
                              )}
                              <span className="bg-red-50 text-[#c4191a] text-[9px] font-bold px-1.5 py-0.5 rounded">
                                {prop.isRental ? (isArabic ? 'إيجار' : 'Rental') : (isArabic ? 'بيع' : 'Sale')}
                              </span>
                            </div>

                            <div className="text-[11px] text-gray-500 truncate mt-0.5">
                              {prop.type} • {prop.location} •{' '}
                              <strong className="text-[#c4191a]">
                                USD {new Intl.NumberFormat('en-US').format(prop.price)}
                              </strong>
                              {prop.beds !== undefined && (
                                <span className="text-gray-400"> • {prop.beds} Beds</span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">
                              REF: {prop.referenceNo}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Archive / Unarchive Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleArchive(prop)}
                            className={`p-1.5 rounded-lg transition cursor-pointer text-xs flex items-center gap-1 ${
                              prop.isArchived
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={
                              prop.isArchived
                                ? isArabic
                                  ? 'إلغاء الأرشفة وإعادة العرض'
                                  : 'Unarchive / Restore'
                                : isArabic
                                ? 'أرشفة العقار'
                                : 'Archive Property'
                            }
                          >
                            {prop.isArchived ? (
                              <ArchiveRestore className="w-3.5 h-3.5 text-amber-700" />
                            ) : (
                              <Archive className="w-3.5 h-3.5 text-gray-600" />
                            )}
                            <span className="hidden md:inline text-[10px] font-semibold">
                              {prop.isArchived
                                ? isArabic
                                  ? 'استعادة'
                                  : 'Restore'
                                : isArabic
                                ? 'أرشفة'
                                : 'Archive'}
                            </span>
                          </button>

                          {/* Send Push Notification */}
                          {!prop.isArchived && (
                            <button
                              type="button"
                              onClick={() => handleSendManualPush(prop)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#c4191a] transition cursor-pointer"
                              title={isArabic ? 'إرسال إشعار فوري PWA' : 'Send Push Alert'}
                            >
                              <BellRing className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Listing */}
                          <button
                            type="button"
                            onClick={() => handleDeleteListing(prop.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition cursor-pointer"
                            title={isArabic ? 'حذف نهائي' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Add New Listing (Full Details & Beirut Breakdown) */}
            {activeTab === 'new_listing' && (
              <form
                onSubmit={handlePublishProperty}
                className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1 text-xs"
              >
                {/* Title (En & Ar) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      {isArabic ? 'عنوان العقار (English)' : 'Title (English)'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newProp.title}
                      onChange={(e) => setNewProp({ ...newProp, title: e.target.value })}
                      placeholder="e.g. Modern 3-Bedroom Apartment in Tallet El Khayat"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#c4191a]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      {isArabic ? 'عنوان العقار (عربي)' : 'Title (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={newProp.titleAr}
                      onChange={(e) => setNewProp({ ...newProp, titleAr: e.target.value })}
                      placeholder="مثال: شقة عصرية ٣ غرف نوم في تلة الخياط"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#c4191a]"
                    />
                  </div>
                </div>

                {/* Category: Residential or Commercial */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      {isArabic ? 'التصنيف الرئيسي' : 'Main Category'}
                    </label>
                    <select
                      value={newProp.category || 'residential'}
                      onChange={(e) => {
                        const cat = e.target.value as 'residential' | 'commercial';
                        setNewProp({
                          ...newProp,
                          category: cat,
                          type: cat === 'residential' ? 'Apartment' : 'Commercial',
                          typeAr: cat === 'residential' ? 'شقة سكنية' : 'عقارات تجارية',
                        });
                      }}
                      className="w-full px-2.5 py-2 rounded-lg border border-gray-300 bg-white font-semibold outline-none focus:border-[#c4191a]"
                    >
                      <option value="residential">{isArabic ? 'شقق سكنية (Residential)' : 'Residential'}</option>
                      <option value="commercial">{isArabic ? 'عقارات تجارية (Commercial)' : 'Commercial'}</option>
                    </select>
                  </div>

                  {newProp.category === 'commercial' ? (
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        {isArabic ? 'نوع العقار التجاري' : 'Commercial Subtype'}
                      </label>
                      <select
                        value={newProp.commercialSubtype || 'shop'}
                        onChange={(e) =>
                          setNewProp({
                            ...newProp,
                            commercialSubtype: e.target.value as 'shop' | 'warehouse' | 'office',
                          })
                        }
                        className="w-full px-2.5 py-2 rounded-lg border border-gray-300 bg-white outline-none focus:border-[#c4191a]"
                      >
                        <option value="shop">{isArabic ? 'محل تجاري (Shop)' : 'Shop'}</option>
                        <option value="warehouse">{isArabic ? 'مستودع (Warehouse)' : 'Warehouse'}</option>
                        <option value="office">{isArabic ? 'مكتب (Office)' : 'Office'}</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        {isArabic ? 'عدد غرف النوم (محدد)' : 'Bedrooms (Highlighted)'}
                      </label>
                      <select
                        value={newProp.beds}
                        onChange={(e) => setNewProp({ ...newProp, beds: Number(e.target.value) })}
                        className="w-full px-2.5 py-2 rounded-lg border border-gray-300 bg-white outline-none focus:border-[#c4191a]"
                      >
                        <option value={1}>1 Bedroom</option>
                        <option value={2}>2 Bedrooms</option>
                        <option value={3}>3 Bedrooms ⭐ (٣ غرف نوم)</option>
                        <option value={4}>4 Bedrooms ⭐ (٤ غرف نوم)</option>
                        <option value={5}>5+ Bedrooms</option>
                      </select>
                    </div>
                  )}

                  {/* Transaction Type: Strictly Sale or Rental */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      {isArabic ? 'نوع العقد (بيع / إيجار)' : 'Transaction Type'}
                    </label>
                    <select
                      value={newProp.isRental ? 'rental' : 'sale'}
                      onChange={(e) =>
                        setNewProp({ ...newProp, isRental: e.target.value === 'rental' })
                      }
                      className="w-full px-2.5 py-2 rounded-lg border border-gray-300 bg-white font-semibold outline-none focus:border-[#c4191a]"
                    >
                      <option value="sale">{isArabic ? 'بيع (Sale)' : 'For Sale'}</option>
                      <option value="rental">{isArabic ? 'إيجار (Rental)' : 'For Rental'}</option>
                    </select>
                  </div>
                </div>

                {/* Price, Area, Baths, Floor */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      {isArabic ? 'السعر (USD)' : 'Price (USD)'}
                    </label>
                    <input
                      type="number"
                      required
                      value={newProp.price}
                      onChange={(e) => setNewProp({ ...newProp, price: Number(e.target.value) })}
                      className="w-full px-2.5 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#c4191a]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      {isArabic ? 'المساحة (م²)' : 'Area (m²)'}
                    </label>
                    <input
                      type="number"
                      required
                      value={newProp.areaSqm}
                      onChange={(e) => setNewProp({ ...newProp, areaSqm: Number(e.target.value) })}
                      className="w-full px-2.5 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#c4191a]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      {isArabic ? 'الحمامات' : 'Bathrooms'}
                    </label>
                    <input
                      type="number"
                      value={newProp.baths}
                      onChange={(e) => setNewProp({ ...newProp, baths: Number(e.target.value) })}
                      className="w-full px-2.5 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#c4191a]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      {isArabic ? 'الطابق' : 'Floor'}
                    </label>
                    <input
                      type="text"
                      value={newProp.floor}
                      onChange={(e) => setNewProp({ ...newProp, floor: e.target.value })}
                      placeholder="e.g. 4th Floor"
                      className="w-full px-2.5 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#c4191a]"
                    />
                  </div>
                </div>

                {/* Beirut Deep Zones Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      {isArabic ? 'المنطقة أو القضاء (بيروت / خارجها)' : 'Zone / Sector'}
                    </label>
                    <select
                      value={newProp.zone}
                      onChange={(e) => {
                        const z = e.target.value;
                        setNewProp({
                          ...newProp,
                          zone: z,
                          district: z.includes('Beirut') || z.includes('Al Mazraa') || z.includes('Al Mseitbeh') ? 'Beirut' : 'Mount Lebanon',
                          districtAr: z.includes('Beirut') || z.includes('Al Mazraa') || z.includes('Al Mseitbeh') ? 'بيروت' : 'جبل لبنان',
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#c4191a]"
                    >
                      <option value="Al Mazraa & Surroundings">المزرعة ومحيطها (Al Mazraa & Surroundings)</option>
                      <option value="Al Mseitbeh & Surroundings">المصيطبة ومحيطها (Al Mseitbeh & Surroundings)</option>
                      <option value="Ras Beirut & Surroundings">راس بيروت ومحيطها (Ras Beirut & Surroundings)</option>
                      <option value="Outside Beirut">خارج بيروت (جبل لبنان والمحافظات)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      {isArabic ? 'الحي التفصيلي' : 'Precise Neighborhood'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newProp.neighborhood}
                      onChange={(e) => setNewProp({ ...newProp, neighborhood: e.target.value })}
                      placeholder={isArabic ? 'مثال: كورنيش المزرعة، فردان، مار الياس، كليمنصو...' : 'e.g. Corniche Al Mazraa, Verdun, Mar Elias...'}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#c4191a]"
                    />
                  </div>
                </div>

                {/* Modern Image Uploader with Drag & Drop Zone & Plus (+) Button */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-gray-800 text-xs">
                      {isArabic ? 'صور العقار (تحميل وسحب وإفلات)' : 'Property Photos (Upload & Drag & Drop)'}
                    </label>
                    <span className="text-[10px] text-gray-500">
                      {isArabic ? 'متاح فقط لمدير النظام • يدعم الموبايل والكمبيوتر' : 'Admin Only • Supports Mobile & Desktop'}
                    </span>
                  </div>

                  {/* Hidden Native File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        processImageFile(e.target.files[0]);
                      }
                    }}
                  />

                  {/* Drag & Drop Box */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                      isDragging
                        ? 'border-[#c4191a] bg-red-50/50 scale-[1.01]'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50/60'
                    }`}
                  >
                    {newProp.imageUrl ? (
                      /* Preview & Management Card */
                      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                        <div className="relative w-28 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <img
                            src={newProp.imageUrl}
                            alt="Listing Preview"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 py-0.2 rounded font-mono">
                            Preview
                          </span>
                        </div>

                        <div className="flex-1 text-start space-y-1 w-full">
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'تم تحميل الصورة وجاهزة للنشر' : 'Photo ready for listing'}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate max-w-xs">
                            {newProp.imageUrl.startsWith('data:')
                              ? isArabic
                                ? 'صورة تم تحميلها من جهازك'
                                : 'Uploaded from your local device'
                              : newProp.imageUrl}
                          </p>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>{isArabic ? 'تغيير الصورة' : 'Change Image'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewProp({ ...newProp, imageUrl: '' })}
                              className="px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-md transition flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{isArabic ? 'حذف' : 'Remove'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Empty Upload Dropzone with Responsive Plus (+) Button */
                      <div className="py-4 flex flex-col items-center justify-center space-y-2.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#c4191a] hover:bg-[#a51516] active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer group"
                          title={isArabic ? 'انقر لفتح المعرض أو استعراض الملفات' : 'Click to select from device gallery'}
                        >
                          <Plus className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:rotate-90" />
                        </button>

                        <div className="space-y-0.5">
                          <p className="font-bold text-gray-800 text-xs sm:text-sm">
                            {isArabic
                              ? 'اسحب وأفلت صور العقار هنا أو اضغط الزائد'
                              : 'Drag & Drop property photos here or click the Plus (+)'}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {isArabic
                              ? 'يعمل بسلاسة على الهاتف المحمول (الاستوديو) وأجهزة الكمبيوتر'
                              : 'Works seamlessly on mobile gallery and desktop file explorer (JPG, PNG, WEBP)'}
                          </p>
                        </div>
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-red-600 text-[11px] font-semibold mt-2">{uploadError}</p>
                    )}
                  </div>

                  {/* Preset Shortcuts (Convenient Quick Fallbacks) */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-gray-500">
                    <span>{isArabic ? 'أو اختر نموذجاً جاهزاً:' : 'Or use preset:'}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setNewProp({
                          ...newProp,
                          imageUrl:
                            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=85',
                        })
                      }
                      className="px-2 py-0.5 rounded bg-gray-100 hover:bg-red-50 hover:text-[#c4191a] text-gray-700 transition cursor-pointer"
                    >
                      Apartment
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewProp({
                          ...newProp,
                          imageUrl:
                            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85',
                        })
                      }
                      className="px-2 py-0.5 rounded bg-gray-100 hover:bg-red-50 hover:text-[#c4191a] text-gray-700 transition cursor-pointer"
                    >
                      Shop
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewProp({
                          ...newProp,
                          imageUrl:
                            'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=85',
                        })
                      }
                      className="px-2 py-0.5 rounded bg-gray-100 hover:bg-red-50 hover:text-[#c4191a] text-gray-700 transition cursor-pointer"
                    >
                      Warehouse
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewProp({
                          ...newProp,
                          imageUrl:
                            'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=85',
                        })
                      }
                      className="px-2 py-0.5 rounded bg-gray-100 hover:bg-red-50 hover:text-[#c4191a] text-gray-700 transition cursor-pointer"
                    >
                      Office
                    </button>
                  </div>
                </div>

                {/* Platinum & Featured Checkboxes */}
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProp.isPlatinum}
                      onChange={(e) => setNewProp({ ...newProp, isPlatinum: e.target.checked })}
                      className="rounded text-[#c4191a] focus:ring-[#c4191a]"
                    />
                    <span className="font-medium text-gray-700">
                      {isArabic ? 'عقار بلاتينيوم موصى به (Platinum)' : 'Platinum & Recommended'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProp.isFeatured}
                      onChange={(e) => setNewProp({ ...newProp, isFeatured: e.target.checked })}
                      className="rounded text-[#c4191a] focus:ring-[#c4191a]"
                    />
                    <span className="font-medium text-gray-700">
                      {isArabic ? 'عرض ساخن / رائج (Featured)' : 'Hot Deal / Trending'}
                    </span>
                  </label>
                </div>

                {/* Submit Action */}
                <div className="p-3 rounded-xl bg-red-50/70 border border-red-100 flex items-center justify-between gap-3 mt-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <BellRing className="w-4 h-4 text-[#c4191a] shrink-0" />
                    <span>
                      {isArabic
                        ? 'سيتم نشر العقار فوراً وإشعار مستخدمي التطبيق عبر PWA تلقائياً'
                        : 'A polite PWA alert will automatically be dispatched upon publishing'}
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#c4191a] hover:bg-red-700 text-white font-bold text-xs transition shadow-xs cursor-pointer shrink-0"
                  >
                    {isArabic ? 'نشر العقار الآن' : 'Publish & Dispatch'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
