const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logEvent } = require('../services/eventLogger');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

/**
 * GET /api/assignments - Get all assignments for tenant
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { 
      page = 1, 
      limit = 20, 
      status = '', 
      operatorId = '',
      itemId = '',
      sortBy = 'assigned_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['ia.tenant_id = $1'];
    let params = [tenantId];
    let paramIndex = 2;

    // Add filters
    if (status) {
      whereConditions.push(`ia.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (operatorId) {
      whereConditions.push(`ia.operator_id = $${paramIndex}`);
      params.push(operatorId);
      paramIndex++;
    }

    if (itemId) {
      whereConditions.push(`ia.item_id = $${paramIndex}`);
      params.push(itemId);
      paramIndex++;
    }

    // Validate sort parameters
    const allowedSortFields = ['assigned_at', 'unassigned_at', 'status'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'assigned_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const result = await query(`
      SELECT 
        ia.id,
        ia.status,
        ia.assigned_at,
        ia.unassigned_at,
        ia.notes,
        i.id as item_id,
        i.name as item_name,
        i.serial_number,
        i.category,
        i.status as item_status,
        o.id as operator_id,
        o.first_name as operator_first_name,
        o.last_name as operator_last_name,
        o.employee_id,
        u1.first_name as assigned_by_first_name,
        u1.last_name as assigned_by_last_name,
        u2.first_name as unassigned_by_first_name,
        u2.last_name as unassigned_by_last_name
      FROM item_assignments ia
      JOIN items i ON ia.item_id = i.id
      JOIN operators o ON ia.operator_id = o.id
      LEFT JOIN users u1 ON ia.assigned_by = u1.id
      LEFT JOIN users u2 ON ia.unassigned_by = u2.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ia.${sortField} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM item_assignments ia
      WHERE ${whereConditions.join(' AND ')}
    `, params.slice(0, -2)); // Remove limit and offset params

    const assignments = result.rows.map(row => ({
      id: row.id,
      status: row.status,
      assignedAt: row.assigned_at,
      unassignedAt: row.unassigned_at,
      notes: row.notes,
      item: {
        id: row.item_id,
        name: row.item_name,
        serialNumber: row.serial_number,
        category: row.category,
        status: row.item_status
      },
      operator: {
        id: row.operator_id,
        firstName: row.operator_first_name,
        lastName: row.operator_last_name,
        employeeId: row.employee_id
      },
      assignedBy: row.assigned_by_first_name ? {
        firstName: row.assigned_by_first_name,
        lastName: row.assigned_by_last_name
      } : null,
      unassignedBy: row.unassigned_by_first_name ? {
        firstName: row.unassigned_by_first_name,
        lastName: row.unassigned_by_last_name
      } : null
    }));

    res.json({
      assignments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

/**
 * POST /api/assignments - Create new assignment
 */
router.post('/',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  [
    body('itemId').isUUID().withMessage('Valid item ID is required'),
    body('operatorId').isUUID().withMessage('Valid operator ID is required'),
    body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { tenantId, id: userId } = req.user;
      const { itemId, operatorId, notes } = req.body;

      // Verify item exists and belongs to tenant
      const itemResult = await query(`
        SELECT id, name, status FROM items 
        WHERE id = $1 AND tenant_id = $2
      `, [itemId, tenantId]);

      if (itemResult.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const item = itemResult.rows[0];

      // Verify operator exists and belongs to tenant
      const operatorResult = await query(`
        SELECT id, first_name, last_name, status FROM operators 
        WHERE id = $1 AND tenant_id = $2
      `, [operatorId, tenantId]);

      if (operatorResult.rows.length === 0) {
        return res.status(404).json({ error: 'Operator not found' });
      }

      const operator = operatorResult.rows[0];

      // Check if operator is active
      if (operator.status !== 'active') {
        return res.status(400).json({ error: 'Cannot assign items to inactive operator' });
      }

      // Check if item is already assigned
      const existingAssignment = await query(`
        SELECT id FROM item_assignments 
        WHERE item_id = $1 AND status = 'active'
      `, [itemId]);

      if (existingAssignment.rows.length > 0) {
        return res.status(400).json({ error: 'Item is already assigned to another operator' });
      }

      // Create assignment
      const assignmentResult = await query(`
        INSERT INTO item_assignments (
          tenant_id, item_id, operator_id, status, 
          assigned_at, assigned_by, notes
        )
        VALUES ($1, $2, $3, $4, NOW(), $5, $6)
        RETURNING id, assigned_at
      `, [tenantId, itemId, operatorId, 'active', userId, notes]);

      const assignmentId = assignmentResult.rows[0].id;

      // Update item status to assigned
      await query(`
        UPDATE items 
        SET status = 'assigned', updated_at = NOW()
        WHERE id = $1 AND tenant_id = $2
      `, [itemId, tenantId]);

      // Log assignment event
      await logEvent({
        tenantId,
        eventType: 'assign',
        itemId,
        operatorId,
        userId,
        notes: `Item "${item.name}" assigned to ${operator.first_name} ${operator.last_name}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json({
        id: assignmentId,
        status: 'active',
        assignedAt: assignmentResult.rows[0].assigned_at,
        notes,
        item: {
          id: item.id,
          name: item.name
        },
        operator: {
          id: operator.id,
          firstName: operator.first_name,
          lastName: operator.last_name
        }
      });

    } catch (error) {
      console.error('Create assignment error:', error);
      res.status(500).json({ error: 'Failed to create assignment' });
    }
  }
);

/**
 * PUT /api/assignments/:id/unassign - Unassign item from operator
 */
router.put('/:id/unassign',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  [
    param('id').isUUID().withMessage('Invalid assignment ID'),
    body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { tenantId, id: userId } = req.user;
      const { id } = req.params;
      const { notes } = req.body;

      // Get assignment details
      const assignmentResult = await query(`
        SELECT 
          ia.*,
          i.name as item_name,
          o.first_name as operator_first_name,
          o.last_name as operator_last_name
        FROM item_assignments ia
        JOIN items i ON ia.item_id = i.id
        JOIN operators o ON ia.operator_id = o.id
        WHERE ia.id = $1 AND ia.tenant_id = $2 AND ia.status = 'active'
      `, [id, tenantId]);

      if (assignmentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Active assignment not found' });
      }

      const assignment = assignmentResult.rows[0];

      // Update assignment to unassigned
      await query(`
        UPDATE item_assignments 
        SET 
          status = 'unassigned',
          unassigned_at = NOW(),
          unassigned_by = $1,
          notes = COALESCE($2, notes)
        WHERE id = $3 AND tenant_id = $4
      `, [userId, notes, id, tenantId]);

      // Update item status to available
      await query(`
        UPDATE items 
        SET status = 'available', updated_at = NOW()
        WHERE id = $1 AND tenant_id = $2
      `, [assignment.item_id, tenantId]);

      // Log unassignment event
      await logEvent({
        tenantId,
        eventType: 'unassign',
        itemId: assignment.item_id,
        operatorId: assignment.operator_id,
        userId,
        notes: `Item "${assignment.item_name}" unassigned from ${assignment.operator_first_name} ${assignment.operator_last_name}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        id,
        status: 'unassigned',
        unassignedAt: new Date().toISOString(),
        notes: notes || assignment.notes
      });

    } catch (error) {
      console.error('Unassign item error:', error);
      res.status(500).json({ error: 'Failed to unassign item' });
    }
  }
);

/**
 * GET /api/assignments/:id - Get specific assignment
 */
router.get('/:id',
  authenticateToken,
  param('id').isUUID().withMessage('Invalid assignment ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { tenantId } = req.user;
      const { id } = req.params;

      const result = await query(`
        SELECT 
          ia.*,
          i.id as item_id,
          i.name as item_name,
          i.serial_number,
          i.category,
          i.status as item_status,
          i.images,
          o.id as operator_id,
          o.first_name as operator_first_name,
          o.last_name as operator_last_name,
          o.employee_id,
          o.contact_info as operator_contact,
          u1.first_name as assigned_by_first_name,
          u1.last_name as assigned_by_last_name,
          u2.first_name as unassigned_by_first_name,
          u2.last_name as unassigned_by_last_name
        FROM item_assignments ia
        JOIN items i ON ia.item_id = i.id
        JOIN operators o ON ia.operator_id = o.id
        LEFT JOIN users u1 ON ia.assigned_by = u1.id
        LEFT JOIN users u2 ON ia.unassigned_by = u2.id
        WHERE ia.id = $1 AND ia.tenant_id = $2
      `, [id, tenantId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      const assignment = result.rows[0];

      res.json({
        id: assignment.id,
        status: assignment.status,
        assignedAt: assignment.assigned_at,
        unassignedAt: assignment.unassigned_at,
        notes: assignment.notes,
        item: {
          id: assignment.item_id,
          name: assignment.item_name,
          serialNumber: assignment.serial_number,
          category: assignment.category,
          status: assignment.item_status,
          images: assignment.images ? JSON.parse(assignment.images) : null
        },
        operator: {
          id: assignment.operator_id,
          firstName: assignment.operator_first_name,
          lastName: assignment.operator_last_name,
          employeeId: assignment.employee_id,
          contactInfo: assignment.operator_contact ? JSON.parse(assignment.operator_contact) : null
        },
        assignedBy: assignment.assigned_by_first_name ? {
          firstName: assignment.assigned_by_first_name,
          lastName: assignment.assigned_by_last_name
        } : null,
        unassignedBy: assignment.unassigned_by_first_name ? {
          firstName: assignment.unassigned_by_first_name,
          lastName: assignment.unassigned_by_last_name
        } : null
      });

    } catch (error) {
      console.error('Get assignment error:', error);
      res.status(500).json({ error: 'Failed to fetch assignment' });
    }
  }
);

/**
 * PUT /api/assignments/:id - Update assignment notes
 */
router.put('/:id',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  [
    param('id').isUUID().withMessage('Invalid assignment ID'),
    body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { tenantId, id: userId } = req.user;
      const { id } = req.params;
      const { notes } = req.body;

      // Check if assignment exists
      const existingAssignment = await query(`
        SELECT id FROM item_assignments 
        WHERE id = $1 AND tenant_id = $2
      `, [id, tenantId]);

      if (existingAssignment.rows.length === 0) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      // Update assignment notes
      const updateResult = await query(`
        UPDATE item_assignments 
        SET notes = $1, updated_at = NOW()
        WHERE id = $2 AND tenant_id = $3
        RETURNING *
      `, [notes, id, tenantId]);

      const updatedAssignment = updateResult.rows[0];

      res.json({
        id: updatedAssignment.id,
        status: updatedAssignment.status,
        assignedAt: updatedAssignment.assigned_at,
        unassignedAt: updatedAssignment.unassigned_at,
        notes: updatedAssignment.notes,
        updatedAt: updatedAssignment.updated_at
      });

    } catch (error) {
      console.error('Update assignment error:', error);
      res.status(500).json({ error: 'Failed to update assignment' });
    }
  }
);

/**
 * GET /api/assignments/stats - Get assignment statistics
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { tenantId } = req.user;

    const result = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'active') as active_assignments,
        COUNT(*) FILTER (WHERE status = 'unassigned') as total_unassigned,
        COUNT(DISTINCT operator_id) FILTER (WHERE status = 'active') as operators_with_assignments,
        COUNT(DISTINCT item_id) FILTER (WHERE status = 'active') as items_assigned
      FROM item_assignments
      WHERE tenant_id = $1
    `, [tenantId]);

    const stats = result.rows[0];

    // Get recent assignments
    const recentResult = await query(`
      SELECT 
        ia.id,
        ia.assigned_at,
        i.name as item_name,
        o.first_name as operator_first_name,
        o.last_name as operator_last_name
      FROM item_assignments ia
      JOIN items i ON ia.item_id = i.id
      JOIN operators o ON ia.operator_id = o.id
      WHERE ia.tenant_id = $1 AND ia.status = 'active'
      ORDER BY ia.assigned_at DESC
      LIMIT 5
    `, [tenantId]);

    const recentAssignments = recentResult.rows.map(row => ({
      id: row.id,
      assignedAt: row.assigned_at,
      itemName: row.item_name,
      operatorName: `${row.operator_first_name} ${row.operator_last_name}`
    }));

    res.json({
      activeAssignments: parseInt(stats.active_assignments),
      totalUnassigned: parseInt(stats.total_unassigned),
      operatorsWithAssignments: parseInt(stats.operators_with_assignments),
      itemsAssigned: parseInt(stats.items_assigned),
      recentAssignments
    });

  } catch (error) {
    console.error('Get assignment stats error:', error);
    res.status(500).json({ error: 'Failed to fetch assignment statistics' });
  }
});

module.exports = router;