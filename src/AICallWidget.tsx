import React from 'react';
import { useVoiceAgent } from './hooks/useVoiceAgent';
import { X, Mic, PhoneOff } from 'lucide-react';

interface AICallWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICallWidget: React.FC<AICallWidgetProps> = ({ isOpen, onClose }) => {
  const { callState, transcript, userText, error, startListening, stopAll } = useVoiceAgent();

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
            onClick={() => { stopAll(); onClose(); }}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body - الصورة الشخصية والهوية */}
        <div className="p-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-gray-50/50 to-white">
          
          {/* الصورة الدائرية لنادين بمنتصف المودال مع الهالة المضيئة */}
          <div className="relative mb-4">
            <div className={`w-36 h-36 rounded-full p-1.5 bg-emerald-100 transition-all duration-300 ${
              callState === 'speaking' || callState === 'listening' ? 'ring-4 ring-emerald-400 ring-offset-2 animate-pulse' : ''
            }`}>
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

          {/* صندوق الرسائل والموجات الحية */}
          <div className="w-full bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100/80 mb-6 text-right dir-rtl">
            <div className="flex items-center gap-2 mb-2 text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>نادين وتقول:</span>
            </div>
            <p className="text-sm font-medium text-gray-700 leading-relaxed min-h-[40px]">
              {transcript}
            </p>
            {userText && (
              <p className="text-xs text-gray-400 mt-2 border-t border-emerald-100 pt-2">
                أنتِ: {userText}
              </p>
            )}
          </div>

          {/* الأخطاء إن وجدت */}
          {error && (
            <div className="text-xs text-red-500 bg-red-50 p-2.5 rounded-lg mb-4 w-full">
              {error}
            </div>
          )}

          {/* أزرار التحكم بالتحدث والإغلاق */}
          <div className="flex items-center justify-center gap-4 w-full">
            <button
              onClick={startListening}
              disabled={callState === 'listening' || callState === 'thinking'}
              className={`flex-1 py-3.5 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                callState === 'listening'
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-[#0b3c35] text-white hover:bg-[#082e29] active:scale-95'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{callState === 'listening' ? 'عم بسمعك...' : 'Talk (تحدث)'}</span>
            </button>

            <button
              onClick={() => { stopAll(); onClose(); }}
              className="p-3.5 rounded-full bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-lg transition-all"
              title="إنهاء المكالمة"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Footer Branding */}
        <div className="bg-gray-50 py-2.5 px-4 text-center border-t border-gray-100 text-[11px] text-gray-400">
          Powered by <strong className="text-gray-600">Next Real Estate AI</strong>
        </div>

      </div>
    </div>
  );
};