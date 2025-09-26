import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable debugging
SQLite.DEBUG(true);
SQLite.enablePromise(true);

class DatabaseService {
  constructor() {
    this.database = null;
    this.isInitialized = false;
  }

  // Initialize database
  async initialize() {
    if (this.isInitialized) {
      return this.database;
    }

    try {
      this.database = await SQLite.openDatabase({
        name: 'AssetTrackerPro.db',
        location: 'default',
        createFromLocation: '~AssetTrackerPro.db'
      });

      await this.createTables();
      this.isInitialized = true;
      
      console.log('Database initialized successfully');
      return this.database;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  // Create database tables
  async createTables() {
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        avatar_url TEXT,
        phone TEXT,
        department TEXT,
        is_active INTEGER DEFAULT 1,
        permissions TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced_at TEXT,
        is_dirty INTEGER DEFAULT 0
      )`,

      // Items table
      `CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        serial_number TEXT,
        barcode TEXT,
        nfc_tag_id TEXT,
        qr_code TEXT,
        status TEXT NOT NULL DEFAULT 'available',
        condition_status TEXT DEFAULT 'good',
        location TEXT,
        purchase_date TEXT,
        purchase_price REAL,
        warranty_expiry TEXT,
        maintenance_schedule TEXT,
        image_urls TEXT,
        tenant_id TEXT NOT NULL,
        created_by TEXT,
        assigned_to TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced_at TEXT,
        is_dirty INTEGER DEFAULT 0
      )`,

      // Assignments table
      `CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        item_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        assigned_by TEXT NOT NULL,
        assigned_at TEXT NOT NULL,
        due_date TEXT,
        returned_at TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        location TEXT,
        tenant_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced_at TEXT,
        is_dirty INTEGER DEFAULT 0,
        FOREIGN KEY (item_id) REFERENCES items (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Audit logs table
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL,
        old_values TEXT,
        new_values TEXT,
        user_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at TEXT NOT NULL,
        synced_at TEXT,
        is_dirty INTEGER DEFAULT 0
      )`,

      // NFC scans table
      `CREATE TABLE IF NOT EXISTS nfc_scans (
        id TEXT PRIMARY KEY,
        tag_id TEXT NOT NULL,
        item_id TEXT,
        user_id TEXT NOT NULL,
        scan_type TEXT NOT NULL,
        location TEXT,
        metadata TEXT,
        tenant_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        synced_at TEXT,
        is_dirty INTEGER DEFAULT 0
      )`,

      // Sync queue table
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        action TEXT NOT NULL,
        data TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        last_error TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,

      // Settings table
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    ];

    for (const tableSQL of tables) {
      await this.database.executeSql(tableSQL);
    }

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_items_tenant_id ON items (tenant_id)',
      'CREATE INDEX IF NOT EXISTS idx_items_status ON items (status)',
      'CREATE INDEX IF NOT EXISTS idx_items_nfc_tag_id ON items (nfc_tag_id)',
      'CREATE INDEX IF NOT EXISTS idx_assignments_item_id ON assignments (item_id)',
      'CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON assignments (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments (status)',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id)',
      'CREATE INDEX IF NOT EXISTS idx_nfc_scans_tag_id ON nfc_scans (tag_id)',
      'CREATE INDEX IF NOT EXISTS idx_sync_queue_table ON sync_queue (table_name, record_id)'
    ];

    for (const indexSQL of indexes) {
      await this.database.executeSql(indexSQL);
    }
  }

  // Generic CRUD operations
  async insert(table, data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    
    try {
      const result = await this.database.executeSql(sql, values);
      return result[0].insertId;
    } catch (error) {
      console.error(`Insert failed for table ${table}:`, error);
      throw error;
    }
  }

  async update(table, data, whereClause, whereValues = []) {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), ...whereValues];

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    
    try {
      const result = await this.database.executeSql(sql, values);
      return result[0].rowsAffected;
    } catch (error) {
      console.error(`Update failed for table ${table}:`, error);
      throw error;
    }
  }

  async delete(table, whereClause, whereValues = []) {
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    
    try {
      const result = await this.database.executeSql(sql, whereValues);
      return result[0].rowsAffected;
    } catch (error) {
      console.error(`Delete failed for table ${table}:`, error);
      throw error;
    }
  }

  async select(table, columns = '*', whereClause = '', whereValues = [], orderBy = '', limit = '') {
    let sql = `SELECT ${columns} FROM ${table}`;
    
    if (whereClause) {
      sql += ` WHERE ${whereClause}`;
    }
    
    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`;
    }
    
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }

    try {
      const result = await this.database.executeSql(sql, whereValues);
      const rows = [];
      
      for (let i = 0; i < result[0].rows.length; i++) {
        rows.push(result[0].rows.item(i));
      }
      
      return rows;
    } catch (error) {
      console.error(`Select failed for table ${table}:`, error);
      throw error;
    }
  }

  // Specialized methods for each entity
  
  // Users
  async saveUser(user) {
    const userData = {
      ...user,
      permissions: JSON.stringify(user.permissions || {}),
      updated_at: new Date().toISOString(),
      is_dirty: 1
    };

    const existingUser = await this.select('users', '*', 'id = ?', [user.id]);
    
    if (existingUser.length > 0) {
      return await this.update('users', userData, 'id = ?', [user.id]);
    } else {
      userData.created_at = userData.updated_at;
      return await this.insert('users', userData);
    }
  }

  async getUsers(tenantId, filters = {}) {
    let whereClause = 'tenant_id = ?';
    let whereValues = [tenantId];

    if (filters.role) {
      whereClause += ' AND role = ?';
      whereValues.push(filters.role);
    }

    if (filters.isActive !== undefined) {
      whereClause += ' AND is_active = ?';
      whereValues.push(filters.isActive ? 1 : 0);
    }

    const users = await this.select('users', '*', whereClause, whereValues, 'name ASC');
    
    return users.map(user => ({
      ...user,
      permissions: JSON.parse(user.permissions || '{}'),
      is_active: Boolean(user.is_active)
    }));
  }

  // Items
  async saveItem(item) {
    const itemData = {
      ...item,
      image_urls: JSON.stringify(item.image_urls || []),
      updated_at: new Date().toISOString(),
      is_dirty: 1
    };

    const existingItem = await this.select('items', '*', 'id = ?', [item.id]);
    
    if (existingItem.length > 0) {
      return await this.update('items', itemData, 'id = ?', [item.id]);
    } else {
      itemData.created_at = itemData.updated_at;
      return await this.insert('items', itemData);
    }
  }

  async getItems(tenantId, filters = {}) {
    let whereClause = 'tenant_id = ?';
    let whereValues = [tenantId];

    if (filters.status) {
      whereClause += ' AND status = ?';
      whereValues.push(filters.status);
    }

    if (filters.category) {
      whereClause += ' AND category = ?';
      whereValues.push(filters.category);
    }

    if (filters.assignedTo) {
      whereClause += ' AND assigned_to = ?';
      whereValues.push(filters.assignedTo);
    }

    if (filters.search) {
      whereClause += ' AND (name LIKE ? OR description LIKE ? OR serial_number LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      whereValues.push(searchTerm, searchTerm, searchTerm);
    }

    const items = await this.select('items', '*', whereClause, whereValues, 'name ASC');
    
    return items.map(item => ({
      ...item,
      image_urls: JSON.parse(item.image_urls || '[]'),
      purchase_price: parseFloat(item.purchase_price || 0)
    }));
  }

  async getItemByNFCTag(tagId) {
    const items = await this.select('items', '*', 'nfc_tag_id = ?', [tagId]);
    
    if (items.length > 0) {
      const item = items[0];
      return {
        ...item,
        image_urls: JSON.parse(item.image_urls || '[]'),
        purchase_price: parseFloat(item.purchase_price || 0)
      };
    }
    
    return null;
  }

  // Assignments
  async saveAssignment(assignment) {
    const assignmentData = {
      ...assignment,
      updated_at: new Date().toISOString(),
      is_dirty: 1
    };

    const existingAssignment = await this.select('assignments', '*', 'id = ?', [assignment.id]);
    
    if (existingAssignment.length > 0) {
      return await this.update('assignments', assignmentData, 'id = ?', [assignment.id]);
    } else {
      assignmentData.created_at = assignmentData.updated_at;
      return await this.insert('assignments', assignmentData);
    }
  }

  async getAssignments(tenantId, filters = {}) {
    let whereClause = 'tenant_id = ?';
    let whereValues = [tenantId];

    if (filters.userId) {
      whereClause += ' AND user_id = ?';
      whereValues.push(filters.userId);
    }

    if (filters.itemId) {
      whereClause += ' AND item_id = ?';
      whereValues.push(filters.itemId);
    }

    if (filters.status) {
      whereClause += ' AND status = ?';
      whereValues.push(filters.status);
    }

    return await this.select('assignments', '*', whereClause, whereValues, 'assigned_at DESC');
  }

  // NFC Scans
  async saveNFCScan(scan) {
    const scanData = {
      ...scan,
      metadata: JSON.stringify(scan.metadata || {}),
      created_at: new Date().toISOString(),
      is_dirty: 1
    };

    return await this.insert('nfc_scans', scanData);
  }

  async getNFCScans(tenantId, filters = {}) {
    let whereClause = 'tenant_id = ?';
    let whereValues = [tenantId];

    if (filters.userId) {
      whereClause += ' AND user_id = ?';
      whereValues.push(filters.userId);
    }

    if (filters.tagId) {
      whereClause += ' AND tag_id = ?';
      whereValues.push(filters.tagId);
    }

    if (filters.scanType) {
      whereClause += ' AND scan_type = ?';
      whereValues.push(filters.scanType);
    }

    const scans = await this.select('nfc_scans', '*', whereClause, whereValues, 'created_at DESC');
    
    return scans.map(scan => ({
      ...scan,
      metadata: JSON.parse(scan.metadata || '{}')
    }));
  }

  // Audit Logs
  async saveAuditLog(log) {
    const logData = {
      ...log,
      old_values: JSON.stringify(log.old_values || {}),
      new_values: JSON.stringify(log.new_values || {}),
      created_at: new Date().toISOString(),
      is_dirty: 1
    };

    return await this.insert('audit_logs', logData);
  }

  // Sync operations
  async getDirtyRecords(table) {
    return await this.select(table, '*', 'is_dirty = 1');
  }

  async markAsSynced(table, recordId) {
    return await this.update(
      table,
      { is_dirty: 0, synced_at: new Date().toISOString() },
      'id = ?',
      [recordId]
    );
  }

  async addToSyncQueue(tableName, recordId, action, data) {
    const queueData = {
      id: `${tableName}_${recordId}_${Date.now()}`,
      table_name: tableName,
      record_id: recordId,
      action,
      data: JSON.stringify(data),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await this.insert('sync_queue', queueData);
  }

  async getSyncQueue() {
    const queue = await this.select('sync_queue', '*', '', [], 'created_at ASC');
    
    return queue.map(item => ({
      ...item,
      data: JSON.parse(item.data)
    }));
  }

  async removeSyncQueueItem(id) {
    return await this.delete('sync_queue', 'id = ?', [id]);
  }

  // Settings
  async saveSetting(key, value) {
    const settingData = {
      key,
      value: JSON.stringify(value),
      updated_at: new Date().toISOString()
    };

    const existing = await this.select('settings', '*', 'key = ?', [key]);
    
    if (existing.length > 0) {
      return await this.update('settings', settingData, 'key = ?', [key]);
    } else {
      return await this.insert('settings', settingData);
    }
  }

  async getSetting(key, defaultValue = null) {
    const settings = await this.select('settings', '*', 'key = ?', [key]);
    
    if (settings.length > 0) {
      return JSON.parse(settings[0].value);
    }
    
    return defaultValue;
  }

  // Utility methods
  async clearAllData() {
    const tables = ['users', 'items', 'assignments', 'audit_logs', 'nfc_scans', 'sync_queue'];
    
    for (const table of tables) {
      await this.delete(table, '1 = 1');
    }
  }

  async getOfflineData(type, filters = {}) {
    switch (type) {
      case 'users':
        return await this.getUsers(filters.tenantId, filters);
      case 'items':
        return await this.getItems(filters.tenantId, filters);
      case 'assignments':
        return await this.getAssignments(filters.tenantId, filters);
      case 'nfc_scans':
        return await this.getNFCScans(filters.tenantId, filters);
      default:
        return [];
    }
  }

  async saveOfflineData(type, data) {
    switch (type) {
      case 'user':
        return await this.saveUser(data);
      case 'item':
        return await this.saveItem(data);
      case 'assignment':
        return await this.saveAssignment(data);
      case 'nfc_scan':
        return await this.saveNFCScan(data);
      case 'audit_log':
        return await this.saveAuditLog(data);
      default:
        return false;
    }
  }

  // Close database connection
  async close() {
    if (this.database) {
      await this.database.close();
      this.database = null;
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;