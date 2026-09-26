import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Property, Language, SearchFilterState } from '../types';
import { PropertyCard } from './PropertyCard';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Phone,
  MessageCircle,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  ArrowLeft,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  X,
} from 'lucide-react';

interface PropertyDetailsPageProps {
  property: Property;
  allProperties: Property[];
  lang: Language;
  onBack: () => void;
  onNavigateAllProperties: () => void;
  onSelectProperty: (property: Property) => void;
  isFavorite: boolean;
  onToggleFavorite: (property: Property, e?: React.MouseEvent) => void;
  favorites?: string[];
  onSearch?: (filters: SearchFilterState) => void;
}

export const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({
  property,
  allProperties,
  lang,
  onBack,
  onNavigateAllProperties,
  onSelectProperty,
  isFavorite,
  onToggleFavorite,
  favorites = [],
  onSearch,
}) => {
  const isArabic = lang === 'ar';
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const similarScrollRef = useRef<HTMLDivElement>(null);

  // Gallery of high-quality interior/exterior angles
  const galleryImages = useMemo(() => {
    const defaultList = [
      property.imageUrl,
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1400&q=85',
    ];
    return defaultList;
  }, [property.imageUrl]);

  // Dynamic SEO title & Schema.org JSON-LD for Property
  useEffect(() => {
    const prevTitle = document.title;
    const titleText = isArabic
      ? `${property.titleAr} | ${property.locationAr} | Next Real Estate`
      : `${property.title} | ${property.location} | Next Real Estate Lebanon`;
    document.title = titleText;

    // Inject JSON-LD Schema for this specific listing
    const scriptId = 'property-ld-json';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: isArabic ? property.titleAr : property.title,
      description: (isArabic ? property.descriptionAr : property.description) || (isArabic ? property.titleAr : property.title),
      image: galleryImages,
      url: window.location.href,
      price: property.price,
      priceCurrency: 'USD',
      address: {
        '@type': 'PostalAddress',
        addressLocality: property.location,
        addressCountry: 'LB',
      },
      offers: {
        '@type': 'Offer',
        price: property.price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    });

    return () => {
      document.title = prevTitle;
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [property, isArabic, galleryImages]);
  useEffect(() => {
    setImgLoaded(false);
    galleryImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    const currentImg = new Image();
    currentImg.src = galleryImages[activeImageIndex];
    if (currentImg.complete) {
      setImgLoaded(true);
    } else {
      currentImg.onload = () => setImgLoaded(true);
    }
  }, [galleryImages, activeImageIndex]);

  // Reset active image when property changes
  useEffect(() => {
    setActiveImageIndex(0);
    setZoomLevel(1);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [property.id]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
        setZoomLevel(1);
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, galleryImages.length]);

  // Download image handler
  const handleDownloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `next-property-${property.referenceNo}-${activeImageIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  // Similar properties list (strictly 4 cards for optimal layout)
  const similarProperties = useMemo(() => {
    let list = allProperties.filter(
      (p) =>
        p.id !== property.id &&
        !p.isArchived &&
        (p.type === property.type || p.district === property.district)
    );
    if (list.length < 4) {
      const others = allProperties.filter(
        (p) => p.id !== property.id && !p.isArchived && !list.some((item) => item.id === p.id)
      );
      list = [...list, ...others];
    }
    return list.slice(0, 4);
  }, [allProperties, property.id, property.type, property.district]);

  // Share link handler
  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Next Real Estate,\nI am interested in REF: ${property.referenceNo} (${property.title})\nPrice: $${new Intl.NumberFormat(
      'en-US'
    ).format(property.price)}${property.isRental ? '/month' : ''}\nLocation: ${property.location}\nPlease provide more details.`
  );

  const scrollSimilar = (direction: 'left' | 'right') => {
    if (similarScrollRef.current) {
      const amount = 290;
      similarScrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  // Top search bar internal state
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchDeal, setSearchDeal] = useState('');

  const handleTopSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        location: searchLocation,
        propertyType: searchType,
        saleOrRental: searchDeal,
        buildingAge: '',
        areaRange: '',
      });
    }
    onNavigateAllProperties();
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
    setZoomLevel(1);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    setZoomLevel(1);
  };

  return (
    <div
      className={`min-h-screen bg-[#fcfcfc] text-[#212121] pb-16 selection:bg-[#c4191a] selection:text-white ${
        isArabic ? 'font-cairo' : 'font-prompt'
      }`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* 
        1. Top Search Filter Bar (Matching Reference Screenshot 3 & 4):
        - Location, Keywords, Type, Sale or Rental, Search red button
      */}
      <section className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6 shadow-xs">
        <div className="confidence-container">
          <form
            onSubmit={handleTopSearchSubmit}
            className="flex flex-col md:flex-row items-stretch md:items-center gap-2"
          >
            {/* Location */}
            <div className="flex-1">
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder={isArabic ? 'الموقع أو الحي...' : 'Location'}
                className="w-full h-10 px-3 text-xs sm:text-sm bg-white border border-gray-300 rounded focus:border-[#c4191a] focus:ring-1 focus:ring-[#c4191a] outline-none transition"
              />
            </div>

            {/* Type */}
            <div className="w-full md:w-48">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full h-10 px-3 text-xs sm:text-sm bg-white border border-gray-300 rounded focus:border-[#c4191a] focus:ring-1 focus:ring-[#c4191a] outline-none transition"
              >
                <option value="">{isArabic ? 'النوع' : 'Type'}</option>
                <option value="Apartment">{isArabic ? 'شقة سكنية' : 'Apartment'}</option>
                <option value="Villa">{isArabic ? 'فيلا' : 'Villa'}</option>
                <option value="Commercial">{isArabic ? 'عقارات تجارية' : 'Commercial'}</option>
                <option value="Office">{isArabic ? 'مكتب' : 'Office'}</option>
                <option value="Land">{isArabic ? 'أرض' : 'Land'}</option>
              </select>
            </div>

            {/* Sale or Rental */}
            <div className="w-full md:w-44">
              <select
                value={searchDeal}
                onChange={(e) => setSearchDeal(e.target.value)}
                className="w-full h-10 px-3 text-xs sm:text-sm bg-white border border-gray-300 rounded focus:border-[#c4191a] focus:ring-1 focus:ring-[#c4191a] outline-none transition"
              >
                <option value="">{isArabic ? 'للبيع أو للإيجار' : 'Sale or Rental'}</option>
                <option value="sale">{isArabic ? 'للبيع' : 'Sale'}</option>
                <option value="rental">{isArabic ? 'للإيجار' : 'Rental'}</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="h-10 px-6 bg-[#c4191a] hover:bg-[#a51516] active:bg-[#8f1213] text-white text-xs sm:text-sm font-bold rounded transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>{isArabic ? 'بحث' : 'Search'}</span>
            </button>
          </form>
        </div>
      </section>

      {/* Main Container */}
      <div className="confidence-container px-4 sm:px-6 pt-4 sm:pt-6 space-y-6">
        {/* 
          2. Breadcrumbs Navigation (Matching Screenshot 3 & 4):
          Home | All Properties | Apartment
        */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
          <nav className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={onBack}
              className="hover:text-[#c4191a] transition cursor-pointer font-medium"
            >
              {isArabic ? 'الرئيسية' : 'Home'}
            </button>
            <span className="text-gray-400">|</span>
            <button
              type="button"
              onClick={onNavigateAllProperties}
              className="hover:text-[#c4191a] transition cursor-pointer font-medium"
            >
              {isArabic ? 'كافة العقارات' : 'All Properties'}
            </button>
            <span className="text-gray-400">|</span>
            <span className="text-gray-800 font-semibold">
              {isArabic ? property.typeAr : property.type}
            </span>
          </nav>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#c4191a] transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>{isArabic ? 'العودة' : 'Back'}</span>
          </button>
        </div>

        {/* 
          3. Hero Gallery Visual (Pixel-Matched to Screenshot 3 & 4):
          - Large widescreen photo
          - Architectural bold headline overlay
          - Carousel navigation arrows (< and >)
          - Click to open Fullscreen Lightbox with Zoom and Download
        */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/8] md:aspect-[16/7] max-h-[500px] rounded-xl overflow-hidden bg-gray-900 shadow-md group cursor-pointer">
          <img
            src={galleryImages[activeImageIndex]}
            alt={isArabic ? property.titleAr : property.title}
            loading="eager"
            decoding="async"
            onClick={() => setLightboxOpen(true)}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-300 hover:scale-102 ${
              imgLoaded ? 'opacity-100' : 'opacity-20'
            }`}
          />

          {!imgLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <span className="text-xs text-gray-400">Loading photo...</span>
            </div>
          )}

          {/* Bold Centered / Bottom Overlay Banner (Matching Reference Video) */}
          <div 
            onClick={() => setLightboxOpen(true)}
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 flex flex-col justify-end p-4 sm:p-8 pointer-events-none"
          >
            <h1 className="text-white text-base sm:text-2xl md:text-3xl font-black uppercase tracking-wider drop-shadow-lg leading-tight max-w-3xl">
              {property.isPlatinum && (
                <span className="inline-block bg-[#c4191a] text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded mr-2 align-middle">
                  PLATINUM RESIDENCE
                </span>
              )}
              {isArabic ? property.titleAr : property.title}
            </h1>
          </div>

          {/* Fullscreen Lightbox Trigger Badge */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
            className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/85 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
            title={isArabic ? 'تكبير وعرض الصور بالكامل' : 'View Fullscreen & Zoom'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isArabic ? 'عرض وتكبير' : 'Fullscreen'}</span>
          </button>

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Next photo"
          >
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>

          {/* Photo Dots Indicator */}
          <div className="absolute bottom-3 right-4 rtl:right-auto rtl:left-4 z-10 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full pointer-events-none">
            {activeImageIndex + 1} / {galleryImages.length}
          </div>
        </div>

        {/* 
          4. Price, Quick Specs, Location & Direct Contact Action Bar
          (Pixel-matched to Screenshot 4 & 5):
          - Price USD 1,200
          - Icons: 3 beds, 4 baths, 160 m²
          - Location with pin
          - Red Call button + Green WhatsApp button
        */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Side: Price, Specs, Location */}
          <div className="space-y-1.5 text-start">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-[#c4191a]">
                USD {new Intl.NumberFormat('en-US').format(property.price)}
              </span>
              {property.isRental && (
                <span className="text-xs sm:text-sm font-medium text-gray-500">
                  / {isArabic ? 'شهرياً' : 'month'}
                </span>
              )}
            </div>

            {/* Quick Specs Icons */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-700">
              {property.beds !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="font-semibold">{property.beds}</span>
                </div>
              )}
              {property.baths !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="font-semibold">{property.baths}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="font-semibold">{property.areaSqm} m²</span>
              </div>
            </div>

            {/* Location with map pin */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 pt-0.5">
              <MapPin className="w-4 h-4 text-[#c4191a] shrink-0" />
              <span>{isArabic ? property.locationAr : property.location}</span>
            </div>
          </div>

          {/* Right Side: Red Call Button & Green WhatsApp Button (Screenshot 4 & 5) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Call Button */}
            <a
              href="tel:+96176743414"
              className="flex-1 sm:flex-none h-11 px-6 rounded-lg bg-[#c4191a] hover:bg-[#a51516] active:bg-[#8f1213] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-xs select-none"
            >
              <Phone className="w-4 h-4 fill-current" />
              <span>{isArabic ? 'اتصال مباشر' : 'Call'}</span>
            </a>

            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/message/7TA5OZXYI52NJ1?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none h-11 px-6 rounded-lg bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa50] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-xs select-none"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{isArabic ? 'واتساب' : 'Whatsapp'}</span>
            </a>
          </div>
        </div>

        {/* 
          5. Specifications Card (Pixel-Matched to Screenshot 4 & 5):
          - Title row with Share and Heart icons
          - 3-column specs table: Type, Listed, Condition, Payment Type, Furnished, Parking Spaces, Reference
        */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-xs text-start">
          {/* Header Row: Title & Action Icons */}
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100 mb-4">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
              {property.title} / {property.titleAr} / REF#{property.referenceNo}
            </h2>

            <div className="flex items-center gap-2 shrink-0">
              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="w-8 h-8 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 flex items-center justify-center transition cursor-pointer"
                title={isArabic ? 'مشاركة الرابط' : 'Share property'}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

              {/* Heart Favorite Button (Connected to Google OAuth) */}
              <button
                type="button"
                onClick={(e) => onToggleFavorite(property, e)}
                className={`w-8 h-8 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                  isFavorite
                    ? 'border-red-200 bg-red-50 text-[#c4191a]'
                    : 'border-gray-200 hover:border-red-200 hover:bg-red-50/50 text-gray-600 hover:text-[#c4191a]'
                }`}
                title={isArabic ? 'حفظ في المفضلة' : 'Save to Favorites'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#c4191a] text-[#c4191a]' : ''}`} />
              </button>
            </div>
          </div>

          {/* 3-Column Specifications Table */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-xs sm:text-sm">
            {/* Type */}
            <div>
              <span className="text-gray-500 block mb-0.5">{isArabic ? 'النوع' : 'Type'}</span>
              <span className="font-semibold text-gray-900">
                {isArabic ? property.typeAr : property.type}
              </span>
            </div>

            {/* Listed Date */}
            <div>
              <span className="text-gray-500 block mb-0.5">{isArabic ? 'تاريخ النشر' : 'Listed'}</span>
              <span className="font-semibold text-gray-900">
                {property.createdAt
                  ? new Date(property.createdAt).toLocaleDateString('en-GB')
                  : '24/09/2026'}
              </span>
            </div>

            {/* Condition */}
            <div>
              <span className="text-gray-500 block mb-0.5">{isArabic ? 'الحالة' : 'Condition'}</span>
              <span className="font-semibold text-gray-900 capitalize">
                {property.condition === 'under_construction'
                  ? isArabic
                    ? 'قيد الإنشاء'
                    : 'Under Construction'
                  : isArabic
                  ? 'جاهز للسكن'
                  : 'Ready'}
              </span>
            </div>

            {/* Payment Type */}
            <div>
              <span className="text-gray-500 block mb-0.5">{isArabic ? 'طريقة الدفع' : 'Payment Type'}</span>
              <span className="font-semibold text-gray-900 uppercase">
                {property.paymentType || 'Cash'}
              </span>
            </div>

            {/* Furnished */}
            <div>
              <span className="text-gray-500 block mb-0.5">{isArabic ? 'الفرش' : 'Furnished'}</span>
              <span className="font-semibold text-gray-900">
                {isArabic ? 'مفروش بالكامل' : 'Fully Furnished'}
              </span>
            </div>

            {/* Parking Spaces */}
            <div>
              <span className="text-gray-500 block mb-0.5">{isArabic ? 'مواقف السيارات' : 'Parking Spaces'}</span>
              <span className="font-semibold text-gray-900">1</span>
            </div>

            {/* Reference */}
            <div>
              <span className="text-gray-500 block mb-0.5">{isArabic ? 'رمز المرجع' : 'Reference'}</span>
              <span className="font-mono font-bold text-gray-900">{property.referenceNo}</span>
            </div>
          </div>
        </div>

        {/* 
          6. Amenities Card (Matching Screenshot 1 & 5):
          - Title: Amenities
          - Red bordered chips: Covered Parking, Elevator, Gym, etc.
        */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-xs text-start">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3">
            {isArabic ? 'المرافق والتجهيزات' : 'Amenities'}
          </h3>

          <div className="flex flex-wrap gap-2">
            {(property.amenities && property.amenities.length > 0
              ? property.amenities
              : ['Covered Parking', 'Elevator', 'Modern Finish', 'Balcony', 'Concierge']
            ).map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center px-3.5 py-1.5 rounded-md border border-[#c4191a] text-[#c4191a] bg-white text-xs font-semibold"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* 
          7. Description Card (Pixel-Matched to Screenshot 1, 2, 3, 5):
          - Full English and Arabic detailed writeup with bullets
        */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-xs text-start space-y-6">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
            {isArabic ? 'الوصف والتفاصيل' : 'Description'}
          </h3>

          {/* English Section */}
          <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
            <p>
              Experience refined urban living in this exceptional {property.areaSqm} sqm residence
              ideally located in the heart of {property.location}. Situated in a newly constructed
              building offering the exclusivity of one apartment per floor, this beautifully decorated
              home showcases contemporary elegance with high-end finishes and sophisticated interiors
              throughout. The apartment features {property.beds || 3} spacious bedrooms, including 1
              luxurious master suite, {property.baths || 3} modern bathrooms, and expansive living and
              dining areas designed for both comfort and stylish entertaining. Complete with 1 private
              parking space, this remarkable property seamlessly combines privacy, luxury, and a prime
              location, making it an outstanding opportunity for discerning homeowners and investors
              alike.
            </p>

            <div className="pt-2">
              <p className="font-semibold text-gray-900 mb-1.5">This apartment consists of:</p>
              <ul className="space-y-1 text-gray-600 pl-4 list-disc">
                <li>{property.beds || 3} Bedrooms including 1 master bedroom</li>
                <li>{property.baths || 3} Bathrooms</li>
                <li>1 Living area</li>
                <li>1 Dining area</li>
                <li>1 Kitchen</li>
                <li>Elevator</li>
                <li>1 Parking spot</li>
                <li>New building</li>
                <li>One apartment per floor</li>
                <li>Modern apartment</li>
              </ul>
            </div>

            <div className="pt-2 space-y-1">
              <p className="font-bold text-gray-900">
                Price: ${new Intl.NumberFormat('en-US').format(property.price)}
                {property.isRental ? '/month + 1 month of commission' : ' (Cash)'}
              </p>
              <p className="font-bold text-[#c4191a]">
                FOR MORE INFORMATION DON'T HESITATE TO CONTACT US ON: +961 76 743 414
              </p>
              <p className="font-mono text-gray-500">REF: {property.referenceNo}</p>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Arabic Section */}
          <div
            className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed font-cairo text-start"
            dir="rtl"
          >
            <p>
              فرصة استثنائية لاستئجار أو تملك شقة فاخرة بمساحة {property.areaSqm} متراً مربعاً في قلب{' '}
              {property.locationAr || property.location}. ضمن مبنى حديث يتميز بخصوصية مطلقة مع شقة
              واحدة فقط في كل طابق، تجمع هذه الشقة بين الأناقة العصرية والتشطيبات الراقية، حيث تتميز
              بديكورات فاخرة وتصميم داخلي متقن يضفي أجواءً من الرقي والراحة. تضم {property.beds || 3}{' '}
              غرف نوم، منها جناح ماستر واسع، و{property.baths || 3} حمامات بتجهيزات عصرية، بالإضافة
              إلى صالونات رحبة ومساحات معيشة واستقبال أنيقة تلبي أعلى معايير الحياة العصرية. كما تتوفر
              موقف سيارة خاص، لتشكل هذه الشقة خياراً مثالياً للباحثين عن الفخامة، الخصوصية، والموقع
              المميز.
            </p>

            <div className="pt-2">
              <p className="font-semibold text-gray-900 mb-1.5">تتألف هذه الشقة من:</p>
              <ul className="space-y-1 text-gray-600 pr-4 list-disc">
                <li>غرف نوم ضمنهم غرفة نوم ماستر: {property.beds || 3}</li>
                <li>حمامات: {property.baths || 3}</li>
                <li>غرفة معيشة 1</li>
                <li>مطبخ 1</li>
                <li>غرفة عشاء 1</li>
                <li>موقف سيارة 1</li>
                <li>مصعد حديث</li>
                <li>شقة واسعة</li>
                <li>حي هادئ وراقي</li>
                <li>مبنى حديث</li>
                <li>كل طابق شقة واحدة</li>
              </ul>
            </div>

            <div className="pt-2 space-y-1">
              <p className="font-bold text-gray-900">
                السعر: {new Intl.NumberFormat('en-US').format(property.price)} دولار
                {property.isRental ? ' بالشهر + شهر عمولة' : ' (كاش)'}
              </p>
              <p className="font-bold text-[#c4191a]">
                لمزيد من المعلومات لا تتردد في الاتصال بنا على: 76743414
              </p>
              <p className="font-mono text-gray-500">رمز العقار: {property.referenceNo}</p>
            </div>
          </div>
        </div>

        {/* 
          8. Similar Properties Section (Exactly 4 Properties Matching User Spec):
          - Title: Similar Properties
          - "See All" button on top-right
          - 4 property cards in desktop grid, swipeable on mobile
        */}
        {similarProperties.length > 0 && (
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                {isArabic ? 'عقارات مشابهة' : 'Similar Properties'}
              </h3>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onNavigateAllProperties}
                  className="text-xs sm:text-sm font-bold text-[#c4191a] hover:underline transition cursor-pointer"
                >
                  {isArabic ? 'عرض الكل' : 'See All'}
                </button>
              </div>
            </div>

            {/* Desktop: 4 Cards Clean Grid */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarProperties.map((p) => (
                <div key={p.id} className="flex flex-col">
                  <PropertyCard
                    property={p}
                    onContactClick={onSelectProperty}
                    lang={lang}
                    isFavorite={favorites.includes(p.id)}
                    onToggleFavorite={onToggleFavorite}
                  />
                </div>
              ))}
            </div>

            {/* Mobile: Horizontal Swipe Carousel with peek effect */}
            <div
              ref={similarScrollRef}
              className="sm:hidden flex items-stretch gap-3 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {similarProperties.map((p) => (
                <div
                  key={p.id}
                  className="w-[74vw] max-w-[255px] shrink-0 snap-start flex flex-col"
                >
                  <PropertyCard
                    property={p}
                    onContactClick={onSelectProperty}
                    lang={lang}
                    isFavorite={favorites.includes(p.id)}
                    onToggleFavorite={onToggleFavorite}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 
        9. Mobile Floating Sticky Bottom Action Bar:
        - Appears on mobile screens
        - Call & WhatsApp buttons and Favorite Heart
      */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <span className="text-sm font-bold text-[#c4191a] block leading-none">
            USD {new Intl.NumberFormat('en-US').format(property.price)}
          </span>
          <span className="text-[10px] text-gray-500 font-mono">REF: {property.referenceNo}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Favorite Button */}
          <button
            type="button"
            onClick={(e) => onToggleFavorite(property, e)}
            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition ${
              isFavorite
                ? 'border-red-200 bg-red-50 text-[#c4191a]'
                : 'border-gray-200 bg-gray-50 text-gray-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#c4191a] text-[#c4191a]' : ''}`} />
          </button>

          {/* Call Button */}
          <a
            href="tel:+96176743414"
            className="h-9 px-3 rounded-lg bg-[#c4191a] text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5 fill-current" />
            <span>{isArabic ? 'اتصال' : 'Call'}</span>
          </a>

          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/message/7TA5OZXYI52NJ1?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3 rounded-lg bg-[#25D366] text-white text-xs font-bold flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>{isArabic ? 'واتساب' : 'WhatsApp'}</span>
          </a>
        </div>
      </div>

      {/* 
        10. Fullscreen Image Lightbox & Gallery (Zoom & Download):
        - Full-screen high-performance lightbox
        - Swipe left / right
        - Zoom In (+), Zoom Out (-), Reset Zoom (1x)
        - Download / Save image to device
        - Close button & keyboard shortcuts
      */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
        >
          {/* Top Bar: Title, Counter, Zoom Controls, Download, Close */}
          <div className="flex items-center justify-between p-4 sm:px-6 bg-gradient-to-b from-black/80 to-transparent text-white z-10">
            <div>
              <p className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {isArabic ? property.titleAr : property.title}
              </p>
              <span className="text-[11px] text-gray-400 font-mono">
                {activeImageIndex + 1} / {galleryImages.length} • REF: {property.referenceNo}
              </span>
            </div>

            {/* Action Tools */}
            <div className="flex items-center gap-2">
              {/* Zoom Out */}
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(0.75, prev - 0.25))}
                disabled={zoomLevel <= 0.75}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white flex items-center justify-center transition cursor-pointer"
                title={isArabic ? 'تصغير' : 'Zoom Out'}
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              {/* Zoom Reset */}
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="px-2 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-white flex items-center justify-center transition cursor-pointer"
                title={isArabic ? 'إعادة ضبط التكبير' : 'Reset Zoom'}
              >
                {Math.round(zoomLevel * 100)}%
              </button>

              {/* Zoom In */}
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(3, prev + 0.25))}
                disabled={zoomLevel >= 3}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white flex items-center justify-center transition cursor-pointer"
                title={isArabic ? 'تكبير' : 'Zoom In'}
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Download Image Button */}
              <button
                type="button"
                onClick={() => handleDownloadImage(galleryImages[activeImageIndex])}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c4191a] text-white flex items-center justify-center transition cursor-pointer"
                title={isArabic ? 'تحميل الصورة' : 'Download Photo'}
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Close Lightbox */}
              <button
                type="button"
                onClick={() => {
                  setLightboxOpen(false);
                  setZoomLevel(1);
                }}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-600 text-white flex items-center justify-center transition cursor-pointer ml-1"
                title={isArabic ? 'إغلاق' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Image View Area */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden p-4">
            {/* Left Nav Arrow */}
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
            </button>

            {/* The Image with Zoom Transform */}
            <div
              className="relative max-w-full max-h-full transition-transform duration-200 ease-out cursor-zoom-in"
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={() => setZoomLevel((prev) => (prev > 1 ? 1 : 1.75))}
            >
              <img
                src={galleryImages[activeImageIndex]}
                alt={property.title}
                className="max-w-[92vw] max-h-[75vh] object-contain rounded-lg shadow-2xl mx-auto"
                draggable={false}
              />
            </div>

            {/* Right Nav Arrow */}
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 rtl:rotate-180" />
            </button>
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="p-3 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-2 overflow-x-auto z-10">
            {galleryImages.map((imgSrc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveImageIndex(idx);
                  setZoomLevel(1);
                }}
                className={`w-14 h-10 rounded-md overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                  activeImageIndex === idx
                    ? 'border-[#c4191a] scale-105'
                    : 'border-white/30 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={imgSrc} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
