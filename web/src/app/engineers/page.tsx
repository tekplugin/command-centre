'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

interface Engineer {
  id: string;
  name: string;
  specialization: string;
  status: 'active' | 'on-job' | 'off-duty' | 'unavailable';
  location: string;
  assignedATMs: number;
  rating: number;
  completedToday: number;
  phone: string;
  email: string;
}

export default function EngineersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    phone: '',
    email: '',
    location: '',
    status: 'active' as 'active' | 'on-job' | 'off-duty' | 'unavailable',
  });

  // Load engineers from localStorage
  useEffect(() => {
    const savedEngineers = localStorage.getItem('engineers');
    if (savedEngineers) {
      try {
        setEngineers(JSON.parse(savedEngineers));
      } catch (e) {
        console.error('Error loading engineers:', e);
      }
    }
  }, []);

  const sampleEngineers: Engineer[] = [
    {
      id: '1',
      name: 'Chidi Okonkwo',
      specialization: 'Hardware Specialist',
      status: 'on-job',
      location: 'Victoria Island, Lagos',
      assignedATMs: 32,
      rating: 4.8,
      completedToday: 3,
      phone: '+234 801 234 5678',
      email: 'chidi.okonkwo@company.com',
    },
    {
      id: '2',
      name: 'Amina Yusuf',
      specialization: 'Software Engineer',
      status: 'on-job',
      location: 'Ikeja, Lagos',
      assignedATMs: 28,
      rating: 4.9,
      completedToday: 2,
      phone: '+234 802 345 6789',
      email: 'amina.yusuf@company.com',
    },
    {
      id: '3',
      name: 'Oluwaseun Adeyemi',
      specialization: 'Full Stack Technician',
      status: 'active',
      location: 'Lekki, Lagos',
      assignedATMs: 35,
      rating: 4.7,
      completedToday: 4,
      phone: '+234 803 456 7890',
      email: 'seun.adeyemi@company.com',
    },
    {
      id: '4',
      name: 'Ngozi Eze',
      specialization: 'Network Specialist',
      status: 'active',
      location: 'Surulere, Lagos',
      assignedATMs: 30,
      rating: 4.6,
      completedToday: 2,
      phone: '+234 804 567 8901',
      email: 'ngozi.eze@company.com',
    },
    {
      id: '5',
      name: 'Ibrahim Musa',
      specialization: 'Hardware Specialist',
      status: 'on-job',
      location: 'Yaba, Lagos',
      assignedATMs: 26,
      rating: 4.5,
      completedToday: 1,
      phone: '+234 805 678 9012',
      email: 'ibrahim.musa@company.com',
    },
    {
      id: '6',
      name: 'Blessing Nwosu',
      specialization: 'Software Engineer',
      status: 'off-duty',
      location: 'Maryland, Lagos',
      assignedATMs: 24,
      rating: 4.8,
      completedToday: 0,
      phone: '+234 806 789 0123',
      email: 'blessing.nwosu@company.com',
    },
    {
      id: '7',
      name: 'Yusuf Abdullahi',
      specialization: 'Full Stack Technician',
      status: 'active',
      location: 'Ajah, Lagos',
      assignedATMs: 29,
      rating: 4.7,
      completedToday: 3,
      phone: '+234 807 890 1234',
      email: 'yusuf.abdullahi@company.com',
    },
    {
      id: '8',
      name: 'Funmi Oladipo',
      specialization: 'Network Specialist',
      status: 'unavailable',
      location: 'Ikoyi, Lagos',
      assignedATMs: 22,
      rating: 4.9,
      completedToday: 0,
      phone: '+234 808 901 2345',
      email: 'funmi.oladipo@company.com',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on-job': return 'bg-blue-100 text-blue-800';
      case 'off-duty': return 'bg-gray-100 text-gray-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: engineers.length,
    active: engineers.filter(e => e.status === 'active').length,
    onJob: engineers.filter(e => e.status === 'on-job').length,
    offDuty: engineers.filter(e => e.status === 'off-duty').length,
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Field Engineers</h1>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              + Add Engineer
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Total Engineers</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Available</div>
              <div className="text-3xl font-bold text-green-600 mt-2">{stats.active}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">On Job</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">{stats.onJob}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Off Duty</div>
              <div className="text-3xl font-bold text-gray-600 mt-2">{stats.offDuty}</div>
            </div>
          </div>

          {/* Engineers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {engineers.map((engineer) => (
              <div key={engineer.id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold">
                      {engineer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{engineer.name}</h3>
                      <p className="text-sm text-gray-600">{engineer.specialization}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(engineer.status)}`}>
                    {engineer.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm">
                    <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700">{engineer.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700">{engineer.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">{engineer.email}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{engineer.assignedATMs}</div>
                      <div className="text-xs text-gray-600">Assigned ATMs</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{engineer.rating}</div>
                      <div className="text-xs text-gray-600">Rating</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{engineer.completedToday}</div>
                      <div className="text-xs text-gray-600">Today</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Assign Ticket
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Engineer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Engineer</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              // TODO: Submit to backend API
              console.log('New engineer:', formData);
              setShowAddModal(false);
              setFormData({
                name: '',
                specialization: '',
                phone: '',
                email: '',
                location: '',
                status: 'active',
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    required
                  >
                    <option value="">Select specialization</option>
                    <option value="Hardware Specialist">Hardware Specialist</option>
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Full Stack Technician">Full Stack Technician</option>
                    <option value="Network Specialist">Network Specialist</option>
                    <option value="Security Expert">Security Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., +234 801 234 5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., john.doe@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., Victoria Island, Lagos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value="active">Active</option>
                    <option value="off-duty">Off Duty</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Add Engineer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
