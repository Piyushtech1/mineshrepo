import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, SettingsResponse } from '../services/api';
import { Profile, SiteSettings, NavigationItem, SocialLink, AdminUser } from '../server/db/schema';

interface PortfolioContextType {
  settings: SiteSettings | null;
  profile: Profile | null;
  navigation: NavigationItem[];
  socialLinks: SocialLink[];
  admin: AdminUser | null;
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  refreshPublicData: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
  setAdminUser: (admin: AdminUser | null) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPublicData = useCallback(async () => {
    try {
      const [settingsRes, profileRes] = await Promise.all([
        api.getSettings().catch(() => null),
        api.getProfile().catch(() => null),
      ]);

      if (settingsRes) {
        setSettings(settingsRes.settings);
        setNavigation(settingsRes.navigation);
        setSocialLinks(settingsRes.socialLinks);
      }

      if (profileRes) {
        setProfile(profileRes.profile);
      }
    } catch (err) {
      console.error('Error fetching public portfolio data:', err);
    }
  }, []);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const res = await api.getCurrentAdmin();
      if (res && res.admin) {
        setAdmin(res.admin);
        return true;
      }
      setAdmin(null);
      return false;
    } catch {
      setAdmin(null);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setAdmin(null);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([refreshPublicData(), checkAuth()]);
      setIsLoading(false);
    };
    init();
  }, [refreshPublicData, checkAuth]);

  return (
    <PortfolioContext.Provider
      value={{
        settings,
        profile,
        navigation,
        socialLinks,
        admin,
        isAdminAuthenticated: Boolean(admin),
        isLoading,
        refreshPublicData,
        checkAuth,
        logout,
        setAdminUser: setAdmin,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
