'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  backgroundColor: string;
  surfaceColor?: string;
  textColor: string;
  companyName: string;
  logo?: string;
  favicon?: string;
  customCSS: string;
  theme: 'light' | 'dark' | 'auto';
  fontFamily?: string;
  borderRadius?: number;
  enableCustomization: boolean;
}

interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  branding: BrandingConfig;
}

interface TenantThemeContextType {
  tenant: TenantConfig | null;
  branding: BrandingConfig;
  updateBranding: (newBranding: Partial<BrandingConfig>) => void;
  resetBranding: () => void;
}

const defaultBranding: BrandingConfig = {
  primaryColor: '#1976d2',
  secondaryColor: '#dc004e',
  accentColor: '#00bcd4',
  backgroundColor: '#ffffff',
  surfaceColor: '#f5f5f5',
  textColor: '#000000',
  companyName: 'Asset Tracker Pro',
  customCSS: '',
  theme: 'light',
  fontFamily: 'Roboto',
  borderRadius: 4,
  enableCustomization: true
};

const TenantThemeContext = createContext<TenantThemeContextType>({
  tenant: null,
  branding: defaultBranding,
  updateBranding: () => {},
  resetBranding: () => {}
});

export const useTenantTheme = () => {
  const context = useContext(TenantThemeContext);
  if (!context) {
    throw new Error('useTenantTheme must be used within a TenantThemeProvider');
  }
  return context;
};

interface TenantThemeProviderProps {
  children: React.ReactNode;
  tenantId?: string;
  initialBranding?: Partial<BrandingConfig>;
}

export default function TenantThemeProvider({ 
  children, 
  tenantId,
  initialBranding 
}: TenantThemeProviderProps) {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [branding, setBranding] = useState<BrandingConfig>({
    ...defaultBranding,
    ...initialBranding
  });

  // Load tenant configuration
  useEffect(() => {
    if (tenantId) {
      // In a real app, this would fetch from an API
      const mockTenant: TenantConfig = {
        id: tenantId,
        name: 'Demo Client',
        domain: `${tenantId}.assettracker.com`,
        branding: {
          ...defaultBranding,
          ...initialBranding
        }
      };
      setTenant(mockTenant);
      setBranding(mockTenant.branding);
    }
  }, [tenantId, initialBranding]);

  // Create dynamic theme based on branding
  const theme = createTheme({
    palette: {
      mode: branding.theme === 'auto' ? 'light' : branding.theme,
      primary: {
        main: branding.primaryColor,
      },
      secondary: {
        main: branding.secondaryColor,
      },
      background: {
        default: branding.backgroundColor,
        paper: branding.surfaceColor || '#ffffff',
      },
      text: {
        primary: branding.textColor,
      },
    },
    typography: {
      fontFamily: branding.fontFamily || 'Roboto',
    },
    shape: {
      borderRadius: branding.borderRadius || 4,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: branding.customCSS || '',
      },
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
            borderRadius: branding.borderRadius || 4,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: branding.borderRadius || 4,
          },
        },
      },
    },
  });

  const updateBranding = (newBranding: Partial<BrandingConfig>) => {
    setBranding(prev => ({ ...prev, ...newBranding }));
    
    // Update document title and favicon
    if (newBranding.companyName) {
      document.title = `${newBranding.companyName} - Asset Tracker`;
    }
    
    if (newBranding.favicon) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = newBranding.favicon;
      }
    }
  };

  const resetBranding = () => {
    setBranding(defaultBranding);
    document.title = 'Asset Tracker Pro';
  };

  // Apply custom CSS
  useEffect(() => {
    if (branding.customCSS) {
      const styleElement = document.createElement('style');
      styleElement.id = 'tenant-custom-css';
      styleElement.textContent = branding.customCSS;
      
      // Remove existing custom CSS
      const existingStyle = document.getElementById('tenant-custom-css');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(styleElement);
      
      return () => {
        styleElement.remove();
      };
    }
  }, [branding.customCSS]);

  // Update document title
  useEffect(() => {
    document.title = `${branding.companyName} - Asset Tracker`;
  }, [branding.companyName]);

  const contextValue: TenantThemeContextType = {
    tenant,
    branding,
    updateBranding,
    resetBranding
  };

  return (
    <TenantThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </TenantThemeContext.Provider>
  );
}

// Hook for getting tenant-specific branding in components
export const useBranding = () => {
  const { branding } = useTenantTheme();
  return branding;
};

// Hook for updating branding (admin use)
export const useBrandingControls = () => {
  const { updateBranding, resetBranding } = useTenantTheme();
  return { updateBranding, resetBranding };
};

// Utility function to generate CSS variables from branding
export const generateCSSVariables = (branding: BrandingConfig): string => {
  return `
    :root {
      --primary-color: ${branding.primaryColor};
      --secondary-color: ${branding.secondaryColor};
      --accent-color: ${branding.accentColor || '#00bcd4'};
      --background-color: ${branding.backgroundColor};
      --surface-color: ${branding.surfaceColor || '#f5f5f5'};
      --text-color: ${branding.textColor};
      --font-family: ${branding.fontFamily || 'Roboto'};
      --border-radius: ${branding.borderRadius || 4}px;
    }
  `;
};

// Component for previewing branding changes
export const BrandingPreview: React.FC<{ branding: BrandingConfig; children: React.ReactNode }> = ({ 
  branding, 
  children 
}) => {
  const previewTheme = createTheme({
    palette: {
      mode: branding.theme === 'auto' ? 'light' : branding.theme,
      primary: {
        main: branding.primaryColor,
      },
      secondary: {
        main: branding.secondaryColor,
      },
      background: {
        default: branding.backgroundColor,
        paper: branding.surfaceColor || '#ffffff',
      },
    },
    typography: {
      fontFamily: branding.fontFamily || 'Roboto',
    },
    shape: {
      borderRadius: branding.borderRadius || 4,
    },
  });

  return (
    <ThemeProvider theme={previewTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};