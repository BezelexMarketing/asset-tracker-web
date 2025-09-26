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
  Snackbar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  ExitToApp,
  Business as BusinessIcon,
  NfcOutlined as NfcIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';

// Import dashboard components
import DashboardOverview from '../components/admin/DashboardOverview';
import TenantManagement from '../components/admin/TenantManagement';
import UserManagement from '../components/admin/UserManagement';
import ItemManagement from '../components/admin/ItemManagement';
import AssignmentManagement from '../components/admin/AssignmentManagement';
import SystemSettings from '../components/admin/SystemSettings';
import WhiteLabelingSystem from '../components/admin/WhiteLabelingSystem';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
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

function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    // Load user data from localStorage or API
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);

    // Load notifications
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // Mock notifications - in real app, fetch from API
      setNotifications([
        { id: 1, message: 'New tenant registration pending approval', type: 'info', timestamp: new Date() },
        { id: 2, message: '5 items require maintenance', type: 'warning', timestamp: new Date() },
        { id: 3, message: 'System backup completed successfully', type: 'success', timestamp: new Date() }
      ]);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const tabs = [
    { label: 'Overview', value: 'overview', icon: <DashboardIcon /> },
    { label: 'Tenants', value: 'tenants', icon: <BusinessIcon /> },
    { label: 'Users', value: 'users', icon: <PeopleIcon /> },
    { label: 'Items', value: 'items', icon: <InventoryIcon /> },
    { label: 'Assignments', value: 'assignments', icon: <AssignmentIcon /> },
    { label: 'White-Labeling', value: 'white-labeling', icon: <PaletteIcon /> },
    { label: 'System Settings', value: 'system-settings', icon: <SettingsIcon /> }
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Top App Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <NfcIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Asset Tracker Pro - Admin Dashboard
          </Typography>
          
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.firstName?.charAt(0) || 'A'}
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
                {user?.email}
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                Role: {user?.role}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
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
          aria-label="admin dashboard tabs"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <DashboardOverview onShowSnackbar={showSnackbar} />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <TenantManagement onShowSnackbar={showSnackbar} />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <UserManagement onShowSnackbar={showSnackbar} />
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        <ItemManagement onShowSnackbar={showSnackbar} />
      </TabPanel>

      <TabPanel value={currentTab} index={4}>
        <AssignmentManagement onShowSnackbar={showSnackbar} />
      </TabPanel>

      <TabPanel value={currentTab} index={5}>
        <WhiteLabelingSystem onShowSnackbar={showSnackbar} />
      </TabPanel>

      <TabPanel value={currentTab} index={6}>
        <SystemSettings onShowSnackbar={showSnackbar} />
      </TabPanel>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminDashboard;