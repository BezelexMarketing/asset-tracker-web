import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Action types
const THEME_ACTIONS = {
  SET_THEME_MODE: 'SET_THEME_MODE',
  SET_BRAND_CONFIG: 'SET_BRAND_CONFIG',
  SET_CUSTOM_COLORS: 'SET_CUSTOM_COLORS',
  SET_TYPOGRAPHY: 'SET_TYPOGRAPHY',
  RESET_TO_DEFAULT: 'RESET_TO_DEFAULT'
};

// Default brand configuration
const defaultBrandConfig = {
  companyName: 'Asset Tracker Pro',
  logo: null,
  primaryColor: '#1976d2',
  secondaryColor: '#dc004e',
  accentColor: '#00bcd4',
  backgroundColor: '#ffffff',
  surfaceColor: '#f5f5f5',
  textColor: '#000000',
  secondaryTextColor: '#666666',
  errorColor: '#f44336',
  warningColor: '#ff9800',
  successColor: '#4caf50',
  infoColor: '#2196f3'
};

// Default typography
const defaultTypography = {
  fontFamily: 'System',
  headlineLarge: {
    fontSize: 32,
    fontWeight: '400',
    lineHeight: 40
  },
  headlineMedium: {
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 36
  },
  headlineSmall: {
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 32
  },
  titleLarge: {
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 28
  },
  titleMedium: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24
  },
  titleSmall: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16
  }
};

// Initial state
const initialState = {
  themeMode: 'system', // 'light', 'dark', 'system'
  isDark: false,
  brandConfig: defaultBrandConfig,
  typography: defaultTypography,
  customColors: {},
  isLoading: true
};

// Reducer
function themeReducer(state, action) {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME_MODE:
      return {
        ...state,
        themeMode: action.payload.mode,
        isDark: action.payload.isDark
      };

    case THEME_ACTIONS.SET_BRAND_CONFIG:
      return {
        ...state,
        brandConfig: {
          ...state.brandConfig,
          ...action.payload
        }
      };

    case THEME_ACTIONS.SET_CUSTOM_COLORS:
      return {
        ...state,
        customColors: {
          ...state.customColors,
          ...action.payload
        }
      };

    case THEME_ACTIONS.SET_TYPOGRAPHY:
      return {
        ...state,
        typography: {
          ...state.typography,
          ...action.payload
        }
      };

    case THEME_ACTIONS.RESET_TO_DEFAULT:
      return {
        ...state,
        brandConfig: defaultBrandConfig,
        typography: defaultTypography,
        customColors: {}
      };

    default:
      return state;
  }
}

// Create context
const ThemeContext = createContext();

// Storage keys
const STORAGE_KEYS = {
  THEME_MODE: '@theme_mode',
  BRAND_CONFIG: '@brand_config',
  TYPOGRAPHY: '@typography',
  CUSTOM_COLORS: '@custom_colors'
};

// Provider component
export function ThemeProvider({ children }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  useEffect(() => {
    initializeTheme();
    setupSystemThemeListener();
  }, []);

  // Initialize theme from storage
  const initializeTheme = async () => {
    try {
      // Load theme mode
      const savedThemeMode = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
      const themeMode = savedThemeMode || 'system';

      // Load brand config
      const savedBrandConfig = await AsyncStorage.getItem(STORAGE_KEYS.BRAND_CONFIG);
      if (savedBrandConfig) {
        const brandConfig = JSON.parse(savedBrandConfig);
        dispatch({ type: THEME_ACTIONS.SET_BRAND_CONFIG, payload: brandConfig });
      }

      // Load typography
      const savedTypography = await AsyncStorage.getItem(STORAGE_KEYS.TYPOGRAPHY);
      if (savedTypography) {
        const typography = JSON.parse(savedTypography);
        dispatch({ type: THEME_ACTIONS.SET_TYPOGRAPHY, payload: typography });
      }

      // Load custom colors
      const savedCustomColors = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_COLORS);
      if (savedCustomColors) {
        const customColors = JSON.parse(savedCustomColors);
        dispatch({ type: THEME_ACTIONS.SET_CUSTOM_COLORS, payload: customColors });
      }

      // Set initial theme mode
      const isDark = themeMode === 'system' 
        ? Appearance.getColorScheme() === 'dark'
        : themeMode === 'dark';

      dispatch({
        type: THEME_ACTIONS.SET_THEME_MODE,
        payload: { mode: themeMode, isDark }
      });

      state.isLoading = false;
    } catch (error) {
      console.error('Failed to initialize theme:', error);
      state.isLoading = false;
    }
  };

  // Setup system theme change listener
  const setupSystemThemeListener = () => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (state.themeMode === 'system') {
        dispatch({
          type: THEME_ACTIONS.SET_THEME_MODE,
          payload: { mode: 'system', isDark: colorScheme === 'dark' }
        });
      }
    });

    return () => subscription?.remove();
  };

  // Set theme mode
  const setThemeMode = async (mode) => {
    try {
      const isDark = mode === 'system' 
        ? Appearance.getColorScheme() === 'dark'
        : mode === 'dark';

      dispatch({
        type: THEME_ACTIONS.SET_THEME_MODE,
        payload: { mode, isDark }
      });

      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    } catch (error) {
      console.error('Failed to set theme mode:', error);
    }
  };

  // Update brand configuration
  const updateBrandConfig = async (config) => {
    try {
      dispatch({ type: THEME_ACTIONS.SET_BRAND_CONFIG, payload: config });
      
      const updatedConfig = { ...state.brandConfig, ...config };
      await AsyncStorage.setItem(STORAGE_KEYS.BRAND_CONFIG, JSON.stringify(updatedConfig));
    } catch (error) {
      console.error('Failed to update brand config:', error);
    }
  };

  // Update typography
  const updateTypography = async (typography) => {
    try {
      dispatch({ type: THEME_ACTIONS.SET_TYPOGRAPHY, payload: typography });
      
      const updatedTypography = { ...state.typography, ...typography };
      await AsyncStorage.setItem(STORAGE_KEYS.TYPOGRAPHY, JSON.stringify(updatedTypography));
    } catch (error) {
      console.error('Failed to update typography:', error);
    }
  };

  // Update custom colors
  const updateCustomColors = async (colors) => {
    try {
      dispatch({ type: THEME_ACTIONS.SET_CUSTOM_COLORS, payload: colors });
      
      const updatedColors = { ...state.customColors, ...colors };
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_COLORS, JSON.stringify(updatedColors));
    } catch (error) {
      console.error('Failed to update custom colors:', error);
    }
  };

  // Reset to default theme
  const resetToDefault = async () => {
    try {
      dispatch({ type: THEME_ACTIONS.RESET_TO_DEFAULT });
      
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.BRAND_CONFIG,
        STORAGE_KEYS.TYPOGRAPHY,
        STORAGE_KEYS.CUSTOM_COLORS
      ]);
    } catch (error) {
      console.error('Failed to reset theme:', error);
    }
  };

  // Generate Material Design 3 theme
  const generateMD3Theme = () => {
    const baseTheme = state.isDark ? MD3DarkTheme : MD3LightTheme;
    
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: state.brandConfig.primaryColor,
        secondary: state.brandConfig.secondaryColor,
        tertiary: state.brandConfig.accentColor,
        surface: state.brandConfig.surfaceColor,
        background: state.brandConfig.backgroundColor,
        error: state.brandConfig.errorColor,
        onPrimary: state.isDark ? '#000000' : '#ffffff',
        onSecondary: state.isDark ? '#000000' : '#ffffff',
        onSurface: state.brandConfig.textColor,
        onBackground: state.brandConfig.textColor,
        ...state.customColors
      },
      fonts: {
        ...baseTheme.fonts,
        default: {
          fontFamily: state.typography.fontFamily
        }
      }
    };
  };

  // Get current theme colors
  const getThemeColors = () => {
    return {
      primary: state.brandConfig.primaryColor,
      secondary: state.brandConfig.secondaryColor,
      accent: state.brandConfig.accentColor,
      background: state.brandConfig.backgroundColor,
      surface: state.brandConfig.surfaceColor,
      text: state.brandConfig.textColor,
      textSecondary: state.brandConfig.secondaryTextColor,
      error: state.brandConfig.errorColor,
      warning: state.brandConfig.warningColor,
      success: state.brandConfig.successColor,
      info: state.brandConfig.infoColor,
      ...state.customColors
    };
  };

  // Get typography styles
  const getTypographyStyles = () => {
    return state.typography;
  };

  // Load brand configuration from server
  const loadBrandConfigFromServer = async (tenantId) => {
    try {
      // This would typically fetch from your API
      const response = await fetch(`/api/tenants/${tenantId}/branding`);
      if (response.ok) {
        const brandConfig = await response.json();
        await updateBrandConfig(brandConfig);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load brand config from server:', error);
      return false;
    }
  };

  // Export theme configuration
  const exportThemeConfig = () => {
    return {
      themeMode: state.themeMode,
      brandConfig: state.brandConfig,
      typography: state.typography,
      customColors: state.customColors
    };
  };

  // Import theme configuration
  const importThemeConfig = async (config) => {
    try {
      if (config.brandConfig) {
        await updateBrandConfig(config.brandConfig);
      }
      if (config.typography) {
        await updateTypography(config.typography);
      }
      if (config.customColors) {
        await updateCustomColors(config.customColors);
      }
      if (config.themeMode) {
        await setThemeMode(config.themeMode);
      }
      return true;
    } catch (error) {
      console.error('Failed to import theme config:', error);
      return false;
    }
  };

  const contextValue = {
    // State
    ...state,
    
    // Theme
    theme: generateMD3Theme(),
    colors: getThemeColors(),
    typography: getTypographyStyles(),
    
    // Actions
    setThemeMode,
    updateBrandConfig,
    updateTypography,
    updateCustomColors,
    resetToDefault,
    loadBrandConfigFromServer,
    exportThemeConfig,
    importThemeConfig
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;