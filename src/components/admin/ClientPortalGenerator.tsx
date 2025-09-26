'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Paper
} from '@mui/material';
import {
  Launch as LaunchIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  Public as PublicIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  CloudUpload as DeployIcon
} from '@mui/icons-material';

interface ClientPortalConfig {
  id: string;
  clientName: string;
  domain: string;
  subdomain: string;
  customDomain?: string;
  sslEnabled: boolean;
  features: {
    inventory: boolean;
    assignments: boolean;
    maintenance: boolean;
    reports: boolean;
    userManagement: boolean;
    apiAccess: boolean;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    companyName: string;
    theme: 'light' | 'dark' | 'auto';
  };
  deployment: {
    status: 'draft' | 'deploying' | 'active' | 'maintenance';
    url?: string;
    lastDeployed?: string;
    version: string;
  };
}

const steps = [
  'Basic Configuration',
  'Feature Selection',
  'Branding Setup',
  'Domain Configuration',
  'Review & Deploy'
];

interface ClientPortalGeneratorProps {
  client: any;
  onClose: () => void;
  onSave: (config: ClientPortalConfig) => void;
}

export default function ClientPortalGenerator({ client, onClose, onSave }: ClientPortalGeneratorProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [config, setConfig] = useState<ClientPortalConfig>({
    id: client.id,
    clientName: client.name,
    domain: `${client.name.toLowerCase().replace(/\s+/g, '-')}.assettracker.com`,
    subdomain: client.name.toLowerCase().replace(/\s+/g, '-'),
    sslEnabled: true,
    features: {
      inventory: true,
      assignments: true,
      maintenance: false,
      reports: true,
      userManagement: false,
      apiAccess: false
    },
    branding: {
      primaryColor: client.branding?.primaryColor || '#1976d2',
      secondaryColor: client.branding?.secondaryColor || '#dc004e',
      companyName: client.name,
      theme: client.branding?.theme || 'light'
    },
    deployment: {
      status: 'draft',
      version: '1.0.0'
    }
  });

  const [deploymentDialog, setDeploymentDialog] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFeatureToggle = (feature: keyof typeof config.features) => {
    setConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
  };

  const handleDeploy = async () => {
    setDeploymentDialog(true);
    setDeploymentProgress(0);

    // Simulate deployment process
    const steps = [
      'Generating configuration files...',
      'Setting up database...',
      'Configuring domain...',
      'Applying branding...',
      'Deploying application...',
      'Running health checks...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDeploymentProgress(((i + 1) / steps.length) * 100);
    }

    const deployedConfig = {
      ...config,
      deployment: {
        ...config.deployment,
        status: 'active' as const,
        url: `https://${config.domain}`,
        lastDeployed: new Date().toISOString()
      }
    };

    setConfig(deployedConfig);
    onSave(deployedConfig);
    
    setTimeout(() => {
      setDeploymentDialog(false);
      onClose();
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateConfigFile = () => {
    const configFile = {
      client: {
        id: config.id,
        name: config.clientName,
        domain: config.domain
      },
      features: config.features,
      branding: config.branding,
      deployment: config.deployment
    };

    const blob = new Blob([JSON.stringify(configFile, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.subdomain}-portal-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Basic Configuration</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Client Name"
                  value={config.clientName}
                  onChange={(e) => setConfig(prev => ({ ...prev, clientName: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Subdomain"
                  value={config.subdomain}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    subdomain: e.target.value,
                    domain: `${e.target.value}.assettracker.com`
                  }))}
                  helperText="Will create: subdomain.assettracker.com"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Generated Domain"
                  value={config.domain}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Custom Domain (Optional)"
                  value={config.customDomain || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, customDomain: e.target.value }))}
                  placeholder="portal.clientcompany.com"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Feature Selection</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose which features will be available in the client portal
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(config.features).map(([feature, enabled]) => (
                <Grid item xs={12} sm={6} key={feature}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={enabled}
                        onChange={() => handleFeatureToggle(feature as keyof typeof config.features)}
                      />
                    }
                    label={feature.charAt(0).toUpperCase() + feature.slice(1).replace(/([A-Z])/g, ' $1')}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Branding Setup</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={config.branding.companyName}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    branding: { ...prev.branding, companyName: e.target.value }
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Primary Color"
                  type="color"
                  value={config.branding.primaryColor}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    branding: { ...prev.branding, primaryColor: e.target.value }
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Secondary Color"
                  type="color"
                  value={config.branding.secondaryColor}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    branding: { ...prev.branding, secondaryColor: e.target.value }
                  }))}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={config.branding.theme}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      branding: { ...prev.branding, theme: e.target.value as any }
                    }))}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Domain Configuration</Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              SSL certificates will be automatically generated for all domains
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>Primary Domain</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1">{config.domain}</Typography>
                    <Tooltip title="Copy domain">
                      <IconButton size="small" onClick={() => copyToClipboard(config.domain)}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Grid>
              {config.customDomain && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>Custom Domain</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">{config.customDomain}</Typography>
                      <Tooltip title="Copy domain">
                        <IconButton size="small" onClick={() => copyToClipboard(config.customDomain!)}>
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      You'll need to configure DNS records for custom domains
                    </Alert>
                  </Paper>
                </Grid>
              )}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.sslEnabled}
                      onChange={(e) => setConfig(prev => ({ ...prev, sslEnabled: e.target.checked }))}
                    />
                  }
                  label="Enable SSL/HTTPS (Recommended)"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Review & Deploy</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Configuration Summary</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><PublicIcon /></ListItemIcon>
                        <ListItemText primary="Domain" secondary={config.domain} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><SecurityIcon /></ListItemIcon>
                        <ListItemText primary="SSL" secondary={config.sslEnabled ? 'Enabled' : 'Disabled'} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><StorageIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Features" 
                          secondary={`${Object.values(config.features).filter(Boolean).length} enabled`} 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Enabled Features</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {Object.entries(config.features)
                        .filter(([, enabled]) => enabled)
                        .map(([feature]) => (
                          <Chip
                            key={feature}
                            label={feature.charAt(0).toUpperCase() + feature.slice(1).replace(/([A-Z])/g, ' $1')}
                            size="small"
                            color="primary"
                          />
                        ))}
                    </Box>
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
    <Dialog open={true} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Generate Client Portal - {client.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  {getStepContent(index)}
                  <Box sx={{ mb: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={index === steps.length - 1 ? handleDeploy : handleNext}
                      sx={{ mr: 1 }}
                    >
                      {index === steps.length - 1 ? 'Deploy Portal' : 'Continue'}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={generateConfigFile} startIcon={<DownloadIcon />}>
          Export Config
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>

      {/* Deployment Progress Dialog */}
      <Dialog open={deploymentDialog} disableEscapeKeyDown>
        <DialogTitle>Deploying Client Portal</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <DeployIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Setting up {config.clientName} Portal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This may take a few minutes...
            </Typography>
            <Box sx={{ width: '100%', mb: 2 }}>
              <Box sx={{ 
                width: `${deploymentProgress}%`, 
                height: 8, 
                bgcolor: 'primary.main', 
                borderRadius: 4,
                transition: 'width 0.5s ease-in-out'
              }} />
            </Box>
            <Typography variant="body2">
              {Math.round(deploymentProgress)}% Complete
            </Typography>
            {deploymentProgress === 100 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon />
                  Portal deployed successfully!
                </Box>
              </Alert>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}