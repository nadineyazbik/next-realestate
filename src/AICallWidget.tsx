import React, { useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import { X, Mic, PhoneOff, Volume2 } from 'lucide-react';

const AGENT_ID = 'agent_2301m4gtgwnkem3bwyghjcqt8sjs';

interface AICallWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterProperties: (args: { location?: string; propertyType?: string; saleOrRental?: string }) => void;
  onScheduleAppointment: (args: {
    client_name?: string;
    phone_number?: string;
    property_details?: string;
    appointment_date_time?: string;
  }) => void;
}

export const AICallWidget: React.FC<AICallWidgetProps> = ({
  isOpen,
  onClose,
  onFilterProperties,
  onScheduleAppointment,
}) => {
  const [error, setError] = useState<string | null>(null);

  const conversation = useConversation({
    clientTools: {
      filter_properties: async (p: any) => {
        onFilterProperties({
          location: p?.location,
          propertyType: p?.propertyType,
          saleOrRental: p?.action,
        });
        return 'تم تطبيق الفلتر';
      },
      schedule_appointment: async (p: any) => {
        onScheduleAppointment(p || {});
        return 'تم إرسال طلب الموعد';
      },
    },
    onError: (e: any) => {
      console.error('ElevenLabs error:', e);
      setError('صار خطأ بالاتصال. جرّب مرة تانية.');
    },
  });

  const isConnected = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';

  const handleStartCall = async () => {
    setError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: 'webrtc',
      });
    } catch (e: any) {
      console.error(e);
      setError(
        e?.name === 'NotAllowedError'
          ? 'الميكروفون محظور. اسمح بالميكروفون من إعدادات المتصفح.'
          : 'ما قدرنا نبدأ المكالمة.'
      );
    }
  };

  const handleStopCall = async () => {
    try { await conversation.endSession(); } catch {}
    onClose();
  };

  if (!isOpen) return null;

  const statusText = isConnecting
    ? 'عم نوصّل...'
    : isConnected
    ? conversation.isSpeaking
      ? 'نادين عم تحكي...'
      : 'نادين عم بتسمعك، احكي'
    : 'اضغط "تحدث الآن" لتبدأ المكالمة';

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col">
      <div className="bg-[#0b3c35] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/30 relative">
            <img src="/WhatsApp Image 2026-10-08 at 3.13.06 PM.jpeg" alt="Nadine" className="w-full h-full object-cover" />
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-[#0b3c35] rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-gray-400'}`} />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">Nadine • Voice Advisor</h3>
            <p className="text-[10px] text-emerald-200">Lebanese Dialect • {isConnected ? 'Live' : 'Offline'}</p>
          </div>
        </div>
        <button onClick={handleStopCall} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 flex flex-col items-center text-center bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="relative mb-3">
          <div className={`w-24 h-24 rounded-full p-1 bg-emerald-100 ring-4 ring-emerald-400 ring-offset-2 ${conversation.isSpeaking ? 'animate-pulse' : ''}`}>
            <img src="/WhatsApp Image 2026-10-08 at 3.13.06 PM.jpeg" alt="Nadine" className="w-full h-full rounded-full object-cover" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full mb-3 border border-emerald-100">
          <Volume2 className={`w-3.5 h-3.5 ${conversation.isSpeaking ? 'animate-bounce' : ''}`} />
          <span>{statusText}</span>
        </div>

        {error && (
          <div className="w-full bg-red-50 text-red-700 text-xs rounded-xl p-2 mb-3 border border-red-100" dir="rtl">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 w-full">
          <button
            onClick={handleStartCall}
            disabled={isConnected || isConnecting}
            className="flex-1 py-2.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-md bg-[#0b3c35] text-white hover:bg-[#082e29] disabled:opacity-50 active:scale-95 transition-all"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isConnected ? 'المكالمة شغالة' : 'تحدث الآن (Talk)'}</span>
          </button>
          <button
            onClick={handleStopCall}
            className="p-2.5 rounded-full bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-md"
            title="إنهاء المكالمة"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-gray-50 py-2 px-3 text-center border-t border-gray-100 text-[10px] text-gray-400">
        Powered by <strong className="text-gray-600">Next Real Estate AI</strong>
      </div>
    </div>
  );
};