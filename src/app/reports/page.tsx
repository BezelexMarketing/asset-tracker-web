'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Autocomplete,
  Badge,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Build as MaintenanceIcon,
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
  GetApp as ExportIcon,
  Email as EmailIcon,
  CloudDownload as CloudIcon,
  TableChart as TableIcon,
  PictureAsPdf as PdfIcon,
  Description as CsvIcon,
  Assessment as ReportsIcon,
  Sync as SyncIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  DateRange as DateRangeIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  Visibility as ViewIcon,
  Save as SaveIcon,
  Share as ShareIcon
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Legend
} from 'recharts';
import ProtectedRoute from '@/components/ProtectedRoute';
import ClientLookup from '@/components/ClientLookup';

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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ReportsPage() {
  // State management
  const [selectedReport, setSelectedReport] = useState('inventory');
  const [selectedDateRange, setSelectedDateRange] = useState('last_30_days');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [clientLookupOpen, setClientLookupOpen] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [reportTemplates, setReportTemplates] = useState<any[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState({
    categories: [],
    locations: [],
    operators: [],
    status: [],
    tags: []
  });
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] = useState('previous_period');

  // Mock data with enhanced structure
  const reportTypes = [
    { value: 'inventory', label: 'Inventory Overview', icon: InventoryIcon },
    { value: 'assignments', label: 'Assignment Analytics', icon: AssignmentIcon },
    { value: 'maintenance', label: 'Maintenance Reports', icon: MaintenanceIcon },
    { value: 'utilization', label: 'Utilization Analysis', icon: AnalyticsIcon },
    { value: 'financial', label: 'Financial Summary', icon: DashboardIcon },
    { value: 'client_summary', label: 'Client Performance', icon: BusinessIcon },
    { value: 'operator_performance', label: 'Operator Performance', icon: PersonIcon },
    { value: 'location_analysis', label: 'Location Analysis', icon: LocationIcon },
    { value: 'trend_analysis', label: 'Trend Analysis', icon: TimelineIcon }
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' },
    { value: 'last_6_months', label: 'Last 6 Months' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'year_to_date', label: 'Year to Date' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const exportFormats = [
    { value: 'excel', label: 'Excel (.xlsx)', icon: TableIcon },
    { value: 'pdf', label: 'PDF Report', icon: PdfIcon },
    { value: 'csv', label: 'CSV Data', icon: CsvIcon },
    { value: 'google_sheets', label: 'Google Sheets', icon: CloudIcon },
    { value: 'email', label: 'Email Report', icon: EmailIcon },
    { value: 'api', label: 'API Export', icon: SyncIcon }
  ];

  const mockClients = [
    { id: '1', name: 'TechCorp Solutions', industry: 'Technology', items: 245, utilization: 87 },
    { id: '2', name: 'Manufacturing Plus', industry: 'Manufacturing', items: 189, utilization: 92 },
    { id: '3', name: 'Healthcare Systems', industry: 'Healthcare', items: 156, utilization: 78 },
    { id: '4', name: 'Construction Co', industry: 'Construction', items: 203, utilization: 85 },
    { id: '5', name: 'Retail Chain', industry: 'Retail', items: 134, utilization: 73 }
  ];

  const mockCategories = [
    'Laptops', 'Tablets', 'Tools', 'Equipment', 'Vehicles', 'Furniture', 'Electronics', 'Safety Gear'
  ];

  const mockLocations = [
    'Warehouse A', 'Warehouse B', 'Office Building', 'Field Site 1', 'Field Site 2', 'Mobile Units'
  ];

  const mockOperators = [
    'John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emily Davis', 'Chris Brown', 'Lisa Anderson'
  ];

  // Enhanced report data with real-time simulation
  const [reportData, setReportData] = useState({
    summary: {
      totalItems: 1247,
      activeAssignments: 892,
      maintenanceItems: 45,
      activeOperators: 156,
      utilizationRate: 84.2,
      revenue: 125000,
      costs: 89000,
      profit: 36000
    },
    trends: [
      { month: 'Jan', assignments: 120, returns: 98, maintenance: 15, revenue: 18500 },
      { month: 'Feb', assignments: 135, returns: 110, maintenance: 12, revenue: 21200 },
      { month: 'Mar', assignments: 148, returns: 125, maintenance: 18, revenue: 24800 },
      { month: 'Apr', assignments: 162, returns: 140, maintenance: 22, revenue: 28100 },
      { month: 'May', assignments: 178, returns: 155, maintenance: 16, revenue: 31500 },
      { month: 'Jun', assignments: 195, returns: 170, maintenance: 20, revenue: 35200 }
    ],
    statusDistribution: [
      { name: 'Assigned', value: 45, color: '#4caf50' },
      { name: 'Available', value: 30, color: '#2196f3' },
      { name: 'Maintenance', value: 15, color: '#ff9800' },
      { name: 'Retired', value: 10, color: '#f44336' }
    ],
    clientBreakdown: [
      { client: 'TechCorp Solutions', items: 245, assignments: 198, utilization: 87, revenue: 42500 },
      { client: 'Manufacturing Plus', items: 189, assignments: 174, utilization: 92, revenue: 38200 },
      { client: 'Healthcare Systems', items: 156, assignments: 122, utilization: 78, revenue: 28900 },
      { client: 'Construction Co', items: 203, assignments: 173, utilization: 85, revenue: 35600 },
      { client: 'Retail Chain', items: 134, assignments: 98, utilization: 73, revenue: 22800 }
    ],
    categoryBreakdown: [
      { category: 'Laptops', count: 245, value: 485000, utilization: 89 },
      { category: 'Tablets', count: 189, value: 142000, utilization: 76 },
      { category: 'Tools', count: 156, value: 89000, utilization: 92 },
      { category: 'Equipment', count: 203, value: 156000, utilization: 84 },
      { category: 'Vehicles', count: 134, value: 890000, utilization: 78 }
    ],
    topItems: [
      { name: 'MacBook Pro 16"', category: 'Laptops', client: 'TechCorp Solutions', assignments: 45 },
      { name: 'iPad Pro 12.9"', category: 'Tablets', client: 'Healthcare Systems', assignments: 38 },
      { name: 'Drill Set Professional', category: 'Tools', client: 'Construction Co', assignments: 32 },
      { name: 'Projector 4K', category: 'Equipment', client: 'Manufacturing Plus', assignments: 28 },
      { name: 'Company Vehicle', category: 'Vehicles', client: 'Retail Chain', assignments: 25 }
    ],
    performanceMetrics: {
      avgAssignmentDuration: 14.5,
      returnRate: 98.2,
      maintenanceFrequency: 2.1,
      customerSatisfaction: 4.7,
      operatorEfficiency: 87.3
    },
    realTimeData: {
      activeUsers: 23,
      ongoingAssignments: 156,
      pendingReturns: 12,
      maintenanceAlerts: 3,
      systemLoad: 67
    }
  });

  // Real-time data simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (realTimeEnabled && autoRefresh) {
      interval = setInterval(() => {
        setReportData(prev => ({
          ...prev,
          realTimeData: {
            activeUsers: Math.floor(Math.random() * 50) + 10,
            ongoingAssignments: Math.floor(Math.random() * 200) + 100,
            pendingReturns: Math.floor(Math.random() * 20) + 5,
            maintenanceAlerts: Math.floor(Math.random() * 10),
            systemLoad: Math.floor(Math.random() * 40) + 50
          },
          summary: {
            ...prev.summary,
            activeAssignments: prev.summary.activeAssignments + Math.floor(Math.random() * 10) - 5
          }
        }));
      }, refreshInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [realTimeEnabled, autoRefresh, refreshInterval]);

  // Enhanced functions
  const handleGenerateReport = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call with enhanced data processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update report data based on filters
      const filteredData = {
        ...reportData,
        summary: {
          ...reportData.summary,
          totalItems: selectedClient ? selectedClient.items : reportData.summary.totalItems,
          utilizationRate: selectedClient ? selectedClient.utilization : reportData.summary.utilizationRate
        }
      };
      
      setReportData(filteredData);
      setSnackbar({
        open: true,
        message: `${selectedReport.replace('_', ' ').toUpperCase()} report generated successfully`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to generate report',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedReport, selectedClient, reportData]);

  const handleExportReport = async (format: string, options?: any) => {
    try {
      setLoading(true);
      const reportConfig = {
        type: selectedReport,
        dateRange: selectedDateRange,
        client: selectedClient?.name || 'All Clients',
        customDateRange,
        data: reportData,
        timestamp: new Date().toISOString(),
        filters: advancedFilters,
        realTimeEnabled,
        compareMode,
        comparisonPeriod
      };

      // Simulate export processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      switch (format) {
        case 'excel':
          console.log('Exporting to Excel:', reportConfig);
          setSnackbar({ open: true, message: 'Excel export completed', severity: 'success' });
          break;
        case 'pdf':
          console.log('Exporting to PDF:', reportConfig);
          setSnackbar({ open: true, message: 'PDF export completed', severity: 'success' });
          break;
        case 'csv':
          console.log('Exporting to CSV:', reportConfig);
          setSnackbar({ open: true, message: 'CSV export completed', severity: 'success' });
          break;
        case 'google_sheets':
          console.log('Exporting to Google Sheets:', reportConfig);
          setSnackbar({ open: true, message: 'Google Sheets export completed', severity: 'success' });
          break;
        case 'email':
          console.log('Emailing report:', reportConfig);
          setSnackbar({ open: true, message: 'Report emailed successfully', severity: 'success' });
          break;
        case 'api':
          console.log('API export:', reportConfig);
          setSnackbar({ open: true, message: 'API export completed', severity: 'success' });
          break;
        default:
          console.log(`Exporting ${selectedReport} report as ${format}`);
      }
      
      setExportDialogOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Export failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = () => {
    const newReport = {
      id: Date.now().toString(),
      name: `${selectedReport.replace('_', ' ')} - ${new Date().toLocaleDateString()}`,
      type: selectedReport,
      filters: { client: selectedClient, dateRange: selectedDateRange, advancedFilters },
      createdAt: new Date().toISOString()
    };
    setSavedReports(prev => [...prev, newReport]);
    setSnackbar({ open: true, message: 'Report saved successfully', severity: 'success' });
  };

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Simulate data refresh
      setReportData(prev => ({
        ...prev,
        summary: {
          ...prev.summary,
          totalItems: prev.summary.totalItems + Math.floor(Math.random() * 20) - 10
        }
      }));
      setSnackbar({ open: true, message: 'Data refreshed successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to refresh data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedClient(null);
    setSelectedItems([]);
    setAdvancedFilters({
      categories: [],
      locations: [],
      operators: [],
      status: [],
      tags: []
    });
    setSnackbar({ open: true, message: 'Filters cleared', severity: 'info' });
  };

  const formatTimestamp = () => {
    return new Date().toLocaleString();
  };

  const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#795548'];

  return (
    <ProtectedRoute>
      <Box sx={{ p: 3 }}>
        {/* Header with Real-time Controls */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Advanced Reports & Analytics
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Generate comprehensive reports with real-time data, advanced filtering, and intelligent insights
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={realTimeEnabled}
                    onChange={(e) => setRealTimeEnabled(e.target.checked)}
                    color="primary"
                  />
                }
                label="Real-time"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    disabled={!realTimeEnabled}
                    color="primary"
                  />
                }
                label="Auto-refresh"
              />
              <Tooltip title="Refresh Data">
                <IconButton onClick={handleRefreshData} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Save Report">
                <IconButton onClick={handleSaveReport}>
                  <SaveIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Real-time Status Bar */}
          {realTimeEnabled && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.50' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <Badge badgeContent={reportData.realTimeData.activeUsers} color="success">
                      <PersonIcon />
                    </Badge>
                    <Typography variant="body2">
                      Active Users: {reportData.realTimeData.activeUsers}
                    </Typography>
                    <Badge badgeContent={reportData.realTimeData.ongoingAssignments} color="primary">
                      <AssignmentIcon />
                    </Badge>
                    <Typography variant="body2">
                      Ongoing: {reportData.realTimeData.ongoingAssignments}
                    </Typography>
                    <Badge badgeContent={reportData.realTimeData.maintenanceAlerts} color="warning">
                      <NotificationIcon />
                    </Badge>
                    <Typography variant="body2">
                      Alerts: {reportData.realTimeData.maintenanceAlerts}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      System Load: {reportData.realTimeData.systemLoad}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={reportData.realTimeData.systemLoad}
                      color={reportData.realTimeData.systemLoad > 80 ? 'error' : reportData.realTimeData.systemLoad > 60 ? 'warning' : 'success'}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>

        {/* Enhanced Filter Breadcrumbs */}
        {(selectedClient || advancedFilters.categories.length > 0) && (
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ py: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Breadcrumbs aria-label="filter breadcrumb">
                  <Link
                    component="button"
                    variant="body2"
                    onClick={resetFilters}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <BusinessIcon sx={{ mr: 0.5, fontSize: 16 }} />
                    All Data
                  </Link>
                  {selectedClient && (
                    <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <BusinessIcon sx={{ mr: 0.5, fontSize: 16 }} />
                      {selectedClient.name}
                    </Typography>
                  )}
                  {advancedFilters.categories.length > 0 && (
                    <Chip 
                      label={`${advancedFilters.categories.length} Categories`}
                      size="small"
                      onDelete={() => setAdvancedFilters(prev => ({ ...prev, categories: [] }))}
                    />
                  )}
                </Breadcrumbs>
                <Button
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={resetFilters}
                >
                  Clear All
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Report Configuration */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <SettingsIcon sx={{ mr: 1 }} />
              Report Configuration
            </Typography>
            
            {/* Main Configuration Row */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={selectedReport}
                    label="Report Type"
                    onChange={(e) => setSelectedReport(e.target.value)}
                  >
                    {reportTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <type.icon sx={{ mr: 1, fontSize: 16 }} />
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={selectedDateRange}
                    label="Date Range"
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                  >
                    {dateRanges.map((range) => (
                      <MenuItem key={range.value} value={range.value}>
                        {range.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  onClick={() => setClientLookupOpen(true)}
                  startIcon={<GroupIcon />}
                  fullWidth
                >
                  {selectedClient ? selectedClient.name.substring(0, 10) + '...' : 'Select Client'}
                </Button>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="contained"
                  onClick={handleGenerateReport}
                  disabled={loading}
                  fullWidth
                  startIcon={loading ? <CircularProgress size={20} /> : <ReportsIcon />}
                >
                  {loading ? 'Generating...' : 'Generate'}
                </Button>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  onClick={() => setExportDialogOpen(true)}
                  startIcon={<DownloadIcon />}
                  fullWidth
                >
                  Export
                </Button>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  onClick={() => setScheduleDialogOpen(true)}
                  startIcon={<ScheduleIcon />}
                  fullWidth
                >
                  Schedule
                </Button>
              </Grid>
            </Grid>

            {/* Advanced Filters Accordion */}
            <Accordion expanded={filterExpanded} onChange={() => setFilterExpanded(!filterExpanded)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                  <FilterIcon sx={{ mr: 1 }} />
                  Advanced Filters & Options
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Client Filter */}
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Client</InputLabel>
                      <Select
                        value={selectedClient?.id || ''}
                        label="Client"
                        onChange={(e) => {
                          const client = mockClients.find(c => c.id === e.target.value);
                          setSelectedClient(client || null);
                        }}
                      >
                        <MenuItem value="">All Clients</MenuItem>
                        {mockClients.map((client) => (
                          <MenuItem key={client.id} value={client.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <BusinessIcon sx={{ mr: 1, fontSize: 16 }} />
                              {client.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Category Filter */}
                  <Grid item xs={12} md={3}>
                    <Autocomplete
                      multiple
                      options={mockCategories}
                      value={advancedFilters.categories}
                      onChange={(_, newValue) => 
                        setAdvancedFilters(prev => ({ ...prev, categories: newValue }))
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Categories" placeholder="Select categories" />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option}
                            size="small"
                            {...getTagProps({ index })}
                            key={option}
                          />
                        ))
                      }
                    />
                  </Grid>

                  {/* Location Filter */}
                  <Grid item xs={12} md={3}>
                    <Autocomplete
                      multiple
                      options={mockLocations}
                      value={advancedFilters.locations}
                      onChange={(_, newValue) => 
                        setAdvancedFilters(prev => ({ ...prev, locations: newValue }))
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Locations" placeholder="Select locations" />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option}
                            size="small"
                            {...getTagProps({ index })}
                            key={option}
                          />
                        ))
                      }
                    />
                  </Grid>

                  {/* Operator Filter */}
                  <Grid item xs={12} md={3}>
                    <Autocomplete
                      multiple
                      options={mockOperators}
                      value={advancedFilters.operators}
                      onChange={(_, newValue) => 
                        setAdvancedFilters(prev => ({ ...prev, operators: newValue }))
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Operators" placeholder="Select operators" />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option}
                            size="small"
                            {...getTagProps({ index })}
                            key={option}
                          />
                        ))
                      }
                    />
                  </Grid>

                  {/* Custom Date Range */}
                  {selectedDateRange === 'custom' && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Start Date"
                          type="date"
                          value={customDateRange.startDate}
                          onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="End Date"
                          type="date"
                          value={customDateRange.endDate}
                          onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </>
                  )}

                  {/* Comparison Mode */}
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={compareMode}
                          onChange={(e) => setCompareMode(e.target.checked)}
                        />
                      }
                      label="Enable Comparison Mode"
                    />
                    {compareMode && (
                      <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Compare With</InputLabel>
                        <Select
                          value={comparisonPeriod}
                          label="Compare With"
                          onChange={(e) => setComparisonPeriod(e.target.value)}
                        >
                          <MenuItem value="previous_period">Previous Period</MenuItem>
                          <MenuItem value="same_period_last_year">Same Period Last Year</MenuItem>
                          <MenuItem value="custom_period">Custom Period</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  </Grid>

                  {/* Auto-refresh Settings */}
                  {realTimeEnabled && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Refresh Interval (seconds)"
                        type="number"
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(Number(e.target.value))}
                        inputProps={{ min: 10, max: 300 }}
                        disabled={!autoRefresh}
                      />
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>

        {/* Enhanced Summary Cards with Trends */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ position: 'relative', overflow: 'visible' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Total Items</Typography>
                  {realTimeEnabled && (
                    <Chip 
                      label="LIVE" 
                      size="small" 
                      color="success" 
                      sx={{ ml: 'auto', fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
                <Typography variant="h4" color="primary.main">
                  {reportData.summary.totalItems.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                  <Typography variant="body2" color="success.main">
                    +5.2% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AssignmentIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6">Active Assignments</Typography>
                  {realTimeEnabled && (
                    <Chip 
                      label="LIVE" 
                      size="small" 
                      color="success" 
                      sx={{ ml: 'auto', fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
                <Typography variant="h4" color="success.main">
                  {reportData.summary.activeAssignments.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                  <Typography variant="body2" color="success.main">
                    +2.8% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MaintenanceIcon sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h6">Maintenance Items</Typography>
                </Box>
                <Typography variant="h4" color="warning.main">
                  {reportData.summary.maintenanceItems}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingDownIcon sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                  <Typography variant="body2" color="success.main">
                    -1.2% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AnalyticsIcon sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="h6">Utilization Rate</Typography>
                </Box>
                <Typography variant="h4" color="info.main">
                  {reportData.summary.utilizationRate}%
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                  <Typography variant="body2" color="success.main">
                    +3.1% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Enhanced Tabbed Analytics */}
        <Card sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab label="Trends & Analytics" icon={<TimelineIcon />} />
              <Tab label="Performance Metrics" icon={<AnalyticsIcon />} />
              <Tab label="Client Analysis" icon={<BusinessIcon />} />
              <Tab label="Category Breakdown" icon={<CategoryIcon />} />
            </Tabs>
          </Box>

          {/* Trends & Analytics Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Activity Trends Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={reportData.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="assignments" stackId="1" stroke="#2196f3" fill="#2196f3" fillOpacity={0.3} />
                    <Area yAxisId="left" type="monotone" dataKey="returns" stackId="1" stroke="#4caf50" fill="#4caf50" fillOpacity={0.3} />
                    <Bar yAxisId="right" dataKey="revenue" fill="#ff9800" />
                    <Line yAxisId="left" type="monotone" dataKey="maintenance" stroke="#f44336" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={reportData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {reportData.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Performance Metrics Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Key Performance Indicators
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">Average Assignment Duration</Typography>
                      <Typography variant="h5">{reportData.performanceMetrics.avgAssignmentDuration} days</Typography>
                      <LinearProgress variant="determinate" value={75} sx={{ mt: 1 }} />
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">Return Rate</Typography>
                      <Typography variant="h5">{reportData.performanceMetrics.returnRate}%</Typography>
                      <LinearProgress variant="determinate" value={reportData.performanceMetrics.returnRate} color="success" sx={{ mt: 1 }} />
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">Customer Satisfaction</Typography>
                      <Typography variant="h5">{reportData.performanceMetrics.customerSatisfaction}/5.0</Typography>
                      <LinearProgress variant="determinate" value={reportData.performanceMetrics.customerSatisfaction * 20} color="success" sx={{ mt: 1 }} />
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Efficiency Metrics
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { metric: 'Assignment Duration', value: reportData.performanceMetrics.avgAssignmentDuration * 5 },
                    { metric: 'Return Rate', value: reportData.performanceMetrics.returnRate },
                    { metric: 'Maintenance Freq.', value: reportData.performanceMetrics.maintenanceFrequency * 30 },
                    { metric: 'Operator Efficiency', value: reportData.performanceMetrics.operatorEfficiency }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#2196f3" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Client Analysis Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Client Performance Analysis
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell align="right">Items</TableCell>
                    <TableCell align="right">Assignments</TableCell>
                    <TableCell align="right">Utilization</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="center">Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.clientBreakdown.map((client, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BusinessIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          {client.client}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{client.items}</TableCell>
                      <TableCell align="right">{client.assignments}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {client.utilization}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={client.utilization} 
                            sx={{ width: 60, height: 6 }}
                            color={client.utilization > 80 ? 'success' : client.utilization > 60 ? 'warning' : 'error'}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          ${client.revenue.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={client.utilization > 80 ? 'Excellent' : client.utilization > 60 ? 'Good' : 'Needs Attention'}
                          color={client.utilization > 80 ? 'success' : client.utilization > 60 ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Category Breakdown Tab */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Category Performance
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={reportData.categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" fill="#2196f3" name="Item Count" />
                    <Bar yAxisId="right" dataKey="utilization" fill="#4caf50" name="Utilization %" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Top Performing Items
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="right">Assignments</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.topItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {item.name}
                              </Typography>
                              <Chip label={item.category} size="small" variant="outlined" />
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="h6" color="primary">
                              {item.assignments}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>

        {/* Enhanced Export Dialog */}
        <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ExportIcon sx={{ mr: 1 }} />
              Export Report - {selectedReport.replace('_', ' ').toUpperCase()}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose your preferred export format and configure options
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Export Formats</Typography>
                <Grid container spacing={2}>
                  {exportFormats.map((format) => (
                    <Grid item xs={12} sm={6} md={4} key={format.value}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<format.icon />}
                        onClick={() => handleExportReport(format.value)}
                        sx={{ py: 2, height: '100%' }}
                        disabled={loading}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" fontWeight="medium">
                            {format.label}
                          </Typography>
                        </Box>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Export Options</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Include Charts and Visualizations"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Include Raw Data Tables"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Include Comparison Data"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Include Filter Summary"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Report Summary:</strong> {selectedReport.replace('_', ' ')} for {selectedDateRange.replace('_', ' ')}
                    {selectedClient && ` - ${selectedClient.name}`}
                    <br />
                    <strong>Generated:</strong> {formatTimestamp()}
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              startIcon={<ShareIcon />}
              onClick={() => handleExportReport('email')}
              disabled={loading}
            >
              Share Report
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Schedule Dialog */}
        <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ mr: 1 }} />
              Schedule Automated Report
            </Box>
          </DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 3 }}>
              Set up automated report generation and delivery for consistent monitoring.
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select defaultValue="weekly" label="Frequency">
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Recipients"
                  placeholder="Enter email addresses separated by commas"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Delivery Format</InputLabel>
                  <Select defaultValue="pdf" label="Delivery Format">
                    <MenuItem value="pdf">PDF Report</MenuItem>
                    <MenuItem value="excel">Excel Workbook</MenuItem>
                    <MenuItem value="dashboard_link">Dashboard Link</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch />}
                  label="Include trend analysis and recommendations"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => {
              setScheduleDialogOpen(false);
              setSnackbar({ open: true, message: 'Report scheduled successfully', severity: 'success' });
            }}>
              Schedule Report
            </Button>
          </DialogActions>
        </Dialog>

        {/* Client Lookup Dialog */}
        <ClientLookup
          open={clientLookupOpen}
          onClose={() => setClientLookupOpen(false)}
          onSelect={(client) => {
            setSelectedClient(client);
            setClientLookupOpen(false);
          }}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ProtectedRoute>
  );
}