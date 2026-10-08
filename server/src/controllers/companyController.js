const Company = require('../models/Company');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');
const { inMemoryCompanies, inMemoryUsers } = require('../middleware/auth');
const { logAction } = require('../services/auditLogService');

// GET /api/company
const getCompany = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const company = await Company.findById(req.user.companyId);
      return res.json({ success: true, company });
    } else {
      const company = inMemoryCompanies.get(req.user.companyId) || { _id: req.user.companyId, name: 'Acme Operations Corp' };
      return res.json({ success: true, company });
    }
  } catch (error) {
    next(error);
  }
};

// PUT /api/company
const updateCompany = async (req, res, next) => {
  try {
    const { name, industry, companySize, country, description } = req.body;
    if (getIsConnected()) {
      const company = await Company.findByIdAndUpdate(
        req.user.companyId,
        { name, industry, companySize, country, description },
        { new: true }
      );
      await logAction({
        companyId: req.user.companyId,
        userId: req.user._id,
        userEmail: req.user.email,
        action: 'COMPANY_UPDATED',
        details: { name, industry }
      });
      return res.json({ success: true, company });
    } else {
      const company = inMemoryCompanies.get(req.user.companyId) || {};
      Object.assign(company, { name, industry, companySize, country, description });
      return res.json({ success: true, company });
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/company/users
const getUsers = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const users = await User.find({ companyId: req.user.companyId }).select('-password');
      return res.json({ success: true, users });
    } else {
      const users = Array.from(inMemoryUsers.values()).filter(u => String(u.companyId) === String(req.user.companyId));
      return res.json({ success: true, users });
    }
  } catch (error) {
    next(error);
  }
};

// POST /api/company/users
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (getIsConnected()) {
      const user = await User.create({
        name,
        email,
        password: password || 'DefaultPass123!',
        companyId: req.user.companyId,
        role: role || 'analyst'
      });
      await logAction({
        companyId: req.user.companyId,
        userId: req.user._id,
        userEmail: req.user.email,
        action: 'USER_CREATED',
        details: { email, role }
      });
      return res.status(201).json({ success: true, user: { id: user._id, name, email, role } });
    } else {
      const userId = 'usr_' + Date.now();
      const user = { _id: userId, name, email, companyId: req.user.companyId, role: role || 'analyst' };
      inMemoryUsers.set(userId, user);
      return res.status(201).json({ success: true, user });
    }
  } catch (error) {
    next(error);
  }
};

// PATCH /api/company/users/:id
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (getIsConnected()) {
      const user = await User.findOneAndUpdate(
        { _id: req.params.id, companyId: req.user.companyId },
        { role },
        { new: true }
      ).select('-password');
      await logAction({
        companyId: req.user.companyId,
        userId: req.user._id,
        userEmail: req.user.email,
        action: 'USER_ROLE_UPDATED',
        details: { targetUserId: req.params.id, role }
      });
      return res.json({ success: true, user });
    } else {
      const user = inMemoryUsers.get(req.params.id);
      if (user) user.role = role;
      return res.json({ success: true, user });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompany,
  updateCompany,
  getUsers,
  createUser,
  updateUserRole
};
