const MaintenanceTask = require('../models/MaintenanceTask');
const SparePart = require('../models/SparePart');
const Analysis = require('../models/Analysis');
const { getIsConnected } = require('../config/db');
const { inMemoryAnalyses } = require('./analysisController');

// Helper to construct sample dates relative to today
const today = new Date();
const formatDate = (offsetDays) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d;
};

// Seed initial realistic maintenance tasks for in-memory mode
const inMemoryTasks = [
  {
    _id: 'task_cal_101',
    companyId: 'comp_default_01',
    machineId: 'M-104',
    machineName: 'Turbine Compressor M-104',
    title: 'Bearing Inspection & Lubrication',
    description: 'Vibration trend spike detected (+42%). Inspect bearing assembly and check thermal drift.',
    maintenanceType: 'Predictive Maintenance',
    priority: 'Critical',
    status: 'Scheduled',
    technician: 'Dr. Marcus Vance',
    assignedTo: 'Dr. Marcus Vance',
    scheduledDate: formatDate(1), // Tomorrow
    startTime: '09:30 AM',
    endTime: '11:00 AM',
    durationMinutes: 90,
    reason: 'High predicted maintenance risk (Health Score: 42/100)',
    notes: 'Bring spare bearing BRG-6205-2RS if replacement is required.',
    createdAt: new Date()
  },
  {
    _id: 'task_cal_102',
    companyId: 'comp_default_01',
    machineId: 'M-102',
    machineName: 'Hydraulic Press M-102',
    title: 'Hydraulic Seal & Pressure Calibration',
    description: 'Routine quarterly hydraulic line pressure and seal seal checks.',
    maintenanceType: 'Preventive Maintenance',
    priority: 'High',
    status: 'Scheduled',
    technician: 'Sarah Jenkins',
    assignedTo: 'Sarah Jenkins',
    scheduledDate: formatDate(0), // Today
    startTime: '02:00 PM',
    endTime: '03:30 PM',
    durationMinutes: 90,
    reason: 'Scheduled quarterly preventive protocol',
    notes: 'Verify seal gasket integrity.',
    createdAt: new Date()
  },
  {
    _id: 'task_cal_103',
    companyId: 'comp_default_01',
    machineId: 'M-101',
    machineName: 'CNC Milling Line A',
    title: 'Spindle Alignment & Filter Cleaning',
    description: 'Clean air intake filters and check spindle runout.',
    maintenanceType: 'Inspection',
    priority: 'Medium',
    status: 'Completed',
    technician: 'Robert Chen',
    assignedTo: 'Robert Chen',
    scheduledDate: formatDate(-2), // 2 days ago
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    durationMinutes: 90,
    reason: 'Routine inspection',
    completedDate: formatDate(-2),
    createdAt: new Date()
  },
  {
    _id: 'task_cal_104',
    companyId: 'comp_default_01',
    machineId: 'M-103',
    machineName: 'Robotic Arm Line C',
    title: 'Joint Actuator Calibration',
    description: 'Calibrate joint multi-axis positioning accuracy.',
    maintenanceType: 'Calibration',
    priority: 'High',
    status: 'Scheduled',
    technician: 'Dr. Marcus Vance',
    assignedTo: 'Dr. Marcus Vance',
    scheduledDate: formatDate(-1), // Yesterday (Overdue!)
    startTime: '08:00 AM',
    endTime: '09:30 AM',
    durationMinutes: 90,
    reason: 'Axis position drift detected',
    createdAt: new Date()
  },
  {
    _id: 'task_cal_105',
    companyId: 'comp_default_01',
    machineId: 'M-105',
    machineName: 'Conveyor Motor M-105',
    title: 'Motor Drive Lubrication & Belt Tensioning',
    description: 'Check conveyor belt tension and lubricate motor bearings.',
    maintenanceType: 'Lubrication',
    priority: 'Low',
    status: 'Scheduled',
    technician: 'Sarah Jenkins',
    assignedTo: 'Sarah Jenkins',
    scheduledDate: formatDate(4), // 4 days from now
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    durationMinutes: 60,
    reason: 'Preventive monthly lubrication',
    createdAt: new Date()
  }
];

const inMemorySpareParts = [
  {
    _id: 'sp_101',
    partNumber: 'BRG-6205-2RS',
    partName: 'Deep Groove Ball Bearing 6205',
    requiredQuantity: 2,
    availableQuantity: 1, // Shortage!
    minimumStock: 5,
    supplier: 'Apex Precision Bearings',
    leadTimeDays: 2,
    unitCost: 45.00,
    relatedMachines: ['M-104', 'M-101']
  },
  {
    _id: 'sp_102',
    partNumber: 'SEAL-45-70-10',
    partName: 'Nitrile Rotary Shaft Seal',
    requiredQuantity: 4,
    availableQuantity: 10,
    minimumStock: 8,
    supplier: 'Vortex Seals Co.',
    leadTimeDays: 3,
    unitCost: 18.50,
    relatedMachines: ['M-104', 'M-102']
  }
];

// Helper to update overdue status dynamically
const processTaskOverdue = (task) => {
  if (!task) return task;
  const now = new Date();
  const sched = new Date(task.scheduledDate);
  
  // If scheduled date < today (start of today) and status is Scheduled -> compute as Overdue
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const schedDayStart = new Date(sched.getFullYear(), sched.getMonth(), sched.getDate());
  
  if (schedDayStart < todayStart && task.status === 'Scheduled') {
    return { ...task, status: 'Overdue' };
  }
  return task;
};

// GET /api/maintenance/assets
const getAssets = async (req, res, next) => {
  try {
    let maintAnalysis = null;
    if (getIsConnected()) {
      maintAnalysis = await Analysis.findOne({ companyId: req.user.companyId, module: 'maintenance', hasSufficientData: true }).sort({ createdAt: -1 });
    } else {
      maintAnalysis = inMemoryAnalyses.find(a => String(a.companyId) === String(req.user.companyId) && a.module === 'maintenance' && a.hasSufficientData);
    }

    if (!maintAnalysis) {
      return res.json({
        success: true,
        hasSufficientData: false,
        message: 'Insufficient data for predictive maintenance analysis. Upload a machine maintenance dataset.'
      });
    }

    return res.json({
      success: true,
      hasSufficientData: true,
      results: maintAnalysis.results
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/maintenance/assets/:id
const getAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let maintAnalysis = null;
    if (getIsConnected()) {
      maintAnalysis = await Analysis.findOne({ companyId: req.user.companyId, module: 'maintenance', hasSufficientData: true }).sort({ createdAt: -1 });
    } else {
      maintAnalysis = inMemoryAnalyses.find(a => String(a.companyId) === String(req.user.companyId) && a.module === 'maintenance' && a.hasSufficientData);
    }

    if (!maintAnalysis || !maintAnalysis.results || !maintAnalysis.results.machines) {
      return res.status(404).json({ success: false, message: 'Machine asset twin not found.' });
    }

    const machine = maintAnalysis.results.machines.find(m => String(m.machine_id).toLowerCase() === String(id).toLowerCase());
    if (!machine) {
      return res.status(404).json({ success: false, message: `Asset ${id} not found in analyzed machine dataset.` });
    }

    let spareParts = [];
    if (getIsConnected()) {
      spareParts = await SparePart.find({ companyId: req.user.companyId, relatedMachines: machine.machine_id });
    } else {
      spareParts = inMemorySpareParts.filter(sp => sp.relatedMachines.includes(machine.machine_id));
    }

    return res.json({
      success: true,
      asset: machine,
      spareParts,
      failureModelUsed: maintAnalysis.results.failure_model_used,
      hasFailureLabels: maintAnalysis.results.has_failure_labels
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/maintenance/tasks (or Calendar Tasks)
const getTasks = async (req, res, next) => {
  try {
    const { machineId, status, priority, maintenanceType, technician, search } = req.query;

    let rawTasks = [];
    if (getIsConnected()) {
      rawTasks = await MaintenanceTask.find({ companyId: req.user.companyId }).sort({ scheduledDate: 1 });
      // Convert mongoose docs to objects
      rawTasks = rawTasks.map(t => t.toObject());
    } else {
      rawTasks = inMemoryTasks.filter(t => String(t.companyId) === String(req.user.companyId) || t.companyId === 'comp_default_01');
    }

    // Process Overdue status dynamically
    let processedTasks = rawTasks.map(processTaskOverdue);

    // Apply Filters
    if (machineId && machineId !== 'ALL') {
      processedTasks = processedTasks.filter(t => String(t.machineId).toLowerCase() === String(machineId).toLowerCase());
    }
    if (status && status !== 'ALL') {
      processedTasks = processedTasks.filter(t => t.status === status);
    }
    if (priority && priority !== 'ALL') {
      processedTasks = processedTasks.filter(t => t.priority === priority);
    }
    if (maintenanceType && maintenanceType !== 'ALL') {
      processedTasks = processedTasks.filter(t => t.maintenanceType === maintenanceType);
    }
    if (technician && technician !== 'ALL') {
      processedTasks = processedTasks.filter(t => (t.technician || t.assignedTo || '').toLowerCase().includes(technician.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      processedTasks = processedTasks.filter(t => 
        (t.title || '').toLowerCase().includes(q) ||
        (t.machineId || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.reason || '').toLowerCase().includes(q)
      );
    }

    // Compute Summary KPIs from processed tasks
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const stats = {
      todaysCount: processedTasks.filter(t => new Date(t.scheduledDate).toISOString().split('T')[0] === todayStr && t.status !== 'Cancelled').length,
      upcomingCount: processedTasks.filter(t => new Date(t.scheduledDate) >= now && ['Scheduled', 'In Progress'].includes(t.status)).length,
      overdueCount: processedTasks.filter(t => t.status === 'Overdue').length,
      completedCount: processedTasks.filter(t => t.status === 'Completed').length,
      highPriorityCount: processedTasks.filter(t => ['High', 'Critical'].includes(t.priority) && t.status !== 'Completed' && t.status !== 'Cancelled').length
    };

    return res.json({
      success: true,
      tasks: processedTasks,
      stats
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/maintenance/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let task = null;

    if (getIsConnected()) {
      task = await MaintenanceTask.findOne({ _id: id, companyId: req.user.companyId });
      if (task) task = task.toObject();
    } else {
      task = inMemoryTasks.find(t => String(t._id) === String(id));
    }

    if (!task) {
      return res.status(404).json({ success: false, message: 'Maintenance task event not found.' });
    }

    task = processTaskOverdue(task);
    return res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// POST /api/maintenance/tasks
const createTask = async (req, res, next) => {
  try {
    const { 
      machineId, 
      machineName,
      title, 
      description, 
      maintenanceType,
      priority, 
      scheduledDate, 
      startTime,
      endTime,
      durationMinutes,
      technician,
      assignedTo,
      reason,
      notes
    } = req.body;

    if (!machineId || !scheduledDate || !title) {
      return res.status(400).json({
        success: false,
        message: 'Machine ID, Title, and Scheduled Date are required fields.',
        code: 'MISSING_FIELDS'
      });
    }

    const taskObj = {
      companyId: req.user.companyId,
      machineId: String(machineId).toUpperCase(),
      machineName: machineName || `Asset ${machineId}`,
      title,
      description: description || '',
      maintenanceType: maintenanceType || 'Preventive Maintenance',
      priority: priority || 'High',
      scheduledDate: new Date(scheduledDate),
      startTime: startTime || '09:00 AM',
      endTime: endTime || '10:30 AM',
      durationMinutes: durationMinutes ? Number(durationMinutes) : 90,
      technician: technician || assignedTo || 'Lead Engineer',
      assignedTo: assignedTo || technician || 'Lead Engineer',
      reason: reason || 'Scheduled preventive maintenance protocol',
      notes: notes || '',
      status: 'Scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let savedTask;
    if (getIsConnected()) {
      savedTask = await MaintenanceTask.create(taskObj);
      savedTask = savedTask.toObject();
    } else {
      taskObj._id = 'task_' + Date.now();
      inMemoryTasks.push(taskObj);
      savedTask = taskObj;
    }

    return res.status(201).json({ success: true, task: savedTask });
  } catch (error) {
    next(error);
  }
};

// PUT/PATCH /api/maintenance/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    if (updateData.scheduledDate) {
      updateData.scheduledDate = new Date(updateData.scheduledDate);
    }
    if (updateData.status === 'Completed' && !updateData.completedDate) {
      updateData.completedDate = new Date();
    }

    let updatedTask = null;
    if (getIsConnected()) {
      updatedTask = await MaintenanceTask.findOneAndUpdate(
        { _id: id, companyId: req.user.companyId },
        { $set: updateData },
        { new: true }
      );
      if (updatedTask) updatedTask = updatedTask.toObject();
    } else {
      const idx = inMemoryTasks.findIndex(t => String(t._id) === String(id));
      if (idx !== -1) {
        Object.assign(inMemoryTasks[idx], updateData);
        updatedTask = inMemoryTasks[idx];
      }
    }

    if (!updatedTask) {
      return res.status(404).json({ success: false, message: 'Maintenance task not found or unauthorized.' });
    }

    updatedTask = processTaskOverdue(updatedTask);
    return res.json({ success: true, task: updatedTask });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/maintenance/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (getIsConnected()) {
      await MaintenanceTask.deleteOne({ _id: id, companyId: req.user.companyId });
    } else {
      const idx = inMemoryTasks.findIndex(t => String(t._id) === String(id));
      if (idx !== -1) inMemoryTasks.splice(idx, 1);
    }
    return res.json({ success: true, message: 'Maintenance event deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/maintenance/spare-parts
const getSpareParts = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const parts = await SparePart.find({ companyId: req.user.companyId });
      return res.json({ success: true, parts });
    } else {
      return res.json({ success: true, parts: inMemorySpareParts });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssets,
  getAssetById,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getSpareParts
};
