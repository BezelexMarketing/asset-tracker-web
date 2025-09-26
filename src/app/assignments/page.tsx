'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  CheckCircle as CheckInIcon,
  Cancel as CheckOutIcon
} from '@mui/icons-material';
import ProtectedRoute from '@/components/ProtectedRoute';
import ItemSelector from '@/components/ItemSelector';
import ActionPanel from '@/components/ActionPanel';
import ClientLookup from '@/components/ClientLookup';
import { createActionLog, formatTimestamp } from '@/lib/utils';
import type { Client, Item } from '@/types/types';

// Mock data for assignments
const mockAssignments = [
  {
    id: '1',
    itemId: '1',
    itemName: 'MacBook Pro 16"',
    itemSerial: 'MBP001',
    operatorId: 'op1',
    operatorName: 'John Doe',
    operatorEmail: 'john.doe@company.com',
    assignedBy: 'Admin User',
    assignedAt: '2024-01-15T10:30:00Z',
    dueDate: '2024-02-15T10:30:00Z',
    status: 'active',
    location: 'Office Floor 2',
    notes: 'Assigned for development project'
  },
  {
    id: '2',
    itemId: '2',
    itemName: 'Drill Set Professional',
    itemSerial: 'DRL045',
    operatorId: 'op2',
    operatorName: 'Jane Smith',
    operatorEmail: 'jane.smith@company.com',
    assignedBy: 'Admin User',
    assignedAt: '2024-01-10T14:20:00Z',
    dueDate: '2024-01-20T14:20:00Z',
    status: 'overdue',
    location: 'Construction Site A',
    notes: 'For building renovation project'
  }
];

const steps = ['Select Client', 'Find Item', 'Assignment Action', 'Confirmation'];

export default function AssignmentsPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [clientLookupOpen, setClientLookupOpen] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [completedActions, setCompletedActions] = useState([]);
  const [assignments, setAssignments] = useState(mockAssignments);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleClientSelected = (client: Client) => {
    setSelectedClient(client);
    setClientLookupOpen(false);
    setActiveStep(1);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedClient(null);
    setSelectedItem(null);
    setClientLookupOpen(true);
  };



  const handleItemSelect = (item) => {
    setSelectedItem(item);
    handleNext();
  };

  const handleActionComplete = (actionData) => {
    // Create action log with client context
    const actionLog = createActionLog(
      selectedClient!.id,
      selectedItem!.id,
      'assignment',
      'current-user',
      `Assignment action: ${actionData.type} for ${selectedClient!.name}`,
      {
        actionType: actionData.type,
        clientName: selectedClient!.name,
        itemName: selectedItem!.name,
        operatorName: actionData.operator ? `${actionData.operator.firstName} ${actionData.operator.lastName}` : null,
        location: actionData.location,
        notes: actionData.notes,
        dueDate: actionData.dueDate,
        timestamp: formatTimestamp()
      }
    );

    const newAction = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      client: selectedClient,
      item: selectedItem,
      action: actionData,
      type: 'assignment',
      actionLog
    };
    
    setCompletedActions(prev => [newAction, ...prev]);
    
    // Update assignments list based on action
    if (actionData.type === 'assign') {
      const newAssignment = {
        id: Date.now().toString(),
        itemId: selectedItem!.id,
        itemName: selectedItem!.name,
        itemSerial: selectedItem!.serialNumber,
        operatorId: actionData.operator.id,
        operatorName: `${actionData.operator.firstName} ${actionData.operator.lastName}`,
        operatorEmail: actionData.operator.email,
        assignedBy: 'Current User',
        assignedAt: new Date().toISOString(),
        dueDate: actionData.dueDate,
        status: 'active',
        location: actionData.location,
        notes: actionData.notes,
        clientId: selectedClient!.id,
        clientName: selectedClient!.name
      };
      setAssignments(prev => [newAssignment, ...prev]);
    } else if (actionData.type === 'checkin' || actionData.type === 'checkout') {
      setAssignments(prev => prev.map(assignment => 
        assignment.itemId === selectedItem!.id 
          ? { ...assignment, status: actionData.type === 'checkin' ? 'returned' : 'checked_out' }
          : assignment
      ));
    }
    
    handleNext();
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Selected Context
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={`Client: ${selectedClient?.name}`} 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                All assignment actions will be associated with this client.
              </Typography>
            </CardContent>
          </Card>
        );
      case 1:
        return (
          <ItemSelector
            selectedItem={selectedItem}
            onItemChange={(item) => {
              setSelectedItem(item);
              handleNext();
            }}
            filterByClient={selectedClient?.id}
          />
        );
      case 2:
        return (
          <ActionPanel
            actionType="assignment"
            selectedItem={selectedItem}
            onActionComplete={handleActionComplete}
          />
        );
      case 3:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="success.main">
                ✓ Assignment Action Completed
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Your assignment action has been saved successfully with timestamp: {formatTimestamp()}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" onClick={handleReset}>
                  New Assignment
                </Button>
                <Button variant="outlined" onClick={() => setShowHistory(true)}>
                  View History
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
      default:
        return 'Unknown step';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'overdue': return 'error';
      case 'returned': return 'default';
      case 'checked_out': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon />
          Assignment Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={() => setShowHistory(true)}
        >
          View History
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 2 }}>
            {getStepContent(activeStep)}
          </Box>

          {activeStep > 0 && activeStep < 3 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && !selectedClient) ||
                  (activeStep === 1 && !selectedItem)
                }
              >
                Next
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Current Assignments Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Current Assignments
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Operator</TableCell>
                  <TableCell>Assigned Date</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {assignment.itemName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {assignment.itemSerial}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {assignment.operatorName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {assignment.operatorEmail}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(assignment.assignedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(assignment.dueDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={assignment.status}
                          color={getStatusColor(assignment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {assignment.location}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={assignments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      {/* Assignment History Dialog */}
      <Dialog
        open={showHistory}
        onClose={() => setShowHistory(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Assignment History</DialogTitle>
        <DialogContent>
          {completedActions.length === 0 ? (
            <Alert severity="info">No assignment actions recorded yet.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {completedActions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell>
                        {formatDate(action.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {action.item?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {action.item?.serialNumber}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={action.action?.type}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {action.action?.notes || 'No additional details'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="new assignment"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleReset}
      >
        <AddIcon />
      </Fab>

      {/* Client Lookup Dialog */}
      <ClientLookup
        open={clientLookupOpen}
        onClose={() => {}}
        onClientSelected={handleClientSelected}
        title="Select Client for Assignments"
        subtitle="Choose the client to manage assignments for"
        required={true}
      />
    </Box>
  );
}