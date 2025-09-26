// API service for Asset Tracker Pro
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Item {
  id: string;
  name: string;
  serialNumber?: string;
  description?: string;
  category: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  nfcTagUid?: string;
  location?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Operator {
  id: string;
  name: string;
  email: string;
  department?: string;
  phone?: string;
  employeeId?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  itemId: string;
  operatorId: string;
  assignedAt: string;
  unassignedAt?: string;
  status: 'active' | 'completed' | 'overdue';
  notes?: string;
  assignedBy: string;
  item?: Item;
  operator?: Operator;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Items API
export const itemsApi = {
  // Get all items with optional filters
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return apiRequest<{ items: Item[]; total: number; page: number; totalPages: number }>(
      `/items${query ? `?${query}` : ''}`
    );
  },

  // Get single item by ID
  getById: (id: string) => apiRequest<Item>(`/items/${id}`),

  // Create new item
  create: (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<Item>('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    }),

  // Update item
  update: (id: string, itemData: Partial<Item>) =>
    apiRequest<Item>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    }),

  // Delete item
  delete: (id: string) =>
    apiRequest(`/items/${id}`, {
      method: 'DELETE',
    }),

  // Get item categories
  getCategories: () => apiRequest<string[]>('/items/categories'),

  // Create a new category
  createCategory: (name: string) =>
    apiRequest<{ name: string }>('/items/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
};

// Operators API
export const operatorsApi = {
  // Get all operators
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return apiRequest<{ operators: Operator[]; total: number; page: number; totalPages: number }>(
      `/operators${query ? `?${query}` : ''}`
    );
  },

  // Get single operator by ID
  getById: (id: string) => apiRequest<Operator>(`/operators/${id}`),

  // Create new operator
  create: (operatorData: Omit<Operator, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<Operator>('/operators', {
      method: 'POST',
      body: JSON.stringify(operatorData),
    }),

  // Update operator
  update: (id: string, operatorData: Partial<Operator>) =>
    apiRequest<Operator>(`/operators/${id}`, {
      method: 'PUT',
      body: JSON.stringify(operatorData),
    }),

  // Delete operator
  delete: (id: string) =>
    apiRequest(`/operators/${id}`, {
      method: 'DELETE',
    }),
};

// Assignments API
export const assignmentsApi = {
  // Get all assignments
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    operatorId?: string;
    itemId?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return apiRequest<{ assignments: Assignment[]; total: number; page: number; totalPages: number }>(
      `/assignments${query ? `?${query}` : ''}`
    );
  },

  // Get single assignment by ID
  getById: (id: string) => apiRequest<Assignment>(`/assignments/${id}`),

  // Create new assignment
  create: (assignmentData: {
    itemId: string;
    operatorId: string;
    notes?: string;
  }) =>
    apiRequest<Assignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    }),

  // Update assignment
  update: (id: string, assignmentData: { notes?: string }) =>
    apiRequest<Assignment>(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    }),

  // Unassign item
  unassign: (id: string, notes?: string) =>
    apiRequest<Assignment>(`/assignments/${id}/unassign`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    }),

  // Get assignment statistics
  getStats: () =>
    apiRequest<{
      totalAssignments: number;
      activeAssignments: number;
      overdueAssignments: number;
      completedAssignments: number;
    }>('/assignments/stats'),
};

// NFC API
export const nfcApi = {
  // Lookup item by NFC tag
  lookup: (tagId: string) => apiRequest<Item>(`/nfc/${tagId}/lookup`),

  // Assign item via NFC
  assign: (tagId: string, operatorId: string, notes?: string) =>
    apiRequest<Assignment>(`/nfc/${tagId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ operatorId, notes }),
    }),

  // Check in item via NFC
  checkin: (tagId: string, notes?: string) =>
    apiRequest<Assignment>(`/nfc/${tagId}/checkin`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  // Check out item via NFC
  checkout: (tagId: string, notes?: string) =>
    apiRequest<Assignment>(`/nfc/${tagId}/checkout`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  // Mark item for maintenance via NFC
  maintenance: (tagId: string, notes?: string) =>
    apiRequest<Item>(`/nfc/${tagId}/maintenance`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
};

// Auth API (placeholder for future implementation)
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  validate: () => apiRequest<{ user: any }>('/auth/validate'),

  logout: () => {
    localStorage.removeItem('authToken');
    return Promise.resolve({ success: true });
  },
};

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Mock data fallback (for development when backend is not available)
export const mockData = {
  items: [
    {
      id: '1',
      name: 'MacBook Pro 16"',
      serialNumber: 'MBP001',
      description: 'High-performance laptop for development',
      category: 'Electronics',
      status: 'assigned' as const,
      location: 'Office Floor 2',
      purchaseDate: '2024-01-15',
      purchasePrice: 2499.99,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'Drill Set Professional',
      serialNumber: 'DRL045',
      description: 'Professional grade drill set with multiple bits',
      category: 'Tools',
      status: 'assigned' as const,
      location: 'Construction Site A',
      purchaseDate: '2024-01-10',
      purchasePrice: 299.99,
      createdAt: '2024-01-10T14:20:00Z',
      updatedAt: '2024-01-10T14:20:00Z',
    },
  ],
  operators: [
    {
      id: 'op1',
      name: 'John Doe',
      email: 'john.doe@company.com',
      department: 'IT',
      phone: '+1-555-0123',
      employeeId: 'EMP001',
      status: 'active' as const,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'op2',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      department: 'Construction',
      phone: '+1-555-0124',
      employeeId: 'EMP002',
      status: 'active' as const,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
};

export default {
  items: itemsApi,
  operators: operatorsApi,
  assignments: assignmentsApi,
  nfc: nfcApi,
  auth: authApi,
};