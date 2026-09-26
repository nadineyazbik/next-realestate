import { Property } from '../types';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  propertyId?: string;
  read: boolean;
  type: 'new_property' | 'price_drop' | 'system';
}

const STORAGE_KEY = 'next_re_notifications';
const PERMISSION_ASKED_KEY = 'next_re_push_asked';

export const notificationService = {
  // Check if browser supports notifications
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  // Get current permission status
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  },

  // Request push notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem(PERMISSION_ASKED_KEY, 'true');
      return permission;
    } catch {
      return 'denied';
    }
  },

  // Send polite notification for new property
  async notifyNewProperty(property: Property, lang: 'en' | 'ar' = 'en'): Promise<boolean> {
    const isAr = lang === 'ar';
    const title = isAr
      ? `عقار جديد: ${property.titleAr}`
      : `New Listing: ${property.title}`;
    
    const formattedPrice = new Intl.NumberFormat('en-US').format(property.price);
    const body = isAr
      ? `${property.typeAr} في ${property.locationAr} - USD ${formattedPrice}`
      : `${property.type} in ${property.location} - USD ${formattedPrice}`;

    // Store in-app notification record
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      body,
      timestamp: Date.now(),
      propertyId: property.id,
      read: false,
      type: 'new_property',
    };

    this.saveNotification(newNotif);

    // If permission granted, trigger system / service worker push notification
    if (this.getPermission() === 'granted') {
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          if (reg && 'showNotification' in reg) {
            await reg.showNotification(title, {
              body,
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
              tag: `property-${property.id}`,
              data: { url: `/?property=${property.id}` },
            });
            return true;
          }
        }
        // Fallback to browser Notification API
        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
        });
        return true;
      } catch (err) {
        console.warn('Push notification delivery failed:', err);
      }
    }

    return false;
  },

  // In-app notifications persistence
  getSavedNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveNotification(notification: AppNotification) {
    try {
      const existing = this.getSavedNotifications();
      const updated = [notification, ...existing].slice(0, 20); // keep last 20
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('next_re_notification_added', { detail: notification }));
    } catch (e) {
      console.error(e);
    }
  },

  markAllAsRead() {
    try {
      const existing = this.getSavedNotifications();
      const updated = existing.map((n) => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('next_re_notifications_updated'));
    } catch (e) {
      console.error(e);
    }
  },

  getUnreadCount(): number {
    return this.getSavedNotifications().filter((n) => !n.read).length;
  },
};
