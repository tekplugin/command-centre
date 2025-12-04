'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [salesDeals, setSalesDeals] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load real data from localStorage
    const savedDeals = localStorage.getItem('sales_deals');
    if (savedDeals) {
      try {
        setSalesDeals(JSON.parse(savedDeals));
      } catch (e) {
        console.error('Error loading deals:', e);
      }
    }

    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        console.error('Error loading projects:', e);
      }
    }

    const savedTickets = localStorage.getItem('tickets');
    if (savedTickets) {
      try {
        setTickets(JSON.parse(savedTickets));
      } catch (e) {
        console.error('Error loading tickets:', e);
      }
    }
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Calculate dynamic metrics
  const activeDeals = salesDeals.filter(d => d.stage !== 'closed-won' && d.stage !== 'closed-lost');
  const closedWonDeals = salesDeals.filter(d => d.stage === 'closed-won');
  const totalPipeline = activeDeals.reduce((sum, deal) => {
    const value = parseFloat(deal.value.replace(/[₦,]/g, '')) || 0;
    return sum + value;
  }, 0);
  const monthlyRevenue = closedWonDeals.reduce((sum, deal) => {
    const value = parseFloat(deal.value.replace(/[₦,]/g, '')) || 0;
    return sum + value;
  }, 0);
  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in-progress');
  const onTrackProjects = projects.filter(p => p.status === 'on-track' || p.status === 'active');
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in-progress');

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `₦${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₦${(value / 1000).toFixed(1)}K`;
    }
    return `₦${value.toLocaleString()}`;
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Executive Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Welcome back, {user.firstName}! Here&apos;s your business overview</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {/* Key Business Metrics */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-2xl">💰</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Monthly Revenue (Closed Won)
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {closedWonDeals.length > 0 ? formatCurrency(monthlyRevenue) : '₦0'}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-2xl">💼</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Deals
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{activeDeals.length}</div>
                          <div className="ml-2 text-sm text-gray-600">
                            {activeDeals.length > 0 ? formatCurrency(totalPipeline) + ' pipeline' : 'No active deals'}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-2xl">📋</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Projects
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{activeProjects.length}</div>
                          <div className="ml-2 text-sm text-gray-600">
                            {onTrackProjects.length} on track
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-2xl">🎫</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Open Tickets
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{openTickets.length}</div>
                          <div className="ml-2 text-sm text-gray-600">
                            {tickets.length} total
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Operations Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ATM Operations</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Open Tickets</span>
                    <span className="text-xl font-bold text-red-600">{openTickets.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Critical Issues</span>
                    <span className="text-xl font-bold text-orange-600">
                      {tickets.filter(t => t.priority === 'critical' || t.priority === 'high').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-xl font-bold text-green-600">
                      {tickets.filter(t => t.status === 'completed' || t.status === 'closed').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-gray-600">Total Tickets</span>
                    <span className="text-xl font-bold text-gray-900">{tickets.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Pipeline</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Deals</span>
                    <span className="text-xl font-bold text-blue-600">{activeDeals.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Closed Won</span>
                    <span className="text-xl font-bold text-green-600">{closedWonDeals.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pipeline Value</span>
                    <span className="text-xl font-bold text-purple-600">
                      {formatCurrency(totalPipeline)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-gray-600">Total Deals</span>
                    <span className="text-xl font-bold text-gray-900">{salesDeals.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects Status</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Projects</span>
                    <span className="text-xl font-bold text-blue-600">{activeProjects.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">On Track</span>
                    <span className="text-xl font-bold text-green-600">{onTrackProjects.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">At Risk</span>
                    <span className="text-xl font-bold text-orange-600">
                      {projects.filter(p => p.status === 'at-risk' || p.status === 'delayed').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-gray-600">Total Projects</span>
                    <span className="text-xl font-bold text-gray-900">{projects.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity - Now shows real deals and tickets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Recent Tickets
                    </h3>
                    <Link href="/tickets" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      View all →
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {openTickets.length > 0 ? (
                      openTickets.slice(0, 5).map((ticket) => (
                        <div key={ticket.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium text-gray-900">{ticket.ticketId}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                ticket.priority === 'critical' ? 'bg-red-100 text-red-800' : 
                                ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {ticket.priority}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                              {ticket.bank} - {ticket.location}
                            </div>
                            <div className="mt-1 text-sm text-gray-500">{ticket.fault}</div>
                          </div>
                          <div className="ml-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                              ticket.status === 'assigned' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {ticket.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No open tickets</p>
                        <Link href="/tickets" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
                          Create first ticket
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Recent Deals
                    </h3>
                    <Link href="/sales" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      View all →
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {activeDeals.length > 0 ? (
                      activeDeals.slice(0, 5).map((deal) => (
                        <div key={deal.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{deal.client}</div>
                            <div className="text-sm text-gray-500">
                              Stage: <span className="capitalize">{deal.stage}</span> • {deal.probability}% probability
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{deal.value}</div>
                            <div className="text-xs text-gray-500">{deal.closeDate}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No active deals</p>
                        <Link href="/sales" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
                          Create first deal
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link href="/tickets" className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-3xl mb-2">🎫</span>
                  <span className="text-sm font-medium text-gray-900">Tickets</span>
                </Link>
                <Link href="/sales" className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-3xl mb-2">💼</span>
                  <span className="text-sm font-medium text-gray-900">Sales</span>
                </Link>
                <Link href="/projects" className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-3xl mb-2">📋</span>
                  <span className="text-sm font-medium text-gray-900">Projects</span>
                </Link>
                <Link href="/hr" className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-3xl mb-2">👥</span>
                  <span className="text-sm font-medium text-gray-900">HR</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
