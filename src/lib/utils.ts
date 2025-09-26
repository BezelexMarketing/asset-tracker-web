import { ActionLog, ActionType } from '../types';

// Universal Timestamp Utilities
export const formatTimestamp = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const parseTimestamp = (timestamp: string): Date => {
  return new Date(timestamp.replace(' ', 'T'));
};

export const isValidTimestamp = (timestamp: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  if (!regex.test(timestamp)) return false;
  
  const date = parseTimestamp(timestamp);
  return !isNaN(date.getTime());
};

// Action Logging Utilities
export const createActionLog = (
  clientId: string,
  itemId: string,
  actionType: ActionType,
  userId: string,
  description?: string,
  metadata?: Record<string, any>,
  previousState?: Record<string, any>,
  newState?: Record<string, any>
): Omit<ActionLog, 'id'> => {
  return {
    clientId,
    itemId,
    actionType,
    userId,
    timestamp: formatTimestamp(),
    description,
    metadata,
    previousState,
    newState,
  };
};

// ID Generation
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Data Validation
export const validateClientId = (clientId: string): boolean => {
  return typeof clientId === 'string' && clientId.length > 0;
};

export const validateItemId = (itemId: string): boolean => {
  return typeof itemId === 'string' && itemId.length > 0;
};

// Date Range Utilities
export const getDateRange = (days: number): { from: string; to: string } => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  
  return {
    from: formatTimestamp(from),
    to: formatTimestamp(to),
  };
};

export const formatDateForDisplay = (timestamp: string): string => {
  const date = parseTimestamp(timestamp);
  return date.toLocaleString();
};

// Search Utilities
export const normalizeSearchQuery = (query: string): string => {
  return query.toLowerCase().trim();
};

export const matchesSearch = (text: string, query: string): boolean => {
  return normalizeSearchQuery(text).includes(normalizeSearchQuery(query));
};

// Status Utilities
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    available: '#4caf50',
    assigned: '#2196f3',
    maintenance: '#ff9800',
    retired: '#9e9e9e',
    active: '#4caf50',
    returned: '#9e9e9e',
    overdue: '#f44336',
    scheduled: '#2196f3',
    'in-progress': '#ff9800',
    completed: '#4caf50',
    cancelled: '#9e9e9e',
  };
  
  return statusColors[status] || '#9e9e9e';
};

// Export Utilities
export const formatForExport = (data: any[]): any[] => {
  return data.map(item => ({
    ...item,
    timestamp: item.timestamp || formatTimestamp(),
    createdAt: item.createdAt || formatTimestamp(),
    updatedAt: item.updatedAt || formatTimestamp(),
  }));
};

// NFC Utilities
export const isValidNFCTag = (tag: string): boolean => {
  return typeof tag === 'string' && tag.length >= 4;
};

export const formatNFCTag = (tag: string): string => {
  return tag.toUpperCase().trim();
};