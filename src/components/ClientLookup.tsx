'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Divider,
  TextField,
  InputAdornment,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Business as BusinessIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { Client } from '../types';
import { formatTimestamp } from '../lib/utils';

interface ClientLookupProps {
  open: boolean;
  onClose: () => void;
  onClientSelected: (client: Client) => void;
  title?: string;
  subtitle?: string;
  required?: boolean;
}

// Mock data for clients
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
  },
  {
    id: 'client-2',
    name: 'Global Manufacturing Inc',
    email: 'contact@globalmfg.com',
    phone: '+1-555-0456',
    address: '456 Industrial Blvd, Manufacturing City, MC 67890',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isActive: true
  },
  {
    id: 'client-3',
    name: 'Healthcare Partners',
    email: 'info@healthcarepartners.com',
    phone: '+1-555-0789',
    address: '789 Medical Center Dr, Health City, HC 13579',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isActive: true
  }
];

export default function ClientLookup({
  open,
  onClose,
  onClientSelected,
  title = 'Select Client',
  subtitle = 'Choose the client for this operation',
  required = true
}: ClientLookupProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>(mockClients);

  useEffect(() => {
    const filtered = mockClients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [searchTerm]);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
  };

  const handleConfirm = () => {
    if (selectedClient) {
      onClientSelected(selectedClient);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedClient(null);
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon color="primary" />
          <Box>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search clients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {/* Client Selection */}
        <List>
          {filteredClients.map((client, index) => (
            <React.Fragment key={client.id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleClientSelect(client)}
                  selected={selectedClient?.id === client.id}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    border: selectedClient?.id === client.id ? 2 : 1,
                    borderColor: selectedClient?.id === client.id ? 'primary.main' : 'divider'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <BusinessIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {client.name}
                        </Typography>
                        {client.isActive && (
                          <Chip label="Active" size="small" color="success" variant="outlined" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          <EmailIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                          {client.email}
                        </Typography>
                        {client.phone && (
                          <Typography variant="body2" color="text.secondary">
                            <PhoneIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                            {client.phone}
                          </Typography>
                        )}
                        {client.address && (
                          <Typography variant="body2" color="text.secondary">
                            <LocationIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                            {client.address}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                  {selectedClient?.id === client.id && (
                    <CheckIcon color="primary" sx={{ ml: 1 }} />
                  )}
                </ListItemButton>
              </ListItem>
              {index < filteredClients.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {filteredClients.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No clients found matching your search criteria.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained"
          disabled={!selectedClient}
        >
          Select Client
        </Button>
      </DialogActions>
    </Dialog>
  );
}