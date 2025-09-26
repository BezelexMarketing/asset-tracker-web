'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Alert,
  Paper,
  Stack,
  Divider,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Fade,
  Collapse
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Person,
  Assignment,
  PersonAdd,
  SwapHoriz,
  PersonRemove,
  Save,
  History,
  Refresh,
  Error as ErrorIcon
} from '@mui/icons-material';

export interface AssignmentAction {
  type: 'assign' | 'unassign' | 'transfer';
  operatorId?: string;
  fromOperatorId?: string;
  toOperatorId?: string;
  notes: string;
  scheduledDate?: Date;
  items: string[];
}

export interface Item {
  id: string;
  name: string;
  serialNumber: string;
  category: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
}

export interface Operator {
  id: string;
  name: string;
  email: string;
  department: string;
  location: string;
}

export interface AutoSaveConfirmationProps {
  action: AssignmentAction;
  selectedItems: Item[];
  operators: Operator[];
  onConfirm: () => void;
  onEdit: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

const AutoSaveConfirmation: React.FC<AutoSaveConfirmationProps> = ({
  action,
  selectedItems,
  operators,
  onConfirm,
  onEdit,
  onCancel,
  disabled = false
}) => {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaveProgress, setAutoSaveProgress] = useState(0);
  const [autoSaveComplete, setAutoSaveComplete] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Auto-save simulation
  useEffect(() => {
    setIsAutoSaving(true);
    setAutoSaveProgress(0);

    const interval = setInterval(() => {
      setAutoSaveProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAutoSaving(false);
          setAutoSaveComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [action]);

  const getOperatorById = (id: string): Operator | undefined => {
    return operators.find(op => op.id === id);
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'assign': return <PersonAdd color="success" />;
      case 'unassign': return <PersonRemove color="warning" />;
      case 'transfer': return <SwapHoriz color="info" />;
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

  const getActionTitle = (type: string) => {
    switch (type) {
      case 'assign': return 'Assignment';
      case 'unassign': return 'Unassignment';
      case 'transfer': return 'Transfer';
      default: return 'Action';
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {autoSaveComplete ? <CheckCircle color="success" /> : <Save />}
          {autoSaveComplete ? 'Action Ready' : 'Preparing Action'}
        </Typography>

        {/* Auto-save Progress */}
        {isAutoSaving && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Auto-saving action details...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={autoSaveProgress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {/* Success Message */}
        <Fade in={autoSaveComplete}>
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            icon={<CheckCircle />}
          >
            Action has been prepared and is ready to execute. Review the details below and confirm to proceed.
          </Alert>
        </Fade>

        {/* Action Summary */}
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {getActionIcon(action.type)}
            <Typography variant="h6" color={`${getActionColor(action.type)}.main`}>
              {getActionTitle(action.type)} Summary
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {/* Action Type */}
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">Action Type</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {getActionTitle(action.type)}
              </Typography>
            </Grid>

            {/* Items Count */}
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">Items Affected</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
              </Typography>
            </Grid>

            {/* Operator Information */}
            {action.type === 'assign' && action.operatorId && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Assign To</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'success.main' }}>
                    {getOperatorById(action.operatorId)?.name.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {getOperatorById(action.operatorId)?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({getOperatorById(action.operatorId)?.department})
                  </Typography>
                </Box>
              </Grid>
            )}

            {action.type === 'transfer' && action.fromOperatorId && action.toOperatorId && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">From Operator</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'warning.main' }}>
                      {getOperatorById(action.fromOperatorId)?.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">
                      {getOperatorById(action.fromOperatorId)?.name}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">To Operator</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'success.main' }}>
                      {getOperatorById(action.toOperatorId)?.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">
                      {getOperatorById(action.toOperatorId)?.name}
                    </Typography>
                  </Box>
                </Grid>
              </>
            )}

            {/* Scheduled Date */}
            {action.scheduledDate && (
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Scheduled Date</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Schedule fontSize="small" color="primary" />
                  <Typography variant="body2">
                    {formatDateTime(action.scheduledDate)}
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Notes */}
            {action.notes && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Notes</Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                  "{action.notes}"
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Items Details Toggle */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowDetails(!showDetails)}
            startIcon={<History />}
          >
            {showDetails ? 'Hide' : 'Show'} Item Details
          </Button>
        </Box>

        {/* Items List */}
        <Collapse in={showDetails}>
          <Paper variant="outlined" sx={{ p: 2, mb: 3, maxHeight: 300, overflow: 'auto' }}>
            <Typography variant="subtitle2" gutterBottom>
              Items to be {action.type === 'assign' ? 'assigned' : action.type === 'unassign' ? 'unassigned' : 'transferred'}:
            </Typography>
            <Stack spacing={1}>
              {selectedItems.map((item, index) => (
                <Box key={item.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 30, color: 'text.secondary' }}>
                      {index + 1}.
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        S/N: {item.serialNumber} • Category: {item.category}
                      </Typography>
                    </Box>
                    <Chip 
                      label={item.status} 
                      size="small" 
                      color={item.status === 'available' ? 'success' : item.status === 'assigned' ? 'primary' : 'warning'}
                      variant="outlined"
                    />
                  </Box>
                  {index < selectedItems.length - 1 && <Divider />}
                </Box>
              ))}
            </Stack>
          </Paper>
        </Collapse>

        {/* Action Buttons */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              fullWidth
              onClick={onCancel}
              disabled={disabled || isAutoSaving}
            >
              Cancel
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              fullWidth
              onClick={onEdit}
              disabled={disabled || isAutoSaving}
              startIcon={<Refresh />}
            >
              Edit Action
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              color={getActionColor(action.type) as any}
              fullWidth
              onClick={onConfirm}
              disabled={disabled || isAutoSaving || !autoSaveComplete}
              startIcon={autoSaveComplete ? <CheckCircle /> : <Save />}
            >
              {isAutoSaving ? 'Preparing...' : 'Confirm & Execute'}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AutoSaveConfirmation;