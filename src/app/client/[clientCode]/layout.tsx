'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { useParams } from 'next/navigation';

// Client configuration interface
interface ClientConfig {
  clientCode: string;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  customDomain?: string;
  features: string[];
  subscription: {
    plan: string;
    status: 'active' | 'inactive' | 'trial';
  };
}

// Client context
const ClientContext = createContext<ClientConfig | null>(null);

export const useClient = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};

// Mock client configurations - in production, this would come from your database
const mockClientConfigs: Record<string, ClientConfig> = {
  'acmecorp': {
    clientCode: 'acmecorp',
    companyName: 'ACME Corporation',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    logo: 'https://via.placeholder.com/150x50/1976d2/white?text=ACME',
    features: ['inventory', 'assignments', 'reports', 'mobile'],
    subscription: { plan: 'Professional', status: 'active' }
  },
  'techstart': {
    clientCode: 'techstart',
    companyName: 'TechStart Solutions',
    primaryColor: '#9c27b0',
    secondaryColor: '#ff9800',
    logo: 'https://via.placeholder.com/150x50/9c27b0/white?text=TechStart',
    features: ['inventory', 'assignments', 'devices', 'api'],
    subscription: { plan: 'Enterprise', status: 'active' }
  },
  'greentech': {
    clientCode: 'greentech',
    companyName: 'GreenTech Industries',
    primaryColor: '#4caf50',
    secondaryColor: '#ff5722',
    logo: 'https://via.placeholder.com/150x50/4caf50/white?text=GreenTech',
    features: ['inventory', 'maintenance', 'reports'],
    subscription: { plan: 'Starter', status: 'active' }
  }
};

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const params = useParams();
  const clientCode = params?.clientCode as string;
  const [clientConfig, setClientConfig] = useState<ClientConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClientConfig = async () => {
      try {
        // In production, this would be an API call to fetch client config
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        const config = mockClientConfigs[clientCode.toLowerCase()];
        if (!config) {
          setError('Client not found');
          return;
        }

        setClientConfig(config);
      } catch (err) {
        setError('Failed to load client configuration');
      } finally {
        setLoading(false);
      }
    };

    if (clientCode) {
      loadClientConfig();
    }
  }, [clientCode]);

  // Create custom theme based on client configuration
  const theme = createTheme({
    palette: {
      primary: {
        main: clientConfig?.primaryColor || '#1976d2',
      },
      secondary: {
        main: clientConfig?.secondaryColor || '#dc004e',
      },
    },
    typography: {
      h1: {
        fontWeight: 600,
      },
      h2: {
        fontWeight: 600,
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: clientConfig?.primaryColor || '#1976d2',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
        },
      },
    },
  });

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="h6" color="text.secondary">
          Loading your portal...
        </Typography>
      </Box>
    );
  }

  if (error || !clientConfig) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          p: 3,
        }}
      >
        <Typography variant="h4" color="error" gutterBottom>
          Portal Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          {error || 'The requested client portal could not be found.'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Client Code: {clientCode}
        </Typography>
      </Box>
    );
  }

  return (
    <ClientContext.Provider value={clientConfig}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          {children}
        </Box>
      </ThemeProvider>
    </ClientContext.Provider>
  );
}