import React, { useState } from 'react';
import { Smartphone, X, Download, Check, Lock } from 'lucide-react';
import { Language } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface FooterProps {
  lang?: Language;
  onNavigate?: (route: string) => void;
  onOpenAdminPortal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ lang = 'en', onNavigate, onOpenAdminPortal }) => {
  const isArabic = lang === 'ar';
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  const handleLinkClick = (e: React.MouseEvent, route: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(route);
    }
  };

  const handleAdminClick = () => {
    if (onOpenAdminPortal) {
      onOpenAdminPortal();
    } else if (onNavigate) {
      onNavigate('signin');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            <div className="shrink-0">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('home');
                }}
                className="text-lg font-bold text-gray-900 cursor-pointer"
              >
                Next Real Estate
              </a>
            </div>

            <div className="flex items-center gap-8 sm:gap-14 text-sm font-medium text-gray-700">
              <div className="flex flex-col gap-2">
                <a
                  href="#properties"
                  onClick={(e) => handleLinkClick(e, 'properties')}
                  className="hover:text-[#c4191a] transition-colors whitespace-nowrap cursor-pointer"
                >
                  {isArabic ? 'العقارات' : 'Properties'}
                </a>
                <a
                  href="#contact"
                  onClick={(e) => handleLinkClick(e, 'contact')}
                  className="hover:text-[#c4191a] transition-colors whitespace-nowrap cursor-pointer"
                >
                  {isArabic ? 'اتصل بنا' : 'Contact Us'}
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-end gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                <Smartphone className="w-3.5 h-3.5 text-gray-700"/>
                <span>{isArabic ? 'حمّل تطبيقنا' : 'Download our app'}</span>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleInstallApp}
                  className="h-9 px-3.5 rounded-lg bg-black hover:bg-neutral-800 text-white flex items-center gap-2 transition-all cursor-pointer border border-neutral-800"
                >
                  <Download className="w-4 h-4 text-[#c4191a]"/>
                  <span className="text-xs font-semibold">
                    {isArabic ? 'تثبيت تطبيق الويب (PWA)' : 'Install Web App'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#c4191a] text-white py-2 px-4 sm:px-6 text-xs font-medium">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-1">
            <div className="flex items-center gap-4">
              <a href="#privacy" className="hover:underline text-white/95">
                {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </a>
              
              <button
                type="button"
                onClick={handleAdminClick}
                className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] text-white cursor-pointer"
              >
                <Lock className="w-3 h-3"/>
                <span>{isArabic ? 'دخول الإدارة' : 'Admin Login'}</span>
              </button>
            </div>

            {/* Code Titans - Clean & Visible Signature */}
            <div className="flex items-center gap-1.5 text-white/90 font-medium">
              <span className="text-[11px] text-white/70">Developed by</span>
              <span className="text-[11px] font-bold tracking-wider text-white">Nadine Yazbik &amp; Hasan Fares (Code Titans)</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};