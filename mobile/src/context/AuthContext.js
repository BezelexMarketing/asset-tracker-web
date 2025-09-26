import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { authService } from '../services/AuthService';
import { apiService } from '../services/ApiService';

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_TENANT: 'SET_TENANT',
  REFRESH_TOKEN: 'REFRESH_TOKEN'
};

// Initial state
const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  tenant: null,
  token: null,
  refreshToken: null,
  error: null
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        tenant: action.payload.tenant,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        error: null
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    case AUTH_ACTIONS.SET_TENANT:
      return {
        ...state,
        tenant: action.payload
      };

    case AUTH_ACTIONS.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Storage keys
const STORAGE_KEYS = {
  TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER: '@user_data',
  TENANT: '@tenant_data'
};

// Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthState();
  }, []);

  // Check if user is already authenticated
  const checkAuthState = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const [token, refreshToken, userData, tenantData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.TENANT)
      ]);

      if (token && userData) {
        const user = JSON.parse(userData);
        const tenant = tenantData ? JSON.parse(tenantData) : null;

        // Validate token
        const isValid = await authService.validateToken(token);
        
        if (isValid) {
          // Set API token
          apiService.setAuthToken(token);
          
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user,
              tenant,
              token,
              refreshToken
            }
          });
        } else {
          // Try to refresh token
          if (refreshToken) {
            await refreshAuthToken(refreshToken);
          } else {
            await logout();
          }
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Auth state check failed:', error);
      await logout();
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await authService.login(credentials);
      
      if (response.success) {
        const { user, tenant, token, refreshToken } = response.data;

        // Store auth data
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
          AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
          AsyncStorage.setItem(STORAGE_KEYS.TENANT, JSON.stringify(tenant))
        ]);

        // Set API token
        apiService.setAuthToken(token);

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, tenant, token, refreshToken }
        });

        return { success: true };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Login failed:', error);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear stored data
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.TENANT)
      ]);

      // Clear API token
      apiService.clearAuthToken();

      // Logout from server
      if (state.token) {
        await authService.logout(state.token);
      }

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Refresh token function
  const refreshAuthToken = async (refreshToken) => {
    try {
      const response = await authService.refreshToken(refreshToken);
      
      if (response.success) {
        const { token: newToken, refreshToken: newRefreshToken } = response.data;

        // Update stored tokens
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.TOKEN, newToken),
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
        ]);

        // Set API token
        apiService.setAuthToken(newToken);

        dispatch({
          type: AUTH_ACTIONS.REFRESH_TOKEN,
          payload: {
            token: newToken,
            refreshToken: newRefreshToken
          }
        });

        return true;
      } else {
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return false;
    }
  };

  // Update user profile
  const updateUser = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      
      if (response.success) {
        const updatedUser = { ...state.user, ...response.data };
        
        // Update stored user data
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: updatedUser
        });

        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: 'Profile update failed. Please try again.' };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        Alert.alert('Success', 'Password changed successfully');
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Password change failed:', error);
      return { success: false, error: 'Password change failed. Please try again.' };
    }
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!state.user || !state.user.permissions) {
      return false;
    }
    return state.user.permissions.includes(permission) || state.user.role === 'admin';
  };

  // Get user role
  const getUserRole = () => {
    return state.user?.role || 'user';
  };

  // Get tenant info
  const getTenant = () => {
    return state.tenant;
  };

  const contextValue = {
    // State
    ...state,
    
    // Actions
    login,
    logout,
    updateUser,
    changePassword,
    refreshAuthToken,
    
    // Utilities
    hasPermission,
    getUserRole,
    getTenant
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;