import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { PopularCategories } from './components/PopularCategories';
import { PropertyListings } from './components/PropertyListings';
import { AllPropertiesView } from './components/AllPropertiesView';
import { PropertyDetailsPage } from './components/PropertyDetailsPage';
import { Footer } from './components/Footer';
import { GoogleSignInModal } from './components/GoogleSignInModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { InquiryModal } from './components/InquiryModal';
import { AddPropertyModal } from './components/AddPropertyModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { Property, Language, SearchFilterState } from './types';
import { mockProperties } from './data/properties';
import { authService, GoogleUser } from './services/authService';
import { X, MessageCircle, Phone, Sparkles, Mic, Volume2 } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState<boolean>(false);
  const [addPropertyModalOpen, setAddPropertyModalOpen] = useState<boolean>(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState<boolean>(false);
  const [adminPortalOpen, setAdminPortalOpen] = useState<boolean>(false);
  const [callModalOpen, setCallModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'home' | 'all_properties' | 'property_details'>('home');
  const [allPropertiesInitialCat, setAllPropertiesInitialCat] = useState<string>('all');

  // Interactive Demo Voice Call States
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('أهلاً فيك! أنا نادين، مستشارتك العقارية. كيف فيني أساعدك اليوم؟ اضغط على (تحدث) لنبدا!');
  const [callDuration, setCallDuration] = useState<number>(0);

  // Google OAuth User Session & Wishlist Favorites
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(() => authService.getUser());
  const [favorites, setFavorites] = useState<string[]>(() => authService.getFavorites());
  const [googleSignInOpen, setGoogleSignInOpen] = useState<boolean>(false);
  const [favoritesDrawerOpen, setFavoritesDrawerOpen] = useState<boolean>(false);
  const [pendingFavoriteProp, setPendingFavoriteProp] = useState<Property | null>(null);

  // Load custom properties added by admin, combined with initial mockProperties
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const stored = localStorage.getItem('next_custom_properties');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...mockProperties];
        }
      }
    } catch (e) {
      console.warn('Failed to load local properties', e);
    }
    return mockProperties;
  });

  const [activeFilters, setActiveFilters] = useState<SearchFilterState>({
    location: '',
    propertyType: '',
    saleOrRental: '',
    buildingAge: '',
    areaRange: '',
  });

  const [filterNotification, setFilterNotification] = useState<string | null>(null);
  const isArabic = lang === 'ar';

  // Keep html document dir and lang synchronized
  useEffect(() => {
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [isArabic, lang]);

  // Call timer simulation
  useEffect(() => {
    let timer: any;
    if (callModalOpen) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [callModalOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Instant Interactive Demo Response (Lebanese Dialect AI Simulation)
  const handleInteractiveTalk = () => {
    setIsSpeaking(true);
    setVoiceTranscript('عم بسمع طلبك العقاري...');
    
    setTimeout(() => {
      setIsSpeaking(false);
      setVoiceTranscript('أهلاً فيك! عنا أحلى الشقق والفلل ببيروت وكسروان وجبل لبنان، بتبدأ الأسعار من 150 ألف دولار. تحب نفلتر لك النتائج حسب المنطقة؟');
    }, 1500);
  };

  // Synchronize high-concurrency property listings from backend API
  useEffect(() => {
    fetch('/api/properties')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.properties) && data.properties.length > 0) {
          setProperties(data.properties);
        }
      })
      .catch(() => {});
  }, []);

  // Synchronize hash routing with full page view
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/property/')) {
        const id = hash.replace('#/property/', '');
        const found = properties.find((p) => p.id === id);
        if (found) {
          setSelectedProperty(found);
          setViewMode('property_details');
          return;
        }
      } else if (hash === '#/all-properties') {
        setViewMode('all_properties');
        return;
      } else if (!hash || hash === '#/' || hash === '#home') {
        setViewMode('home');
      }
    };

    handleHashChange();
    window.addEventListener('popstate', handleHashChange);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handleHashChange);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [properties]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const handleToggleFavorite = (property: Property, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      setPendingFavoriteProp(property);
      setGoogleSignInOpen(true);
      return;
    }
    const result = authService.toggleFavorite(property.id);
    setFavorites(result.list);
  };

  const handleGoogleSuccess = (user: GoogleUser) => {
    setCurrentUser(user);
    if (pendingFavoriteProp) {
      const result = authService.toggleFavorite(pendingFavoriteProp.id);
      setFavorites(result.list);
      setPendingFavoriteProp(null);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const handleAddProperty = (newProp: Property) => {
    setProperties((prev) => {
      const updated = [newProp, ...prev];
      try {
        const customOnly = updated.filter((p) => p.id.startsWith('custom-'));
        localStorage.setItem('next_custom_properties', JSON.stringify(customOnly));
      } catch (e) {}
      return updated;
    });
  };

  const handleDeleteProperty = (id: string) => {
    setProperties((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        const customOnly = updated.filter((p) => p.id.startsWith('custom-'));
        localStorage.setItem('next_custom_properties', JSON.stringify(customOnly));
      } catch (e) {}
      return updated;
    });
  };

  const handleUpdateProperty = (updatedProp: Property) => {
    setProperties((prev) => {
      const updated = prev.map((p) => (p.id === updatedProp.id ? updatedProp : p));
      try {
        const customOnly = updated.filter((p) => p.id.startsWith('custom-'));
        localStorage.setItem('next_custom_properties', JSON.stringify(customOnly));
      } catch (e) {}
      return updated;
    });
  };

  const handleSearch = (filters: SearchFilterState) => {
    setActiveFilters(filters);
    if (filters.propertyType) {
      setActiveCategory(filters.propertyType);
    }

    const parts: string[] = [];
    if (filters.location) parts.push(`${isArabic ? 'الموقع' : 'Location'}: ${filters.location}`);
    if (filters.propertyType) parts.push(`${isArabic ? 'النوع' : 'Type'}: ${filters.propertyType}`);
    if (filters.saleOrRental)
      parts.push(
        filters.saleOrRental === 'sale'
          ? isArabic
            ? 'للبيع'
            : 'For Sale'
          : isArabic
          ? 'للإيجار'
          : 'For Rent'
      );
    if (filters.buildingAge)
      parts.push(`${isArabic ? 'عمر البناية' : 'Building Age'}: ${filters.buildingAge}`);
    if (filters.areaRange)
      parts.push(`${isArabic ? 'المساحة' : 'Area'}: ${filters.areaRange} m²`);

    const summary =
      parts.length > 0
        ? parts.join(' • ')
        : isArabic
        ? 'عرض كافة العقارات المتاحة في لبنان'
        : 'Showing all available listings in Lebanon';
    setFilterNotification(summary);

    const listingsEl = document.getElementById('properties-section');
    if (listingsEl) {
      listingsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleApplyFilterFromAI = (filterArgs: {
    location?: string;
    propertyType?: string;
    buildingAge?: string;
    saleOrRental?: string;
  }) => {
    const updated: SearchFilterState = {
      ...activeFilters,
      location: filterArgs.location || '',
      propertyType: filterArgs.propertyType || '',
      buildingAge: filterArgs.buildingAge || '',
      saleOrRental: filterArgs.saleOrRental || '',
    };
    setActiveFilters(updated);
    if (filterArgs.propertyType) {
      setActiveCategory(filterArgs.propertyType);
    }
    setFilterNotification(
      isArabic
        ? `تصفية موصى بها من المستشار الذكي: ${filterArgs.location || ''} ${
            filterArgs.propertyType || ''
          }`
        : `AI Recommended Filter: ${filterArgs.location || ''} ${filterArgs.propertyType || ''}`
    );
    const listingsEl = document.getElementById('properties-section');
    if (listingsEl) {
      listingsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetFilters = () => {
    setActiveFilters({
      location: '',
      propertyType: '',
      saleOrRental: '',
      buildingAge: '',
      areaRange: '',
    });
    setActiveCategory('all');
    setFilterNotification(null);
  };

  const handleNavigation = (route: string) => {
    if (route === 'home') {
      window.location.hash = '#/';
      setViewMode('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (route === 'add-property') {
      setAddPropertyModalOpen(true);
    } else if (route === 'contact') {
      setSelectedProperty(null);
      setInquiryModalOpen(true);
    } else if (route === 'properties') {
      if (viewMode === 'all_properties') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById('properties-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (route === 'signin') {
      setAdminPortalOpen(true);
    }
  };

  const handleOpenPropertyDetails = (property: Property) => {
    setSelectedProperty(property);
    setViewMode('property_details');
    window.location.hash = `#/property/${property.id}`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSelectPropertyById = (id: string) => {
    const found = properties.find((p) => p.id === id);
    if (found) {
      setSelectedProperty(found);
      setViewMode('property_details');
      window.location.hash = `#/property/${found.id}`;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleSeeAll = (section: 'platinum' | 'trending' | 'all') => {
    setAllPropertiesInitialCat(activeCategory);
    window.location.hash = '#/all-properties';
    setViewMode('all_properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-white text-[#212121] selection:bg-[#c4191a] selection:text-white ${
        isArabic ? 'font-cairo' : 'font-prompt'
      }`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <Header
        onNavigate={handleNavigation}
        lang={lang}
        onToggleLang={toggleLanguage}
        onOpenAIAssistant={() => setAiAssistantOpen(true)}
        onOpenAdminPortal={() => setAdminPortalOpen(true)}
        onSelectPropertyId={handleSelectPropertyById}
        isLightHeader={viewMode === 'all_properties' || viewMode === 'property_details'}
        onOpenFavorites={() => setFavoritesDrawerOpen(true)}
        favoritesCount={favorites.length}
      />

      {viewMode === 'property_details' && selectedProperty ? (
        <PropertyDetailsPage
          property={selectedProperty}
          allProperties={properties}
          lang={lang}
          onBack={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.location.hash = '#/';
              setViewMode('home');
            }
          }}
          onNavigateAllProperties={() => {
            window.location.hash = '#/all-properties';
            setViewMode('all_properties');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectProperty={handleOpenPropertyDetails}
          isFavorite={favorites.includes(selectedProperty.id)}
          onToggleFavorite={handleToggleFavorite}
          favorites={favorites}
          onSearch={handleSearch}
        />
      ) : viewMode === 'all_properties' ? (
        <AllPropertiesView
          properties={properties}
          initialCategory={allPropertiesInitialCat}
          lang={lang}
          onBack={() => {
            window.location.hash = '#/';
            setViewMode('home');
          }}
          onSelectProperty={handleOpenPropertyDetails}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : (
        <main className="flex-grow">
          <HeroSection
            lang={lang}
            onSearch={handleSearch}
            activeFilters={activeFilters}
          />

          {filterNotification && (
            <div className="bg-[#18191a] text-white py-3 px-4 text-center text-xs sm:text-sm border-b border-white/10 flex items-center justify-center gap-3 animate-in fade-in duration-200">
              <span className="text-[#c4191a] font-bold uppercase tracking-wider">
                {isArabic ? 'نتائج التصفية:' : 'Filtered Results:'}
              </span>
              <span className="text-white/90 font-medium truncate max-w-xl">
                {filterNotification}
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs text-white/70 hover:text-white underline ml-2 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isArabic ? 'إلغاء التصفية' : 'Reset'}</span>
              </button>
            </div>
          )}

          <PopularCategories
            activeCategory={activeCategory}
            onSelectCategory={(catId) => {
              setActiveCategory(catId);
              setActiveFilters((prev) => ({
                ...prev,
                propertyType: catId === 'all' ? '' : catId,
              }));
            }}
            lang={lang}
          />

          <div id="properties-section">
            <PropertyListings
              properties={properties}
              filterType={activeCategory}
              filters={activeFilters}
              lang={lang}
              onSelectProperty={handleOpenPropertyDetails}
              onResetFilters={handleResetFilters}
              onSeeAll={handleSeeAll}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        </main>
      )}

      <Footer lang={lang} onNavigate={handleNavigation} onOpenAdminPortal={() => setAdminPortalOpen(true)} />

      {/* --- زر الاتصال العائم الفخم في الزاوية (مثل الماسنجر) --- */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setCallModalOpen(true)}
          className="flex items-center justify-center w-16 h-16 bg-[#0a3633] text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 border-2 border-white/30 cursor-pointer animate-bounce group relative"
          title="Talk with Nadine AI Voice"
        >
          <Phone className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -inset-1 rounded-full bg-[#0a3633] opacity-30 animate-ping pointer-events-none"></span>
        </button>
      </div>

      {/* --- نافذة المكالمة التفاعلية الفورية (Interactive Demo Mode) --- */}
      {callModalOpen && (
        <div className="fixed bottom-24 right-6 z-[10000] w-full max-w-xs bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in slide-in-from-bottom-8 duration-200">
          
          {/* Header */}
          <div className="bg-[#0a3633] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img 
                src="/WhatsApp Image 2026-10-08 at 3.13.06 PM.jpeg" 
                alt="Nadine" 
                className="w-8 h-8 rounded-full object-cover border-2 border-white/40 shadow-sm"
              />
              <div>
                <h3 className="font-bold text-xs">Live Voice AI Call</h3>
                <p className="text-[10px] text-emerald-200">Nadine • Real Estate Advisor</p>
              </div>
            </div>
            <button 
              onClick={() => setCallModalOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body / Calling Screen */}
          <div className="p-5 flex flex-col items-center justify-center text-center bg-gradient-to-b from-gray-50/50 to-white">
            
            {/* Avatar with glowing ring */}
            <div className="relative mb-3">
              <div className="absolute -inset-2 rounded-full bg-emerald-500/20 animate-ping pointer-events-none"></div>
              <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-[#0a3633] to-emerald-400 shadow-lg relative z-10">
                <img 
                  src="/WhatsApp Image 2026-10-08 at 3.13.06 PM.jpeg" 
                  alt="Nadine AI Advisor" 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            <h2 className="text-sm font-bold text-gray-900 mb-0.5">Nadine (Voice AI)</h2>
            <p className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-3 border border-emerald-100">
              Lebanese Dialect • Demo Ready
            </p>

            {/* Live Transcript Bubble */}
            <div className="w-full bg-emerald-50/80 border border-emerald-100 rounded-2xl p-3 mb-4 text-right">
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-bold mb-1">
                <Volume2 className="w-3.5 h-3.5 animate-pulse text-[#0a3633]" />
                <span>Nadine says:</span>
              </div>
              <p className="text-xs text-gray-700 font-medium leading-relaxed">
                {voiceTranscript}
              </p>
            </div>

            {/* Status / Live audio wave simulation */}
            <div className="flex items-center justify-center gap-1 mb-4 h-5">
              <span className={`w-1 h-3 bg-[#0a3633] rounded-full ${isSpeaking ? 'animate-bounce' : 'animate-pulse'}`}></span>
              <span className={`w-1 h-6 bg-[#0a3633] rounded-full ${isSpeaking ? 'animate-bounce delay-75' : 'animate-pulse delay-75'}`}></span>
              <span className={`w-1 h-4 bg-[#0a3633] rounded-full ${isSpeaking ? 'animate-bounce delay-150' : 'animate-pulse delay-150'}`}></span>
              <span className="text-[11px] font-semibold text-emerald-700 ml-2">
                {isSpeaking ? 'Speaking...' : formatTime(callDuration)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleInteractiveTalk}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold shadow-md transition-all cursor-pointer ${
                  isSpeaking ? 'bg-amber-500 text-white animate-pulse' : 'bg-[#0a3633] hover:bg-[#0a3633]/90 text-white'
                }`}
                title="Talk to Nadine"
              >
                <Mic className="w-4 h-4" />
                <span>{isSpeaking ? 'Speaking...' : 'Talk (تحدث)'}</span>
              </button>

              <button 
                onClick={() => setCallModalOpen(false)}
                className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md hover:scale-105 transition-all cursor-pointer"
                title="End Call"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Footer branding */}
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 font-medium">
              Powered by <span className="text-[#0a3633] font-semibold">Next Real Estate AI</span>
            </p>
          </div>

        </div>
      )}

      <GoogleSignInModal
        isOpen={googleSignInOpen}
        onClose={() => {
          setGoogleSignInOpen(false);
          setPendingFavoriteProp(null);
        }}
        onSuccess={handleGoogleSuccess}
        lang={lang}
        pendingPropertyTitle={
          pendingFavoriteProp
            ? isArabic
              ? pendingFavoriteProp.titleAr
              : pendingFavoriteProp.title
            : undefined
        }
      />

      <FavoritesDrawer
        isOpen={favoritesDrawerOpen}
        onClose={() => setFavoritesDrawerOpen(false)}
        favorites={favorites}
        properties={properties}
        onSelectProperty={(prop) => {
          setFavoritesDrawerOpen(false);
          handleOpenPropertyDetails(prop);
        }}
        onRemoveFavorite={(id) => {
          const res = authService.toggleFavorite(id);
          setFavorites(res.list);
        }}
        user={currentUser}
        onLogout={handleLogout}
        lang={lang}
      />

      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        property={selectedProperty}
        lang={lang}
      />

      <AddPropertyModal
        isOpen={addPropertyModalOpen}
        onClose={() => setAddPropertyModalOpen(false)}
        lang={lang}
      />

      <AIAssistantModal
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        lang={lang}
        onSelectProperty={handleOpenPropertyDetails}
        onApplyFilter={handleApplyFilterFromAI}
      />

      <AdminPortalModal
        isOpen={adminPortalOpen}
        onClose={() => setAdminPortalOpen(false)}
        properties={properties}
        onAddProperty={handleAddProperty}
        onDeleteProperty={handleDeleteProperty}
        onUpdateProperty={handleUpdateProperty}
        lang={lang}
      />
    </div>
  );
}