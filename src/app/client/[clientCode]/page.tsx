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
  AppBar,
  Toolbar,
  Avatar,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
} from '@mui/material';
import {
  Business,
  Inventory,
  Assignment,
  Analytics,
  PhoneAndroid,
  GetApp,
  Login,
  CheckCircle,
  Star,
} from '@mui/icons-material';
import { useClient } from './layout';

export default function ClientPortalPage() {
  const clientConfig = useClient();
  const [loginDialog, setLoginDialog] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const handleLogin = () => {
    // Simulate login
    if (loginForm.email && loginForm.password) {
      setIsLoggedIn(true);
      setLoginDialog(false);
      setLoginForm({ email: '', password: '' });
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'inventory': return <Inventory />;
      case 'assignments': return <Assignment />;
      case 'reports': return <Analytics />;
      case 'mobile': return <PhoneAndroid />;
      case 'devices': return <Business />;
      case 'maintenance': return <CheckCircle />;
      case 'api': return <Star />;
      default: return <CheckCircle />;
    }
  };

  const getFeatureName = (feature: string) => {
    const names = {
      'inventory': 'Inventory Management',
      'assignments': 'Asset Assignments',
      'reports': 'Advanced Reports',
      'mobile': 'Mobile App Access',
      'devices': 'Device Management',
      'maintenance': 'Maintenance Tracking',
      'api': 'API Integration'
    };
    return names[feature as keyof typeof names] || feature;
  };

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            {clientConfig.logo && (
              <Avatar
                src={clientConfig.logo}
                sx={{ mr: 2, width: 40, height: 40 }}
              />
            )}
            <Typography variant="h6" component="div">
              {clientConfig.companyName}
            </Typography>
          </Box>
          <Chip
            label={clientConfig.subscription.plan}
            color="secondary"
            size="small"
            sx={{ mr: 2 }}
          />
          {!isLoggedIn ? (
            <Button
              color="inherit"
              startIcon={<Login />}
              onClick={() => setLoginDialog(true)}
            >
              Login
            </Button>
          ) : (
            <Button color="inherit">
              Dashboard
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {!isLoggedIn ? (
          // Landing Page Content
          <Box>
            {/* Hero Section */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h2" gutterBottom>
                Welcome to {clientConfig.companyName}
              </Typography>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Asset Management Portal
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                Access your personalized asset management system with advanced tracking,
                reporting, and management capabilities tailored for your organization.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Login />}
                onClick={() => setLoginDialog(true)}
                sx={{ mr: 2 }}
              >
                Access Portal
              </Button>
            </Box>

            {/* Features Section */}
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
              Available Features
            </Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {clientConfig.features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ height: '100%', textAlign: 'center' }}>
                    <CardContent>
                      <Box sx={{ color: 'primary.main', mb: 2 }}>
                        {getFeatureIcon(feature)}
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {getFeatureName(feature)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* App Download Section */}
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center', mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Download Mobile App
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Access your assets on the go with our mobile application
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<GetApp />}
                  size="large"
                >
                  iOS App
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<GetApp />}
                  size="large"
                >
                  Android App
                </Button>
              </Box>
            </Paper>

            {/* Subscription Info */}
            <Alert severity="info" sx={{ mb: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Plan: {clientConfig.subscription.plan}
              </Typography>
              <Typography variant="body2">
                Status: {clientConfig.subscription.status === 'active' ? 'Active' : 'Inactive'}
              </Typography>
            </Alert>
          </Box>
        ) : (
          // Logged In Dashboard
          <Box>
            <Typography variant="h4" gutterBottom>
              Dashboard
            </Typography>
            <Alert severity="success" sx={{ mb: 4 }}>
              Welcome back! You are now logged into your {clientConfig.companyName} portal.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Quick Actions
                    </Typography>
                    <List>
                      {clientConfig.features.map((feature, index) => (
                        <ListItem key={index} button>
                          <ListItemIcon>
                            {getFeatureIcon(feature)}
                          </ListItemIcon>
                          <ListItemText primary={getFeatureName(feature)} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Account Info
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Company:</strong> {clientConfig.companyName}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Plan:</strong> {clientConfig.subscription.plan}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong> {clientConfig.subscription.status}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>

      {/* Login Dialog */}
      <Dialog open={loginDialog} onClose={() => setLoginDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Login to {clientConfig.companyName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleLogin}
            variant="contained"
            disabled={!loginForm.email || !loginForm.password}
          >
            Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}