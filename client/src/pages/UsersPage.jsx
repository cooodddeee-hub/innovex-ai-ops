import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import LoadingState from '../components/LoadingState';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Users, UserPlus } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'analyst' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/company/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/company/users', newUser);
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/company/users/${userId}`, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingState message="Loading company user directory..." />;

  const columns = [
    { header: 'Full Name', accessor: 'name' },
    { header: 'Email Address', accessor: 'email' },
    { 
      header: 'Assigned Role', 
      render: (r) => (
        <select
          value={r.role}
          onChange={(e) => handleRoleChange(r._id || r.id, e.target.value)}
          className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
        >
          <option value="company_admin">Company Admin</option>
          <option value="manager">Manager</option>
          <option value="analyst">Analyst</option>
          <option value="operator">Operator</option>
          <option value="viewer">Viewer</option>
        </select>
      ) 
    },
    { 
      header: 'Permissions', 
      render: (r) => (
        <Badge variant={r.role === 'company_admin' ? 'critical' : 'info'}>
          {r.role === 'company_admin' ? 'Full Control' : 'Role Scoped'}
        </Badge>
      ) 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
            <Users className="w-5 h-5 text-brand-600" />
            <span>User & Role Permission Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Backend RBAC enforced: company_admin, manager, analyst, operator, viewer.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      <div className="space-y-3">
        <DataTable columns={columns} data={users} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Invite Team Member">
        <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
            <select
              value={newUser.role}
              onChange={e => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
            >
              <option value="manager">Manager</option>
              <option value="analyst">Analyst</option>
              <option value="operator">Operator</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded font-semibold mt-2">
            Create User Account
          </button>
        </form>
      </Modal>
    </div>
  );
}
