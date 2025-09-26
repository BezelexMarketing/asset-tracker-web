'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Build as MaintenanceIcon,
  Assessment as ReportsIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

interface ClientPortalPreviewProps {
  client: any;
  open: boolean;
  onClose: () => void;
}

const mockAssets = [
  { id: 1, name: 'Laptop Dell XPS 13', category: 'Electronics', status: 'Active', assignee: 'John Doe' },
  { id: 2, name: 'Office Chair', category: 'Furniture', status: 'Active', assignee: 'Jane Smith' },
  { id: 3, name: 'Projector Epson', category: 'Electronics', status: 'Maintenance', assignee: 'Unassigned' },
];

export default function ClientPortalPreview({ client, open, onClose }: ClientPortalPreviewProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Create theme based on client branding
  const clientTheme = createTheme({
    palette: {
      mode: client.branding?.theme === 'dark' ? 'dark' : 'light',
      primary: {
        main: client.branding?.primaryColor || '#1976d2',
      },
      secondary: {
        main: client.branding?.secondaryColor || '#dc004e',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: client.branding?.primaryColor || '#1976d2',
          },
        },
      },
    },
  });

  const menuItems = [
    { icon: <DashboardIcon />, text: 'Dashboard', enabled: true },
    { icon: <InventoryIcon />, text: 'Inventory', enabled: client.features?.inventory ?? true },
    { icon: <AssignmentIcon />, text: 'Assignments', enabled: client.features?.assignments ?? true },
    { icon: <MaintenanceIcon />, text: 'Maintenance', enabled: client.features?.maintenance ?? false },
    { icon: <ReportsIcon />, text: 'Reports', enabled: client.features?.reports ?? true },
    { icon: <PeopleIcon />, text: 'Users', enabled: client.features?.userManagement ?? false },
    { icon: <SettingsIcon />, text: 'Settings', enabled: true },
  ];

  const enabledMenuItems = menuItems.filter(item => item.enabled);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        Portal Preview - {client.name}
      </DialogTitle>
      <DialogContent>
        <ThemeProvider theme={clientTheme}>
          <Box sx={{ 
            height: '70vh', 
            border: '1px solid #ccc', 
            borderRadius: 2, 
            overflow: 'hidden',
            bgcolor: 'background.default'
          }}>
            {/* App Bar */}
            <AppBar position="static" elevation={1}>
              <Toolbar>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={() => setDrawerOpen(true)}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {client.branding?.companyName || client.name} - Asset Portal
                </Typography>
                <IconButton color="inherit">
                  <NotificationsIcon />
                </IconButton>
                <Avatar sx={{ ml: 1, bgcolor: 'secondary.main' }}>
                  {client.name.charAt(0)}
                </Avatar>
              </Toolbar>
            </AppBar>

            {/* Drawer */}
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            >
              <Box sx={{ width: 250 }}>
                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                  <Typography variant="h6">
                    {client.branding?.companyName || client.name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Asset Management Portal
                  </Typography>
                </Box>
                <List>
                  {enabledMenuItems.map((item, index) => (
                    <ListItem button key={index}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Drawer>

            {/* Main Content */}
            <Box sx={{ p: 3, height: 'calc(100% - 64px)', overflow: 'auto' }}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                <Tab label="Dashboard" />
                <Tab label="Inventory" disabled={!client.features?.inventory} />
                <Tab label="Reports" disabled={!client.features?.reports} />
              </Tabs>

              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Assets
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {client.assetsCount || 156}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Active Assets
                        </Typography>
                        <Typography variant="h4" color="success.main">
                          142
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          In Maintenance
                        </Typography>
                        <Typography variant="h4" color="warning.main">
                          8
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Assignments
                        </Typography>
                        <Typography variant="h4" color="info.main">
                          134
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Recent Activity
                        </Typography>
                        <List>
                          <ListItem>
                            <ListItemText 
                              primary="New asset added: Laptop Dell XPS 13"
                              secondary="2 hours ago"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Asset assigned to John Doe"
                              secondary="4 hours ago"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Maintenance completed on Projector Epson"
                              secondary="1 day ago"
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && client.features?.inventory && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5">Asset Inventory</Typography>
                    <Button variant="contained" startIcon={<AddIcon />}>
                      Add Asset
                    </Button>
                  </Box>
                  
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Asset Name</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Assignee</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockAssets.map((asset) => (
                          <TableRow key={asset.id}>
                            <TableCell>{asset.name}</TableCell>
                            <TableCell>{asset.category}</TableCell>
                            <TableCell>
                              <Chip
                                label={asset.status}
                                color={asset.status === 'Active' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{asset.assignee}</TableCell>
                            <TableCell>
                              <IconButton size="small" color="primary">
                                <ViewIcon />
                              </IconButton>
                              <IconButton size="small" color="primary">
                                <EditIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {activeTab === 2 && client.features?.reports && (
                <Box>
                  <Typography variant="h5" gutterBottom>Reports & Analytics</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>Asset Distribution</Typography>
                          <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                            <Typography color="textSecondary">Chart Placeholder</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>Monthly Trends</Typography>
                          <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                            <Typography color="textSecondary">Chart Placeholder</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          </Box>
        </ThemeProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close Preview</Button>
      </DialogActions>
    </Dialog>
  );
}