import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';

interface PWAInstallButtonProps {
  lang?: Language;
  variant?: 'header' | 'footer' | 'drawer';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  lang = 'en',
  variant = 'header',
}) => {
  const isArabic = lang === 'ar';
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed in standalone mode, show clean installed status or hide
  if (isInstalled) {
    if (variant === 'footer') {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-emerald-400 text-xs font-medium">
          <Check className="w-3.5 h-3.5" />
          <span>{isArabic ? 'التطبيق مثبت على جهازك' : 'App Installed on Device'}</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowIOSModal(true);
    }
  };

  if (variant === 'footer') {
    return (
      <>
        <div className="flex flex-col items-center sm:items-start gap-2.5">
          <div className="flex items-center gap-2 text-white/90 text-xs font-semibold uppercase tracking-wider">
            <Smartphone className="w-4 h-4 text-[#c4191a]" />
            <span>{isArabic ? 'تثبيت التطبيق على هاتفك' : 'Install App on Your Phone'}</span>
          </div>

          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-white text-xs font-medium border border-white/20 transition-all duration-150 cursor-pointer group shadow-xs"
          >
            <Download className="w-4 h-4 text-[#c4191a] group-hover:scale-110 transition-transform" />
            <span>
              {isArabic
                ? 'إضافة إلى الشاشة الرئيسية (iOS / Android)'
                : 'Add to Home Screen (iOS & Android)'}
            </span>
          </button>
        </div>

        {/* iOS / Mobile Installation Guide Modal */}
        {showIOSModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
            dir={isArabic ? 'rtl' : 'ltr'}
            onClick={() => setShowIOSModal(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-100 text-gray-800 text-start"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#c4191a]/10 text-[#c4191a] flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {isArabic ? 'تثبيت Next Real Estate' : 'Install Next Real Estate'}
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      {isArabic ? 'لتجربة سريعة بدون تحميل من المتجر' : 'Fast access without app store'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-gray-600">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Share className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-gray-900 block font-semibold">
                      {isArabic ? '1. اضغط على زر المشاركة' : '1. Tap the Share Button'}
                    </strong>
                    <span>
                      {isArabic
                        ? 'في متصفح Safari أسفل شاشة الآيفون (أو قائمة الخيارات في Chrome)'
                        : 'In Safari at the bottom of your iPhone screen (or menu in Chrome)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-red-50 text-[#c4191a] flex items-center justify-center shrink-0 mt-0.5">
                    <PlusSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-gray-900 block font-semibold">
                      {isArabic ? '2. إضافة إلى الشاشة الرئيسية' : '2. Add to Home Screen'}
                    </strong>
                    <span>
                      {isArabic
                        ? 'اختر "Add to Home Screen" لتثبيت التطبيق مباشرة وبسرعة فائقة'
                        : 'Select "Add to Home Screen" for one-tap native app experience'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="mt-4 w-full py-2.5 rounded-xl bg-[#c4191a] hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {isArabic ? 'فهمت ذلك' : 'Got it!'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Header or Drawer variant
  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
          variant === 'drawer'
            ? 'w-full px-3.5 py-2.5 rounded-xl bg-red-50 text-[#c4191a] hover:bg-red-100 justify-center'
            : 'px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white'
        }`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isArabic ? 'تثبيت التطبيق' : 'Install App'}</span>
      </button>

      {/* iOS / Mobile Installation Guide Modal */}
      {showIOSModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          dir={isArabic ? 'rtl' : 'ltr'}
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-100 text-gray-800 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#c4191a]/10 text-[#c4191a] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {isArabic ? 'تثبيت Next Real Estate' : 'Install Next Real Estate'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {isArabic ? 'لتجربة سريعة بدون تحميل من المتجر' : 'Fast access without app store'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-gray-600">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Share className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-gray-900 block font-semibold">
                    {isArabic ? '1. اضغط على زر المشاركة' : '1. Tap the Share Button'}
                  </strong>
                  <span>
                    {isArabic
                      ? 'في متصفح Safari أسفل شاشة الآيفون (أو قائمة الخيارات في Chrome)'
                      : 'In Safari at the bottom of your iPhone screen (or menu in Chrome)'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-red-50 text-[#c4191a] flex items-center justify-center shrink-0 mt-0.5">
                  <PlusSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-gray-900 block font-semibold">
                    {isArabic ? '2. إضافة إلى الشاشة الرئيسية' : '2. Add to Home Screen'}
                  </strong>
                  <span>
                    {isArabic
                      ? 'اختر "Add to Home Screen" لتثبيت التطبيق مباشرة وبسرعة فائقة'
                      : 'Select "Add to Home Screen" for one-tap native app experience'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#c4191a] hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              {isArabic ? 'فهمت ذلك' : 'Got it!'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
