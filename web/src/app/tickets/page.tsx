'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

interface Ticket {
  id: string;
  ticketNumber: string;
  bank: string;
  location: string;
  terminalId: string;
  fault: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'unassigned' | 'assigned' | 'en-route' | 'on-site' | 'completed' | 'closed';
  assignedTo?: string;
  reportedAt: string;
}

export default function TicketsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [formData, setFormData] = useState({
    bank: '',
    location: '',
    terminalId: '',
    fault: '',
    priority: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    contactName: '',
    contactPhone: '',
  });

  // Load tickets from localStorage
  useEffect(() => {
    const savedTickets = localStorage.getItem('tickets');
    if (savedTickets) {
      try {
        setTickets(JSON.parse(savedTickets));
      } catch (e) {
        console.error('Error loading tickets:', e);
      }
    }
  }, []);

  const sampleTickets: Ticket[] = [
    {
      id: '1',
      ticketNumber: 'TKT-2024-1145',
      bank: 'GTBank',
      location: 'Victoria Island Mall, Lagos',
      terminalId: 'GTB-VI-0234',
      fault: 'Card reader not responding',
      priority: 'critical',
      status: 'en-route',
      assignedTo: 'Eng. Chidi Okonkwo',
      reportedAt: '2024-11-29 08:30',
    },
    {
      id: '2',
      ticketNumber: 'TKT-2024-1144',
      bank: 'Access Bank',
      location: 'Ikeja City Mall, Lagos',
      terminalId: 'ACC-IK-0567',
      fault: 'Cash dispenser jam',
      priority: 'high',
      status: 'on-site',
      assignedTo: 'Eng. Amina Yusuf',
      reportedAt: '2024-11-29 07:15',
    },
    {
      id: '3',
      ticketNumber: 'TKT-2024-1143',
      bank: 'Zenith Bank',
      location: 'Lekki Phase 1, Lagos',
      terminalId: 'ZEN-LK-0892',
      fault: 'Receipt printer out of paper',
      priority: 'medium',
      status: 'assigned',
      assignedTo: 'Eng. Oluwaseun Adeyemi',
      reportedAt: '2024-11-29 06:45',
    },
    {
      id: '4',
      ticketNumber: 'TKT-2024-1142',
      bank: 'First Bank',
      location: 'Surulere Branch, Lagos',
      terminalId: 'FBN-SR-0445',
      fault: 'Screen display issue',
      priority: 'high',
      status: 'unassigned',
      reportedAt: '2024-11-29 05:30',
    },
    {
      id: '5',
      ticketNumber: 'TKT-2024-1141',
      bank: 'UBA',
      location: 'Maryland Mall, Lagos',
      terminalId: 'UBA-MD-0778',
      fault: 'Network connectivity issue',
      priority: 'critical',
      status: 'unassigned',
      reportedAt: '2024-11-29 04:20',
    },
    {
      id: '6',
      ticketNumber: 'TKT-2024-1140',
      bank: 'Stanbic IBTC',
      location: 'VI Annexe, Lagos',
      terminalId: 'STB-VI-0334',
      fault: 'Card retention issue',
      priority: 'medium',
      status: 'on-site',
      assignedTo: 'Eng. Ibrahim Musa',
      reportedAt: '2024-11-28 22:15',
    },
    {
      id: '7',
      ticketNumber: 'TKT-2024-1139',
      bank: 'Ecobank',
      location: 'Yaba Tech, Lagos',
      terminalId: 'ECO-YB-0556',
      fault: 'Power supply failure',
      priority: 'low',
      status: 'completed',
      assignedTo: 'Eng. Ngozi Eze',
      reportedAt: '2024-11-28 20:00',
    },
    {
      id: '8',
      ticketNumber: 'TKT-2024-1138',
      bank: 'GTBank',
      location: 'Ajah Roundabout, Lagos',
      terminalId: 'GTB-AJ-0889',
      fault: 'Software update required',
      priority: 'low',
      status: 'assigned',
      assignedTo: 'Eng. Blessing Nwosu',
      reportedAt: '2024-11-28 18:30',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unassigned': return 'bg-gray-100 text-gray-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'en-route': return 'bg-purple-100 text-purple-800';
      case 'on-site': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.terminalId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: tickets.length,
    unassigned: tickets.filter(t => t.status === 'unassigned').length,
    assigned: tickets.filter(t => t.status === 'assigned').length,
    'en-route': tickets.filter(t => t.status === 'en-route').length,
    'on-site': tickets.filter(t => t.status === 'on-site').length,
    completed: tickets.filter(t => t.status === 'completed').length,
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Fault Tickets</h1>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              + New Ticket
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {/* Search and Filter */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search tickets, banks, terminals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                      statusFilter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tickets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{ticket.ticketNumber}</h3>
                    <p className="text-sm text-gray-600">{ticket.bank}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-gray-700">{ticket.location}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    <span className="text-sm font-mono text-gray-700">{ticket.terminalId}</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm text-gray-700">{ticket.fault}</span>
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {ticket.assignedTo ? (
                      <span>Assigned to: <span className="font-medium">{ticket.assignedTo}</span></span>
                    ) : (
                      <span className="text-orange-600">Unassigned</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{ticket.reportedAt}</div>
                </div>

                <div className="mt-4 flex gap-2">
                  {ticket.status === 'unassigned' && (
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Assign Engineer
                    </button>
                  )}
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Ticket Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Ticket</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              // TODO: Submit to backend API
              console.log('New ticket:', formData);
              setShowAddModal(false);
              setFormData({
                bank: '',
                location: '',
                terminalId: '',
                fault: '',
                priority: 'medium',
                contactName: '',
                contactPhone: '',
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                  <input
                    type="text"
                    required
                    value={formData.bank}
                    onChange={(e) => setFormData({...formData, bank: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., GTBank"
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
                    placeholder="e.g., Victoria Island Mall, Lagos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terminal ID</label>
                  <input
                    type="text"
                    required
                    value={formData.terminalId}
                    onChange={(e) => setFormData({...formData, terminalId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., GTB-VI-0234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fault Description</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.fault}
                    onChange={(e) => setFormData({...formData, fault: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Describe the issue..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Bank contact person"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., +234 803 123 4567"
                  />
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
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
