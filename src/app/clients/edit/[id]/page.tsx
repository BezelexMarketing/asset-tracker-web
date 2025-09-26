'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';

interface Asset {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  status: 'active' | 'maintenance' | 'retired';
  maintenanceStatus: 'up_to_date' | 'due' | 'overdue' | 'in_progress';
  location: string;
  purchaseDate: string;
  value: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  status: 'active' | 'inactive';
  totalAssets: number;
  assignedAssets: Asset[];
}

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [addAssetDialogOpen, setAddAssetDialogOpen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);

  // Mock data - in real app, this would come from API
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'John Industries',
      email: 'contact@johnindustries.com',
      phone: '+1 (555) 123-4567',
      address: '123 Business Ave, Suite 100, New York, NY 10001',
      contactPerson: 'John Smith',
      status: 'active',
      totalAssets: 15,
      assignedAssets: []
    },
    {
      id: '2',
      name: 'Tech Solutions Inc',
      email: 'info@techsolutions.com',
      phone: '+1 (555) 987-6543',
      address: '456 Tech Park, Building B, San Francisco, CA 94105',
      contactPerson: 'Sarah Johnson',
      status: 'active',
      totalAssets: 23,
      assignedAssets: []
    },
    {
      id: '3',
      name: 'Global Manufacturing',
      email: 'admin@globalmanuf.com',
      phone: '+1 (555) 456-7890',
      address: '789 Industrial Blvd, Detroit, MI 48201',
      contactPerson: 'Mike Wilson',
      status: 'active',
      totalAssets: 45,
      assignedAssets: []
    }
  ];

  const mockAssets: Asset[] = [
    {
      id: '1',
      name: 'Dell Laptop XPS 13',
      category: 'Electronics',
      serialNumber: 'DL001',
      status: 'active',
      maintenanceStatus: 'up_to_date',
      location: 'Office A',
      purchaseDate: '2023-01-15',
      value: 1200
    },
    {
      id: '2',
      name: 'HP Printer LaserJet',
      category: 'Electronics',
      serialNumber: 'HP002',
      status: 'active',
      maintenanceStatus: 'due',
      location: 'Office B',
      purchaseDate: '2022-11-20',
      value: 800
    },
    {
      id: '3',
      name: 'Conference Table',
      category: 'Furniture',
      serialNumber: 'CT003',
      status: 'active',
      maintenanceStatus: 'up_to_date',
      location: 'Meeting Room 1',
      purchaseDate: '2023-03-10',
      value: 1500
    },
    {
      id: '4',
      name: 'Industrial Drill',
      category: 'Tools',
      serialNumber: 'ID004',
      status: 'maintenance',
      maintenanceStatus: 'in_progress',
      location: 'Workshop',
      purchaseDate: '2022-08-05',
      value: 2500
    },
    {
      id: '5',
      name: 'Safety Equipment Set',
      category: 'Safety',
      serialNumber: 'SE005',
      status: 'active',
      maintenanceStatus: 'overdue',
      location: 'Storage Room',
      purchaseDate: '2022-06-15',
      value: 600
    }
  ];

  useEffect(() => {
    // Simulate API call
    const foundClient = mockClients.find(c => c.id === clientId);
    if (foundClient) {
      // Assign some assets to the client for demo
      const clientAssets = mockAssets.slice(0, Math.floor(Math.random() * 3) + 1);
      foundClient.assignedAssets = clientAssets;
      setClient(foundClient);
      
      // Available assets are those not assigned to this client
      const available = mockAssets.filter(asset => 
        !clientAssets.some(assigned => assigned.id === asset.id)
      );
      setAvailableAssets(available);
    }
    setLoading(false);
  }, [clientId]);

  const handleSave = async () => {
    if (!client) return;
    
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    
    // Show success message and redirect
    router.push('/clients');
  };

  const handleAddAssets = () => {
    if (!client) return;
    
    const updatedClient = {
      ...client,
      assignedAssets: [...client.assignedAssets, ...selectedAssets],
      totalAssets: client.assignedAssets.length + selectedAssets.length
    };
    
    setClient(updatedClient);
    
    // Update available assets
    const newAvailable = availableAssets.filter(asset =>
      !selectedAssets.some(selected => selected.id === asset.id)
    );
    setAvailableAssets(newAvailable);
    
    setSelectedAssets([]);
    setAddAssetDialogOpen(false);
  };

  const handleRemoveAsset = (assetId: string) => {
    if (!client) return;
    
    const assetToRemove = client.assignedAssets.find(a => a.id === assetId);
    if (!assetToRemove) return;
    
    const updatedClient = {
      ...client,
      assignedAssets: client.assignedAssets.filter(a => a.id !== assetId),
      totalAssets: client.assignedAssets.length - 1
    };
    
    setClient(updatedClient);
    setAvailableAssets([...availableAssets, assetToRemove]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'retired': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!client) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Client not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Edit Client: {client.name}
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Client Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Client Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={client.name}
                    onChange={(e) => setClient({ ...client, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={client.email}
                    onChange={(e) => setClient({ ...client, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={client.phone}
                    onChange={(e) => setClient({ ...client, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contact Person"
                    value={client.contactPerson}
                    onChange={(e) => setClient({ ...client, contactPerson: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={3}
                    value={client.address}
                    onChange={(e) => setClient({ ...client, address: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={client.status}
                      label="Status"
                      onChange={(e) => setClient({ ...client, status: e.target.value as 'active' | 'inactive' })}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Asset Management */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Assigned Assets ({client.assignedAssets.length})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setAddAssetDialogOpen(true)}
                  disabled={availableAssets.length === 0}
                >
                  Add Assets
                </Button>
              </Box>

              {client.assignedAssets.length === 0 ? (
                <Alert severity="info">No assets assigned to this client</Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'grey.50' }}>
                        <TableCell>Asset</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {client.assignedAssets.map((asset) => (
                        <TableRow key={asset.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {asset.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {asset.serialNumber}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={asset.status}
                              color={getStatusColor(asset.status) as any}
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>
                          <TableCell>${asset.value.toLocaleString()}</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveAsset(asset.id)}
                            >
                              <RemoveIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Assets Dialog */}
      <Dialog
        open={addAssetDialogOpen}
        onClose={() => setAddAssetDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Assets to {client.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              multiple
              options={availableAssets}
              getOptionLabel={(option) => `${option.name} (${option.serialNumber})`}
              value={selectedAssets}
              onChange={(_, newValue) => setSelectedAssets(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Assets"
                  placeholder="Choose assets to assign"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={`${option.name} (${option.serialNumber})`}
                    {...getTagProps({ index })}
                    key={option.id}
                  />
                ))
              }
            />
            {availableAssets.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No available assets to assign
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddAssetDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddAssets}
            variant="contained"
            disabled={selectedAssets.length === 0}
          >
            Add Selected Assets ({selectedAssets.length})
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}