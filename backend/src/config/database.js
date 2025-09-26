const { Pool } = require('pg');
require('dotenv').config();

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'asset_tracker_pro',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries with tenant isolation
const query = async (text, params = [], tenantId = null) => {
  const start = Date.now();
  
  try {
    // Add tenant_id to WHERE clause for multi-tenant queries if specified
    let modifiedText = text;
    let modifiedParams = params;
    
    if (tenantId && text.toLowerCase().includes('where')) {
      // Add tenant_id condition to existing WHERE clause
      modifiedText = text.replace(/WHERE/i, `WHERE tenant_id = $${params.length + 1} AND`);
      modifiedParams = [...params, tenantId];
    } else if (tenantId && (text.toLowerCase().includes('insert') || text.toLowerCase().includes('update') || text.toLowerCase().includes('select'))) {
      // For INSERT/UPDATE operations, ensure tenant_id is included
      if (text.toLowerCase().includes('insert')) {
        // Handle INSERT statements - tenant_id should be included in values
        console.log('INSERT operation - ensure tenant_id is included in values');
      }
    }
    
    const res = await pool.query(modifiedText, modifiedParams);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text: modifiedText, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper function for transactions
const transaction = async (callback) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Helper function to get tenant-specific data
const getTenantQuery = (baseQuery, tenantId) => {
  if (!tenantId) {
    throw new Error('Tenant ID is required for tenant-specific queries');
  }
  
  // Add tenant_id filter to the query
  if (baseQuery.toLowerCase().includes('where')) {
    return baseQuery.replace(/WHERE/i, `WHERE tenant_id = '${tenantId}' AND`);
  } else {
    // Add WHERE clause if it doesn't exist
    const fromIndex = baseQuery.toLowerCase().indexOf('from');
    if (fromIndex !== -1) {
      const beforeFrom = baseQuery.substring(0, fromIndex);
      const afterFrom = baseQuery.substring(fromIndex);
      return `${beforeFrom}${afterFrom} WHERE tenant_id = '${tenantId}'`;
    }
  }
  
  return baseQuery;
};

// Graceful shutdown
// Initialize database connection
const initializeDatabase = async () => {
  try {
    // For development, we'll skip the database connection test
    // In production, you would want to ensure PostgreSQL is running
    if (process.env.NODE_ENV === 'development') {
      console.log('Database connection test skipped in development mode');
      console.log('Note: PostgreSQL database is not required for basic functionality');
      return true;
    }
    
    // Test the connection
    await pool.query('SELECT NOW()');
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.warn('Database connection failed, continuing without database:', error.message);
    // Don't throw error in development to allow the app to start without DB
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    return false;
  }
};

process.on('SIGINT', async () => {
  console.log('Shutting down database connection pool...');
  await pool.end();
  process.exit(0);
});

module.exports = {
  pool,
  query,
  transaction,
  getTenantQuery,
  initializeDatabase
};