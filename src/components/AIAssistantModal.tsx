import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, ArrowRight, MessageCircle, Building2, CheckCircle } from 'lucide-react';
import { Language, Property } from '../types';
import { mockProperties } from '../data/properties';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectProperty?: (property: Property) => void;
  onApplyFilter?: (filters: { location?: string; propertyType?: string; buildingAge?: string; saleOrRental?: string }) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  matchedProperties?: Property[];
  suggestedFilter?: { location?: string; propertyType?: string; buildingAge?: string; saleOrRental?: string; label: string };
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectProperty,
  onApplyFilter,
}) => {
  const isArabic = lang === 'ar';

  const initialMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      sender: 'ai',
      text: isArabic
        ? 'مرحباً بك في Next Real Estate! أنا مستشارك العقاري الذكي. كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي عن العقارات في رأس بيروت، المصيطبة، المزرعة، الأشرفية، المتن، أو البحث حسب عمر البناية والمساحة.'
        : 'Welcome to Next Real Estate! I am your AI Property Advisor. How can I assist you today? You can ask about properties across Beirut (Ras Beirut, Al-Musaitbeh, Al-Mazraa, Achrafieh), Metn, or filter by building age and area.',
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = isArabic
    ? [
        { label: 'شقق في رأس بيروت', query: 'أبحث عن شقة في رأس بيروت مطلة على البحر' },
        { label: 'عقارات في المصيطبة', query: 'شقق عائلية في المصيطبة' },
        { label: 'بناء جديد كلياً', query: 'أريد عقاراً حديث البناء عمره أقل من سنتين' },
        { label: 'معارض تجارية في المزرعة', query: 'معرض تجاري للإيجار في جادة المزرعة' },
        { label: 'فيلات فخمة في المتن', query: 'فيلا مع مسبح في المنصورية أو المتن' },
      ]
    : [
        { label: 'Ras Beirut sea view', query: 'Looking for a sea view apartment in Ras Beirut' },
        { label: 'Family flat in Al-Musaitbeh', query: '3-bedroom apartment in Al-Musaitbeh' },
        { label: 'Brand new buildings', query: 'Properties built within the last 2 years' },
        { label: 'Commercial in Al-Mazraa', query: 'Retail showroom for rent in Al-Mazraa' },
        { label: 'Luxury villas in Metn', query: 'Villa with private pool in Mansourieh, Metn' },
      ];

  const handleSendMessage = (userQuery?: string) => {
    const query = userQuery || inputValue.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userQuery) setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = query.toLowerCase();
      let responseText = '';
      let matches: Property[] = [];
      let filterSuggestion: ChatMessage['suggestedFilter'] = undefined;

      if (lower.includes('ras beirut') || lower.includes('رأس بيروت')) {
        matches = properties.filter((p) => p.neighborhood.toLowerCase().includes('ras beirut'));
        responseText = isArabic
          ? 'إليك شقة مميزة جداً في رأس بيروت بإطلالة بحرية بانورامية، مواصفات عالية وبناء حديث:'
          : 'Here is a prime option in Ras Beirut featuring panoramic Mediterranean views and brand new construction:';
        filterSuggestion = { location: 'Ras Beirut (رأس بيروت)', label: isArabic ? 'عرض كافة عقارات رأس بيروت' : 'Filter Ras Beirut properties' };
      } else if (lower.includes('musaitbeh') || lower.includes('المصيطبة')) {
        matches = properties.filter((p) => p.neighborhood.toLowerCase().includes('musaitbeh'));
        responseText = isArabic
          ? 'تتوفر شقة عائلية مثالية في المصيطبة بمساحة ١٧٥ م²، ٣ غرف نوم وبناء هادئ عمره ٤ سنوات:'
          : 'Found a great family apartment in Al-Musaitbeh with 175 m², 3 bedrooms, and a well-maintained 4-year-old building:';
        filterSuggestion = { location: 'Al-Musaitbeh (المصيطبة)', label: isArabic ? 'تصفية عقارات المصيطبة' : 'Filter Al-Musaitbeh properties' };
      } else if (lower.includes('mazraa') || lower.includes('المزرعة')) {
        matches = properties.filter((p) => p.neighborhood.toLowerCase().includes('mazraa'));
        responseText = isArabic
          ? 'على جادة المزرعة الرئيسية، لدينا صالة عرض تجارية راقية بمساحة ٢١٠ م² مثالية للمؤسسات والشركات:'
          : 'On the main Al-Mazraa avenue, we have a prominent 210 m² commercial showroom suitable for corporate headquarters or retail:';
        filterSuggestion = { location: 'Al-Mazraa (المزرعة)', propertyType: 'Commercial', label: isArabic ? 'عقارات المزرعة التجارية' : 'Filter Al-Mazraa Commercial' };
      } else if (lower.includes('new') || lower.includes('جديد') || lower.includes('سنتين') || lower.includes('age')) {
        matches = properties.filter((p) => p.buildingAge === '0_2' || p.buildingAge === 'under_construction');
        responseText = isArabic
          ? 'تم العثور على عقارات حديثة البناء (أقل من سنتين أو قيد الإنشاء) بتشطيبات راقية وضمانات هندسية:'
          : 'Found properties built within the last 2 years or currently under construction with premium specifications:';
        filterSuggestion = { buildingAge: '0_2', label: isArabic ? 'تصفية الأبنية الحديثة' : 'Filter Brand New Buildings' };
      } else if (lower.includes('villa') || lower.includes('فيلا') || lower.includes('mansourieh') || lower.includes('المنصورية')) {
        matches = properties.filter((p) => p.type === 'Villa');
        responseText = isArabic
          ? 'إليك فيلا المنصورية الفاخرة، مع مسبح خاص وإطلالة خلابة على الجبل والبحر، مساحة ٥٢٠ م² وبناء حديث ٢٠٢٤:'
          : 'Here is an ultra-luxury villa in Mansourieh, Metn, offering 520 m² of architectural excellence with a private infinity pool:';
        filterSuggestion = { propertyType: 'Villa', label: isArabic ? 'تصفية الفيلات' : 'Filter Villas' };
      } else {
        matches = properties.slice(0, 2);
        responseText = isArabic
          ? `بناءً على طلبك ("${query}")، استعرضت محفظة Next Real Estate واخترت لك هذه الخيارات الموصى بها:`
          : `Based on your request ("${query}"), here are top matching recommendations from Next Real Estate's portfolio:`;
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        matchedProperties: matches.length > 0 ? matches : undefined,
        suggestedFilter: filterSuggestion,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full h-[88vh] max-h-[720px] flex flex-col overflow-hidden shadow-2xl border border-gray-100"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#18191a] via-[#212121] to-[#18191a] text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c4191a] text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold" style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}>
                  {isArabic ? 'المستشار العقاري الذكي' : 'AI Property Advisor'}
                </h3>
                <span className="bg-[#c4191a]/20 text-[#c4191a] border border-[#c4191a]/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Next AI
                </span>
              </div>
              <p className="text-xs text-white/70">
                {isArabic ? 'استشارات فورية وبحث ذكي لكافة المناطق اللبنانية' : 'Instant real estate guidance across all Lebanese regions'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#fbfbfc]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? (isArabic ? 'justify-start' : 'justify-end') : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-[#c4191a] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-3`}>
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#c4191a] text-white rounded-br-none shadow-md font-medium'
                      : 'bg-white text-[#212121] border border-gray-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Render Matched Properties Cards */}
                {msg.matchedProperties && msg.matchedProperties.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {msg.matchedProperties.map((prop) => (
                      <div
                        key={prop.id}
                        className="bg-white rounded-xl border border-gray-200 p-2.5 shadow-sm hover:shadow-md transition-all hover:border-[#c4191a] group cursor-pointer text-left"
                        onClick={() => {
                          if (onSelectProperty) onSelectProperty(prop);
                          onClose();
                        }}
                      >
                        <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-2 bg-gray-100">
                          <img
                            src={prop.imageUrl}
                            alt={isArabic ? prop.titleAr : prop.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            {prop.referenceNo}
                          </span>
                        </div>
                        <h5 className="font-semibold text-xs text-gray-900 line-clamp-1 mb-1 group-hover:text-[#c4191a]">
                          {isArabic ? prop.titleAr : prop.title}
                        </h5>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#c4191a]">
                            ${new Intl.NumberFormat('en-US').format(prop.price)}
                            {prop.isRental && <span className="text-[10px] text-gray-500 font-normal">/mo</span>}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {prop.areaSqm} m² • {isArabic ? prop.buildingAgeLabelAr : prop.buildingAgeLabel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Filter Action Button */}
                {msg.suggestedFilter && onApplyFilter && (
                  <button
                    onClick={() => {
                      onApplyFilter(msg.suggestedFilter!);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#212121] hover:bg-[#c4191a] text-white px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    <span>{msg.suggestedFilter.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gray-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-8 h-8 rounded-lg bg-[#c4191a]/20 text-[#c4191a] flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <span className="font-medium animate-pulse">
                {isArabic ? 'جاري تحليل العقارات المناسبة...' : 'Analyzing matching properties...'}
              </span>
            </div>
          )}
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar shrink-0">
          <span className="text-gray-400 text-[11px] font-semibold whitespace-nowrap">
            {isArabic ? 'أسئلة مقترحة:' : 'Suggestions:'}
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.query)}
              className="px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-[#c4191a] hover:text-[#c4191a] whitespace-nowrap transition-colors shadow-xs"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-gray-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                isArabic
                  ? 'اسأل المستشار الذكي (مثال: شقة في المصيطبة، بناء جديد، ميزانية محددة...)'
                  : 'Ask AI Advisor (e.g., apartment in Al-Musaitbeh, brand new building, budget...)'
              }
              className="flex-1 h-11 px-4 rounded-xl border border-gray-300 focus:border-[#c4191a] focus:outline-none text-sm placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="btn-red-cta h-11 px-5 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              <span>{isArabic ? 'إرسال' : 'Ask'}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
