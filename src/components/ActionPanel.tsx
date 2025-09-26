'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Grid,
  Alert,
  Autocomplete,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  Stack
} from '@mui/material';
import {
  Assignment,
  PersonAdd,
  SwapHoriz,
  PersonRemove,
  Schedule,
  LocationOn,
  Person,
  Notes
} from '@mui/icons-material';

export interface Operator {
  id: string;
  name: string;
  email: string;
  department: string;
  location: string;
  avatar?: string;
  isActive: boolean;
}

export interface Item {
  id: string;
  name: string;
  serialNumber: string;
  category: string;
  currentOperator?: Operator;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
}

export interface ActionPanelProps {
  selectedItems: Item[];
  onActionExecute: (action: AssignmentAction) => void;
  disabled?: boolean;
}

export interface AssignmentAction {
  type: 'assign' | 'unassign' | 'transfer';
  operatorId?: string;
  fromOperatorId?: string;
  toOperatorId?: string;
  notes: string;
  scheduledDate?: Date;
  items: string[];
}

// Mock operators data
const mockOperators: Operator[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    department: 'IT',
    location: 'Building A - Floor 2',
    isActive: true
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    department: 'HR',
    location: 'Building B - Floor 1',
    isActive: true
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@company.com',
    department: 'Finance',
    location: 'Building A - Floor 3',
    isActive: true
  },
  {
    id: '4',
    name: 'Emily Wilson',
    email: 'emily.wilson@company.com',
    department: 'Operations',
    location: 'Building C - Floor 1',
    isActive: true
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david.brown@company.com',
    department: 'IT',
    location: 'Building A - Floor 2',
    isActive: true
  }
];

const ActionPanel: React.FC<ActionPanelProps> = ({
  selectedItems,
  onActionExecute,
  disabled = false
}) => {
  const [actionType, setActionType] = useState<'assign' | 'unassign' | 'transfer'>('assign');
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [fromOperator, setFromOperator] = useState<Operator | null>(null);
  const [toOperator, setToOperator] = useState<Operator | null>(null);
  const [notes, setNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [operators] = useState<Operator[]>(mockOperators);
  const [errors, setErrors] = useState<string[]>([]);

  // Reset form when action type changes
  useEffect(() => {
    setSelectedOperator(null);
    setFromOperator(null);
    setToOperator(null);
    setNotes('');
    setScheduledDate('');
    setErrors([]);
  }, [actionType]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (selectedItems.length === 0) {
      newErrors.push('Please select at least one item');
    }

    if (actionType === 'assign' && !selectedOperator) {
      newErrors.push('Please select an operator to assign items to');
    }

    if (actionType === 'transfer') {
      if (!fromOperator) {
        newErrors.push('Please select the current operator (from)');
      }
      if (!toOperator) {
        newErrors.push('Please select the new operator (to)');
      }
      if (fromOperator && toOperator && fromOperator.id === toOperator.id) {
        newErrors.push('From and To operators must be different');
      }
    }

    // Check if items are in correct state for the action
    if (actionType === 'assign') {
      const assignedItems = selectedItems.filter(item => item.status === 'assigned');
      if (assignedItems.length > 0) {
        newErrors.push(`${assignedItems.length} item(s) are already assigned`);
      }
    }

    if (actionType === 'unassign') {
      const unassignedItems = selectedItems.filter(item => item.status !== 'assigned');
      if (unassignedItems.length > 0) {
        newErrors.push(`${unassignedItems.length} item(s) are not currently assigned`);
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleExecuteAction = () => {
    if (!validateForm()) return;

    const action: AssignmentAction = {
      type: actionType,
      notes,
      items: selectedItems.map(item => item.id),
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined
    };

    if (actionType === 'assign' && selectedOperator) {
      action.operatorId = selectedOperator.id;
    } else if (actionType === 'transfer' && fromOperator && toOperator) {
      action.fromOperatorId = fromOperator.id;
      action.toOperatorId = toOperator.id;
    }

    onActionExecute(action);
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'assign': return <PersonAdd />;
      case 'unassign': return <PersonRemove />;
      case 'transfer': return <SwapHoriz />;
      default: return <Assignment />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'assign': return 'success';
      case 'unassign': return 'warning';
      case 'transfer': return 'info';
      default: return 'primary';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assignment />
          Assignment Actions
        </Typography>

        {/* Selected Items Summary */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Items ({selectedItems.length})
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {selectedItems.slice(0, 5).map((item) => (
              <Chip
                key={item.id}
                label={`${item.name} (${item.serialNumber})`}
                size="small"
                variant="outlined"
              />
            ))}
            {selectedItems.length > 5 && (
              <Chip
                label={`+${selectedItems.length - 5} more`}
                size="small"
                variant="outlined"
                color="primary"
              />
            )}
          </Stack>
        </Paper>

        <Grid container spacing={3}>
          {/* Action Type Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Action Type</InputLabel>
              <Select
                value={actionType}
                label="Action Type"
                onChange={(e) => setActionType(e.target.value as any)}
                disabled={disabled}
              >
                <MenuItem value="assign">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonAdd color="success" />
                    Assign Items
                  </Box>
                </MenuItem>
                <MenuItem value="unassign">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonRemove color="warning" />
                    Unassign Items
                  </Box>
                </MenuItem>
                <MenuItem value="transfer">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SwapHoriz color="info" />
                    Transfer Items
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Operator Selection for Assign */}
          {actionType === 'assign' && (
            <Grid item xs={12}>
              <Autocomplete
                options={operators.filter(op => op.isActive)}
                getOptionLabel={(option) => `${option.name} (${option.department})`}
                value={selectedOperator}
                onChange={(_, newValue) => setSelectedOperator(newValue)}
                disabled={disabled}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assign To Operator"
                    placeholder="Search operators..."
                  />
                )}
                renderOption={(props, option) => (
                  <ListItem {...props}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {option.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={option.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {option.department} • {option.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOn fontSize="inherit" />
                            {option.location}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                )}
              />
            </Grid>
          )}

          {/* Operator Selection for Transfer */}
          {actionType === 'transfer' && (
            <>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={operators.filter(op => op.isActive)}
                  getOptionLabel={(option) => `${option.name} (${option.department})`}
                  value={fromOperator}
                  onChange={(_, newValue) => setFromOperator(newValue)}
                  disabled={disabled}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="From Operator"
                      placeholder="Current operator..."
                    />
                  )}
                  renderOption={(props, option) => (
                    <ListItem {...props}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          {option.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={option.name}
                        secondary={`${option.department} • ${option.email}`}
                      />
                    </ListItem>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={operators.filter(op => op.isActive && op.id !== fromOperator?.id)}
                  getOptionLabel={(option) => `${option.name} (${option.department})`}
                  value={toOperator}
                  onChange={(_, newValue) => setToOperator(newValue)}
                  disabled={disabled}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="To Operator"
                      placeholder="New operator..."
                    />
                  )}
                  renderOption={(props, option) => (
                    <ListItem {...props}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          {option.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={option.name}
                        secondary={`${option.department} • ${option.email}`}
                      />
                    </ListItem>
                  )}
                />
              </Grid>
            </>
          )}

          {/* Scheduled Date */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Scheduled Date (Optional)"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              disabled={disabled}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={disabled}
              placeholder="Add any additional notes about this assignment action..."
              InputProps={{
                startAdornment: <Notes sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
              }}
            />
          </Grid>

          {/* Error Messages */}
          {errors.length > 0 && (
            <Grid item xs={12}>
              {errors.map((error, index) => (
                <Alert key={index} severity="error" sx={{ mb: 1 }}>
                  {error}
                </Alert>
              ))}
            </Grid>
          )}

          {/* Action Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color={getActionColor(actionType) as any}
              size="large"
              fullWidth
              onClick={handleExecuteAction}
              disabled={disabled || selectedItems.length === 0}
              startIcon={getActionIcon(actionType)}
              sx={{ py: 1.5 }}
            >
              {actionType === 'assign' && 'Assign Items'}
              {actionType === 'unassign' && 'Unassign Items'}
              {actionType === 'transfer' && 'Transfer Items'}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ActionPanel;