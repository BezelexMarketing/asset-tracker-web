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
  Autocomplete,
  Stack,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  History as HistoryIcon,
  CheckCircle as CheckInIcon,
  RadioButtonUnchecked as CheckOutIcon,
  SwapHoriz as TransferIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

// Mock data - in real app, fetch from API
const mockAssignments = [
  {
    id: 1,
    itemId: 1,
    itemName: 'MacBook Pro 16"',
    itemSerialNumber: 'MBP-001-2024',
    operatorId: 1,
    operatorName: 'John Doe',
    operatorEmail: 'john.doe@acme.com',
    tenantId: 1,
    tenantName: 'Acme Corporation',
    assignedDate: '2024-09-15',
    assignedBy: 'Admin User',
    status: 'active',
    location: 'Office Floor 2',
    notes: 'Assigned for development work',
    lastActivity: '2024-09-23',
    activityType: 'check-in'
  },
  {
    id: 2,
    itemId: 3,
    itemName: 'Company Vehicle',
    itemSerialNumber: 'VH-012-2024',
    operatorId: 2,
    operatorName: 'Mike Johnson',
    operatorEmail: 'mike.johnson@techstart.com',
    tenantId: 2,
    tenantName: 'TechStart Inc',
    assignedDate: '2024-09-10',
    assignedBy: 'Manager',
    status: 'active',
    location: 'Parking Lot',
    notes: 'For delivery routes',
    lastActivity: '2024-09-20',
    activityType: 'maintenance'
  },
  {
    id: 3,
    itemId: 2,
    itemName: 'Drill Set Professional',
    itemSerialNumber: 'DRL-045-2024',
    operatorId: null,
    operatorName: null,
    operatorEmail: null,
    tenantId: 1,
    tenantName: 'Acme Corporation',
    assignedDate: null,
    assignedBy: null,
    status: 'unassigned',
    location: 'Warehouse A',
    notes: null,
    lastActivity: '2024-09-22',
    activityType: 'check-out'
  }
];

const mockItems = [
  { id: 1, name: 'MacBook Pro 16"', serialNumber: 'MBP-001-2024', tenantId: 1 },
  { id: 2, name: 'Drill Set Professional', serialNumber: 'DRL-045-2024', tenantId: 1 },
  { id: 3, name: 'Company Vehicle', serialNumber: 'VH-012-2024', tenantId: 2 }
];

const mockOperators = [
  { id: 1, name: 'John Doe', email: 'john.doe@acme.com', tenantId: 1 },
  { id: 2, name: 'Mike Johnson', email: 'mike.johnson@techstart.com', tenantId: 2 },
  { id: 3, name: 'Sarah Wilson', email: 'sarah.wilson@acme.com', tenantId: 1 }
];

const mockTenants = [
  { id: 1, name: 'Acme Corporation' },
  { id: 2, name: 'TechStart Inc' },
  { id: 3, name: 'Global Logistics' }
];

function AssignmentManagement({ onShowSnackbar }) {
  const [assignments, setAssignments] = useState(mockAssignments);
  const [items, setItems] = useState(mockItems);
  const [operators, setOperators] = useState(mockOperators);
  const [tenants, setTenants] = useState(mockTenants);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [filterTenant, setFilterTenant] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    itemId: null,
    operatorId: null,
    tenantId: '',
    notes: '',
    location: ''
  });

  useEffect(() => {
    loadAssignments();
    loadItems();
    loadOperators();
    loadTenants();
  }, []);

  const loadAssignments = async () => {
    try {
      // In real app, fetch from API
      setAssignments(mockAssignments);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      onShowSnackbar('Failed to load assignments', 'error');
    }
  };

  const loadItems = async () => {
    try {
      // In real app, fetch from API
      setItems(mockItems);
    } catch (error) {
      console.error('Failed to load items:', error);
    }
  };

  const loadOperators = async () => {
    try {
      // In real app, fetch from API
      setOperators(mockOperators);
    } catch (error) {
      console.error('Failed to load operators:', error);
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

  const handleOpenDialog = (assignment = null) => {
    setEditingAssignment(assignment);
    if (assignment) {
      setFormData({
        itemId: assignment.itemId,
        operatorId: assignment.operatorId,
        tenantId: assignment.tenantId,
        notes: assignment.notes || '',
        location: assignment.location || ''
      });
    } else {
      setFormData({
        itemId: null,
        operatorId: null,
        tenantId: '',
        notes: '',
        location: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAssignment(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingAssignment) {
        // Update assignment
        const updatedAssignments = assignments.map(assignment =>
          assignment.id === editingAssignment.id
            ? { 
                ...assignment, 
                ...formData,
                itemName: items.find(i => i.id === formData.itemId)?.name || assignment.itemName,
                itemSerialNumber: items.find(i => i.id === formData.itemId)?.serialNumber || assignment.itemSerialNumber,
                operatorName: operators.find(o => o.id === formData.operatorId)?.name || null,
                operatorEmail: operators.find(o => o.id === formData.operatorId)?.email || null,
                tenantName: tenants.find(t => t.id === formData.tenantId)?.name || assignment.tenantName,
                status: formData.operatorId ? 'active' : 'unassigned',
                assignedDate: formData.operatorId && !assignment.operatorId ? new Date().toISOString().split('T')[0] : assignment.assignedDate,
                assignedBy: formData.operatorId && !assignment.operatorId ? 'Current User' : assignment.assignedBy
              }
            : assignment
        );
        setAssignments(updatedAssignments);
        onShowSnackbar('Assignment updated successfully', 'success');
      } else {
        // Create new assignment
        const selectedItem = items.find(i => i.id === formData.itemId);
        const selectedOperator = operators.find(o => o.id === formData.operatorId);
        const selectedTenant = tenants.find(t => t.id === formData.tenantId);
        
        const newAssignment = {
          id: Date.now(),
          ...formData,
          itemName: selectedItem?.name || '',
          itemSerialNumber: selectedItem?.serialNumber || '',
          operatorName: selectedOperator?.name || null,
          operatorEmail: selectedOperator?.email || null,
          tenantName: selectedTenant?.name || '',
          status: formData.operatorId ? 'active' : 'unassigned',
          assignedDate: formData.operatorId ? new Date().toISOString().split('T')[0] : null,
          assignedBy: formData.operatorId ? 'Current User' : null,
          lastActivity: new Date().toISOString().split('T')[0],
          activityType: 'assigned'
        };
        setAssignments(prev => [...prev, newAssignment]);
        onShowSnackbar('Assignment created successfully', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save assignment:', error);
      onShowSnackbar('Failed to save assignment', 'error');
    }
  };

  const handleMenuOpen = (event, assignment) => {
    setAnchorEl(event.currentTarget);
    setSelectedAssignment(assignment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAssignment(null);
  };

  const handleUnassign = async (assignment) => {
    if (window.confirm(`Are you sure you want to unassign ${assignment.itemName} from ${assignment.operatorName}?`)) {
      try {
        const updatedAssignments = assignments.map(a =>
          a.id === assignment.id
            ? {
                ...a,
                operatorId: null,
                operatorName: null,
                operatorEmail: null,
                status: 'unassigned',
                assignedDate: null,
                assignedBy: null,
                lastActivity: new Date().toISOString().split('T')[0],
                activityType: 'unassigned'
              }
            : a
        );
        setAssignments(updatedAssignments);
        onShowSnackbar('Item unassigned successfully', 'success');
      } catch (error) {
        console.error('Failed to unassign item:', error);
        onShowSnackbar('Failed to unassign item', 'error');
      }
    }
    handleMenuClose();
  };

  const handleDeleteAssignment = async (assignment) => {
    if (window.confirm(`Are you sure you want to delete this assignment record? This action cannot be undone.`)) {
      try {
        const updatedAssignments = assignments.filter(a => a.id !== assignment.id);
        setAssignments(updatedAssignments);
        onShowSnackbar('Assignment deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete assignment:', error);
        onShowSnackbar('Failed to delete assignment', 'error');
      }
    }
    handleMenuClose();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <AssignmentIcon />;
      case 'unassigned': return <InventoryIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'unassigned': return 'default';
      default: return 'primary';
    }
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'check-in': return <CheckInIcon />;
      case 'check-out': return <CheckOutIcon />;
      case 'assigned': return <AssignmentIcon />;
      case 'unassigned': return <InventoryIcon />;
      case 'maintenance': return <TimelineIcon />;
      case 'transfer': return <TransferIcon />;
      default: return <HistoryIcon />;
    }
  };

  // Filter assignments based on selected filters
  const filteredAssignments = assignments.filter(assignment => {
    return (
      (!filterTenant || assignment.tenantId.toString() === filterTenant) &&
      (!filterStatus || assignment.status === filterStatus)
    );
  });

  // Get available items for the selected tenant
  const availableItems = items.filter(item => 
    !formData.tenantId || item.tenantId.toString() === formData.tenantId.toString()
  );

  // Get available operators for the selected tenant
  const availableOperators = operators.filter(operator => 
    !formData.tenantId || operator.tenantId.toString() === formData.tenantId.toString()
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Assignment Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Assignment
        </Button>
      </Box>

      {/* Filters */}
      <Card elevation={1} sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Filter by Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="unassigned">Unassigned</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                onClick={() => {
                  setFilterTenant('');
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

      {/* Assignments Table */}
      <Card elevation={2}>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Operator</TableCell>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned Date</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAssignments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((assignment) => (
                    <TableRow key={assignment.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            <InventoryIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {assignment.itemName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {assignment.itemSerialNumber}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {assignment.operatorName ? (
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">
                                {assignment.operatorName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {assignment.operatorEmail}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Unassigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{assignment.tenantName}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(assignment.status)}
                          label={assignment.status}
                          color={getStatusColor(assignment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {assignment.assignedDate || '-'}
                        {assignment.assignedBy && (
                          <Typography variant="body2" color="text.secondary">
                            by {assignment.assignedBy}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{assignment.location || '-'}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {getActivityIcon(assignment.activityType)}
                          <Box sx={{ ml: 1 }}>
                            <Typography variant="body2">
                              {assignment.lastActivity}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {assignment.activityType}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, assignment)}
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
            count={filteredAssignments.length}
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
        <MenuItem onClick={() => handleOpenDialog(selectedAssignment)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Assignment</ListItemText>
        </MenuItem>
        
        {selectedAssignment?.status === 'active' && (
          <MenuItem onClick={() => handleUnassign(selectedAssignment)}>
            <ListItemIcon>
              <InventoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Unassign Item</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={() => handleDeleteAssignment(selectedAssignment)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Record</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
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
              <Autocomplete
                options={availableItems}
                getOptionLabel={(option) => `${option.name} (${option.serialNumber})`}
                value={availableItems.find(item => item.id === formData.itemId) || null}
                onChange={(event, newValue) => handleInputChange('itemId', newValue?.id || null)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Item"
                    required
                    fullWidth
                  />
                )}
                disabled={!formData.tenantId}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={availableOperators}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={availableOperators.find(operator => operator.id === formData.operatorId) || null}
                onChange={(event, newValue) => handleInputChange('operatorId', newValue?.id || null)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Operator (Optional)"
                    fullWidth
                  />
                )}
                disabled={!formData.tenantId}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAssignment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AssignmentManagement;