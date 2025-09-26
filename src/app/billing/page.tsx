'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import {
  Receipt,
  Download,
  CheckCircle,
  Pending,
  Error,
  Devices,
  AccountBalance,
} from '@mui/icons-material';

// Mock billing data for direct payment model
const mockBillingData = {
  accountInfo: {
    companyName: 'ACME Corporation',
    accountStatus: 'active',
    setupDate: '2023-08-15',
    totalDevices: 25,
    activeDevices: 23,
  },
  pricing: {
    setupFee: 9500, // R9,500 setup fee
    deviceFee: 285, // R285 per device per month
    supportFee: 950, // R950 monthly support
  },
  currentBalance: 0,
  invoices: [
    { 
      id: 'inv_001', 
      date: '2024-01-15', 
      description: 'Monthly device fees (25 devices)', 
      amount: 8075, // 25 * 285 + 950 support
      status: 'paid', 
      dueDate: '2024-01-30',
      downloadUrl: '#' 
    },
    { 
      id: 'inv_002', 
      date: '2023-12-15', 
      description: 'Monthly device fees (23 devices)', 
      amount: 7505, // 23 * 285 + 950 support
      status: 'paid', 
      dueDate: '2023-12-30',
      downloadUrl: '#' 
    },
    { 
      id: 'inv_003', 
      date: '2023-11-15', 
      description: 'Setup fee + Initial devices (20 devices)', 
      amount: 15200, // 9500 setup + 20 * 285 + 950 support
      status: 'paid', 
      dueDate: '2023-11-30',
      downloadUrl: '#' 
    },
    { 
      id: 'inv_004', 
      date: '2024-02-15', 
      description: 'Monthly device fees (25 devices)', 
      amount: 8075, 
      status: 'pending', 
      dueDate: '2024-02-28',
      downloadUrl: '#' 
    },
  ],
};

export default function BillingPage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle color="success" />;
      case 'pending':
        return <Pending color="warning" />;
      case 'overdue':
        return <Error color="error" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Billing & Account Information
      </Typography>

      <Grid container spacing={3}>
        {/* Account Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalance sx={{ mr: 1 }} />
                <Typography variant="h6">Account Overview</Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Company Name
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {mockBillingData.accountInfo.companyName}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Account Status
                </Typography>
                <Chip 
                  label={mockBillingData.accountInfo.accountStatus.toUpperCase()} 
                  color="success" 
                  size="small" 
                />
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Setup Date
                </Typography>
                <Typography variant="body1">
                  {new Date(mockBillingData.accountInfo.setupDate).toLocaleDateString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Current Balance
                </Typography>
                <Typography variant="h6" color={mockBillingData.currentBalance > 0 ? 'error' : 'success'}>
                   R{mockBillingData.currentBalance.toFixed(2)}
                 </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Device Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Devices sx={{ mr: 1 }} />
                <Typography variant="h6">Device Information</Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Total Devices
                </Typography>
                <Typography variant="h4" color="primary">
                  {mockBillingData.accountInfo.totalDevices}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Active Devices
                </Typography>
                <Typography variant="h4" color="success.main">
                  {mockBillingData.accountInfo.activeDevices}
                </Typography>
              </Box>
              <Alert severity="info" sx={{ mt: 2 }}>
                 Device fees are charged monthly at R{mockBillingData.pricing.deviceFee} per device
               </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Pricing Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pricing Structure
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                   <Box textAlign="center" p={2} border={1} borderColor="divider" borderRadius={1}>
                     <Typography variant="h6" color="primary">
                       R{mockBillingData.pricing.setupFee.toLocaleString()}
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                       One-time Setup Fee
                     </Typography>
                   </Box>
                 </Grid>
                 <Grid item xs={12} sm={4}>
                   <Box textAlign="center" p={2} border={1} borderColor="divider" borderRadius={1}>
                     <Typography variant="h6" color="primary">
                       R{mockBillingData.pricing.deviceFee}
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                       Per Device / Month
                     </Typography>
                   </Box>
                 </Grid>
                 <Grid item xs={12} sm={4}>
                   <Box textAlign="center" p={2} border={1} borderColor="divider" borderRadius={1}>
                     <Typography variant="h6" color="primary">
                       R{mockBillingData.pricing.supportFee}
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                       Monthly Support Fee
                     </Typography>
                   </Box>
                 </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Billing History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Billing History</Typography>
                <Button variant="outlined" startIcon={<Receipt />}>
                  Request Invoice
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockBillingData.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.id}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell align="right">R{invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {getStatusIcon(invoice.status)}
                            <Chip
                              label={invoice.status.toUpperCase()}
                              color={getStatusColor(invoice.status) as any}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => window.open(invoice.downloadUrl, '_blank')}
                          >
                            <Download />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Payment Questions?</strong> Contact our billing team at billing@assettrackerpro.com or call (555) 123-4567.
              All payments are processed directly through our sales team.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Container>
  );
}