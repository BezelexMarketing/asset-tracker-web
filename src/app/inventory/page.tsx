'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Divider,
  Paper,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Snackbar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Inventory as InventoryIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  CloudSync as CloudSyncIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import ProtectedRoute from '@/components/ProtectedRoute';
import ItemSelector from '@/components/ItemSelector';
import ActionPanel from '@/components/ActionPanel';
import ClientLookup from '@/components/ClientLookup';
import Navigation from '@/components/Navigation';
import { createActionLog, formatTimestamp } from '@/lib/utils';
import type { Client, Item } from '@/types/types';

const steps = [
  'Select Client',
  'Find Item',
  'Inventory Action',
  'Confirmation'
];

// Mock activity logs
const mockActivityLogs = [
  {
    id: '1',
    timestamp: '2024-01-20T10:30:00Z',
    action: 'Item Added',
    user: 'John Doe',
    client: 'TechCorp Solutions',
    item: 'MacBook Pro 16"',
    details: 'New item added to inventory',
    type: 'success'
  },
  {
    id: '2',
    timestamp: '2024-01-20T09:15:00Z',
    action: 'Bulk Import',
    user: 'Jane Smith',
    client: 'BuildRight Construction',
    item: '25 items',
    details: 'Bulk import completed successfully',
    type: 'success'
  },
  {
    id: '3',
    timestamp: '2024-01-20T08:45:00Z',
    action: 'Status Update',
    user: 'Mike Johnson',
    client: 'TechCorp Solutions',
    item: 'Drill Set Professional',
    details: 'Status changed from Available to Maintenance',
    type: 'warning'
  },
  {
    id: '4',
    timestamp: '2024-01-19T16:20:00Z',
    action: 'Data Sync',
    user: 'System',
    client: 'All Clients',
    item: 'Database',
    details: 'Automatic data synchronization completed',
    type: 'info'
  }
];

export default function InventoryPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [clientLookupOpen, setClientLookupOpen] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [completedAction, setCompletedAction] = useState<ActionLog | null>(null);
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
  const [openBulkImportDialog, setOpenBulkImportDialog] = useState(false);
  const [openActivityLogDialog, setOpenActivityLogDialog] = useState(false);
  const [newItemData, setNewItemData] = useState({
    name: '',
    description: '',
    category: '',
    serialNumber: '',
    nfcTag: '',
    manufacturer: '',
    model: ''
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null);
  const [bulkImportProgress, setBulkImportProgress] = useState(0);
  const [bulkImportStatus, setBulkImportStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'error'>('idle');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [activityLogs, setActivityLogs] = useState(mockActivityLogs);

  const handleClientSelected = (client: Client) => {
    setSelectedClient(client);
    setClientLookupOpen(false);
    setActiveStep(1);
  };

  const handleItemChange = (item: Item | null) => {
    setSelectedItem(item);
    if (item && selectedClient) {
      setActiveStep(2);
    } else if (selectedClient) {
      setActiveStep(1);
    }
    setCompletedAction(null);
  };

  const handleActionComplete = (actionLog: ActionLog) => {
    setCompletedAction(actionLog);
    setActiveStep(3);
    
    // Add to activity logs
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action: 'Inventory Action',
      user: 'Current User',
      client: selectedClient?.name || 'Unknown',
      item: selectedItem?.name || 'Unknown',
      details: `Action completed: ${actionLog.action}`,
      type: 'success' as const
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const handleNewAction = () => {
    setActiveStep(0);
    setSelectedClient(null);
    setSelectedItem(null);
    setCompletedAction(null);
    setClientLookupOpen(true);
  };

  const handleAddNewItem = async () => {
    if (!selectedClient) return;

    try {
      // Create new item
      const newItem: Item = {
        id: generateId(),
        ...newItemData,
        status: 'available',
        currentClientId: selectedClient.id,
        createdAt: formatTimestamp(),
        updatedAt: formatTimestamp()
      };

      // Log the creation action with client context
      const actionLog = createActionLog(
        selectedClient.id,
        newItem.id,
        'inventory-add',
        'current-user',
        `New item added to inventory for ${selectedClient.name}`,
        {
          itemName: newItem.name,
          clientName: selectedClient.name,
          action: 'created',
          timestamp: formatTimestamp()
        }
      );

      // Add to activity logs
      const newLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: 'Item Added',
        user: 'Current User',
        client: selectedClient.name,
        item: newItem.name,
        details: 'New item added to inventory',
        type: 'success' as const
      };
      setActivityLogs(prev => [newLog, ...prev]);

      // Reset form and close dialog
      setNewItemData({
        name: '',
        description: '',
        category: '',
        serialNumber: '',
        nfcTag: '',
        manufacturer: '',
        model: ''
      });
      setUploadedImages([]);
      setOpenAddItemDialog(false);

      // Set the new item as selected and proceed to action step
      setSelectedItem(newItem);
      setActiveStep(2);
      
      setSnackbarMessage('Item added successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error adding new item:', error);
      setSnackbarMessage('Error adding item. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkImportFile || !selectedClient) return;

    setBulkImportStatus('processing');
    setBulkImportProgress(0);

    try {
      // Simulate bulk import process
      const totalSteps = 100;
      for (let i = 0; i <= totalSteps; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setBulkImportProgress(i);
      }

      // Add to activity logs
      const newLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: 'Bulk Import',
        user: 'Current User',
        client: selectedClient.name,
        item: 'Multiple items',
        details: `Bulk import completed from ${bulkImportFile.name}`,
        type: 'success' as const
      };
      setActivityLogs(prev => [newLog, ...prev]);

      setBulkImportStatus('completed');
      setSnackbarMessage('Bulk import completed successfully!');
      setSnackbarOpen(true);
      
      setTimeout(() => {
        setOpenBulkImportDialog(false);
        setBulkImportFile(null);
        setBulkImportStatus('idle');
        setBulkImportProgress(0);
      }, 2000);
    } catch (error) {
      setBulkImportStatus('error');
      setSnackbarMessage('Bulk import failed. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const handleDataSync = async () => {
    setSyncStatus('syncing');
    
    try {
      // Simulate data sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Add to activity logs
      const newLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: 'Data Sync',
        user: 'Current User',
        client: 'All Clients',
        item: 'Database',
        details: 'Manual data synchronization completed',
        type: 'info' as const
      };
      setActivityLogs(prev => [newLog, ...prev]);

      setSyncStatus('completed');
      setSnackbarMessage('Data synchronized successfully!');
      setSnackbarOpen(true);
      
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      setSyncStatus('error');
      setSnackbarMessage('Data sync failed. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return <HistoryIcon sx={{ color: 'info.main' }} />;
    }
  };

  return (
    <ProtectedRoute>
      <Navigation />
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <InventoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            Inventory Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your inventory with client-specific tracking and universal timestamping
          </Typography>
        </Box>

        {/* Progress Stepper */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label} completed={index < activeStep}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* Step 1: Client Selection - Now handled by ClientLookup */}
            {activeStep >= 0 && selectedClient && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Selected Context
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Chip 
                      label={`Client: ${selectedClient.name}`} 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    All inventory actions will be associated with this client.
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Item Selection */}
            {activeStep >= 1 && selectedClient && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenAddItemDialog(true)}
                      disabled={activeStep > 2}
                    >
                      Add New Item
                    </Button>
                  </Box>
                  
                  <ItemSelector
                    selectedItem={selectedItem}
                    onItemChange={handleItemChange}
                    disabled={activeStep > 2 && !completedAction}
                    filterByClient={selectedClient.id}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Action Panel */}
            {activeStep >= 2 && selectedItem && selectedClient && !completedAction && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <ActionPanel
                    actionType="inventory"
                    selectedItem={selectedItem}
                    selectedClient={selectedClient}
                    onActionComplete={handleActionComplete}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 4: Auto-Save Confirmation */}
            {activeStep >= 3 && completedAction && (
              <Card>
                <CardContent>
                  <AutoSaveConfirmation
                    actionLog={completedAction}
                    onNewAction={handleNewAction}
                    showActions={true}
                  />
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Quick Actions */}
        {activeStep === 0 && (
          <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'primary.50' } }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <InventoryIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">View All Items</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Browse complete inventory
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'success.50' } }}
                  onClick={() => setOpenBulkImportDialog(true)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <UploadIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6">Bulk Import</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Import multiple items
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'warning.50' } }}
                  onClick={() => setOpenActivityLogDialog(true)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <HistoryIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h6">Activity Log</Typography>
                    <Typography variant="body2" color="text.secondary">
                      View recent changes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'info.50' } }}
                  onClick={handleDataSync}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    {syncStatus === 'syncing' ? (
                      <CircularProgress size={40} sx={{ mb: 1 }} />
                    ) : (
                      <CloudSyncIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    )}
                    <Typography variant="h6">Sync Data</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {syncStatus === 'syncing' ? 'Syncing...' : 'Refresh inventory data'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Add New Item Dialog */}
        <Dialog open={openAddItemDialog} onClose={() => setOpenAddItemDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Item Name"
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Serial Number"
                  value={newItemData.serialNumber}
                  onChange={(e) => setNewItemData({ ...newItemData, serialNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={newItemData.description}
                  onChange={(e) => setNewItemData({ ...newItemData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newItemData.category}
                    onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value })}
                  >
                    <MenuItem value="Machinery">Machinery</MenuItem>
                    <MenuItem value="Safety Equipment">Safety Equipment</MenuItem>
                    <MenuItem value="IT Equipment">IT Equipment</MenuItem>
                    <MenuItem value="Tools">Tools</MenuItem>
                    <MenuItem value="Vehicles">Vehicles</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="NFC Tag ID"
                  value={newItemData.nfcTag}
                  onChange={(e) => setNewItemData({ ...newItemData, nfcTag: e.target.value })}
                  placeholder="Optional"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Manufacturer"
                  value={newItemData.manufacturer}
                  onChange={(e) => setNewItemData({ ...newItemData, manufacturer: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Model"
                  value={newItemData.model}
                  onChange={(e) => setNewItemData({ ...newItemData, model: e.target.value })}
                />
              </Grid>
              
              {/* Image Upload Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Item Images
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    multiple
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                      fullWidth
                    >
                      Upload Images
                    </Button>
                  </label>
                </Box>
                
                {uploadedImages.length > 0 && (
                  <Grid container spacing={2}>
                    {uploadedImages.map((image, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Card sx={{ position: 'relative' }}>
                          <Box
                            component="img"
                            src={image}
                            alt={`Item image ${index + 1}`}
                            sx={{
                              width: '100%',
                              height: 120,
                              objectFit: 'cover'
                            }}
                          />
                          <Button
                            size="small"
                            color="error"
                            onClick={() => removeImage(index)}
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              minWidth: 'auto',
                              p: 0.5,
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)'
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </Button>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddItemDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleAddNewItem} 
              variant="contained"
              disabled={!newItemData.name.trim()}
            >
              Add Item
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Import Dialog */}
        <Dialog open={openBulkImportDialog} onClose={() => setOpenBulkImportDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Bulk Import Items</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload a CSV file with item data. The file should include columns: Name, Description, Category, Serial Number, Manufacturer, Model.
              </Typography>
              
              <input
                accept=".csv,.xlsx,.xls"
                style={{ display: 'none' }}
                id="bulk-import-file"
                type="file"
                onChange={(e) => setBulkImportFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="bulk-import-file">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Select File
                </Button>
              </label>
              
              {bulkImportFile && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Selected file: {bulkImportFile.name}
                </Alert>
              )}
              
              {bulkImportStatus === 'processing' && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Processing... {bulkImportProgress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={bulkImportProgress} />
                </Box>
              )}
              
              {bulkImportStatus === 'completed' && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Bulk import completed successfully!
                </Alert>
              )}
              
              {bulkImportStatus === 'error' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Bulk import failed. Please check your file format and try again.
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBulkImportDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleBulkImport} 
              variant="contained"
              disabled={!bulkImportFile || bulkImportStatus === 'processing'}
            >
              {bulkImportStatus === 'processing' ? 'Processing...' : 'Import'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Activity Log Dialog */}
        <Dialog open={openActivityLogDialog} onClose={() => setOpenActivityLogDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Activity Log
              <IconButton onClick={() => setOpenActivityLogDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <List>
              {activityLogs.map((log, index) => (
                <React.Fragment key={log.id}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {getActivityIcon(log.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{log.action}</Typography>
                          <Chip label={log.client} size="small" variant="outlined" />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {log.details}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.user} • {new Date(log.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < activityLogs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </DialogContent>
        </Dialog>

        {/* Client Lookup Dialog */}
        <ClientLookup
          open={clientLookupOpen}
          onClose={() => {}}
          onClientSelected={handleClientSelected}
          title="Select Client for Inventory"
          subtitle="Choose the client to manage inventory for"
          required={true}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => setSnackbarOpen(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
      </Box>
    </ProtectedRoute>
  );
}