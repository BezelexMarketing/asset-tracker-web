const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Mock data for development
const mockActionLogs = [
  {
    id: '770e8400-e29b-41d4-a716-446655440001',
    client_id: '550e8400-e29b-41d4-a716-446655440001',
    item_id: '880e8400-e29b-41d4-a716-446655440001',
    operator_id: '990e8400-e29b-41d4-a716-446655440001',
    user_id: 'aa0e8400-e29b-41d4-a716-446655440001',
    action_type: 'assign',
    nfc_tag_uid: 'NFC001',
    location: 'North Warehouse',
    notes: 'Assigned laptop to John for project work',
    images: ['https://example.com/image1.jpg'],
    metadata: { project: 'Alpha', duration: '3 months' },
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0...',
    timestamp: new Date('2024-01-16T10:30:00Z'),
    created_at: new Date('2024-01-16T10:30:00Z')
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440002',
    client_id: '550e8400-e29b-41d4-a716-446655440001',
    item_id: '880e8400-e29b-41d4-a716-446655440002',
    operator_id: null,
    user_id: 'aa0e8400-e29b-41d4-a716-446655440002',
    action_type: 'maintenance',
    nfc_tag_uid: 'NFC002',
    location: 'IT Department',
    notes: 'Routine maintenance check completed',
    images: ['https://example.com/maintenance1.jpg', 'https://example.com/maintenance2.jpg'],
    metadata: { maintenance_type: 'routine', cost: 150.00 },
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0...',
    timestamp: new Date('2024-01-17T14:15:00Z'),
    created_at: new Date('2024-01-17T14:15:00Z')
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440003',
    client_id: '550e8400-e29b-41d4-a716-446655440002',
    item_id: '880e8400-e29b-41d4-a716-446655440003',
    operator_id: '990e8400-e29b-41d4-a716-446655440003',
    user_id: 'aa0e8400-e29b-41d4-a716-446655440003',
    action_type: 'lookup',
    nfc_tag_uid: 'NFC003',
    location: 'Production Line A',
    notes: 'Equipment status check',
    images: [],
    metadata: { status: 'operational', temperature: '75°F' },
    ip_address: '192.168.2.50',
    user_agent: 'AssetTracker Mobile App',
    timestamp: new Date('2024-01-18T09:45:00Z'),
    created_at: new Date('2024-01-18T09:45:00Z')
  }
];

// GET /api/action-logs - Get action logs with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      client_id, 
      item_id, 
      operator_id, 
      user_id, 
      action_type, 
      start_date, 
      end_date,
      page = 1,
      limit = 50,
      search
    } = req.query;

    let logs = [...mockActionLogs];

    // Apply filters
    if (client_id) {
      logs = logs.filter(log => log.client_id === client_id);
    }

    if (item_id) {
      logs = logs.filter(log => log.item_id === item_id);
    }

    if (operator_id) {
      logs = logs.filter(log => log.operator_id === operator_id);
    }

    if (user_id) {
      logs = logs.filter(log => log.user_id === user_id);
    }

    if (action_type) {
      logs = logs.filter(log => log.action_type === action_type);
    }

    // Date range filter
    if (start_date) {
      const startDate = new Date(start_date);
      logs = logs.filter(log => new Date(log.timestamp) >= startDate);
    }

    if (end_date) {
      const endDate = new Date(end_date);
      logs = logs.filter(log => new Date(log.timestamp) <= endDate);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      logs = logs.filter(log => 
        log.notes?.toLowerCase().includes(searchLower) ||
        log.location?.toLowerCase().includes(searchLower) ||
        log.action_type.toLowerCase().includes(searchLower) ||
        log.nfc_tag_uid?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedLogs = logs.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(logs.length / limitNum),
        total_records: logs.length,
        per_page: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching action logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch action logs'
    });
  }
});

// GET /api/action-logs/:id - Get specific action log
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const log = mockActionLogs.find(l => l.id === id);

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Action log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Error fetching action log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch action log'
    });
  }
});

// POST /api/action-logs - Create new action log
router.post('/', async (req, res) => {
  try {
    const {
      client_id,
      item_id,
      operator_id,
      user_id,
      action_type,
      nfc_tag_uid,
      location,
      notes,
      images,
      metadata
    } = req.body;

    // Validate required fields
    if (!client_id || !action_type) {
      return res.status(400).json({
        success: false,
        error: 'Client ID and action type are required'
      });
    }

    // Validate action type
    const validActionTypes = [
      'lookup', 'assign', 'unassign', 'checkin', 'checkout', 
      'maintenance', 'create_item', 'update_item', 'delete_item', 'inventory_update'
    ];
    
    if (!validActionTypes.includes(action_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action type'
      });
    }

    const newLog = {
      id: uuidv4(),
      client_id,
      item_id: item_id || null,
      operator_id: operator_id || null,
      user_id: user_id || null,
      action_type,
      nfc_tag_uid: nfc_tag_uid || null,
      location: location || null,
      notes: notes || null,
      images: images || [],
      metadata: metadata || {},
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent') || null,
      timestamp: new Date(),
      created_at: new Date()
    };

    mockActionLogs.push(newLog);

    res.status(201).json({
      success: true,
      data: newLog
    });
  } catch (error) {
    console.error('Error creating action log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create action log'
    });
  }
});

// GET /api/action-logs/stats/summary - Get action log statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { client_id, start_date, end_date } = req.query;

    let logs = [...mockActionLogs];

    // Apply filters
    if (client_id) {
      logs = logs.filter(log => log.client_id === client_id);
    }

    // Date range filter
    if (start_date) {
      const startDate = new Date(start_date);
      logs = logs.filter(log => new Date(log.timestamp) >= startDate);
    }

    if (end_date) {
      const endDate = new Date(end_date);
      logs = logs.filter(log => new Date(log.timestamp) <= endDate);
    }

    // Calculate statistics
    const stats = {
      total_actions: logs.length,
      actions_by_type: {},
      recent_activity: logs
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10)
    };

    // Count by action type
    logs.forEach(log => {
      stats.actions_by_type[log.action_type] = 
        (stats.actions_by_type[log.action_type] || 0) + 1;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching action log stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch action log statistics'
    });
  }
});

module.exports = router;