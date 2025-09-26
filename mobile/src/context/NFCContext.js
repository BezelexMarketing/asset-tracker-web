import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Alert, Vibration, Platform } from 'react-native';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import Sound from 'react-native-sound';

// Action types
const NFC_ACTIONS = {
  SET_SUPPORTED: 'SET_SUPPORTED',
  SET_ENABLED: 'SET_ENABLED',
  SET_SCANNING: 'SET_SCANNING',
  SET_WRITING: 'SET_WRITING',
  SET_LAST_TAG: 'SET_LAST_TAG',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  isSupported: false,
  isEnabled: false,
  isScanning: false,
  isWriting: false,
  lastTag: null,
  error: null
};

// Reducer
function nfcReducer(state, action) {
  switch (action.type) {
    case NFC_ACTIONS.SET_SUPPORTED:
      return { ...state, isSupported: action.payload };
    
    case NFC_ACTIONS.SET_ENABLED:
      return { ...state, isEnabled: action.payload };
    
    case NFC_ACTIONS.SET_SCANNING:
      return { ...state, isScanning: action.payload };
    
    case NFC_ACTIONS.SET_WRITING:
      return { ...state, isWriting: action.payload };
    
    case NFC_ACTIONS.SET_LAST_TAG:
      return { ...state, lastTag: action.payload };
    
    case NFC_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    
    case NFC_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
}

// Create context
const NFCContext = createContext();

// Sound effects
let successSound, errorSound;

// Initialize sounds
const initializeSounds = () => {
  if (Platform.OS === 'android') {
    successSound = new Sound('success.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) console.log('Failed to load success sound', error);
    });
    
    errorSound = new Sound('error.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) console.log('Failed to load error sound', error);
    });
  }
};

// Provider component
export function NFCProvider({ children }) {
  const [state, dispatch] = useReducer(nfcReducer, initialState);

  React.useEffect(() => {
    initializeNFC();
    initializeSounds();
    
    return () => {
      stopScanning();
    };
  }, []);

  // Initialize NFC
  const initializeNFC = async () => {
    try {
      const supported = await NfcManager.isSupported();
      dispatch({ type: NFC_ACTIONS.SET_SUPPORTED, payload: supported });
      
      if (supported) {
        const enabled = await NfcManager.isEnabled();
        dispatch({ type: NFC_ACTIONS.SET_ENABLED, payload: enabled });
      }
    } catch (error) {
      console.error('NFC initialization failed:', error);
      dispatch({ type: NFC_ACTIONS.SET_ERROR, payload: 'NFC initialization failed' });
    }
  };

  // Check NFC status
  const checkNFCStatus = async () => {
    try {
      const supported = await NfcManager.isSupported();
      const enabled = supported ? await NfcManager.isEnabled() : false;
      
      dispatch({ type: NFC_ACTIONS.SET_SUPPORTED, payload: supported });
      dispatch({ type: NFC_ACTIONS.SET_ENABLED, payload: enabled });
      
      return { supported, enabled };
    } catch (error) {
      console.error('NFC status check failed:', error);
      return { supported: false, enabled: false };
    }
  };

  // Start scanning for NFC tags
  const startScanning = useCallback(async (options = {}) => {
    try {
      const { supported, enabled } = await checkNFCStatus();
      
      if (!supported) {
        throw new Error('NFC is not supported on this device');
      }
      
      if (!enabled) {
        Alert.alert(
          'NFC Disabled',
          'Please enable NFC in your device settings to scan tags.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => NfcManager.goToNfcSetting() }
          ]
        );
        return false;
      }

      dispatch({ type: NFC_ACTIONS.SET_SCANNING, payload: true });
      dispatch({ type: NFC_ACTIONS.CLEAR_ERROR });

      // Request NFC technology
      await NfcManager.requestTechnology([NfcTech.Ndef, NfcTech.NfcA]);

      // Set up tag discovery
      const tag = await NfcManager.getTag();
      
      if (tag) {
        await handleTagDiscovered(tag, options);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('NFC scanning failed:', error);
      dispatch({ type: NFC_ACTIONS.SET_ERROR, payload: error.message });
      playErrorSound();
      return false;
    } finally {
      dispatch({ type: NFC_ACTIONS.SET_SCANNING, payload: false });
      await NfcManager.cancelTechnologyRequest();
    }
  }, []);

  // Stop scanning
  const stopScanning = useCallback(async () => {
    try {
      await NfcManager.cancelTechnologyRequest();
      dispatch({ type: NFC_ACTIONS.SET_SCANNING, payload: false });
    } catch (error) {
      console.error('Stop scanning failed:', error);
    }
  }, []);

  // Handle tag discovered
  const handleTagDiscovered = async (tag, options = {}) => {
    try {
      // Parse tag data
      const tagData = parseNFCTag(tag);
      
      dispatch({ type: NFC_ACTIONS.SET_LAST_TAG, payload: tagData });
      
      // Provide haptic feedback
      Vibration.vibrate(100);
      playSuccessSound();
      
      // Call callback if provided
      if (options.onTagDiscovered) {
        await options.onTagDiscovered(tagData);
      }
      
      return tagData;
    } catch (error) {
      console.error('Tag handling failed:', error);
      dispatch({ type: NFC_ACTIONS.SET_ERROR, payload: 'Failed to read tag data' });
      playErrorSound();
      throw error;
    }
  };

  // Write data to NFC tag
  const writeToTag = useCallback(async (data) => {
    try {
      const { supported, enabled } = await checkNFCStatus();
      
      if (!supported || !enabled) {
        throw new Error('NFC is not available');
      }

      dispatch({ type: NFC_ACTIONS.SET_WRITING, payload: true });
      dispatch({ type: NFC_ACTIONS.CLEAR_ERROR });

      // Request NFC technology
      await NfcManager.requestTechnology([NfcTech.Ndef]);

      // Create NDEF message
      const bytes = Ndef.encodeMessage([
        Ndef.textRecord(JSON.stringify(data))
      ]);

      // Write to tag
      await NfcManager.ndefHandler.writeNdefMessage(bytes);
      
      // Provide feedback
      Vibration.vibrate([100, 50, 100]);
      playSuccessSound();
      
      Alert.alert('Success', 'Data written to NFC tag successfully');
      return true;
    } catch (error) {
      console.error('NFC write failed:', error);
      dispatch({ type: NFC_ACTIONS.SET_ERROR, payload: error.message });
      playErrorSound();
      Alert.alert('Write Failed', error.message);
      return false;
    } finally {
      dispatch({ type: NFC_ACTIONS.SET_WRITING, payload: false });
      await NfcManager.cancelTechnologyRequest();
    }
  }, []);

  // Parse NFC tag data
  const parseNFCTag = (tag) => {
    const tagData = {
      id: tag.id,
      techTypes: tag.techTypes,
      type: tag.type || 'unknown',
      maxSize: tag.maxSize,
      isWritable: tag.isWritable,
      canMakeReadOnly: tag.canMakeReadOnly,
      ndefMessage: null,
      rawData: null
    };

    // Parse NDEF message if available
    if (tag.ndefMessage && tag.ndefMessage.length > 0) {
      try {
        const ndefRecord = tag.ndefMessage[0];
        if (ndefRecord.payload) {
          // Convert payload to string
          const payloadString = String.fromCharCode.apply(null, ndefRecord.payload);
          
          // Try to parse as JSON
          try {
            tagData.ndefMessage = JSON.parse(payloadString.substring(3)); // Skip language code
          } catch {
            tagData.rawData = payloadString;
          }
        }
      } catch (error) {
        console.error('NDEF parsing failed:', error);
      }
    }

    return tagData;
  };

  // Play success sound
  const playSuccessSound = () => {
    if (successSound && Platform.OS === 'android') {
      successSound.play();
    }
  };

  // Play error sound
  const playErrorSound = () => {
    if (errorSound && Platform.OS === 'android') {
      errorSound.play();
    }
  };

  // Format tag data for display
  const formatTagData = (tag) => {
    if (!tag) return null;
    
    return {
      id: tag.id || 'Unknown',
      type: tag.type || 'Unknown',
      technology: tag.techTypes?.join(', ') || 'Unknown',
      writable: tag.isWritable ? 'Yes' : 'No',
      size: tag.maxSize ? `${tag.maxSize} bytes` : 'Unknown',
      data: tag.ndefMessage || tag.rawData || 'No data'
    };
  };

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: NFC_ACTIONS.CLEAR_ERROR });
  }, []);

  // Get NFC settings
  const openNFCSettings = useCallback(() => {
    NfcManager.goToNfcSetting();
  }, []);

  const contextValue = {
    // State
    ...state,
    
    // Actions
    startScanning,
    stopScanning,
    writeToTag,
    checkNFCStatus,
    clearError,
    openNFCSettings,
    
    // Utilities
    formatTagData,
    parseNFCTag
  };

  return (
    <NFCContext.Provider value={contextValue}>
      {children}
    </NFCContext.Provider>
  );
}

// Hook to use NFC context
export function useNFC() {
  const context = useContext(NFCContext);
  if (!context) {
    throw new Error('useNFC must be used within an NFCProvider');
  }
  return context;
}

export default NFCContext;