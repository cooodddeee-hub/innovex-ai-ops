const mongoose = require('mongoose');

const sparePartSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  partNumber: { type: String, required: true },
  partName: { type: String, required: true },
  requiredQuantity: { type: Number, default: 0 },
  availableQuantity: { type: Number, default: 0 },
  minimumStock: { type: Number, default: 5 },
  supplier: { type: String, default: 'Industrial Components Inc.' },
  leadTimeDays: { type: Number, default: 3 },
  unitCost: { type: Number, default: 120.00 },
  relatedMachines: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SparePart', sparePartSchema);
