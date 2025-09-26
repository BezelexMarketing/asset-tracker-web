const jwt = require('jsonwebtoken');
const { query } = require('../config/mock-database');

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'TOKEN_MISSING'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and is active
    const userResult = await query(
      `SELECT u.*, t.name as tenant_name, t.subdomain, t.is_active as tenant_active
       FROM users u 
       JOIN tenants t ON u.tenant_id = t.id 
       WHERE u.id = $1 AND u.is_active = true`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        error: 'User not found or inactive',
        code: 'USER_INACTIVE'
      });
    }

    const user = userResult.rows[0];

    if (!user.tenant_active) {
      return res.status(401).json({ 
        error: 'Tenant account is inactive',
        code: 'TENANT_INACTIVE'
      });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      tenantId: user.tenant_id,
      tenantName: user.tenant_name,
      tenantSubdomain: user.subdomain
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

// Role-based authorization middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Tenant isolation middleware - ensures user can only access their tenant's data
const requireTenantAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  // Add tenant ID to request for use in queries
  req.tenantId = req.user.tenantId;
  
  next();
};

// Super admin only middleware
const requireSuperAdmin = requireRole(['super_admin']);

// Admin access (super_admin or tenant_admin)
const requireAdmin = requireRole(['super_admin', 'tenant_admin']);

// Operator access (admin or operator)
const requireOperator = requireRole(['super_admin', 'tenant_admin', 'operator']);

// Any authenticated user
const requireAuth = requireRole(['super_admin', 'tenant_admin', 'operator', 'viewer']);

// Generate JWT token
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenant_id
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Refresh token validation
const validateRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    // Check if refresh token exists in database (if you're storing them)
    const result = await query(
      'SELECT id FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireTenantAccess,
  requireSuperAdmin,
  requireAdmin,
  requireOperator,
  requireAuth,
  generateToken,
  validateRefreshToken
};