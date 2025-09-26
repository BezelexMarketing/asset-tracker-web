import React, { createContext, useContext, useReducer, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { syncService } from '../services/SyncService';
import { databaseService } from '../services/DatabaseService';

// Action types
const OFFLINE_ACTIONS = {
  SET_NETWORK_STATUS: 'SET_NETWORK_STATUS',
  SET_SYNC_STATUS: 'SET_SYNC_STATUS',
  ADD_PENDING_ACTION: 'ADD_PENDING_ACTION',
  REMOVE_PENDING_ACTION: 'REMOVE_PENDING_ACTION',
  SET_PENDING_ACTIONS: 'SET_PENDING_ACTIONS',
  SET_LAST_SYNC: 'SET_LAST_SYNC',
  SET_SYNC_ERROR: 'SET_SYNC_ERROR',
  CLEAR_SYNC_ERROR: 'CLEAR_SYNC_ERROR'
};

// Initial state
const initialState = {
  isConnected: true,
  connectionType: 'unknown',
  isSyncing: false,
  pendingActions: [],
  lastSyncTime: null,
  syncError: null,
  autoSyncEnabled: true
};

// Reducer
function offlineReducer(state, action) {
  switch (action.type) {
    case OFFLINE_ACTIONS.SET_NETWORK_STATUS:
      return {
        ...state,
        isConnected: action.payload.isConnected,
        connectionType: action.payload.type
      };

    case OFFLINE_ACTIONS.SET_SYNC_STATUS:
      return {
        ...state,
        isSyncing: action.payload
      };

    case OFFLINE_ACTIONS.ADD_PENDING_ACTION:
      return {
        ...state,
        pendingActions: [...state.pendingActions, action.payload]
      };

    case OFFLINE_ACTIONS.REMOVE_PENDING_ACTION:
      return {
        ...state,
        pendingActions: state.pendingActions.filter(
          action => action.id !== action.payload
        )
      };

    case OFFLINE_ACTIONS.SET_PENDING_ACTIONS:
      return {
        ...state,
        pendingActions: action.payload
      };

    case OFFLINE_ACTIONS.SET_LAST_SYNC:
      return {
        ...state,
        lastSyncTime: action.payload
      };

    case OFFLINE_ACTIONS.SET_SYNC_ERROR:
      return {
        ...state,
        syncError: action.payload
      };

    case OFFLINE_ACTIONS.CLEAR_SYNC_ERROR:
      return {
        ...state,
        syncError: null
      };

    default:
      return state;
  }
}

// Create context
const OfflineContext = createContext();

// Storage keys
const STORAGE_KEYS = {
  PENDING_ACTIONS: '@pending_actions',
  LAST_SYNC: '@last_sync_time',
  AUTO_SYNC: '@auto_sync_enabled'
};

// Provider component
export function OfflineProvider({ children }) {
  const [state, dispatch] = useReducer(offlineReducer, initialState);

  useEffect(() => {
    initializeOfflineContext();
    setupNetworkListener();
    
    return () => {
      // Cleanup network listener
    };
  }, []);

  // Auto-sync when connection is restored
  useEffect(() => {
    if (state.isConnected && state.pendingActions.length > 0 && state.autoSyncEnabled) {
      syncPendingActions();
    }
  }, [state.isConnected, state.pendingActions.length]);

  // Initialize offline context
  const initializeOfflineContext = async () => {
    try {
      // Load pending actions
      const pendingActionsJson = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_ACTIONS);
      if (pendingActionsJson) {
        const pendingActions = JSON.parse(pendingActionsJson);
        dispatch({ type: OFFLINE_ACTIONS.SET_PENDING_ACTIONS, payload: pendingActions });
      }

      // Load last sync time
      const lastSyncTime = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      if (lastSyncTime) {
        dispatch({ type: OFFLINE_ACTIONS.SET_LAST_SYNC, payload: new Date(lastSyncTime) });
      }

      // Load auto-sync setting
      const autoSyncEnabled = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_SYNC);
      if (autoSyncEnabled !== null) {
        state.autoSyncEnabled = JSON.parse(autoSyncEnabled);
      }
    } catch (error) {
      console.error('Failed to initialize offline context:', error);
    }
  };

  // Setup network status listener
  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch({
        type: OFFLINE_ACTIONS.SET_NETWORK_STATUS,
        payload: {
          isConnected: state.isConnected,
          type: state.type
        }
      });
    });

    return unsubscribe;
  };

  // Add action to pending queue
  const addPendingAction = async (action) => {
    try {
      const actionWithId = {
        ...action,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        retryCount: 0
      };

      const updatedActions = [...state.pendingActions, actionWithId];
      
      dispatch({ type: OFFLINE_ACTIONS.ADD_PENDING_ACTION, payload: actionWithId });
      
      // Persist to storage
      await AsyncStorage.setItem(
        STORAGE_KEYS.PENDING_ACTIONS,
        JSON.stringify(updatedActions)
      );

      return actionWithId.id;
    } catch (error) {
      console.error('Failed to add pending action:', error);
      throw error;
    }
  };

  // Remove action from pending queue
  const removePendingAction = async (actionId) => {
    try {
      const updatedActions = state.pendingActions.filter(action => action.id !== actionId);
      
      dispatch({ type: OFFLINE_ACTIONS.REMOVE_PENDING_ACTION, payload: actionId });
      
      // Persist to storage
      await AsyncStorage.setItem(
        STORAGE_KEYS.PENDING_ACTIONS,
        JSON.stringify(updatedActions)
      );
    } catch (error) {
      console.error('Failed to remove pending action:', error);
    }
  };

  // Sync pending actions
  const syncPendingActions = async () => {
    if (!state.isConnected || state.isSyncing || state.pendingActions.length === 0) {
      return;
    }

    try {
      dispatch({ type: OFFLINE_ACTIONS.SET_SYNC_STATUS, payload: true });
      dispatch({ type: OFFLINE_ACTIONS.CLEAR_SYNC_ERROR });

      const results = await syncService.syncPendingActions(state.pendingActions);
      
      // Remove successfully synced actions
      const failedActions = [];
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const action = state.pendingActions[i];
        
        if (result.success) {
          await removePendingAction(action.id);
        } else {
          // Increment retry count
          const updatedAction = {
            ...action,
            retryCount: (action.retryCount || 0) + 1,
            lastError: result.error
          };
          
          // Remove action if max retries reached
          if (updatedAction.retryCount >= 3) {
            await removePendingAction(action.id);
            console.warn(`Action ${action.id} failed after 3 retries:`, result.error);
          } else {
            failedActions.push(updatedAction);
          }
        }
      }

      // Update last sync time
      const now = new Date();
      dispatch({ type: OFFLINE_ACTIONS.SET_LAST_SYNC, payload: now });
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toISOString());

      // Show sync result
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.length - successCount;
      
      if (failedCount > 0) {
        dispatch({
          type: OFFLINE_ACTIONS.SET_SYNC_ERROR,
          payload: `${failedCount} actions failed to sync`
        });
      }

      console.log(`Sync completed: ${successCount} success, ${failedCount} failed`);
      
    } catch (error) {
      console.error('Sync failed:', error);
      dispatch({ type: OFFLINE_ACTIONS.SET_SYNC_ERROR, payload: error.message });
    } finally {
      dispatch({ type: OFFLINE_ACTIONS.SET_SYNC_STATUS, payload: false });
    }
  };

  // Force sync
  const forceSync = async () => {
    if (!state.isConnected) {
      Alert.alert('No Connection', 'Please check your internet connection and try again.');
      return false;
    }

    await syncPendingActions();
    return true;
  };

  // Clear all pending actions
  const clearPendingActions = async () => {
    try {
      dispatch({ type: OFFLINE_ACTIONS.SET_PENDING_ACTIONS, payload: [] });
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_ACTIONS);
    } catch (error) {
      console.error('Failed to clear pending actions:', error);
    }
  };

  // Toggle auto-sync
  const toggleAutoSync = async (enabled) => {
    try {
      state.autoSyncEnabled = enabled;
      await AsyncStorage.setItem(STORAGE_KEYS.AUTO_SYNC, JSON.stringify(enabled));
    } catch (error) {
      console.error('Failed to toggle auto-sync:', error);
    }
  };

  // Execute action (online or queue for offline)
  const executeAction = async (action) => {
    if (state.isConnected) {
      try {
        // Execute immediately if online
        const result = await syncService.executeAction(action);
        return result;
      } catch (error) {
        // If execution fails, queue for later
        console.warn('Action execution failed, queuing for later:', error);
        await addPendingAction(action);
        return { success: false, queued: true, error: error.message };
      }
    } else {
      // Queue for later if offline
      await addPendingAction(action);
      return { success: false, queued: true, error: 'Device is offline' };
    }
  };

  // Get offline data
  const getOfflineData = async (type, filters = {}) => {
    try {
      return await databaseService.getOfflineData(type, filters);
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return [];
    }
  };

  // Save offline data
  const saveOfflineData = async (type, data) => {
    try {
      await databaseService.saveOfflineData(type, data);
      return true;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      return false;
    }
  };

  // Clear sync error
  const clearSyncError = () => {
    dispatch({ type: OFFLINE_ACTIONS.CLEAR_SYNC_ERROR });
  };

  // Get sync status info
  const getSyncInfo = () => {
    return {
      pendingCount: state.pendingActions.length,
      lastSync: state.lastSyncTime,
      isOnline: state.isConnected,
      connectionType: state.connectionType,
      isSyncing: state.isSyncing,
      hasError: !!state.syncError
    };
  };

  const contextValue = {
    // State
    ...state,
    
    // Actions
    addPendingAction,
    removePendingAction,
    syncPendingActions,
    forceSync,
    clearPendingActions,
    toggleAutoSync,
    executeAction,
    getOfflineData,
    saveOfflineData,
    clearSyncError,
    
    // Utilities
    getSyncInfo
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
}

// Hook to use offline context
export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}

export default OfflineContext;