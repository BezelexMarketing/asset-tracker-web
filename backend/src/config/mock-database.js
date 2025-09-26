const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Mock in-memory database for testing
const mockDatabase = {
  tenants: [],
  users: []
};

// Initialize with test data
async function initializeMockData() {
  const tenantId = 'c49283ae-cb7f-48fc-b85d-b7702f140ded';
  const userId = 'c6f31208-d44d-4f9d-a5b5-eb94e0479bd2';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Add test tenant
  mockDatabase.tenants.push({
    id: tenantId,
    name: 'Test Company',
    subdomain: 'test',
    contact_email: 'admin@test.com',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  });

  // Add test user
  mockDatabase.users.push({
    id: userId,
    tenant_id: tenantId,
    email: 'admin@test.com',
    password_hash: hashedPassword,
    first_name: 'Admin',
    last_name: 'User',
    role: 'tenant_admin',
    is_active: true,
    last_login: null,
    created_at: new Date(),
    updated_at: new Date()
  });

  console.log('Mock database initialized with test data');
}

// Mock query function
const query = async (text, params = [], tenantId = null) => {
  console.log('Mock query:', text, params);
  
  // Handle login query
  if (text.includes('SELECT') && text.includes('users') && text.includes('tenants')) {
    const email = params[0];
    const tenantId = params[1];
    
    console.log('Looking for user with email:', email, 'and tenantId:', tenantId);
    console.log('Available users:', mockDatabase.users.map(u => ({ email: u.email, tenant_id: u.tenant_id })));
    
    // Find user by email and tenant ID
    const user = mockDatabase.users.find(u => u.email === email && u.tenant_id === tenantId);
    if (!user) {
      console.log('User not found');
      return { rows: [] };
    }
    
    console.log('User found:', user.email);
    
    // Find associated tenant
    const tenant = mockDatabase.tenants.find(t => t.id === user.tenant_id);
    if (!tenant) {
      console.log('Tenant not found');
      return { rows: [] };
    }

    // Return combined user and tenant data
    return {
      rows: [{
        id: user.id,
        tenant_id: user.tenant_id,
        email: user.email,
        password_hash: user.password_hash,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        status: user.is_active ? 'active' : 'inactive',
        last_login: user.last_login,
        tenant_name: tenant.name,
        tenant_status: tenant.is_active ? 'active' : 'inactive'
      }]
    };
  }
  
  // Handle auth middleware user verification query
  if (text.includes('SELECT') && text.includes('users') && text.includes('WHERE u.id = $1')) {
    const userId = params[0];
    const user = mockDatabase.users.find(u => u.id === userId && u.is_active);
    if (!user) {
      return { rows: [] };
    }
    
    const tenant = mockDatabase.tenants.find(t => t.id === user.tenant_id);
    return {
      rows: [{
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
        tenant_name: tenant ? tenant.name : 'Test Tenant',
        subdomain: tenant ? tenant.subdomain : 'test',
        tenant_active: tenant ? tenant.is_active : true
      }]
    };
  }
  
  // Handle items query
  if (text.includes('SELECT') && text.includes('items')) {
    // Return empty items for now - this will show "offline" status
    return { rows: [] };
  }
  
  // Handle update last_login query
  if (text.includes('UPDATE users') && text.includes('last_login')) {
    const userId = params[1];
    const user = mockDatabase.users.find(u => u.id === userId);
    if (user) {
      user.last_login = new Date();
    }
    return { rowCount: 1 };
  }
  
  // Default empty result for other queries
  return { rows: [], rowCount: 0 };
};

// Mock transaction function
const transaction = async (callback) => {
  try {
    return await callback(query);
  } catch (error) {
    throw error;
  }
};

// Initialize mock data immediately (synchronously)
const tenantId = 'demo';
const userId = 'c6f31208-d44d-4f9d-a5b5-eb94e0479bd2';

// Add test tenant
mockDatabase.tenants.push({
  id: tenantId,
  name: 'Test Company',
  subdomain: 'test',
  contact_email: 'admin@test.com',
  is_active: true,
  created_at: new Date(),
  updated_at: new Date()
});

// Add test user with pre-hashed password
mockDatabase.users.push({
  id: userId,
  tenant_id: tenantId,
  email: 'admin@test.com',
  password_hash: '$2a$10$7VBKWfIKulArwAfi.dlvWOzQeQVFAtTOdka10KB4i5ogrq2eC2gVq', // "admin123"
  first_name: 'Admin',
  last_name: 'User',
  role: 'tenant_admin',
  is_active: true,
  last_login: null,
  created_at: new Date(),
  updated_at: new Date()
});

console.log('Mock database initialized with test data');
console.log('Test user:', mockDatabase.users[0].email, 'Tenant ID:', mockDatabase.users[0].tenant_id);

module.exports = {
  query,
  transaction,
  pool: null // Mock pool
};