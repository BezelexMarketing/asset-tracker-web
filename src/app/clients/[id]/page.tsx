'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
  Alert,
  Tabs,
  Tab,
  Avatar,
  Fab,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as ExportIcon,
  Build as MaintenanceIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  MoreVert as MoreVertIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';

// Mock data for clients
const mockClients = [
  {
    id: 1,
    name: 'ABC Manufacturing Ltd',
    contactPerson: 'John Smith',
    email: 'john@abcmanufacturing.com',
    phone: '+1-555-0123',
    address: '123 Industrial Ave, City, State 12345',
    status: 'active',
    assetsCount: 45,
    lastActivity: '2024-01-15',
    joinDate: '2023-06-15',
    industry: 'Manufacturing'
  },
  {
    id: 2,
    name: 'Tech Solutions Inc',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@techsolutions.com',
    phone: '+1-555-0456',
    address: '456 Tech Park Blvd, City, State 12346',
    status: 'active',
    assetsCount: 28,
    lastActivity: '2024-01-14',
    joinDate: '2023-08-20',
    industry: 'Technology'
  },
  {
    id: 3,
    name: 'Green Energy Corp',
    contactPerson: 'Mike Davis',
    email: 'mike@greenenergy.com',
    phone: '+1-555-0789',
    address: '789 Renewable Way, City, State 12347',
    status: 'inactive',
    assetsCount: 12,
    lastActivity: '2024-01-10',
    joinDate: '2023-11-05',
    industry: 'Energy'
  }
];

// Mock assets data for the client
const mockAssets = [
  {
    id: 1,
    name: 'Laptop Dell XPS 13',
    serialNumber: 'DL001234',
    category: 'Electronics',
    status: 'assigned',
    assignedTo: 'John Doe',
    location: 'Office Floor 2',
    purchaseDate: '2023-05-15',
    value: 1200,
    condition: 'excellent',
    maintenanceStatus: 'up_to_date'
  },
  {
    id: 2,
    name: 'Office Chair Ergonomic',
    serialNumber: 'CH005678',
    category: 'Furniture',
    status: 'available',
    assignedTo: null,
    location: 'Storage Room A',
    purchaseDate: '2023-03-20',
    value: 350,
    condition: 'good',
    maintenanceStatus: 'due'
  },
  {
    id: 3,
    name: 'Projector Epson',
    serialNumber: 'EP009876',
    category: 'Electronics',
    status: 'maintenance',
    assignedTo: null,
    location: 'Maintenance Shop',
    purchaseDate: '2022-11-10',
    value: 800,
    condition: 'fair',
    maintenanceStatus: 'in_progress'
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
      id={`client-asset-tabpanel-${index}`}
      aria-labelledby={`client-asset-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ClientAssetManagement() {
  const params = useParams();
  const router = useRouter();
  const clientId = parseInt(params.id as string);
  
  const [assets, setAssets] = useState(mockAssets);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [addAssetOpen, setAddAssetOpen] = useState(false);
  const [editAssetOpen, setEditAssetOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [newAsset, setNewAsset] = useState({
    name: '',
    serialNumber: '',
    category: '',
    location: '',
    value: '',
    condition: 'excellent'
  });

  const client = mockClients.find(c => c.id === clientId);
  
  if (!client) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Client not found</Alert>
      </Box>
    );
  }

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAsset = () => {
    const asset = {
      id: assets.length + 1,
      ...newAsset,
      value: parseFloat(newAsset.value) || 0,
      status: 'available',
      assignedTo: null,
      purchaseDate: new Date().toISOString().split('T')[0],
      maintenanceStatus: 'up_to_date'
    };
    setAssets([...assets, asset]);
    setNewAsset({
      name: '',
      serialNumber: '',
      category: '',
      location: '',
      value: '',
      condition: 'excellent'
    });
    setAddAssetOpen(false);
  };

  const handleEditAsset = (asset: any) => {
    setSelectedAsset(asset);
    setEditAssetOpen(true);
  };

  const handleDeleteAsset = (assetId: number) => {
    setAssets(assets.filter(a => a.id !== assetId));
    setAnchorEl(null);
  };

  const handleExportToExcel = () => {
    // Create CSV content
    const headers = ['Name', 'Serial Number', 'Category', 'Status', 'Assigned To', 'Location', 'Purchase Date', 'Value', 'Condition', 'Maintenance Status'];
    const csvContent = [
      headers.join(','),
      ...assets.map(asset => [
        asset.name,
        asset.serialNumber,
        asset.category,
        asset.status,
        asset.assignedTo || 'Unassigned',
        asset.location,
        asset.purchaseDate,
        asset.value,
        asset.condition,
        asset.maintenanceStatus
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${client.name}_assets_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'retired': return 'error';
      default: return 'default';
    }
  };

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'up_to_date': return 'success';
      case 'due': return 'warning';
      case 'overdue': return 'error';
      case 'in_progress': return 'info';
      default: return 'default';
    }
  };

  const assignedAssets = assets.filter(a => a.status === 'assigned').length;
  const availableAssets = assets.filter(a => a.status === 'available').length;
  const maintenanceAssets = assets.filter(a => a.status === 'maintenance').length;
  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {client.name.charAt(0)}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {client.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Asset Management
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportToExcel}
          sx={{ mr: 1 }}
        >
          Export Excel
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddAssetOpen(true)}
        >
          Add Asset
        </Button>
      </Box>

      {/* Client Info Card */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="text.secondary">Contact Person</Typography>
              <Typography variant="body1">{client.contactPerson}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="text.secondary">Email</Typography>
              <Typography variant="body1">{client.email}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
              <Typography variant="body1">{client.phone}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="text.secondary">Industry</Typography>
              <Typography variant="body1">{client.industry}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Asset Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InventoryIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Total Assets
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {assets.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssignmentIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Assigned
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {assignedAssets}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MaintenanceIcon sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Maintenance
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {maintenanceAssets}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ExportIcon sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Total Value
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                ${totalValue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Assets" />
            <Tab label="Maintenance" />
            <Tab label="Reports" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Search */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search assets by name, serial number, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>

          {/* Assets Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell>Asset</TableCell>
                  <TableCell>Serial Number</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Maintenance</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {asset.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {asset.condition}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{asset.serialNumber}</TableCell>
                    <TableCell>{asset.category}</TableCell>
                    <TableCell>
                      <Chip
                        label={asset.status}
                        color={getStatusColor(asset.status) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>{asset.assignedTo || 'Unassigned'}</TableCell>
                    <TableCell>{asset.location}</TableCell>
                    <TableCell>${asset.value.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={asset.maintenanceStatus.replace('_', ' ')}
                        color={getMaintenanceStatusColor(asset.maintenanceStatus) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleEditAsset(asset)}
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          setSelectedAsset(asset);
                          setAnchorEl(e.currentTarget);
                        }}
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
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Maintenance tracking for {client.name}'s assets
          </Alert>
          
          {/* Maintenance Overview Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'success.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MaintenanceIcon sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="h6" component="div">
                      Up to Date
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {assets.filter(a => a.maintenanceStatus === 'up_to_date').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'warning.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MaintenanceIcon sx={{ color: 'warning.main', mr: 1 }} />
                    <Typography variant="h6" component="div">
                      Due
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {assets.filter(a => a.maintenanceStatus === 'due').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'error.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MaintenanceIcon sx={{ color: 'error.main', mr: 1 }} />
                    <Typography variant="h6" component="div">
                      Overdue
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {assets.filter(a => a.maintenanceStatus === 'overdue').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'info.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MaintenanceIcon sx={{ color: 'info.main', mr: 1 }} />
                    <Typography variant="h6" component="div">
                      In Progress
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {assets.filter(a => a.maintenanceStatus === 'in_progress').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Maintenance Schedule Table */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Maintenance Schedule
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell>Asset</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Current Status</TableCell>
                      <TableCell>Maintenance Status</TableCell>
                      <TableCell>Last Maintenance</TableCell>
                      <TableCell>Next Due</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assets.map((asset) => (
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
                        <TableCell>{asset.category}</TableCell>
                        <TableCell>
                          <Chip
                            label={asset.status}
                            color={getStatusColor(asset.status) as any}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={asset.maintenanceStatus.replace('_', ' ')}
                            color={getMaintenanceStatusColor(asset.maintenanceStatus) as any}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {asset.maintenanceStatus === 'up_to_date' ? '2024-01-01' : 
                             asset.maintenanceStatus === 'due' ? '2023-12-01' :
                             asset.maintenanceStatus === 'overdue' ? '2023-10-01' : 'In Progress'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color={
                            asset.maintenanceStatus === 'overdue' ? 'error.main' :
                            asset.maintenanceStatus === 'due' ? 'warning.main' : 'text.primary'
                          }>
                            {asset.maintenanceStatus === 'up_to_date' ? '2024-07-01' : 
                             asset.maintenanceStatus === 'due' ? '2024-06-01' :
                             asset.maintenanceStatus === 'overdue' ? '2024-03-01' : 'TBD'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<MaintenanceIcon />}
                            onClick={() => {
                              // Update maintenance status
                              const updatedAssets = assets.map(a => 
                                a.id === asset.id 
                                  ? { ...a, maintenanceStatus: 'in_progress', status: 'maintenance' }
                                  : a
                              );
                              setAssets(updatedAssets);
                            }}
                            disabled={asset.maintenanceStatus === 'in_progress'}
                          >
                            {asset.maintenanceStatus === 'in_progress' ? 'In Progress' : 'Schedule'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Asset reports and analytics for {client.name}
          </Alert>
          <Typography variant="body1">
            Total asset value: ${totalValue.toLocaleString()}
          </Typography>
          <Typography variant="body1">
            Asset utilization: {Math.round((assignedAssets / assets.length) * 100)}%
          </Typography>
        </TabPanel>
      </Card>

      {/* Add Asset Dialog */}
      <Dialog open={addAssetOpen} onClose={() => setAddAssetOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Asset for {client.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Asset Name"
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Serial Number"
                value={newAsset.serialNumber}
                onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                value={newAsset.category}
                onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={newAsset.location}
                onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Value ($)"
                type="number"
                value={newAsset.value}
                onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Condition"
                select
                value={newAsset.condition}
                onChange={(e) => setNewAsset({ ...newAsset, condition: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddAssetOpen(false)}>Cancel</Button>
          <Button onClick={handleAddAsset} variant="contained">
            Add Asset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleEditAsset(selectedAsset)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Asset
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleDeleteAsset(selectedAsset?.id)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Asset
        </MenuItem>
      </Menu>
    </Box>
  );
}