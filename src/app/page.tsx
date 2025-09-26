'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Box, CircularProgress, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { Business, Inventory, Assignment, People, Assessment, Build, Devices } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Show loading while authentication is being processed
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Business style={{ color: 'var(--primary)', fontSize: '3rem', marginBottom: '1rem' }} />
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary" style={{ marginTop: '1rem' }}>
          Loading Asset Tracker Pro...
        </Typography>
      </div>
    );
  }

  // If not authenticated, show loading (AuthContext will handle auto-login)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Business style={{ color: 'var(--primary)', fontSize: '3rem', marginBottom: '1rem' }} />
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary" style={{ marginTop: '1rem' }}>
          Signing you in...
        </Typography>
      </div>
    );
  }

  const dashboardItems = [
    {
      title: 'Client Lookup',
      description: 'Search and select clients',
      icon: <People sx={{ fontSize: 40 }} />,
      path: '/lookup',
      color: '#1976d2'
    },
    {
      title: 'Inventory',
      description: 'Manage inventory items',
      icon: <Inventory sx={{ fontSize: 40 }} />,
      path: '/inventory',
      color: '#2e7d32'
    },
    {
      title: 'Assignments',
      description: 'Track and manage assignments',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      path: '/assignments',
      color: '#ed6c02'
    },
    {
      title: 'Clients',
      description: 'Manage client information',
      icon: <Business sx={{ fontSize: 40 }} />,
      path: '/clients',
      color: '#9c27b0'
    },
    {
      title: 'Reports',
      description: 'Generate reports and analytics',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      path: '/reports',
      color: '#d32f2f'
    },
    {
      title: 'Maintenance',
      description: 'System maintenance tools',
      icon: <Build sx={{ fontSize: 40 }} />,
      path: '/maintenance',
      color: '#f57c00'
    },
    {
      title: 'Devices',
      description: 'Device management',
      icon: <Devices sx={{ fontSize: 40 }} />,
      path: '/devices',
      color: '#0288d1'
    }
  ];

  return (
    <ProtectedRoute>
      <Navigation />
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Business sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom>
            Asset Tracker Pro
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Comprehensive asset management and tracking system
          </Typography>
        </Box>

        {/* Dashboard Grid */}
        <Grid container spacing={3}>
          {dashboardItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.path}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => router.push(item.path)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ color: item.color, mb: 2 }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Stats */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Quick Overview
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h4" color="primary.main">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Items
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h4" color="success.main">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Assignments
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h4" color="warning.main">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Clients
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
