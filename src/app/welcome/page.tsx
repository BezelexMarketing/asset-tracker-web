'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Paper,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Business,
  Inventory,
  Assignment,
  Security,
  CloudDone,
  PhoneAndroid,
  Computer,
  Tablet,
  CheckCircle,
  Star,
  ArrowForward,
  Close,
  Login,
  Download,
  Language,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();
  const [clientLoginDialog, setClientLoginDialog] = useState(false);
  const [clientCode, setClientCode] = useState('');
  const [demoDialog, setDemoDialog] = useState(false);

  const handleClientAccess = () => {
    if (clientCode.trim()) {
      // In a real implementation, this would validate the client code
      // and redirect to their branded portal
      router.push(`/client/${clientCode.toLowerCase()}`);
    }
  };

  const features = [
    {
      icon: <Inventory sx={{ fontSize: 40 }} />,
      title: 'Asset Tracking',
      description: 'Complete inventory management with real-time tracking and automated workflows'
    },
    {
      icon: <Assignment sx={{ fontSize: 40 }} />,
      title: 'Assignment Management',
      description: 'Streamlined asset assignments with digital signatures and return tracking'
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with role-based access and audit trails'
    },
    {
      icon: <CloudDone sx={{ fontSize: 40 }} />,
      title: 'Cloud-Based',
      description: 'Access your data anywhere, anytime with automatic backups and updates'
    }
  ];

  const platforms = [
    { icon: <PhoneAndroid sx={{ fontSize: 30 }} />, name: 'Mobile App', desc: 'iOS & Android' },
    { icon: <Computer sx={{ fontSize: 30 }} />, name: 'Web App', desc: 'Any Browser' },
    { icon: <Tablet sx={{ fontSize: 30 }} />, name: 'Tablet', desc: 'Optimized UI' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      company: 'Tech Solutions Inc',
      rating: 5,
      text: 'Asset Tracker Pro transformed our inventory management. The custom branding makes it feel like our own system.'
    },
    {
      name: 'Mike Chen',
      company: 'Construction Plus',
      rating: 5,
      text: 'The mobile app is perfect for our field teams. Real-time updates keep everyone synchronized.'
    },
    {
      name: 'Lisa Rodriguez',
      company: 'Healthcare Systems',
      rating: 5,
      text: 'Excellent support and the white-label solution fits perfectly with our brand identity.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Business sx={{ mr: 2, fontSize: 32 }} />
              <Typography variant="h5" fontWeight="bold">
                Asset Tracker Pro
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
                onClick={() => setClientLoginDialog(true)}
                startIcon={<Login />}
              >
                Client Access
              </Button>
              <Button
                variant="contained"
                sx={{ bgcolor: 'white', color: 'primary.main' }}
                onClick={() => setDemoDialog(true)}
              >
                Request Demo
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" fontWeight="bold" gutterBottom>
                Professional Asset Management
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Custom-branded asset tracking solutions for your business. 
                Manage inventory, assignments, and teams with enterprise-grade tools.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ bgcolor: 'white', color: 'primary.main', px: 4 }}
                  onClick={() => setClientLoginDialog(true)}
                  endIcon={<ArrowForward />}
                >
                  Access Your Portal
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ color: 'white', borderColor: 'white' }}
                  onClick={() => setDemoDialog(true)}
                >
                  See Demo
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 3 }}>
                {platforms.map((platform, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {platform.icon}
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {platform.name}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {platform.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={8}
                sx={{
                  p: 3,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Your Branded Solution Includes:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    'Custom logo and branding',
                    'Multi-platform access',
                    'Real-time synchronization',
                    'Advanced reporting',
                    'Role-based permissions',
                    '24/7 support'
                  ].map((feature, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ color: 'success.light', fontSize: 20 }} />
                      <Typography sx={{ color: 'white' }}>{feature}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" textAlign="center" gutterBottom>
          Powerful Features
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Everything you need to manage assets professionally
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" textAlign="center" gutterBottom>
            What Our Clients Say
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} sx={{ color: 'warning.main', fontSize: 20 }} />
                      ))}
                    </Box>
                    <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                      "{testimonial.text}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {testimonial.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {testimonial.company}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join hundreds of businesses already using Asset Tracker Pro
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ bgcolor: 'white', color: 'primary.main', px: 6, py: 2 }}
            onClick={() => setClientLoginDialog(true)}
            endIcon={<ArrowForward />}
          >
            Access Your Portal
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Business sx={{ mr: 2 }} />
                <Typography variant="h6">Asset Tracker Pro</Typography>
              </Box>
              <Typography color="grey.400">
                Professional asset management solutions with custom branding for your business.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h6" gutterBottom>
                Support
              </Typography>
              <Typography color="grey.400">
                Email: support@assettrackerpro.com
              </Typography>
              <Typography color="grey.400">
                Phone: 1-800-TRACKER
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, borderColor: 'grey.700' }} />
          <Typography textAlign="center" color="grey.400">
            © 2024 Asset Tracker Pro. All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Client Login Dialog */}
      <Dialog open={clientLoginDialog} onClose={() => setClientLoginDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Access Your Portal</Typography>
            <IconButton onClick={() => setClientLoginDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Enter your client code to access your branded Asset Tracker Pro portal.
          </Typography>
          <TextField
            fullWidth
            label="Client Code"
            placeholder="e.g., DEMO, TECHSOLUTIONS, JOHNINDUSTRIES"
            value={clientCode}
            onChange={(e) => setClientCode(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">Quick access:</Typography>
            {['DEMO', 'TECHSOLUTIONS', 'JOHNINDUSTRIES'].map((code) => (
              <Chip
                key={code}
                label={code}
                size="small"
                onClick={() => setClientCode(code)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClientLoginDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleClientAccess}
            disabled={!clientCode.trim()}
            endIcon={<ArrowForward />}
          >
            Access Portal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Demo Dialog */}
      <Dialog open={demoDialog} onClose={() => setDemoDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Request a Demo</Typography>
            <IconButton onClick={() => setDemoDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            See Asset Tracker Pro in action with a personalized demo for your business.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Company Name" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Your Name" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" type="email" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tell us about your asset management needs"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDemoDialog(false)}>Cancel</Button>
          <Button variant="contained">Schedule Demo</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}