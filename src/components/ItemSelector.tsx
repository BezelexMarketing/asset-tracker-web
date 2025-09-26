'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Avatar,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Badge,
  IconButton,
  Tooltip,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  QrCode as QrCodeIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

interface Item {
  id: string;
  name: string;
  serialNumber: string;
  category: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  clientId: string;
  clientName: string;
  imageUrl?: string;
  description?: string;
  assignedTo?: string;
  lastSeen?: string;
  nfcTagId?: string;
  location?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
}

interface ItemSelectorProps {
  selectedClientId?: string;
  selectedItems: Item[];
  onItemsChange: (items: Item[]) => void;
  multiSelect?: boolean;
  disabled?: boolean;
  filterByStatus?: string[];
  showOnlyAvailable?: boolean;
}

// Mock data for items
const mockItems: Item[] = [
  {
    id: '1',
    name: 'MacBook Pro 16"',
    serialNumber: 'MBP-2024-001',
    category: 'Laptop',
    status: 'available',
    clientId: 'client1',
    clientName: 'TechCorp Solutions',
    imageUrl: '/api/placeholder/200/150',
    description: 'High-performance laptop for development work',
    location: 'IT Storage Room A',
    condition: 'excellent',
    nfcTagId: 'NFC-001',
    lastSeen: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Dell Monitor 27"',
    serialNumber: 'MON-2024-002',
    category: 'Monitor',
    status: 'assigned',
    clientId: 'client1',
    clientName: 'TechCorp Solutions',
    imageUrl: '/api/placeholder/200/150',
    description: '4K display monitor',
    assignedTo: 'John Smith',
    location: 'Desk 15A',
    condition: 'good',
    nfcTagId: 'NFC-002',
    lastSeen: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    name: 'iPhone 15 Pro',
    serialNumber: 'IPH-2024-003',
    category: 'Mobile Device',
    status: 'available',
    clientId: 'client2',
    clientName: 'Global Industries',
    imageUrl: '/api/placeholder/200/150',
    description: 'Company mobile device',
    location: 'Mobile Device Cabinet',
    condition: 'excellent',
    nfcTagId: 'NFC-003',
    lastSeen: '2024-01-15T09:15:00Z'
  },
  {
    id: '4',
    name: 'Wireless Headphones',
    serialNumber: 'WH-2024-004',
    category: 'Audio Equipment',
    status: 'maintenance',
    clientId: 'client1',
    clientName: 'TechCorp Solutions',
    imageUrl: '/api/placeholder/200/150',
    description: 'Noise-cancelling headphones',
    location: 'Maintenance Workshop',
    condition: 'fair',
    nfcTagId: 'NFC-004',
    lastSeen: '2024-01-13T16:45:00Z'
  },
  {
    id: '5',
    name: 'Projector',
    serialNumber: 'PROJ-2024-005',
    category: 'Presentation Equipment',
    status: 'available',
    clientId: 'client3',
    clientName: 'Creative Agency',
    imageUrl: '/api/placeholder/200/150',
    description: '4K portable projector',
    location: 'Conference Room B',
    condition: 'good',
    nfcTagId: 'NFC-005',
    lastSeen: '2024-01-15T11:00:00Z'
  }
];
const categories = ['All', 'Laptop', 'Monitor', 'Mobile Device', 'Audio Equipment', 'Presentation Equipment'];
const statuses = ['All', 'available', 'assigned', 'maintenance', 'retired'];
const conditions = ['All', 'excellent', 'good', 'fair', 'poor'];

const ItemSelector: React.FC<ItemSelectorProps> = ({
  selectedClientId,
  selectedItems = [],
  onItemsChange,
  multiSelect = true,
  disabled = false,
  filterByStatus = [],
  showOnlyAvailable = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // Filter items based on client and other filters
  const filteredItems = mockItems.filter(item => {
    // Filter by client if specified
    if (selectedClientId && item.clientId !== selectedClientId) {
      return false;
    }

    // Filter by status if specified
    if (filterByStatus.length > 0 && !filterByStatus.includes(item.status)) {
      return false;
    }

    // Show only available items if specified
    if (showOnlyAvailable && item.status !== 'available') {
      return false;
    }

    // Search filter
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.category.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'All' && item.category !== categoryFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'All' && item.status !== statusFilter) {
      return false;
    }

    // Condition filter
    if (conditionFilter !== 'All' && item.condition !== conditionFilter) {
      return false;
    }

    return true;
  });

  const handleItemSelect = (item: Item) => {
    if (disabled) return;

    if (multiSelect) {
      const isSelected = selectedItems.some(selected => selected.id === item.id);
      if (isSelected) {
        onItemsChange(selectedItems.filter(selected => selected.id !== item.id));
      } else {
        onItemsChange([...selectedItems, item]);
      }
    } else {
      onItemsChange([item]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircleIcon fontSize="small" />;
      case 'assigned': return <AssignmentIcon fontSize="small" />;
      case 'maintenance': return <WarningIcon fontSize="small" />;
      case 'retired': return <ErrorIcon fontSize="small" />;
      default: return <InfoIcon fontSize="small" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'assigned': return 'primary';
      case 'maintenance': return 'warning';
      case 'retired': return 'error';
      default: return 'default';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return '#4caf50';
      case 'good': return '#8bc34a';
      case 'fair': return '#ff9800';
      case 'poor': return '#f44336';
      default: return '#757575';
    }
  };

  const isItemSelected = (item: Item) => {
    return selectedItems.some(selected => selected.id === item.id);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip label="Step 2" size="small" color="primary" />
        Select Items
        {selectedItems.length > 0 && (
          <Badge badgeContent={selectedItems.length} color="primary">
            <InventoryIcon />
          </Badge>
        )}
      </Typography>

      {!selectedClientId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please select a client first to view available items.
        </Alert>
      )}

      {selectedClientId && (
        <>
          {/* Search and Filters */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={disabled}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    disabled={disabled}
                    label="Category"
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    disabled={disabled}
                    label="Status"
                  >
                    {statuses.map(status => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value)}
                    disabled={disabled}
                    label="Condition"
                  >
                    {conditions.map(condition => (
                      <MenuItem key={condition} value={condition}>
                        {condition}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="body2" color="text.secondary">
                  {filteredItems.length} items found
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Items Grid */}
          <Grid container spacing={2}>
            {loading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <Skeleton variant="rectangular" height={150} />
                    <CardContent>
                      <Skeleton variant="text" height={24} />
                      <Skeleton variant="text" height={20} width="60%" />
                      <Skeleton variant="text" height={20} width="40%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : filteredItems.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  No items found matching your criteria. Try adjusting your filters.
                </Alert>
              </Grid>
            ) : (
              filteredItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card
                    sx={{
                      cursor: disabled ? 'default' : 'pointer',
                      border: isItemSelected(item) ? 2 : 1,
                      borderColor: isItemSelected(item) ? 'primary.main' : 'grey.300',
                      bgcolor: isItemSelected(item) ? 'primary.50' : 'background.paper',
                      '&:hover': disabled ? {} : {
                        boxShadow: 3,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                    onClick={() => handleItemSelect(item)}
                  >
                    <CardMedia
                      component="img"
                      height="150"
                      image={item.imageUrl}
                      alt={item.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                          {item.name}
                        </Typography>
                        {isItemSelected(item) && (
                          <CheckCircleIcon color="primary" fontSize="small" />
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {item.serialNumber}
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        <Chip
                          icon={getStatusIcon(item.status)}
                          label={item.status}
                          size="small"
                          color={getStatusColor(item.status) as any}
                          sx={{ textTransform: 'capitalize' }}
                        />
                        <Chip
                          icon={<CategoryIcon fontSize="small" />}
                          label={item.category}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Condition:
                        </Typography>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: getConditionColor(item.condition)
                          }}
                        />
                      </Box>

                      {item.assignedTo && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Assigned to: {item.assignedTo}
                        </Typography>
                      )}

                      {item.location && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          📍 {item.location}
                        </Typography>
                      )}

                      {item.nfcTagId && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <QrCodeIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {item.nfcTagId}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>

          {/* Selected Items Summary */}
          {selectedItems.length > 0 && (
            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Selected Items ({selectedItems.length}):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedItems.map((item) => (
                  <Chip
                    key={item.id}
                    label={`${item.name} (${item.serialNumber})`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default ItemSelector;