'use client';

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
  Alert,
  Divider,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Computer as ComputerIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Payment as PaymentIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Mock data for devices
const mockDevices = [
  {
    id: 1,
    name: 'John\'s iPhone',
    type: 'smartphone',
    operator: 'John Doe',
    status: 'active',
    lastSeen: '2024-01-15 10:30 AM',
    monthlyFee: 15,
    paymentStatus: 'paid'
  },
  {
    id: 2,
    name: 'Warehouse Tablet',
    type: 'tablet',
    operator: 'Jane Smith',
    status: 'active',
    lastSeen: '2024-01-15 09:45 AM',
    monthlyFee: 25,
    paymentStatus: 'paid'
  },
  {
    id: 3,
    name: 'Office PC',
    type: 'computer',
    operator: 'Mike Johnson',
    status: 'pending_approval',
    lastSeen: 'Never',
    monthlyFee: 35,
    paymentStatus: 'pending_eft'
  }
];

const deviceTypes = [
  { value: 'smartphone', label: 'Smartphone', icon: <SmartphoneIcon />, monthlyFee: 15 },
  { value: 'tablet', label: 'Tablet', icon: <TabletIcon />, monthlyFee: 25 },
  { value: 'computer', label: 'Computer/PC', icon: <ComputerIcon />, monthlyFee: 35 }
];

export default function DeviceManagement() {
  const [devices, setDevices] = useState(mockDevices);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'smartphone',
    operator: '',
    operatorEmail: ''
  });

  // Calculate subscription info
  const totalDevices = devices.length;
  const activeDevices = devices.filter(d => d.status === 'active').length;
  const monthlyTotal = devices.reduce((sum, device) => {
    const deviceType = deviceTypes.find(t => t.value === device.type);
    return sum + (deviceType ? deviceType.monthlyFee : 0);
  }, 0);
  const pendingPayments = devices.filter(d => d.paymentStatus === 'pending_eft').length;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddDevice = () => {
    setFormData({
      name: '',
      type: 'smartphone',
      operator: '',
      operatorEmail: ''
    });
    setOpenDialog(true);
  };

  const handleSaveDevice = () => {
    const deviceType = deviceTypes.find(t => t.value === formData.type);
    const newDevice = {
      id: devices.length + 1,
      name: formData.name,
      type: formData.type,
      operator: formData.operator,
      status: 'pending_approval',
      lastSeen: 'Never',
      monthlyFee: deviceType.monthlyFee,
      paymentStatus: 'pending_eft'
    };
    
    setDevices(prev => [...prev, newDevice]);
    setOpenDialog(false);
    
    // Show success message or notification here
    alert('Device added successfully! Awaiting EFT payment confirmation to activate.');
  };

  const handleDeleteDevice = (deviceId) => {
    setDevices(prev => prev.filter(device => device.id !== deviceId));
  };

  const getDeviceIcon = (type) => {
    const deviceType = deviceTypes.find(t => t.value === type);
    return deviceType ? deviceType.icon : <SmartphoneIcon />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending_eft': return 'info';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Device Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddDevice}
        >
          Add Device
        </Button>
      </Box>

      {/* Subscription Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <SmartphoneIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{totalDevices}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Devices
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <ActiveIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{activeDevices}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Devices
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <PaymentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">${monthlyTotal}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Total
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: pendingPayments > 0 ? 'warning.main' : 'success.main', mr: 2 }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{pendingPayments}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Payments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pricing Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Device Pricing
          </Typography>
          <Grid container spacing={2}>
            {deviceTypes.map((type) => (
              <Grid item xs={12} md={4} key={type.value}>
                <Box display="flex" alignItems="center" sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {type.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">{type.label}</Typography>
                    <Typography variant="h6" color="primary">
                      ${type.monthlyFee}/month
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Devices Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Registered Devices
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Device</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Operator</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Seen</TableCell>
                  <TableCell>Monthly Fee</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getDeviceIcon(device.type)}
                        </Avatar>
                        <Typography variant="subtitle2">
                          {device.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={deviceTypes.find(t => t.value === device.type)?.label || device.type}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{device.operator}</TableCell>
                    <TableCell>
                      <Chip 
                        label={device.status}
                        color={getStatusColor(device.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{device.lastSeen}</TableCell>
                    <TableCell>${device.monthlyFee}</TableCell>
                    <TableCell>
                      <Chip 
                        label={device.paymentStatus}
                        color={getPaymentStatusColor(device.paymentStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Delete Device">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteDevice(device.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Device Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Device</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Device Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., John's iPhone, Warehouse Tablet"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Device Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Device Type"
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  {deviceTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box display="flex" alignItems="center">
                        {type.icon}
                        <Box sx={{ ml: 1 }}>
                          {type.label} - ${type.monthlyFee}/month
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Operator Name"
                value={formData.operator}
                onChange={(e) => handleInputChange('operator', e.target.value)}
                placeholder="Name of the person using this device"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Operator Email"
                type="email"
                value={formData.operatorEmail}
                onChange={(e) => handleInputChange('operatorEmail', e.target.value)}
                placeholder="operator@company.com"
              />
            </Grid>
          </Grid>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              After adding the device, please make an EFT payment to activate it.
              Contact support for banking details. Monthly billing will begin once payment is confirmed.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveDevice} 
            variant="contained"
            disabled={!formData.name || !formData.operator}
          >
            Add Device
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}