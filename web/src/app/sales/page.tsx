'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

interface Deal {
  id: string;
  client: string;
  value: string;
  stage: 'qualified' | 'proposal' | 'demo' | 'poc' | 'negotiation' | 'legal' | 'closed-won';
  probability: number;
  closeDate: string;
  contact: string;
  modules?: string[];
}

interface Opportunity {
  id: string;
  clientId: string;
  clientName: string;
  type: 'Module Upgrade' | 'New Module' | 'Additional Service' | 'License Expansion' | 'Support Upgrade';
  modules?: string[];
  description: string;
  estimatedValue: string;
  probability: number;
  status: 'identified' | 'contacted' | 'proposal-sent' | 'closed-won' | 'closed-lost';
  createdDate: string;
}

export default function SalesPage() {
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [showDealUpdateModal, setShowDealUpdateModal] = useState(false);
  const [showDealDetailsModal, setShowDealDetailsModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [viewOpportunities, setViewOpportunities] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [monthlyTarget, setMonthlyTarget] = useState(50000000); // Default ₦50M
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [formData, setFormData] = useState({
    client: '',
    value: '',
    stage: 'qualified' as 'qualified' | 'proposal' | 'demo' | 'poc' | 'negotiation' | 'legal' | 'closed-won',
    probability: 20,
    closeDate: '',
    contact: '',
    modules: [] as string[],
  });
  const [opportunityData, setOpportunityData] = useState({
    clientName: '',
    type: 'Module Upgrade' as 'Module Upgrade' | 'New Module' | 'Additional Service' | 'License Expansion' | 'Support Upgrade',
    modules: [] as string[],
    description: '',
    estimatedValue: '',
    probability: 20,
    status: 'identified' as 'identified' | 'contacted' | 'proposal-sent' | 'closed-won' | 'closed-lost',
  });

  const availableModules = [
    'Pack 1: Intelligent Camera - ATM Fraud Detection',
    'Pack 2: ATM Monitoring and Management',
    'Pack 3: Transaction Monitoring and Management',
    'Pack 4: Reconciliation',
    'Pack 5: Dispute Resolution (Other Bank Cards)',
    'Pack 6: Remote Software Delivery and Media Management',
    'Complete Package - All Modules',
  ];

  // Load from localStorage after mount to avoid hydration errors
  useEffect(() => {
    setMounted(true);
    const savedDeals = localStorage.getItem('sales_deals');
    const savedOpportunities = localStorage.getItem('sales_opportunities');
    const savedTarget = localStorage.getItem('sales_monthly_target');
    
    if (savedDeals) {
      try {
        setDeals(JSON.parse(savedDeals));
      } catch (error) {
        console.error('Error loading deals:', error);
      }
    }
    
    if (savedTarget) {
      try {
        setMonthlyTarget(JSON.parse(savedTarget));
      } catch (error) {
        console.error('Error loading target:', error);
      }
    }
    
    if (savedOpportunities) {
      try {
        setOpportunities(JSON.parse(savedOpportunities));
      } catch (error) {
        console.error('Error loading opportunities:', error);
      }
    }
  }, []);

  // Save deals to localStorage
  useEffect(() => {
    if (mounted && deals.length >= 0) {
      localStorage.setItem('sales_deals', JSON.stringify(deals));
    }
  }, [deals, mounted]);

  // Save opportunities to localStorage
  useEffect(() => {
    if (mounted && opportunities.length >= 0) {
      localStorage.setItem('sales_opportunities', JSON.stringify(opportunities));
    }
  }, [opportunities, mounted]);

  // Save monthly target to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sales_monthly_target', JSON.stringify(monthlyTarget));
    }
  }, [monthlyTarget, mounted]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'qualified': return 'bg-purple-100 text-purple-800';
      case 'proposal': return 'bg-orange-100 text-orange-800';
      case 'demo': return 'bg-yellow-100 text-yellow-800';
      case 'poc': return 'bg-cyan-100 text-cyan-800';
      case 'negotiation': return 'bg-blue-100 text-blue-800';
      case 'legal': return 'bg-indigo-100 text-indigo-800';
      case 'closed-won': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOpportunityStatusColor = (status: string) => {
    switch (status) {
      case 'identified': return 'bg-gray-100 text-gray-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'proposal-sent': return 'bg-purple-100 text-purple-800';
      case 'closed-won': return 'bg-green-100 text-green-800';
      case 'closed-lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get closed-won clients for opportunity selection
  const closedWonClients = deals.filter(deal => deal.stage === 'closed-won');

  // Function to check if legal documents exist for a client
  const checkLegalDocuments = (clientName: string): boolean => {
    // Check sessionStorage for legal documents (updated to match Legal page storage)
    const legalDocs = sessionStorage.getItem('legal_documents_meta');
    if (!legalDocs) return false;
    
    try {
      const documents = JSON.parse(legalDocs);
      const clientDocs = documents.filter((doc: any) => 
        doc.clientName?.toLowerCase() === clientName.toLowerCase()
      );
      
      // Required documents for closing sale (must match Legal page requirements)
      const REQUIRED_DOCS = ['Award Letter', 'Legal Agreement', 'SLA (Service Level Agreement)'];
      
      // Check if all required documents exist
      const hasAllDocs = REQUIRED_DOCS.every(requiredCategory => 
        clientDocs.some((doc: any) => doc.category === requiredCategory)
      );
      
      return hasAllDocs;
    } catch (e) {
      console.error('Error checking legal documents:', e);
      return false;
    }
  };

  // Function to send notification to legal department
  const notifyLegalDepartment = (clientName: string) => {
    const notification = {
      id: Date.now().toString(),
      department: 'legal',
      message: `Urgent: Upload required legal documents for ${clientName}: Award Letter, Legal Agreement, and SLA. Deal cannot be closed without all three documents.`,
      clientName: clientName,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    // Store notification in localStorage
    const existingNotifications = localStorage.getItem('legal_notifications');
    const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
    notifications.unshift(notification);
    localStorage.setItem('legal_notifications', JSON.stringify(notifications));
  };

  const handleAddOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate modules selection for Module Upgrade or New Module types
    if ((opportunityData.type === 'Module Upgrade' || opportunityData.type === 'New Module') && opportunityData.modules.length === 0) {
      alert('Please select at least one module for this opportunity.');
      return;
    }
    
    const selectedClient = closedWonClients.find(c => c.client === opportunityData.clientName);
    const newOpportunity: Opportunity = {
      id: Date.now().toString(),
      clientId: selectedClient?.id || '',
      clientName: opportunityData.clientName,
      type: opportunityData.type,
      modules: opportunityData.modules,
      description: opportunityData.description,
      estimatedValue: opportunityData.estimatedValue,
      probability: opportunityData.probability,
      status: opportunityData.status,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setOpportunities([newOpportunity, ...opportunities]);
    setShowOpportunityModal(false);
    setOpportunityData({
      clientName: '',
      type: 'Module Upgrade',
      modules: [],
      description: '',
      estimatedValue: '',
      probability: 20,
      status: 'identified',
    });
    alert('Opportunity added successfully!');
  };

  const handleGenerateQuote = () => {
    if (deals.length === 0) {
      alert('No deals available to generate quote. Please create a deal first.');
      return;
    }
    
    // Generate a simple quote document
    const quoteData = deals.map(deal => {
      return `Client: ${deal.client}\nValue: ${deal.value}\nModules: ${deal.modules?.join(', ') || 'None'}\nStage: ${deal.stage}\nContact: ${deal.contact}\n---`;
    }).join('\n\n');
    
    const blob = new Blob([`SALES QUOTE\n\nDate: ${new Date().toLocaleDateString()}\n\n${quoteData}`], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    alert('Quote generated and downloaded successfully!');
  };

  const handleSalesReport = () => {
    if (deals.length === 0 && opportunities.length === 0) {
      alert('No data available to generate report. Please add deals or opportunities first.');
      return;
    }
    
    // Generate sales report
    const reportContent = `SALES REPORT\nGenerated: ${new Date().toLocaleString()}\n\n` +
      `=== SUMMARY ===\n` +
      `Active Deals: ${stats.activeDeals}\n` +
      `Pipeline Value: ${stats.pipelineValue}\n` +
      `Monthly Target: ${stats.monthlyTarget}\n` +
      `Achieved: ${stats.achieved} (${stats.achievedPercentage}%)\n` +
      `Active Opportunities: ${stats.activeOpportunities}\n` +
      `Closed Won Opportunities: ${stats.closedWonOpportunities}\n\n` +
      `=== DEALS ===\n` +
      deals.map(deal => 
        `${deal.client} | ${deal.value} | ${deal.stage} | ${deal.probability}% | ${deal.closeDate}\n` +
        `  Modules: ${deal.modules?.join(', ') || 'None'}\n`
      ).join('\n') +
      `\n=== OPPORTUNITIES ===\n` +
      opportunities.map(opp => 
        `${opp.clientName} | ${opp.type} | ${opp.modules?.join(', ') || 'N/A'} | ${opp.status} | ${opp.probability}%\n` +
        `  ${opp.description}\n`
      ).join('\n');
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    alert('Sales report generated and downloaded successfully!');
  };

  // Calculate pipeline value from active deals
  const calculatePipelineValue = () => {
    const activeDeals = deals.filter(d => d.stage !== 'closed-won');
    const totalValue = activeDeals.reduce((sum, deal) => {
      const value = parseFloat(deal.value.replace(/[^0-9.]/g, '')) || 0;
      return sum + value;
    }, 0);
    return totalValue;
  };

  // Calculate closed-won deals value
  const calculateAchievedValue = () => {
    const closedDeals = deals.filter(d => d.stage === 'closed-won');
    const totalValue = closedDeals.reduce((sum, deal) => {
      const value = parseFloat(deal.value.replace(/[^0-9.]/g, '')) || 0;
      return sum + value;
    }, 0);
    return totalValue;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `₦${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₦${(value / 1000).toFixed(1)}K`;
    }
    return `₦${value.toFixed(0)}`;
  };

  const pipelineValue = calculatePipelineValue();
  const achievedValue = calculateAchievedValue();
  const achievedPercentage = monthlyTarget > 0 ? Math.round((achievedValue / monthlyTarget) * 100) : 0;

  const stats = {
    activeDeals: deals.filter(d => d.stage !== 'closed-won').length,
    pipelineValue: formatCurrency(pipelineValue),
    monthlyTarget: formatCurrency(monthlyTarget),
    achieved: formatCurrency(achievedValue),
    achievedPercentage: achievedPercentage,
    activeOpportunities: opportunities.filter(o => o.status !== 'closed-won' && o.status !== 'closed-lost').length,
    closedWonOpportunities: opportunities.filter(o => o.status === 'closed-won').length,
  };

  // Prevent hydration error by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Sales Pipeline</h1>
              <p className="mt-1 text-sm text-gray-600">Track deals and revenue opportunities</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                    localStorage.removeItem('sales_deals');
                    localStorage.removeItem('sales_opportunities');
                    localStorage.removeItem('sales_monthly_target');
                    setDeals([]);
                    setOpportunities([]);
                    setMonthlyTarget(50000000);
                    alert('All data cleared successfully!');
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Clear All Data
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                + New Deal
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Active Deals</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{stats.activeDeals}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Pipeline Value</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">{stats.pipelineValue}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 flex justify-between items-center">
                <span>Monthly Target</span>
                <button 
                  onClick={() => setIsEditingTarget(!isEditingTarget)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {isEditingTarget ? 'Done' : 'Edit'}
                </button>
              </div>
              {isEditingTarget ? (
                <input
                  type="number"
                  value={monthlyTarget}
                  onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                  className="text-3xl font-bold text-gray-900 mt-2 w-full border border-gray-300 rounded px-2 py-1"
                  placeholder="Enter target amount"
                />
              ) : (
                <div className="text-3xl font-bold text-gray-900 mt-2">{stats.monthlyTarget}</div>
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Target Achievement</div>
              <div className="text-3xl font-bold text-green-600 mt-2">{stats.achievedPercentage}%</div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats.achievedPercentage}%` }}></div>
              </div>
            </div>
          </div>

          {/* Toggle Between Deals and Opportunities */}
          <div className="mb-6 flex gap-4 items-center">
            <button
              onClick={() => setViewOpportunities(false)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                !viewOpportunities
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Active Deals ({stats.activeDeals})
            </button>
            <button
              onClick={() => setViewOpportunities(true)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                viewOpportunities
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Client Opportunities ({stats.activeOpportunities})
            </button>
          </div>

          {/* Deals */}
          {!viewOpportunities && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Active Deals</h3>
            </div>
            <div className="divide-y">
              {deals.map((deal) => (
                <div key={deal.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{deal.client}</h4>
                      <p className="text-sm text-gray-600">Contact: {deal.contact}</p>
                      {deal.modules && deal.modules.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Modules:</p>
                          <div className="flex flex-wrap gap-1">
                            {deal.modules.map((module, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                {module}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">{deal.value}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(deal.stage)}`}>
                        {deal.stage.toUpperCase().replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Probability</div>
                      <div className="mt-1">
                        <div className="flex items-center">
                          <div className="text-lg font-semibold text-gray-900">{deal.probability}%</div>
                          <div className="ml-3 flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${deal.probability}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Expected Close Date</div>
                      <div className="mt-1 text-lg font-semibold text-gray-900">{deal.closeDate}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedDeal(deal);
                        setFormData({
                          client: deal.client,
                          value: deal.value,
                          stage: deal.stage,
                          probability: deal.probability,
                          closeDate: deal.closeDate,
                          contact: deal.contact,
                          modules: deal.modules || [],
                        });
                        setShowDealUpdateModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium"
                    >
                      Update Stage
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedDeal(deal);
                        setShowDealDetailsModal(true);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Opportunities */}
          {viewOpportunities && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Client Opportunities</h3>
              <p className="text-sm text-gray-600 mt-1">Track module upgrades and additional needs from existing clients</p>
            </div>
            <div className="divide-y">
              {opportunities.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">No opportunities yet</p>
                  <p className="mt-1 text-xs text-gray-500">Opportunities are automatically created when closed-won deals don't have all modules</p>
                </div>
              ) : (
                // Group opportunities by client - show only client info
                Object.entries(
                  opportunities.reduce((acc, opp) => {
                    if (!acc[opp.clientName]) {
                      acc[opp.clientName] = [];
                    }
                    acc[opp.clientName].push(opp);
                    return acc;
                  }, {} as Record<string, typeof opportunities>)
                ).map(([clientName, clientOpps]) => {
                  // Get the client's deal to show purchased modules
                  const clientDeal = closedWonClients.find(d => d.client === clientName);
                  const purchasedModules = clientDeal?.modules || [];
                  
                  return (
                    <div key={clientName} className="border-b border-gray-200 last:border-0">
                      <div className="p-4 hover:bg-gray-50 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="text-base font-semibold text-gray-900">{clientName}</h4>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-600">{clientOpps.length} Opportunity{clientOpps.length > 1 ? 'ies' : ''}</span>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-600 mb-1">Purchased Modules:</p>
                            <div className="flex flex-wrap gap-1">
                              {purchasedModules.length > 0 ? (
                                purchasedModules.map((mod, idx) => (
                                  <span key={idx} className="inline-block bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded">
                                    {mod}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400">No modules purchased yet</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            // Show first opportunity or create new one
                            const firstOpp = clientOpps[0];
                            setOpportunityData({
                              clientName: clientName,
                              type: firstOpp?.type || 'Module Upgrade',
                              modules: firstOpp?.modules || [],
                              description: firstOpp?.description || '',
                              estimatedValue: firstOpp?.estimatedValue || '',
                              probability: firstOpp?.probability || 20,
                              status: firstOpp?.status || 'identified',
                            });
                            setShowOpportunityModal(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium"
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          )}

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium"
            >
              New Deal
            </button>
            <button 
              onClick={() => alert('Add Lead feature coming soon!')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium"
            >
              Add Lead
            </button>
            <button 
              onClick={handleGenerateQuote}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium"
            >
              Generate Quote
            </button>
            <button 
              onClick={handleSalesReport}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium"
            >
              Sales Report
            </button>
          </div>
        </div>
      </div>

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[10000]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Deal</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              
              // Check for legal documents if trying to close the deal
              if (formData.stage === 'closed-won') {
                const hasLegalDocs = checkLegalDocuments(formData.client);
                if (!hasLegalDocs) {
                  // Send notification to legal
                  notifyLegalDepartment(formData.client);
                  
                  // Show warning popup
                  alert(`⚠️ Cannot close deal for ${formData.client}\n\nRequired legal documents have not been uploaded:\n• Award Letter\n• Legal Agreement\n• SLA (Service Level Agreement)\n\nA notification has been sent to the Legal Department to upload the required documents.`);
                  return;
                }
              }
              
              const newDeal: Deal = {
                id: Date.now().toString(),
                client: formData.client,
                value: formData.value,
                stage: formData.stage,
                probability: formData.probability,
                closeDate: formData.closeDate,
                contact: formData.contact,
                modules: formData.modules,
              };
              setDeals([newDeal, ...deals]);
              
              // Auto-create upgrade opportunities for missing modules if deal is closed-won
              if (formData.stage === 'closed-won' && formData.modules.length > 0 && !formData.modules.includes('Complete Package - All Modules')) {
                const missingModules = availableModules.filter(
                  module => module !== 'Complete Package - All Modules' && !formData.modules.includes(module)
                );
                
                const newOpportunities = missingModules.map(module => ({
                  id: `${Date.now()}-${module}`,
                  clientId: newDeal.id,
                  clientName: formData.client,
                  type: 'Module Upgrade' as const,
                  modules: [module],
                  description: `Opportunity to upgrade ${formData.client} with ${module}`,
                  estimatedValue: '',
                  probability: 20,
                  status: 'identified' as const,
                  createdDate: new Date().toISOString().split('T')[0],
                }));
                
                setOpportunities([...newOpportunities, ...opportunities]);
              }
              
              setShowAddModal(false);
              setFormData({
                client: '',
                value: '',
                stage: 'qualified',
                probability: 20,
                closeDate: '',
                contact: '',
                modules: [],
              });
              alert('Deal created successfully!');
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={formData.client}
                    onChange={(e) => setFormData({...formData, client: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., First Bank"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value (₦)</label>
                  <input
                    type="text"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., 12.5M"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Camguard Modules / Software
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-2">Select one or more modules for this deal</p>
                    {availableModules.map((module) => (
                      <label key={module} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.modules.includes(module)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({...formData, modules: [...formData.modules, module]});
                            } else {
                              setFormData({...formData, modules: formData.modules.filter(m => m !== module)});
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{module}</span>
                      </label>
                    ))}
                  </div>
                  {formData.modules.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Selected: {formData.modules.length} module{formData.modules.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => {
                      const stage = e.target.value as any;
                      let probability = formData.probability;
                      // Auto-adjust probability based on stage
                      if (stage === 'qualified') probability = 20;
                      else if (stage === 'proposal') probability = 50;
                      else if (stage === 'demo') probability = 60;
                      else if (stage === 'poc') probability = 70;
                      else if (stage === 'negotiation') probability = 80;
                      else if (stage === 'legal') probability = 90;
                      else if (stage === 'closed-won') probability = 100;
                      setFormData({...formData, stage, probability});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="demo">Demo</option>
                    <option value="poc">POC (Proof of Concept)</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="legal">Legal</option>
                    <option value="closed-won">Closed-Won</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Probability: {formData.probability}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={formData.probability}
                    onChange={(e) => setFormData({...formData, probability: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
                  <input
                    type="date"
                    required
                    value={formData.closeDate}
                    onChange={(e) => setFormData({...formData, closeDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., John Doe"
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
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Opportunity Modal */}
      {showOpportunityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowOpportunityModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Client Opportunity</h2>
            <form onSubmit={handleAddOpportunity}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Existing Client *</label>
                  <select
                    required
                    value={opportunityData.clientName}
                    onChange={(e) => setOpportunityData({...opportunityData, clientName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value="">Select a closed-won client...</option>
                    {closedWonClients.map((client) => (
                      <option key={client.id} value={client.client}>{client.client}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Only closed-won clients are shown</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity Type *</label>
                  <select
                    required
                    value={opportunityData.type}
                    onChange={(e) => setOpportunityData({...opportunityData, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value="Module Upgrade">Module Upgrade</option>
                    <option value="New Module">New Module</option>
                    <option value="Additional Service">Additional Service</option>
                    <option value="License Expansion">License Expansion</option>
                    <option value="Support Upgrade">Support Upgrade</option>
                  </select>
                </div>

                {(opportunityData.type === 'Module Upgrade' || opportunityData.type === 'New Module') && (() => {
                  // Get the selected client's deal to check what modules they already have
                  const selectedClientDeal = closedWonClients.find(c => c.client === opportunityData.clientName);
                  const purchasedModules = selectedClientDeal?.modules || [];
                  // Filter out modules that the client already purchased
                  const availableForClient = availableModules.filter(
                    module => !purchasedModules.includes(module) && module !== 'Complete Package - All Modules'
                  );
                  
                  return (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Modules * {opportunityData.modules.length > 0 && `(${opportunityData.modules.length} selected)`}
                      </label>
                      {availableForClient.length === 0 ? (
                        <div className="border border-gray-300 rounded-md p-4 bg-gray-50 text-center">
                          <p className="text-sm text-gray-600">This client has already purchased all available modules.</p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50">
                            <p className="text-xs text-gray-500 mb-2">Select modules not yet purchased by {opportunityData.clientName || 'this client'}</p>
                            {availableForClient.map((module) => (
                              <label key={module} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={opportunityData.modules.includes(module)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setOpportunityData({...opportunityData, modules: [...opportunityData.modules, module]});
                                    } else {
                                      setOpportunityData({...opportunityData, modules: opportunityData.modules.filter(m => m !== module)});
                                    }
                                  }}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-900">{module}</span>
                              </label>
                            ))}
                          </div>
                          {opportunityData.modules.length === 0 && (
                            <p className="mt-1 text-xs text-red-500">Please select at least one module</p>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={opportunityData.description}
                    onChange={(e) => setOpportunityData({...opportunityData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Describe the client's need or upgrade requirements..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value (₦)</label>
                  <input
                    type="text"
                    required
                    value={opportunityData.estimatedValue}
                    onChange={(e) => setOpportunityData({...opportunityData, estimatedValue: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., ₦5M or 5000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Probability: {opportunityData.probability}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={opportunityData.probability}
                    onChange={(e) => setOpportunityData({...opportunityData, probability: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    required
                    value={opportunityData.status}
                    onChange={(e) => setOpportunityData({...opportunityData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value="identified">Identified</option>
                    <option value="contacted">Contacted</option>
                    <option value="proposal-sent">Proposal Sent</option>
                    <option value="closed-won">Closed-Won</option>
                    <option value="closed-lost">Closed-Lost</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOpportunityModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Add Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Deal Modal */}
      {showDealUpdateModal && selectedDeal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowDealUpdateModal(false)}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[10000]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowDealUpdateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Deal Stage</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              
              // Check for legal documents if trying to close the deal
              if (formData.stage === 'closed-won' && selectedDeal.stage !== 'closed-won') {
                const hasLegalDocs = checkLegalDocuments(selectedDeal.client);
                if (!hasLegalDocs) {
                  // Send notification to legal
                  notifyLegalDepartment(selectedDeal.client);
                  
                  // Show warning popup
                  alert(`⚠️ Cannot close deal for ${selectedDeal.client}\n\nRequired legal documents have not been uploaded:\n• Award Letter\n• Legal Agreement\n• SLA (Service Level Agreement)\n\nA notification has been sent to the Legal Department to upload the required documents.`);
                  return;
                }
              }
              
              const updatedDeal: Deal = {
                ...selectedDeal,
                stage: formData.stage,
                probability: formData.probability,
                closeDate: formData.closeDate,
              };
              setDeals(deals.map(d => d.id === selectedDeal.id ? updatedDeal : d));
              
              // Auto-create upgrade opportunities for missing modules if deal is updated to closed-won
              if (formData.stage === 'closed-won' && selectedDeal.modules && selectedDeal.modules.length > 0 && !selectedDeal.modules.includes('Complete Package - All Modules')) {
                const missingModules = availableModules.filter(
                  module => module !== 'Complete Package - All Modules' && !selectedDeal.modules?.includes(module)
                );
                
                // Check if opportunities for these modules already exist for this client
                const existingOpportunityModules = opportunities
                  .filter(opp => opp.clientId === selectedDeal.id)
                  .flatMap(opp => opp.modules || []);
                
                const newMissingModules = missingModules.filter(
                  module => !existingOpportunityModules.includes(module)
                );
                
                if (newMissingModules.length > 0) {
                  const newOpportunities = newMissingModules.map(module => ({
                    id: `${Date.now()}-${module}`,
                    clientId: selectedDeal.id,
                    clientName: selectedDeal.client,
                    type: 'Module Upgrade' as const,
                    modules: [module],
                    description: `Opportunity to upgrade ${selectedDeal.client} with ${module}`,
                    estimatedValue: '',
                    probability: 20,
                    status: 'identified' as const,
                    createdDate: new Date().toISOString().split('T')[0],
                  }));
                  
                  setOpportunities([...newOpportunities, ...opportunities]);
                }
              }
              
              setShowDealUpdateModal(false);
              alert('Deal updated successfully!');
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <input
                    type="text"
                    value={formData.client}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deal Stage *</label>
                    <select
                      required
                      value={formData.stage}
                      onChange={(e) => {
                        const stage = e.target.value as any;
                        let probability = formData.probability;
                        if (stage === 'qualified') probability = 20;
                        else if (stage === 'proposal') probability = 50;
                        else if (stage === 'demo') probability = 60;
                        else if (stage === 'poc') probability = 70;
                        else if (stage === 'negotiation') probability = 80;
                        else if (stage === 'legal') probability = 90;
                        else if (stage === 'closed-won') probability = 100;
                        setFormData({...formData, stage, probability});
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="qualified">Qualified</option>
                      <option value="proposal">Proposal</option>
                      <option value="demo">Demo/Presentation</option>
                      <option value="poc">POC/Trial</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="legal">Legal</option>
                      <option value="closed-won">Closed-Won</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Probability: {formData.probability}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={formData.probability}
                      onChange={(e) => setFormData({...formData, probability: parseInt(e.target.value)})}
                      className="w-full mt-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.closeDate}
                    onChange={(e) => setFormData({...formData, closeDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDealUpdateModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Update Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Deal Details Modal */}
      {showDealDetailsModal && selectedDeal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowDealDetailsModal(false)}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-[10000]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowDealDetailsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Deal Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Client Name</label>
                  <p className="mt-1 text-base text-gray-900">{selectedDeal.client}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Deal Value</label>
                  <p className="mt-1 text-base font-bold text-green-600">{selectedDeal.value}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Stage</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(selectedDeal.stage)}`}>
                      {selectedDeal.stage.toUpperCase().replace('-', ' ')}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Probability</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-base font-semibold text-gray-900">{selectedDeal.probability}%</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${selectedDeal.probability}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Expected Close Date</label>
                  <p className="mt-1 text-base text-gray-900">{selectedDeal.closeDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Contact Person</label>
                  <p className="mt-1 text-base text-gray-900">{selectedDeal.contact}</p>
                </div>
              </div>

              {selectedDeal.modules && selectedDeal.modules.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Selected Modules</label>
                  <div className="mt-2 space-y-2">
                    {selectedDeal.modules.map((module, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {module}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Related Opportunities</h3>
                {opportunities.filter(opp => opp.clientId === selectedDeal.id).length > 0 ? (
                  <div className="space-y-2">
                    {opportunities.filter(opp => opp.clientId === selectedDeal.id).map(opp => (
                      <div key={opp.id} className="bg-blue-50 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-blue-900">{opp.type}</p>
                            <p className="text-xs text-blue-700 mt-1">{opp.modules?.join(', ') || opp.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOpportunityStatusColor(opp.status)}`}>
                            {opp.status.toUpperCase().replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No related opportunities</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDealDetailsModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setFormData({
                    client: selectedDeal.client,
                    value: selectedDeal.value,
                    stage: selectedDeal.stage,
                    probability: selectedDeal.probability,
                    closeDate: selectedDeal.closeDate,
                    contact: selectedDeal.contact,
                    modules: selectedDeal.modules || [],
                  });
                  setShowDealDetailsModal(false);
                  setShowDealUpdateModal(true);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Update Stage
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
