'use client';

import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--primary': '#1976d2',
          '--secondary': '#dc004e',
          '--accent': '#00bcd4',
          '--background': '#ffffff',
          '--surface': '#f5f5f5',
          '--text-primary': '#000000',
          '--text-secondary': '#666666',
          '--border': '#e0e0e0',
          '--error': '#f44336',
          '--warning': '#ff9800',
          '--success': '#4caf50',
          '--info': '#2196f3',
          '--spacing-xs': '4px',
          '--spacing-sm': '8px',
          '--spacing-md': '16px',
          '--spacing-lg': '24px',
          '--spacing-xl': '32px',
        },
      },
    },
  },
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}