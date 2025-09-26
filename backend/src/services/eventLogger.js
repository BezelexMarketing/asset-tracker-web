const { query } = require('../config/database');
const { syncToGoogleSheets } = require('./googleSheetsSync');

/**
 * Log an event to the database and sync to Google Sheets
 * @param {Object} eventData - Event data to log
 */
const logEvent = async (eventData) => {
  try {
    const {
      tenantId,
      eventType,
      itemId = null,
      operatorId = null,
      userId = null,
      nfcTagUid = null,
      location = null,
      notes = null,
      images = null,
      metadata = null,
      ipAddress = null,
      userAgent = null
    } = eventData;

    // Validate required fields
    if (!tenantId || !eventType) {
      throw new Error('tenantId and eventType are required');
    }

    // Insert event into database
    const result = await query(`
      INSERT INTO events (
        tenant_id, event_type, item_id, operator_id, user_id,
        nfc_tag_uid, location, notes, images, metadata,
        ip_address, user_agent, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING id, created_at
    `, [
      tenantId, eventType, itemId, operatorId, userId,
      nfcTagUid, location, notes, 
      images ? JSON.stringify(images) : null,
      metadata ? JSON.stringify(metadata) : null,
      ipAddress, userAgent
    ]);

    const eventId = result.rows[0].id;
    const createdAt = result.rows[0].created_at;

    // Get additional data for Google Sheets sync
    let enrichedEventData = {
      id: eventId,
      tenantId,
      eventType,
      createdAt,
      nfcTagUid,
      location,
      notes,
      ipAddress
    };

    // Get item details if itemId is provided
    if (itemId) {
      const itemResult = await query(`
        SELECT name, serial_number, category, status
        FROM items
        WHERE id = $1 AND tenant_id = $2
      `, [itemId, tenantId]);

      if (itemResult.rows.length > 0) {
        enrichedEventData.item = itemResult.rows[0];
      }
    }

    // Get operator details if operatorId is provided
    if (operatorId) {
      const operatorResult = await query(`
        SELECT first_name, last_name, employee_id
        FROM operators
        WHERE id = $1 AND tenant_id = $2
      `, [operatorId, tenantId]);

      if (operatorResult.rows.length > 0) {
        enrichedEventData.operator = operatorResult.rows[0];
      }
    }

    // Get user details if userId is provided
    if (userId) {
      const userResult = await query(`
        SELECT first_name, last_name, email, role
        FROM users
        WHERE id = $1 AND tenant_id = $2
      `, [userId, tenantId]);

      if (userResult.rows.length > 0) {
        enrichedEventData.user = userResult.rows[0];
      }
    }

    // Sync to Google Sheets asynchronously (don't wait for it)
    syncToGoogleSheets(enrichedEventData).catch(error => {
      console.error('Google Sheets sync error:', error);
      // Could implement retry logic here
    });

    return {
      eventId,
      createdAt
    };

  } catch (error) {
    console.error('Event logging error:', error);
    throw error;
  }
};

/**
 * Get events for a specific item
 * @param {string} tenantId - Tenant ID
 * @param {string} itemId - Item ID
 * @param {number} limit - Number of events to return
 */
const getItemEvents = async (tenantId, itemId, limit = 50) => {
  try {
    const result = await query(`
      SELECT 
        e.id,
        e.event_type,
        e.created_at,
        e.location,
        e.notes,
        e.nfc_tag_uid,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.role as user_role,
        o.first_name as operator_first_name,
        o.last_name as operator_last_name,
        o.employee_id
      FROM events e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN operators o ON e.operator_id = o.id
      WHERE e.tenant_id = $1 AND e.item_id = $2
      ORDER BY e.created_at DESC
      LIMIT $3
    `, [tenantId, itemId, limit]);

    return result.rows.map(row => ({
      id: row.id,
      eventType: row.event_type,
      createdAt: row.created_at,
      location: row.location,
      notes: row.notes,
      nfcTagUid: row.nfc_tag_uid,
      user: row.user_first_name ? {
        firstName: row.user_first_name,
        lastName: row.user_last_name,
        role: row.user_role
      } : null,
      operator: row.operator_first_name ? {
        firstName: row.operator_first_name,
        lastName: row.operator_last_name,
        employeeId: row.employee_id
      } : null
    }));

  } catch (error) {
    console.error('Get item events error:', error);
    throw error;
  }
};

/**
 * Get events for a tenant with filtering
 * @param {string} tenantId - Tenant ID
 * @param {Object} filters - Filter options
 */
const getTenantEvents = async (tenantId, filters = {}) => {
  try {
    const {
      eventType,
      itemId,
      operatorId,
      userId,
      startDate,
      endDate,
      limit = 100,
      offset = 0
    } = filters;

    let whereConditions = ['e.tenant_id = $1'];
    let params = [tenantId];
    let paramIndex = 2;

    if (eventType) {
      whereConditions.push(`e.event_type = $${paramIndex}`);
      params.push(eventType);
      paramIndex++;
    }

    if (itemId) {
      whereConditions.push(`e.item_id = $${paramIndex}`);
      params.push(itemId);
      paramIndex++;
    }

    if (operatorId) {
      whereConditions.push(`e.operator_id = $${paramIndex}`);
      params.push(operatorId);
      paramIndex++;
    }

    if (userId) {
      whereConditions.push(`e.user_id = $${paramIndex}`);
      params.push(userId);
      paramIndex++;
    }

    if (startDate) {
      whereConditions.push(`e.created_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`e.created_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const result = await query(`
      SELECT 
        e.id,
        e.event_type,
        e.created_at,
        e.location,
        e.notes,
        e.nfc_tag_uid,
        i.name as item_name,
        i.serial_number,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.role as user_role,
        o.first_name as operator_first_name,
        o.last_name as operator_last_name,
        o.employee_id
      FROM events e
      LEFT JOIN items i ON e.item_id = i.id
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN operators o ON e.operator_id = o.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY e.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    return result.rows.map(row => ({
      id: row.id,
      eventType: row.event_type,
      createdAt: row.created_at,
      location: row.location,
      notes: row.notes,
      nfcTagUid: row.nfc_tag_uid,
      item: row.item_name ? {
        name: row.item_name,
        serialNumber: row.serial_number
      } : null,
      user: row.user_first_name ? {
        firstName: row.user_first_name,
        lastName: row.user_last_name,
        role: row.user_role
      } : null,
      operator: row.operator_first_name ? {
        firstName: row.operator_first_name,
        lastName: row.operator_last_name,
        employeeId: row.employee_id
      } : null
    }));

  } catch (error) {
    console.error('Get tenant events error:', error);
    throw error;
  }
};

/**
 * Get event statistics for dashboard
 * @param {string} tenantId - Tenant ID
 * @param {string} period - Time period ('day', 'week', 'month')
 */
const getEventStats = async (tenantId, period = 'day') => {
  try {
    let dateFilter;
    switch (period) {
      case 'week':
        dateFilter = "created_at >= NOW() - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "created_at >= NOW() - INTERVAL '30 days'";
        break;
      default:
        dateFilter = "created_at >= NOW() - INTERVAL '1 day'";
    }

    const result = await query(`
      SELECT 
        event_type,
        COUNT(*) as count,
        DATE_TRUNC('hour', created_at) as hour
      FROM events
      WHERE tenant_id = $1 AND ${dateFilter}
      GROUP BY event_type, DATE_TRUNC('hour', created_at)
      ORDER BY hour DESC
    `, [tenantId]);

    return result.rows;

  } catch (error) {
    console.error('Get event stats error:', error);
    throw error;
  }
};

module.exports = {
  logEvent,
  getItemEvents,
  getTenantEvents,
  getEventStats
};