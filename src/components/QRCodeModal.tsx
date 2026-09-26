import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Download, Share2, Smartphone, ExternalLink, Printer } from 'lucide-react';
import { Language } from '../types';
import { BrandLogo } from './BrandLogo';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  lang = 'en',
}) => {
  const isArabic = lang === 'ar';
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [siteUrl, setSiteUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.origin || window.location.href;
      setSiteUrl(url);

      QRCode.toDataURL(
        url,
        {
          width: 380,
          margin: 2,
          color: {
            dark: '#18191a',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        },
        (err, dataUrl) => {
          if (!err && dataUrl) {
            setQrDataUrl(dataUrl);
          }
        }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && siteUrl) {
        await navigator.clipboard.writeText(siteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      console.error('Failed to copy link', e);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Next_Real_Estate_QR_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Next Real Estate',
          text: isArabic
            ? 'تفضل بزيارة موقع Next Real Estate للعقارات الفاخرة في لبنان'
            : 'Explore premium properties in Lebanon with Next Real Estate',
          url: siteUrl,
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Next Real Estate - QR Code</title>
          <style>
            body {
              font-family: system-ui, sans-serif;
              text-align: center;
              padding: 40px;
              color: #18191a;
            }
            .card {
              max-width: 400px;
              margin: 0 auto;
              border: 2px solid #c4191a;
              border-radius: 16px;
              padding: 24px;
            }
            h1 { margin: 0 0 8px; color: #18191a; font-size: 24px; }
            h1 span { color: #c4191a; }
            p { color: #666; font-size: 14px; margin-bottom: 20px; }
            img { width: 280px; height: 280px; display: block; margin: 0 auto; }
            .url { font-family: monospace; font-size: 13px; color: #333; margin-top: 16px; word-break: break-all; }
            .phone { margin-top: 12px; font-weight: bold; color: #c4191a; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Next <span>Real Estate</span></h1>
            <p>${isArabic ? 'امسح الرمز لزيارة موقعنا وتصفح أحدث العقارات' : 'Scan the code to visit our website and browse listings'}</p>
            <img src="${qrDataUrl}" alt="QR Code" />
            <div class="url">${siteUrl}</div>
            <div class="phone">+961 76 743 414</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      dir={isArabic ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2">
            <BrandLogo size={32} textColor="#1f2124" lang={lang} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center text-center">
          <span className="text-xs uppercase tracking-wider font-bold text-[#c4191a] mb-1">
            {isArabic ? 'رمز الاستجابة السريعة (QR Code)' : 'Website QR Code'}
          </span>
          <h3
            className="text-base sm:text-lg font-bold text-gray-900 mb-1"
            style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Prompt', sans-serif" }}
          >
            {isArabic ? 'شارك أو اطبع رابط الموقع' : 'Share or Print Website Link'}
          </h3>
          <p className="text-xs text-gray-500 mb-5 max-w-[260px] leading-relaxed">
            {isArabic
              ? 'امسح الرمز بكاميرا الهاتف للوصول السريع إلى موقع Next Real Estate وتصفح العقارات.'
              : 'Scan with your mobile camera for instant access to our property listings and services.'}
          </p>

          {/* QR Code Container */}
          <div className="relative p-3.5 bg-white rounded-2xl border-2 border-[#c4191a]/20 shadow-md mb-4 flex items-center justify-center group hover:border-[#c4191a] transition-all">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Next Real Estate QR Code"
                className="w-52 h-52 object-contain rounded-lg"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center bg-gray-100 rounded-lg">
                <span className="w-6 h-6 border-2 border-[#c4191a] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* URL Display with Copy Button */}
          <div className="w-full flex items-center gap-1.5 bg-gray-100 rounded-xl p-1.5 border border-gray-200 mb-4">
            <span className="text-[11px] font-mono text-gray-700 truncate px-2 flex-1 text-start" dir="ltr">
              {siteUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>{isArabic ? 'تم النسخ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-600" />
                  <span>{isArabic ? 'نسخ' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>

          {/* Action Buttons Grid */}
          <div className="w-full grid grid-cols-2 gap-2 text-xs">
            {/* Download PNG Button */}
            <button
              type="button"
              onClick={handleDownloadQR}
              className="py-2.5 px-3 rounded-xl bg-[#c4191a] hover:bg-[#a51516] text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isArabic ? 'تحميل كصورة' : 'Save Image'}</span>
            </button>

            {/* Print / Share Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isArabic ? 'طباعة' : 'Print'}</span>
            </button>
          </div>

          {/* WhatsApp Quick Share */}
          <div className="w-full mt-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                (isArabic ? 'موقع Next Real Estate للعقارات في لبنان: ' : 'Next Real Estate Lebanon: ') + siteUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl border border-emerald-500/40 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold flex items-center justify-center gap-2 text-xs transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isArabic ? 'مشاركة عبر واتساب' : 'Share via WhatsApp'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
