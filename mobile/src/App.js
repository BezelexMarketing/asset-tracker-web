import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  Alert,
  Platform,
  PermissionsAndroid,
  AppState
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import SplashScreen from 'react-native-splash-screen';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

// Navigation
import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';

// Context providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { NFCProvider } from './context/NFCContext';
import { OfflineProvider } from './context/OfflineContext';
import { ThemeProvider } from './context/ThemeContext';

// Services
import { initializeDatabase } from './services/DatabaseService';
import { syncOfflineData } from './services/SyncService';

// Theme
import { lightTheme, darkTheme } from './theme/theme';

// Components
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';

function AppContent() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    initializeApp();
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
      NfcManager.stop();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await initializeDatabase();
      
      // Initialize NFC
      await initializeNFC();
      
      // Request permissions
      await requestPermissions();
      
      // Hide splash screen
      SplashScreen.hide();
      
      setIsInitialized(true);
    } catch (error) {
      console.error('App initialization failed:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize the app. Please restart the application.',
        [{ text: 'OK' }]
      );
    }
  };

  const initializeNFC = async () => {
    try {
      const supported = await NfcManager.isSupported();
      if (supported) {
        await NfcManager.start();
        console.log('NFC initialized successfully');
      } else {
        console.warn('NFC not supported on this device');
      }
    } catch (error) {
      console.error('NFC initialization failed:', error);
      // Don't block app initialization for NFC issues
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.ACCESS_NETWORK_STATE,
          PermissionsAndroid.PERMISSIONS.INTERNET
        ];

        // Request NFC permission if available
        if (Platform.Version >= 28) {
          permissions.push(PermissionsAndroid.PERMISSIONS.NFC);
        }

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        const allGranted = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          console.warn('Some permissions were not granted');
        }
      } catch (error) {
        console.error('Permission request failed:', error);
      }
    }
  };

  const handleAppStateChange = (nextAppState) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      if (isAuthenticated && user) {
        syncOfflineData();
      }
    }
    setAppState(nextAppState);
  };

  if (!isInitialized || authLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
      <Toast />
    </NavigationContainer>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ErrorBoundary>
      <ThemeProvider value={{ theme, isDarkMode, setIsDarkMode }}>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <OfflineProvider>
              <NFCProvider>
                <AppContent />
              </NFCProvider>
            </OfflineProvider>
          </AuthProvider>
        </PaperProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;