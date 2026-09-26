import React, { useState, useEffect, useRef } from 'react';
import { Building2, Home, Calendar, Maximize2, SlidersHorizontal, ChevronDown, Check, X } from 'lucide-react';
import { Language, SearchFilterState } from '../types';
import { BUILDING_AGES, AREA_RANGES, PROPERTY_TYPES } from '../data/properties';
import { LocationCascadeDropdown } from './LocationCascadeDropdown';

interface HeroSectionProps {
  lang: Language;
  onSearch?: (filters: SearchFilterState) => void;
  activeFilters?: SearchFilterState;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  lang,
  onSearch,
  activeFilters,
}) => {
  const isArabic = lang === 'ar';

  const [location, setLocation] = useState(activeFilters?.location || '');
  const [propertyType, setPropertyType] = useState(activeFilters?.propertyType || '');
  const [saleOrRental, setSaleOrRental] = useState(activeFilters?.saleOrRental || '');
  const [buildingAge, setBuildingAge] = useState(activeFilters?.buildingAge || '');
  const [areaRange, setAreaRange] = useState(activeFilters?.areaRange || '');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Custom popups state
  const [saleOrRentalOpen, setSaleOrRentalOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);

  const saleOrRentalRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (saleOrRentalRef.current && !saleOrRentalRef.current.contains(e.target as Node)) {
        setSaleOrRentalOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Sync with activeFilters
  useEffect(() => {
    if (activeFilters) {
      if (activeFilters.location !== undefined) setLocation(activeFilters.location);
      if (activeFilters.propertyType !== undefined) setPropertyType(activeFilters.propertyType);
      if (activeFilters.saleOrRental !== undefined) setSaleOrRental(activeFilters.saleOrRental);
      if (activeFilters.buildingAge !== undefined) setBuildingAge(activeFilters.buildingAge);
      if (activeFilters.areaRange !== undefined) setAreaRange(activeFilters.areaRange);

      if (activeFilters.buildingAge || activeFilters.areaRange) {
        setShowAdvancedFilters(true);
      }
    }
  }, [activeFilters]);

  // High-end real estate background image
  const heroBgImage =
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2560&q=85';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      if (onSearch) {
        onSearch({
          location,
          propertyType,
          saleOrRental,
          buildingAge,
          areaRange,
        });
      }
    }, 150);
  };

  const selectedTypeObj = PROPERTY_TYPES.find((t) => t.id === propertyType);

  return (
    <section
      id="hero-section"
      className="relative z-20 min-h-[460px] lg:min-h-[500px] flex items-center justify-center pt-24 pb-14 lg:pt-32 lg:pb-18 overflow-visible"
      style={{
        backgroundImage: `url(${heroBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Precision Soft Dark Gradient Overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'linear-gradient(269.47deg, rgba(0, 0, 0, 0.28) 15%, rgba(0, 0, 0, 0.62) 85%)',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent z-[2] pointer-events-none" />

      <div className="confidence-container relative z-10 w-full flex flex-col items-center text-center px-4 overflow-visible">
        {/* Brand Headline: Next Real Estate */}
        <div className="max-w-3xl mx-auto mb-6 sm:mb-8">
          <h1
            className="text-white text-3xl sm:text-4xl md:text-[44px] font-bold tracking-tight drop-shadow-md"
            style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
          >
            Next Real Estate
          </h1>
        </div>

        {/* 
          RESPONSIVE HERO SEARCH BAR:
          1. Desktop (lg+): Horizontal layout where Location, Type, Sale/Rental, and Search Button sit side-by-side in one row.
          2. Mobile/Tablet: Gracefully stacks vertically.
          3. STRICT REMOVAL OF KEYWORDS: Zero keyword inputs anywhere.
        */}
        <div className="w-full max-w-[500px] lg:max-w-4xl xl:max-w-5xl overflow-visible relative z-30">
          <form onSubmit={handleSearchSubmit} className="space-y-3 overflow-visible">
            {/* Main Fields Container: flex-col on mobile, flex-row on desktop */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 overflow-visible">
              
              {/* Field 1: Location Cascade Dropdown (wider share on desktop) */}
              <div className="w-full lg:flex-[1.4] relative z-40">
                <LocationCascadeDropdown value={location} onChange={setLocation} lang={lang} />
              </div>

              {/* Field 2: Property Type Dropdown */}
              <div ref={typeRef} className="relative w-full lg:flex-1 text-start z-30">
                <button
                  type="button"
                  onClick={() => {
                    setTypeDropdownOpen(!typeDropdownOpen);
                    setSaleOrRentalOpen(false);
                  }}
                  className="w-full h-10 px-3 flex items-center justify-between bg-black/25 hover:bg-black/35 focus:bg-black/45 text-white text-xs sm:text-sm font-normal rounded-lg border border-white/50 focus:border-white focus:outline-none transition-all shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-white/70 shrink-0" />
                    <span className="truncate">
                      {selectedTypeObj
                        ? isArabic
                          ? selectedTypeObj.nameAr
                          : selectedTypeObj.nameEn
                        : isArabic
                        ? 'نوع العقار'
                        : 'Property Type'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {propertyType && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setPropertyType('');
                        }}
                        className="hover:text-red-400 p-0.5"
                      >
                        <X className="w-3 h-3 text-white/70" />
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-white/70 transition-transform ${
                        typeDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {typeDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] bg-white text-gray-800 rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50 text-xs sm:text-sm max-h-64 overflow-y-auto animate-in fade-in duration-100">
                    <div
                      onClick={() => {
                        setPropertyType('');
                        setTypeDropdownOpen(false);
                      }}
                      className={`px-3.5 py-2.5 hover:bg-gray-100 cursor-pointer flex items-center justify-between transition-colors ${
                        !propertyType ? 'bg-red-50 text-[#c4191a] font-bold' : ''
                      }`}
                    >
                      <span>{isArabic ? 'كافة الأنواع' : 'All Types'}</span>
                      {!propertyType && <Check className="w-4 h-4 text-[#c4191a]" />}
                    </div>
                    {PROPERTY_TYPES.map((type) => {
                      const active = propertyType === type.id;
                      return (
                        <div
                          key={type.id}
                          onClick={() => {
                            setPropertyType(type.id);
                            setTypeDropdownOpen(false);
                          }}
                          className={`px-3.5 py-2.5 hover:bg-gray-100 cursor-pointer flex items-center justify-between border-t border-gray-100 transition-colors ${
                            active ? 'bg-red-50 text-[#c4191a] font-bold' : ''
                          }`}
                        >
                          <span>{isArabic ? type.nameAr : type.nameEn}</span>
                          {active && <Check className="w-4 h-4 text-[#c4191a]" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Field 3: Sale or Rental Dropdown (Strictly "Sale" and "Rental") */}
              <div ref={saleOrRentalRef} className="relative w-full lg:flex-1 text-start z-30">
                <button
                  type="button"
                  onClick={() => {
                    setSaleOrRentalOpen(!saleOrRentalOpen);
                    setTypeDropdownOpen(false);
                  }}
                  className="w-full h-10 px-3 flex items-center justify-between bg-black/25 hover:bg-black/35 focus:bg-black/45 text-white text-xs sm:text-sm font-normal rounded-lg border border-white/50 focus:border-white focus:outline-none transition-all shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Home className="w-3.5 h-3.5 text-white/70 shrink-0" />
                    <span className="truncate">
                      {saleOrRental === 'sale'
                        ? isArabic
                          ? 'للبيع'
                          : 'Sale'
                        : saleOrRental === 'rental'
                        ? isArabic
                          ? 'للإيجار'
                          : 'Rental'
                        : isArabic
                        ? 'بيع أو إيجار'
                        : 'Sale or Rental'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {saleOrRental && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setSaleOrRental('');
                        }}
                        className="hover:text-red-400 p-0.5"
                      >
                        <X className="w-3 h-3 text-white/70" />
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-white/70 transition-transform ${
                        saleOrRentalOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {saleOrRentalOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full min-w-[180px] bg-white text-gray-800 rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50 text-xs sm:text-sm animate-in fade-in duration-100">
                    <div
                      onClick={() => {
                        setSaleOrRental('');
                        setSaleOrRentalOpen(false);
                      }}
                      className={`px-4 py-2.5 hover:bg-gray-100 cursor-pointer flex items-center justify-between transition-colors ${
                        !saleOrRental ? 'bg-red-50 text-[#c4191a] font-bold' : 'font-medium'
                      }`}
                    >
                      <span>{isArabic ? 'الكل (بيع وإيجار)' : 'All (Sale & Rental)'}</span>
                      {!saleOrRental && <Check className="w-4 h-4 text-[#c4191a]" />}
                    </div>
                    <div
                      onClick={() => {
                        setSaleOrRental('sale');
                        setSaleOrRentalOpen(false);
                      }}
                      className={`px-4 py-2.5 hover:bg-gray-100 cursor-pointer flex items-center justify-between border-t border-gray-100 transition-colors ${
                        saleOrRental === 'sale' ? 'bg-red-50 text-[#c4191a] font-bold' : 'font-medium'
                      }`}
                    >
                      <span>{isArabic ? 'بيع' : 'Sale'}</span>
                      {saleOrRental === 'sale' && <Check className="w-4 h-4 text-[#c4191a]" />}
                    </div>
                    <div
                      onClick={() => {
                        setSaleOrRental('rental');
                        setSaleOrRentalOpen(false);
                      }}
                      className={`px-4 py-2.5 hover:bg-gray-100 cursor-pointer flex items-center justify-between border-t border-gray-100 transition-colors ${
                        saleOrRental === 'rental' ? 'bg-red-50 text-[#c4191a] font-bold' : 'font-medium'
                      }`}
                    >
                      <span>{isArabic ? 'إيجار' : 'Rental'}</span>
                      {saleOrRental === 'rental' && <Check className="w-4 h-4 text-[#c4191a]" />}
                    </div>
                  </div>
                )}
              </div>

              {/* 
                Field 4: Search Button
                - Desktop: positioned horizontally at the right end of this exact same row
                - Mobile: stacked below in the column
              */}
              <div className="w-full lg:w-auto shrink-0 flex justify-center">
                <button
                  id="hero-search-btn"
                  type="submit"
                  disabled={isSearching}
                  className="w-full sm:w-44 lg:w-32 xl:w-36 h-10 rounded-lg bg-[#c4191a] hover:bg-[#a51516] active:bg-[#8f1213] text-white text-xs sm:text-sm font-bold tracking-wide shadow-md transition-all flex items-center justify-center cursor-pointer select-none"
                >
                  {isSearching ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>{isArabic ? 'بحث' : 'Search'}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Filter Toggle for Building Age & Area */}
            <div className="flex flex-col items-center pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-[11px] text-white/80 hover:text-white transition-colors flex items-center gap-1 py-0.5 px-2 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3 text-[#c4191a]" />
                <span>
                  {showAdvancedFilters
                    ? isArabic
                      ? 'إخفاء الفلاتر الإضافية'
                      : 'Hide Extra Filters'
                    : isArabic
                    ? '+ فلاتر إضافية (عمر البناية، المساحة)'
                    : '+ More Filters (Building Age, Area)'}
                </span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    showAdvancedFilters ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showAdvancedFilters && (
                <div className="w-full max-w-xl mt-2 pt-2 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white animate-in fade-in duration-150">
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3 rtl:left-auto rtl:right-3 w-3.5 h-3.5 text-[#c4191a] pointer-events-none z-10" />
                    <select
                      value={buildingAge}
                      onChange={(e) => setBuildingAge(e.target.value)}
                      className="w-full h-9 pl-8 pr-7 rtl:pl-7 rtl:pr-8 bg-black/35 hover:bg-black/45 text-white text-xs rounded-lg border border-white/40 focus:border-white focus:outline-none appearance-none cursor-pointer"
                    >
                      {BUILDING_AGES.map((age) => (
                        <option key={age.value} value={age.value} className="bg-[#1a1b1d] text-white">
                          {isArabic ? age.labelAr : age.labelEn}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/60 text-[10px]">
                      ▼
                    </div>
                  </div>

                  <div className="relative flex items-center">
                    <Maximize2 className="absolute left-3 rtl:left-auto rtl:right-3 w-3.5 h-3.5 text-[#c4191a] pointer-events-none z-10" />
                    <select
                      value={areaRange}
                      onChange={(e) => setAreaRange(e.target.value)}
                      className="w-full h-9 pl-8 pr-7 rtl:pl-7 rtl:pr-8 bg-black/35 hover:bg-black/45 text-white text-xs rounded-lg border border-white/40 focus:border-white focus:outline-none appearance-none cursor-pointer"
                    >
                      {AREA_RANGES.map((area) => (
                        <option key={area.value} value={area.value} className="bg-[#1a1b1d] text-white">
                          {isArabic ? area.labelAr : area.labelEn}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/60 text-[10px]">
                      ▼
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
