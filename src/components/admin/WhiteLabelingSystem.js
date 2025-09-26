import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  ColorPicker
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Upload as UploadIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

// Mock data for tenants
const mockTenants = [
  {
    id: '1',
    name: 'Acme Corporation',
    domain: 'acme.assettracker.com',
    status: 'active',
    branding: {
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      logo: null,
      companyName: 'Acme Corporation',
      favicon: null,
      customCSS: '',
      theme: 'light'
    }
  },
  {
    id: '2',
    name: 'TechStart Inc',
    domain: 'techstart.assettracker.com',
    status: 'active',
    branding: {
      primaryColor: '#4caf50',
      secondaryColor: '#ff9800',
      logo: null,
      companyName: 'TechStart Inc',
      favicon: null,
      customCSS: '',
      theme: 'dark'
    }
  }
];

const defaultBranding = {
  primaryColor: '#1976d2',
  secondaryColor: '#dc004e',
  accentColor: '#00bcd4',
  backgroundColor: '#ffffff',
  surfaceColor: '#f5f5f5',
  textColor: '#000000',
  logo: null,
  favicon: null,
  companyName: 'Asset Tracker Pro',
  customCSS: '',
  theme: 'light',
  fontFamily: 'Roboto',
  borderRadius: 4,
  enableCustomization: true
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`white-label-tabpanel-${index}`}
      aria-labelledby={`white-label-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function WhiteLabelingSystem({ onShowSnackbar }) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTenant, setSelectedTenant] = useState(mockTenants[0]);
  const [branding, setBranding] = useState(defaultBranding);
  const [previewMode, setPreviewMode] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  useEffect(() => {
    if (selectedTenant) {
      setBranding({ ...defaultBranding, ...selectedTenant.branding });
    }
  }, [selectedTenant]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTenantChange = (tenant) => {
    setSelectedTenant(tenant);
  };

  const handleBrandingChange = (field, value) => {
    setBranding(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (field, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleBrandingChange(field, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update tenant branding
      const updatedTenant = {
        ...selectedTenant,
        branding: branding
      };
      
      onShowSnackbar('Branding configuration saved successfully', 'success');
      setSaveDialogOpen(false);
    } catch (error) {
      onShowSnackbar('Failed to save branding configuration', 'error');
    }
  };

  const handleReset = () => {
    setBranding(defaultBranding);
    setResetDialogOpen(false);
    onShowSnackbar('Branding configuration reset to defaults', 'info');
  };

  const handleExport = () => {
    const exportData = {
      tenant: selectedTenant.name,
      branding: branding,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTenant.name.toLowerCase().replace(/\s+/g, '-')}-branding.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExportDialogOpen(false);
    onShowSnackbar('Branding configuration exported successfully', 'success');
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          if (importData.branding) {
            setBranding({ ...defaultBranding, ...importData.branding });
            onShowSnackbar('Branding configuration imported successfully', 'success');
          } else {
            onShowSnackbar('Invalid branding configuration file', 'error');
          }
        } catch (error) {
          onShowSnackbar('Failed to import branding configuration', 'error');
        }
      };
      reader.readAsText(file);
    }
    setImportDialogOpen(false);
  };

  const generatePreviewCSS = () => {
    return `
      :root {
        --primary-color: ${branding.primaryColor};
        --secondary-color: ${branding.secondaryColor};
        --accent-color: ${branding.accentColor};
        --background-color: ${branding.backgroundColor};
        --surface-color: ${branding.surfaceColor};
        --text-color: ${branding.textColor};
        --font-family: ${branding.fontFamily};
        --border-radius: ${branding.borderRadius}px;
      }
      
      .preview-container {
        font-family: var(--font-family);
        background-color: var(--background-color);
        color: var(--text-color);
        border-radius: var(--border-radius);
      }
      
      .preview-header {
        background-color: var(--primary-color);
        color: white;
        padding: 16px;
        border-radius: var(--border-radius) var(--border-radius) 0 0;
      }
      
      .preview-button {
        background-color: var(--secondary-color);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: var(--border-radius);
        cursor: pointer;
      }
      
      .preview-card {
        background-color: var(--surface-color);
        padding: 16px;
        margin: 16px 0;
        border-radius: var(--border-radius);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
    `;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          White-Labeling System
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Exit Preview' : 'Preview'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => setExportDialogOpen(true)}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => setImportDialogOpen(true)}
          >
            Import
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => setSaveDialogOpen(true)}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Tenant Selection */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Tenant
              </Typography>
              <List>
                {mockTenants.map((tenant) => (
                  <ListItem
                    key={tenant.id}
                    button
                    selected={selectedTenant?.id === tenant.id}
                    onClick={() => handleTenantChange(tenant)}
                  >
                    <ListItemText
                      primary={tenant.name}
                      secondary={tenant.domain}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={tenant.status}
                        color={tenant.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Configuration Panel */}
        <Grid item xs={12} md={previewMode ? 6 : 9}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Colors & Theme" />
                <Tab label="Branding Assets" />
                <Tab label="Typography" />
                <Tab label="Custom CSS" />
                <Tab label="Advanced" />
              </Tabs>
            </Box>

            {/* Colors & Theme Tab */}
            <TabPanel value={activeTab} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Primary Color"
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: branding.primaryColor,
                            borderRadius: 1,
                            mr: 1,
                            border: '1px solid #ccc'
                          }}
                        />
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Secondary Color"
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: branding.secondaryColor,
                            borderRadius: 1,
                            mr: 1,
                            border: '1px solid #ccc'
                          }}
                        />
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Accent Color"
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) => handleBrandingChange('accentColor', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: branding.accentColor,
                            borderRadius: 1,
                            mr: 1,
                            border: '1px solid #ccc'
                          }}
                        />
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Background Color"
                    type="color"
                    value={branding.backgroundColor}
                    onChange={(e) => handleBrandingChange('backgroundColor', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: branding.backgroundColor,
                            borderRadius: 1,
                            mr: 1,
                            border: '1px solid #ccc'
                          }}
                        />
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={branding.theme}
                      onChange={(e) => handleBrandingChange('theme', e.target.value)}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="auto">Auto (System)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Branding Assets Tab */}
            <TabPanel value={activeTab} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={branding.companyName}
                    onChange={(e) => handleBrandingChange('companyName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Logo
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {branding.logo && (
                        <Avatar
                          src={branding.logo}
                          sx={{ width: 64, height: 64 }}
                          variant="rounded"
                        />
                      )}
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                      >
                        Upload Logo
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleFileUpload('logo', e)}
                        />
                      </Button>
                      {branding.logo && (
                        <IconButton
                          onClick={() => handleBrandingChange('logo', null)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Favicon
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {branding.favicon && (
                        <Avatar
                          src={branding.favicon}
                          sx={{ width: 32, height: 32 }}
                          variant="rounded"
                        />
                      )}
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                      >
                        Upload Favicon
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleFileUpload('favicon', e)}
                        />
                      </Button>
                      {branding.favicon && (
                        <IconButton
                          onClick={() => handleBrandingChange('favicon', null)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Typography Tab */}
            <TabPanel value={activeTab} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Font Family</InputLabel>
                    <Select
                      value={branding.fontFamily}
                      onChange={(e) => handleBrandingChange('fontFamily', e.target.value)}
                    >
                      <MenuItem value="Roboto">Roboto</MenuItem>
                      <MenuItem value="Arial">Arial</MenuItem>
                      <MenuItem value="Helvetica">Helvetica</MenuItem>
                      <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                      <MenuItem value="Georgia">Georgia</MenuItem>
                      <MenuItem value="Verdana">Verdana</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography gutterBottom>
                      Border Radius: {branding.borderRadius}px
                    </Typography>
                    <Slider
                      value={branding.borderRadius}
                      onChange={(e, value) => handleBrandingChange('borderRadius', value)}
                      min={0}
                      max={20}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Custom CSS Tab */}
            <TabPanel value={activeTab} index={3}>
              <TextField
                fullWidth
                multiline
                rows={12}
                label="Custom CSS"
                value={branding.customCSS}
                onChange={(e) => handleBrandingChange('customCSS', e.target.value)}
                placeholder="/* Add your custom CSS here */"
                sx={{ fontFamily: 'monospace' }}
              />
            </TabPanel>

            {/* Advanced Tab */}
            <TabPanel value={activeTab} index={4}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={branding.enableCustomization}
                        onChange={(e) => handleBrandingChange('enableCustomization', e.target.checked)}
                      />
                    }
                    label="Enable Client Customization"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<RestoreIcon />}
                      onClick={() => setResetDialogOpen(true)}
                    >
                      Reset to Defaults
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>
          </Card>
        </Grid>

        {/* Preview Panel */}
        {previewMode && (
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Live Preview
                </Typography>
                <style>{generatePreviewCSS()}</style>
                <Box className="preview-container" sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
                  <Box className="preview-header">
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {branding.companyName}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Box className="preview-card">
                      <Typography variant="body1" gutterBottom>
                        Sample Content
                      </Typography>
                      <button className="preview-button">
                        Sample Button
                      </button>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Branding Configuration</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to save the branding configuration for {selectedTenant?.name}?
            This will update the appearance for all users of this tenant.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Reset Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset to Defaults</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all branding settings to their default values?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReset} color="warning" variant="contained">Reset</Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Branding Configuration</DialogTitle>
        <DialogContent>
          <Typography>
            Export the current branding configuration for {selectedTenant?.name} as a JSON file.
            This can be used to backup or transfer settings to another tenant.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained">Export</Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
        <DialogTitle>Import Branding Configuration</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Import a branding configuration from a JSON file. This will replace the current settings.
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            fullWidth
            sx={{ mt: 2 }}
          >
            Choose File
            <input
              type="file"
              hidden
              accept=".json"
              onChange={handleImport}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}