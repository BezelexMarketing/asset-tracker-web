const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logEvent } = require('../services/eventLogger');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

/**
 * GET /api/operators - Get all operators for tenant
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      status = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['o.tenant_id = $1'];
    let params = [tenantId];
    let paramIndex = 2;

    // Add search filter
    if (search) {
      whereConditions.push(`(o.first_name ILIKE $${paramIndex} OR o.last_name ILIKE $${paramIndex} OR o.employee_id ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add status filter
    if (status) {
      whereConditions.push(`o.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Validate sort parameters
    const allowedSortFields = ['first_name', 'last_name', 'employee_id', 'status', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const result = await query(`
      SELECT 
        o.id,
        o.first_name,
        o.last_name,
        o.employee_id,
        o.contact_info,
        o.status,
        o.notes,
        o.created_at,
        o.updated_at,
        COUNT(ia.id) as active_assignments
      FROM operators o
      LEFT JOIN item_assignments ia ON o.id = ia.operator_id AND ia.status = 'active'
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY o.id, o.first_name, o.last_name, o.employee_id, o.contact_info, o.status, o.notes, o.created_at, o.updated_at
      ORDER BY o.${sortField} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM operators o
      WHERE ${whereConditions.join(' AND ')}
    `, params.slice(0, -2)); // Remove limit and offset params

    const operators = result.rows.map(row => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      employeeId: row.employee_id,
      contactInfo: row.contact_info ? JSON.parse(row.contact_info) : null,
      status: row.status,
      notes: row.notes,
      activeAssignments: parseInt(row.active_assignments),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      operators,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Get operators error:', error);
    res.status(500).json({ error: 'Failed to fetch operators' });
  }
});

/**
 * GET /api/operators/:id - Get specific operator
 */
router.get('/:id', 
  authenticateToken,
  param('id').isUUID().withMessage('Invalid operator ID'),
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
          o.*,
          COUNT(ia.id) as active_assignments
        FROM operators o
        LEFT JOIN item_assignments ia ON o.id = ia.operator_id AND ia.status = 'active'
        WHERE o.id = $1 AND o.tenant_id = $2
        GROUP BY o.id
      `, [id, tenantId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Operator not found' });
      }

      const operator = result.rows[0];

      // Get assigned items
      const itemsResult = await query(`
        SELECT 
          i.id,
          i.name,
          i.serial_number,
          i.category,
          i.status,
          ia.assigned_at,
          ia.notes as assignment_notes
        FROM item_assignments ia
        JOIN items i ON ia.item_id = i.id
        WHERE ia.operator_id = $1 AND ia.status = 'active'
        ORDER BY ia.assigned_at DESC
      `, [id]);

      res.json({
        id: operator.id,
        firstName: operator.first_name,
        lastName: operator.last_name,
        employeeId: operator.employee_id,
        contactInfo: operator.contact_info ? JSON.parse(operator.contact_info) : null,
        status: operator.status,
        notes: operator.notes,
        activeAssignments: parseInt(operator.active_assignments),
        assignedItems: itemsResult.rows.map(item => ({
          id: item.id,
          name: item.name,
          serialNumber: item.serial_number,
          category: item.category,
          status: item.status,
          assignedAt: item.assigned_at,
          assignmentNotes: item.assignment_notes
        })),
        createdAt: operator.created_at,
        updatedAt: operator.updated_at
      });

    } catch (error) {
      console.error('Get operator error:', error);
      res.status(500).json({ error: 'Failed to fetch operator' });
    }
  }
);

/**
 * POST /api/operators - Create new operator
 */
router.post('/',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  [
    body('firstName').trim().isLength({ min: 1, max: 100 }).withMessage('First name is required and must be less than 100 characters'),
    body('lastName').trim().isLength({ min: 1, max: 100 }).withMessage('Last name is required and must be less than 100 characters'),
    body('employeeId').optional().trim().isLength({ max: 50 }).withMessage('Employee ID must be less than 50 characters'),
    body('contactInfo.email').optional().isEmail().withMessage('Invalid email format'),
    body('contactInfo.phone').optional().trim().isLength({ max: 20 }).withMessage('Phone number must be less than 20 characters'),
    body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { tenantId, id: userId } = req.user;
      const { firstName, lastName, employeeId, contactInfo, notes } = req.body;

      // Check if employee ID already exists for this tenant
      if (employeeId) {
        const existingOperator = await query(`
          SELECT id FROM operators 
          WHERE employee_id = $1 AND tenant_id = $2
        `, [employeeId, tenantId]);

        if (existingOperator.rows.length > 0) {
          return res.status(400).json({ error: 'Employee ID already exists' });
        }
      }

      // Create operator
      const result = await query(`
        INSERT INTO operators (
          tenant_id, first_name, last_name, employee_id, 
          contact_info, status, notes, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, created_at
      `, [
        tenantId, firstName, lastName, employeeId,
        contactInfo ? JSON.stringify(contactInfo) : null,
        'active', notes, userId
      ]);

      const operatorId = result.rows[0].id;

      // Log creation event
      await logEvent({
        tenantId,
        eventType: 'created',
        operatorId,
        userId,
        notes: `Operator created: ${firstName} ${lastName}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json({
        id: operatorId,
        firstName,
        lastName,
        employeeId,
        contactInfo,
        status: 'active',
        notes,
        activeAssignments: 0,
        createdAt: result.rows[0].created_at
      });

    } catch (error) {
      console.error('Create operator error:', error);
      res.status(500).json({ error: 'Failed to create operator' });
    }
  }
);

/**
 * PUT /api/operators/:id - Update operator
 */
router.put('/:id',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  [
    param('id').isUUID().withMessage('Invalid operator ID'),
    body('firstName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('First name must be less than 100 characters'),
    body('lastName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Last name must be less than 100 characters'),
    body('employeeId').optional().trim().isLength({ max: 50 }).withMessage('Employee ID must be less than 50 characters'),
    body('contactInfo.email').optional().isEmail().withMessage('Invalid email format'),
    body('contactInfo.phone').optional().trim().isLength({ max: 20 }).withMessage('Phone number must be less than 20 characters'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
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
      const { firstName, lastName, employeeId, contactInfo, status, notes } = req.body;

      // Check if operator exists
      const existingOperator = await query(`
        SELECT * FROM operators WHERE id = $1 AND tenant_id = $2
      `, [id, tenantId]);

      if (existingOperator.rows.length === 0) {
        return res.status(404).json({ error: 'Operator not found' });
      }

      const currentOperator = existingOperator.rows[0];

      // Check employee ID uniqueness if changed
      if (employeeId && employeeId !== currentOperator.employee_id) {
        const duplicateCheck = await query(`
          SELECT id FROM operators 
          WHERE employee_id = $1 AND tenant_id = $2 AND id != $3
        `, [employeeId, tenantId, id]);

        if (duplicateCheck.rows.length > 0) {
          return res.status(400).json({ error: 'Employee ID already exists' });
        }
      }

      // If deactivating operator, check for active assignments
      if (status === 'inactive' && currentOperator.status === 'active') {
        const activeAssignments = await query(`
          SELECT COUNT(*) as count FROM item_assignments 
          WHERE operator_id = $1 AND status = 'active'
        `, [id]);

        if (parseInt(activeAssignments.rows[0].count) > 0) {
          return res.status(400).json({ 
            error: 'Cannot deactivate operator with active item assignments. Please unassign items first.' 
          });
        }
      }

      // Update operator
      const updateResult = await query(`
        UPDATE operators 
        SET 
          first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          employee_id = COALESCE($3, employee_id),
          contact_info = COALESCE($4, contact_info),
          status = COALESCE($5, status),
          notes = COALESCE($6, notes),
          updated_at = NOW()
        WHERE id = $7 AND tenant_id = $8
        RETURNING *
      `, [
        firstName, lastName, employeeId,
        contactInfo ? JSON.stringify(contactInfo) : null,
        status, notes, id, tenantId
      ]);

      // Log update event
      await logEvent({
        tenantId,
        eventType: 'updated',
        operatorId: id,
        userId,
        notes: `Operator updated: ${firstName || currentOperator.first_name} ${lastName || currentOperator.last_name}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      const updatedOperator = updateResult.rows[0];

      res.json({
        id: updatedOperator.id,
        firstName: updatedOperator.first_name,
        lastName: updatedOperator.last_name,
        employeeId: updatedOperator.employee_id,
        contactInfo: updatedOperator.contact_info ? JSON.parse(updatedOperator.contact_info) : null,
        status: updatedOperator.status,
        notes: updatedOperator.notes,
        createdAt: updatedOperator.created_at,
        updatedAt: updatedOperator.updated_at
      });

    } catch (error) {
      console.error('Update operator error:', error);
      res.status(500).json({ error: 'Failed to update operator' });
    }
  }
);

/**
 * DELETE /api/operators/:id - Delete operator
 */
router.delete('/:id',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  param('id').isUUID().withMessage('Invalid operator ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { tenantId, id: userId } = req.user;
      const { id } = req.params;

      // Get operator details
      const operatorResult = await query(`
        SELECT * FROM operators WHERE id = $1 AND tenant_id = $2
      `, [id, tenantId]);

      if (operatorResult.rows.length === 0) {
        return res.status(404).json({ error: 'Operator not found' });
      }

      const operator = operatorResult.rows[0];

      // Check for active assignments
      const activeAssignments = await query(`
        SELECT COUNT(*) as count FROM item_assignments 
        WHERE operator_id = $1 AND status = 'active'
      `, [id]);

      if (parseInt(activeAssignments.rows[0].count) > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete operator with active item assignments. Please unassign items first.' 
        });
      }

      // Delete operator
      await query(`DELETE FROM operators WHERE id = $1 AND tenant_id = $2`, [id, tenantId]);

      // Log deletion event
      await logEvent({
        tenantId,
        eventType: 'deleted',
        operatorId: id,
        userId,
        notes: `Operator deleted: ${operator.first_name} ${operator.last_name}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Operator deleted successfully' });

    } catch (error) {
      console.error('Delete operator error:', error);
      res.status(500).json({ error: 'Failed to delete operator' });
    }
  }
);

/**
 * GET /api/operators/:id/assignments - Get operator's assignment history
 */
router.get('/:id/assignments',
  authenticateToken,
  param('id').isUUID().withMessage('Invalid operator ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { tenantId } = req.user;
      const { id } = req.params;
      const { page = 1, limit = 20, status = '' } = req.query;

      const offset = (page - 1) * limit;
      let whereConditions = ['ia.operator_id = $1 AND ia.tenant_id = $2'];
      let params = [id, tenantId];
      let paramIndex = 3;

      if (status) {
        whereConditions.push(`ia.status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
      }

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
          u.first_name as assigned_by_first_name,
          u.last_name as assigned_by_last_name
        FROM item_assignments ia
        JOIN items i ON ia.item_id = i.id
        LEFT JOIN users u ON ia.assigned_by = u.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY ia.assigned_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...params, limit, offset]);

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
          category: row.category
        },
        assignedBy: row.assigned_by_first_name ? {
          firstName: row.assigned_by_first_name,
          lastName: row.assigned_by_last_name
        } : null
      }));

      res.json({
        assignments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Get operator assignments error:', error);
      res.status(500).json({ error: 'Failed to fetch operator assignments' });
    }
  }
);

module.exports = router;