'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Tab,
  Tabs,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Build as MaintenanceIcon,
  Nfc as NfcIcon,
  QrCode as QrCodeIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Mock data for development
const mockItemData = {
  '1': {
    id: '1',
    name: 'MacBook Pro 16"',
    serialNumber: 'MBP001',
    category: 'Laptops',
    status: 'assigned',
    assignedTo: 'John Doe',
    assignedToId: 'user123',
    location: 'Office Floor 2',
    nfcTagId: 'NFC001',
    qrCode: 'QR001',
    lastScanned: '2024-01-15T10:30:00Z',
    purchaseDate: '2023-12-01',
    purchasePrice: 2499.99,
    description: 'High-performance laptop for development work',
    manufacturer: 'Apple',
    model: 'MacBook Pro 16-inch',
    warranty: '2024-12-01',
    imageUrl: null,
    metadata: {
      processor: 'M2 Pro',
      memory: '32GB',
      storage: '1TB SSD'
    }
  }
};

const mockHistory = [
  {
    id: '1',
    type: 'assigned',
    timestamp: '2024-01-15T10:30:00Z',
    user: 'Admin User',
    operator: 'John Doe',
    location: 'Office Floor 2',
    notes: 'Assigned for development project'
  },
  {
    id: '2',
    type: 'checkin',
    timestamp: '2024-01-10T14:20:00Z',
    user: 'Admin User',
    operator: 'Jane Smith',
    location: 'IT Department',
    notes: 'Returned after project completion'
  },
  {
    id: '3',
    type: 'maintenance',
    timestamp: '2024-01-05T09:15:00Z',
    user: 'Tech Support',
    operator: null,
    location: 'IT Workshop',
    notes: 'Software update and hardware check'
  }
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`item-tabpanel-${index}`}
      aria-labelledby={`item-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  
  const [item, setItem] = useState(mockItemData[itemId] || null);
  const [history, setHistory] = useState(mockHistory);
  const [tabValue, setTabValue] = useState(0);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    operatorId: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    // In a real app, fetch item data from API
    if (!item) {
      // Item not found, could redirect to 404 or inventory page
      console.log('Item not found');
    }
  }, [itemId, item]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'assigned': return 'primary';
      case 'maintenance': return 'warning';
      case 'unassigned': return 'default';
      default: return 'default';
    }
  };

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'assigned': return <AssignmentIcon />;
      case 'checkin': return <PersonIcon />;
      case 'maintenance': return <MaintenanceIcon />;
      default: return <HistoryIcon />;
    }
  };

  const handleAssignItem = () => {
    // In a real app, make API call to assign item
    console.log('Assigning item:', assignmentData);
    setOpenAssignDialog(false);
    // Update item status and add to history
  };

  const handleUnassignItem = () => {
    if (window.confirm('Are you sure you want to unassign this item?')) {
      // In a real app, make API call to unassign item
      console.log('Unassigning item');
    }
  };

  const handleDeleteItem = () => {
    if (window.confirm(`Are you sure you want to delete ${item?.name}? This action cannot be undone.`)) {
      // In a real app, make API call to delete item
      console.log('Deleting item');
      router.push('/inventory');
    }
  };

  if (!item) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Item not found. <Button onClick={() => router.push('/inventory')}>Return to Inventory</Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.push('/inventory')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1">
            {item.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Serial: {item.serialNumber} • Category: {item.category}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setOpenEditDialog(true)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteItem}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Status and Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                {item.category === 'Laptops' ? '💻' : 
                 item.category === 'Tools' ? '🔧' :
                 item.category === 'Vehicles' ? '🚗' :
                 item.category === 'Electronics' ? '📷' : '📦'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Chip
                  label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  color={getStatusColor(item.status)}
                  icon={item.status === 'assigned' ? <AssignmentIcon /> : undefined}
                />
                {item.nfcTagId && (
                  <Chip
                    label={`NFC: ${item.nfcTagId}`}
                    variant="outlined"
                    icon={<NfcIcon />}
                  />
                )}
                {item.qrCode && (
                  <Chip
                    label={`QR: ${item.qrCode}`}
                    variant="outlined"
                    icon={<QrCodeIcon />}
                  />
                )}
              </Box>
              {item.assignedTo && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <PersonIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Assigned to: <strong>{item.assignedTo}</strong>
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                <LocationIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Location: {item.location}
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {item.status === 'assigned' ? (
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={handleUnassignItem}
                  >
                    Unassign Item
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setOpenAssignDialog(true)}
                  >
                    Assign Item
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<MaintenanceIcon />}
                >
                  Maintenance
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Details" icon={<InfoIcon />} />
          <Tab label="History" icon={<HistoryIcon />} />
          <Tab label="Maintenance" icon={<MaintenanceIcon />} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* Item Details */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CategoryIcon /></ListItemIcon>
                  <ListItemText primary="Category" secondary={item.category} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><InfoIcon /></ListItemIcon>
                  <ListItemText primary="Serial Number" secondary={item.serialNumber} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><LocationIcon /></ListItemIcon>
                  <ListItemText primary="Current Location" secondary={item.location} />
                </ListItem>
                {item.description && (
                  <ListItem>
                    <ListItemIcon><InfoIcon /></ListItemIcon>
                    <ListItemText primary="Description" secondary={item.description} />
                  </ListItem>
                )}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Purchase Information</Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CalendarIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Purchase Date" 
                    secondary={new Date(item.purchaseDate).toLocaleDateString()} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><MoneyIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Purchase Price" 
                    secondary={`$${item.purchasePrice.toLocaleString()}`} 
                  />
                </ListItem>
                {item.manufacturer && (
                  <ListItem>
                    <ListItemIcon><InfoIcon /></ListItemIcon>
                    <ListItemText primary="Manufacturer" secondary={item.manufacturer} />
                  </ListItem>
                )}
                {item.model && (
                  <ListItem>
                    <ListItemIcon><InfoIcon /></ListItemIcon>
                    <ListItemText primary="Model" secondary={item.model} />
                  </ListItem>
                )}
              </List>
            </Grid>
            {item.metadata && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Technical Specifications</Typography>
                <Grid container spacing={2}>
                  {Object.entries(item.metadata).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Typography>
                        <Typography variant="body1">{value}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* History */}
          <Typography variant="h6" gutterBottom>Activity History</Typography>
          <List>
            {history.map((event, index) => (
              <React.Fragment key={event.id}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    {getHistoryIcon(event.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(event.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          By: {event.user}
                          {event.operator && ` • Operator: ${event.operator}`}
                        </Typography>
                        <Typography variant="body2">
                          Location: {event.location}
                        </Typography>
                        {event.notes && (
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            Notes: {event.notes}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < history.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Maintenance */}
          <Typography variant="h6" gutterBottom>Maintenance Records</Typography>
          <Alert severity="info">
            Maintenance tracking functionality will be implemented in the next phase.
          </Alert>
        </TabPanel>
      </Paper>

      {/* Assignment Dialog */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Item</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Operator/Employee"
              value={assignmentData.operatorId}
              onChange={(e) => setAssignmentData({...assignmentData, operatorId: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Location"
              value={assignmentData.location}
              onChange={(e) => setAssignmentData({...assignmentData, location: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              value={assignmentData.notes}
              onChange={(e) => setAssignmentData({...assignmentData, notes: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignItem}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1 }}>
            Item editing functionality will be implemented in the next phase.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}