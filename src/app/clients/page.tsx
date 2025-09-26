'use client';

import React, { useState } from 'react';
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
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  Group as GroupIcon
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
      id={`client-tabpanel-${index}`}
      aria-labelledby={`client-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ClientManagement() {
  const [clients, setClients] = useState(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [newClient, setNewClient] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    industry: ''
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = () => {
    const client = {
      id: clients.length + 1,
      ...newClient,
      status: 'active',
      assetsCount: 0,
      lastActivity: new Date().toISOString().split('T')[0],
      joinDate: new Date().toISOString().split('T')[0]
    };
    setClients([...clients, client]);
    setNewClient({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      industry: ''
    });
    setAddClientOpen(false);
  };

  const handleViewClient = (client: any) => {
    setSelectedClient(client);
    setClientDetailsOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalAssets = clients.reduce((sum, c) => sum + c.assetsCount, 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Client Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddClientOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Add New Client
        </Button>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BusinessIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Total Clients
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {clients.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Active Clients
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {activeClients}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InventoryIcon sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Total Assets
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {totalAssets}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssignmentIcon sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Avg Assets/Client
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {clients.length > 0 ? Math.round(totalAssets / clients.length) : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search clients by name, contact person, or email..."
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
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Clients ({filteredClients.length})
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell>Client</TableCell>
                  <TableCell>Contact Person</TableCell>
                  <TableCell>Industry</TableCell>
                  <TableCell>Assets</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {client.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {client.name}
                          </Typography>
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
                    <TableCell>{client.industry}</TableCell>
                    <TableCell>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {client.assetsCount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={client.status}
                        color={getStatusColor(client.status) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>{client.lastActivity}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleViewClient(client)}
                        color="primary"
                        size="small"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => window.location.href = `/clients/${client.id}`}
                        color="info" 
                        size="small"
                        title="Manage Assets"
                      >
                        <InventoryIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => window.location.href = `/clients/edit/${client.id}`}
                        color="primary" 
                        size="small"
                        title="Edit Client"
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Client Dialog */}
      <Dialog open={addClientOpen} onClose={() => setAddClientOpen(false)} maxWidth="md" fullWidth>
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
                label="Industry"
                value={newClient.industry}
                onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddClientOpen(false)}>Cancel</Button>
          <Button onClick={handleAddClient} variant="contained">
            Add Client
          </Button>
        </DialogActions>
      </Dialog>

      {/* Client Details Dialog */}
      <Dialog open={clientDetailsOpen} onClose={() => setClientDetailsOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              {selectedClient?.name?.charAt(0)}
            </Avatar>
            {selectedClient?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Overview" />
              <Tab label="Assets" />
              <Tab label="Activity" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>Contact Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Contact Person</Typography>
                  <Typography variant="body1">{selectedClient?.contactPerson}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedClient?.email}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selectedClient?.phone}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                  <Typography variant="body1">{selectedClient?.address}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>Client Details</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Industry</Typography>
                  <Typography variant="body1">{selectedClient?.industry}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Join Date</Typography>
                  <Typography variant="body1">{selectedClient?.joinDate}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedClient?.status}
                    color={getStatusColor(selectedClient?.status) as any}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Assets</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {selectedClient?.assetsCount}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Asset management for this client will be integrated with the main inventory system.
            </Alert>
            <Typography variant="body1">
              This client has {selectedClient?.assetsCount} assets assigned. 
              You can manage their assets through the main Inventory section by filtering by client.
            </Typography>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Typography variant="body1">
              Last activity: {selectedClient?.lastActivity}
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              Activity tracking will be implemented in future updates.
            </Alert>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClientDetailsOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<EditIcon />}>
            Edit Client
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}