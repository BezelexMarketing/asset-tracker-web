// Mock API service for deployed version without backend
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Mock user data
const mockUser = {
  id: 'demo-user-1',
  email: 'admin@demo.com',
  firstName: 'Demo',
  lastName: 'Admin',
  role: 'admin',
  tenantId: 'demo-tenant',
  tenantName: 'Demo Company'
};

// Mock token
const mockToken = 'demo-jwt-token-12345';

// Mock authentication API
export const mockAuthApi = {
  login: async (credentials: { email: string; password: string; tenantId: string }): Promise<ApiResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Accept any credentials for demo (credentials parameter is intentionally unused for demo purposes)
    console.log('Demo login attempt for:', credentials.email);
    return {
      success: true,
      data: {
        token: mockToken,
        user: mockUser
      }
    };
  },

  validate: async (): Promise<ApiResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const token = localStorage.getItem('authToken');
    if (token === mockToken) {
      return {
        success: true,
        data: {
          user: mockUser
        }
      };
    }
    
    return {
      success: false,
      error: 'Invalid token'
    };
  }
};

// Mock data for other API endpoints
export const mockItems = [
  {
    id: '1',
    name: 'Demo Laptop',
    serialNumber: 'DL001',
    description: 'Demo laptop for testing',
    category: 'Electronics',
    status: 'available' as const,
    location: 'Office A',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Demo Printer',
    serialNumber: 'DP001',
    description: 'Demo printer for testing',
    category: 'Office Equipment',
    status: 'assigned' as const,
    location: 'Office B',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockOperators = [
  {
  id: '1',
  name: 'John Doe',
  email: 'john@demo.com',
  department: 'IT',
  status: 'active' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
  }
];

// Mock API functions
export const mockApi = {
  // Items
  getItems: async (): Promise<ApiResponse> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, data: mockItems };
  },

  // Operators
  getOperators: async (): Promise<ApiResponse> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, data: mockOperators };
  },

  // Other endpoints can be added as needed
  getAssignments: async (): Promise<ApiResponse> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, data: [] };
  }
};