'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  PhoneAndroid as AndroidIcon,
  Apple as AppleIcon,
  Computer as DesktopIcon,
  Language as WebIcon,
  CheckCircle as CheckIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CloudSync as SyncIcon,
  CloudOff as OfflineIcon,
  QrCodeScanner as ScanIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const DownloadsPage = () => {
  const clientApps = [
    {
      id: 'pwa',
      title: 'Progressive Web App (PWA)',
      subtitle: 'Works on all devices - iOS & Android',
      description: 'Access Asset Tracker Pro directly from your web browser. Works on mobile, tablet, and desktop with offline capabilities. Perfect for iOS devices - install directly from Safari!',
      icon: <WebIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      features: [
        'Works on all devices (iOS, Android, Desktop)',
        'Install from Safari on iOS',
        'Offline functionality',
        'Push notifications',
        'Auto-updates',
        'No App Store required'
      ],
      downloadUrl: 'https://asset-tracker-pro.vercel.app',
      buttonText: 'Open Web App',
      recommended: true,
      status: 'Available',
      installInstructions: {
        ios: [
          'Open Safari on your iPhone or iPad',
          'Navigate to the web app URL',
          'Tap the Share button (square with arrow)',
          'Select "Add to Home Screen"',
          'Confirm installation'
        ],
        android: [
          'Open Chrome on your Android device',
          'Navigate to the web app URL',
          'Tap the menu (three dots)',
          'Select "Add to Home screen"',
          'Confirm installation'
        ]
      }
    },
    {
      id: 'desktop',
      title: 'Desktop Application',
      subtitle: 'Windows, Mac & Linux',
      description: 'Native desktop application with enhanced performance and system integration for power users.',
      icon: <DesktopIcon sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      features: [
        'Native performance',
        'System integration',
        'File import/export',
        'Keyboard shortcuts',
        'Offline mode',
        'Auto-updater'
      ],
      downloadUrl: '#',
      buttonText: 'Download Desktop App',
      recommended: false,
      status: 'Available'
    },
    {
      id: 'android',
      title: 'Android Mobile App',
      subtitle: 'Android 7.0+',
      description: 'Native Android application optimized for mobile asset management with barcode scanning and NFC support.',
      icon: <AndroidIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      features: [
        'Barcode scanning',
        'NFC support',
        'Camera integration',
        'GPS tracking',
        'Push notifications',
        'Offline sync'
      ],
      downloadUrl: '#',
      buttonText: 'Download APK',
      recommended: false,
      status: 'Coming Soon'
    },
    {
      id: 'ios',
      title: 'iOS Mobile App',
      subtitle: 'iOS 12.0+',
      description: 'Native iOS application with seamless integration into the Apple ecosystem and advanced scanning capabilities.',
      icon: <AppleIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      features: [
        'iOS integration',
        'Face ID / Touch ID',
        'Camera scanning',
        'Siri shortcuts',
        'Apple Watch support',
        'iCloud sync'
      ],
      downloadUrl: '#',
      buttonText: 'Download from App Store',
      recommended: false,
      status: 'Coming Soon'
    }
  ];

  const systemRequirements = {
    pwa: [
      'Modern web browser (Chrome, Firefox, Safari, Edge)',
      'Internet connection for initial setup',
      'JavaScript enabled'
    ],
    desktop: [
      'Windows 10/11, macOS 10.14+, or Linux',
      '4GB RAM minimum, 8GB recommended',
      '500MB available disk space',
      'Internet connection for updates'
    ],
    mobile: [
      'Android 7.0+ or iOS 12.0+',
      '2GB RAM minimum',
      '100MB available storage',
      'Camera for barcode scanning'
    ]
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h2" gutterBottom fontWeight="bold">
              Download Asset Tracker Pro
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, mb: 4 }}>
              Choose the perfect client application for your device and workflow
            </Typography>
            <Alert 
              severity="info" 
              sx={{ 
                maxWidth: 600, 
                mx: 'auto', 
                bgcolor: 'rgba(255,255,255,0.1)', 
                color: 'white',
                '& .MuiAlert-icon': { color: 'white' }
              }}
            >
              All applications connect to the same asset database and sync in real-time
            </Alert>
          </motion.div>
        </Container>
      </Box>

      {/* Applications Grid */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {clientApps.map((app, index) => (
            <Grid item xs={12} md={6} key={app.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }, 
                    transition: 'all 0.3s'
                  }}
                >
                  {app.recommended && (
                    <Chip
                      label="Recommended"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 1
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: app.color, mr: 2, width: 56, height: 56 }}>
                        {app.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" component="h3" gutterBottom>
                          {app.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {app.subtitle}
                        </Typography>
                        <Chip
                          label={app.status}
                          size="small"
                          color={app.status === 'Available' ? 'success' : 'warning'}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                      {app.description}
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Key Features:
                    </Typography>
                    <List dense>
                      {app.features.map((feature, idx) => (
                        <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant={app.recommended ? 'contained' : 'outlined'}
                      size="large"
                      fullWidth
                      startIcon={<DownloadIcon />}
                      href={app.downloadUrl}
                      disabled={app.status === 'Coming Soon'}
                      target={app.id === 'pwa' ? '_blank' : '_self'}
                      rel={app.id === 'pwa' ? 'noopener noreferrer' : ''}
                    >
                      {app.buttonText}
                    </Button>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* System Requirements */}
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom>
            System Requirements
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Ensure your device meets the minimum requirements for optimal performance
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WebIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Web App (PWA)</Typography>
                </Box>
                <List dense>
                  {systemRequirements.pwa.map((req, idx) => (
                    <ListItem key={idx} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={req}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DesktopIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Desktop App</Typography>
                </Box>
                <List dense>
                  {systemRequirements.desktop.map((req, idx) => (
                    <ListItem key={idx} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={req}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AndroidIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Mobile Apps</Typography>
                </Box>
                <List dense>
                  {systemRequirements.mobile.map((req, idx) => (
                    <ListItem key={idx} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={req}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Support Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom>
            Need Help?
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Our support team is here to help you get started
          </Typography>
          
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <SecurityIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Installation Guide
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Step-by-step instructions for each platform
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <SyncIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Setup Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get help configuring your first assets
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <NotificationIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  24/7 Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Contact our team anytime for assistance
                </Typography>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              href="mailto:support@beze-asset-tracker.com"
            >
              Contact Support
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default DownloadsPage;