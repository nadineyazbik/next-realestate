import React, { useState } from 'react';
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
} from 'lucide-react';
import { Language } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { QRCodeModal } from './QRCodeModal';

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
  const isArabic = lang === 'ar';

  const navLinks = isArabic
    ? [
        { label: 'العقارات', route: 'properties', href: '#properties' },
        { label: 'أضف عقارك', route: 'add-property', href: '#add-property' },
        { label: 'اتصل بنا', route: 'contact', href: '#contact' },
      ]
    : [
        { label: 'Properties', route: 'properties', href: '#properties' },
        { label: 'Add a Property', route: 'add-property', href: '#add-property' },
        { label: 'Contact Us', route: 'contact', href: '#contact' },
      ];

  return (
    <>
      {/* 
        Clean Minimalist Desktop Navbar (Pixel-for-pixel match to Reference Images):
        - NOT fixed or sticky: scrolls naturally with page content
        - When on Home: Transparent over Hero Image
        - When on All Properties: Clean white background matching mobile/desktop reference screenshots
      */}
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
          {/* 1. Left Side: Brand Logo & Wordmark (Image 6 & Mobile Screenshot) */}
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

            {/* 2. Middle / Core Navigation Links (Properties, Add a Property, Contact Us) */}
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

          {/* 3. Right Side Actions: [Favorites] [العربية] [Call Us] [Top-Right Three-Dots / Hamburger Menu] */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist / Favorites Button (Hidden on Mobile, Cleanly accessible inside Burger Menu) */}
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

            {/* Language Switcher (Hidden on Mobile, Cleanly accessible inside Burger Menu) */}
            <button
              onClick={onToggleLang}
              className={`hidden sm:block text-sm font-semibold hover:underline transition cursor-pointer px-1 py-1 ${
                isLightHeader ? 'text-gray-800 hover:text-black' : 'text-white/90 hover:text-white'
              }`}
              title="Switch Language"
            >
              {isArabic ? 'English' : 'العربية'}
            </button>

            {/* Red Button: Call Us (Direct Phone Call +96176743414 - Desktop only) */}
            <a
              href="tel:+96176743414"
              className="hidden sm:inline-flex items-center justify-center bg-[#c4191a] hover:bg-[#a51516] active:bg-[#8f1213] text-white h-8 px-4 rounded text-xs font-semibold transition shadow-xs select-none"
              style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
            >
              <span>{isArabic ? 'اتصل بنا' : 'Call Us'}</span>
            </a>

            {/* Top-Right Menu Button (Hamburger on Mobile, Three-Dots on Desktop) */}
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

        {/* Clean Options Drawer (Accessible via Top-Right Three-Dots / Hamburger Menu) */}
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
              {/* Standard Navigation Links */}
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

              {/* AI Property Advisor Link */}
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

              {/* Language Switcher inside Burger Menu */}
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

              {/* Wishlist / Saved Properties */}
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

              {/* QR Code Option */}
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

              {/* Install PWA Button */}
              <div className="py-0.5">
                <PWAInstallButton lang={lang} variant="drawer" />
              </div>

              {/* Social Media & WhatsApp Direct Row */}
              <div className="flex items-center justify-center gap-3 py-2 border-t border-white/10">
                <a
                  href="https://www.tiktok.com/@next_realestate_lb?_r=1&_t=ZS-9A2HMLcGkjt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#c4191a] text-white flex items-center justify-center transition-all shadow-xs"
                  title="TikTok"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/share/1GhyQUTpNQ/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#c4191a] text-white flex items-center justify-center transition-all shadow-xs"
                  title="Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/next_realestate_lb?stkn=d2Q3cWFkajg3YXkx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#c4191a] text-white flex items-center justify-center transition-all shadow-xs"
                  title="Instagram"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://wa.me/message/7TA5OZXYI52NJ1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center transition-all shadow-xs hover:scale-105"
                  title="WhatsApp"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </a>
              </div>

              {/* Action Buttons on Mobile: Call Us & Private Discreet Admin Trigger */}
              <div className={`pt-2.5 mt-1 border-t ${
                isLightHeader ? 'border-gray-200' : 'border-white/15'
              } flex items-center justify-between gap-2`}>
                {/* 
                  CRITICAL: Admin access is completely hidden from regular users 
                  and only accessible via this private discreet trigger inside the three-dots/hamburger menu!
                */}
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

                {/* Call Us Button */}
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

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        lang={lang}
      />
    </>
  );
};
