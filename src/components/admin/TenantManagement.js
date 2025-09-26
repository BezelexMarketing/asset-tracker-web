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
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  CheckCircle as ActivateIcon
} from '@mui/icons-material';

// Mock data - in real app, fetch from API
const mockTenants = [
  {
    id: 1,
    name: 'Acme Corporation',
    adminEmail: 'admin@acme.com',
    status: 'active',
    userCount: 25,
    itemCount: 150,
    createdAt: '2024-01-15',
    lastActivity: '2024-09-23',
    subscription: 'premium',
    deviceLimit: 100
  },
  {
    id: 2,
    name: 'TechStart Inc',
    adminEmail: 'admin@techstart.com',
    status: 'active',
    userCount: 12,
    itemCount: 75,
    createdAt: '2024-02-20',
    lastActivity: '2024-09-22',
    subscription: 'standard',
    deviceLimit: 50
  },
  {
    id: 3,
    name: 'Global Logistics',
    adminEmail: 'admin@globallogistics.com',
    status: 'suspended',
    userCount: 45,
    itemCount: 300,
    createdAt: '2023-11-10',
    lastActivity: '2024-09-20',
    subscription: 'enterprise',
    deviceLimit: 500
  }
];

function TenantManagement({ onShowSnackbar }) {
  const [tenants, setTenants] = useState(mockTenants);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    adminEmail: '',
    adminPassword: '',
    adminFirstName: '',
    adminLastName: '',
    subscription: 'standard',
    deviceLimit: 50,
    status: 'active'
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      // In real app, fetch from API
      // const response = await fetch('/api/tenants');
      // const data = await response.json();
      // setTenants(data);
      
      setTenants(mockTenants);
    } catch (error) {
      console.error('Failed to load tenants:', error);
      onShowSnackbar('Failed to load tenants', 'error');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (tenant = null) => {
    setEditingTenant(tenant);
    if (tenant) {
      setFormData({
        name: tenant.name,
        adminEmail: tenant.adminEmail,
        adminPassword: '',
        adminFirstName: '',
        adminLastName: '',
        subscription: tenant.subscription,
        deviceLimit: tenant.deviceLimit,
        status: tenant.status
      });
    } else {
      setFormData({
        name: '',
        adminEmail: '',
        adminPassword: '',
        adminFirstName: '',
        adminLastName: '',
        subscription: 'standard',
        deviceLimit: 50,
        status: 'active'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTenant(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingTenant) {
        // Update tenant
        const updatedTenants = tenants.map(tenant =>
          tenant.id === editingTenant.id
            ? { ...tenant, ...formData }
            : tenant
        );
        setTenants(updatedTenants);
        onShowSnackbar('Tenant updated successfully', 'success');
      } else {
        // Create new tenant
        const newTenant = {
          id: Date.now(),
          ...formData,
          userCount: 1,
          itemCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
          lastActivity: new Date().toISOString().split('T')[0]
        };
        setTenants(prev => [...prev, newTenant]);
        onShowSnackbar('Tenant created successfully', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save tenant:', error);
      onShowSnackbar('Failed to save tenant', 'error');
    }
  };

  const handleMenuOpen = (event, tenant) => {
    setAnchorEl(event.currentTarget);
    setSelectedTenant(tenant);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTenant(null);
  };

  const handleStatusChange = async (tenant, newStatus) => {
    try {
      const updatedTenants = tenants.map(t =>
        t.id === tenant.id ? { ...t, status: newStatus } : t
      );
      setTenants(updatedTenants);
      onShowSnackbar(`Tenant ${newStatus === 'active' ? 'activated' : 'suspended'}`, 'success');
    } catch (error) {
      console.error('Failed to update tenant status:', error);
      onShowSnackbar('Failed to update tenant status', 'error');
    }
    handleMenuClose();
  };

  const handleDeleteTenant = async (tenant) => {
    if (window.confirm(`Are you sure you want to delete ${tenant.name}? This action cannot be undone.`)) {
      try {
        const updatedTenants = tenants.filter(t => t.id !== tenant.id);
        setTenants(updatedTenants);
        onShowSnackbar('Tenant deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete tenant:', error);
        onShowSnackbar('Failed to delete tenant', 'error');
      }
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getSubscriptionColor = (subscription) => {
    switch (subscription) {
      case 'enterprise': return 'primary';
      case 'premium': return 'secondary';
      case 'standard': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Tenant Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Tenant
        </Button>
      </Box>

      {/* Tenants Table */}
      <Card elevation={2}>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Admin Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Subscription</TableCell>
                  <TableCell align="center">Users</TableCell>
                  <TableCell align="center">Items</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((tenant) => (
                    <TableRow key={tenant.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            <BusinessIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {tenant.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {tenant.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{tenant.adminEmail}</TableCell>
                      <TableCell>
                        <Chip
                          label={tenant.status}
                          color={getStatusColor(tenant.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tenant.subscription}
                          color={getSubscriptionColor(tenant.subscription)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" justifyContent="center">
                          <PeopleIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {tenant.userCount}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" justifyContent="center">
                          <InventoryIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {tenant.itemCount}
                        </Box>
                      </TableCell>
                      <TableCell>{tenant.createdAt}</TableCell>
                      <TableCell>{tenant.lastActivity}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, tenant)}
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
            count={tenants.length}
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
        <MenuItem onClick={() => handleOpenDialog(selectedTenant)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        
        {selectedTenant?.status === 'active' ? (
          <MenuItem onClick={() => handleStatusChange(selectedTenant, 'suspended')}>
            <ListItemIcon>
              <BlockIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Suspend</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleStatusChange(selectedTenant, 'active')}>
            <ListItemIcon>
              <ActivateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Activate</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={() => handleDeleteTenant(selectedTenant)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tenant Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Admin Email"
                type="email"
                value={formData.adminEmail}
                onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                required
              />
            </Grid>
            
            {!editingTenant && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Admin First Name"
                    value={formData.adminFirstName}
                    onChange={(e) => handleInputChange('adminFirstName', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Admin Last Name"
                    value={formData.adminLastName}
                    onChange={(e) => handleInputChange('adminLastName', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Admin Password"
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                    required
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Subscription</InputLabel>
                <Select
                  value={formData.subscription}
                  label="Subscription"
                  onChange={(e) => handleInputChange('subscription', e.target.value)}
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                  <MenuItem value="enterprise">Enterprise</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Device Limit"
                type="number"
                value={formData.deviceLimit}
                onChange={(e) => handleInputChange('deviceLimit', parseInt(e.target.value))}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTenant ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TenantManagement;