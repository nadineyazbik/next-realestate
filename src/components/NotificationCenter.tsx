import React, { useEffect, useState } from 'react';
import { Bell, BellRing, Check, X, Building, ExternalLink } from 'lucide-react';
import { AppNotification, notificationService } from '../services/notificationService';
import { Language } from '../types';

interface NotificationCenterProps {
  lang?: Language;
  onSelectPropertyId?: (propertyId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  lang = 'en',
  onSelectPropertyId,
}) => {
  const isArabic = lang === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showToast, setShowToast] = useState<AppNotification | null>(null);

  const loadNotifications = () => {
    setNotifications(notificationService.getSavedNotifications());
    setUnreadCount(notificationService.getUnreadCount());
    setPermission(notificationService.getPermission());
  };

  useEffect(() => {
    loadNotifications();

    const handleAdded = (e: Event) => {
      const customEvent = e as CustomEvent<AppNotification>;
      setShowToast(customEvent.detail);
      loadNotifications();
      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        setShowToast(null);
      }, 5000);
    };

    const handleUpdated = () => {
      loadNotifications();
    };

    window.addEventListener('next_re_notification_added', handleAdded);
    window.addEventListener('next_re_notifications_updated', handleUpdated);

    return () => {
      window.removeEventListener('next_re_notification_added', handleAdded);
      window.removeEventListener('next_re_notifications_updated', handleUpdated);
    };
  }, []);

  const handleRequestPush = async () => {
    const res = await notificationService.requestPermission();
    setPermission(res);
  };

  const handleOpenDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      notificationService.markAllAsRead();
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header Notification Bell Icon */}
      <button
        type="button"
        onClick={handleOpenDropdown}
        className="relative w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
        title={isArabic ? 'الإشعارات' : 'Notifications'}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto w-4 h-4 bg-[#c4191a] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating In-App Toast When New Notification Arrives */}
      {showToast && (
        <div className="fixed top-18 right-4 rtl:right-auto rtl:left-4 z-50 max-w-xs w-full bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 p-3.5 transition-all duration-300 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#c4191a] flex items-center justify-center shrink-0">
              <BellRing className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-gray-900 truncate">{showToast.title}</h4>
              <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">{showToast.body}</p>
            </div>
            <button
              onClick={() => setShowToast(null)}
              className="text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-3.5 z-50 text-gray-800 text-start">
          <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-[#c4191a]" />
              <span className="text-xs font-bold text-gray-900">
                {isArabic ? 'إشعارات العقارات' : 'Property Alerts'}
              </span>
            </div>
            <span className="text-[10px] text-gray-400">
              {notifications.length} {isArabic ? 'إشعار' : 'alerts'}
            </span>
          </div>

          {/* Polite Permission Prompt if not enabled yet */}
          {permission !== 'granted' && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-red-50/70 border border-red-100 flex items-start justify-between gap-2">
              <div className="text-[11px] text-gray-700">
                <p className="font-semibold text-[#c4191a]">
                  {isArabic ? 'تفعيل الإشعارات الفورية' : 'Enable Instant Alerts'}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {isArabic
                    ? 'احصل على إشعار عند نشر عقارات جديدة مطابقة'
                    : 'Get notified when fresh listings are published'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRequestPush}
                className="px-2.5 py-1 text-[10px] font-bold bg-[#c4191a] text-white rounded-md hover:bg-red-700 shrink-0 cursor-pointer shadow-xs"
              >
                {isArabic ? 'تفعيل' : 'Allow'}
              </button>
            </div>
          )}

          {/* List of notifications */}
          <div className="mt-2.5 max-h-64 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-xs">
                {isArabic ? 'لا توجد إشعارات حالياً' : 'No new notifications'}
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.propertyId && onSelectPropertyId) {
                      onSelectPropertyId(notif.propertyId);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-2 rounded-lg border text-start transition-colors cursor-pointer ${
                    notif.read
                      ? 'bg-white border-gray-100 hover:bg-gray-50'
                      : 'bg-red-50/40 border-red-100/60 hover:bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Building className="w-3.5 h-3.5 text-[#c4191a] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-gray-900 leading-tight">
                        {notif.title}
                      </p>
                      <p className="text-[10px] text-gray-600 line-clamp-1 mt-0.5">{notif.body}</p>
                      <span className="text-[9px] text-gray-400 mt-1 block">
                        {new Date(notif.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
