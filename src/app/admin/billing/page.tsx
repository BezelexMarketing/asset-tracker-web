'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import {
  MoreVert,
  TrendingUp,
  TrendingDown,
  Payment,
  Receipt,
  Warning,
  CheckCircle,
  Cancel,
  Edit,
  Visibility,
  Download,
} from '@mui/icons-material';

// Mock data for admin billing overview
const mockBillingData = {
  overview: {
    totalRevenue: 15420,
    monthlyRecurring: 8940,
    activeSubscriptions: 47,
    churnRate: 3.2,
  },
  clients: [
    {
      id: 'acmecorp',
      name: 'ACME Corporation',
      email: 'admin@acmecorp.com',
      plan: 'Professional',
      status: 'active',
      monthlyRevenue: 79,
      nextBilling: '2024-02-15',
      paymentMethod: 'Visa ••••4242',
      joinDate: '2023-08-15',
    },
    {
      id: 'techstart',
      name: 'TechStart Inc',
      email: 'billing@techstart.com',
      plan: 'Starter',
      status: 'active',
      monthlyRevenue: 29,
      nextBilling: '2024-02-18',
      paymentMethod: 'Mastercard ••••8888',
      joinDate: '2023-11-02',
    },
    {
      id: 'globalent',
      name: 'Global Enterprises',
      email: 'finance@globalent.com',
      plan: 'Enterprise',
      status: 'past_due',
      monthlyRevenue: 199,
      nextBilling: '2024-01-28',
      paymentMethod: 'Visa ••••1234',
      joinDate: '2023-06-10',
    },
    {
      id: 'innovate',
      name: 'Innovate Solutions',
      email: 'accounts@innovate.com',
      plan: 'Professional',
      status: 'cancelled',
      monthlyRevenue: 0,
      nextBilling: null,
      paymentMethod: null,
      joinDate: '2023-09-20',
    },
  ],
  recentTransactions: [
    { id: 'txn_001', client: 'ACME Corporation', amount: 79, date: '2024-01-15', status: 'completed' },
    { id: 'txn_002', client: 'TechStart Inc', amount: 29, date: '2024-01-18', status: 'completed' },
    { id: 'txn_003', client: 'Global Enterprises', amount: 199, date: '2024-01-10', status: 'failed' },
    { id: 'txn_004', client: 'ACME Corporation', amount: 79, date: '2023-12-15', status: 'completed' },
  ],
};

export default function AdminBillingPage() {
  const [tabValue, setTabValue] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDialog, setClientDialog] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState('');

  const handleClientAction = (action: string, clientId: string) => {
    setMenuAnchor(null);
    switch (action) {
      case 'view':
        const client = mockBillingData.clients.find(c => c.id === clientId);
        setSelectedClient(client);
        setClientDialog(true);
        break;
      case 'edit':
        // Handle edit action
        break;
      case 'suspend':
        // Handle suspend action
        break;
      case 'cancel':
        // Handle cancel action
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'past_due': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Billing Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage client subscriptions, payments, and billing analytics
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(mockBillingData.overview.totalRevenue)}
                  </Typography>
                </Box>
                <TrendingUp color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Monthly Recurring
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(mockBillingData.overview.monthlyRecurring)}
                  </Typography>
                </Box>
                <Payment color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Subscriptions
                  </Typography>
                  <Typography variant="h5">
                    {mockBillingData.overview.activeSubscriptions}
                  </Typography>
                </Box>
                <CheckCircle color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Churn Rate
                  </Typography>
                  <Typography variant="h5">
                    {mockBillingData.overview.churnRate}%
                  </Typography>
                </Box>
                <TrendingDown color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Client Subscriptions" />
          <Tab label="Recent Transactions" />
          <Tab label="Analytics" />
        </Tabs>
      </Paper>

      {/* Client Subscriptions Tab */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Client Subscriptions</Typography>
              <Button variant="contained" startIcon={<Download />}>
                Export Data
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Monthly Revenue</TableCell>
                    <TableCell>Next Billing</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockBillingData.clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {client.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {client.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{client.plan}</TableCell>
                      <TableCell>
                        <Chip
                          label={client.status.replace('_', ' ')}
                          color={getStatusColor(client.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {client.monthlyRevenue > 0 ? formatCurrency(client.monthlyRevenue) : '-'}
                      </TableCell>
                      <TableCell>{client.nextBilling || '-'}</TableCell>
                      <TableCell>{client.paymentMethod || '-'}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => {
                            setMenuAnchor(e.currentTarget);
                            setSelectedClientId(client.id);
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions Tab */}
      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockBillingData.recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.id}</TableCell>
                      <TableCell>{transaction.client}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          color={transaction.status === 'completed' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small">
                          <Receipt />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue Growth
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Growth Rate
                  </Typography>
                  <LinearProgress variant="determinate" value={75} sx={{ mt: 1, mb: 1 }} />
                  <Typography variant="body2">+15.3% vs last month</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Plan Distribution
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Starter</Typography>
                    <Typography variant="body2">25%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={25} sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Professional</Typography>
                    <Typography variant="body2">50%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={50} sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Enterprise</Typography>
                    <Typography variant="body2">25%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={25} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleClientAction('view', selectedClientId)}>
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => handleClientAction('edit', selectedClientId)}>
          <Edit sx={{ mr: 1 }} /> Edit Subscription
        </MenuItem>
        <MenuItem onClick={() => handleClientAction('suspend', selectedClientId)}>
          <Warning sx={{ mr: 1 }} /> Suspend Account
        </MenuItem>
        <MenuItem onClick={() => handleClientAction('cancel', selectedClientId)}>
          <Cancel sx={{ mr: 1 }} /> Cancel Subscription
        </MenuItem>
      </Menu>

      {/* Client Details Dialog */}
      <Dialog open={clientDialog} onClose={() => setClientDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Client Billing Details</DialogTitle>
        <DialogContent>
          {selectedClient && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Client Information
                </Typography>
                <Typography variant="body2">Name: {selectedClient.name}</Typography>
                <Typography variant="body2">Email: {selectedClient.email}</Typography>
                <Typography variant="body2">Join Date: {selectedClient.joinDate}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Subscription Details
                </Typography>
                <Typography variant="body2">Plan: {selectedClient.plan}</Typography>
                <Typography variant="body2">Status: {selectedClient.status}</Typography>
                <Typography variant="body2">
                  Monthly Revenue: {selectedClient.monthlyRevenue > 0 ? formatCurrency(selectedClient.monthlyRevenue) : '-'}
                </Typography>
                <Typography variant="body2">Next Billing: {selectedClient.nextBilling || '-'}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClientDialog(false)}>Close</Button>
          <Button variant="contained">Edit Subscription</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}