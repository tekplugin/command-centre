'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function TechSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Load tickets from localStorage
  useEffect(() => {
    const savedTickets = localStorage.getItem('support_tickets');
    if (savedTickets) {
      try {
        setTickets(JSON.parse(savedTickets));
      } catch (e) {
        console.error('Error loading tickets:', e);
      }
    }
  }, []);

  // Filter tickets assigned to tech support (open and in-progress)
  const myTickets = tickets.filter(t => 
    t.status === 'open' || t.status === 'in-progress' || t.status === 'resolved'
  );

  const handleStartWork = (ticketId: string) => {
    const updatedTickets = tickets.map(t =>
      t.id === ticketId
        ? {
            ...t,
            status: 'in-progress',
            startedAt: new Date().toISOString(),
            techSupport: JSON.parse(localStorage.getItem('user') || '{}').firstName + ' ' + JSON.parse(localStorage.getItem('user') || '{}').lastName
          }
        : t
    );
    setTickets(updatedTickets);
    localStorage.setItem('support_tickets', JSON.stringify(updatedTickets));
  };

  const handleAddNote = (ticketId: string, note: string) => {
    if (!note.trim()) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const newNote = {
      id: Date.now().toString(),
      author: `${user.firstName} ${user.lastName}`,
      note: note,
      timestamp: new Date().toISOString()
    };

    const updatedTickets = tickets.map(t =>
      t.id === ticketId
        ? {
            ...t,
            resolutionSteps: [...(t.resolutionSteps || []), newNote]
          }
        : t
    );
    setTickets(updatedTickets);
    localStorage.setItem('support_tickets', JSON.stringify(updatedTickets));
    setResolutionNotes('');
  };

  const handleMarkResolved = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket?.resolutionSteps || ticket.resolutionSteps.length === 0) {
      alert('⚠️ Please add resolution steps before marking as resolved');
      return;
    }

    const updatedTickets = tickets.map(t =>
      t.id === ticketId
        ? {
            ...t,
            status: 'resolved',
            resolvedAt: new Date().toISOString(),
            resolvedBy: JSON.parse(localStorage.getItem('user') || '{}').firstName + ' ' + JSON.parse(localStorage.getItem('user') || '{}').lastName
          }
        : t
    );
    setTickets(updatedTickets);
    localStorage.setItem('support_tickets', JSON.stringify(updatedTickets));
    alert('✅ Ticket marked as resolved! Customer Service can now close it.');
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tech Support</h1>
            <p className="text-gray-600 mt-1">Resolve customer issues and provide technical support</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Open Tickets</div>
            <div className="text-3xl font-bold text-orange-600 mt-2">
              {myTickets.filter(t => t.status === 'open').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">In Progress</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {myTickets.filter(t => t.status === 'in-progress').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Resolved</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {myTickets.filter(t => t.status === 'resolved').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Total Tickets</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{myTickets.length}</div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Support Tickets</h3>
          </div>
          <div className="p-6">
            {myTickets.length > 0 ? (
              <div className="space-y-3">
                {myTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowDetailModal(true);
                    }}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{ticket.subject}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                            ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {ticket.priority?.toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {ticket.status?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <div>
                            <span className="font-medium">Customer:</span> {ticket.customerName}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {ticket.customerEmail}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span> {new Date(ticket.createdAt).toLocaleDateString()}
                          </div>
                          {ticket.techSupport && (
                            <div>
                              <span className="font-medium">Assigned to:</span> {ticket.techSupport}
                            </div>
                          )}
                        </div>
                        {ticket.resolutionSteps && ticket.resolutionSteps.length > 0 && (
                          <div className="mt-2 text-xs text-green-600">
                            📝 {ticket.resolutionSteps.length} resolution step(s) added
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    {ticket.status === 'open' && (
                      <div className="flex gap-2 pt-3 border-t">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartWork(ticket.id);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
                        >
                          Start Working
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🎫</div>
                <p className="text-lg font-medium">No support tickets</p>
                <p className="text-sm mt-2">Tickets from Customer Service will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Detail Modal */}
        {showDetailModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
                {/* Status Badges */}
                <div className="flex gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTicket.priority === 'high' ? 'bg-red-100 text-red-800' :
                    selectedTicket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    Priority: {selectedTicket.priority?.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    selectedTicket.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    selectedTicket.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    Status: {selectedTicket.status?.toUpperCase()}
                  </span>
                </div>

                {/* Customer Information */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="font-medium text-gray-900">{selectedTicket.customerName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium text-gray-900">{selectedTicket.customerEmail}</p>
                    </div>
                    {selectedTicket.customerPhone && (
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <p className="font-medium text-gray-900">{selectedTicket.customerPhone}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedTicket.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Issue Description */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Issue Description</h3>
                  <p className="text-gray-700">{selectedTicket.description}</p>
                </div>

                {/* Resolution Steps */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Resolution Steps</h3>
                  
                  {selectedTicket.resolutionSteps && selectedTicket.resolutionSteps.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {selectedTicket.resolutionSteps.map((step: any) => (
                        <div key={step.id} className="border-l-4 border-blue-500 pl-4 py-2">
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
                  ) : (
                    <p className="text-gray-500 text-sm mb-4">No resolution steps added yet</p>
                  )}

                  {/* Add Resolution Step */}
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <div>
                      <textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 mb-2"
                        placeholder="Describe the steps taken to resolve this issue..."
                      />
                      <button
                        onClick={() => {
                          handleAddNote(selectedTicket.id, resolutionNotes);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
                      >
                        Add Resolution Step
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  {selectedTicket.status === 'open' && (
                    <button
                      onClick={() => {
                        handleStartWork(selectedTicket.id);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
                    >
                      Start Working on This Ticket
                    </button>
                  )}
                  
                  {selectedTicket.status === 'in-progress' && (
                    <button
                      onClick={() => {
                        handleMarkResolved(selectedTicket.id);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium"
                    >
                      ✓ Mark as Resolved
                    </button>
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
