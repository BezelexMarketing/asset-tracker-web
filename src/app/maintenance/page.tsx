'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Fab,
  Alert,
  Avatar,
  Tooltip,
  CircularProgress,
  Badge,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Tabs,
  Tab,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Build as MaintenanceIcon,
  CheckCircle as CompletedIcon,
  Schedule as ScheduledIcon,
  Warning as UrgentIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  NearMe as NfcIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  MonetizationOn as MoneyIcon,
  DateRange as DateRangeIcon,
  Notifications as NotificationsIcon,
  ExpandMore as ExpandMoreIcon,
  Dashboard as DashboardIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
  EventNote as EventNoteIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { Client, Item } from '../../types';
import { generateId, formatTimestamp, createActionLog } from '../../lib/utils';
import ClientLookup from '../../components/ClientLookup';
import NFCScanner from '../../components/NFCScanner';
import ProtectedRoute from '../../components/ProtectedRoute';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface MaintenanceRecord {
  id: string;
  itemId: string;
  itemName: string;
  itemSerial: string;
  clientId: string;
  clientName: string;
  type: 'Scheduled' | 'Repair' | 'Inspection' | 'Upgrade';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  assignedTo: string;
  scheduledDate: string;
  completedDate?: string;
  estimatedCost: number;
  actualCost?: number;
  duration?: number;
  laborCost?: number;
  parts: { name: string; cost: number; quantity: number }[];
  location: string;
  notes: string;
  images: string[];
  nfcTagId?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data for maintenance records with client support
const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: '1',
    itemId: '3',
    itemName: 'Company Vehicle',
    itemSerial: 'VH012',
    clientId: 'client1',
    clientName: 'TechCorp Solutions',
    type: 'Scheduled',
    priority: 'medium',
    status: 'in_progress',
    description: 'Regular oil change and tire rotation',
    assignedTo: 'Mike Johnson',
    scheduledDate: '2024-01-20T09:00:00Z',
    estimatedCost: 150.00,
    parts: [
      { name: 'Oil Filter', cost: 25.00, quantity: 1 },
      { name: 'Motor Oil', cost: 35.00, quantity: 1 }
    ],
    location: 'Service Center A',
    notes: 'Vehicle due for routine maintenance',
    images: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
    nfcTagId: 'NFC-VH012',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-19T14:30:00Z'
  },
  {
    id: '2',
    itemId: '2',
    itemName: 'Drill Set Professional',
    itemSerial: 'DRL045',
    clientId: 'client2',
    clientName: 'BuildRight Construction',
    type: 'Repair',
    priority: 'high',
    status: 'completed',
    description: 'Replace worn drill bits and motor repair',
    assignedTo: 'Tech Team',
    scheduledDate: '2024-01-15T14:00:00Z',
    completedDate: '2024-01-16T16:30:00Z',
    estimatedCost: 75.00,
    actualCost: 82.50,
    parts: [
      { name: 'Drill Bits Set', cost: 45.00, quantity: 1 },
      { name: 'Motor Parts', cost: 37.50, quantity: 1 }
    ],
    location: 'Workshop B',
    notes: 'Motor was more damaged than expected',
    images: ['/api/placeholder/300/200'],
    nfcTagId: 'NFC-DRL045',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-16T16:30:00Z'
  },
  {
    id: '3',
    itemId: '1',
    itemName: 'MacBook Pro 16"',
    itemSerial: 'MBP001',
    clientId: 'client1',
    clientName: 'TechCorp Solutions',
    type: 'Inspection',
    priority: 'low',
    status: 'scheduled',
    description: 'Annual hardware inspection and cleaning',
    assignedTo: 'IT Support',
    scheduledDate: '2024-01-25T10:00:00Z',
    estimatedCost: 50.00,
    parts: [],
    location: 'IT Department',
    notes: 'Routine annual maintenance',
    images: [],
    nfcTagId: 'NFC-MBP001',
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-10T11:00:00Z'
  }
];

const statusOptions = ['All', 'scheduled', 'in_progress', 'completed', 'cancelled'];
const priorityOptions = ['All', 'low', 'medium', 'high', 'urgent'];
const typeOptions = ['All', 'Scheduled', 'Repair', 'Inspection', 'Upgrade'];

const steps = ['Select Client', 'Scan/Select Item', 'Maintenance Details', 'Attach Images'];

export default function MaintenancePage() {
  const [maintenanceRecords, setMaintenanceRecords] = useState(mockMaintenanceRecords);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  // Filter and pagination logic
  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesSearch = record.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.itemSerial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || record.status === statusFilter;
    const matchesPriority = priorityFilter === '' || record.priority === priorityFilter;
    const matchesType = typeFilter === '' || record.type === typeFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const paginatedRecords = filteredRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <ProtectedRoute>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Maintenance Management
        </Typography>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab icon={<MaintenanceIcon />} label="Records" />
            <Tab icon={<CalendarIcon />} label="Calendar" />
            <Tab icon={<AnalyticsIcon />} label="Analytics" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <>
            {/* Quick Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          Total Records
                        </Typography>
                        <Typography variant="h4">
                          {maintenanceRecords.length}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <MaintenanceIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          Completed
                        </Typography>
                        <Typography variant="h4">
                          {maintenanceRecords.filter(r => r.status === 'completed').length}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <CompletedIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          Scheduled
                        </Typography>
                        <Typography variant="h4">
                          {maintenanceRecords.filter(r => r.status === 'scheduled').length}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <ScheduledIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          Urgent
                        </Typography>
                        <Typography variant="h4">
                          {maintenanceRecords.filter(r => r.priority === 'high').length}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'error.main' }}>
                        <UrgentIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      placeholder="Search maintenance records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="scheduled">Scheduled</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={priorityFilter}
                        label="Priority"
                        onChange={(e) => setPriorityFilter(e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="urgent">Urgent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={typeFilter}
                        label="Type"
                        onChange={(e) => setTypeFilter(e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Scheduled">Scheduled</MenuItem>
                        <MenuItem value="Repair">Repair</MenuItem>
                        <MenuItem value="Inspection">Inspection</MenuItem>
                        <MenuItem value="Upgrade">Upgrade</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FilterIcon />}
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('');
                        setPriorityFilter('');
                        setTypeFilter('');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Records Table */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Maintenance Records ({filteredRecords.length})
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                  >
                    Schedule Maintenance
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Client</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Scheduled Date</TableCell>
                        <TableCell>Technician</TableCell>
                        <TableCell>Cost</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedRecords.map((record) => (
                        <TableRow key={record.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                <InventoryIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">
                                  {record.itemName}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {record.itemId}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                                <BusinessIcon />
                              </Avatar>
                              <Typography variant="body2">
                                {record.clientName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={record.type} 
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={record.status} 
                              color={getStatusColor(record.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={record.priority} 
                              color={getPriorityColor(record.priority) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {new Date(record.scheduledDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 1, width: 24, height: 24 }}>
                                <PersonIcon sx={{ fontSize: 16 }} />
                              </Avatar>
                              <Typography variant="body2">
                                {record.assignedTo}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="success.main">
                              ${record.estimatedCost.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setAnchorEl(e.currentTarget);
                                setSelectedRecord(record);
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={filteredRecords.length}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </CardContent>
            </Card>
          </>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Maintenance Calendar
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  Calendar view coming soon...
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Maintenance Analytics
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  Analytics dashboard coming soon...
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Box>
    </ProtectedRoute>
  );
}