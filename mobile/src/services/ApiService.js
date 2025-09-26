import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:3000/api'; // Default development URL
    this.timeout = 30000; // 30 seconds
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Initialize API service
  async initialize() {
    try {
      // Load saved base URL
      const savedBaseURL = await AsyncStorage.getItem('@api_base_url');
      if (savedBaseURL) {
        this.baseURL = savedBaseURL;
      }

      console.log('API Service initialized with base URL:', this.baseURL);
    } catch (error) {
      console.error('Failed to initialize API service:', error);
    }
  }

  // Set base URL
  async setBaseURL(url) {
    try {
      this.baseURL = url.replace(/\/$/, ''); // Remove trailing slash
      await AsyncStorage.setItem('@api_base_url', this.baseURL);
      console.log('API base URL updated:', this.baseURL);
    } catch (error) {
      console.error('Failed to set base URL:', error);
    }
  }

  // Get authentication token
  async getAuthToken() {
    try {
      return await AsyncStorage.getItem('@auth_token');
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  // Set authentication token
  async setAuthToken(token) {
    try {
      if (token) {
        await AsyncStorage.setItem('@auth_token', token);
      } else {
        await AsyncStorage.removeItem('@auth_token');
      }
    } catch (error) {
      console.error('Failed to set auth token:', error);
    }
  }

  // Build headers with authentication
  async buildHeaders(additionalHeaders = {}) {
    const token = await this.getAuthToken();
    const headers = { ...this.defaultHeaders, ...additionalHeaders };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic HTTP request method
  async request(method, endpoint, data = null, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.buildHeaders(options.headers);

      const config = {
        method: method.toUpperCase(),
        headers,
        ...options
      };

      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      config.signal = controller.signal;

      // Add body for POST, PUT, PATCH requests
      if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        if (data instanceof FormData) {
          // Remove Content-Type for FormData (let browser set it)
          delete config.headers['Content-Type'];
          config.body = data;
        } else {
          config.body = JSON.stringify(data);
        }
      }

      console.log(`API Request: ${config.method} ${url}`);

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Handle different response types
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return responseData;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      console.error(`API Error: ${method.toUpperCase()} ${endpoint}`, error);
      throw error;
    }
  }

  // HTTP method shortcuts
  async get(endpoint, options = {}) {
    return this.request('GET', endpoint, null, options);
  }

  async post(endpoint, data, options = {}) {
    return this.request('POST', endpoint, data, options);
  }

  async put(endpoint, data, options = {}) {
    return this.request('PUT', endpoint, data, options);
  }

  async patch(endpoint, data, options = {}) {
    return this.request('PATCH', endpoint, data, options);
  }

  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, null, options);
  }

  // Authentication endpoints
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    
    if (response.token) {
      await this.setAuthToken(response.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      await this.setAuthToken(null);
    }
  }

  async refreshToken() {
    try {
      const response = await this.post('/auth/refresh');
      
      if (response.token) {
        await this.setAuthToken(response.token);
        return response;
      }
      
      throw new Error('No token in refresh response');
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.setAuthToken(null);
      throw error;
    }
  }

  async resetPassword(email) {
    return this.post('/auth/reset-password', { email });
  }

  async changePassword(currentPassword, newPassword) {
    return this.post('/auth/change-password', { currentPassword, newPassword });
  }

  // User endpoints
  async getUsers(tenantId, filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.since) {
      params.append('since', filters.since);
    }
    if (filters.role) {
      params.append('role', filters.role);
    }
    if (filters.isActive !== undefined) {
      params.append('isActive', filters.isActive);
    }

    const queryString = params.toString();
    const endpoint = `/tenants/${tenantId}/users${queryString ? `?${queryString}` : ''}`;
    
    return this.get(endpoint);
  }

  async getUser(userId) {
    return this.get(`/users/${userId}`);
  }

  async createUser(userData) {
    return this.post('/users', userData);
  }

  async updateUser(userId, userData) {
    return this.put(`/users/${userId}`, userData);
  }

  async deleteUser(userId) {
    return this.delete(`/users/${userId}`);
  }

  // Item endpoints
  async getItems(tenantId, filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.since) {
      params.append('since', filters.since);
    }
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.assignedTo) {
      params.append('assignedTo', filters.assignedTo);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }

    const queryString = params.toString();
    const endpoint = `/tenants/${tenantId}/items${queryString ? `?${queryString}` : ''}`;
    
    return this.get(endpoint);
  }

  async getItem(itemId) {
    return this.get(`/items/${itemId}`);
  }

  async createItem(itemData) {
    return this.post('/items', itemData);
  }

  async updateItem(itemId, itemData) {
    return this.put(`/items/${itemId}`, itemData);
  }

  async deleteItem(itemId) {
    return this.delete(`/items/${itemId}`);
  }

  async getItemByNFC(tagId) {
    return this.get(`/items/nfc/${tagId}`);
  }

  async assignItem(itemId, userId, assignmentData) {
    return this.post(`/items/${itemId}/assign`, {
      userId,
      ...assignmentData
    });
  }

  async returnItem(assignmentId, returnData) {
    return this.post(`/assignments/${assignmentId}/return`, returnData);
  }

  // Assignment endpoints
  async getAssignments(tenantId, filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.since) {
      params.append('since', filters.since);
    }
    if (filters.userId) {
      params.append('userId', filters.userId);
    }
    if (filters.itemId) {
      params.append('itemId', filters.itemId);
    }
    if (filters.status) {
      params.append('status', filters.status);
    }

    const queryString = params.toString();
    const endpoint = `/tenants/${tenantId}/assignments${queryString ? `?${queryString}` : ''}`;
    
    return this.get(endpoint);
  }

  async getAssignment(assignmentId) {
    return this.get(`/assignments/${assignmentId}`);
  }

  async createAssignment(assignmentData) {
    return this.post('/assignments', assignmentData);
  }

  async updateAssignment(assignmentId, assignmentData) {
    return this.put(`/assignments/${assignmentId}`, assignmentData);
  }

  async completeAssignment(assignmentId, completionData) {
    return this.post(`/assignments/${assignmentId}/complete`, completionData);
  }

  // NFC scan endpoints
  async createNFCScan(scanData) {
    return this.post('/nfc-scans', scanData);
  }

  async getNFCScans(tenantId, filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.userId) {
      params.append('userId', filters.userId);
    }
    if (filters.tagId) {
      params.append('tagId', filters.tagId);
    }
    if (filters.scanType) {
      params.append('scanType', filters.scanType);
    }
    if (filters.since) {
      params.append('since', filters.since);
    }

    const queryString = params.toString();
    const endpoint = `/tenants/${tenantId}/nfc-scans${queryString ? `?${queryString}` : ''}`;
    
    return this.get(endpoint);
  }

  // Audit log endpoints
  async createAuditLog(logData) {
    return this.post('/audit-logs', logData);
  }

  async getAuditLogs(tenantId, filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.entityType) {
      params.append('entityType', filters.entityType);
    }
    if (filters.entityId) {
      params.append('entityId', filters.entityId);
    }
    if (filters.userId) {
      params.append('userId', filters.userId);
    }
    if (filters.action) {
      params.append('action', filters.action);
    }
    if (filters.since) {
      params.append('since', filters.since);
    }

    const queryString = params.toString();
    const endpoint = `/tenants/${tenantId}/audit-logs${queryString ? `?${queryString}` : ''}`;
    
    return this.get(endpoint);
  }

  // Tenant endpoints
  async getTenants() {
    return this.get('/tenants');
  }

  async getTenant(tenantId) {
    return this.get(`/tenants/${tenantId}`);
  }

  async getTenantBranding(tenantId) {
    return this.get(`/tenants/${tenantId}/branding`);
  }

  async updateTenantBranding(tenantId, brandingData) {
    return this.put(`/tenants/${tenantId}/branding`, brandingData);
  }

  // File upload endpoints
  async uploadFile(file, type = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.post('/files/upload', formData);
  }

  async uploadItemImage(itemId, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.post(`/items/${itemId}/images`, formData);
  }

  async deleteItemImage(itemId, imageId) {
    return this.delete(`/items/${itemId}/images/${imageId}`);
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.get('/health');
      return { status: 'ok', ...response };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  // Test connection
  async testConnection() {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Batch operations
  async batchSync(operations) {
    return this.post('/sync/batch', { operations });
  }

  async batchCreateItems(items) {
    return this.post('/items/batch', { items });
  }

  async batchUpdateItems(updates) {
    return this.put('/items/batch', { updates });
  }

  // Search endpoints
  async searchItems(tenantId, query, filters = {}) {
    const params = new URLSearchParams();
    params.append('q', query);
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });

    const queryString = params.toString();
    const endpoint = `/tenants/${tenantId}/items/search?${queryString}`;
    
    return this.get(endpoint);
  }

  async searchUsers(tenantId, query, filters = {}) {
    const params = new URLSearchParams();
    params.append('q', query);
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });

    const queryString = params.toString();
    const endpoint = `/tenants/${tenantId}/users/search?${queryString}`;
    
    return this.get(endpoint);
  }

  // Analytics endpoints
  async getDashboardStats(tenantId) {
    return this.get(`/tenants/${tenantId}/analytics/dashboard`);
  }

  async getItemUsageStats(tenantId, period = '30d') {
    return this.get(`/tenants/${tenantId}/analytics/items/usage?period=${period}`);
  }

  async getUserActivityStats(tenantId, period = '30d') {
    return this.get(`/tenants/${tenantId}/analytics/users/activity?period=${period}`);
  }

  // Error handling helper
  handleApiError(error) {
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      // Token expired or invalid
      this.setAuthToken(null);
      Alert.alert('Session Expired', 'Please log in again.');
      return 'auth_error';
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
      Alert.alert('Access Denied', 'You do not have permission to perform this action.');
      return 'permission_error';
    } else if (error.message.includes('404') || error.message.includes('Not Found')) {
      return 'not_found';
    } else if (error.message.includes('timeout') || error.message.includes('network')) {
      return 'network_error';
    } else {
      return 'unknown_error';
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;