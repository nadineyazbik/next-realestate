import React, { useState, useEffect } from 'react';
import { Phone, X } from 'lucide-react';

export default function AICallWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const AGENT_ID = "Agent_0301m4dgyp7kftq9b2kwawvv836p";
  const agentImage = "/WhatsApp Image 2026-10-08 at 3.13.06 PM.jpeg";

  // تحميل سكريبت ElevenLabs الرسمي عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      const scriptId = 'elevenlabs-convai-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://elevenlabs.io/convai-widget/index.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [isOpen]);

  return (
    <>
      {/* 1. زر الاتصال العائم في زاوية الشاشة السفلى اليمنى */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-16 h-16 bg-[#0a3633] text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 border-2 border-white/30 cursor-pointer animate-bounce"
          aria-label="Talk to Nadine"
        >
          <Phone className="w-7 h-7" />
        </button>
      </div>

      {/* 2. النافذة المنبثقة للاتصال (Modal) */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
            
            {/* Header */}
            <div className="bg-[#0a3633] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 space-x-reverse">
                <img 
                  src={agentImage} 
                  alt="Nadine" 
                  className="w-8 h-8 rounded-full object-cover border border-white/30"
                />
                <span className="font-semibold text-sm">Talk to us!</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Content */}
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              
              {/* Avatar with Glow Effect */}
              <div className="relative mt-2">
                <div className="absolute -inset-3 bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 rounded-full blur-xl opacity-70 animate-pulse"></div>
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img 
                    src={agentImage} 
                    alt="Nadine - AI Property Advisor" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Agent Info */}
              <div>
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  <h3 className="text-xl font-bold text-gray-900">Nadine</h3>
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-semibold">AI</span>
                </div>
                <p className="text-gray-500 text-xs mt-1">AI Property Advisor - Next Real Estate</p>
              </div>

              {/* ElevenLabs Widget Container */}
              <div className="w-full pt-2 flex flex-col items-center min-h-[100px] justify-center">
                {/* @ts-ignore */}
                <elevenlabs-convai agent-id={AGENT_ID}></elevenlabs-convai>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-400 hover:text-gray-600 underline pt-2 cursor-pointer"
              >
                إغلاق النافذة
              </button>

            </div>

            {/* Footer Branding */}
            <div className="bg-gray-50 py-3 text-center border-t border-gray-100">
              <span className="text-[11px] text-gray-400 tracking-wider font-medium">Crafted by Code Titans</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}