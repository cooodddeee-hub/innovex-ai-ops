import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import MaintenanceNavTabs from '../components/MaintenanceNavTabs';
import KpiCard from '../components/KpiCard';
import Badge from '../components/Badge';
import LoadingState from '../components/LoadingState';
import Modal from '../components/Modal';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  FileText,
  Sliders,
  Check,
  Play,
  RotateCcw,
  XCircle,
  Trash2
} from 'lucide-react';

export default function MaintenanceCalendarPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [machineFilter, setMachineFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Form State
  const [form, setForm] = useState({
    machineId: 'M-104',
    machineName: 'Turbine Compressor M-104',
    title: 'Bearing Inspection',
    maintenanceType: 'Predictive Maintenance',
    priority: 'High',
    scheduledDate: new Date().toISOString().split('T')[0],
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    durationMinutes: 90,
    technician: 'Dr. Marcus Vance',
    reason: 'Predictive Maintenance risk alert',
    description: '',
    notes: ''
  });

  const [formError, setFormError] = useState('');

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (machineFilter !== 'ALL') params.append('machineId', machineFilter);
      if (typeFilter !== 'ALL') params.append('maintenanceType', typeFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (priorityFilter !== 'ALL') params.append('priority', priorityFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/maintenance/tasks?${params.toString()}`);
      if (res.data.success) {
        setTasks(res.data.tasks || []);
        setStats(res.data.stats || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [machineFilter, typeFilter, statusFilter, priorityFilter, searchTerm]);

  // Handle pre-filled state from Predictive Maintenance recommendation link
  useEffect(() => {
    if (location.state && location.state.schedulePrefill) {
      const p = location.state.schedulePrefill;
      setForm(prev => ({
        ...prev,
        machineId: p.machineId || 'M-104',
        machineName: `Asset ${p.machineId || 'M-104'}`,
        title: p.title || `Maintenance for ${p.machineId}`,
        maintenanceType: p.maintenanceType || 'Predictive Maintenance',
        priority: p.priority || 'High',
        reason: p.reason || 'High predicted maintenance risk',
        scheduledDate: p.recommendedDate || new Date().toISOString().split('T')[0]
      }));
      setIsScheduleModalOpen(true);
    }
  }, [location.state]);

  // Calendar Navigation Controls
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Schedule Form Handler
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.machineId) return setFormError('Please select a target machine.');
    if (!form.scheduledDate) return setFormError('Scheduled Date is required.');
    if (!form.title) return setFormError('Maintenance Title is required.');
    if (!form.startTime) return setFormError('Start Time is required.');

    try {
      const res = await api.post('/maintenance/tasks', form);
      if (res.data.success) {
        setIsScheduleModalOpen(false);
        fetchTasks();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to schedule maintenance.');
    }
  };

  // Task Action Handlers
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/maintenance/tasks/${taskId}`, { status: newStatus });
      if (res.data.success) {
        if (selectedTask && selectedTask._id === taskId) {
          setSelectedTask(res.data.task);
        }
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReschedule = async (taskId, newDate, newTime) => {
    try {
      const res = await api.put(`/maintenance/tasks/${taskId}`, { 
        scheduledDate: newDate,
        startTime: newTime,
        status: 'Scheduled'
      });
      if (res.data.success) {
        setIsRescheduling(false);
        setSelectedTask(res.data.task);
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this maintenance schedule?')) return;
    try {
      await api.delete(`/maintenance/tasks/${taskId}`);
      setIsDetailModalOpen(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingState message="Loading Industrial Maintenance Calendar..." />;

  // Month Grid Calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Generate 42 calendar grid cells (6 rows x 7 cols)
  const calendarCells = [];
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Previous month trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthDays - i);
    calendarCells.push({ date: d, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    calendarCells.push({ date: d, isCurrentMonth: true });
  }

  // Next month leading days
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i);
    calendarCells.push({ date: d, isCurrentMonth: false });
  }

  // Helper: Get tasks for specific date
  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(t => new Date(t.scheduledDate).toISOString().split('T')[0] === dateStr);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const maintenanceTypesList = [
    'Preventive Maintenance',
    'Predictive Maintenance',
    'Corrective Maintenance',
    'Inspection',
    'Calibration',
    'Cleaning',
    'Lubrication',
    'Component Replacement'
  ];

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <MaintenanceNavTabs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-brand-600" />
            <span>Industrial Maintenance Schedule Calendar</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronized work order schedule integrated directly with AI Predictive Maintenance recommendations.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setIsScheduleModalOpen(true);
          }}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Maintenance</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard title="Today's Maintenance" value={stats.todaysCount || 0} icon={Clock} badgeText="Today" badgeColor="blue" />
        <KpiCard title="Upcoming Work Orders" value={stats.upcomingCount || 0} icon={CalendarIcon} badgeText="Scheduled" badgeColor="blue" />
        <KpiCard title="Overdue Work Orders" value={stats.overdueCount || 0} icon={AlertTriangle} badgeText={stats.overdueCount > 0 ? 'Urgent' : 'Clear'} badgeColor={stats.overdueCount > 0 ? 'red' : 'green'} />
        <KpiCard title="Completed Maintenance" value={stats.completedCount || 0} icon={CheckCircle2} badgeText="Closed" badgeColor="green" />
        <KpiCard title="High / Critical Priority" value={stats.highPriorityCount || 0} icon={Wrench} badgeText="Priority" badgeColor={stats.highPriorityCount > 0 ? 'amber' : 'green'} />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search machine, work order, reason..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Machine Filter */}
          <select
            value={machineFilter}
            onChange={e => setMachineFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="ALL">All Machines</option>
            <option value="M-101">M-101 (CNC Milling)</option>
            <option value="M-102">M-102 (Hydraulic Press)</option>
            <option value="M-103">M-103 (Robotic Arm)</option>
            <option value="M-104">M-104 (Turbine Compressor)</option>
            <option value="M-105">M-105 (Conveyor Motor)</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="ALL">All Maintenance Types</option>
            {maintenanceTypesList.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Main Calendar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid (3 Cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs space-y-4">
          {/* Calendar Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight min-w-[160px]">
                {monthNames[month]} {year}
              </h2>
              <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-700 rounded-md p-0.5">
                <button
                  onClick={handlePrev}
                  className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleToday}
                  className="px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Today
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* View Mode Selector Tabs */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-xs font-semibold">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-sm transition-colors ${viewMode === 'month' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-sm transition-colors ${viewMode === 'week' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded-sm transition-colors ${viewMode === 'day' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Day
              </button>
            </div>
          </div>

          {/* MONTH VIEW */}
          {viewMode === 'month' && (
            <div className="space-y-1">
              {/* Day Headers */}
              <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* 42 Calendar Cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((cell, idx) => {
                  const dayTasks = getTasksForDate(cell.date);
                  const isToday = cell.date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          scheduledDate: cell.date.toISOString().split('T')[0]
                        }));
                        setFormError('');
                        setIsScheduleModalOpen(true);
                      }}
                      className={`min-h-[95px] p-1.5 rounded-md border text-xs flex flex-col justify-between cursor-pointer transition-colors ${
                        cell.isCurrentMonth
                          ? 'bg-slate-50/50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-brand-400'
                          : 'bg-slate-100/30 dark:bg-slate-950/40 border-transparent text-slate-400 dark:text-slate-600'
                      } ${isToday ? 'ring-2 ring-brand-500 font-bold bg-brand-50/20 dark:bg-brand-950/20' : ''}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[11px] ${isToday ? 'text-brand-600 font-bold' : (cell.isCurrentMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400')}`}>
                          {cell.date.getDate()}
                        </span>
                        {dayTasks.length > 0 && (
                          <span className="text-[10px] font-bold px-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {dayTasks.length}
                          </span>
                        )}
                      </div>

                      {/* Event Pills */}
                      <div className="space-y-1 flex-1 overflow-y-auto">
                        {dayTasks.slice(0, 2).map((t, tIdx) => {
                          let statusColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border-blue-200';
                          if (t.status === 'Completed') statusColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border-emerald-200';
                          else if (t.status === 'Overdue') statusColor = 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200 border-rose-200 font-bold';
                          else if (t.status === 'In Progress') statusColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border-amber-200';
                          else if (t.status === 'Cancelled') statusColor = 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 line-through';

                          return (
                            <div
                              key={tIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTask(t);
                                setIsRescheduling(false);
                                setIsDetailModalOpen(true);
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] truncate border font-medium ${statusColor} hover:opacity-90`}
                              title={`${t.machineId} - ${t.title} (${t.startTime})`}
                            >
                              <span className="font-bold">{t.machineId}:</span> {t.title}
                            </div>
                          );
                        })}
                        {dayTasks.length > 2 && (
                          <div className="text-[9px] font-bold text-slate-500 pl-1">
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* WEEK VIEW */}
          {viewMode === 'week' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-500 font-medium">Weekly Maintenance Schedule Overview:</p>
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                  const d = new Date(currentDate);
                  const dayOfWeek = d.getDay();
                  d.setDate(d.getDate() - dayOfWeek + offset);
                  const dayTasks = getTasksForDate(d);
                  const isToday = d.toDateString() === new Date().toDateString();

                  return (
                    <div key={offset} className={`p-2 rounded border bg-slate-50 dark:bg-slate-800/60 ${isToday ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-200 dark:border-slate-700'}`}>
                      <div className="font-bold text-slate-700 dark:text-slate-300 border-b pb-1 mb-2 flex justify-between">
                        <span>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span>{d.getDate()}</span>
                      </div>
                      <div className="space-y-1.5">
                        {dayTasks.map((t, idx) => (
                          <div
                            key={idx}
                            onClick={() => { setSelectedTask(t); setIsDetailModalOpen(true); }}
                            className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 cursor-pointer text-[11px]"
                          >
                            <div className="font-bold text-brand-600">{t.machineId}</div>
                            <div className="truncate">{t.title}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{t.startTime}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DAY VIEW */}
          {viewMode === 'day' && (
            <div className="space-y-3 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b pb-2">
                Schedule for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="space-y-2">
                {getTasksForDate(currentDate).length > 0 ? (
                  getTasksForDate(currentDate).map((t, idx) => (
                    <div
                      key={idx}
                      onClick={() => { setSelectedTask(t); setIsDetailModalOpen(true); }}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:border-brand-500"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={t.priority === 'Critical' ? 'critical' : 'warning'}>{t.priority}</Badge>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{t.machineId} - {t.title}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-1">{t.maintenanceType} | Assigned: {t.technician}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">{t.startTime} - {t.endTime}</span>
                        <Badge variant={t.status === 'Completed' ? 'success' : (t.status === 'Overdue' ? 'critical' : 'info')}>{t.status}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-10">No maintenance tasks scheduled for this day.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Maintenance Side Panel (1 Col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Upcoming Work Orders</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">{tasks.length} Total</span>
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {tasks.length > 0 ? (
              tasks.map((t, idx) => {
                let badgeVar = 'info';
                if (t.status === 'Completed') badgeVar = 'success';
                else if (t.status === 'Overdue') badgeVar = 'critical';
                else if (t.status === 'In Progress') badgeVar = 'warning';

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedTask(t);
                      setIsRescheduling(false);
                      setIsDetailModalOpen(true);
                    }}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700 hover:border-brand-500 cursor-pointer transition-colors text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{t.machineId}</span>
                      <Badge variant={badgeVar}>{t.status}</Badge>
                    </div>
                    <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{t.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>{new Date(t.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {t.startTime}</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">{t.priority}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-10">No upcoming maintenance scheduled.</p>
            )}
          </div>
        </div>
      </div>

      {/* SCHEDULE MAINTENANCE FORM MODAL */}
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Schedule Industrial Maintenance Work Order">
        <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
          {formError && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-800 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Machine ID *</label>
              <select
                value={form.machineId}
                onChange={e => setForm({ ...form, machineId: e.target.value, machineName: `Asset ${e.target.value}` })}
                className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
              >
                <option value="M-101">M-101 (CNC Milling)</option>
                <option value="M-102">M-102 (Hydraulic Press)</option>
                <option value="M-103">M-103 (Robotic Arm)</option>
                <option value="M-104">M-104 (Turbine Compressor)</option>
                <option value="M-105">M-105 (Conveyor Motor)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Maintenance Type *</label>
              <select
                value={form.maintenanceType}
                onChange={e => setForm({ ...form, maintenanceType: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
              >
                {maintenanceTypesList.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Maintenance Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Bearing Inspection & Lubrication"
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date *</label>
              <input
                type="date"
                required
                value={form.scheduledDate}
                onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time *</label>
              <input
                type="text"
                required
                value={form.startTime}
                onChange={e => setForm({ ...form, startTime: e.target.value })}
                placeholder="09:00 AM"
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
              <input
                type="text"
                value={form.endTime}
                onChange={e => setForm({ ...form, endTime: e.target.value })}
                placeholder="10:30 AM"
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Technician</label>
              <input
                type="text"
                value={form.technician}
                onChange={e => setForm({ ...form, technician: e.target.value, assignedTo: e.target.value })}
                placeholder="Dr. Marcus Vance"
                className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Maintenance Reason</label>
            <input
              type="text"
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              placeholder="e.g. Predictive Maintenance vibration alert (+42%)"
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description & Notes</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Provide detailed instructions for technician..."
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <button type="submit" className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded font-semibold mt-2 shadow-xs transition-colors">
            Confirm & Save Maintenance Schedule
          </button>
        </form>
      </Modal>

      {/* EVENT DETAILS & ACTION MODAL */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Maintenance Event: ${selectedTask?.title}`}>
        {selectedTask && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{selectedTask.machineId}</span>
                <p className="text-slate-500">{selectedTask.machineName || `Asset ${selectedTask.machineId}`}</p>
              </div>
              <div className="flex space-x-2">
                <Badge variant={selectedTask.priority === 'Critical' ? 'critical' : 'warning'}>{selectedTask.priority}</Badge>
                <Badge variant={selectedTask.status === 'Completed' ? 'success' : (selectedTask.status === 'Overdue' ? 'critical' : 'info')}>{selectedTask.status}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700">
              <div><span className="font-semibold text-slate-700 dark:text-slate-300">Type:</span> {selectedTask.maintenanceType}</div>
              <div><span className="font-semibold text-slate-700 dark:text-slate-300">Date:</span> {new Date(selectedTask.scheduledDate).toLocaleDateString()}</div>
              <div><span className="font-semibold text-slate-700 dark:text-slate-300">Time:</span> {selectedTask.startTime} – {selectedTask.endTime}</div>
              <div><span className="font-semibold text-slate-700 dark:text-slate-300">Technician:</span> {selectedTask.technician || selectedTask.assignedTo}</div>
            </div>

            {selectedTask.reason && (
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Maintenance Reason:</span>
                <p className="text-slate-600 dark:text-slate-400 bg-amber-50/50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800">{selectedTask.reason}</p>
              </div>
            )}

            {selectedTask.description && (
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Description:</span>
                <p className="text-slate-600 dark:text-slate-400">{selectedTask.description}</p>
              </div>
            )}

            {/* Reschedule View inline */}
            {isRescheduling ? (
              <div className="p-3 bg-brand-50/60 dark:bg-brand-950/40 rounded border border-brand-200 dark:border-brand-800 space-y-2">
                <span className="font-bold text-brand-700 dark:text-brand-300 block">Reschedule Maintenance Date & Time</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    id="reschedDate"
                    defaultValue={new Date(selectedTask.scheduledDate).toISOString().split('T')[0]}
                    className="px-2 py-1 border rounded bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    id="reschedTime"
                    defaultValue={selectedTask.startTime}
                    className="px-2 py-1 border rounded bg-white dark:bg-slate-900"
                  />
                </div>
                <div className="flex space-x-2 pt-1">
                  <button
                    onClick={() => {
                      const d = document.getElementById('reschedDate').value;
                      const t = document.getElementById('reschedTime').value;
                      handleReschedule(selectedTask._id, d, t);
                    }}
                    className="px-3 py-1 bg-brand-600 text-white rounded font-semibold text-[11px]"
                  >
                    Confirm Reschedule
                  </button>
                  <button
                    onClick={() => setIsRescheduling(false)}
                    className="px-3 py-1 bg-slate-200 text-slate-700 rounded font-semibold text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            {/* Lifecycle Action Buttons */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 justify-between">
              <div className="flex space-x-2">
                {selectedTask.status === 'Scheduled' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTask._id, 'In Progress')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-xs flex items-center space-x-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Work</span>
                  </button>
                )}
                {['Scheduled', 'In Progress', 'Overdue'].includes(selectedTask.status) && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTask._id, 'Completed')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                )}
                {!['Completed', 'Cancelled'].includes(selectedTask.status) && (
                  <button
                    onClick={() => setIsRescheduling(true)}
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded font-semibold text-xs flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reschedule</span>
                  </button>
                )}
              </div>

              <div className="flex space-x-2">
                {!['Completed', 'Cancelled'].includes(selectedTask.status) && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTask._id, 'Cancelled')}
                    className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-semibold text-xs"
                  >
                    Cancel Work Order
                  </button>
                )}
                <button
                  onClick={() => handleDeleteTask(selectedTask._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
