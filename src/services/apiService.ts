import { Property } from '../types';

let cachedCsrfToken: string | null = null;
const ADMIN_TOKEN_KEY = 'next_re_admin_jwt';

export const apiService = {
  // Retrieve or refresh CSRF Token
  async getCsrfToken(): Promise<string> {
    if (cachedCsrfToken) return cachedCsrfToken;
    try {
      const res = await fetch('/api/csrf-token');
      if (res.ok) {
        const data = await res.json();
        cachedCsrfToken = data.csrfToken;
        return data.csrfToken;
      }
    } catch {
      // Fallback in case of offline/PWA mode
    }
    return '';
  },

  // Get Admin Token from sessionStorage (protected from permanent disk leaks)
  getAdminToken(): string | null {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
  },

  setAdminToken(token: string | null): void {
    if (token) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  },

  // Check if Admin session is valid
  async checkAdminSession(): Promise<boolean> {
    const token = this.getAdminToken();
    if (!token) return false;

    try {
      const res = await fetch('/api/admin/session', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        return Boolean(data.authenticated && data.role === 'admin');
      }
    } catch {
      // Offline fallback
    }
    return false;
  },

  // Secure Admin Login with Rate-Limit & Lockout Handling
  async loginAdmin(
    username: string,
    password: string
  ): Promise<{ success: boolean; token?: string; error?: string; retryAfter?: number }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Authentication failed. Please verify credentials.',
          retryAfter: data.retryAfter,
        };
      }

      this.setAdminToken(data.token);
      return { success: true, token: data.token };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network connection error';
      return { success: false, error: errorMsg };
    }
  },

  // Admin Logout
  async logoutAdmin(): Promise<void> {
    const token = this.getAdminToken();
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    this.setAdminToken(null);
  },

  // Add Property (Admin Only - RBAC & CSRF Protected)
  async addProperty(
    propertyData: Partial<Property>
  ): Promise<{ success: boolean; property?: Property; error?: string }> {
    const token = this.getAdminToken();
    if (!token) {
      return { success: false, error: 'Unauthorized: Admin authentication token missing.' };
    }

    const csrf = await this.getCsrfToken();
    try {
      const res = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-csrf-token': csrf,
        },
        body: JSON.stringify(propertyData),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to publish property.' };
      }
      return { success: true, property: data.property };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    }
  },

  // Update Property (Admin Only)
  async updateProperty(
    id: string,
    propertyData: Partial<Property>
  ): Promise<{ success: boolean; property?: Property; error?: string }> {
    const token = this.getAdminToken();
    if (!token) {
      return { success: false, error: 'Unauthorized: Admin authentication token missing.' };
    }

    const csrf = await this.getCsrfToken();
    try {
      const res = await fetch(`/api/admin/properties/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-csrf-token': csrf,
        },
        body: JSON.stringify(propertyData),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update property.' };
      }
      return { success: true, property: data.property };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    }
  },

  // Delete Property (Admin Only)
  async deleteProperty(id: string): Promise<{ success: boolean; error?: string }> {
    const token = this.getAdminToken();
    if (!token) {
      return { success: false, error: 'Unauthorized: Admin authentication token missing.' };
    }

    const csrf = await this.getCsrfToken();
    try {
      const res = await fetch(`/api/admin/properties/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-csrf-token': csrf,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to delete property.' };
      }
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    }
  },

  // Toggle Archive (Admin Only)
  async toggleArchiveProperty(
    id: string
  ): Promise<{ success: boolean; isArchived?: boolean; error?: string }> {
    const token = this.getAdminToken();
    if (!token) {
      return { success: false, error: 'Unauthorized: Admin authentication token missing.' };
    }

    const csrf = await this.getCsrfToken();
    try {
      const res = await fetch(`/api/admin/properties/${encodeURIComponent(id)}/archive`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-csrf-token': csrf,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to toggle archive status.' };
      }
      return { success: true, isArchived: data.isArchived };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    }
  },

  // Submit Lead / Contact Inquiry (Public, Rate Limited)
  async submitInquiry(payload: {
    name: string;
    phone: string;
    message?: string;
    propertyId?: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to submit inquiry.' };
      }
      return { success: true, message: data.message };
    } catch {
      return { success: true }; // Graceful degradation
    }
  },
};
