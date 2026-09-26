import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { Smartphone, X, Download, Share, PlusSquare, Check } from 'lucide-react';
import { Language } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface FooterProps {
  lang?: Language;
  onNavigate?: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ lang = 'en', onNavigate }) => {
  const isArabic = lang === 'ar';
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  const socialLinks = [
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@next_realestate_lb?_r=1&_t=ZS-9A2HMLcGkjt',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/share/1GhyQUTpNQ/',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/next_realestate_lb?stkn=d2Q3cWFkajg3YXkx',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: 'WhatsApp',
      url: 'https://wa.me/message/7TA5OZXYI52NJ1',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
    },
  ];

  const handleLinkClick = (e: React.MouseEvent, route: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(route);
    }
  };

  const handleInstallApp = async () => {
    if (isInstalled) {
      setInstalledNotice(true);
      setTimeout(() => setInstalledNotice(false), 2500);
      return;
    }
    if (isIOS) {
      setShowInstallGuide(true);
      return;
    }
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowInstallGuide(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  return (
    <>
      <footer id="main-footer" className="bg-[#f9fafb] border-t border-gray-200" dir={isArabic ? 'rtl' : 'ltr'}>
        {/* 
          Main Compact Footer (Pixel-for-pixel match to reference screenshot):
          - Left: Next Real Estate Logo & Brand
          - Middle: Essential Links (Properties, Add a Property, Contact Us)
          - Right: Social media icons neatly placed beside the app download badges
        */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            {/* 1. Left Side: Brand Logo & Name */}
            <div className="shrink-0">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('home');
                }}
                className="inline-block transition-transform hover:scale-102 cursor-pointer"
              >
                <BrandLogo size={40} textColor="#1f2124" lang={lang} showSubtitle={false} />
              </a>
            </div>

            {/* 2. Middle: Essential Quick Links (Two clean columns matching reference) */}
            <div className="flex items-center gap-8 sm:gap-14 text-sm font-medium text-gray-700">
              {/* Column 1 */}
              <div className="flex flex-col gap-2">
                <a
                  href="#properties"
                  onClick={(e) => handleLinkClick(e, 'properties')}
                  className="hover:text-[#c4191a] transition-colors whitespace-nowrap cursor-pointer"
                  style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
                >
                  {isArabic ? 'العقارات' : 'Properties'}
                </a>
                <a
                  href="#contact"
                  onClick={(e) => handleLinkClick(e, 'contact')}
                  className="hover:text-[#c4191a] transition-colors whitespace-nowrap cursor-pointer"
                  style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
                >
                  {isArabic ? 'اتصل بنا' : 'Contact Us'}
                </a>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-2 self-start">
                <a
                  href="#add-property"
                  onClick={(e) => handleLinkClick(e, 'add-property')}
                  className="hover:text-[#c4191a] transition-colors whitespace-nowrap cursor-pointer"
                  style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
                >
                  {isArabic ? 'أضف عقارك' : 'Add a Property'}
                </a>
              </div>
            </div>

            {/* 3. Right Side: Social Media Icons + App Download Badges */}
            <div className="flex flex-col items-center lg:items-end gap-2 shrink-0">
              {/* "Download our app" label matching reference */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                <Smartphone className="w-3.5 h-3.5 text-gray-700" />
                <span style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}>
                  {isArabic ? 'حمّل تطبيقنا' : 'Download our app'}
                </span>
              </div>

              {/* Row with Social Media Icons neatly beside App Download Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5">
                {/* Social Media Icons */}
                <div className="flex items-center gap-1.5">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-white hover:bg-[#c4191a] border border-gray-200 hover:border-[#c4191a] text-gray-700 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs hover:scale-108 cursor-pointer"
                      title={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>

                {/* Vertical Divider Line */}
                <div className="hidden sm:block h-6 w-[1px] bg-gray-300 mx-0.5" />

                {/* Clean "Install Web App" PWA Button (No fake app store badges) */}
                <div>
                  <button
                    type="button"
                    onClick={handleInstallApp}
                    className="h-9 px-3.5 rounded-lg bg-black hover:bg-neutral-800 active:scale-98 text-white flex items-center gap-2 transition-all shadow-xs cursor-pointer select-none border border-neutral-800 group"
                    title={isArabic ? 'تثبيت التطبيق على جهازك' : 'Install Web App'}
                  >
                    <Download className="w-4 h-4 text-[#c4191a] group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-white tracking-tight">
                      {isArabic ? 'تثبيت تطبيق الويب (PWA)' : 'Install Web App'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 
          Bottom Slim Red Strip (Matching Reference Image):
          - Red background #c4191a
          - NO COPYRIGHT NOTICE WHATSOEVER (strictly forbidden per prompt instructions)
          - Left: Privacy Policy
          - Right: Powered by Cloud Systems
        */}
        <div className="bg-[#c4191a] text-white py-2 px-4 sm:px-6 text-xs font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left: Privacy Policy */}
            <div>
              <a href="#privacy" className="hover:underline transition text-white/95 hover:text-white">
                {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </a>
            </div>

            {/* Right: Powered by Cloud Systems */}
            <div className="flex items-center gap-1.5 text-white/95">
              <span>Powered by</span>
              <span className="font-bold tracking-wide flex items-center gap-1">
                <svg className="w-3.5 h-3.5 fill-current inline-block" viewBox="0 0 24 24">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
                </svg>
                <span>CLOUD SYSTEMS</span>
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Installed Toast Notification */}
      {installedNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs border border-white/10 animate-in fade-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{isArabic ? 'تطبيق Next Real Estate مثبت على جهازك بالفعل' : 'Next Real Estate is already installed on your device'}</span>
        </div>
      )}

      {/* PWA App Install Guide Modal */}
      {showInstallGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          dir={isArabic ? 'rtl' : 'ltr'}
          onClick={() => setShowInstallGuide(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowInstallGuide(false)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-red-50 text-[#c4191a] flex items-center justify-center mx-auto mb-3">
              <Download className="w-6 h-6" />
            </div>

            <h3
              className="text-base font-bold text-gray-900 mb-1"
              style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
            >
              {isArabic ? 'تثبيت تطبيق Next Real Estate' : 'Install Next Real Estate App'}
            </h3>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              {isArabic
                ? 'يمكنك تثبيت تطبيق Next Real Estate مباشرة على هاتفك (iOS / Android) دون الحاجة للبحث في المتاجر.'
                : 'Install Next Real Estate directly to your home screen on iOS or Android for the quickest experience.'}
            </p>

            <div className="bg-gray-50 rounded-xl p-3.5 text-xs text-gray-700 text-start space-y-2.5 mb-4 border border-gray-200">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#c4191a] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="block text-gray-900 font-semibold">
                    {isArabic ? 'اضغط على زر المشاركة (Share)' : 'Tap the Share button in Safari'}
                  </strong>
                  <span className="text-[11px] text-gray-500">
                    {isArabic
                      ? 'في أسفل شاشة الآيفون داخل متصفح Safari'
                      : 'Located at the bottom toolbar in Safari (or browser menu)'}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#c4191a] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="block text-gray-900 font-semibold">
                    {isArabic ? 'اختر "إضافة إلى الصفحة الرئيسية"' : "Select 'Add to Home Screen'"}
                  </strong>
                  <span className="text-[11px] text-gray-500">
                    {isArabic
                      ? 'مرر للأسفل واضغط على "Add to Home Screen" لتثبيت التطبيق فوراً'
                      : 'Scroll down and tap Add to Home Screen for fast one-tap access'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#c4191a] hover:bg-[#a51516] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              {isArabic ? 'حسناً، فهمت' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
