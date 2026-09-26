import React from 'react';
import { X, Heart, Trash2, ArrowRight, ExternalLink, LogOut, CheckCircle } from 'lucide-react';
import { Property, Language } from '../types';
import { GoogleUser } from '../services/authService';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onRemoveFavorite: (propertyId: string) => void;
  user: GoogleUser | null;
  onLogout: () => void;
  lang?: Language;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  properties,
  onSelectProperty,
  onRemoveFavorite,
  user,
  onLogout,
  lang = 'en',
}) => {
  const isArabic = lang === 'ar';

  if (!isOpen) return null;

  const favoriteProperties = properties.filter((p) => favorites.includes(p.id));

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right rtl:slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-[#c4191a] flex items-center justify-center">
              <Heart className="w-4 h-4 fill-[#c4191a]" />
            </div>
            <div>
              <h3
                className="text-base font-bold text-gray-900"
                style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
              >
                {isArabic ? 'قائمة العقارات المفضلة' : 'My Saved Properties'}
              </h3>
              <p className="text-xs text-gray-500">
                {favoriteProperties.length}{' '}
                {isArabic ? 'عقارات محفوظة في حسابك' : 'properties saved in your wishlist'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Info Bar */}
        {user && (
          <div className="px-4 py-2.5 bg-red-50/50 border-b border-red-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <img
                src={user.picture}
                alt={user.name}
                className="w-6 h-6 rounded-full border border-red-200 shrink-0"
              />
              <div className="truncate">
                <span className="font-semibold text-gray-800 truncate block">{user.name}</span>
                <span className="text-[10px] text-gray-500 truncate block">{user.email}</span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="text-[11px] text-gray-500 hover:text-red-600 flex items-center gap-1 font-semibold transition cursor-pointer shrink-0 ml-2 rtl:ml-0 rtl:mr-2"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isArabic ? 'خروج' : 'Sign out'}</span>
            </button>
          </div>
        )}

        {/* Saved List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {favoriteProperties.length === 0 ? (
            <div className="py-16 text-center text-gray-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-300">
                <Heart className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {isArabic ? 'لم تقم بحفظ أي عقارات بعد' : 'No saved properties yet'}
              </p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                {isArabic
                  ? 'انقر على رمز القلب في أي بطاقة عقار لحفظها والرجوع إليها بسهولة في أي وقت.'
                  : 'Click the heart icon on any listing to save it to your wishlist and revisit anytime.'}
              </p>
            </div>
          ) : (
            favoriteProperties.map((prop) => (
              <div
                key={prop.id}
                onClick={() => {
                  onSelectProperty(prop);
                  onClose();
                }}
                className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-xs transition bg-white flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={prop.imageUrl}
                    alt={prop.title}
                    className="w-16 h-14 rounded-lg object-cover bg-gray-100 shrink-0 group-hover:scale-102 transition"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-900 truncate block group-hover:text-[#c4191a] transition-colors">
                      {isArabic ? prop.titleAr : prop.title}
                    </span>
                    <span className="text-[11px] text-gray-500 truncate block">
                      {prop.location}
                    </span>
                    <span className="text-xs font-bold text-[#c4191a] block mt-0.5">
                      USD {new Intl.NumberFormat('en-US').format(prop.price)}
                      {prop.isRental && (
                        <span className="text-[10px] text-gray-500 font-normal"> / mo</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(prop.id);
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title={isArabic ? 'إزالة من المفضلة' : 'Remove'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Bottom Bar */}
        {favoriteProperties.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#c4191a] hover:bg-[#a51516] text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer select-none"
            >
              {isArabic ? 'متابعة التصفح' : 'Continue Browsing'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
