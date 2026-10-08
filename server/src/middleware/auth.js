const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise-jwt-secret-key-2026-antigravity';

// In-memory user cache fallback when DB is disconnected
const inMemoryUsers = new Map();
const inMemoryCompanies = new Map();

const requireAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Token missing.',
      code: 'UNAUTHORIZED'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if real DB is connected
    const User = require('../models/User');
    const { getIsConnected } = require('../config/db');
    
    if (getIsConnected()) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User no longer exists.', code: 'USER_NOT_FOUND' });
      }
      req.user = user;
    } else {
      // Fallback for in-memory session user
      if (inMemoryUsers.has(decoded.id)) {
        req.user = inMemoryUsers.get(decoded.id);
      } else {
        req.user = {
          _id: decoded.id,
          name: decoded.name || 'Enterprise Admin',
          email: decoded.email || 'admin@company.com',
          companyId: decoded.companyId || 'company_default_01',
          role: decoded.role || 'company_admin'
        };
      }
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid or expired token.',
      code: 'INVALID_TOKEN'
    });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user ? req.user.role : 'none'}' does not have permission for this resource. Required: ${roles.join(', ')}.`,
        code: 'FORBIDDEN_ROLE'
      });
    }
    next();
  };
};

module.exports = { requireAuth, requireRole, inMemoryUsers, inMemoryCompanies };
