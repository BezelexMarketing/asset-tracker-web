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
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
  Paper,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Build as MaintenanceIcon,
  Analytics as ReportsIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  Menu as MenuIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [benefitsRef, benefitsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      title: 'Inventory Management',
      description: 'Track and manage your assets with real-time updates, barcode scanning, and automated notifications.',
      color: '#1976d2',
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      title: 'Assignment Tracking',
      description: 'Monitor asset assignments, check-in/check-out processes, and maintain detailed assignment history.',
      color: '#388e3c',
    },
    {
      icon: <MaintenanceIcon sx={{ fontSize: 40 }} />,
      title: 'Maintenance Scheduling',
      description: 'Schedule preventive maintenance, track costs, and maintain comprehensive maintenance records.',
      color: '#f57c00',
    },
    {
      icon: <ReportsIcon sx={{ fontSize: 40 }} />,
      title: 'Advanced Analytics',
      description: 'Generate detailed reports, analyze trends, and make data-driven decisions with powerful analytics.',
      color: '#7b1fa2',
    },
  ];

  const benefits = [
    {
      icon: <SecurityIcon sx={{ fontSize: 30 }} />,
      title: 'Enterprise Security',
      description: 'Bank-level security with encryption and role-based access control.',
    },
    {
      icon: <CloudIcon sx={{ fontSize: 30 }} />,
      title: 'Cloud-Based',
      description: 'Access your data anywhere, anytime with our secure cloud infrastructure.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 30 }} />,
      title: 'Lightning Fast',
      description: 'Optimized performance for handling thousands of assets efficiently.',
    },
    {
      icon: <SupportIcon sx={{ fontSize: 30 }} />,
      title: '24/7 Support',
      description: 'Dedicated support team available around the clock to help you succeed.',
    },
  ];



  return (
    <Box>
      {/* Navigation */}
      <AppBar position="fixed" sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}>
            Bez-Asset-Tracker
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="primary">Features</Button>
              <Button color="primary" href="/downloads">Downloads</Button>
              <Button color="primary">About</Button>
              <Button color="primary">Contact</Button>
              <Button variant="contained" startIcon={<DownloadIcon />}>
                Get Started
              </Button>
            </Box>
          )}
          {isMobile && (
            <IconButton color="primary">
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        ref={heroRef}
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                  Professional Asset Management Made Simple
                </Typography>
                <Typography variant="h5" paragraph sx={{ opacity: 0.9, mb: 4 }}>
                  Streamline your asset tracking, maintenance scheduling, and reporting with Bez-Asset-Tracker's comprehensive platform.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                    startIcon={<DownloadIcon />}
                    href="/download/ios"
                  >
                    Download Mobile App
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Paper
                  elevation={20}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Key Features at a Glance
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {['Real-time Tracking', 'NFC Scanning', 'Mobile App', 'Cloud Sync', 'Analytics', 'Maintenance'].map((feature) => (
                      <Chip
                        key={feature}
                        label={feature}
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    ))}
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box ref={featuresRef} sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h2" align="center" gutterBottom>
              Powerful Features for Modern Businesses
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
              Everything you need to manage your assets efficiently and effectively
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card sx={{ height: '100%', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.3s' }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: feature.color, mr: 2, width: 56, height: 56 }}>
                          {feature.icon}
                        </Avatar>
                        <Typography variant="h5" component="h3">
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box ref={benefitsRef} sx={{ py: 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h2" align="center" gutterBottom>
              Why Choose Bez-Asset-Tracker?
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
              Built for reliability, security, and scale
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 64, height: 64 }}>
                      {benefit.icon}
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 10,
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom>
            Ready to Transform Your Asset Management?
          </Typography>
          <Typography variant="h6" paragraph sx={{ opacity: 0.9, mb: 4 }}>
            Join thousands of businesses already using Bez-Asset-Tracker to streamline their operations.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              variant="contained"
              size="large"
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
              startIcon={<DownloadIcon />}
              href="/downloads"
            >
              Download Client Apps
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: 'grey.900', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Bez-Asset-Tracker
              </Typography>
              <Typography variant="body2" paragraph>
                Professional asset management solutions for modern businesses. Track, manage, and optimize your assets with ease.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>Features</Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }} href="/downloads">Downloads</Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>Support</Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>Documentation</Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Contact Us
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">+27 72 615 7576</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">+27 83 567 0871</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">support@beze-asset-tracker.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">Office #5 Lifestyle Terrace Office Suites, 91 5th St, Nortmead,Benoni, 1501</Typography>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <Typography variant="body2" color="grey.400">
              © 2025 Bez-Asset-Tracker. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;