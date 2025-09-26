// Core Entity Types
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// Subclient interface removed - working directly with clients now

export interface Item {
  id: string;
  nfcTag?: string;
  name: string;
  description?: string;
  category: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  value?: number;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  currentClientId?: string;
  currentAssignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'operator';
  clientId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Action Logging System
export type ActionType = 
  | 'assign' 
  | 'check-in' 
  | 'check-out' 
  | 'maintenance' 
  | 'lookup' 
  | 'inventory-add' 
  | 'inventory-update' 
  | 'status-change';

export interface ActionLog {
  id: string;
  clientId: string;
  itemId: string;
  actionType: ActionType;
  userId: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss format
  description?: string;
  metadata?: Record<string, any>;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
}

// Assignment System
export interface Assignment {
  id: string;
  itemId: string;
  clientId: string;
  assignedTo: string; // User ID
  assignedBy: string; // User ID
  assignedAt: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  status: 'active' | 'returned' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Maintenance System
export interface MaintenanceRecord {
  id: string;
  itemId: string;
  clientId: string;
  performedBy: string; // User ID
  type: 'preventive' | 'corrective' | 'inspection' | 'repair';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  description: string;
  images?: string[]; // Array of image URLs/paths
  scheduledDate?: string;
  completedDate?: string;
  cost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Report Filters
export interface ReportFilters {
  clientId?: string;
  itemId?: string;
  actionType?: ActionType[];
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}

// UI State Types - removed subclient selection state as we work directly with clients now

export interface ItemSelectionState {
  selectedItem?: Item;
  searchQuery: string;
  searchResults: Item[];
  isScanning: boolean;
  isLoading: boolean;
}

// Utility Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types - removed subclient form data as we work directly with clients now

export interface AssignmentFormData {
  itemId: string;
  clientId: string;
  assignedTo: string;
  expectedReturnDate?: string;
  notes?: string;
}

export interface MaintenanceFormData {
  itemId: string;
  clientId: string;
  type: MaintenanceRecord['type'];
  priority: MaintenanceRecord['priority'];
  description: string;
  scheduledDate?: string;
  notes?: string;
}