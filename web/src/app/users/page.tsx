'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  departments: string[];
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

const ROLES = ['admin', 'executive', 'manager', 'staff'];
const DEPARTMENTS = [
  'finance',
  'legal',
  'hr',
  'marketing',
  'sales',
  'engineering',
  'operations',
  'customer_service',
  'it',
  'procurement'
];

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  executive: 'bg-blue-100 text-blue-800',
  manager: 'bg-green-100 text-green-800',
  staff: 'bg-gray-100 text-gray-800',
};

const DEPT_COLORS: Record<string, string> = {
  finance: 'bg-emerald-100 text-emerald-700',
  legal: 'bg-amber-100 text-amber-700',
  hr: 'bg-pink-100 text-pink-700',
  marketing: 'bg-violet-100 text-violet-700',
  sales: 'bg-cyan-100 text-cyan-700',
  engineering: 'bg-indigo-100 text-indigo-700',
  operations: 'bg-orange-100 text-orange-700',
  customer_service: 'bg-teal-100 text-teal-700',
  it: 'bg-slate-100 text-slate-700',
  procurement: 'bg-rose-100 text-rose-700',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    roles: [] as string[],
    departments: [] as string[],
  });

  useEffect(() => {
    // Check if user is admin
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        const userRoles = userData.roles || [];
        const hasAdminRole = userRoles.includes('admin');
        setIsAdmin(hasAdminRole);
        
        if (!hasAdminRole) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
        setAccessDenied(true);
        setLoading(false);
        return;
      }
    } else {
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    fetchUsers();
  }, []);

  // Show access denied message if not admin
  if (accessDenied) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
            <p className="text-red-700 mb-4">
              You need Global Admin privileges to access user management.
            </p>
            <p className="text-sm text-red-600">
              Contact your administrator if you believe you should have access.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      console.log('Creating user with data:', formData);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log('Create user response:', data);
      if (data.success) {
        alert('User created successfully!');
        fetchUsers();
        setShowModal(false);
        resetForm();
      } else {
        alert(`Error: ${data.message || 'Failed to create user'}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Check console for details.');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      console.log('Updating user with data:', formData);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log('Update user response:', data);
      if (data.success) {
        alert('User updated successfully!');
        fetchUsers();
        setShowModal(false);
        setEditingUser(null);
        resetForm();
      } else {
        alert(`Error: ${data.message || 'Failed to update user'}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user. Check console for details.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://13.219.183.238:5000/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      roles: [],
      departments: [],
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingUser(null);
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || '',
      roles: user.roles,
      departments: user.departments,
    });
    setEditingUser(user);
    setShowModal(true);
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const toggleDepartment = (dept: string) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter(d => d !== dept)
        : [...prev.departments, dept]
    }));
  };

  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem('company_users');
      if (savedUsers) setUsers(JSON.parse(savedUsers));
      setLoading(false);
    } catch (e: any) {
      setError('Failed to load users.');
      setLoading(false);
    }
  }, []);

  const filteredUsers = users.filter(user =>
    (filterRole === '' || user.roles.includes(filterRole)) &&
    (`${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
  }
  if (error) {
    return <div className="text-red-600 text-center mt-8">{error}</div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <button onClick={() => { setEditingUser(null); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-all flex items-center gap-2"><PlusIcon className="h-5 w-5" /> Add User</button>
        </div>
        <div className="mb-4 flex gap-2 flex-wrap">
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search users..." className="border rounded px-3 py-2" />
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="border rounded px-3 py-2">
            <option value="">All Roles</option>
            {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-xs text-gray-600">Name</th>
                <th className="px-4 py-2 text-left text-xs text-gray-600">Email</th>
                <th className="px-4 py-2 text-left text-xs text-gray-600">Roles</th>
                <th className="px-4 py-2 text-left text-xs text-gray-600">Departments</th>
                <th className="px-4 py-2 text-left text-xs text-gray-600">Status</th>
                <th className="px-4 py-2 text-left text-xs text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id} className="hover:bg-blue-50 transition cursor-pointer">
                  <td className="px-4 py-2 font-medium text-gray-900">{user.firstName} {user.lastName}</td>
                  <td className="px-4 py-2 text-gray-700">{user.email}</td>
                  <td className="px-4 py-2">
                    {user.roles.map(role => <span key={role} className={`inline-block px-2 py-1 rounded mr-1 text-xs font-semibold ${ROLE_COLORS[role]}`}>{role}</span>)}
                  </td>
                  <td className="px-4 py-2">
                    {user.departments.map(dept => <span key={dept} className={`inline-block px-2 py-1 rounded mr-1 text-xs font-semibold ${DEPT_COLORS[dept]}`}>{dept}</span>)}
                  </td>
                  <td className="px-4 py-2">
                    {user.isActive ? <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700 text-xs"><ShieldCheckIcon className="h-4 w-4 mr-1" />Active</span> : <span className="inline-flex items-center px-2 py-1 rounded bg-gray-200 text-gray-600 text-xs"><UserGroupIcon className="h-4 w-4 mr-1" />Inactive</span>}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button onClick={() => { setEditingUser(user); setShowModal(true); }} className="text-blue-600 hover:underline"><PencilIcon className="h-4 w-4 inline" /></button>
                    <button onClick={() => {/* confirm and delete logic */}} className="text-red-600 hover:underline"><TrashIcon className="h-4 w-4 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* User Modal (Add/Edit) */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">{editingUser ? 'Edit User' : 'Add User'}</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!editingUser}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 bg-white text-gray-900"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roles * (Select at least one)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(role => (
                      <button
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          formData.roles.includes(role)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {role.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departments (Optional for Admin/Executive)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DEPARTMENTS.map(dept => (
                      <button
                        key={dept}
                        onClick={() => toggleDepartment(dept)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors text-sm ${
                          formData.departments.includes(dept)
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {dept.replace('_', ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={editingUser ? handleUpdateUser : handleCreateUser}
                  disabled={!formData.firstName || !formData.lastName || !formData.email || formData.roles.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
