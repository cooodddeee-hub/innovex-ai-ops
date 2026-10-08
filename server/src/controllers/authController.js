const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Company = require('../models/Company');
const { getIsConnected } = require('../config/db');
const { inMemoryUsers, inMemoryCompanies } = require('../middleware/auth');
const { logAction } = require('../services/auditLogService');

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise-jwt-secret-key-2026-antigravity';

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      name: user.name,
      email: user.email, 
      companyId: user.companyId, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, companyName, industry, companySize, country, description } = req.body;

    if (!name || !email || !password || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and company name are required.',
        code: 'MISSING_FIELDS'
      });
    }

    if (getIsConnected()) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.',
          code: 'USER_EXISTS'
        });
      }

      const company = await Company.create({
        name: companyName,
        industry: industry || 'Technology & Operations',
        companySize: companySize || '50-200',
        country: country || 'US',
        description: description || ''
      });

      const user = await User.create({
        name,
        email,
        password,
        companyId: company._id,
        role: 'company_admin'
      });

      const token = generateToken(user);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      await logAction({
        companyId: company._id,
        userId: user._id,
        userEmail: user.email,
        action: 'USER_REGISTERED',
        details: { companyName, role: user.role }
      });

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: company._id
        },
        company
      });
    } else {
      // In-memory fallback
      const compId = 'comp_' + Date.now();
      const userId = 'usr_' + Date.now();

      const company = {
        _id: compId,
        name: companyName,
        industry: industry || 'Manufacturing & Logistics',
        companySize: companySize || '100-500',
        country: country || 'US',
        description: description || 'Enterprise Operations Center'
      };

      const user = {
        _id: userId,
        name,
        email,
        companyId: compId,
        role: 'company_admin'
      };

      inMemoryCompanies.set(compId, company);
      inMemoryUsers.set(userId, user);

      const token = generateToken(user);

      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: userId,
          name,
          email,
          role: 'company_admin',
          companyId: compId
        },
        company
      });
    }
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
        code: 'MISSING_FIELDS'
      });
    }

    if (getIsConnected()) {
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Please check email and password.',
          code: 'INVALID_CREDENTIALS'
        });
      }

      const company = await Company.findById(user.companyId);
      const token = generateToken(user);

      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      await logAction({
        companyId: user.companyId,
        userId: user._id,
        userEmail: user.email,
        action: 'USER_LOGIN',
        details: { email }
      });

      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId
        },
        company
      });
    } else {
      // In-memory fallback
      let user = Array.from(inMemoryUsers.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        // Create default user automatically for seamless in-memory initial testing
        const compId = 'comp_default_01';
        const userId = 'usr_default_01';
        const company = {
          _id: compId,
          name: 'Acme AI Operations Corp',
          industry: 'Smart Manufacturing',
          companySize: '500+',
          country: 'US',
          description: 'Global Operations Headquarters'
        };
        user = {
          _id: userId,
          name: nameFromEmail(email),
          email,
          companyId: compId,
          role: 'company_admin'
        };
        inMemoryCompanies.set(compId, company);
        inMemoryUsers.set(userId, user);
      }

      const company = inMemoryCompanies.get(user.companyId) || { _id: user.companyId, name: 'Enterprise Ops Inc' };
      const token = generateToken(user);

      res.cookie('token', token, { httpOnly: true });

      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId
        },
        company
      });
    }
  } catch (error) {
    next(error);
  }
};

function nameFromEmail(email) {
  const parts = email.split('@')[0].split('.');
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

// POST /api/auth/logout
const logout = (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.json({ success: true, message: 'Logged out successfully.' });
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    let company = null;
    if (getIsConnected()) {
      company = await Company.findById(req.user.companyId);
    } else {
      company = inMemoryCompanies.get(req.user.companyId) || { _id: req.user.companyId, name: 'Enterprise Operations Inc' };
    }

    return res.json({
      success: true,
      user: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        companyId: req.user.companyId
      },
      company
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe };
