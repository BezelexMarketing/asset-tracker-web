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
  FormControlLabel,
  Switch,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Engineering as OperatorIcon,
  SupervisorAccount as SuperAdminIcon,
  Block as BlockIcon,
  CheckCircle as ActivateIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

// Mock data - in real app, fetch from API
const mockUsers = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@acme.com',
    role: 'admin',
    status: 'active',
    tenantId: 1,
    tenantName: 'Acme Corporation',
    phone: '+1-555-0123',
    lastLogin: '2024-09-23',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@acme.com',
    role: 'operator',
    status: 'active',
    tenantId: 1,
    tenantName: 'Acme Corporation',
    phone: '+1-555-0124',
    lastLogin: '2024-09-22',
    createdAt: '2024-02-10'
  },
  {
    id: 3,
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@techstart.com',
    role: 'admin',
    status: 'inactive',
    tenantId: 2,
    tenantName: 'TechStart Inc',
    phone: '+1-555-0125',
    lastLogin: '2024-09-15',
    createdAt: '2024-02-20'
  }
];

const mockTenants = [
  { id: 1, name: 'Acme Corporation' },
  { id: 2, name: 'TechStart Inc' },
  { id: 3, name: 'Global Logistics' }
];

function UserManagement({ onShowSnackbar }) {
  const [users, setUsers] = useState(mockUsers);
  const [tenants, setTenants] = useState(mockTenants);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterTenant, setFilterTenant] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'operator',
    status: 'active',
    tenantId: '',
    password: '',
    sendWelcomeEmail: true
  });

  useEffect(() => {
    loadUsers();
    loadTenants();
  }, []);

  const loadUsers = async () => {
    try {
      // In real app, fetch from API
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      onShowSnackbar('Failed to load users', 'error');
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

  const handleOpenDialog = (user = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
        tenantId: user.tenantId,
        password: '',
        sendWelcomeEmail: false
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'operator',
        status: 'active',
        tenantId: '',
        password: '',
        sendWelcomeEmail: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        // Update user
        const updatedUsers = users.map(user =>
          user.id === editingUser.id
            ? { 
                ...user, 
                ...formData,
                tenantName: tenants.find(t => t.id === formData.tenantId)?.name || user.tenantName
              }
            : user
        );
        setUsers(updatedUsers);
        onShowSnackbar('User updated successfully', 'success');
      } else {
        // Create new user
        const newUser = {
          id: Date.now(),
          ...formData,
          tenantName: tenants.find(t => t.id === formData.tenantId)?.name || '',
          lastLogin: null,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setUsers(prev => [...prev, newUser]);
        onShowSnackbar('User created successfully', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save user:', error);
      onShowSnackbar('Failed to save user', 'error');
    }
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleStatusChange = async (user, newStatus) => {
    try {
      const updatedUsers = users.map(u =>
        u.id === user.id ? { ...u, status: newStatus } : u
      );
      setUsers(updatedUsers);
      onShowSnackbar(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`, 'success');
    } catch (error) {
      console.error('Failed to update user status:', error);
      onShowSnackbar('Failed to update user status', 'error');
    }
    handleMenuClose();
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
      try {
        const updatedUsers = users.filter(u => u.id !== user.id);
        setUsers(updatedUsers);
        onShowSnackbar('User deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete user:', error);
        onShowSnackbar('Failed to delete user', 'error');
      }
    }
    handleMenuClose();
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin': return <SuperAdminIcon />;
      case 'admin': return <AdminIcon />;
      case 'operator': return <OperatorIcon />;
      default: return <PersonIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'error';
      case 'admin': return 'primary';
      case 'operator': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  // Filter users based on selected filters
  const filteredUsers = users.filter(user => {
    return (
      (!filterTenant || user.tenantId.toString() === filterTenant) &&
      (!filterRole || user.role === filterRole) &&
      (!filterStatus || user.status === filterStatus)
    );
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User
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
                <InputLabel>Filter by Role</InputLabel>
                <Select
                  value={filterRole}
                  label="Filter by Role"
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="super_admin">Super Admin</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="operator">Operator</MenuItem>
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
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                onClick={() => {
                  setFilterTenant('');
                  setFilterRole('');
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

      {/* Users Table */}
      <Card elevation={2}>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: getRoleColor(user.role) + '.main' }}>
                            {getRoleIcon(user.role)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {user.firstName} {user.lastName}
                            </Typography>
                            {user.phone && (
                              <Typography variant="body2" color="text.secondary">
                                <PhoneIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                {user.phone}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {user.email}
                        </Box>
                      </TableCell>
                      <TableCell>{user.tenantName}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role.replace('_', ' ')}
                          color={getRoleColor(user.role)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          color={getStatusColor(user.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.lastLogin || 'Never'}</TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, user)}
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
            count={filteredUsers.length}
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
        <MenuItem onClick={() => handleOpenDialog(selectedUser)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        
        {selectedUser?.status === 'active' ? (
          <MenuItem onClick={() => handleStatusChange(selectedUser, 'inactive')}>
            <ListItemIcon>
              <BlockIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Deactivate</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleStatusChange(selectedUser, 'active')}>
            <ListItemIcon>
              <ActivateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Activate</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={() => handleDeleteUser(selectedUser)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={tenants}
                getOptionLabel={(option) => option.name}
                value={tenants.find(t => t.id === formData.tenantId) || null}
                onChange={(event, newValue) => {
                  handleInputChange('tenantId', newValue ? newValue.id : '');
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Tenant" required />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => handleInputChange('role', e.target.value)}
                >
                  <MenuItem value="operator">Operator</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="super_admin">Super Admin</MenuItem>
                </Select>
              </FormControl>
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
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={editingUser ? "New Password (leave blank to keep current)" : "Password"}
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required={!editingUser}
              />
            </Grid>
            
            {!editingUser && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.sendWelcomeEmail}
                      onChange={(e) => handleInputChange('sendWelcomeEmail', e.target.checked)}
                    />
                  }
                  label="Send welcome email with login credentials"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserManagement;