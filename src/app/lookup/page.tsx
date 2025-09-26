'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ImageList,
  ImageListItem,
  ImageListItemBar
} from '@mui/material';
import {
  NfcOutlined as NfcIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  Assignment as AssignmentIcon,
  Build as MaintenanceIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  PhotoCamera as PhotoIcon,
  ExpandMore as ExpandMoreIcon,
  QrCodeScanner as QrIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Item, Client } from '../../types';
import { generateId, formatTimestamp, getStatusColor } from '../../lib/utils';
import ClientLookup from '../../components/ClientLookup';
import ProtectedRoute from '../../components/ProtectedRoute';

// Mock data for demonstration
const mockItem: Item = {
  id: 'ITM-001',
  name: 'Dell Laptop XPS 13',
  category: 'Electronics',
  subcategory: 'Laptops',
  description: 'High-performance ultrabook for professional use',
  serialNumber: 'DL123456789',
  model: 'XPS 13 9310',
  manufacturer: 'Dell Technologies',
  purchaseDate: '2023-01-15',
  purchasePrice: 1299.99,
  currentValue: 899.99,
  condition: 'Good',
  status: 'assigned',
  location: 'Office Building A - Floor 3',
  assignedTo: 'John Smith',
  assignedDate: '2023-02-01',
  nfcTagId: 'NFC-12345',
  qrCode: 'QR-ITM-001',
  images: [
    '/api/placeholder/300/200',
    '/api/placeholder/300/200',
    '/api/placeholder/300/200'
  ],
  specifications: {
    processor: 'Intel Core i7-1165G7',
    memory: '16GB LPDDR4x',
    storage: '512GB SSD',
    display: '13.3" FHD+ InfinityEdge',
    graphics: 'Intel Iris Xe',
    battery: '52Wh',
    weight: '2.64 lbs'
  },
  warranty: {
    provider: 'Dell',
    startDate: '2023-01-15',
    endDate: '2026-01-15',
    type: 'Premium Support Plus'
  },
  compliance: {
    certifications: ['FCC', 'CE', 'Energy Star'],
    regulations: ['RoHS', 'WEEE'],
    lastAudit: '2023-11-15'
  }
};

const mockHistory = [
  {
    id: '1',
    type: 'assignment',
    action: 'Assigned to John Smith',
    timestamp: '2023-02-01T10:00:00Z',
    user: 'Admin User',
    details: 'Initial assignment for Q1 project work',
    icon: AssignmentIcon,
    color: 'primary'
  },
  {
    id: '2',
    type: 'maintenance',
    action: 'Scheduled maintenance completed',
    timestamp: '2023-03-15T14:30:00Z',
    user: 'Tech Support',
    details: 'Software updates and hardware inspection',
    icon: MaintenanceIcon,
    color: 'success'
  },
  {
    id: '3',
    type: 'location',
    action: 'Location updated',
    timestamp: '2023-04-10T09:15:00Z',
    user: 'John Smith',
    details: 'Moved from Office A-201 to A-305',
    icon: LocationIcon,
    color: 'info'
  },
  {
    id: '4',
    type: 'scan',
    action: 'NFC tag scanned',
    timestamp: '2023-12-01T16:45:00Z',
    user: 'Mobile App',
    details: 'Asset verification via mobile app',
    icon: NfcIcon,
    color: 'secondary'
  }
];

const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'TechCorp Solutions',
    email: 'admin@techcorp.com',
    phone: '+1-555-0123',
    address: '123 Business Ave, Tech City, TC 12345',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isActive: true
  }
];

export default function ProductLookupPage() {
  const [nfcScannerOpen, setNfcScannerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItem, setScannedItem] = useState<Item | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [specsExpanded, setSpecsExpanded] = useState(false);
  const [complianceExpanded, setComplianceExpanded] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientLookupOpen, setClientLookupOpen] = useState(false);

  const handleNfcScan = async () => {
    setIsScanning(true);
    setScanError(null);
    
    // Simulate NFC scanning process
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      
      if (success) {
        setScannedItem(mockItem);
        setScanError(null);
      } else {
        setScanError('No NFC tag detected. Please try again or ensure the tag is properly positioned.');
      }
      
      setIsScanning(false);
    }, 2000);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
  };

  const handleReset = () => {
    setScannedItem(null);
    setScanError(null);
    setNfcScannerOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned': return <CheckIcon color="success" />;
      case 'available': return <InfoIcon color="info" />;
      case 'maintenance': return <WarningIcon color="warning" />;
      case 'retired': return <ErrorIcon color="error" />;
      default: return <InfoIcon />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <ProtectedRoute>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Product Lookup
        </Typography>

        {/* Client Selection Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Client Context
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {selectedClient ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon color="primary" />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedClient.name}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No client selected
                </Typography>
              )}
            </Box>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={() => setClientLookupOpen(true)}
            >
              Select Client
            </Button>
          </CardContent>
        </Card>

      {!scannedItem ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Card sx={{ maxWidth: 400, mx: 'auto', p: 4 }}>
            <CardContent>
              <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80, mx: 'auto', mb: 3 }}>
                <NfcIcon sx={{ fontSize: 40 }} />
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                Tap to Scan Item
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Use NFC or QR code to instantly access comprehensive item information, history, and current status.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<NfcIcon />}
                    onClick={() => setNfcScannerOpen(true)}
                    sx={{ py: 1.5 }}
                  >
                    NFC Scan
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    startIcon={<QrIcon />}
                    onClick={() => setNfcScannerOpen(true)}
                    sx={{ py: 1.5 }}
                  >
                    QR Scan
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Item Overview Card */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      {scannedItem.name}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      {scannedItem.category} • {scannedItem.subcategory}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      icon={getStatusIcon(scannedItem.status)}
                      label={scannedItem.status.toUpperCase()}
                      color={getStatusColor(scannedItem.status) as any}
                      variant="filled"
                    />
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Serial Number</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {scannedItem.serialNumber}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">Model</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {scannedItem.model}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">Manufacturer</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {scannedItem.manufacturer}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Current Value</Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
                      {formatCurrency(scannedItem.currentValue)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">Condition</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {scannedItem.condition}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">NFC Tag ID</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                      {scannedItem.nfcTagId}
                    </Typography>
                  </Grid>
                </Grid>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Description</Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {scannedItem.description}
                </Typography>

                {/* Images */}
                {scannedItem.images && scannedItem.images.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Images ({scannedItem.images.length})
                    </Typography>
                    <ImageList sx={{ width: '100%', height: 200 }} cols={4} rowHeight={160}>
                      {scannedItem.images.map((image, index) => (
                        <ImageListItem key={index} sx={{ cursor: 'pointer' }}>
                          <img
                            src={image}
                            alt={`${scannedItem.name} ${index + 1}`}
                            loading="lazy"
                            onClick={() => handleImageClick(image)}
                            style={{ objectFit: 'cover' }}
                          />
                          <ImageListItemBar
                            actionIcon={
                              <IconButton sx={{ color: 'rgba(255, 255, 255, 0.54)' }}>
                                <ViewIcon />
                              </IconButton>
                            }
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Assignment Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon color="primary" />
                  Current Assignment
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PersonIcon color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Assigned To</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {scannedItem.assignedTo}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CalendarIcon color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Assignment Date</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {new Date(scannedItem.assignedDate!).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Current Location</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {scannedItem.location}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Expandable Sections */}
            <Box sx={{ mb: 3 }}>
              {/* Specifications */}
              <Accordion expanded={specsExpanded} onChange={() => setSpecsExpanded(!specsExpanded)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Technical Specifications</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {Object.entries(scannedItem.specifications || {}).map(([key, value]) => (
                      <Grid item xs={12} sm={6} key={key}>
                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {value}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Warranty & Compliance */}
              <Accordion expanded={complianceExpanded} onChange={() => setComplianceExpanded(!complianceExpanded)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Warranty & Compliance</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Warranty Information</Typography>
                      <Typography variant="body2" color="text.secondary">Provider</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>{scannedItem.warranty?.provider}</Typography>
                      
                      <Typography variant="body2" color="text.secondary">Type</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>{scannedItem.warranty?.type}</Typography>
                      
                      <Typography variant="body2" color="text.secondary">Valid Until</Typography>
                      <Typography variant="body1">
                        {scannedItem.warranty?.endDate ? new Date(scannedItem.warranty.endDate).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Compliance</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Certifications</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {scannedItem.compliance?.certifications?.map((cert, index) => (
                          <Chip key={index} label={cert} size="small" variant="outlined" />
                        ))}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">Last Audit</Typography>
                      <Typography variant="body1">
                        {scannedItem.compliance?.lastAudit ? new Date(scannedItem.compliance.lastAudit).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Grid>

          {/* Action Panel & History */}
          <Grid item xs={12} lg={4}>
            {/* Quick Actions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button variant="outlined" fullWidth size="small" startIcon={<ShareIcon />}>
                      Share
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button variant="outlined" fullWidth size="small" startIcon={<PrintIcon />}>
                      Print
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button variant="outlined" fullWidth size="small" startIcon={<DownloadIcon />}>
                      Export
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button variant="outlined" fullWidth size="small" startIcon={<SearchIcon />}>
                      New Scan
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* History */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon color="primary" />
                  Activity History
                </Typography>
                
                <List dense>
                  {mockHistory.map((entry, index) => (
                    <React.Fragment key={entry.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: `${entry.color}.main`, width: 32, height: 32 }}>
                            <entry.icon sx={{ fontSize: 16 }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={entry.action}
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(entry.timestamp).toLocaleString()}
                              </Typography>
                              <br />
                              <Typography variant="caption" color="text.secondary">
                                by {entry.user}
                              </Typography>
                              {entry.details && (
                                <>
                                  <br />
                                  <Typography variant="caption">
                                    {entry.details}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < mockHistory.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Reset Button */}
      {scannedItem && (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<NfcIcon />}
            onClick={handleReset}
            sx={{ borderRadius: 28, px: 3 }}
          >
            Scan New Item
          </Button>
        </Box>
      )}

      {/* NFC Scanner Dialog */}
      <Dialog open={nfcScannerOpen} onClose={() => setNfcScannerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <NfcIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5">NFC Scanner</Typography>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          {isScanning ? (
            <Box>
              <Typography variant="h6" gutterBottom>Scanning for NFC tag...</Typography>
              <LinearProgress sx={{ my: 3 }} />
              <Typography variant="body2" color="text.secondary">
                Hold your device near the NFC tag
              </Typography>
            </Box>
          ) : scanError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {scanError}
            </Alert>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Tap the scan button and hold your device near an NFC tag to retrieve item information.
            </Typography>
          )}
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setNfcScannerOpen(false)} disabled={isScanning}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleNfcScan}
            disabled={isScanning}
            startIcon={<NfcIcon />}
          >
            {isScanning ? 'Scanning...' : 'Start Scan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Item detail"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Close</Button>
          <Button startIcon={<DownloadIcon />}>Download</Button>
        </DialogActions>
      </Dialog>

      {/* Client Lookup Dialog */}
      <ClientLookup
        open={clientLookupOpen}
        onClose={() => setClientLookupOpen(false)}
        onClientSelected={(client) => {
          setSelectedClient(client);
          setClientLookupOpen(false);
        }}
      />
    </Box>
    </ProtectedRoute>
  );
}