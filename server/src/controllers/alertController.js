const OperationalAlert = require('../models/OperationalAlert');
const { getIsConnected } = require('../config/db');
const { inMemoryAlerts } = require('./analysisController');

const getAlerts = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const alerts = await OperationalAlert.find({ companyId: req.user.companyId }).sort({ createdAt: -1 });
      return res.json({ success: true, alerts });
    } else {
      const alerts = inMemoryAlerts.filter(a => String(a.companyId) === String(req.user.companyId)).reverse();
      return res.json({ success: true, alerts });
    }
  } catch (error) {
    next(error);
  }
};

const updateAlertStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (getIsConnected()) {
      const alert = await OperationalAlert.findOneAndUpdate(
        { _id: req.params.id, companyId: req.user.companyId },
        { status },
        { new: true }
      );
      return res.json({ success: true, alert });
    } else {
      const alert = inMemoryAlerts.find(a => String(a._id) === String(req.params.id) && String(a.companyId) === String(req.user.companyId));
      if (alert) alert.status = status;
      return res.json({ success: true, alert });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getAlerts, updateAlertStatus };
