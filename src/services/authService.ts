export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  provider: 'google';
}

const USER_STORAGE_KEY = 'next_re_google_user';
const FAVORITES_STORAGE_KEY = 'next_re_user_favorites';

export const authService = {
  // Get stored Google user
  getUser(): GoogleUser | null {
    try {
      const data = localStorage.getItem(USER_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Save or clear user
  setUser(user: GoogleUser | null): void {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to update user session', e);
    }
  },

  // Simulate or execute single-click Google Sign-In
  loginWithGoogle(accountEmail: string = 'windowsnadine197@gmail.com', customName?: string): GoogleUser {
    const name = customName || accountEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    
    const googleUser: GoogleUser = {
      id: `google-${Date.now()}`,
      name: formattedName,
      email: accountEmail,
      picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}&backgroundColor=c4191a&textColor=ffffff`,
      provider: 'google',
    };

    this.setUser(googleUser);
    return googleUser;
  },

  logout(): void {
    this.setUser(null);
  },

  // Get favorites list (property IDs)
  getFavorites(): string[] {
    try {
      const data = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Check if a property is favorite
  isFavorite(propertyId: string): boolean {
    const list = this.getFavorites();
    return list.includes(propertyId);
  },

  // Toggle favorite status
  toggleFavorite(propertyId: string): { isFavorite: boolean; list: string[] } {
    let list = this.getFavorites();
    const exists = list.includes(propertyId);

    if (exists) {
      list = list.filter((id) => id !== propertyId);
    } else {
      list = [propertyId, ...list];
    }

    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to update favorites', e);
    }

    return {
      isFavorite: !exists,
      list,
    };
  },
};
