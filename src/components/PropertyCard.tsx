import React, { memo, useState } from 'react';
import { MapPin, Bed, Bath, Maximize, Heart, Tag } from 'lucide-react';
import { Property, Language } from '../types';

interface PropertyCardProps {
  property: Property;
  onContactClick?: (property: Property) => void;
  lang?: Language;
  isFavorite?: boolean;
  onToggleFavorite?: (property: Property, e: React.MouseEvent) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=75';

const PropertyCardComponent: React.FC<PropertyCardProps> = ({
  property,
  onContactClick,
  lang = 'en',
  isFavorite = false,
  onToggleFavorite,
}) => {
  const isArabic = lang === 'ar';
  const [imgSrc, setImgSrc] = useState(property.imageUrl || FALLBACK_IMAGE);

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div
      onClick={() => onContactClick && onContactClick(property)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 shadow-xs hover:shadow-md transition-all duration-200 group flex flex-col h-full cursor-pointer select-none will-change-transform"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* 
        Property Image Section:
        - Aspect 16:10 or 4:3 compact proportion
        - Heart button top-right (triggers Google Sign-in if guest)
        - Subtle Platinum badge at bottom-left
      */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={imgSrc}
          alt={isArabic ? property.titleAr : property.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
          decoding="async"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
        />

        {/* Architectural Headline Overlay on Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex items-center justify-center p-3 text-center pointer-events-none">
          <span className="text-white text-xs sm:text-[13px] font-black tracking-wider uppercase drop-shadow-md line-clamp-2 px-2 leading-snug">
            {isArabic ? property.titleAr : property.title}
          </span>
        </div>

        {/* Top-Right Heart Button (Connected to Wishlist Authentication) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleFavorite) {
              onToggleFavorite(property, e);
            }
          }}
          className={`absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-xs z-10 border cursor-pointer ${
            isFavorite
              ? 'bg-red-50 border-red-300 text-[#c4191a]'
              : 'bg-white/90 hover:bg-white border-gray-200 text-gray-700 hover:text-[#c4191a]'
          }`}
          title={isArabic ? 'حفظ في المفضلة' : 'Save to Favorites'}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isFavorite ? 'fill-[#c4191a] text-[#c4191a]' : 'text-[#c4191a]'
            }`}
          />
        </button>

        {/* Bottom-Left Subtle Platinum Badge */}
        {property.isPlatinum && (
          <div className="absolute bottom-2 left-2 rtl:left-auto rtl:right-2 z-10">
            <span className="bg-black/60 backdrop-blur-xs text-white text-[9px] font-medium px-2 py-0.5 rounded uppercase tracking-wider">
              {isArabic ? 'بلاتينيوم' : 'Platinum'}
            </span>
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-grow text-start">
        {/* Row 1: Tags under the image */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span className="border border-[#c4191a] text-[#c4191a] text-[10px] font-medium px-2.5 py-0.5 rounded">
            {isArabic ? property.typeAr : property.type}
          </span>
          <span className="border border-[#c4191a] text-[#c4191a] text-[10px] font-medium px-2.5 py-0.5 rounded">
            {property.isRental ? (isArabic ? 'للإيجار' : 'Rental') : (isArabic ? 'للبيع' : 'Sale')}
          </span>
        </div>

        {/* Row 2: Price */}
        <div className="flex items-baseline gap-1 mb-1">
          <span
            className="text-base sm:text-lg font-black text-[#c4191a] tracking-tight"
            style={{ fontFamily: "'Prompt', sans-serif" }}
          >
            USD {formatPrice(property.price)}
          </span>
          {property.isRental && (
            <span className="text-[11px] font-medium text-gray-500">
              {isArabic ? '/ شهر' : '/ mo'}
            </span>
          )}
        </div>

        {/* Row 3: Title */}
        <h4
          className="text-[#1f2124] font-medium text-xs sm:text-[13px] leading-snug line-clamp-2 mb-1.5 group-hover:text-[#c4191a] transition-colors"
          style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
        >
          {isArabic ? property.titleAr : property.title}
        </h4>

        {/* Row 4: Location */}
        <div className="flex items-center gap-1 text-gray-500 text-[11px] mb-1">
          <MapPin className="w-3 h-3 text-[#c4191a] shrink-0" />
          <span className="truncate">{isArabic ? property.locationAr : property.location}</span>
        </div>

        {/* Row 5: Reference Code */}
        <div className="flex items-center gap-1 text-gray-400 text-[10px] mb-2.5 font-mono">
          <Tag className="w-2.5 h-2.5 shrink-0" />
          <span>{property.referenceNo}</span>
        </div>

        {/* Row 6: Specifications (Beds, Baths, Size) */}
        <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600 font-normal">
          {property.beds !== undefined && (
            <div className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-gray-400" />
              <span>{property.beds}</span>
            </div>
          )}
          {property.baths !== undefined && (
            <div className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-gray-400" />
              <span>{property.baths}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Maximize className="w-3.5 h-3.5 text-gray-400" />
            <span>{property.areaSqm} m²</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PropertyCard = memo(PropertyCardComponent);
