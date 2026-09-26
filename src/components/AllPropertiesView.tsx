import React, { useState, useMemo } from 'react';
import { Property, Language } from '../types';
import { PropertyCard } from './PropertyCard';
import { LEBANON_REGIONS } from '../data/properties';
import {
  ArrowLeft,
  X,
  Menu,
  ChevronDown,
  Building2,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from 'lucide-react';

interface AllPropertiesViewProps {
  properties: Property[];
  initialCategory?: string;
  lang: Language;
  onBack: () => void;
  onSelectProperty: (property: Property) => void;
  favorites?: string[];
  onToggleFavorite?: (property: Property, e?: React.MouseEvent) => void;
}

export const AllPropertiesView: React.FC<AllPropertiesViewProps> = ({
  properties,
  initialCategory = 'all',
  lang,
  onBack,
  onSelectProperty,
  favorites = [],
  onToggleFavorite,
}) => {
  const isArabic = lang === 'ar';

  // 1. Location filter
  const [selectedLocation, setSelectedLocation] = useState('');

  // 2. Ad Types filter (Featured, Platinum)
  const [selectedAdTypes, setSelectedAdTypes] = useState<string[]>(['Featured', 'Platinum']);

  // 3. Property Type filter
  const [selectedType, setSelectedType] = useState<string>(initialCategory);

  // 4. Sale or Rental
  const [dealType, setDealType] = useState<'all' | 'sale' | 'rental'>('all');

  // 5. Price (USD) Min & Max
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');

  // --- Advanced / More Filters (Collapsed by default, expands ONLY on click) ---
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState<boolean>(false);

  // 6. Area (m²) Min & Max
  const [areaMin, setAreaMin] = useState<string>('');
  const [areaMax, setAreaMax] = useState<string>('');

  // 7. Number of Bedrooms
  const [bedrooms, setBedrooms] = useState<string>('');

  // 8. Number of Bathrooms
  const [bathrooms, setBathrooms] = useState<string>('');

  // 9. Floor
  const [floor, setFloor] = useState<string>('Any');

  // 10. Amenities list filter
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showMoreAmenities, setShowMoreAmenities] = useState(false);

  // 11. Furnished
  const [furnished, setFurnished] = useState<string>('');

  // 12. Condition
  const [condition, setCondition] = useState<string>('');

  // 13. Payment Type
  const [paymentType, setPaymentType] = useState<string>('');

  // Mobile Collapse Toggle (starts collapsed by default for clean view)
  const [mobileExpanded, setMobileExpanded] = useState<boolean>(false);

  // Sort & Layout
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Property Types matching reference screenshot and custom classification
  const typeFilterOptions = [
    { id: 'Apartment', icon: '🏢', labelEn: 'Apartment', labelAr: 'شقة سكنية' },
    { id: 'Commercial', icon: '🏬', labelEn: 'Commercial', labelAr: 'عقارات تجارية' },
    { id: 'Shop', icon: '🏪', labelEn: 'Shop', labelAr: 'محل تجاري' },
    { id: 'Warehouse', icon: '🏭', labelEn: 'Warehouse', labelAr: 'مستودع' },
    { id: 'Office', icon: '💼', labelEn: 'Office', labelAr: 'مكتب' },
    { id: 'Villa', icon: '🏡', labelEn: 'Villa', labelAr: 'فيلا' },
    { id: 'Land', icon: '🏕', labelEn: 'Land', labelAr: 'أرض' },
    { id: 'House', icon: '🏠', labelEn: 'House', labelAr: 'بيت مستقل' },
    { id: 'Chalet', icon: '🛖', labelEn: 'Chalet & cabin', labelAr: 'شاليه وكابين' },
    { id: 'Buildings and multiple units', icon: '🏢', labelEn: 'Buildings and multiple units', labelAr: 'مباني وعقارات متعددة' },
  ];

  // Amenities
  const primaryAmenities = [
    { id: 'Indoor Parking', labelEn: 'Indoor Parking', labelAr: 'موقف سيارات داخلي' },
    { id: 'Gym', labelEn: 'Gym', labelAr: 'صالة رياضية (جيم)' },
    { id: 'Closed Community', labelEn: 'Closed Community', labelAr: 'مجمع سكني مغلق' },
    { id: 'Water Well', labelEn: 'Water Well', labelAr: 'بئر مياه خاص' },
    { id: 'In-unit washer and dryer', labelEn: 'In-unit washer and dryer', labelAr: 'غسالة ونشافة داخل الوحدة' },
  ];

  const extraAmenities = [
    { id: 'Balcony', labelEn: 'Balcony', labelAr: 'شرفة واسعة' },
    { id: 'Concierge', labelEn: 'Concierge', labelAr: 'خدمة ناطور / حراسة' },
    { id: 'Sea View', labelEn: 'Sea View', labelAr: 'إطلالة بحرية' },
    { id: 'Mountain View', labelEn: 'Mountain View', labelAr: 'إطلالة جبلية' },
    { id: 'Private Garden', labelEn: 'Private Garden', labelAr: 'حديقة خاصة' },
    { id: 'Maids Room', labelEn: "Maid's Room", labelAr: 'غرفة خادمة' },
    { id: 'Elevator', labelEn: 'Elevator', labelAr: 'مصعد حديث' },
  ];

  // All Lebanese districts and deep Beirut zones
  const allDistricts = useMemo(() => {
    const list: { id: string; nameEn: string; nameAr: string }[] = [];
    const seen = new Set<string>();

    LEBANON_REGIONS.forEach((reg) => {
      reg.neighborhoods.forEach((n) => {
        if (!seen.has(n.nameEn)) {
          seen.add(n.nameEn);
          list.push({ id: n.id, nameEn: n.nameEn, nameAr: n.nameAr });
        }
        if (n.subAreas) {
          n.subAreas.forEach((sub) => {
            if (!seen.has(sub.nameEn)) {
              seen.add(sub.nameEn);
              list.push({ id: sub.id, nameEn: sub.nameEn, nameAr: sub.nameAr });
            }
          });
        }
      });
    });
    return list;
  }, []);

  // Filter properties logic
  const filteredList = useMemo(() => {
    return properties
      .filter((p) => {
        // Exclude archived properties from public view
        if (p.isArchived) return false;

        // 1. Location
        if (selectedLocation) {
          const locLow = selectedLocation.toLowerCase();
          const matchDist =
            p.district.toLowerCase().includes(locLow) ||
            p.districtAr.toLowerCase().includes(locLow);
          const matchNeigh =
            p.neighborhood.toLowerCase().includes(locLow) ||
            p.neighborhoodAr.toLowerCase().includes(locLow);
          const matchZone =
            (p.zone && p.zone.toLowerCase().includes(locLow)) ||
            (p.zoneAr && p.zoneAr.includes(locLow));
          const matchFull =
            p.location.toLowerCase().includes(locLow) ||
            p.locationAr.toLowerCase().includes(locLow);
          if (!matchDist && !matchNeigh && !matchZone && !matchFull) return false;
        }

        // 2. Ad Types
        if (selectedAdTypes.length > 0) {
          const matchFeatured = selectedAdTypes.includes('Featured') && p.isFeatured;
          const matchPlatinum = selectedAdTypes.includes('Platinum') && p.isPlatinum;
          if (!matchFeatured && !matchPlatinum) {
            return false;
          }
        }

        // 3. Type
        if (selectedType !== 'all') {
          if (selectedType === 'Chalet') {
            if (p.type !== 'Chalet' && !p.title.toLowerCase().includes('chalet')) return false;
          } else if (selectedType === 'Commercial') {
            const isComm =
              p.type === 'Commercial' ||
              p.category === 'commercial' ||
              p.type === 'Shop' ||
              p.type === 'Warehouse' ||
              p.type === 'Office' ||
              Boolean(p.commercialSubtype);
            if (!isComm) return false;
          } else if (selectedType === 'Shop') {
            if (
              p.type !== 'Shop' &&
              p.commercialSubtype !== 'shop' &&
              !p.title.toLowerCase().includes('shop') &&
              !p.titleAr.includes('محل')
            )
              return false;
          } else if (selectedType === 'Warehouse') {
            if (
              p.type !== 'Warehouse' &&
              p.commercialSubtype !== 'warehouse' &&
              !p.title.toLowerCase().includes('warehouse') &&
              !p.titleAr.includes('مستودع')
            )
              return false;
          } else if (selectedType === 'Office') {
            if (
              p.type !== 'Office' &&
              p.commercialSubtype !== 'office' &&
              !p.title.toLowerCase().includes('office') &&
              !p.titleAr.includes('مكتب')
            )
              return false;
          } else if (p.type !== selectedType) {
            return false;
          }
        }

        // 4. Amenities
        if (selectedAmenities.length > 0 && p.amenities) {
          const hasAll = selectedAmenities.every((a) => p.amenities?.includes(a));
          if (!hasAll) return false;
        }

        // 5. Price Min & Max
        if (priceMin && p.price < Number(priceMin)) return false;
        if (priceMax && p.price > Number(priceMax)) return false;

        // 6. Area Min & Max
        if (areaMin && p.areaSqm < Number(areaMin)) return false;
        if (areaMax && p.areaSqm > Number(areaMax)) return false;

        // 7. Bedrooms
        if (bedrooms && p.beds !== undefined && p.beds < Number(bedrooms)) return false;

        // 8. Bathrooms
        if (bathrooms && p.baths !== undefined && p.baths < Number(bathrooms)) return false;

        // 9. Floor
        if (floor && floor !== 'Any' && p.floor && p.floor !== floor) return false;

        // 10. Sale or Rental
        if (dealType === 'sale' && p.isRental) return false;
        if (dealType === 'rental' && !p.isRental) return false;

        // 11. Furnished
        if (furnished && p.furnished && p.furnished !== furnished) return false;

        // 12. Condition
        if (condition && p.condition && p.condition !== condition) return false;

        // 13. Payment Type
        if (paymentType && p.paymentType && p.paymentType !== paymentType) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        return (b.isPlatinum ? 1 : 0) - (a.isPlatinum ? 1 : 0);
      });
  }, [
    properties,
    selectedLocation,
    selectedAdTypes,
    selectedType,
    selectedAmenities,
    priceMin,
    priceMax,
    areaMin,
    areaMax,
    bedrooms,
    bathrooms,
    floor,
    dealType,
    furnished,
    condition,
    paymentType,
    sortBy,
  ]);

  // Pagination (6 items per page matching reference)
  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSelectedLocation('');
    setSelectedAdTypes(['Featured', 'Platinum']);
    setSelectedType('all');
    setSelectedAmenities([]);
    setPriceMin('');
    setPriceMax('');
    setAreaMin('');
    setAreaMax('');
    setBedrooms('');
    setBathrooms('');
    setFloor('Any');
    setDealType('all');
    setFurnished('');
    setCondition('');
    setPaymentType('');
    setAdvancedFiltersOpen(false);
    setCurrentPage(1);
  };

  const toggleAdType = (type: string) => {
    setSelectedAdTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
    setCurrentPage(1);
  };

  // Clean, Single-Hierarchy Filter Controls
  const renderFilters = () => (
    <div className="space-y-4 text-start text-gray-800" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* 1. Location */}
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
          {isArabic ? 'الموقع' : 'Location'}
        </label>
        <select
          value={selectedLocation}
          onChange={(e) => {
            setSelectedLocation(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full border border-gray-300 rounded-lg p-2 text-xs sm:text-sm focus:border-[#c4191a] focus:ring-1 focus:ring-[#c4191a] outline-none bg-white text-gray-700 cursor-pointer shadow-xs"
        >
          <option value="">
            {isArabic ? 'يرجى اختيار الموقع (كافة المناطق)' : 'All Locations'}
          </option>
          {allDistricts.map((d) => (
            <option key={d.id} value={d.nameEn}>
              {isArabic ? d.nameAr : d.nameEn}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Sale or Rental Toggle */}
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
          {isArabic ? 'نوع المعاملة' : 'Transaction'}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setDealType(dealType === 'sale' ? 'all' : 'sale');
              setCurrentPage(1);
            }}
            className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer text-center ${
              dealType === 'sale'
                ? 'border-[#c4191a] bg-red-50 text-[#c4191a] shadow-xs'
                : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
            }`}
          >
            {isArabic ? 'للبيع' : 'For Sale'}
          </button>
          <button
            type="button"
            onClick={() => {
              setDealType(dealType === 'rental' ? 'all' : 'rental');
              setCurrentPage(1);
            }}
            className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer text-center ${
              dealType === 'rental'
                ? 'border-[#c4191a] bg-red-50 text-[#c4191a] shadow-xs'
                : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
            }`}
          >
            {isArabic ? 'للإيجار' : 'For Rent'}
          </button>
        </div>
      </div>

      {/* 3. Property Type Buttons */}
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
          {isArabic ? 'نوع العقار' : 'Property Type'}
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {typeFilterOptions.slice(0, 6).map((type) => {
            const isActive = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setSelectedType(isActive ? 'all' : type.id);
                  setCurrentPage(1);
                }}
                className={`border rounded-lg p-2 text-xs flex items-center gap-1.5 transition cursor-pointer text-start ${
                  isActive
                    ? 'border-[#c4191a] bg-red-50 text-[#c4191a] font-bold shadow-xs'
                    : 'border-gray-200 text-gray-700 hover:border-[#c4191a] bg-white'
                }`}
              >
                <span className="text-sm shrink-0">{type.icon}</span>
                <span className="truncate">{isArabic ? type.labelAr : type.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Ad Types (Tags: Featured, Platinum) */}
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
          {isArabic ? 'أنواع الإعلانات' : 'Ad Types'}
        </label>
        <div className="w-full p-1.5 border border-gray-300 rounded-lg bg-white flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedAdTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-0.5 rounded text-xs font-medium border border-gray-200 cursor-pointer"
                onClick={() => toggleAdType(type)}
              >
                <span>{type}</span>
                <span className="text-gray-500 hover:text-gray-800 text-[10px]">✕</span>
              </span>
            ))}
            {selectedAdTypes.length === 0 && (
              <span className="text-xs text-gray-400 px-1">
                {isArabic ? 'كافة الإعلانات' : 'All Ad Types'}
              </span>
            )}
          </div>
          {selectedAdTypes.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedAdTypes([])}
              className="text-gray-400 hover:text-gray-700 px-1 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 5. Price (USD) Min & Max */}
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
          {isArabic ? 'السعر (USD)' : 'Price (USD)'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={priceMin}
            onChange={(e) => {
              setPriceMin(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Min"
            className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:border-[#c4191a] outline-none bg-white text-gray-700 shadow-xs"
          />
          <input
            type="number"
            value={priceMax}
            onChange={(e) => {
              setPriceMax(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Max"
            className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:border-[#c4191a] outline-none bg-white text-gray-700 shadow-xs"
          />
        </div>
      </div>

      {/* 
        ONLY ONE SINGLE "More Filters" / "فلاتر إضافية" TOGGLE:
        Expands all advanced criteria (Bedrooms, Bathrooms, Area, Floor, Amenities, Condition) on explicit user click!
      */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
          className="w-full py-2 px-3 rounded-lg border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 flex items-center justify-between transition cursor-pointer shadow-xs"
        >
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#c4191a]" />
            <span>
              {advancedFiltersOpen
                ? isArabic
                  ? 'إخفاء الفلاتر المتقدمة'
                  : 'Hide Advanced Filters'
                : isArabic
                ? '+ المزيد من الفلاتر (الغرف، المساحة، المرافق...)'
                : '+ More Filters (Beds, Area, Amenities...)'}
            </span>
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
              advancedFiltersOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {advancedFiltersOpen && (
          <div className="space-y-4 pt-3.5 border-t border-gray-200 mt-2 animate-in fade-in duration-150">
            {/* 6. Number of Bedrooms (Specifically highlighting 3-bed & 4-bed) */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center justify-between">
                <span>{isArabic ? 'عدد غرف النوم' : 'Bedrooms'}</span>
                {bedrooms && (
                  <button
                    type="button"
                    onClick={() => {
                      setBedrooms('');
                      setCurrentPage(1);
                    }}
                    className="text-[10px] text-red-600 hover:underline cursor-pointer"
                  >
                    {isArabic ? 'إلغاء' : 'Clear'}
                  </button>
                )}
              </label>

              <div className="grid grid-cols-4 gap-1 mb-1.5">
                {[
                  { val: '2', labelEn: '2 Beds', labelAr: 'غرفتان' },
                  { val: '3', labelEn: '3 Beds ⭐', labelAr: '٣ غرف ⭐', highlight: true },
                  { val: '4', labelEn: '4 Beds ⭐', labelAr: '٤ غرف ⭐', highlight: true },
                  { val: '5', labelEn: '5+ Beds', labelAr: '٥+ غرف' },
                ].map((item) => {
                  const isSelected = bedrooms === item.val;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => {
                        setBedrooms(isSelected ? '' : item.val);
                        setCurrentPage(1);
                      }}
                      className={`py-1 rounded text-[11px] font-semibold transition border cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#c4191a] text-white border-[#c4191a] shadow-xs'
                          : item.highlight
                          ? 'bg-red-50 border-red-200 text-[#c4191a] hover:bg-red-100'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {isArabic ? item.labelAr : item.labelEn}
                    </button>
                  );
                })}
              </div>

              <input
                type="number"
                value={bedrooms}
                onChange={(e) => {
                  setBedrooms(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={isArabic ? 'أو أدخل رقم الغرف...' : 'Or enter custom beds...'}
                className="w-full border border-gray-300 rounded-lg p-1.5 text-xs focus:border-[#c4191a] outline-none bg-white text-gray-700"
              />
            </div>

            {/* 7. Area (m²) */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                {isArabic ? 'المساحة (م²)' : 'Area (m²)'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={areaMin}
                  onChange={(e) => {
                    setAreaMin(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Min m²"
                  className="w-full border border-gray-300 rounded-lg p-1.5 text-xs focus:border-[#c4191a] outline-none bg-white text-gray-700"
                />
                <input
                  type="number"
                  value={areaMax}
                  onChange={(e) => {
                    setAreaMax(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Max m²"
                  className="w-full border border-gray-300 rounded-lg p-1.5 text-xs focus:border-[#c4191a] outline-none bg-white text-gray-700"
                />
              </div>
            </div>

            {/* 8. Number of Bathrooms */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                {isArabic ? 'عدد الحمامات' : 'Bathrooms'}
              </label>
              <input
                type="number"
                value={bathrooms}
                onChange={(e) => {
                  setBathrooms(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="e.g. 2"
                className="w-full border border-gray-300 rounded-lg p-1.5 text-xs focus:border-[#c4191a] outline-none bg-white text-gray-700"
              />
            </div>

            {/* 9. Floor */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                {isArabic ? 'الطابق' : 'Floor'}
              </label>
              <select
                value={floor}
                onChange={(e) => {
                  setFloor(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded-lg p-1.5 text-xs focus:border-[#c4191a] outline-none bg-white text-gray-700 cursor-pointer"
              >
                <option value="Any">{isArabic ? 'أي طابق' : 'Any Floor'}</option>
                <option value="Ground Floor">{isArabic ? 'طابق أرضي' : 'Ground Floor'}</option>
                <option value="1">{isArabic ? 'الطابق الأول' : '1st Floor'}</option>
                <option value="2">{isArabic ? 'الطابق الثاني' : '2nd Floor'}</option>
                <option value="3">{isArabic ? 'الطابق الثالث' : '3rd Floor'}</option>
                <option value="4-7">{isArabic ? 'طوابق 4 - 7' : '4th - 7th Floor'}</option>
                <option value="8+">{isArabic ? 'طابق 8 فما فوق' : '8th+ Floor'}</option>
                <option value="Roof / Penthouse">{isArabic ? 'روف / بنتهاوس' : 'Roof / Penthouse'}</option>
              </select>
            </div>

            {/* 10. Amenities */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                {isArabic ? 'المرافق والتجهيزات' : 'Amenities'}
              </label>
              <div className="space-y-1">
                {primaryAmenities.map((amenity) => (
                  <label
                    key={amenity.id}
                    className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity.id)}
                      onChange={() => toggleAmenity(amenity.id)}
                      className="w-3.5 h-3.5 text-[#c4191a] rounded border-gray-300"
                    />
                    <span>{isArabic ? amenity.labelAr : amenity.labelEn}</span>
                  </label>
                ))}

                {showMoreAmenities &&
                  extraAmenities.map((amenity) => (
                    <label
                      key={amenity.id}
                      className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity.id)}
                        onChange={() => toggleAmenity(amenity.id)}
                        className="w-3.5 h-3.5 text-[#c4191a] rounded border-gray-300"
                      />
                      <span>{isArabic ? amenity.labelAr : amenity.labelEn}</span>
                    </label>
                  ))}
              </div>

              <button
                type="button"
                onClick={() => setShowMoreAmenities(!showMoreAmenities)}
                className="text-xs text-[#c4191a] hover:underline font-semibold mt-1 cursor-pointer block"
              >
                {showMoreAmenities
                  ? isArabic
                    ? 'عرض أقل'
                    : 'Show less'
                  : isArabic
                  ? 'عرض المزيد'
                  : 'Show more'}
              </button>
            </div>

            {/* 11. Furnished */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                {isArabic ? 'الفرش' : 'Furnished'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'unfurnished', labelEn: 'Unfurnished', labelAr: 'غير مفروش' },
                  { id: 'fully_furnished', labelEn: 'Fully Furnished', labelAr: 'مفروش' },
                  { id: 'appliances_only', labelEn: 'Appliances Only', labelAr: 'أجهزة فقط' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setFurnished(furnished === item.id ? '' : item.id);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition cursor-pointer ${
                      furnished === item.id
                        ? 'border-[#c4191a] bg-red-50 text-[#c4191a] font-bold shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {isArabic ? item.labelAr : item.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* 12. Condition */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                {isArabic ? 'حالة البناء' : 'Condition'}
              </label>
              <div className="flex gap-1.5">
                {[
                  { id: 'under_construction', labelEn: 'Under Construction', labelAr: 'قيد الإنشاء' },
                  { id: 'ready', labelEn: 'Ready', labelAr: 'جاهز' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCondition(condition === item.id ? '' : item.id);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1 rounded-md border text-[11px] font-medium transition cursor-pointer ${
                      condition === item.id
                        ? 'border-[#c4191a] bg-red-50 text-[#c4191a] font-bold shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {isArabic ? item.labelAr : item.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Filters Red Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleResetFilters}
          className="w-full bg-[#c4191a] hover:bg-[#a51516] text-white py-2 px-4 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs"
        >
          {isArabic ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-4 pb-16" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Back / Breadcrumb Button */}
        <div className="mb-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#c4191a] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>{isArabic ? 'العودة للصفحة الرئيسية' : 'Back to Home'}</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="mb-4 text-start">
          <h1
            className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight"
            style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
          >
            {isArabic ? 'كافة العقارات' : 'All Properties'}
          </h1>
        </div>

        {/* 
          Main Grid Layout:
          - Desktop: Left Column: Filters Sidebar (lg:col-span-1); Right Column: Results & Grid (lg:col-span-3)
          - Mobile: Single vertical stack with ONLY ONE collapsible "More Filters" / "Less Filters" button
        */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Filters Sidebar (Desktop & Mobile) */}
          <aside className="lg:col-span-1 bg-white lg:p-4 lg:border lg:border-gray-200 lg:rounded-xl lg:shadow-xs">
            {/* 
              Mobile ONLY ONE Collapsible Toggle:
              The redundant bottom duplicate has been permanently removed!
            */}
            <div className="block lg:hidden mb-2">
              <div className="flex items-center justify-center relative my-2">
                <div className="w-full border-t border-gray-300 absolute"></div>
                <button
                  type="button"
                  onClick={() => setMobileExpanded(!mobileExpanded)}
                  className="relative bg-white px-3 text-xs font-semibold text-[#c4191a] hover:underline flex items-center gap-1 cursor-pointer select-none"
                >
                  <span>
                    {mobileExpanded
                      ? isArabic
                        ? 'إخفاء الفلاتر'
                        : 'Less Filters'
                      : isArabic
                      ? 'المزيد من الفلاتر'
                      : 'More Filters'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      mobileExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Filter controls: always shown on desktop; toggled on mobile */}
            <div className={mobileExpanded ? 'block' : 'hidden lg:block'}>
              {renderFilters()}
            </div>

            {/* Mobile Full-Width Red Sort Button */}
            <div className="block lg:hidden mt-3">
              <div className="relative w-full">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#c4191a] hover:bg-[#a51516] text-white py-2.5 px-4 rounded-md font-semibold text-sm cursor-pointer shadow-xs outline-none transition appearance-none text-start flex items-center pr-8 rtl:pr-4 rtl:pl-8"
                >
                  <option value="newest" className="bg-white text-gray-800">
                    {isArabic ? 'الترتيب: الأحدث' : 'Sort By: Newly Listed'}
                  </option>
                  <option value="price_asc" className="bg-white text-gray-800">
                    {isArabic ? 'السعر: من الأقل للأعلى' : 'Sort By: Price Low to High'}
                  </option>
                  <option value="price_desc" className="bg-white text-gray-800">
                    {isArabic ? 'السعر: من الأعلى للأقل' : 'Sort By: Price High to Low'}
                  </option>
                </select>
                <div className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 pointer-events-none text-white flex items-center gap-1">
                  <Menu className="w-4 h-4" />
                </div>
              </div>

              {/* Mobile Property Found Badge */}
              <div className="mt-3">
                <div className="inline-block border border-gray-300 rounded-md px-4 py-2 text-[#c4191a] font-bold text-sm bg-white shadow-xs">
                  {filteredList.length} {isArabic ? 'عقار متاح' : 'Property found'}
                </div>
              </div>
            </div>
          </aside>

          {/* Listings Main Area */}
          <div className="lg:col-span-3">
            {/* Desktop Results Header Bar */}
            <div className="hidden lg:flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
              <div className="border border-gray-300 rounded px-3 py-1.5 text-[#c4191a] font-bold text-sm bg-white shadow-xs">
                {filteredList.length} {isArabic ? 'عقار متاح' : 'Property found'}
              </div>

              <div className="flex items-center gap-3">
                {/* Red Sort Button */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="bg-[#c4191a] hover:bg-[#a51516] text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 cursor-pointer shadow-xs outline-none transition appearance-none pr-8 rtl:pr-4 rtl:pl-8"
                  >
                    <option value="newest" className="bg-white text-gray-800">
                      {isArabic ? 'الترتيب: الأحدث' : 'Sort By: Newly Listed'}
                    </option>
                    <option value="price_asc" className="bg-white text-gray-800">
                      {isArabic ? 'السعر: من الأقل للأعلى' : 'Sort By: Price Low to High'}
                    </option>
                    <option value="price_desc" className="bg-white text-gray-800">
                      {isArabic ? 'السعر: من الأعلى للأقل' : 'Sort By: Price High to Low'}
                    </option>
                  </select>
                  <Menu className="w-4 h-4 text-white pointer-events-none absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                {/* Grid & List View Toggle Buttons */}
                <div className="flex border border-gray-200 rounded overflow-hidden bg-white shadow-xs">
                  <button
                    type="button"
                    onClick={() => setViewLayout('grid')}
                    className={`p-2 transition cursor-pointer ${
                      viewLayout === 'grid'
                        ? 'bg-gray-100 text-[#c4191a]'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    } border-r border-gray-200 rtl:border-r-0 rtl:border-l`}
                    title={isArabic ? 'عرض شبكي' : 'Grid View'}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewLayout('list')}
                    className={`p-2 transition cursor-pointer ${
                      viewLayout === 'list'
                        ? 'bg-gray-100 text-[#c4191a]'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                    title={isArabic ? 'عرض قائمة' : 'List View'}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Properties Cards List */}
            {paginatedList.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200 p-8 shadow-xs">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-base font-semibold text-gray-800 mb-1">
                  {isArabic ? 'لم يتم العثور على عقارات مطابقة للفلاتر' : 'No properties match these filters'}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                  {isArabic
                    ? 'جرّب إعادة ضبط الفلاتر أو توسيع خيارات البحث'
                    : 'Try resetting the filters or widening your criteria'}
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="bg-[#c4191a] hover:bg-[#a51516] text-white px-4 py-2 text-xs font-semibold rounded cursor-pointer transition shadow-xs"
                >
                  {isArabic ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
                </button>
              </div>
            ) : (
              /* Multi-Column Grid on Desktop, Single Stack on Mobile */
              <div
                className={
                  viewLayout === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'flex flex-col gap-6'
                }
              >
                {paginatedList.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onContactClick={onSelectProperty}
                    lang={lang}
                    isFavorite={favorites.includes(property.id)}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            )}

            {/* Centered Numbered Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-10">
                <button
                  type="button"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="w-9 h-9 border border-gray-300 rounded flex items-center justify-center text-gray-400 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="First Page"
                >
                  «
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-9 h-9 border border-gray-300 rounded flex items-center justify-center text-gray-400 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Previous Page"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 border rounded font-semibold text-xs sm:text-sm transition cursor-pointer ${
                      currentPage === pageNum
                        ? 'border-[#c4191a] bg-[#c4191a] text-white'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 border border-gray-300 rounded flex items-center justify-center text-gray-400 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Next Page"
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 border border-gray-300 rounded flex items-center justify-center text-gray-400 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Last Page"
                >
                  »
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
