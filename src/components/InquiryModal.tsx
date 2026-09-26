import React, { useState } from 'react';
import { X, Phone, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Property, Language } from '../types';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  lang?: Language;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  property,
  lang = 'en',
}) => {
  const isArabic = lang === 'ar';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(
    property
      ? isArabic
        ? `مرحباً Next Real Estate، أود الاستفسار عن العقار ${property.referenceNo} (${property.titleAr}).`
        : `Hello Next Real Estate, I am interested in property ${property.referenceNo} (${property.title}).`
      : isArabic
      ? 'مرحباً، أود استشارة عقارية مع فريق Next Real Estate.'
      : 'Hello, I would like more information from Next Real Estate.'
  );
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      const text = encodeURIComponent(
        `Next Real Estate Inquiry:\nName: ${name}\nPhone: ${phone}\nMessage: ${message}`
      );
      window.open(`https://wa.me/message/7TA5OZXYI52NJ1?text=${text}`, '_blank');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
        {/* Modal Header */}
        <div className="bg-[#18191a] text-white p-5 flex items-center justify-between border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold" style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}>
              Next Real Estate
            </h3>
            <p className="text-xs text-white/70">
              {isArabic ? 'مرحلتك القادمة هنا • هاتف وواتساب 76743414' : 'Your next chapter is here • Tel 76743414'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
              <h4 className="text-lg font-bold text-gray-900">
                {isArabic ? 'شكراً لتواصلك!' : 'Thank You!'}
              </h4>
              <p className="text-sm text-gray-600">
                {isArabic
                  ? 'يتم الآن فتح تطبيق واتساب للتواصل المباشر مع مستشار Next Real Estate على 76743414...'
                  : 'Opening WhatsApp to connect directly with our advisor at 76743414...'}
              </p>
              <button
                onClick={onClose}
                className="btn-red-cta mt-4 px-6 py-2 text-sm font-medium"
              >
                {isArabic ? 'إغلاق' : 'Done'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {property && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <img
                    src={property.imageUrl}
                    alt={isArabic ? property.titleAr : property.title}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0 text-left" dir={isArabic ? 'rtl' : 'ltr'}>
                    <span className="text-xs font-semibold text-[#c4191a] block truncate">
                      {property.referenceNo}
                    </span>
                    <h5 className="text-xs font-medium text-gray-900 truncate">
                      {isArabic ? property.titleAr : property.title}
                    </h5>
                    <span className="text-xs font-bold text-gray-800">
                      ${new Intl.NumberFormat('en-US').format(property.price)}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isArabic ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isArabic ? 'اسمك الكريم' : 'Your Name'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#c4191a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isArabic ? 'رقم الهاتف / واتساب' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+961 76 743 414"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#c4191a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isArabic ? 'الرسالة' : 'Message'}
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#c4191a] resize-none"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="btn-red-cta w-full py-3 text-sm font-semibold shadow-md flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isArabic ? 'إرسال عبر واتساب (76743414)' : 'Send via WhatsApp (76743414)'}</span>
                </button>

                <a
                  href="tel:+96176743414"
                  className="w-full py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors text-center"
                >
                  <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>{isArabic ? 'اتصال مباشر: 76743414' : 'Call Direct: +961 76 743 414'}</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
