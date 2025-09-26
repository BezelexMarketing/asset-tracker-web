import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
  Badge,
  ImageList,
  ImageListItem,
  ImageListItemBar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  CheckCircle as AvailableIcon,
  Schedule as MaintenanceIcon,
  Error as DamagedIcon,
  PhotoCamera as PhotoIcon,
  NfcOutlined as NfcIcon,
  QrCode as QrCodeIcon,
  Upload as UploadIcon
} from '@mui/icons-material';

// Mock data - in real app, fetch from API
const mockItems = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    description: 'High-performance laptop for development',
    category: 'Electronics',
    serialNumber: 'MBP-001-2024',
    nfcTagId: 'NFC001',
    status: 'assigned',
    assignedTo: 'John Doe',
    tenantId: 1,
    tenantName: 'Acme Corporation',
    images: ['https://via.placeholder.com/150x150?text=MacBook'],
    purchaseDate: '2024-01-15',
    purchasePrice: 2499.99,
    location: 'Office Floor 2',
    lastActivity: '2024-09-23'
  },
  {
    id: 2,
    name: 'Drill Set Professional',
    description: 'Professional grade drill with accessories',
    category: 'Tools',
    serialNumber: 'DRL-045-2024',
    nfcTagId: 'NFC045',
    status: 'available',
    assignedTo: null,
    tenantId: 1,
    tenantName: 'Acme Corporation',
    images: ['https://via.placeholder.com/150x150?text=Drill'],
    purchaseDate: '2024-02-10',
    purchasePrice: 299.99,
    location: 'Warehouse A',
    lastActivity: '2024-09-22'
  },
  {
    id: 3,
    name: 'Company Vehicle',
    description: 'Ford Transit Van for deliveries',
    category: 'Vehicles',
    serialNumber: 'VH-012-2024',
    nfcTagId: 'NFC012',
    status: 'maintenance',
    assignedTo: 'Mike Johnson',
    tenantId: 2,
    tenantName: 'TechStart Inc',
    images: ['https://via.placeholder.com/150x150?text=Van'],
    purchaseDate: '2023-11-10',
    purchasePrice: 35000.00,
    location: 'Parking Lot',
    lastActivity: '2024-09-20'
  }
];

const mockTenants = [
  { id: 1, name: 'Acme Corporation' },
  { id: 2, name: 'TechStart Inc' },
  { id: 3, name: 'Global Logistics' }
];

const categories = [
  'Electronics',
  'Tools',
  'Vehicles',
  'Furniture',
  'Equipment',
  'Supplies',
  'Other'
];

function ItemManagement({ onShowSnackbar }) {
  const [items, setItems] = useState(mockItems);
  const [tenants, setTenants] = useState(mockTenants);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterTenant, setFilterTenant] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    serialNumber: '',
    nfcTagId: '',
    tenantId: '',
    purchaseDate: '',
    purchasePrice: '',
    location: '',
    images: []
  });

  useEffect(() => {
    loadItems();
    loadTenants();
  }, []);

  const loadItems = async () => {
    try {
      // In real app, fetch from API
      setItems(mockItems);
    } catch (error) {
      console.error('Failed to load items:', error);
      onShowSnackbar('Failed to load items', 'error');
    }
  };

  const loadTenants = async () => {
    try {
      // In real app, fetch from API
      setTenants(mockTenants);
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        category: item.category,
        serialNumber: item.serialNumber,
        nfcTagId: item.nfcTagId,
        tenantId: item.tenantId,
        purchaseDate: item.purchaseDate,
        purchasePrice: item.purchasePrice,
        location: item.location,
        images: item.images || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        serialNumber: '',
        nfcTagId: '',
        tenantId: '',
        purchaseDate: '',
        purchasePrice: '',
        location: '',
        images: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    // In real app, upload to cloud storage and get URLs
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        // Update item
        const updatedItems = items.map(item =>
          item.id === editingItem.id
            ? { 
                ...item, 
                ...formData,
                tenantName: tenants.find(t => t.id === formData.tenantId)?.name || item.tenantName,
                status: item.status // Keep existing status
              }
            : item
        );
        setItems(updatedItems);
        onShowSnackbar('Item updated successfully', 'success');
      } else {
        // Create new item
        const newItem = {
          id: Date.now(),
          ...formData,
          tenantName: tenants.find(t => t.id === formData.tenantId)?.name || '',
          status: 'available',
          assignedTo: null,
          lastActivity: new Date().toISOString().split('T')[0]
        };
        setItems(prev => [...prev, newItem]);
        onShowSnackbar('Item created successfully', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save item:', error);
      onShowSnackbar('Failed to save item', 'error');
    }
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleDeleteItem = async (item) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}? This action cannot be undone.`)) {
      try {
        const updatedItems = items.filter(i => i.id !== item.id);
        setItems(updatedItems);
        onShowSnackbar('Item deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete item:', error);
        onShowSnackbar('Failed to delete item', 'error');
      }
    }
    handleMenuClose();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <AvailableIcon />;
      case 'assigned': return <AssignmentIcon />;
      case 'maintenance': return <MaintenanceIcon />;
      case 'damaged': return <DamagedIcon />;
      default: return <InventoryIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'assigned': return 'primary';
      case 'maintenance': return 'warning';
      case 'damaged': return 'error';
      default: return 'default';
    }
  };

  // Filter items based on selected filters
  const filteredItems = items.filter(item => {
    return (
      (!filterTenant || item.tenantId.toString() === filterTenant) &&
      (!filterCategory || item.category === filterCategory) &&
      (!filterStatus || item.status === filterStatus)
    );
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Item Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Item
        </Button>
      </Box>

      {/* Filters */}
      <Card elevation={1} sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Tenant</InputLabel>
                <Select
                  value={filterTenant}
                  label="Filter by Tenant"
                  onChange={(e) => setFilterTenant(e.target.value)}
                >
                  <MenuItem value="">All Tenants</MenuItem>
                  {tenants.map(tenant => (
                    <MenuItem key={tenant.id} value={tenant.id.toString()}>
                      {tenant.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Category</InputLabel>
                <Select
                  value={filterCategory}
                  label="Filter by Category"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Filter by Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="assigned">Assigned</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="damaged">Damaged</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                onClick={() => {
                  setFilterTenant('');
                  setFilterCategory('');
                  setFilterStatus('');
                }}
                fullWidth
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card elevation={2}>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Serial/NFC</TableCell>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Badge
                            badgeContent={item.images?.length || 0}
                            color="primary"
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                          >
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {item.images?.length > 0 ? <PhotoIcon /> : <InventoryIcon />}
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="subtitle2">
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.category}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {item.serialNumber}
                          </Typography>
                          <Box display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                            <NfcIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {item.nfcTagId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{item.tenantName}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(item.status)}
                          label={item.status}
                          color={getStatusColor(item.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.assignedTo || '-'}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{item.lastActivity}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, item)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredItems.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleOpenDialog(selectedItem)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleDeleteItem(selectedItem)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Item' : 'Add New Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Serial Number"
                value={formData.serialNumber}
                onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="NFC Tag ID"
                value={formData.nfcTagId}
                onChange={(e) => handleInputChange('nfcTagId', e.target.value)}
                InputProps={{
                  startAdornment: <NfcIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tenant</InputLabel>
                <Select
                  value={formData.tenantId}
                  label="Tenant"
                  onChange={(e) => handleInputChange('tenantId', e.target.value)}
                  required
                >
                  {tenants.map(tenant => (
                    <MenuItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Purchase Date"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Purchase Price"
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                InputProps={{
                  startAdornment: '$'
                }}
              />
            </Grid>
            
            {/* Image Upload Section */}
            <Grid item xs={12}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Images
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload Images
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                
                {formData.images.length > 0 && (
                  <ImageList cols={4} rowHeight={120}>
                    {formData.images.map((image, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={image}
                          alt={`Item image ${index + 1}`}
                          loading="lazy"
                          style={{ height: 120, objectFit: 'cover' }}
                        />
                        <ImageListItemBar
                          actionIcon={
                            <IconButton
                              sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                              onClick={() => handleRemoveImage(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ItemManagement;