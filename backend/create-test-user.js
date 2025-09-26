const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createTestData() {
  const tenantId = uuidv4();
  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  console.log('Test tenant and user data:');
  console.log('Tenant ID:', tenantId);
  console.log('User ID:', userId);
  console.log('Email: admin@test.com');
  console.log('Password: admin123');
  console.log('Hashed Password:', hashedPassword);
  
  console.log('\nSQL to insert test data:');
  console.log(`INSERT INTO tenants (id, name, subdomain, contact_email) VALUES ('${tenantId}', 'Test Company', 'test', 'admin@test.com');`);
  console.log(`INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, role) VALUES ('${userId}', '${tenantId}', 'admin@test.com', '${hashedPassword}', 'Admin', 'User', 'tenant_admin');`);
}

createTestData().catch(console.error);