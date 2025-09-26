import AsyncStorage from '@react-native-async-storage/async-storage';
import { databaseService } from './DatabaseService';
import { apiService } from './ApiService';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncInProgress = new Set();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Main sync method
  async syncAll(tenantId, userId) {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return { success: false, message: 'Sync already in progress' };
    }

    this.isSyncing = true;
    
    try {
      console.log('Starting full sync...');
      
      const results = {
        users: { success: false, error: null },
        items: { success: false, error: null },
        assignments: { success: false, error: null },
        nfcScans: { success: false, error: null },
        auditLogs: { success: false, error: null }
      };

      // Sync in order of dependencies
      results.users = await this.syncUsers(tenantId);
      results.items = await this.syncItems(tenantId);
      results.assignments = await this.syncAssignments(tenantId);
      results.nfcScans = await this.syncNFCScans(tenantId);
      results.auditLogs = await this.syncAuditLogs(tenantId);

      // Update last sync time
      await AsyncStorage.setItem('@last_full_sync', new Date().toISOString());

      const successCount = Object.values(results).filter(r => r.success).length;
      const totalCount = Object.keys(results).length;

      console.log(`Sync completed: ${successCount}/${totalCount} successful`);

      return {
        success: successCount === totalCount,
        results,
        message: `Sync completed: ${successCount}/${totalCount} successful`
      };

    } catch (error) {
      console.error('Full sync failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Full sync failed'
      };
    } finally {
      this.isSyncing = false;
    }
  }

  // Sync users
  async syncUsers(tenantId) {
    try {
      console.log('Syncing users...');

      // Push local changes first
      const dirtyUsers = await databaseService.getDirtyRecords('users');
      for (const user of dirtyUsers) {
        try {
          if (user.synced_at) {
            // Update existing user
            await apiService.updateUser(user.id, user);
          } else {
            // Create new user
            const createdUser = await apiService.createUser(user);
            user.id = createdUser.id;
          }
          
          await databaseService.markAsSynced('users', user.id);
        } catch (error) {
          console.error(`Failed to sync user ${user.id}:`, error);
        }
      }

      // Pull remote changes
      const lastSync = await AsyncStorage.getItem('@last_users_sync');
      const remoteUsers = await apiService.getUsers(tenantId, {
        since: lastSync
      });

      for (const user of remoteUsers) {
        await databaseService.saveUser({
          ...user,
          is_dirty: 0,
          synced_at: new Date().toISOString()
        });
      }

      await AsyncStorage.setItem('@last_users_sync', new Date().toISOString());

      return { success: true };
    } catch (error) {
      console.error('Users sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync items
  async syncItems(tenantId) {
    try {
      console.log('Syncing items...');

      // Push local changes first
      const dirtyItems = await databaseService.getDirtyRecords('items');
      for (const item of dirtyItems) {
        try {
          if (item.synced_at) {
            // Update existing item
            await apiService.updateItem(item.id, item);
          } else {
            // Create new item
            const createdItem = await apiService.createItem(item);
            item.id = createdItem.id;
          }
          
          await databaseService.markAsSynced('items', item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
        }
      }

      // Pull remote changes
      const lastSync = await AsyncStorage.getItem('@last_items_sync');
      const remoteItems = await apiService.getItems(tenantId, {
        since: lastSync
      });

      for (const item of remoteItems) {
        await databaseService.saveItem({
          ...item,
          is_dirty: 0,
          synced_at: new Date().toISOString()
        });
      }

      await AsyncStorage.setItem('@last_items_sync', new Date().toISOString());

      return { success: true };
    } catch (error) {
      console.error('Items sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync assignments
  async syncAssignments(tenantId) {
    try {
      console.log('Syncing assignments...');

      // Push local changes first
      const dirtyAssignments = await databaseService.getDirtyRecords('assignments');
      for (const assignment of dirtyAssignments) {
        try {
          if (assignment.synced_at) {
            // Update existing assignment
            await apiService.updateAssignment(assignment.id, assignment);
          } else {
            // Create new assignment
            const createdAssignment = await apiService.createAssignment(assignment);
            assignment.id = createdAssignment.id;
          }
          
          await databaseService.markAsSynced('assignments', assignment.id);
        } catch (error) {
          console.error(`Failed to sync assignment ${assignment.id}:`, error);
        }
      }

      // Pull remote changes
      const lastSync = await AsyncStorage.getItem('@last_assignments_sync');
      const remoteAssignments = await apiService.getAssignments(tenantId, {
        since: lastSync
      });

      for (const assignment of remoteAssignments) {
        await databaseService.saveAssignment({
          ...assignment,
          is_dirty: 0,
          synced_at: new Date().toISOString()
        });
      }

      await AsyncStorage.setItem('@last_assignments_sync', new Date().toISOString());

      return { success: true };
    } catch (error) {
      console.error('Assignments sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync NFC scans
  async syncNFCScans(tenantId) {
    try {
      console.log('Syncing NFC scans...');

      // Push local changes (NFC scans are typically only created locally)
      const dirtyScans = await databaseService.getDirtyRecords('nfc_scans');
      for (const scan of dirtyScans) {
        try {
          await apiService.createNFCScan(scan);
          await databaseService.markAsSynced('nfc_scans', scan.id);
        } catch (error) {
          console.error(`Failed to sync NFC scan ${scan.id}:`, error);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('NFC scans sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync audit logs
  async syncAuditLogs(tenantId) {
    try {
      console.log('Syncing audit logs...');

      // Push local changes (audit logs are typically only created locally)
      const dirtyLogs = await databaseService.getDirtyRecords('audit_logs');
      for (const log of dirtyLogs) {
        try {
          await apiService.createAuditLog(log);
          await databaseService.markAsSynced('audit_logs', log.id);
        } catch (error) {
          console.error(`Failed to sync audit log ${log.id}:`, error);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Audit logs sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync pending actions from offline context
  async syncPendingActions(pendingActions) {
    const results = [];

    for (const action of pendingActions) {
      try {
        const result = await this.executeAction(action);
        results.push({ success: true, result });
      } catch (error) {
        console.error(`Failed to execute pending action ${action.id}:`, error);
        results.push({ success: false, error: error.message });
      }
    }

    return results;
  }

  // Execute a single action
  async executeAction(action) {
    const { type, data, method } = action;

    switch (type) {
      case 'user':
        return await this.executeUserAction(method, data);
      case 'item':
        return await this.executeItemAction(method, data);
      case 'assignment':
        return await this.executeAssignmentAction(method, data);
      case 'nfc_scan':
        return await this.executeNFCScanAction(method, data);
      case 'audit_log':
        return await this.executeAuditLogAction(method, data);
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }

  // Execute user actions
  async executeUserAction(method, data) {
    switch (method) {
      case 'create':
        return await apiService.createUser(data);
      case 'update':
        return await apiService.updateUser(data.id, data);
      case 'delete':
        return await apiService.deleteUser(data.id);
      default:
        throw new Error(`Unknown user action method: ${method}`);
    }
  }

  // Execute item actions
  async executeItemAction(method, data) {
    switch (method) {
      case 'create':
        return await apiService.createItem(data);
      case 'update':
        return await apiService.updateItem(data.id, data);
      case 'delete':
        return await apiService.deleteItem(data.id);
      case 'assign':
        return await apiService.assignItem(data.itemId, data.userId, data);
      case 'return':
        return await apiService.returnItem(data.assignmentId, data);
      default:
        throw new Error(`Unknown item action method: ${method}`);
    }
  }

  // Execute assignment actions
  async executeAssignmentAction(method, data) {
    switch (method) {
      case 'create':
        return await apiService.createAssignment(data);
      case 'update':
        return await apiService.updateAssignment(data.id, data);
      case 'complete':
        return await apiService.completeAssignment(data.id, data);
      default:
        throw new Error(`Unknown assignment action method: ${method}`);
    }
  }

  // Execute NFC scan actions
  async executeNFCScanAction(method, data) {
    switch (method) {
      case 'create':
        return await apiService.createNFCScan(data);
      default:
        throw new Error(`Unknown NFC scan action method: ${method}`);
    }
  }

  // Execute audit log actions
  async executeAuditLogAction(method, data) {
    switch (method) {
      case 'create':
        return await apiService.createAuditLog(data);
      default:
        throw new Error(`Unknown audit log action method: ${method}`);
    }
  }

  // Incremental sync for specific entity
  async syncEntity(entityType, tenantId, options = {}) {
    if (this.syncInProgress.has(entityType)) {
      console.log(`${entityType} sync already in progress`);
      return { success: false, message: 'Sync already in progress' };
    }

    this.syncInProgress.add(entityType);

    try {
      let result;
      
      switch (entityType) {
        case 'users':
          result = await this.syncUsers(tenantId);
          break;
        case 'items':
          result = await this.syncItems(tenantId);
          break;
        case 'assignments':
          result = await this.syncAssignments(tenantId);
          break;
        case 'nfc_scans':
          result = await this.syncNFCScans(tenantId);
          break;
        case 'audit_logs':
          result = await this.syncAuditLogs(tenantId);
          break;
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }

      return result;
    } catch (error) {
      console.error(`${entityType} sync failed:`, error);
      return { success: false, error: error.message };
    } finally {
      this.syncInProgress.delete(entityType);
    }
  }

  // Quick sync - only push local changes
  async quickSync(tenantId) {
    try {
      console.log('Starting quick sync...');

      const results = [];

      // Get all dirty records
      const dirtyUsers = await databaseService.getDirtyRecords('users');
      const dirtyItems = await databaseService.getDirtyRecords('items');
      const dirtyAssignments = await databaseService.getDirtyRecords('assignments');
      const dirtyScans = await databaseService.getDirtyRecords('nfc_scans');
      const dirtyLogs = await databaseService.getDirtyRecords('audit_logs');

      // Push all dirty records
      const allDirtyRecords = [
        ...dirtyUsers.map(r => ({ ...r, type: 'user' })),
        ...dirtyItems.map(r => ({ ...r, type: 'item' })),
        ...dirtyAssignments.map(r => ({ ...r, type: 'assignment' })),
        ...dirtyScans.map(r => ({ ...r, type: 'nfc_scan' })),
        ...dirtyLogs.map(r => ({ ...r, type: 'audit_log' }))
      ];

      for (const record of allDirtyRecords) {
        try {
          const action = {
            type: record.type,
            method: record.synced_at ? 'update' : 'create',
            data: record
          };

          await this.executeAction(action);
          await databaseService.markAsSynced(record.type + 's', record.id);
          results.push({ success: true, id: record.id, type: record.type });
        } catch (error) {
          console.error(`Failed to quick sync ${record.type} ${record.id}:`, error);
          results.push({ success: false, id: record.id, type: record.type, error: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`Quick sync completed: ${successCount}/${results.length} successful`);

      return {
        success: successCount === results.length,
        results,
        message: `Quick sync completed: ${successCount}/${results.length} successful`
      };

    } catch (error) {
      console.error('Quick sync failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Quick sync failed'
      };
    }
  }

  // Get sync status
  async getSyncStatus() {
    try {
      const lastFullSync = await AsyncStorage.getItem('@last_full_sync');
      const lastUsersSync = await AsyncStorage.getItem('@last_users_sync');
      const lastItemsSync = await AsyncStorage.getItem('@last_items_sync');
      const lastAssignmentsSync = await AsyncStorage.getItem('@last_assignments_sync');

      const dirtyUsers = await databaseService.getDirtyRecords('users');
      const dirtyItems = await databaseService.getDirtyRecords('items');
      const dirtyAssignments = await databaseService.getDirtyRecords('assignments');
      const dirtyScans = await databaseService.getDirtyRecords('nfc_scans');
      const dirtyLogs = await databaseService.getDirtyRecords('audit_logs');

      const totalPendingChanges = dirtyUsers.length + dirtyItems.length + 
                                 dirtyAssignments.length + dirtyScans.length + dirtyLogs.length;

      return {
        lastFullSync: lastFullSync ? new Date(lastFullSync) : null,
        lastSyncTimes: {
          users: lastUsersSync ? new Date(lastUsersSync) : null,
          items: lastItemsSync ? new Date(lastItemsSync) : null,
          assignments: lastAssignmentsSync ? new Date(lastAssignmentsSync) : null
        },
        pendingChanges: {
          users: dirtyUsers.length,
          items: dirtyItems.length,
          assignments: dirtyAssignments.length,
          nfcScans: dirtyScans.length,
          auditLogs: dirtyLogs.length,
          total: totalPendingChanges
        },
        isSyncing: this.isSyncing,
        syncInProgress: Array.from(this.syncInProgress)
      };
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return null;
    }
  }

  // Reset sync state
  async resetSyncState() {
    try {
      await AsyncStorage.multiRemove([
        '@last_full_sync',
        '@last_users_sync',
        '@last_items_sync',
        '@last_assignments_sync'
      ]);

      // Mark all records as dirty to force re-sync
      await databaseService.database.executeSql(
        'UPDATE users SET is_dirty = 1, synced_at = NULL'
      );
      await databaseService.database.executeSql(
        'UPDATE items SET is_dirty = 1, synced_at = NULL'
      );
      await databaseService.database.executeSql(
        'UPDATE assignments SET is_dirty = 1, synced_at = NULL'
      );
      await databaseService.database.executeSql(
        'UPDATE nfc_scans SET is_dirty = 1, synced_at = NULL'
      );
      await databaseService.database.executeSql(
        'UPDATE audit_logs SET is_dirty = 1, synced_at = NULL'
      );

      console.log('Sync state reset successfully');
      return true;
    } catch (error) {
      console.error('Failed to reset sync state:', error);
      return false;
    }
  }

  // Conflict resolution
  async resolveConflict(entityType, localRecord, remoteRecord, resolution = 'remote') {
    try {
      let resolvedRecord;

      switch (resolution) {
        case 'local':
          resolvedRecord = localRecord;
          break;
        case 'remote':
          resolvedRecord = remoteRecord;
          break;
        case 'merge':
          resolvedRecord = this.mergeRecords(localRecord, remoteRecord);
          break;
        default:
          throw new Error(`Unknown conflict resolution: ${resolution}`);
      }

      // Save resolved record
      await databaseService.saveOfflineData(entityType, {
        ...resolvedRecord,
        is_dirty: resolution === 'local' ? 1 : 0,
        synced_at: resolution === 'remote' ? new Date().toISOString() : null
      });

      return resolvedRecord;
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      throw error;
    }
  }

  // Merge two records (simple field-level merge)
  mergeRecords(localRecord, remoteRecord) {
    const merged = { ...remoteRecord };

    // Prefer local changes for certain fields
    const localPreferredFields = ['notes', 'location'];
    
    for (const field of localPreferredFields) {
      if (localRecord[field] && localRecord[field] !== remoteRecord[field]) {
        merged[field] = localRecord[field];
      }
    }

    // Use latest timestamp for updated_at
    if (new Date(localRecord.updated_at) > new Date(remoteRecord.updated_at)) {
      merged.updated_at = localRecord.updated_at;
    }

    return merged;
  }
}

// Export singleton instance
export const syncService = new SyncService();
export default syncService;