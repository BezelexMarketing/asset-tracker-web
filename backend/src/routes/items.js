const express = require('express');
const multer = require('multer');
const { query } = require('../config/mock-database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logEvent } = require('../services/eventLogger');
const { processAndUploadImage, uploadMultipleImages, deleteImage, validateImage } = require('../services/imageService');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed'), false);
    }
  }
});

/**
 * GET /api/items - Get all items for client
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { clientId } = req.user;
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      category = '', 
      status = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['i.client_id = $1'];
    let params = [clientId];
    let paramIndex = 2;

    // Add search filter
    if (search) {
      whereConditions.push(`(i.name ILIKE $${paramIndex} OR i.serial_number ILIKE $${paramIndex} OR i.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add category filter
    if (category) {
      whereConditions.push(`i.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    // Add status filter
    if (status) {
      whereConditions.push(`i.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Validate sort parameters
    const allowedSortFields = ['name', 'serial_number', 'category', 'status', 'created_at', 'updated_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const result = await query(`
      SELECT 
        i.id,
        i.name,
        i.serial_number,
        i.description,
        i.category,
        i.status,
        i.images,
        i.metadata,
        i.created_at,
        i.updated_at,
        nt.uid as nfc_tag_uid,
        ia.operator_id,
        o.first_name as operator_first_name,
        o.last_name as operator_last_name,
        o.employee_id
      FROM items i
      LEFT JOIN nfc_tags nt ON i.id = nt.item_id
      LEFT JOIN item_assignments ia ON i.id = ia.item_id AND ia.is_active = true
      LEFT JOIN operators o ON ia.operator_id = o.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY i.${sortField} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM items i
      WHERE ${whereConditions.join(' AND ')}
    `, params.slice(0, -2)); // Remove limit and offset params

    const items = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      serialNumber: row.serial_number,
      description: row.description,
      category: row.category,
      status: row.status,
      images: row.images ? JSON.parse(row.images) : null,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      nfcTagUid: row.nfc_tag_uid,
      assignedOperator: row.operator_id ? {
        id: row.operator_id,
        firstName: row.operator_first_name,
        lastName: row.operator_last_name,
        employeeId: row.employee_id
      } : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

/**
 * GET /api/items/:id - Get specific item
 */
router.get('/:id', 
  authenticateToken,
  param('id').isUUID().withMessage('Invalid item ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { clientId } = req.user;
      const { id } = req.params;

      const result = await query(`
        SELECT 
          i.*,
          nt.uid as nfc_tag_uid,
          ia.operator_id,
          ia.assigned_at,
          o.first_name as operator_first_name,
          o.last_name as operator_last_name,
          o.employee_id,
          o.contact_info as operator_contact
        FROM items i
        LEFT JOIN nfc_tags nt ON i.id = nt.item_id
        LEFT JOIN item_assignments ia ON i.id = ia.item_id AND ia.is_active = true
        LEFT JOIN operators o ON ia.operator_id = o.id
        WHERE i.id = $1 AND i.client_id = $2
      `, [id, clientId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const item = result.rows[0];

      // Log lookup action
      await query(`
        INSERT INTO action_logs (client_id, action_type, item_id, user_id, details, timestamp)
        VALUES ($1, 'lookup', $2, $3, $4, NOW())
      `, [
        clientId,
        id,
        req.user.id,
        JSON.stringify({
          nfc_tag_uid: item.nfc_tag_uid,
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        })
      ]);

      res.json({
        id: item.id,
        name: item.name,
        serialNumber: item.serial_number,
        description: item.description,
        category: item.category,
        status: item.status,
        images: item.images ? JSON.parse(item.images) : null,
        metadata: item.metadata ? JSON.parse(item.metadata) : null,
        nfcTagUid: item.nfc_tag_uid,
        assignedOperator: item.operator_id ? {
          id: item.operator_id,
          firstName: item.operator_first_name,
          lastName: item.operator_last_name,
          employeeId: item.employee_id,
          contactInfo: item.operator_contact ? JSON.parse(item.operator_contact) : null,
          assignedAt: item.assigned_at
        } : null,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      });

    } catch (error) {
      console.error('Get item error:', error);
      res.status(500).json({ error: 'Failed to fetch item' });
    }
  }
);

/**
 * POST /api/items - Create new item
 */
router.post('/',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  upload.array('images', 5),
  [
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be less than 255 characters'),
    body('serialNumber').optional().trim().isLength({ max: 100 }).withMessage('Serial number must be less than 100 characters'),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('category').trim().isLength({ min: 1, max: 100 }).withMessage('Category is required and must be less than 100 characters'),
    body('nfcTagUid').optional().trim().isLength({ max: 50 }).withMessage('NFC tag UID must be less than 50 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { clientId, id: userId } = req.user;
      const { name, serialNumber, description, category, nfcTagUid, metadata } = req.body;

      // Check if serial number already exists for this client
      if (serialNumber) {
        const existingItem = await query(`
          SELECT id FROM items 
          WHERE serial_number = $1 AND client_id = $2
        `, [serialNumber, clientId]);

        if (existingItem.rows.length > 0) {
          return res.status(400).json({ error: 'Serial number already exists' });
        }
      }

      // Check if NFC tag is already assigned
      if (nfcTagUid) {
        const existingTag = await query(`
          SELECT id FROM nfc_tags 
          WHERE uid = $1 AND client_id = $2
        `, [nfcTagUid, clientId]);

        if (existingTag.rows.length > 0) {
          return res.status(400).json({ error: 'NFC tag already assigned to another item' });
        }
      }

      // Process uploaded images
      let processedImages = null;
      if (req.files && req.files.length > 0) {
        // Validate all images first
        for (const file of req.files) {
          const validation = await validateImage(file.buffer, file.mimetype);
          if (!validation.valid) {
            return res.status(400).json({ error: `Image validation failed: ${validation.error}` });
          }
        }

        // Process and upload images
        const imageFiles = req.files.map(file => ({
          buffer: file.buffer,
          originalName: file.originalname
        }));

        processedImages = await uploadMultipleImages(imageFiles, clientId, 'item');
      }

      // Create item
      const itemResult = await query(`
        INSERT INTO items (
          client_id, name, serial_number, description, category, 
          status, images, metadata, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, created_at
      `, [
        clientId, name, serialNumber, description, category,
        'available', 
        processedImages ? JSON.stringify(processedImages) : null,
        metadata ? JSON.stringify(metadata) : null,
        userId
      ]);

      const itemId = itemResult.rows[0].id;

      // Create NFC tag if provided
      if (nfcTagUid) {
        await query(`
          INSERT INTO nfc_tags (client_id, uid, item_id, status)
          VALUES ($1, $2, $3, $4)
        `, [clientId, nfcTagUid, itemId, 'active']);
      }

      // Log creation action
      await query(`
        INSERT INTO action_logs (client_id, action_type, item_id, user_id, details, timestamp)
        VALUES ($1, 'created', $2, $3, $4, NOW())
      `, [
        clientId,
        itemId,
        userId,
        JSON.stringify({
          item_name: name,
          nfc_tag_uid: nfcTagUid,
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        })
      ]);

      res.status(201).json({
        id: itemId,
        name,
        serialNumber,
        description,
        category,
        status: 'available',
        images: processedImages,
        metadata: metadata ? JSON.parse(metadata) : null,
        nfcTagUid,
        createdAt: itemResult.rows[0].created_at
      });

    } catch (error) {
      console.error('Create item error:', error);
      res.status(500).json({ error: 'Failed to create item' });
    }
  }
);

/**
 * PUT /api/items/:id - Update item
 */
router.put('/:id',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  upload.array('images', 5),
  [
    param('id').isUUID().withMessage('Invalid item ID'),
    body('name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Name must be less than 255 characters'),
    body('serialNumber').optional().trim().isLength({ max: 100 }).withMessage('Serial number must be less than 100 characters'),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('category').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Category must be less than 100 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { clientId, id: userId } = req.user;
      const { id } = req.params;
      const { name, serialNumber, description, category, metadata, removeImages } = req.body;

      // Check if item exists
      const existingItem = await query(`
        SELECT * FROM items WHERE id = $1 AND client_id = $2
      `, [id, clientId]);

      if (existingItem.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const currentItem = existingItem.rows[0];

      // Check serial number uniqueness if changed
      if (serialNumber && serialNumber !== currentItem.serial_number) {
        const duplicateCheck = await query(`
          SELECT id FROM items 
          WHERE serial_number = $1 AND client_id = $2 AND id != $3
        `, [serialNumber, clientId, id]);

        if (duplicateCheck.rows.length > 0) {
          return res.status(400).json({ error: 'Serial number already exists' });
        }
      }

      // Handle image updates
      let updatedImages = currentItem.images ? JSON.parse(currentItem.images) : [];

      // Remove specified images
      if (removeImages && Array.isArray(removeImages)) {
        for (const imageId of removeImages) {
          const imageIndex = updatedImages.findIndex(img => img.id === imageId);
          if (imageIndex !== -1) {
            const imageToRemove = updatedImages[imageIndex];
            // Delete from S3
            await deleteImage(imageToRemove.standardKey, imageToRemove.thumbnailKey);
            updatedImages.splice(imageIndex, 1);
          }
        }
      }

      // Add new images
      if (req.files && req.files.length > 0) {
        // Validate all images first
        for (const file of req.files) {
          const validation = await validateImage(file.buffer, file.mimetype);
          if (!validation.valid) {
            return res.status(400).json({ error: `Image validation failed: ${validation.error}` });
          }
        }

        const imageFiles = req.files.map(file => ({
          buffer: file.buffer,
          originalName: file.originalname
        }));

        const newImages = await uploadMultipleImages(imageFiles, clientId, 'item');
        updatedImages = [...updatedImages, ...newImages];
      }

      // Update item
      const updateResult = await query(`
        UPDATE items 
        SET 
          name = COALESCE($1, name),
          serial_number = COALESCE($2, serial_number),
          description = COALESCE($3, description),
          category = COALESCE($4, category),
          images = $5,
          metadata = COALESCE($6, metadata),
          updated_at = NOW()
        WHERE id = $7 AND client_id = $8
        RETURNING *
      `, [
        name, serialNumber, description, category,
        updatedImages.length > 0 ? JSON.stringify(updatedImages) : null,
        metadata ? JSON.stringify(metadata) : null,
        id, clientId
      ]);

      // Log update event
      await logEvent({
        clientId,
        eventType: 'updated',
        itemId: id,
        userId,
        notes: `Item updated: ${name || currentItem.name}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      const updatedItem = updateResult.rows[0];

      res.json({
        id: updatedItem.id,
        name: updatedItem.name,
        serialNumber: updatedItem.serial_number,
        description: updatedItem.description,
        category: updatedItem.category,
        status: updatedItem.status,
        images: updatedItem.images ? JSON.parse(updatedItem.images) : null,
        metadata: updatedItem.metadata ? JSON.parse(updatedItem.metadata) : null,
        createdAt: updatedItem.created_at,
        updatedAt: updatedItem.updated_at
      });

    } catch (error) {
      console.error('Update item error:', error);
      res.status(500).json({ error: 'Failed to update item' });
    }
  }
);

/**
 * DELETE /api/items/:id - Delete item
 */
router.delete('/:id',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  param('id').isUUID().withMessage('Invalid item ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { clientId, id: userId } = req.user;
      const { id } = req.params;

      // Get item details for cleanup
      const itemResult = await query(`
        SELECT * FROM items WHERE id = $1 AND client_id = $2
      `, [id, clientId]);

      if (itemResult.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const item = itemResult.rows[0];

      // Check if item is currently assigned
      const assignmentCheck = await query(`
        SELECT id FROM item_assignments 
        WHERE item_id = $1 AND status = 'active'
      `, [id]);

      if (assignmentCheck.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete item that is currently assigned. Please unassign first.' 
        });
      }

      // Delete associated images from S3
      if (item.images) {
        const images = JSON.parse(item.images);
        for (const image of images) {
          await deleteImage(image.standardKey, image.thumbnailKey);
        }
      }

      // Delete item (cascading deletes will handle related records)
      await query(`DELETE FROM items WHERE id = $1 AND client_id = $2`, [id, clientId]);

      // Log deletion event
      await logEvent({
        clientId,
        eventType: 'deleted',
        itemId: id,
        userId,
        notes: `Item deleted: ${item.name}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Item deleted successfully' });

    } catch (error) {
      console.error('Delete item error:', error);
      res.status(500).json({ error: 'Failed to delete item' });
    }
  }
);

/**
 * GET /api/items/categories - Get all categories for client
 */
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const { clientId } = req.user;

    const result = await query(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM items
      WHERE client_id = $1
      GROUP BY category
      ORDER BY category
    `, [clientId]);

    res.json(result.rows);

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * POST /api/items/categories - Create a new category
 */
router.post('/categories',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Category name is required and must be less than 100 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { clientId } = req.user;
      const { name } = req.body;

      // Check if category already exists
      const existingCategory = await query(`
        SELECT category FROM items
        WHERE client_id = $1 AND category = $2
        LIMIT 1
      `, [clientId, name]);

      if (existingCategory.rows.length > 0) {
        return res.status(409).json({ error: 'Category already exists' });
      }

      // Log the category creation event
      await logEvent(clientId, req.user.id, 'category_created', {
        category: name
      });

      res.status(201).json({ 
        success: true, 
        message: 'Category created successfully',
        data: { name }
      });

    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
);

module.exports = router;