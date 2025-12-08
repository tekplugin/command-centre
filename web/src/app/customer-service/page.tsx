'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function CustomerServicePage() {
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);


  // Load customer service tickets from backend API
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    async function fetchCustomerServiceTickets() {
      try {
        const res = await fetch(`${apiUrl}/customer-service/tickets`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (res.ok) {
          setTickets(await res.json());
        }
      } catch (e) {
        console.error('Error loading customer service tickets:', e);
      }
    }
    fetchCustomerServiceTickets();
  }, []);

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Service</h1>
            <p className="text-gray-600 mt-1">Manage customer tickets and support</p>
          </div>
          <button
            onClick={() => setShowNewTicket(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            + New Ticket
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Total Tickets</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Open</div>
            <div className="text-3xl font-bold text-orange-600 mt-2">{stats.open}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">In Progress</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Resolved</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Closed</div>
            <div className="text-3xl font-bold text-gray-600 mt-2">{stats.closed}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Support Tickets</h3>
          </div>
          <div className="p-6">
            {tickets.length > 0 ? (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowDetailModal(true);
                    }}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">#{ticket.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                            ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {ticket.priority?.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-lg font-medium text-gray-900">{ticket.subject}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {ticket.description?.substring(0, 100)}...
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Customer: {ticket.customerName || ticket.customer} | {ticket.customerEmail || ticket.email}
                        </div>
                        {ticket.techSupport && (
                          <div className="text-xs text-blue-600 mt-1">
                            Tech Support: {ticket.techSupport}
                          </div>
                        )}
                        {ticket.resolutionSteps && ticket.resolutionSteps.length > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            📝 {ticket.resolutionSteps.length} resolution step(s) added
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                        ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
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
                <p className="text-lg font-medium">No tickets yet</p>
                <p className="text-sm mt-2">Create your first support ticket</p>
              </div>
            )}
          </div>
        </div>

        {showNewTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">New Support Ticket</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newTicket = {
                  id: Date.now().toString(),
                  subject: formData.get('subject'),
                  description: formData.get('description'),
                  customerName: formData.get('customer'),
                  customerEmail: formData.get('email'),
                  customerPhone: formData.get('phone'),
                  priority: formData.get('priority'),
                  status: 'open',
                  createdAt: new Date().toISOString(),
                  resolutionSteps: []
                };
                const updatedTickets = [newTicket, ...tickets];
                setTickets(updatedTickets);
                localStorage.setItem('support_tickets', JSON.stringify(updatedTickets));
                setShowNewTicket(false);
                alert('✅ Ticket created successfully! Tech Support will be notified.');
              }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                      <input
                        type="text"
                        name="customer"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        placeholder="customer@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        placeholder="+234 xxx xxx xxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                      <select name="priority" required className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      placeholder="Brief description of issue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      placeholder="Detailed description of the issue..."
                    />
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

        {showDetailModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                    <p className="text-sm text-gray-600 mt-1">Ticket #{selectedTicket.id}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedTicket(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTicket.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                    selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    selectedTicket.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    Status: {selectedTicket.status?.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTicket.priority === 'high' ? 'bg-red-100 text-red-800' :
                    selectedTicket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    Priority: {selectedTicket.priority?.toUpperCase()}
                  </span>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="font-medium text-gray-900">{selectedTicket.customerName || selectedTicket.customer}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium text-gray-900">{selectedTicket.customerEmail || selectedTicket.email}</p>
                    </div>
                    {selectedTicket.customerPhone && (
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <p className="font-medium text-gray-900">{selectedTicket.customerPhone}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <p className="font-medium text-gray-900">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Issue Description</h3>
                  <p className="text-gray-700">{selectedTicket.description}</p>
                </div>

                {selectedTicket.resolutionSteps && selectedTicket.resolutionSteps.length > 0 && (
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h3 className="font-semibold text-gray-900 mb-3">🔧 Tech Support Resolution Steps</h3>
                    <div className="space-y-3">
                      {selectedTicket.resolutionSteps.map((step: any) => (
                        <div key={step.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-white">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-gray-900">{step.author}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(step.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{step.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTicket.techSupport && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Assigned to Tech Support:</span> {selectedTicket.techSupport}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  {selectedTicket.status === 'resolved' && (
                    <button
                      onClick={() => {
                        const updatedTickets = tickets.map(t =>
                          t.id === selectedTicket.id
                            ? { ...t, status: 'closed', closedAt: new Date().toISOString(), closedBy: JSON.parse(localStorage.getItem('user') || '{}').firstName }
                            : t
                        );
                        setTickets(updatedTickets);
                        localStorage.setItem('support_tickets', JSON.stringify(updatedTickets));
                        setShowDetailModal(false);
                        alert('✅ Ticket closed successfully!');
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium"
                    >
                      ✓ Close Ticket
                    </button>
                  )}
                  
                  {selectedTicket.status === 'closed' && (
                    <div className="flex-1 bg-gray-100 p-3 rounded-lg text-center text-gray-600">
                      Ticket Closed
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedTicket(null);
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
