'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import {
  Nfc as NfcIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { nfcApi, Item, Assignment } from '../lib/api';

interface NFCScannerProps {
  open: boolean;
  onClose: () => void;
  onItemFound?: (item: Item) => void;
  onAssignmentFound?: (assignment: Assignment) => void;
  mode?: 'lookup' | 'assign' | 'checkin' | 'checkout' | 'maintenance';
  operatorId?: string;
}

interface NFCState {
  isSupported: boolean;
  isScanning: boolean;
  error: string | null;
  success: boolean;
  scannedItem: Item | null;
  scannedAssignment: Assignment | null;
}

export default function NFCScanner({
  open,
  onClose,
  onItemFound,
  onAssignmentFound,
  mode = 'lookup',
  operatorId
}: NFCScannerProps) {
  const [nfcState, setNfcState] = useState<NFCState>({
    isSupported: false,
    isScanning: false,
    error: null,
    success: false,
    scannedItem: null,
    scannedAssignment: null
  });

  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Check NFC support on component mount
  useEffect(() => {
    checkNFCSupport();
  }, []);

  // Start scanning when dialog opens
  useEffect(() => {
    if (open && nfcState.isSupported) {
      startScanning();
    } else if (!open) {
      stopScanning();
    }
  }, [open, nfcState.isSupported]);

  // Pulse animation effect
  useEffect(() => {
    if (nfcState.isScanning) {
      const interval = setInterval(() => {
        setPulseAnimation(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [nfcState.isScanning]);

  const checkNFCSupport = async () => {
    try {
      // Check if Web NFC is supported
      if ('NDEFReader' in window) {
        setNfcState(prev => ({ ...prev, isSupported: true }));
      } else {
        setNfcState(prev => ({ 
          ...prev, 
          isSupported: false, 
          error: 'NFC is not supported on this device or browser' 
        }));
      }
    } catch (error) {
      console.error('NFC support check failed:', error);
      setNfcState(prev => ({ 
        ...prev, 
        isSupported: false, 
        error: 'Failed to check NFC support' 
      }));
    }
  };

  const startScanning = useCallback(async () => {
    if (!nfcState.isSupported) return;

    try {
      setNfcState(prev => ({ 
        ...prev, 
        isScanning: true, 
        error: null, 
        success: false 
      }));

      // Request NFC permission and start scanning
      const ndef = new (window as any).NDEFReader();
      
      await ndef.scan();
      
      ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
        handleNFCRead(serialNumber, message);
      });

      ndef.addEventListener('readingerror', () => {
        setNfcState(prev => ({ 
          ...prev, 
          error: 'Failed to read NFC tag. Please try again.' 
        }));
      });

    } catch (error: any) {
      console.error('NFC scanning failed:', error);
      let errorMessage = 'Failed to start NFC scanning';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'NFC permission denied. Please allow NFC access and try again.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'NFC is not supported on this device.';
      }
      
      setNfcState(prev => ({ 
        ...prev, 
        isScanning: false, 
        error: errorMessage 
      }));
    }
  }, [nfcState.isSupported]);

  const stopScanning = useCallback(() => {
    setNfcState(prev => ({ 
      ...prev, 
      isScanning: false 
    }));
  }, []);

  const handleNFCRead = async (tagId: string, message: any) => {
    try {
      setNfcState(prev => ({ ...prev, isScanning: false }));

      // Convert tag ID to hex string if needed
      const hexTagId = tagId.replace(/:/g, '').toLowerCase();

      let response;
      
      switch (mode) {
        case 'lookup':
          response = await nfcApi.lookup(hexTagId);
          break;
        case 'assign':
          if (!operatorId) {
            throw new Error('Operator ID is required for assignment');
          }
          response = await nfcApi.assign(hexTagId, operatorId);
          break;
        case 'checkin':
          response = await nfcApi.checkin(hexTagId);
          break;
        case 'checkout':
          response = await nfcApi.checkout(hexTagId);
          break;
        case 'maintenance':
          response = await nfcApi.maintenance(hexTagId);
          break;
        default:
          throw new Error('Invalid NFC mode');
      }

      if (response.success) {
        setNfcState(prev => ({ 
          ...prev, 
          success: true,
          scannedItem: response.data as Item,
          scannedAssignment: mode !== 'lookup' ? response.data as Assignment : null
        }));

        // Call appropriate callback
        if (mode === 'lookup' && onItemFound) {
          onItemFound(response.data as Item);
        } else if (mode !== 'lookup' && onAssignmentFound) {
          onAssignmentFound(response.data as Assignment);
        }

        // Auto-close after success
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setNfcState(prev => ({ 
          ...prev, 
          error: response.error || 'Unknown error occurred' 
        }));
      }
    } catch (error: any) {
      console.error('NFC read handling failed:', error);
      setNfcState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to process NFC tag' 
      }));
    }
  };

  const handleClose = () => {
    stopScanning();
    setNfcState(prev => ({ 
      ...prev, 
      error: null, 
      success: false, 
      scannedItem: null, 
      scannedAssignment: null 
    }));
    onClose();
  };

  const handleRetry = () => {
    setNfcState(prev => ({ 
      ...prev, 
      error: null, 
      success: false 
    }));
    startScanning();
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'lookup': return 'Scan NFC Tag';
      case 'assign': return 'Assign Item';
      case 'checkin': return 'Check In Item';
      case 'checkout': return 'Check Out Item';
      case 'maintenance': return 'Mark for Maintenance';
      default: return 'NFC Scanner';
    }
  };

  const getModeDescription = () => {
    switch (mode) {
      case 'lookup': return 'Hold your device near an NFC tag to look up item information';
      case 'assign': return 'Hold your device near an NFC tag to assign the item';
      case 'checkin': return 'Hold your device near an NFC tag to check in the item';
      case 'checkout': return 'Hold your device near an NFC tag to check out the item';
      case 'maintenance': return 'Hold your device near an NFC tag to mark item for maintenance';
      default: return 'Hold your device near an NFC tag';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '400px'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{getModeTitle()}</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', py: 3 }}>
        {!nfcState.isSupported ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            NFC is not supported on this device or browser. Please use a compatible device with NFC capabilities.
          </Alert>
        ) : nfcState.error ? (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              {nfcState.error}
            </Alert>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
            >
              Try Again
            </Button>
          </Box>
        ) : nfcState.success ? (
          <Fade in={nfcState.success}>
            <Box>
              <Zoom in={nfcState.success}>
                <CheckCircleIcon 
                  sx={{ 
                    fontSize: 64, 
                    color: 'success.main', 
                    mb: 2 
                  }} 
                />
              </Zoom>
              <Typography variant="h6" color="success.main" gutterBottom>
                Success!
              </Typography>
              {nfcState.scannedItem && (
                <Card sx={{ mt: 2, textAlign: 'left' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {nfcState.scannedItem.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Serial: {nfcState.scannedItem.serialNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Category: {nfcState.scannedItem.category}
                    </Typography>
                    <Chip 
                      label={nfcState.scannedItem.status} 
                      size="small" 
                      sx={{ mt: 1 }}
                      color={
                        nfcState.scannedItem.status === 'available' ? 'success' :
                        nfcState.scannedItem.status === 'assigned' ? 'primary' :
                        nfcState.scannedItem.status === 'maintenance' ? 'warning' : 'default'
                      }
                    />
                  </CardContent>
                </Card>
              )}
            </Box>
          </Fade>
        ) : (
          <Box>
            <Box
              sx={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  opacity: pulseAnimation ? 0.3 : 0.8,
                  transform: pulseAnimation ? 'scale(1.2)' : 'scale(1)',
                  transition: 'all 0.8s ease-in-out'
                }}
              />
              <NfcIcon 
                sx={{ 
                  fontSize: 64, 
                  color: nfcState.isScanning ? 'primary.main' : 'text.secondary',
                  zIndex: 1
                }} 
              />
            </Box>

            <Typography variant="h6" gutterBottom>
              {nfcState.isScanning ? 'Scanning...' : 'Ready to Scan'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {getModeDescription()}
            </Typography>

            {nfcState.isScanning && (
              <Box sx={{ mt: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Hold your device steady near the NFC tag
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        {!nfcState.isScanning && !nfcState.success && nfcState.isSupported && !nfcState.error && (
          <Button
            variant="contained"
            startIcon={<NfcIcon />}
            onClick={startScanning}
            size="large"
          >
            Start Scanning
          </Button>
        )}
        
        <Button onClick={handleClose} variant="outlined">
          {nfcState.success ? 'Done' : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}