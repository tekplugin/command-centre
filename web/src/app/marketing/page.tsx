'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function MarketingPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmailBlastModal, setShowEmailBlastModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    channel: '',
    budget: '',
    startDate: '',
    endDate: '',
    targetAudience: '',
  });

  // Load campaigns from localStorage
  useEffect(() => {
    const savedCampaigns = localStorage.getItem('marketing_campaigns');
    if (savedCampaigns) {
      try {
        setCampaigns(JSON.parse(savedCampaigns));
      } catch (e) {
        console.error('Error loading campaigns:', e);
      }
    }

    // Load leads
    const savedLeads = localStorage.getItem('marketing_leads');
    if (savedLeads) {
      try {
        setLeads(JSON.parse(savedLeads));
      } catch (e) {
        console.error('Error loading leads:', e);
      }
    }
  }, []);

  // Calculate dynamic stats from actual data
  const totalLeadsCount = leads.length;
  const leadSourceCounts = leads.reduce((acc: any, lead: any) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {});

  const leadSources = Object.entries(leadSourceCounts).map(([source, count]: [string, any]) => ({
    source,
    count,
    color: source === 'LinkedIn' ? 'bg-blue-600' :
           source === 'Email' ? 'bg-green-600' :
           source === 'Google Ads' ? 'bg-yellow-600' :
           source === 'Referral' ? 'bg-purple-600' : 'bg-gray-600',
  }));

  const convertedLeads = leads.filter((l: any) => l.status === 'converted').length;
  const conversionRate = totalLeadsCount > 0 ? (convertedLeads / totalLeadsCount) * 100 : 0;

  const stats = {
    totalLeads: totalLeadsCount,
    conversions: convertedLeads,
    conversionRate: parseFloat(conversionRate.toFixed(1)),
    activeCampaigns: campaigns.filter((c: any) => c.status === 'active').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Marketing Campaigns</h1>
              <p className="mt-1 text-sm text-gray-600">Track campaigns and lead generation</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              + New Campaign
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Total Leads</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLeads}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Conversions</div>
              <div className="text-3xl font-bold text-green-600 mt-2">{stats.conversions}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Conversion Rate</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">{stats.conversionRate}%</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Active Campaigns</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{stats.activeCampaigns}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Campaigns */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3>
              </div>
              <div className="divide-y">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                        <p className="text-sm text-gray-600">{campaign.channel}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{campaign.leads}</div>
                        <div className="text-xs text-gray-600">Leads</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{campaign.conversions}</div>
                        <div className="text-xs text-gray-600">Conversions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{campaign.budget}</div>
                        <div className="text-xs text-gray-600">Budget</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Conversion Rate: <span className="font-semibold">{((campaign.conversions / campaign.leads) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lead Sources */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources</h3>
              <div className="space-y-4">
                {leadSources.map((source) => (
                  <div key={source.source}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{source.source}</span>
                      <span className="text-gray-900 font-semibold">{source.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${source.color}`} style={{ width: `${(source.count / stats.totalLeads) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              <span>📢</span>
              New Campaign
            </button>
            <button 
              onClick={() => setShowEmailBlastModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              <span>📧</span>
              Email Blast
            </button>
            <button 
              onClick={() => setShowAnalyticsModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              <span>📊</span>
              Analytics
            </button>
            <button 
              onClick={() => setShowLeadsModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              <span>👥</span>
              Manage Leads
            </button>
          </div>
        </div>
      </div>

      {/* Add Campaign Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Campaign</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              // TODO: Submit to backend API
              console.log('New campaign:', formData);
              setShowAddModal(false);
              setFormData({
                name: '',
                channel: '',
                budget: '',
                startDate: '',
                endDate: '',
                targetAudience: '',
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., Q4 ATM Software Promotion"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({...formData, channel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    required
                  >
                    <option value="">Select channel</option>
                    <option value="Email">Email</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Event">Event</option>
                    <option value="Direct Mail">Direct Mail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₦)</label>
                  <input
                    type="text"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., 500K"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Describe target audience..."
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
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Blast Modal */}
      {showEmailBlastModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Send Email Blast</h2>
              <button onClick={() => setShowEmailBlastModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              alert(`Email Blast Sent!\n\nTo: ${formData.get('recipients')}\nSubject: ${formData.get('subject')}\nRecipients: ${formData.get('recipientCount')}`);
              setShowEmailBlastModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign</label>
                  <select name="campaign" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white text-gray-900">
                    <option value="">Select campaign</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    <option value="new">Create New Campaign</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                  <select name="recipients" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white text-gray-900">
                    <option value="">Select recipients</option>
                    <option value="all-leads">All Leads ({leads.length})</option>
                    <option value="qualified">Qualified Leads</option>
                    <option value="prospects">Prospects</option>
                    <option value="customers">Existing Customers</option>
                    <option value="custom">Custom List</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                    placeholder="e.g., Special Offer: 20% Off ATM Maintenance Services"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Body *</label>
                  <textarea
                    name="body"
                    required
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                    placeholder="Write your email message here..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Send Time</label>
                    <select name="sendTime" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white text-gray-900">
                      <option value="now">Send Now</option>
                      <option value="scheduled">Schedule for Later</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Recipients</label>
                    <input
                      type="number"
                      name="recipientCount"
                      value={leads.length}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Personalize your email with merge tags like [FirstName], [Company], and [Industry] for better engagement.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailBlastModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  📧 Send Email Blast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Marketing Analytics</h2>
              <button onClick={() => setShowAnalyticsModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-blue-700">Total Leads</div>
                  <div className="text-3xl font-bold text-blue-900 mt-1">{stats.totalLeads}</div>
                  <div className="text-xs text-blue-600 mt-1">↑ 23% vs last month</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-green-700">Conversions</div>
                  <div className="text-3xl font-bold text-green-900 mt-1">{stats.conversions}</div>
                  <div className="text-xs text-green-600 mt-1">↑ 15% vs last month</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-purple-700">Conversion Rate</div>
                  <div className="text-3xl font-bold text-purple-900 mt-1">{stats.conversionRate}%</div>
                  <div className="text-xs text-purple-600 mt-1">↓ 2% vs last month</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-orange-700">ROI</div>
                  <div className="text-3xl font-bold text-orange-900 mt-1">3.2x</div>
                  <div className="text-xs text-orange-600 mt-1">↑ 18% vs last month</div>
                </div>
              </div>

              {/* Campaign Performance */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Campaign Performance</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leads</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conv.</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{campaign.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{campaign.channel}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{campaign.leads}</td>
                          <td className="px-4 py-3 text-sm text-green-600 font-medium">{campaign.conversions}</td>
                          <td className="px-4 py-3 text-sm text-blue-600 font-medium">
                            {((campaign.conversions / campaign.leads) * 100).toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{campaign.budget}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lead Sources Chart */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Lead Sources Breakdown</h3>
                <div className="space-y-3">
                  {leadSources.map((source) => (
                    <div key={source.source} className="flex items-center gap-3">
                      <div className="w-24 text-sm font-medium text-gray-700">{source.source}</div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-8 relative">
                          <div 
                            className={`h-8 rounded-full ${source.color} flex items-center justify-end pr-3 text-white text-sm font-medium`} 
                            style={{ width: `${(source.count / stats.totalLeads) * 100}%` }}
                          >
                            {source.count}
                          </div>
                        </div>
                      </div>
                      <div className="w-16 text-sm text-gray-600 text-right">
                        {((source.count / stats.totalLeads) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Close
              </button>
              <button
                onClick={() => alert('Analytics report exported!')}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium"
              >
                📊 Export Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Leads Modal */}
      {showLeadsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Manage Leads</h2>
              <button onClick={() => setShowLeadsModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="mb-4 flex gap-3">
              <button
                onClick={() => setShowAddLeadForm(!showAddLeadForm)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {showAddLeadForm ? '✕ Cancel' : '+ Add Lead'}
              </button>
              <input
                type="text"
                placeholder="Search leads..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
              />
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900">
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
              </select>
            </div>

            {/* Add Lead Form */}
            {showAddLeadForm && (
              <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-3">Add New Lead</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newLead = {
                    id: Date.now().toString(),
                    name: formData.get('name') as string,
                    company: formData.get('company') as string,
                    email: formData.get('email') as string,
                    phone: formData.get('phone') as string,
                    source: formData.get('source') as string,
                    status: formData.get('status') as string,
                    notes: formData.get('notes') as string,
                    createdAt: new Date().toISOString(),
                  };
                  const updated = [...leads, newLead];
                  setLeads(updated);
                  localStorage.setItem('marketing_leads', JSON.stringify(updated));
                  alert('✅ Lead added successfully!');
                  setShowAddLeadForm(false);
                  e.currentTarget.reset();
                }}>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-orange-900 mb-1">Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-3 py-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-900 mb-1">Company *</label>
                      <input
                        type="text"
                        name="company"
                        required
                        className="w-full px-3 py-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                        placeholder="ABC Company"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-900 mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-3 py-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-orange-900 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        className="w-full px-3 py-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                        placeholder="+234 801 234 5678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-900 mb-1">Source *</label>
                      <select
                        name="source"
                        required
                        className="w-full px-3 py-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                      >
                        <option value="Manual Entry">Manual Entry</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Email">Email</option>
                        <option value="Google Ads">Google Ads</option>
                        <option value="Referral">Referral</option>
                        <option value="Website">Website</option>
                        <option value="Trade Show">Trade Show</option>
                        <option value="Cold Call">Cold Call</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-900 mb-1">Status *</label>
                      <select
                        name="status"
                        required
                        className="w-full px-3 py-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="converted">Converted</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-orange-900 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      rows={2}
                      className="w-full px-3 py-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                      placeholder="Additional notes about this lead..."
                    />
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddLeadForm(false)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Save Lead
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="border rounded-lg overflow-hidden">
              {leads.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{lead.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{lead.company}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{lead.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{lead.source}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                            lead.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                            lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {lead.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => alert(`View details for ${lead.name}`)}
                            className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete lead: ${lead.name}?`)) {
                                const updated = leads.filter(l => l.id !== lead.id);
                                setLeads(updated);
                                localStorage.setItem('marketing_leads', JSON.stringify(updated));
                              }
                            }}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No leads yet</p>
                  <p className="text-sm mt-2">Add your first lead by clicking "Add Lead" above</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowLeadsModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
