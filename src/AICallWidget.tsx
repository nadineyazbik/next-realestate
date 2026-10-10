import React from 'react';
import { useVoiceAgent } from './hooks/useVoiceAgent';
import { X, Mic, PhoneOff, Volume2 } from 'lucide-react';

interface AICallWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICallWidget: React.FC<AICallWidgetProps> = ({ isOpen, onClose }) => {
  const { callState, transcript, userText, error, startListening, stopAll } = useVoiceAgent();

  if (!isOpen) return null;

  return (
    // تم تغيير التصميم ليصبح مثل الماسنجر في زاوية الشاشة السفلى على اليمين بدون تعتيم للخلفية
    <div className="fixed bottom-6 right-6 z-[9999] w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col animate-in slide-in-from-bottom-5 duration-300">
      
      {/* Header - الأخضر الداكن الأنيق */}
      <div className="bg-[#0b3c35] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/30 relative">
            <img 
              src="/WhatsApp Image 2026-10-08 at 3.13.06 PM.jpeg" 
              alt="Nadine" 
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0b3c35] rounded-full"></span>
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">Nadine • Voice Advisor</h3>
            <p className="text-[10px] text-emerald-200">Lebanese Dialect • Live</p>
          </div>
        </div>
        <button 
          onClick={() => { stopAll(); onClose(); }}
          className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body - المحتوى الصوتي */}
      <div className="p-4 flex flex-col items-center justify-center text-center bg-gradient-to-b from-emerald-50/30 to-white">
        
        {/* الصورة الدائرية لنادين مع تأثير تفاعلي عند التحدث أو السماع */}
        <div className="relative mb-3">
          <div className={`w-24 h-24 rounded-full p-1 bg-emerald-100 transition-all duration-300 ${
            callState === 'speaking' || callState === 'listening' ? 'ring-4 ring-emerald-400 ring-offset-2 animate-pulse' : ''
          }`}>
            <img 
              src="/WhatsApp Image 2026-10-08 at 3.13.06 PM.jpeg" 
              alt="Nadine" 
              className="w-full h-full rounded-full object-cover shadow-inner"
            />
          </div>
        </div>

        {/* حالة الصوت الحالية */}
        <div className="flex items-center gap-1.5 px-3 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full mb-3 border border-emerald-100">
          <Volume2 className="w-3.5 h-3.5 animate-bounce" />
          <span>{callState === 'speaking' ? 'نادين تتكلم...' : callState === 'listening' ? 'عم تسمعك...' : 'جاهزة للمحادثة'}</span>
        </div>

        {/* صندوق الردود التفاعلية */}
        <div className="w-full bg-emerald-50/60 rounded-xl p-3 border border-emerald-100/80 mb-4 text-right dir-rtl">
          <p className="text-xs font-medium text-gray-700 leading-relaxed min-h-[36px] max-h-[70px] overflow-y-auto">
            {transcript}
          </p>
          {userText && (
            <p className="text-[11px] text-gray-400 mt-1.5 border-t border-emerald-100 pt-1.5 truncate">
              أنتِ: {userText}
            </p>
          )}
        </div>

        {/* الأخطاء إن وجدت */}
        {error && (
          <div className="text-[11px] text-red-500 bg-red-50 p-2 rounded-lg mb-3 w-full">
            {error}
          </div>
        )}

        {/* أزرار التحكم بالمكالمة */}
        <div className="flex items-center justify-center gap-3 w-full">
          <button
            onClick={startListening}
            disabled={callState === 'listening' || callState === 'thinking'}
            className={`flex-1 py-2.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
              callState === 'listening'
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-[#0b3c35] text-white hover:bg-[#082e29] active:scale-95'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{callState === 'listening' ? 'عم بسمعك...' : 'Talk (تحدث)'}</span>
          </button>

          <button
            onClick={() => { stopAll(); onClose(); }}
            className="p-2.5 rounded-full bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-md transition-all"
            title="إنهاء المكالمة"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Footer Branding */}
      <div className="bg-gray-50 py-2 px-3 text-center border-t border-gray-100 text-[10px] text-gray-400">
        Powered by <strong className="text-gray-600">Next Real Estate AI</strong>
      </div>

    </div>
  );
};