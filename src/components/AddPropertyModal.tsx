import React, { useState } from 'react';
import { X, CheckCircle2, Upload, Building2 } from 'lucide-react';
import { Language } from '../types';
import { BUILDING_AGES, PROPERTY_TYPES } from '../data/properties';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  isOpen,
  onClose,
  lang = 'en',
}) => {
  const isArabic = lang === 'ar';
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    type: 'Apartment',
    saleOrRent: 'sale',
    price: '',
    beds: '3',
    baths: '2',
    area: '',
    buildingAge: '0_2',
    name: '',
    phone: '',
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      const summary = encodeURIComponent(
        `Next Real Estate - New Property Submission:\nOwner: ${formData.name} (${formData.phone})\nTitle: ${formData.title}\nLocation: ${formData.location}\nType: ${formData.type}\nFor: ${formData.saleOrRent}\nArea: ${formData.area} m²\nBuilding Age: ${formData.buildingAge}\nPrice: $${formData.price}`
      );
      window.open(`https://wa.me/message/7TA5OZXYI52NJ1?text=${summary}`, '_blank');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 my-8">
        {/* Header */}
        <div className="bg-[#18191a] text-white p-5 flex items-center justify-between border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold" style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}>
              {isArabic ? 'أضف عقارك مع Next Real Estate' : 'List with Next Real Estate'}
            </h3>
            <p className="text-xs text-white/70">
              {isArabic ? 'مرحلتك القادمة هنا • تسويق عقاري احترافي' : 'Your next chapter is here • Professional Brokerage'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
              <h4 className="text-lg font-bold text-gray-900">
                {isArabic ? 'تم استلام طلب إضافة العقار بنجاح!' : 'Property Submitted Successfully!'}
              </h4>
              <p className="text-sm text-gray-600">
                {isArabic
                  ? 'يقوم فريق Next Real Estate بمراجعة البيانات والتواصل معك عبر 76743414.'
                  : 'The Next Real Estate team will verify your listing and contact you shortly.'}
              </p>
              <button
                onClick={onClose}
                className="btn-red-cta mt-4 px-6 py-2 text-sm font-medium"
              >
                {isArabic ? 'إغلاق' : 'Close'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isArabic ? 'عنوان العقار' : 'Property Title'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isArabic ? 'مثال: شقة مودرن مطلة في رأس بيروت' : 'e.g. Modern Apartment in Ras Beirut'}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#c4191a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isArabic ? 'المنطقة أو الحي' : 'Location / District'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isArabic ? 'مثال: المصيطبة / المزرعة' : 'e.g. Al-Musaitbeh, Beirut'}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#c4191a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isArabic ? 'نوع العقار' : 'Property Type'}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#c4191a]"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {isArabic ? t.nameAr : t.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isArabic ? 'المساحة (م²)' : 'Area (m²)'}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="200"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#c4191a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isArabic ? 'عمر البناية' : 'Building Age'}
                  </label>
                  <select
                    value={formData.buildingAge}
                    onChange={(e) => setFormData({ ...formData, buildingAge: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#c4191a]"
                  >
                    {BUILDING_AGES.filter((a) => a.value !== '').map((a) => (
                      <option key={a.value} value={a.value}>
                        {isArabic ? a.labelAr : a.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isArabic ? 'نوع العرض' : 'Listing For'}
                  </label>
                  <select
                    value={formData.saleOrRent}
                    onChange={(e) => setFormData({ ...formData, saleOrRent: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#c4191a]"
                  >
                    <option value="sale">{isArabic ? 'للبيع' : 'Sale'}</option>
                    <option value="rent">{isArabic ? 'للإيجار' : 'Rental'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isArabic ? 'السعر المطلوب ($)' : 'Price ($)'}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="250000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#c4191a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isArabic ? 'اسم المالك' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isArabic ? 'الاسم الكريم' : 'Full Name'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#c4191a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isArabic ? 'رقم الهاتف' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+961 76 743 414"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#c4191a]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-red-cta w-full py-3 text-sm font-semibold shadow-md mt-2"
              >
                {isArabic ? 'تقديم العقار للمراجعة والنشر' : 'Submit Property to Next Real Estate'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
