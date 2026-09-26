import React from 'react';
import { Building, Home, Trees, Castle, Building2, Warehouse } from 'lucide-react';
import { Language } from '../types';

interface CategoryItem {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: React.ReactNode;
}

interface PopularCategoriesProps {
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  lang: Language;
}

export const PopularCategories: React.FC<PopularCategoriesProps> = ({
  activeCategory,
  onSelectCategory,
  lang,
}) => {
  const isArabic = lang === 'ar';

  const categories: CategoryItem[] = [
    {
      id: 'Apartment',
      nameEn: 'Apartment',
      nameAr: 'شقة',
      icon: <Building className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'Commercial',
      nameEn: 'Commercial',
      nameAr: 'تجاري',
      icon: <Building2 className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'Villa',
      nameEn: 'Villa',
      nameAr: 'فيلا',
      icon: <Castle className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'Land',
      nameEn: 'Land',
      nameAr: 'أرض',
      icon: <Trees className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'House',
      nameEn: 'House',
      nameAr: 'منزل',
      icon: <Home className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'Chalet',
      nameEn: 'Chalet & cabin',
      nameAr: 'شاليه وكابين',
      icon: <Warehouse className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'Buildings and multiple units',
      nameEn: 'Buildings and multiple units',
      nameAr: 'أبنية وعقارات متعددة',
      icon: <Building2 className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <section
      id="popular-categories"
      className="py-6 sm:py-8 bg-white border-b border-gray-100"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="confidence-container px-4 sm:px-6">
        {/* Clean, Minimal Title - No extra subtitles or clutter (Matching Screenshot 12) */}
        <h2
          className="text-lg sm:text-xl font-bold text-[#1f2124] tracking-tight mb-3.5"
          style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
        >
          {isArabic ? 'الفئات الأكثر طلباً' : 'Popular Categories'}
        </h2>

        {/* 
          Compact, Small Category Buttons matching Confidence Real Estate (Screenshot 12):
          - Thin red border (border-[#c4191a])
          - Red text & icon
          - Active state: solid red background (#c4191a) with white text & icon
          - No giant boxes, no long subtitles, clean flex wrap
        */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(isActive ? 'all' : cat.id)}
                className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-[#c4191a] border-[#c4191a] text-white shadow-sm'
                    : 'bg-white border-[#c4191a] text-[#c4191a] hover:bg-red-50/70'
                }`}
                style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
              >
                {cat.icon}
                <span className="whitespace-nowrap">{isArabic ? cat.nameAr : cat.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
