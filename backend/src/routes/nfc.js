const express = require('express');
const router = express.Router();
const { query, transaction } = require('../config/database');
const { authenticateToken, requireTenantAccess, requireOperator, requireAdmin } = require('../middleware/auth');
const { logEvent } = require('../services/eventLogger');
const { validateNFCLookup, validateAssignment, validateCheckInOut, validateMaintenance } = require('../validators/nfcValidators');

// Apply authentication and tenant access to all routes
router.use(authenticateToken);
router.use(requireTenantAccess);

/**
 * GET /api/nfc/:tagUid/lookup
 * Lookup item by NFC tag UID
 */
router.get('/:tagUid/lookup', requireOperator, async (req, res) => {
  try {
    const { tagUid } = req.params;
    const { tenantId } = req;

    // Validate input
    const { error } = validateNFCLookup({ tagUid });
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }

    // Look up NFC tag and associated item
    const result = await query(`
      SELECT 
        nt.id as tag_id,
        nt.tag_uid,
        nt.is_active as tag_active,
        i.id as item_id,
        i.name as item_name,
        i.description,
        i.category,
        i.serial_number,
        i.model,
        i.manufacturer,
        i.status,
        i.condition_rating,
        i.location,
        i.image_thumbnail_url,
        i.image_standard_url,
        i.metadata,
        ia.id as assignment_id,
        ia.is_active as is_assigned,
        o.id as operator_id,
        o.first_name as operator_first_name,
        o.last_name as operator_last_name,
        o.employee_id,
        ia.assigned_at,
        ia.notes as assignment_notes
      FROM nfc_tags nt
      LEFT JOIN items i ON nt.item_id = i.id
      LEFT JOIN item_assignments ia ON i.id = ia.item_id AND ia.is_active = true
      LEFT JOIN operators o ON ia.operator_id = o.id
      WHERE nt.tenant_id = $1 AND nt.tag_uid = $2
    `, [tenantId, tagUid]);

    if (result.rows.length === 0) {
      // Log lookup event for unregistered tag
      await logEvent({
        tenantId,
        eventType: 'lookup',
        nfcTagUid: tagUid,
        userId: req.user.id,
        metadata: { result: 'tag_not_found' },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(404).json({ 
        error: 'NFC tag not found',
        code: 'TAG_NOT_FOUND',
        tagUid
      });
    }

    const tagData = result.rows[0];

    // Check if tag is active
    if (!tagData.tag_active) {
      await logEvent({
        tenantId,
        eventType: 'lookup',
        nfcTagUid: tagUid,
        userId: req.user.id,
        metadata: { result: 'tag_inactive' },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(400).json({ 
        error: 'NFC tag is inactive',
        code: 'TAG_INACTIVE',
        tagUid
      });
    }

    // Check if tag has an associated item
    if (!tagData.item_id) {
      await logEvent({
        tenantId,
        eventType: 'lookup',
        nfcTagUid: tagUid,
        userId: req.user.id,
        metadata: { result: 'unassigned_tag' },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.json({
        status: 'unassigned',
        message: 'NFC tag is not assigned to any item',
        tagUid,
        tagId: tagData.tag_id
      });
    }

    // Get recent events for this item
    const eventsResult = await query(`
      SELECT event_type, created_at, notes, 
             u.first_name as user_first_name, u.last_name as user_last_name,
             o.first_name as operator_first_name, o.last_name as operator_last_name
      FROM events e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN operators o ON e.operator_id = o.id
      WHERE e.tenant_id = $1 AND e.item_id = $2
      ORDER BY e.created_at DESC
      LIMIT 10
    `, [tenantId, tagData.item_id]);

    // Log successful lookup
    await logEvent({
      tenantId,
      eventType: 'lookup',
      itemId: tagData.item_id,
      nfcTagUid: tagUid,
      userId: req.user.id,
      metadata: { 
        result: 'success',
        item_status: tagData.status,
        is_assigned: tagData.is_assigned
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Return item details
    res.json({
      status: 'success',
      item: {
        id: tagData.item_id,
        name: tagData.item_name,
        description: tagData.description,
        category: tagData.category,
        serialNumber: tagData.serial_number,
        model: tagData.model,
        manufacturer: tagData.manufacturer,
        status: tagData.status,
        conditionRating: tagData.condition_rating,
        location: tagData.location,
        images: {
          thumbnail: tagData.image_thumbnail_url,
          standard: tagData.image_standard_url
        },
        metadata: tagData.metadata
      },
      assignment: tagData.is_assigned ? {
        id: tagData.assignment_id,
        operator: {
          id: tagData.operator_id,
          firstName: tagData.operator_first_name,
          lastName: tagData.operator_last_name,
          employeeId: tagData.employee_id
        },
        assignedAt: tagData.assigned_at,
        notes: tagData.assignment_notes
      } : null,
      recentEvents: eventsResult.rows,
      tagUid
    });

  } catch (error) {
    console.error('NFC lookup error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'LOOKUP_ERROR'
    });
  }
});

/**
 * POST /api/nfc/:itemId/assign
 * Assign item to operator
 */
router.post('/:itemId/assign', requireAdmin, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { operatorId, notes } = req.body;
    const { tenantId } = req;

    // Validate input
    const { error } = validateAssignment({ itemId, operatorId, notes });
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }

    await transaction(async (client) => {
      // Check if item exists and is available
      const itemResult = await client.query(`
        SELECT id, name, status FROM items 
        WHERE tenant_id = $1 AND id = $2
      `, [tenantId, itemId]);

      if (itemResult.rows.length === 0) {
        throw new Error('Item not found');
      }

      const item = itemResult.rows[0];

      // Check if operator exists
      const operatorResult = await client.query(`
        SELECT id, first_name, last_name FROM operators 
        WHERE tenant_id = $1 AND id = $2 AND is_active = true
      `, [tenantId, operatorId]);

      if (operatorResult.rows.length === 0) {
        throw new Error('Operator not found');
      }

      // Unassign current assignment if exists
      await client.query(`
        UPDATE item_assignments 
        SET is_active = false, unassigned_at = NOW(), unassigned_by = $1
        WHERE tenant_id = $2 AND item_id = $3 AND is_active = true
      `, [req.user.id, tenantId, itemId]);

      // Create new assignment
      const assignmentResult = await client.query(`
        INSERT INTO item_assignments (tenant_id, item_id, operator_id, assigned_by, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, assigned_at
      `, [tenantId, itemId, operatorId, req.user.id, notes]);

      // Update item status
      await client.query(`
        UPDATE items SET status = 'assigned', updated_at = NOW()
        WHERE id = $1
      `, [itemId]);

      // Log assignment event
      await logEvent({
        tenantId,
        eventType: 'assign',
        itemId,
        operatorId,
        userId: req.user.id,
        notes,
        metadata: { 
          assignment_id: assignmentResult.rows[0].id,
          previous_status: item.status
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: 'Item assigned successfully',
        assignment: {
          id: assignmentResult.rows[0].id,
          assignedAt: assignmentResult.rows[0].assigned_at
        }
      });
    });

  } catch (error) {
    console.error('Assignment error:', error);
    
    if (error.message === 'Item not found') {
      return res.status(404).json({ 
        error: 'Item not found',
        code: 'ITEM_NOT_FOUND'
      });
    } else if (error.message === 'Operator not found') {
      return res.status(404).json({ 
        error: 'Operator not found',
        code: 'OPERATOR_NOT_FOUND'
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'ASSIGNMENT_ERROR'
    });
  }
});

/**
 * POST /api/nfc/:itemId/checkin
 * Check in item
 */
router.post('/:itemId/checkin', requireOperator, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { location, notes } = req.body;
    const { tenantId } = req;

    // Validate input
    const { error } = validateCheckInOut({ itemId, location, notes });
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }

    await transaction(async (client) => {
      // Check if item exists
      const itemResult = await client.query(`
        SELECT id, name, status FROM items 
        WHERE tenant_id = $1 AND id = $2
      `, [tenantId, itemId]);

      if (itemResult.rows.length === 0) {
        throw new Error('Item not found');
      }

      const item = itemResult.rows[0];

      // Update item location if provided
      if (location) {
        await client.query(`
          UPDATE items SET location = $1, updated_at = NOW()
          WHERE id = $2
        `, [location, itemId]);
      }

      // Log check-in event
      await logEvent({
        tenantId,
        eventType: 'checkin',
        itemId,
        userId: req.user.id,
        location,
        notes,
        metadata: { 
          previous_status: item.status,
          previous_location: item.location
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: 'Item checked in successfully',
        item: {
          id: itemId,
          name: item.name,
          location: location || item.location
        }
      });
    });

  } catch (error) {
    console.error('Check-in error:', error);
    
    if (error.message === 'Item not found') {
      return res.status(404).json({ 
        error: 'Item not found',
        code: 'ITEM_NOT_FOUND'
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'CHECKIN_ERROR'
    });
  }
});

/**
 * POST /api/nfc/:itemId/checkout
 * Check out item
 */
router.post('/:itemId/checkout', requireOperator, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { location, notes } = req.body;
    const { tenantId } = req;

    // Validate input
    const { error } = validateCheckInOut({ itemId, location, notes });
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }

    await transaction(async (client) => {
      // Check if item exists
      const itemResult = await client.query(`
        SELECT id, name, status, location FROM items 
        WHERE tenant_id = $1 AND id = $2
      `, [tenantId, itemId]);

      if (itemResult.rows.length === 0) {
        throw new Error('Item not found');
      }

      const item = itemResult.rows[0];

      // Update item location if provided
      if (location) {
        await client.query(`
          UPDATE items SET location = $1, updated_at = NOW()
          WHERE id = $2
        `, [location, itemId]);
      }

      // Log check-out event
      await logEvent({
        tenantId,
        eventType: 'checkout',
        itemId,
        userId: req.user.id,
        location,
        notes,
        metadata: { 
          previous_status: item.status,
          previous_location: item.location
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: 'Item checked out successfully',
        item: {
          id: itemId,
          name: item.name,
          location: location || item.location
        }
      });
    });

  } catch (error) {
    console.error('Check-out error:', error);
    
    if (error.message === 'Item not found') {
      return res.status(404).json({ 
        error: 'Item not found',
        code: 'ITEM_NOT_FOUND'
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'CHECKOUT_ERROR'
    });
  }
});

/**
 * POST /api/nfc/:itemId/maintenance
 * Log maintenance event
 */
router.post('/:itemId/maintenance', requireOperator, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { 
      maintenanceType, 
      description, 
      cost, 
      partsUsed, 
      timeSpentMinutes, 
      nextMaintenanceDate,
      notes,
      images 
    } = req.body;
    const { tenantId } = req;

    // Validate input
    const { error } = validateMaintenance({ 
      itemId, 
      maintenanceType, 
      description, 
      cost, 
      timeSpentMinutes 
    });
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }

    await transaction(async (client) => {
      // Check if item exists
      const itemResult = await client.query(`
        SELECT id, name, status FROM items 
        WHERE tenant_id = $1 AND id = $2
      `, [tenantId, itemId]);

      if (itemResult.rows.length === 0) {
        throw new Error('Item not found');
      }

      const item = itemResult.rows[0];

      // Create maintenance log
      const maintenanceResult = await client.query(`
        INSERT INTO maintenance_logs (
          tenant_id, item_id, performed_by, maintenance_type, description,
          cost, parts_used, time_spent_minutes, next_maintenance_date, images
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, created_at
      `, [
        tenantId, itemId, req.user.id, maintenanceType, description,
        cost, partsUsed, timeSpentMinutes, nextMaintenanceDate, 
        images ? JSON.stringify(images) : null
      ]);

      // Update item maintenance dates
      const updateFields = ['last_maintenance_date = NOW()'];
      const updateParams = [itemId];
      
      if (nextMaintenanceDate) {
        updateFields.push('next_maintenance_date = $2');
        updateParams.unshift(nextMaintenanceDate);
        updateParams[1] = itemId; // Adjust itemId position
      }

      await client.query(`
        UPDATE items 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${updateParams.length}
      `, updateParams);

      // Log maintenance event
      await logEvent({
        tenantId,
        eventType: 'maintenance',
        itemId,
        userId: req.user.id,
        notes: `${maintenanceType}: ${description}`,
        images: images ? JSON.stringify(images) : null,
        metadata: { 
          maintenance_log_id: maintenanceResult.rows[0].id,
          maintenance_type: maintenanceType,
          cost,
          time_spent_minutes: timeSpentMinutes
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: 'Maintenance logged successfully',
        maintenanceLog: {
          id: maintenanceResult.rows[0].id,
          createdAt: maintenanceResult.rows[0].created_at
        }
      });
    });

  } catch (error) {
    console.error('Maintenance logging error:', error);
    
    if (error.message === 'Item not found') {
      return res.status(404).json({ 
        error: 'Item not found',
        code: 'ITEM_NOT_FOUND'
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'MAINTENANCE_ERROR'
    });
  }
});

module.exports = router;