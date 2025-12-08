'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function ITPage() {
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);

  const [tickets, setTickets] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);

  // Load IT tickets and assets from backend API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      async function fetchITData() {
        try {
          const ticketsRes = await fetch(`${apiUrl}/it/tickets`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          if (ticketsRes.ok) {
            setTickets(await ticketsRes.json());
          }
          const assetsRes = await fetch(`${apiUrl}/it/assets`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          if (assetsRes.ok) {
            setAssets(await assetsRes.json());
          }
        } catch (e) {
          console.error('Error loading IT data:', e);
        }
      }
      fetchITData();
    }
  }, []);

  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'open').length,
    totalAssets: assets.length,
    activeAssets: assets.filter(a => a.status === 'active').length
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">IT Department</h1>
            <p className="text-gray-600 mt-1">Manage IT tickets and assets</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowNewTicket(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              + New Ticket
            </button>
            <button
              onClick={() => setShowAssetModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              + Add Asset
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Total Tickets</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTickets}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Open Tickets</div>
            <div className="text-3xl font-bold text-red-600 mt-2">{stats.openTickets}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Total Assets</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAssets}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Active Assets</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{stats.activeAssets}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* IT Tickets */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">IT Support Tickets</h3>
            </div>
            <div className="p-6">
              {tickets.length > 0 ? (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{ticket.subject}</div>
                          <div className="text-sm text-gray-500">{ticket.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Reporter: {ticket.reporter} | {ticket.department}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {ticket.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🎫</div>
                  <p className="text-lg font-medium">No IT tickets yet</p>
                  <p className="text-sm mt-2">Create your first IT support ticket</p>
                </div>
              )}
            </div>
          </div>

          {/* IT Assets */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">IT Assets</h3>
            </div>
            <div className="p-6">
              {assets.length > 0 ? (
                <div className="space-y-3">
                  {assets.map((asset) => (
                    <div key={asset.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{asset.name}</div>
                          <div className="text-sm text-gray-500">{asset.type} | {asset.model}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Serial: {asset.serial} | Assigned to: {asset.assignedTo || 'Unassigned'}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          asset.status === 'active' ? 'bg-green-100 text-green-800' :
                          asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {asset.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">💻</div>
                  <p className="text-lg font-medium">No IT assets yet</p>
                  <p className="text-sm mt-2">Add your first IT asset</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Ticket Modal */}
        {showNewTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">New IT Ticket</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newTicket = {
                  id: (tickets.length + 1001).toString(),
                  subject: formData.get('subject'),
                  description: formData.get('description'),
                  reporter: formData.get('reporter'),
                  department: formData.get('department'),
                  priority: formData.get('priority'),
                  status: 'open',
                  createdAt: new Date().toISOString()
                };
                setTickets([newTicket, ...tickets]);
                setShowNewTicket(false);
                alert('✅ IT ticket created successfully!');
              }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reporter *</label>
                      <input
                        type="text"
                        name="reporter"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                      <input
                        type="text"
                        name="department"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Brief description of issue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                    <select name="priority" required className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium">
                    Create Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewTicket(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Asset Modal */}
        {showAssetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add IT Asset</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newAsset = {
                  id: Date.now().toString(),
                  name: formData.get('name'),
                  type: formData.get('type'),
                  model: formData.get('model'),
                  serial: formData.get('serial'),
                  assignedTo: formData.get('assignedTo'),
                  status: 'active',
                  createdAt: new Date().toISOString()
                };
                setAssets([...assets, newAsset]);
                setShowAssetModal(false);
                alert('✅ IT asset added successfully!');
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Dell Laptop - John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                      <select name="type" required className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="">Select type</option>
                        <option value="Laptop">Laptop</option>
                        <option value="Desktop">Desktop</option>
                        <option value="Monitor">Monitor</option>
                        <option value="Phone">Phone</option>
                        <option value="Tablet">Tablet</option>
                        <option value="Printer">Printer</option>
                        <option value="Server">Server</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                      <input
                        type="text"
                        name="model"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number *</label>
                      <input
                        type="text"
                        name="serial"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                      <input
                        type="text"
                        name="assignedTo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium">
                    Add Asset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAssetModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
