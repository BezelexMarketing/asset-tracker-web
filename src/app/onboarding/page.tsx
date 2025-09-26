'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Chip,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Business,
  Person,
  Palette,
  Settings,
  CheckCircle,
  Launch,
  ContentCopy,
  Email,
  Phone,
  Domain,
  Security,
  Payment,
} from '@mui/icons-material';
import PaymentProcessor from '@/components/PaymentProcessor';
import { useRouter } from 'next/navigation';

const steps = [
  'Company Information',
  'Subscription Plan',
  'Branding & Customization',
  'Initial Setup',
  'Review & Deploy'
];

const subscriptionPlans = [
  {
    name: 'Starter',
    price: '$99/month',
    features: ['Up to 500 assets', 'Basic reporting', 'Email support', 'Web access'],
    recommended: false
  },
  {
    name: 'Professional',
    price: '$199/month',
    features: ['Up to 2000 assets', 'Advanced reporting', 'Priority support', 'Mobile app', 'Custom branding'],
    recommended: true
  },
  {
    name: 'Enterprise',
    price: '$399/month',
    features: ['Unlimited assets', 'Custom features', '24/7 support', 'API access', 'White-label solution'],
    recommended: false
  }
];

const availableFeatures = [
  { id: 'inventory', name: 'Inventory Management', description: 'Track and manage all assets' },
  { id: 'assignments', name: 'Assignment Tracking', description: 'Assign assets to users and track returns' },
  { id: 'maintenance', name: 'Maintenance Scheduling', description: 'Schedule and track maintenance activities' },
  { id: 'reports', name: 'Advanced Reporting', description: 'Generate detailed reports and analytics' },
  { id: 'devices', name: 'Device Management', description: 'Manage connected devices and sensors' },
  { id: 'mobile', name: 'Mobile App Access', description: 'iOS and Android applications' },
  { id: 'api', name: 'API Access', description: 'Integrate with external systems' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [deploymentDialog, setDeploymentDialog] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [deploymentComplete, setDeploymentComplete] = useState(false);

  const [formData, setFormData] = useState({
    // Company Information
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    industry: '',
    companySize: '',
    
    // Subscription
    selectedPlan: 'Professional',
    billingCycle: 'monthly',
    
    // Branding
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    logo: '',
    companyDomain: '',
    customDomain: '',
    
    // Features
    selectedFeatures: ['inventory', 'assignments', 'reports', 'mobile'],
    
    // Initial Setup
    adminEmail: '',
    adminPassword: '',
    initialUsers: 5,
    estimatedAssets: 100,
  });

  const handleNext = () => {
    if (activeStep === 1 && !paymentCompleted) {
      // Show payment dialog instead of proceeding
      setShowPayment(true);
      return;
    }
    if (activeStep === steps.length - 1) {
      handleDeploy();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePaymentSuccess = (paymentResult: any) => {
    setPaymentCompleted(true);
    setShowPayment(false);
    setActiveStep(2); // Move to next step after successful payment
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment failed:', error);
    // Handle payment error (show error message, etc.)
  };

  const handleDeploy = () => {
    setDeploymentDialog(true);
    
    // Simulate deployment process
    const deploymentSteps = [
      'Creating tenant database...',
      'Setting up user authentication...',
      'Applying custom branding...',
      'Configuring features...',
      'Generating client portal...',
      'Finalizing deployment...'
    ];

    let progress = 0;
    const interval = setInterval(() => {
      progress += 100 / deploymentSteps.length;
      setDeploymentProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setDeploymentComplete(true);
        }, 1000);
      }
    }, 1500);
  };

  const generateClientCode = () => {
    return formData.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 12);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Industry</InputLabel>
                <Select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                >
                  <MenuItem value="manufacturing">Manufacturing</MenuItem>
                  <MenuItem value="construction">Construction</MenuItem>
                  <MenuItem value="healthcare">Healthcare</MenuItem>
                  <MenuItem value="education">Education</MenuItem>
                  <MenuItem value="technology">Technology</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Company Size</InputLabel>
                <Select
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                >
                  <MenuItem value="1-10">1-10 employees</MenuItem>
                  <MenuItem value="11-50">11-50 employees</MenuItem>
                  <MenuItem value="51-200">51-200 employees</MenuItem>
                  <MenuItem value="201-1000">201-1000 employees</MenuItem>
                  <MenuItem value="1000+">1000+ employees</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Your Subscription Plan
            </Typography>
            <Grid container spacing={3}>
              {subscriptionPlans.map((plan) => (
                <Grid item xs={12} md={4} key={plan.name}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: formData.selectedPlan === plan.name ? 2 : 1,
                      borderColor: formData.selectedPlan === plan.name ? 'primary.main' : 'divider',
                      position: 'relative'
                    }}
                    onClick={() => setFormData({ ...formData, selectedPlan: plan.name })}
                  >
                    {plan.recommended && (
                      <Chip
                        label="Recommended"
                        color="primary"
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        {plan.name}
                      </Typography>
                      <Typography variant="h4" color="primary" gutterBottom>
                        {plan.price}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        {plan.features.map((feature, index) => (
                          <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                            • {feature}
                          </Typography>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 3 }}>
              <FormControl>
                <InputLabel>Billing Cycle</InputLabel>
                <Select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly (Save 20%)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Brand Colors
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="body2" gutterBottom>Primary Color</Typography>
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    style={{ width: 60, height: 40, border: 'none', borderRadius: 4 }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" gutterBottom>Secondary Color</Typography>
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    style={{ width: 60, height: 40, border: 'none', borderRadius: 4 }}
                  />
                </Box>
              </Box>
              
              <TextField
                fullWidth
                label="Company Logo URL"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                helperText="Provide a URL to your company logo (optional)"
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Custom Domain"
                value={formData.customDomain}
                onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                helperText="e.g., assets.yourcompany.com (optional)"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  bgcolor: formData.primaryColor,
                  color: 'white',
                  mb: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Business sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {formData.companyName || 'Your Company'}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  Asset Management Portal
                </Typography>
              </Paper>
              
              <Alert severity="info">
                This is how your branded portal header will look
              </Alert>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select Features
              </Typography>
              <FormGroup>
                <Grid container spacing={2}>
                  {availableFeatures.map((feature) => (
                    <Grid item xs={12} md={6} key={feature.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.selectedFeatures.includes(feature.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  selectedFeatures: [...formData.selectedFeatures, feature.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  selectedFeatures: formData.selectedFeatures.filter(f => f !== feature.id)
                                });
                              }
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle2">{feature.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {feature.description}
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Initial Configuration
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Admin Email"
                type="email"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Admin Password"
                type="password"
                value={formData.adminPassword}
                onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Initial User Count"
                type="number"
                value={formData.initialUsers}
                onChange={(e) => setFormData({ ...formData, initialUsers: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estimated Asset Count"
                type="number"
                value={formData.estimatedAssets}
                onChange={(e) => setFormData({ ...formData, estimatedAssets: parseInt(e.target.value) })}
              />
            </Grid>
          </Grid>
        );

      case 4:
        const clientCode = generateClientCode();
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Configuration
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Company Information
                    </Typography>
                    <Typography><strong>Name:</strong> {formData.companyName}</Typography>
                    <Typography><strong>Contact:</strong> {formData.contactName}</Typography>
                    <Typography><strong>Email:</strong> {formData.email}</Typography>
                    <Typography><strong>Industry:</strong> {formData.industry}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Subscription
                    </Typography>
                    <Typography><strong>Plan:</strong> {formData.selectedPlan}</Typography>
                    <Typography><strong>Billing:</strong> {formData.billingCycle}</Typography>
                    <Typography><strong>Features:</strong> {formData.selectedFeatures.length} enabled</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Portal Access Information
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography><strong>Client Code:</strong></Typography>
                      <Chip label={clientCode.toUpperCase()} color="primary" />
                      <Button size="small" startIcon={<ContentCopy />}>
                        Copy
                      </Button>
                    </Box>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      Your clients will use this code to access their portal at: 
                      <strong> yourdomain.com/client/{clientCode}</strong>
                    </Typography>
                    <Alert severity="info">
                      After deployment, you'll receive detailed setup instructions and access credentials.
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Business sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom>
          Welcome to Asset Tracker Pro
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Let's set up your custom asset management solution
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          {renderStepContent(activeStep)}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={
            (activeStep === 0 && (!formData.companyName || !formData.contactName || !formData.email)) ||
            (activeStep === 3 && (!formData.adminEmail || !formData.adminPassword))
          }
        >
          {activeStep === steps.length - 1 ? 'Deploy Portal' : 'Next'}
        </Button>
      </Box>

      {/* Deployment Dialog */}
      <Dialog open={deploymentDialog} maxWidth="sm" fullWidth disableEscapeKeyDown>
        <DialogTitle>
          {deploymentComplete ? 'Deployment Complete!' : 'Deploying Your Portal'}
        </DialogTitle>
        <DialogContent>
          {!deploymentComplete ? (
            <Box>
              <Typography gutterBottom>
                Setting up your custom asset management portal...
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={deploymentProgress} 
                sx={{ mt: 2, mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                {Math.round(deploymentProgress)}% complete
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Your portal is ready!
                </Typography>
              </Box>
              
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Portal URL: <strong>yourdomain.com/client/{generateClientCode()}</strong>
                </Typography>
                <Typography variant="body2">
                  Admin credentials have been sent to {formData.email}
                </Typography>
              </Alert>
              
              <Typography variant="body2" color="text.secondary">
                You can now access your admin dashboard to manage clients and configure additional settings.
              </Typography>
            </Box>
          )}
        </DialogContent>
        {deploymentComplete && (
          <DialogActions>
            <Button onClick={() => router.push('/admin')} variant="contained">
              Go to Admin Dashboard
            </Button>
            <Button onClick={() => router.push(`/client/${generateClientCode()}`)}>
              View Client Portal
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onClose={() => setShowPayment(false)} maxWidth="md" fullWidth>
        <DialogTitle>Complete Your Subscription</DialogTitle>
        <DialogContent>
          <PaymentProcessor
            amount={subscriptionPlans.find(p => p.id === formData.selectedPlan)?.price || 0}
            currency="USD"
            description={`${subscriptionPlans.find(p => p.id === formData.selectedPlan)?.name} Plan Subscription`}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={() => setShowPayment(false)}
            clientInfo={{
              name: formData.contactName,
              email: formData.email,
              company: formData.companyName,
            }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}