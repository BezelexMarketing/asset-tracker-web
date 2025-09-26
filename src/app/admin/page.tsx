'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tab,
  Tabs,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Alert,
  Snackbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Container,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  ExitToApp,
  Palette as PaletteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Launch as LaunchIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import ClientPortalGenerator from '@/components/admin/ClientPortalGenerator';
import ClientPortalPreview from '@/components/admin/ClientPortalPreview';
import Navigation from '../../components/Navigation';

// Mock data for admin overview
const mockStats = {
  totalClients: 15,
  activeClients: 12,
  totalUsers: 48,
  totalAssets: 1247,
  pendingRequests: 3,
  systemHealth: 'Good'
};

// Mock client data with white-label settings
const mockClientsWithBranding = [
  {
    id: 1,
    name: 'ABC Manufacturing Ltd',
    contactPerson: 'John Smith',
    email: 'john@abcmanufacturing.com',
    phone: '+1-555-0123',
    status: 'active',
    assetsCount: 45,
    domain: 'abc.assettracker.com',
    branding: {
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      companyName: 'ABC Manufacturing',
      logo: null,
      theme: 'light',
      customCSS: '',
      enableCustomization: true
    },
    subscription: 'premium',
    lastLogin: '2024-01-15'
  },
  {
    id: 2,
    name: 'Tech Solutions Inc',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@techsolutions.com',
    phone: '+1-555-0456',
    status: 'active',
    assetsCount: 28,
    domain: 'tech.assettracker.com',
    branding: {
      primaryColor: '#4caf50',
      secondaryColor: '#ff9800',
      companyName: 'Tech Solutions',
      logo: null,
      theme: 'dark',
      customCSS: '',
      enableCustomization: true
    },
    subscription: 'standard',
    lastLogin: '2024-01-14'
  },
  {
    id: 3,
    name: 'Green Energy Corp',
    contactPerson: 'Mike Davis',
    email: 'mike@greenenergy.com',
    phone: '+1-555-0789',
    status: 'inactive',
    assetsCount: 12,
    domain: 'green.assettracker.com',
    branding: {
      primaryColor: '#2e7d32',
      secondaryColor: '#ffc107',
      companyName: 'Green Energy',
      logo: null,
      theme: 'light',
      customCSS: '',
      enableCustomization: false
    },
    subscription: 'basic',
    lastLogin: '2024-01-10'
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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const [clients, setClients] = useState(mockClientsWithBranding);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [brandingDialogOpen, setBrandingDialogOpen] = useState(false);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [portalGeneratorDialog, setPortalGeneratorDialog] = useState(false);
  const [portalPreviewDialog, setPortalPreviewDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as any });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    domain: '',
    subscription: 'standard'
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const showSnackbar = (message: string, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePreviewPortal = (client: any) => {
    setSelectedClient(client);
    setPortalPreviewDialog(true);
  };

  const handleGeneratePortal = (client: any) => {
    setSelectedClient(client);
    setPortalGeneratorDialog(true);
  };

  const handlePortalSave = (config: any) => {
    // Update client with portal configuration
    setClients(prev => prev.map(client => 
      client.id === config.id 
        ? { ...client, portalConfig: config }
        : client
    ));
    setPortalGeneratorDialog(false);
  };

  const handleSaveBranding = () => {
    if (selectedClient) {
      const updatedClients = clients.map(client =>
        client.id === selectedClient.id ? selectedClient : client
      );
      setClients(updatedClients);
      setBrandingDialogOpen(false);
      showSnackbar('Branding updated successfully', 'success');
    }
  };

  const handleAddClient = () => {
    const client = {
      id: clients.length + 1,
      ...newClient,
      status: 'active',
      assetsCount: 0,
      branding: {
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        companyName: newClient.name,
        logo: null,
        theme: 'light',
        customCSS: '',
        enableCustomization: true
      },
      lastLogin: new Date().toISOString().split('T')[0]
    };
    setClients([...clients, client]);
    setNewClient({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      domain: '',
      subscription: 'standard'
    });
    setClientDialogOpen(false);
    showSnackbar('Client added successfully', 'success');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'premium': return 'primary';
      case 'standard': return 'info';
      case 'basic': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Navigation />
      
      {/* Admin Header */}
      <AppBar position="static" elevation={1} sx={{ mt: 2 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard - Asset Tracker Pro
          </Typography>
          
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={mockStats.pendingRequests} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              A
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                admin@assettracker.com
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                Role: Super Admin
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<DashboardIcon />} label="Overview" iconPosition="start" />
          <Tab icon={<BusinessIcon />} label="Client Management" iconPosition="start" />
          <Tab icon={<PaletteIcon />} label="White-Label Settings" iconPosition="start" />
          <Tab icon={<PeopleIcon />} label="User Management" iconPosition="start" />
          <Tab icon={<SettingsIcon />} label="System Settings" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Clients
                </Typography>
                <Typography variant="h4">
                  {mockStats.totalClients}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Clients
                </Typography>
                <Typography variant="h4" color="success.main">
                  {mockStats.activeClients}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Assets
                </Typography>
                <Typography variant="h4" color="info.main">
                  {mockStats.totalAssets}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  System Health
                </Typography>
                <Typography variant="h4" color="success.main">
                  {mockStats.systemHealth}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Client Management Tab */}
      <TabPanel value={currentTab} index={1}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Client Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setClientDialogOpen(true)}
          >
            Add New Client
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Subscription</TableCell>
                <TableCell>Assets</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: client.branding.primaryColor }}>
                        {client.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{client.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {client.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{client.contactPerson}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {client.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>{client.domain}</TableCell>
                  <TableCell>
                    <Chip
                      label={client.subscription}
                      color={getSubscriptionColor(client.subscription) as any}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>{client.assetsCount}</TableCell>
                  <TableCell>
                    <Chip
                      label={client.status}
                      color={getStatusColor(client.status) as any}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Preview Portal">
                      <IconButton
                        onClick={() => handlePreviewPortal(client)}
                        color="info"
                        size="small"
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Generate Portal">
                      <IconButton
                        onClick={() => handleGeneratePortal(client)}
                        color="success"
                        size="small"
                      >
                        <LaunchIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Branding">
                      <IconButton
                        onClick={() => handleEditBranding(client)}
                        color="primary"
                        size="small"
                      >
                        <PaletteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Client">
                      <IconButton color="primary" size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* White-Label Settings Tab */}
      <TabPanel value={currentTab} index={2}>
        <Typography variant="h5" sx={{ mb: 3 }}>White-Label Configuration</Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          Configure branding and customization settings for each client. Changes will be applied to their dedicated portal.
        </Alert>
        
        <Grid container spacing={3}>
          {clients.map((client) => (
            <Grid item xs={12} md={6} lg={4} key={client.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: client.branding.primaryColor }}>
                      {client.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{client.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {client.domain}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Primary Color</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: client.branding.primaryColor,
                          borderRadius: 1,
                          mr: 1,
                          border: '1px solid #ccc'
                        }}
                      />
                      <Typography variant="body2">{client.branding.primaryColor}</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Theme</Typography>
                    <Chip
                      label={client.branding.theme}
                      size="small"
                      sx={{ textTransform: 'capitalize', mt: 1 }}
                    />
                  </Box>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PaletteIcon />}
                    onClick={() => handleEditBranding(client)}
                  >
                    Customize Branding
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* User Management Tab */}
      <TabPanel value={currentTab} index={3}>
        <Typography variant="h5">User Management</Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          User management functionality will be implemented here.
        </Alert>
      </TabPanel>

      {/* System Settings Tab */}
      <TabPanel value={currentTab} index={4}>
        <Typography variant="h5">System Settings</Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          System configuration and settings will be implemented here.
        </Alert>
      </TabPanel>

      {/* Add Client Dialog */}
      <Dialog open={clientDialogOpen} onClose={() => setClientDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Person"
                value={newClient.contactPerson}
                onChange={(e) => setNewClient({ ...newClient, contactPerson: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Domain"
                value={newClient.domain}
                onChange={(e) => setNewClient({ ...newClient, domain: e.target.value })}
                placeholder="client.assettracker.com"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Subscription</InputLabel>
                <Select
                  value={newClient.subscription}
                  onChange={(e) => setNewClient({ ...newClient, subscription: e.target.value })}
                >
                  <MenuItem value="basic">Basic</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClientDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddClient} variant="contained">
            Add Client
          </Button>
        </DialogActions>
      </Dialog>

      {/* Branding Dialog */}
      <Dialog open={brandingDialogOpen} onClose={() => setBrandingDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit Branding - {selectedClient?.name}
        </DialogTitle>
        <DialogContent>
          {selectedClient && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={selectedClient.branding.companyName}
                  onChange={(e) => setSelectedClient({
                    ...selectedClient,
                    branding: { ...selectedClient.branding, companyName: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Primary Color"
                  type="color"
                  value={selectedClient.branding.primaryColor}
                  onChange={(e) => setSelectedClient({
                    ...selectedClient,
                    branding: { ...selectedClient.branding, primaryColor: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Secondary Color"
                  type="color"
                  value={selectedClient.branding.secondaryColor}
                  onChange={(e) => setSelectedClient({
                    ...selectedClient,
                    branding: { ...selectedClient.branding, secondaryColor: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={selectedClient.branding.theme}
                    onChange={(e) => setSelectedClient({
                      ...selectedClient,
                      branding: { ...selectedClient.branding, theme: e.target.value }
                    })}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedClient.branding.enableCustomization}
                      onChange={(e) => setSelectedClient({
                        ...selectedClient,
                        branding: { ...selectedClient.branding, enableCustomization: e.target.checked }
                      })}
                    />
                  }
                  label="Enable Client Customization"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Custom CSS"
                  value={selectedClient.branding.customCSS}
                  onChange={(e) => setSelectedClient({
                    ...selectedClient,
                    branding: { ...selectedClient.branding, customCSS: e.target.value }
                  })}
                  placeholder="/* Add custom CSS here */"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBrandingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveBranding} variant="contained" startIcon={<SaveIcon />}>
            Save Branding
          </Button>
        </DialogActions>
      </Dialog>

      {/* Portal Generator Dialog */}
      {portalGeneratorDialog && selectedClient && (
        <ClientPortalGenerator
          client={selectedClient}
          onClose={() => setPortalGeneratorDialog(false)}
          onSave={handlePortalSave}
        />
      )}

      {/* Portal Preview Dialog */}
      {portalPreviewDialog && selectedClient && (
        <ClientPortalPreview
          client={selectedClient}
          open={portalPreviewDialog}
          onClose={() => setPortalPreviewDialog(false)}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}