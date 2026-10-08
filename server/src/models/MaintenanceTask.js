const mongoose = require('mongoose');

const maintenanceTaskSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  machineId: { type: String, required: true, index: true },
  machineName: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  maintenanceType: { 
    type: String, 
    enum: [
      'Preventive Maintenance', 
      'Predictive Maintenance', 
      'Corrective Maintenance', 
      'Inspection', 
      'Calibration', 
      'Cleaning', 
      'Lubrication', 
      'Component Replacement'
    ], 
    default: 'Preventive Maintenance',
    index: true 
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'High', index: true },
  status: { 
    type: String, 
    enum: ['Scheduled', 'In Progress', 'Completed', 'Overdue', 'Cancelled'], 
    default: 'Scheduled',
    index: true 
  },
  technician: { type: String, default: 'Lead Engineer' },
  assignedTo: { type: String, default: 'Lead Engineer' },
  scheduledDate: { type: Date, required: true, index: true },
  startTime: { type: String, default: '09:00 AM' },
  endTime: { type: String, default: '10:30 AM' },
  durationMinutes: { type: Number, default: 90 },
  reason: { type: String, default: '' },
  notes: { type: String, default: '' },
  completedDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MaintenanceTask', maintenanceTaskSchema);
