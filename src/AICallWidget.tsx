import React, { useState } from 'react';
import { Phone, X, Mic, MicOff } from 'lucide-react';

export default function AICallWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // المسار الدقيق للصورة التي أضفتِها في مجلد الـ public
  const agentImage = "/WhatsApp Image 2026-10-08 at 3.13.06 PM.jpeg";

  return (
    <>
      {/* 1. زر الاتصال العائم في زاوية الشاشة */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-[#0a3633] text-white rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white/20 cursor-pointer"
          aria-label="Talk to us"
        >
          <Phone className="w-6 h-6 animate-pulse" />
        </button>
      </div>

      {/* 2. نافذة الاتصال المنبثقة (Modal) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
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
                onClick={() => { setIsOpen(false); setIsCalling(false); }}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Content */}
            <div className="p-6 flex flex-col items-center text-center space-y-5">
              
              {/* Avatar with Glow / Pulse Effect */}
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

              {/* Call Controls & Status */}
              <div className="w-full pt-2">
                {!isCalling ? (
                  <button
                    onClick={() => setIsCalling(true)}
                    className="w-full flex items-center justify-center space-x-2 space-x-reverse border-2 border-[#0a3633] text-[#0a3633] hover:bg-[#0a3633] hover:text-white py-3 px-6 rounded-2xl font-medium transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    <Mic className="w-5 h-5" />
                    <span>Call us here</span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center space-y-4 w-full">
                    <div className="flex items-center space-x-2 text-emerald-600 font-medium text-sm animate-pulse">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                      <span>Talking... 00:15</span>
                    </div>

                    <div className="flex items-center justify-center space-x-6 space-x-reverse w-full">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`flex flex-col items-center justify-center w-12 h-12 rounded-full border transition-all cursor-pointer ${
                          isMuted ? 'bg-gray-200 border-gray-300 text-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        title="Mute"
                      >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>

                      <button
                        onClick={() => setIsCalling(false)}
                        className="flex flex-col items-center justify-center w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition-transform hover:scale-105 cursor-pointer"
                        title="End Call"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

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