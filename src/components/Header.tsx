import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import {
  Sparkles,
  X,
  Phone,
  QrCode,
  Share2,
  Menu,
  MoreVertical,
  Lock,
  Heart,
  Globe,
  PlusCircle,
} from 'lucide-react';
import { Language } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { QRCodeModal } from './QRCodeModal';
import { apiService } from '../services/apiService';

interface HeaderProps {
  onNavigate?: (route: string) => void;
  activeRoute?: string;
  lang: Language;
  onToggleLang: () => void;
  onOpenAIAssistant: () => void;
  onOpenAdminPortal?: () => void;
  onSelectPropertyId?: (id: string) => void;
  isLightHeader?: boolean;
  onOpenFavorites?: () => void;
  favoritesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate = () => {},
  activeRoute = 'home',
  lang,
  onToggleLang,
  onOpenAIAssistant,
  onOpenAdminPortal,
  isLightHeader = false,
  onOpenFavorites,
  favoritesCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const isArabic = lang === 'ar';

  // تحقق من حالة الأدمن فور فتح الصفحة
 // تحقق آمن من حالة الأدمن بدون استدعاء دالة خارجية قد تسبب خطأ
  useEffect(() => {
    try {
      const adminStatus = localStorage.getItem('isAdminLoggedIn') === 'true' || 
                          localStorage.getItem('auth_token') !== null ||
                          (typeof apiService.isAdminLoggedIn === 'function' && apiService.isAdminLoggedIn());
      setIsAdmin(!!adminStatus);
    } catch (e) {
      setIsAdmin(false);
    }
  }, []);

  // الروابط الأساسية للجميع
  const baseNavLinks = isArabic
    ? [
        { label: 'العقارات', route: 'properties', href: '#properties' },
        { label: 'اتصل بنا', route: 'contact', href: '#contact' },
      ]
    : [
        { label: 'Properties', route: 'properties', href: '#properties' },
        { label: 'Contact Us', route: 'contact', href: '#contact' },
      ];

  // إذا كنتِ مسجلة دخول كأدمن، نضيف زر "أضف عقارك" تلقائياً للقائمة، وإلا يبقى مخفياً
  const navLinks = [
    baseNavLinks[0],
    ...(isAdmin
      ? isArabic
        ? [{ label: 'أضف عقارك', route: 'add-property', href: '#add-property' }]
        : [{ label: 'Add a Property', route: 'add-property', href: '#add-property' }]
      : []),
    baseNavLinks[1],
  ];

  return (
    <>
      <header
        id="main-header"
        className={`${
          isLightHeader
            ? 'relative bg-white border-b border-gray-200'
            : 'absolute top-0 left-0 w-full'
        } z-30 py-3.5 sm:py-4 transition-all duration-200 select-none`}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div className="confidence-container flex items-center justify-between px-4 sm:px-6">
          {/* Left Side: Brand Logo */}
          <div className="flex items-center gap-8 lg:gap-10 shrink-0">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('home');
              }}
              className="flex items-center group cursor-pointer"
            >
              <BrandLogo
                size={38}
                textColor={isLightHeader ? '#1f2124' : '#ffffff'}
                lang={lang}
                showSubtitle={false}
              />
            </a>

            {/* Core Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => {
                const isActive = activeRoute === link.route;
                return (
                  <a
                    key={link.route}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(link.route);
                    }}
                    className={`text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-[#c4191a] font-bold'
                        : isLightHeader
                        ? 'text-gray-700 hover:text-[#c4191a]'
                        : 'text-white/90 hover:text-white'
                    }`}
                    style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenFavorites && (
              <button
                type="button"
                onClick={onOpenFavorites}
                className={`hidden sm:flex relative p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isLightHeader
                    ? 'border-gray-300 bg-gray-50 text-gray-800 hover:bg-gray-100 hover:text-[#c4191a]'
                    : 'border-white/30 bg-black/35 text-white hover:bg-white/10 hover:text-[#c4191a]'
                }`}
                title={isArabic ? 'العقارات المفضلة' : 'Saved Properties'}
              >
                <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'fill-[#c4191a] text-[#c4191a]' : ''}`} />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 rtl:-right-auto rtl:-left-1.5 bg-[#c4191a] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {favoritesCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onToggleLang}
              className={`hidden sm:block text-sm font-semibold hover:underline transition cursor-pointer px-1 py-1 ${
                isLightHeader ? 'text-gray-800 hover:text-black' : 'text-white/90 hover:text-white'
              }`}
              title="Switch Language"
            >
              {isArabic ? 'English' : 'العربية'}
            </button>

            <a
              href="tel:+96176743414"
              className="hidden sm:inline-flex items-center justify-center bg-[#c4191a] hover:bg-[#a51516] active:bg-[#8f1213] text-white h-8 px-4 rounded text-xs font-semibold transition shadow-xs select-none"
              style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
            >
              <span>{isArabic ? 'اتصل بنا' : 'Call Us'}</span>
            </a>

            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all focus:outline-none cursor-pointer ${
                  isLightHeader
                    ? 'border-gray-300 bg-gray-50 text-gray-800 hover:bg-gray-100'
                    : 'border-white/30 bg-black/35 text-white hover:bg-white/10'
                }`}
                aria-label="Toggle Options Menu"
                title={isArabic ? 'القائمة والخيارات' : 'Options Menu'}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <>
                    <Menu className="w-5 h-5 sm:hidden" />
                    <MoreVertical className="w-4.5 h-4.5 hidden sm:block" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Options Drawer */}
        {mobileMenuOpen && (
          <div
            className={`absolute top-full left-0 right-0 ${
              isLightHeader
                ? 'bg-white/85 border-b border-gray-200/80 text-gray-900 shadow-xl'
                : 'bg-white/15 border-b border-white/20 text-white shadow-2xl'
            } px-5 py-4 transition-all animate-in slide-in-from-top duration-150 text-start`}
            style={{
              background: isLightHeader ? 'rgba(255, 255, 255, 0.88)' : 'rgba(20, 20, 20, 0.32)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            <div className="max-w-xl mx-auto flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <a
                  key={link.route}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(link.route);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-sm font-semibold py-1.5 transition-colors block ${
                    isLightHeader ? 'text-gray-800 hover:text-[#c4191a]' : 'text-white hover:text-[#c4191a]'
                  }`}
                  style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
                >
                  {link.label}
                </a>
              ))}

              <button
                onClick={() => {
                  onOpenAIAssistant();
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 text-sm font-semibold py-1.5 transition-colors text-start cursor-pointer border-t ${
                  isLightHeader ? 'border-gray-200 text-gray-800' : 'border-white/10 text-white'
                } pt-2 hover:text-[#c4191a]`}
                style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
              >
                <Sparkles className="w-4 h-4 text-[#c4191a]" />
                <span>{isArabic ? 'المستشار العقاري الذكي' : 'AI Property Advisor'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleLang();
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between text-sm font-semibold py-1.5 transition-colors text-start cursor-pointer ${
                  isLightHeader ? 'text-gray-800 hover:text-[#c4191a]' : 'text-white hover:text-[#c4191a]'
                }`}
                style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#c4191a]" />
                  <span>{isArabic ? 'اللغة / Language' : 'Language / اللغة'}</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/10 border border-white/20">
                  {isArabic ? 'English' : 'العربية'}
                </span>
              </button>

              {onOpenFavorites && (
                <button
                  onClick={() => {
                    onOpenFavorites();
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between text-sm font-semibold py-1.5 transition-colors text-start cursor-pointer ${
                    isLightHeader ? 'text-gray-800 hover:text-[#c4191a]' : 'text-white hover:text-[#c4191a]'
                  }`}
                  style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#c4191a] fill-[#c4191a]" />
                    <span>{isArabic ? 'العقارات المفضلة' : 'Saved Properties'}</span>
                  </div>
                  {favoritesCount > 0 && (
                    <span className="bg-[#c4191a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {favoritesCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => {
                  setQrModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl border text-start my-1 shadow-xs transition-all cursor-pointer group ${
                  isLightHeader
                    ? 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800'
                    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#c4191a] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <QrCode className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className="text-xs font-bold group-hover:text-[#c4191a] transition-colors"
                    style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
                  >
                    {isArabic ? 'رمز الاستجابة السريعة (QR Code)' : 'Website QR Code'}
                  </span>
                </div>
                <Share2 className="w-3.5 h-3.5 opacity-70" />
              </button>

              <div className="py-0.5">
                <PWAInstallButton lang={lang} variant="drawer" />
              </div>

              {/* Staff Access / Admin Portal Button */}
              <div className={`pt-2.5 mt-1 border-t ${
                isLightHeader ? 'border-gray-200' : 'border-white/15'
              } flex items-center justify-between gap-2`}>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAdminPortal) onOpenAdminPortal();
                    else onNavigate('signin');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-[11px] font-medium transition-all py-1 px-2 rounded-md flex items-center gap-1.5 cursor-pointer opacity-50 hover:opacity-100 ${
                    isLightHeader ? 'text-gray-500 hover:text-black hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={isArabic ? 'مدخل لوحة التحكم الإدارية' : 'Admin Portal Login'}
                >
                  <Lock className="w-3 h-3" />
                  <span>{isArabic ? 'إدارة النظام' : 'Staff Access'}</span>
                </button>

                <a
                  href="tel:+96176743414"
                  className="bg-[#c4191a] hover:bg-[#a51516] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-xs inline-flex items-center gap-1.5"
                  style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
                >
                  <Phone className="w-3.5 h-3.5 text-white fill-current" />
                  <span>{isArabic ? 'اتصل بنا' : 'Call Us'}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        lang={lang}
      />
    </>
  );
};