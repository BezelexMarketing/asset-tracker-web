const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import routes
const nfcRoutes = require('./routes/nfc');
const itemsRoutes = require('./routes/items');
const operatorsRoutes = require('./routes/operators');
const assignmentsRoutes = require('./routes/assignments');
const clientsRoutes = require('./routes/clients');
const actionLogsRoutes = require('./routes/actionLogs');

// Import middleware
const { authenticateToken } = require('./middleware/auth');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/nfc', nfcRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/operators', operatorsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/action-logs', actionLogsRoutes);

// Authentication routes
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password, tenantId } = req.body;

    if (!email || !password || !tenantId) {
      return res.status(400).json({ 
        error: 'Email, password, and tenant ID are required' 
      });
    }

    const { query } = require('./config/mock-database');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');

    // Get user with tenant verification
    const result = await query(`
      SELECT 
        u.id, u.email, u.password_hash, u.first_name, u.last_name, 
        u.role, u.status, u.last_login,
        t.id as tenant_id, t.name as tenant_name, t.status as tenant_status
      FROM users u
      JOIN tenants t ON u.tenant_id = t.id
      WHERE u.email = $1 AND u.tenant_id = $2
    `, [email, tenantId]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if user and tenant are active
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account is not active' });
    }

    if (user.tenant_status !== 'active') {
      return res.status(401).json({ error: 'Tenant account is not active' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await query(`
      UPDATE users SET last_login = NOW() WHERE id = $1
    `, [user.id]);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        tenantId: user.tenant_id,
        tenantName: user.tenant_name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Token validation endpoint
app.get('/api/auth/validate', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      tenantId: req.user.tenantId
    }
  });
});

// Tenant registration endpoint (for super admin)
app.post('/api/tenants', authLimiter, async (req, res) => {
  try {
    const { name, adminEmail, adminPassword, adminFirstName, adminLastName } = req.body;

    if (!name || !adminEmail || !adminPassword || !adminFirstName || !adminLastName) {
      return res.status(400).json({ 
        error: 'All fields are required' 
      });
    }

    const { query } = require('./config/database');
    const bcrypt = require('bcrypt');
    const { v4: uuidv4 } = require('uuid');

    // Check if tenant name or admin email already exists
    const existingCheck = await query(`
      SELECT 
        (SELECT COUNT(*) FROM tenants WHERE name = $1) as tenant_exists,
        (SELECT COUNT(*) FROM users WHERE email = $2) as email_exists
    `, [name, adminEmail]);

    const { tenant_exists, email_exists } = existingCheck.rows[0];

    if (parseInt(tenant_exists) > 0) {
      return res.status(400).json({ error: 'Tenant name already exists' });
    }

    if (parseInt(email_exists) > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create tenant
    const tenantResult = await query(`
      INSERT INTO tenants (name, status, settings)
      VALUES ($1, 'active', '{}')
      RETURNING id, created_at
    `, [name]);

    const tenantId = tenantResult.rows[0].id;

    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const userResult = await query(`
      INSERT INTO users (
        tenant_id, email, password_hash, first_name, last_name, 
        role, status
      )
      VALUES ($1, $2, $3, $4, $5, 'admin', 'active')
      RETURNING id
    `, [tenantId, adminEmail, passwordHash, adminFirstName, adminLastName]);

    res.status(201).json({
      tenant: {
        id: tenantId,
        name,
        createdAt: tenantResult.rows[0].created_at
      },
      admin: {
        id: userResult.rows[0].id,
        email: adminEmail,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Tenant registration error:', error);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../build/index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // Multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File size too large' });
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ error: 'Too many files' });
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected file field' });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Database errors
  if (error.code === '23505') { // Unique violation
    return res.status(400).json({ error: 'Duplicate entry' });
  }

  if (error.code === '23503') { // Foreign key violation
    return res.status(400).json({ error: 'Referenced record not found' });
  }

  // Default error response
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message 
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Export the app without starting the server
// Server startup is handled by server.js
module.exports = app;