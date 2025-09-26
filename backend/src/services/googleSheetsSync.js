const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

/**
 * Initialize Google Sheets connection
 * @param {string} spreadsheetId - Google Sheets ID
 * @param {string} tenantId - Tenant ID for authentication
 */
const initializeSheet = async (spreadsheetId, tenantId) => {
  try {
    // Create JWT auth from service account
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    // Initialize the sheet
    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();

    return doc;
  } catch (error) {
    console.error('Google Sheets initialization error:', error);
    throw error;
  }
};

/**
 * Get or create worksheet for events
 * @param {GoogleSpreadsheet} doc - Google Sheets document
 * @param {string} sheetName - Name of the worksheet
 */
const getOrCreateWorksheet = async (doc, sheetName = 'Asset Events') => {
  try {
    let sheet;
    
    // Try to find existing sheet
    sheet = doc.sheetsByTitle[sheetName];
    
    if (!sheet) {
      // Create new sheet if it doesn't exist
      sheet = await doc.addSheet({
        title: sheetName,
        headerValues: [
          'Timestamp',
          'Event Type',
          'Item Name',
          'Serial Number',
          'NFC Tag UID',
          'Operator Name',
          'Employee ID',
          'User Name',
          'User Role',
          'Location',
          'Notes',
          'Status',
          'Event ID'
        ]
      });
    } else {
      // Load existing sheet
      await sheet.loadHeaderRow();
      
      // Check if headers exist, if not add them
      if (!sheet.headerValues || sheet.headerValues.length === 0) {
        await sheet.setHeaderRow([
          'Timestamp',
          'Event Type',
          'Item Name',
          'Serial Number',
          'NFC Tag UID',
          'Operator Name',
          'Employee ID',
          'User Name',
          'User Role',
          'Location',
          'Notes',
          'Status',
          'Event ID'
        ]);
      }
    }

    return sheet;
  } catch (error) {
    console.error('Worksheet creation/retrieval error:', error);
    throw error;
  }
};

/**
 * Sync event data to Google Sheets
 * @param {Object} eventData - Event data to sync
 */
const syncToGoogleSheets = async (eventData) => {
  try {
    // Get tenant's Google Sheets configuration
    const { query } = require('../config/database');
    
    const tenantResult = await query(`
      SELECT google_sheets_id, google_sheets_enabled
      FROM tenants
      WHERE id = $1 AND google_sheets_enabled = true
    `, [eventData.tenantId]);

    if (tenantResult.rows.length === 0) {
      console.log('Google Sheets not enabled for tenant:', eventData.tenantId);
      return;
    }

    const { google_sheets_id: spreadsheetId } = tenantResult.rows[0];

    if (!spreadsheetId) {
      console.log('No Google Sheets ID configured for tenant:', eventData.tenantId);
      return;
    }

    // Initialize Google Sheets
    const doc = await initializeSheet(spreadsheetId, eventData.tenantId);
    const sheet = await getOrCreateWorksheet(doc);

    // Prepare row data
    const rowData = {
      'Timestamp': new Date(eventData.createdAt).toLocaleString(),
      'Event Type': eventData.eventType,
      'Item Name': eventData.item?.name || '',
      'Serial Number': eventData.item?.serial_number || '',
      'NFC Tag UID': eventData.nfcTagUid || '',
      'Operator Name': eventData.operator ? 
        `${eventData.operator.first_name} ${eventData.operator.last_name}` : '',
      'Employee ID': eventData.operator?.employee_id || '',
      'User Name': eventData.user ? 
        `${eventData.user.first_name} ${eventData.user.last_name}` : '',
      'User Role': eventData.user?.role || '',
      'Location': eventData.location || '',
      'Notes': eventData.notes || '',
      'Status': getEventStatus(eventData.eventType),
      'Event ID': eventData.id
    };

    // Add row to sheet
    await sheet.addRow(rowData);

    console.log('Event synced to Google Sheets:', eventData.id);

  } catch (error) {
    console.error('Google Sheets sync error:', error);
    // Don't throw error to prevent breaking the main flow
  }
};

/**
 * Get status based on event type
 * @param {string} eventType - Type of event
 */
const getEventStatus = (eventType) => {
  const statusMap = {
    'lookup': 'Viewed',
    'assign': 'Assigned',
    'unassign': 'Unassigned',
    'checkin': 'Checked In',
    'checkout': 'Checked Out',
    'maintenance': 'Maintenance',
    'created': 'Created',
    'updated': 'Updated',
    'deleted': 'Deleted'
  };

  return statusMap[eventType] || 'Unknown';
};

/**
 * Bulk sync events to Google Sheets (for initial setup or data migration)
 * @param {string} tenantId - Tenant ID
 * @param {Array} events - Array of events to sync
 */
const bulkSyncEvents = async (tenantId, events) => {
  try {
    const { query } = require('../config/database');
    
    const tenantResult = await query(`
      SELECT google_sheets_id, google_sheets_enabled
      FROM tenants
      WHERE id = $1 AND google_sheets_enabled = true
    `, [tenantId]);

    if (tenantResult.rows.length === 0) {
      throw new Error('Google Sheets not enabled for tenant');
    }

    const { google_sheets_id: spreadsheetId } = tenantResult.rows[0];

    // Initialize Google Sheets
    const doc = await initializeSheet(spreadsheetId, tenantId);
    const sheet = await getOrCreateWorksheet(doc);

    // Prepare bulk data
    const bulkData = events.map(eventData => ({
      'Timestamp': new Date(eventData.createdAt).toLocaleString(),
      'Event Type': eventData.eventType,
      'Item Name': eventData.item?.name || '',
      'Serial Number': eventData.item?.serial_number || '',
      'NFC Tag UID': eventData.nfcTagUid || '',
      'Operator Name': eventData.operator ? 
        `${eventData.operator.first_name} ${eventData.operator.last_name}` : '',
      'Employee ID': eventData.operator?.employee_id || '',
      'User Name': eventData.user ? 
        `${eventData.user.first_name} ${eventData.user.last_name}` : '',
      'User Role': eventData.user?.role || '',
      'Location': eventData.location || '',
      'Notes': eventData.notes || '',
      'Status': getEventStatus(eventData.eventType),
      'Event ID': eventData.id
    }));

    // Add rows in batches
    const batchSize = 100;
    for (let i = 0; i < bulkData.length; i += batchSize) {
      const batch = bulkData.slice(i, i + batchSize);
      await sheet.addRows(batch);
      console.log(`Synced batch ${Math.floor(i / batchSize) + 1} to Google Sheets`);
    }

    console.log(`Bulk sync completed: ${events.length} events`);

  } catch (error) {
    console.error('Bulk sync error:', error);
    throw error;
  }
};

/**
 * Create a new Google Sheet for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} tenantName - Tenant name for sheet title
 */
const createTenantSheet = async (tenantId, tenantName) => {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    // Create new spreadsheet
    const doc = new GoogleSpreadsheet();
    doc.useServiceAccountAuth(serviceAccountAuth);
    
    await doc.createNewSpreadsheetDocument({
      title: `${tenantName} - Asset Tracker Events`
    });

    // Create the events worksheet
    await getOrCreateWorksheet(doc);

    // Update tenant with Google Sheets ID
    const { query } = require('../config/database');
    await query(`
      UPDATE tenants 
      SET google_sheets_id = $1, google_sheets_enabled = true
      WHERE id = $2
    `, [doc.spreadsheetId, tenantId]);

    return doc.spreadsheetId;

  } catch (error) {
    console.error('Create tenant sheet error:', error);
    throw error;
  }
};

module.exports = {
  syncToGoogleSheets,
  bulkSyncEvents,
  createTenantSheet,
  initializeSheet,
  getOrCreateWorksheet
};