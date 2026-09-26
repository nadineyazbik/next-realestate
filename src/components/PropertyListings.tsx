import React, { useRef, useMemo } from 'react';
import { PropertyCard } from './PropertyCard';
import { Property, Language, SearchFilterState } from '../types';
import { RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockProperties } from '../data/properties';

interface PropertyListingsProps {
  properties?: Property[];
  filterType?: string;
  filters?: SearchFilterState;
  lang: Language;
  onSelectProperty?: (property: Property) => void;
  onResetFilters?: () => void;
  onSeeAll?: (section: 'platinum' | 'trending' | 'all') => void;
  favorites?: string[];
  onToggleFavorite?: (property: Property, e: React.MouseEvent) => void;
}

export const PropertyListings: React.FC<PropertyListingsProps> = ({
  properties = mockProperties,
  filterType = 'all',
  filters,
  lang,
  onSelectProperty,
  onResetFilters,
  onSeeAll,
  favorites,
  onToggleFavorite,
}) => {
  const isArabic = lang === 'ar';
  const latestScrollRef = useRef<HTMLDivElement>(null);
  const platinumScrollRef = useRef<HTMLDivElement>(null);
  const trendingScrollRef = useRef<HTMLDivElement>(null);

  // Multi-factor filtering based on Search Bar & Categories
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // 0. Exclude archived properties from public view
      if (property.isArchived) {
        return false;
      }

      // 1. Popular Category Filter
      if (filterType !== 'all' && property.type !== filterType) {
        return false;
      }

      // 2. Location & Sub-Region Filter
      if (
        filters?.location &&
        filters.location !== 'All Lebanon' &&
        filters.location !== 'كافة المناطق اللبنانية'
      ) {
        const locTokens = filters.location
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter((s) => s.length > 0 && s !== 'all lebanon' && s !== 'كافة المناطق اللبنانية');

        if (locTokens.length > 0) {
          const matchesAny = locTokens.some((locQuery) => {
            const matchDistrict =
              property.district.toLowerCase().includes(locQuery) ||
              property.districtAr.toLowerCase().includes(locQuery);
            const matchNeighborhood =
              property.neighborhood.toLowerCase().includes(locQuery) ||
              property.neighborhoodAr.toLowerCase().includes(locQuery);
            const matchZone =
              (property.zone && property.zone.toLowerCase().includes(locQuery)) ||
              (property.zoneAr && property.zoneAr.includes(locQuery));
            const matchFullLoc =
              property.location.toLowerCase().includes(locQuery) ||
              property.locationAr.toLowerCase().includes(locQuery);
            return matchDistrict || matchNeighborhood || matchZone || matchFullLoc;
          });

          if (!matchesAny) {
            return false;
          }
        }
      }

      // 3. Property Type Filter
      if (filters?.propertyType && property.type !== filters.propertyType) {
        return false;
      }

      // 4. Sale or Rental Filter (Strictly Sale or Rental)
      if (filters?.saleOrRental) {
        if (filters.saleOrRental === 'rental' && !property.isRental) return false;
        if (filters.saleOrRental === 'sale' && property.isRental) return false;
      }

      // 5. Building Age Filter
      if (filters?.buildingAge && property.buildingAge !== filters.buildingAge) {
        return false;
      }

      // 6. Area Range Filter
      if (filters?.areaRange) {
        if (filters.areaRange === '0-100' && property.areaSqm > 100) return false;
        if (
          filters.areaRange === '100-180' &&
          (property.areaSqm < 100 || property.areaSqm > 180)
        )
          return false;
        if (
          filters.areaRange === '180-280' &&
          (property.areaSqm < 180 || property.areaSqm > 280)
        )
          return false;
        if (
          filters.areaRange === '280-450' &&
          (property.areaSqm < 280 || property.areaSqm > 450)
        )
          return false;
        if (filters.areaRange === '450+' && property.areaSqm < 450) return false;
      }

      // 7. Bedrooms Filter (Highlighting 3-bed & 4-bed)
      if (filters?.bedrooms && filters.bedrooms !== 'any') {
        const targetBeds = parseInt(filters.bedrooms, 10);
        if (!isNaN(targetBeds) && property.beds !== targetBeds) {
          return false;
        }
      }

      return true;
    });
  }, [properties, filterType, filters]);

  // Sort by latest/newest first so admin-added or recently created properties always appear first
  const sortedProperties = useMemo(() => {
    return [...filteredProperties].sort((a, b) => {
      // Custom/admin-added properties appear first
      const isCustomA = a.id.startsWith('custom-');
      const isCustomB = b.id.startsWith('custom-');
      if (isCustomA && !isCustomB) return -1;
      if (!isCustomA && isCustomB) return 1;

      // By creation date if available
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (a.createdAt && !b.createdAt) return -1;
      if (!a.createdAt && b.createdAt) return 1;

      return 0;
    });
  }, [filteredProperties]);

  const platinumList = useMemo(() => {
    return sortedProperties.filter((p) => p.isPlatinum).slice(0, 6);
  }, [sortedProperties]);

  const trendingList = useMemo(() => {
    return sortedProperties
      .filter((p) => !p.isPlatinum || p.isFeatured)
      .slice(0, 6);
  }, [sortedProperties]);

  const scrollSection = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 280;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="py-6 sm:py-8 space-y-8 sm:space-y-10" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* If No properties match filter */}
      {filteredProperties.length === 0 && (
        <div className="confidence-container text-center py-12 px-4 bg-gray-50 rounded-2xl border border-gray-200">
          <p className="text-base font-semibold text-gray-800 mb-1">
            {isArabic
              ? 'لم يتم العثور على عقارات مطابقة تماماً'
              : 'No properties matched your exact filter'}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mb-4">
            {isArabic
              ? 'جرّب تعديل معايير البحث أو إعادة ضبط التصفية'
              : 'Try adjusting your search criteria or resetting filters'}
          </p>
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="btn-red-cta px-4 py-2 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isArabic ? 'إعادة ضبط التصفية' : 'Reset All Filters'}</span>
            </button>
          )}
        </div>
      )}

      {/* 
        1. Platinum & Recommended Section (Dynamically sorted with newest properties first):
        - Compact title
        - "See All" on the right in red
        - Horizontal swipeable carousel with peek effect
      */}
      {platinumList.length > 0 && (
        <section className="confidence-container px-4 sm:px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-3.5">
            <h2
              className="text-base sm:text-lg font-bold text-[#1f2124] tracking-tight"
              style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
            >
              {isArabic ? 'العقارات البلاتينية والموصى بها' : 'Platinum & Recommended'}
            </h2>

            <div className="flex items-center gap-3">
              {/* Subtle desktop navigation arrows */}
              <div className="hidden sm:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollSection(platinumScrollRef, isArabic ? 'right' : 'left')}
                  className="w-7 h-7 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition"
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSection(platinumScrollRef, isArabic ? 'left' : 'right')}
                  className="w-7 h-7 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition"
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>

              {/* See All link */}
              <button
                type="button"
                onClick={() => onSeeAll && onSeeAll('platinum')}
                className="text-xs sm:text-sm font-bold text-[#c4191a] hover:underline transition cursor-pointer"
                style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
              >
                {isArabic ? 'عرض الكل' : 'See All'}
              </button>
            </div>
          </div>

          {/* Horizontal Swipe Track with Peek Effect */}
          <div
            ref={platinumScrollRef}
            className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {platinumList.map((property) => (
              <div
                key={property.id}
                className="w-[74vw] max-w-[255px] sm:w-[260px] md:w-[270px] shrink-0 snap-start flex flex-col"
              >
                <PropertyCard
                  property={property}
                  onContactClick={onSelectProperty}
                  lang={lang}
                  isFavorite={favorites?.includes(property.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 
        2. Trending Properties Section (Image 14):
        - Header: Title on left, "See All" in red on right
        - Horizontal swipeable carousel with peek effect
        - Limited to latest 4-5 properties
      */}
      {trendingList.length > 0 && (
        <section className="confidence-container px-4 sm:px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-3.5">
            <h2
              className="text-base sm:text-lg font-bold text-[#1f2124] tracking-tight"
              style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
            >
              {isArabic ? 'العقارات الرائجة' : 'Trending Properties'}
            </h2>

            <div className="flex items-center gap-3">
              {/* Subtle desktop navigation arrows */}
              <div className="hidden sm:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollSection(trendingScrollRef, isArabic ? 'right' : 'left')}
                  className="w-7 h-7 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition"
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSection(trendingScrollRef, isArabic ? 'left' : 'right')}
                  className="w-7 h-7 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition"
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>

              {/* See All link */}
              <button
                type="button"
                onClick={() => onSeeAll && onSeeAll('trending')}
                className="text-xs sm:text-sm font-bold text-[#c4191a] hover:underline transition cursor-pointer"
                style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
              >
                {isArabic ? 'عرض الكل' : 'See All'}
              </button>
            </div>
          </div>

          {/* Horizontal Swipe Track with Peek Effect */}
          <div
            ref={trendingScrollRef}
            className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {trendingList.map((property) => (
              <div
                key={property.id}
                className="w-[74vw] max-w-[255px] sm:w-[260px] md:w-[270px] shrink-0 snap-start flex flex-col"
              >
                <PropertyCard
                  property={property}
                  onContactClick={onSelectProperty}
                  lang={lang}
                  isFavorite={favorites?.includes(property.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
