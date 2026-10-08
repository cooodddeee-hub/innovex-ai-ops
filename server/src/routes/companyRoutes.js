const express = require('express');
const router = express.Router();
const { getCompany, updateCompany, getUsers, createUser, updateUserRole } = require('../controllers/companyController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, getCompany);
router.put('/', requireAuth, requireRole('company_admin'), updateCompany);
router.get('/users', requireAuth, getUsers);
router.post('/users', requireAuth, requireRole('company_admin', 'manager'), createUser);
router.patch('/users/:id', requireAuth, requireRole('company_admin'), updateUserRole);

module.exports = router;
