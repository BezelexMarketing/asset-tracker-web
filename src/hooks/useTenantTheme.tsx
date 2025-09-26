import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { createTheme, Theme } from '@mui/material/styles';

interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  companyName: string;
  theme: 'light' | 'dark' | 'auto';
  customCSS?: string;
  enableCustomization: boolean;
}

interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  branding: TenantBranding;
  features: {
    inventory: boolean;
    assignments: boolean;
    maintenance: boolean;
    reports: boolean;
    userManagement: boolean;
    apiAccess: boolean;
  };
}

interface TenantThemeContextType {
  tenant: TenantConfig | null;
  theme: Theme;
  updateBranding: (branding: Partial<TenantBranding>) => void;
  setTenant: (tenant: TenantConfig) => void;
  resetToDefault: () => void;
}

const TenantThemeContext = createContext<TenantThemeContextType | undefined>(undefined);

const defaultBranding: TenantBranding = {
  primaryColor: '#1976d2',
  secondaryColor: '#dc004e',
  companyName: 'Asset Tracker Pro',
  theme: 'light',
  enableCustomization: true
};

const createTenantTheme = (branding: TenantBranding): Theme => {
  const isDark = branding.theme === 'dark' || 
    (branding.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: branding.primaryColor,
      },
      secondary: {
        main: branding.secondaryColor,
      },
    },
    typography: {
      h1: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      h2: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      h3: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      h4: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      h5: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      h6: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: branding.primaryColor,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
        },
      },
    },
  });
};

export const TenantThemeProvider = ({ children }: { children: ReactNode }) => {
  const [tenant, setTenantState] = useState<TenantConfig | null>(null);
  const [theme, setTheme] = useState<Theme>(createTenantTheme(defaultBranding));

  const updateBranding = (newBranding: Partial<TenantBranding>) => {
    if (!tenant) return;

    const updatedBranding = { ...tenant.branding, ...newBranding };
    const updatedTenant = { ...tenant, branding: updatedBranding };
    
    setTenantState(updatedTenant);
    setTheme(createTenantTheme(updatedBranding));

    // Apply custom CSS if provided
    if (updatedBranding.customCSS) {
      applyCustomCSS(updatedBranding.customCSS);
    }

    // Store in localStorage for persistence
    localStorage.setItem('tenantConfig', JSON.stringify(updatedTenant));
  };

  const setTenant = (newTenant: TenantConfig) => {
    setTenantState(newTenant);
    setTheme(createTenantTheme(newTenant.branding));

    // Apply custom CSS if provided
    if (newTenant.branding.customCSS) {
      applyCustomCSS(newTenant.branding.customCSS);
    }

    // Store in localStorage for persistence
    localStorage.setItem('tenantConfig', JSON.stringify(newTenant));
  };

  const resetToDefault = () => {
    setTenantState(null);
    setTheme(createTenantTheme(defaultBranding));
    removeCustomCSS();
    localStorage.removeItem('tenantConfig');
  };

  const applyCustomCSS = (css: string) => {
    // Remove existing custom CSS
    removeCustomCSS();

    // Create and append new style element
    const styleElement = document.createElement('style');
    styleElement.id = 'tenant-custom-css';
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
  };

  const removeCustomCSS = () => {
    const existingStyle = document.getElementById('tenant-custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }
  };

  // Load tenant config from localStorage on mount
  useEffect(() => {
    const storedConfig = localStorage.getItem('tenantConfig');
    if (storedConfig) {
      try {
        const parsedConfig = JSON.parse(storedConfig);
        setTenant(parsedConfig);
      } catch (error) {
        console.error('Failed to parse stored tenant config:', error);
      }
    }
  }, []);

  // Listen for system theme changes when theme is set to 'auto'
  useEffect(() => {
    if (tenant?.branding.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        setTheme(createTenantTheme(tenant.branding));
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [tenant?.branding.theme]);

  const contextValue: TenantThemeContextType = {
    tenant,
    theme,
    updateBranding,
    setTenant,
    resetToDefault,
  };

  return (
    <TenantThemeContext.Provider value={contextValue}>
      {children}
    </TenantThemeContext.Provider>
  );
};

export const useTenantTheme = (): TenantThemeContextType => {
  const context = useContext(TenantThemeContext);
  if (context === undefined) {
    throw new Error('useTenantTheme must be used within a TenantThemeProvider');
  }
  return context;
};

// Utility hook for checking feature availability
export const useFeatureAccess = () => {
  const { tenant } = useTenantTheme();

  const hasFeature = (feature: keyof TenantConfig['features']): boolean => {
    return tenant?.features[feature] ?? true; // Default to true if no tenant config
  };

  const getEnabledFeatures = (): string[] => {
    if (!tenant) return [];
    return Object.entries(tenant.features)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature);
  };

  return {
    hasFeature,
    getEnabledFeatures,
    features: tenant?.features,
  };
};

// Utility hook for branding information
export const useBranding = () => {
  const { tenant } = useTenantTheme();

  return {
    companyName: tenant?.branding.companyName ?? 'Asset Tracker Pro',
    logo: tenant?.branding.logo,
    primaryColor: tenant?.branding.primaryColor ?? '#1976d2',
    secondaryColor: tenant?.branding.secondaryColor ?? '#dc004e',
    theme: tenant?.branding.theme ?? 'light',
    customCSS: tenant?.branding.customCSS,
    enableCustomization: tenant?.branding.enableCustomization ?? true,
  };
};

export type { TenantConfig, TenantBranding };