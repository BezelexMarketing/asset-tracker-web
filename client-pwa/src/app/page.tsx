'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Alert,
  Snackbar,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  QrCodeScanner as ScanIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CloudOff as OfflineIcon,
} from '@mui/icons-material';

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
}

interface Asset {
  id: string;
  name: string;
  code: string;
  status: 'available' | 'assigned' | 'maintenance';
  assignedTo?: string;
  lastScanned?: Date;
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [scanDialogOpen, setScanDialogOpen] = useState(false);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mock login function
  const handleLogin = async () => {
    // Simulate API call
    setTimeout(() => {
      setUser({
        id: '1',
        name: 'John Doe',
        email: loginForm.email,
        company: 'Demo Company',
      });
      setIsLoggedIn(true);
      // Load mock assets
      setAssets([
        { id: '1', name: 'Laptop Dell XPS', code: 'LT001', status: 'assigned', assignedTo: 'Jane Smith' },
        { id: '2', name: 'Office Chair', code: 'CH001', status: 'available' },
        { id: '3', name: 'Projector Epson', code: 'PJ001', status: 'maintenance' },
      ]);
    }, 1000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setAssets([]);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, view: 'dashboard' },
    { text: 'Assets', icon: <InventoryIcon />, view: 'assets' },
    { text: 'Assignments', icon: <AssignmentIcon />, view: 'assignments' },
    { text: 'Profile', icon: <PersonIcon />, view: 'profile' },
    { text: 'Settings', icon: <SettingsIcon />, view: 'settings' },
  ];

  const renderLoginForm = () => (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Asset Tracker Pro
          </Typography>
          <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 4 }}>
            Sign in to access your assets
          </Typography>
          
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
            sx={{ mb: 3 }}
          />
          
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={!loginForm.email || !loginForm.password}
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    </Container>
  );

  const renderDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Assets
            </Typography>
            <Typography variant="h4">
              {assets.length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Available
            </Typography>
            <Typography variant="h4" color="success.main">
              {assets.filter(a => a.status === 'available').length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Assigned
            </Typography>
            <Typography variant="h4" color="primary.main">
              {assets.filter(a => a.status === 'assigned').length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Maintenance
            </Typography>
            <Typography variant="h4" color="warning.main">
              {assets.filter(a => a.status === 'maintenance').length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAssets = () => (
    <Grid container spacing={2}>
      {assets.map((asset) => (
        <Grid item xs={12} sm={6} md={4} key={asset.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {asset.name}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                Code: {asset.code}
              </Typography>
              <Chip
                label={asset.status}
                color={
                  asset.status === 'available' ? 'success' :
                  asset.status === 'assigned' ? 'primary' : 'warning'
                }
                size="small"
              />
              {asset.assignedTo && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Assigned to: {asset.assignedTo}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'assets':
        return renderAssets();
      case 'assignments':
        return <Typography>Assignments view coming soon...</Typography>;
      case 'profile':
        return <Typography>Profile view coming soon...</Typography>;
      case 'settings':
        return <Typography>Settings view coming soon...</Typography>;
      default:
        return renderDashboard();
    }
  };

  if (!isLoggedIn) {
    return (
      <Box>
        {!isOnline && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <OfflineIcon sx={{ mr: 1 }} />
            You are currently offline. Some features may not be available.
          </Alert>
        )}
        {renderLoginForm()}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Asset Tracker Pro
          </Typography>
          {!isOnline && <OfflineIcon sx={{ mr: 2 }} />}
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.text}
                button
                onClick={() => {
                  setCurrentView(item.view);
                  setDrawerOpen(false);
                }}
                selected={currentView === item.view}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {!isOnline && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <OfflineIcon sx={{ mr: 1 }} />
            You are currently offline. Data may not be up to date.
          </Alert>
        )}
        {renderContent()}
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="scan"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setScanDialogOpen(true)}
      >
        <ScanIcon />
      </Fab>

      {/* Scan Dialog */}
      <Dialog open={scanDialogOpen} onClose={() => setScanDialogOpen(false)}>
        <DialogTitle>Scan Asset</DialogTitle>
        <DialogContent>
          <Typography>
            QR/Barcode scanner functionality would be implemented here.
            This is a demo version.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScanDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}