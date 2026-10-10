import React, { useEffect } from 'react';
import { X, Mic } from 'lucide-react';

interface AICallWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICallWidget: React.FC<AICallWidgetProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // إرسال أمر تشغيل المكالمة لـ ElevenLabs فور فتح المودال
      const widget = document.querySelector('elevenlabs-convai');
      if (widget && (widget as any).startConversation) {
        (widget as any).startConversation();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        
        {/* Header - الأخضر الداكن الأنيق */}
        <div className="bg-[#0b3c35] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
              <img 
                src="/WhatsApp Image 2026-10-08 at 3.13.06 PM.jpeg" 
                alt="Nadine" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Live Voice AI Call</h3>
              <p className="text-xs text-emerald-200">Nadine • Real Estate Advisor</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body - الصورة الشخصية والهوية */}
        <div className="p-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-gray-50/50 to-white">
          
          {/* الصورة الدائرية لنادين بمنتصف المودال */}
          <div className="relative mb-4">
            <div className="w-36 h-36 rounded-full p-1.5 bg-emerald-100 ring-4 ring-emerald-400 ring-offset-2 animate-pulse">
              <img 
                src="/WhatsApp Image 2026-10-08 at 3.13.06 PM.jpeg" 
                alt="Nadine" 
                className="w-full h-full rounded-full object-cover shadow-inner"
              />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-1">Nadine (Voice AI)</h2>
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full mb-6 border border-emerald-100">
            Lebanese Dialect • Live
          </span>

          {/* صندوق الرسائل والإرشاد */}
          <div className="w-full bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100/80 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2 text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>المكالمة الصوتية المباشرة مع نادين نشطة</span>
            </div>
            <p className="text-sm font-medium text-gray-700 leading-relaxed">
              احكي مع نادين مباشرة بالصوت لتساعدك بتصفية وحجز عقاراتك في لبنان.
            </p>
          </div>

          {/* زر إنهاء المكالمة */}
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-full font-bold text-sm bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>إنهاء المكالمة (End Call)</span>
          </button>

        </div>

        {/* Footer Branding */}
        <div className="bg-gray-50 py-2.5 px-4 text-center border-t border-gray-100 text-[11px] text-gray-400">
          Powered by <strong className="text-gray-600">Next Real Estate AI</strong>
        </div>

      </div>
    </div>
  );
};