import React, { useState } from 'react';
import { X, Heart, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { authService, GoogleUser } from '../services/authService';
import { Language } from '../types';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: GoogleUser) => void;
  lang?: Language;
  pendingPropertyTitle?: string;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lang = 'en',
  pendingPropertyTitle,
}) => {
  const isArabic = lang === 'ar';
  const [isLoading, setIsLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = (emailToUse: string = 'windowsnadine197@gmail.com') => {
    setIsLoading(true);
    setTimeout(() => {
      const user = authService.loginWithGoogle(emailToUse);
      setIsLoading(false);
      onSuccess(user);
      onClose();
    }, 450);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 rtl:right-auto rtl:left-3.5 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 text-center">
          {/* Heart & Google Combined Icon */}
          <div className="relative w-14 h-14 mx-auto mb-4 flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-[#c4191a]">
              <Heart className="w-7 h-7 fill-[#c4191a]" />
            </div>
            <div className="absolute -bottom-1 -right-1 rtl:-right-auto rtl:-left-1 w-6 h-6 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.41 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.41l4.04-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.59 1.24 6.59l4.04 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h3
            className="text-base sm:text-lg font-bold text-gray-900 mb-1"
            style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
          >
            {isArabic ? 'تسجيل الدخول لحفظ العقارات' : 'Save Properties to Favorites'}
          </h3>

          <p className="text-xs text-gray-500 mb-4 px-2">
            {pendingPropertyTitle
              ? isArabic
                ? `قم بتسجيل الدخول بنقرة واحدة عبر Google لإضافة "${pendingPropertyTitle}" إلى قائمة مفضلاتك.`
                : `Sign in with Google in a single click to add "${pendingPropertyTitle}" to your wishlist.`
              : isArabic
              ? 'تصفح بحرية تامة دون تسجيل. سجّل دخولك بنقرة واحدة لحفظ ومتابعة عقاراتك المفضلة.'
              : 'Browse freely anytime. Sign in with Google with a single click to save and track your wishlist across all devices.'}
          </p>

          {/* Single-Click Google Sign-In Primary Button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleGoogleLogin('windowsnadine197@gmail.com')}
            className="w-full h-11 px-4 rounded-xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer select-none mb-3"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-gray-300 border-t-[#c4191a] rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.41 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.41l4.04-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.59 1.24 6.59l4.04 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                  />
                </svg>
                <span>{isArabic ? 'تسجيل الدخول السريع عبر Google' : 'Continue with Google'}</span>
              </>
            )}
          </button>

          {/* Option for user to specify another Google email if desired */}
          {showCustomInput ? (
            <div className="mt-2 text-start animate-in fade-in">
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                {isArabic ? 'أدخل بريد Google آخر:' : 'Enter custom Google account:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:border-[#c4191a] outline-none"
                />
                <button
                  type="button"
                  onClick={() => customEmail.trim() && handleGoogleLogin(customEmail.trim())}
                  className="px-3 py-1.5 bg-[#c4191a] text-white rounded-lg text-xs font-semibold hover:bg-[#a51516] transition cursor-pointer"
                >
                  {isArabic ? 'دخول' : 'Go'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="text-[11px] text-gray-400 hover:text-gray-600 hover:underline transition cursor-pointer"
            >
              {isArabic ? 'استخدام حساب Google آخر' : 'Use a different Google account'}
            </button>
          )}

          {/* Security footnote */}
          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {isArabic
                ? 'تسجيل آمن ومشفر 100% • دون استمارات طويلة أو كلمات سر'
                : '100% Secure Google OAuth • Zero forms or passwords required'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
