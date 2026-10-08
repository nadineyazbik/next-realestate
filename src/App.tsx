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
import AICallWidget from './AICallWidget';
import { Property, Language, SearchFilterState } from './types';
import { mockProperties } from './data/properties';
import { authService, GoogleUser } from './services/authService';
import { X, MessageCircle, Phone, Sparkles } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState<boolean>(false);
  const [addPropertyModalOpen, setAddPropertyModalOpen] = useState<boolean>(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState<boolean>(false);
  const [adminPortalOpen, setAdminPortalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'home' | 'all_properties' | 'property_details'>('home');
  const [allPropertiesInitialCat, setAllPropertiesInitialCat] = useState<string>('all');

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

  // Synchronize high-concurrency property listings from backend API
  useEffect(() => {
    fetch('/api/properties')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.properties) && data.properties.length > 0) {
          setProperties(data.properties);
        }
      })
      .catch(() => {
        // Safe offline / mock fallback
      });
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

    // Check if user is logged in via Google OAuth
    if (!currentUser) {
      setPendingFavoriteProp(property);
      setGoogleSignInOpen(true);
      return;
    }

    // Toggle favorite in storage and state
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

      {/* --- زر نادين الذكي للاتصال الصوتي المباشر --- */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => {
            const widgetElement = document.querySelector('elevenlabs-convai');
            if (widgetElement) {
              (widgetElement as HTMLElement).click();
            }
          }}
          className="flex items-center justify-center w-16 h-16 bg-[#0a3633] text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 border-2 border-white/30 cursor-pointer animate-bounce"
          title="Talk to Nadine - AI Advisor"
        >
          <Phone className="w-7 h-7" />
        </button>
      </div>

      {/* عنصر ElevenLabs الرسمي مع الـ Agent ID الخاص بكِ */}
      <div className="hidden">
        {/* @ts-ignore */}
        <elevenlabs-convai agent-id="Agent_0301m4dgyp7kftq9b2kwawvv836p"></elevenlabs-convai>
      </div>

      {/* تحميل سكريبت ElevenLabs تلقائياً عند تشغيل الصفحة */}
      {(() => {
        useEffect(() => {
          const scriptId = 'elevenlabs-convai-script';
          if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://elevenlabs.io/convai-widget/index.js';
            script.async = true;
            document.body.appendChild(script);
          }
        }, []);
        return null;
      })()}

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