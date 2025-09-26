import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  Button,
  Paper
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Business,
  People,
  Inventory,
  Assignment,
  Warning,
  CheckCircle,
  Schedule,
  NfcOutlined
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data - in real app, fetch from API
const mockStats = {
  totalTenants: 24,
  activeTenants: 22,
  totalUsers: 156,
  activeUsers: 142,
  totalItems: 1247,
  assignedItems: 892,
  totalAssignments: 1156,
  activeAssignments: 892,
  recentActivity: [
    { id: 1, type: 'checkin', item: 'Laptop #LP001', operator: 'John Doe', timestamp: '2 minutes ago' },
    { id: 2, type: 'assign', item: 'Drill #DR045', operator: 'Jane Smith', timestamp: '5 minutes ago' },
    { id: 3, type: 'maintenance', item: 'Vehicle #VH012', operator: 'Mike Johnson', timestamp: '12 minutes ago' },
    { id: 4, type: 'checkout', item: 'Camera #CM003', operator: 'Sarah Wilson', timestamp: '18 minutes ago' }
  ],
  alerts: [
    { id: 1, type: 'warning', message: '5 items require maintenance', count: 5 },
    { id: 2, type: 'error', message: '2 items are overdue for return', count: 2 },
    { id: 3, type: 'info', message: '3 new tenant registrations pending', count: 3 }
  ]
};

const activityData = [
  { name: 'Mon', checkIns: 45, checkOuts: 38, assignments: 12 },
  { name: 'Tue', checkIns: 52, checkOuts: 41, assignments: 18 },
  { name: 'Wed', checkIns: 48, checkOuts: 45, assignments: 15 },
  { name: 'Thu', checkIns: 61, checkOuts: 52, assignments: 22 },
  { name: 'Fri', checkIns: 55, checkOuts: 48, assignments: 19 },
  { name: 'Sat', checkIns: 28, checkOuts: 25, assignments: 8 },
  { name: 'Sun', checkIns: 22, checkOuts: 20, assignments: 5 }
];

const statusData = [
  { name: 'Available', value: 355, color: '#4caf50' },
  { name: 'Assigned', value: 892, color: '#2196f3' },
  { name: 'Maintenance', value: 45, color: '#ff9800' },
  { name: 'Lost/Damaged', value: 12, color: '#f44336' }
];

function StatCard({ title, value, change, icon, color = 'primary' }) {
  const isPositive = change > 0;
  
  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value.toLocaleString()}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              {isPositive ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
              <Typography
                variant="body2"
                color={isPositive ? 'success.main' : 'error.main'}
                sx={{ ml: 0.5 }}
              >
                {isPositive ? '+' : ''}{change}% from last month
              </Typography>
            </Box>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

function DashboardOverview({ onShowSnackbar }) {
  const [stats, setStats] = useState(mockStats);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // In real app, fetch from API
      // const response = await fetch('/api/dashboard/stats');
      // const data = await response.json();
      // setStats(data);
      
      // Simulate API call
      setTimeout(() => {
        setStats(mockStats);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      onShowSnackbar('Failed to load dashboard data', 'error');
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'checkin': return <CheckCircle color="success" />;
      case 'checkout': return <Schedule color="warning" />;
      case 'assign': return <Assignment color="primary" />;
      case 'maintenance': return <Warning color="error" />;
      default: return <NfcOutlined />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'checkin': return 'success';
      case 'checkout': return 'warning';
      case 'assign': return 'primary';
      case 'maintenance': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Tenants"
            value={stats.activeTenants}
            change={8.2}
            icon={<Business />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            change={12.5}
            icon={<People />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Items"
            value={stats.totalItems}
            change={5.8}
            icon={<Inventory />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Assignments"
            value={stats.activeAssignments}
            change={-2.1}
            icon={<Assignment />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Activity Chart */}
        <Grid item xs={12} lg={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Activity
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="checkIns" stroke="#4caf50" strokeWidth={2} />
                    <Line type="monotone" dataKey="checkOuts" stroke="#ff9800" strokeWidth={2} />
                    <Line type="monotone" dataKey="assignments" stroke="#2196f3" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Item Status Distribution */}
        <Grid item xs={12} lg={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Item Status Distribution
              </Typography>
              <Box sx={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 2 }}>
                {statusData.map((item, index) => (
                  <Box key={index} display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: item.color,
                          borderRadius: '50%',
                          mr: 1
                        }}
                      />
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} lg={6}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  Recent Activity
                </Typography>
                <Button size="small" onClick={() => onShowSnackbar('Activity refreshed', 'success')}>
                  Refresh
                </Button>
              </Box>
              <List>
                {stats.recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">
                              {activity.item}
                            </Typography>
                            <Chip
                              label={activity.type}
                              size="small"
                              color={getActivityColor(activity.type)}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={`${activity.operator} • ${activity.timestamp}`}
                      />
                    </ListItem>
                    {index < stats.recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Alerts */}
        <Grid item xs={12} lg={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Alerts
              </Typography>
              <List>
                {stats.alerts.map((alert, index) => (
                  <React.Fragment key={alert.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Warning color={alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={alert.message}
                        secondary={
                          <Chip
                            label={`${alert.count} items`}
                            size="small"
                            color={alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'}
                          />
                        }
                      />
                    </ListItem>
                    {index < stats.alerts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardOverview;