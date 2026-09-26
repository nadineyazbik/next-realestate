import React from 'react';
import { Language } from '../types';

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  className?: string;
  lang?: Language;
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 40,
  showText = true,
  textColor = '#ffffff',
  className = '',
  lang = 'en',
  showSubtitle = false,
}) => {
  const isArabic = lang === 'ar';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Circular Medallion Logo (Cedar trees, towers, arched typography) */}
      <div
        className="relative shrink-0 rounded-full overflow-hidden shadow-xs transition-transform duration-200 hover:scale-105"
        style={{ width: size, height: size }}
      >
        <img
          src="/assets/next_real_estate_logo.svg"
          alt="Next Real Estate"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Structured, Clean Brand Typography (Matching Reference Site in Image 15) */}
      {showText && (
        <div className="flex flex-col justify-center leading-none text-start">
          <span
            className="text-base sm:text-lg font-bold tracking-tight whitespace-nowrap"
            style={{
              color: textColor,
              fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif",
            }}
          >
            Next <span className="text-[#c4191a] font-extrabold">Real Estate</span>
          </span>

          {showSubtitle && (
            <span
              className="text-[10px] font-medium tracking-wider uppercase opacity-75 mt-0.5 whitespace-nowrap"
              style={{
                color: textColor,
                fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif",
              }}
            >
              {isArabic ? 'مرحلتك القادمة هنا' : 'Your next chapter is here'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
