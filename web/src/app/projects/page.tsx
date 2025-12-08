'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function ProjectsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showGanttModal, setShowGanttModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [closedClients, setClosedClients] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'on-track' | 'at-risk' | 'completed'>('all');
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    clientId: '',
    scopeOfWork: '',
    totalTasks: 0,
    description: '',
  });
  
  const [scopeTasks, setScopeTasks] = useState<Array<{
    id: string;
    title: string;
    description: string;
    estimatedHours: number;
    startDate: string;
    dueDate: string;
    completed: boolean;
  }>>([]);

  const [searchTerm, setSearchTerm] = useState('');

  // Fetch projects and clients from API
  useEffect(() => {
    fetchProjects();
    fetchClosedClients();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        // If no token, use sample data for demo
        setProjects(sampleProjects);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      } else {
        // Fallback to sample data if API fails
        setProjects(sampleProjects);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      // Use sample data as fallback
      setProjects(sampleProjects);
    } finally {
      setLoading(false);
    }
  };

  const fetchClosedClients = async () => {
    try {
      // First, check localStorage for sales_deals (closed-won)
      const salesDeals = localStorage.getItem('sales_deals');
      if (salesDeals) {
        try {
          const deals = JSON.parse(salesDeals);
          const closedWonDeals = deals
            .filter((deal: any) => deal.stage === 'closed-won')
            .map((deal: any, index: number) => ({
              _id: deal.id || `local-${index}`,
              clientName: deal.client,
              company: deal.client,
              email: deal.contact || `${deal.client.toLowerCase().replace(/\s+/g, '')}@company.com`
            }));
          
          if (closedWonDeals.length > 0) {
            setClosedClients(closedWonDeals);
            return;
          }
        } catch (e) {
          console.error('Error parsing sales_deals:', e);
        }
      }

      const token = localStorage.getItem('token');
      
      if (!token) {
        // Sample closed clients for demo
        setClosedClients([
          { _id: '1', clientName: 'GTBank', company: 'Guaranty Trust Bank', email: 'contact@gtbank.com' },
          { _id: '2', clientName: 'Access Bank', company: 'Access Bank Plc', email: 'info@accessbank.com' },
          { _id: '3', clientName: 'Zenith Bank', company: 'Zenith Bank Plc', email: 'support@zenithbank.com' },
          { _id: '4', clientName: 'UBA', company: 'United Bank for Africa', email: 'contact@ubagroup.com' }
        ]);
        return;
      }

      const response = await fetch(`${API_BASE}/sales/closed-clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClosedClients(data.data || []);
      } else {
        // Fallback to sample data
        setClosedClients([
          { _id: '1', clientName: 'GTBank', company: 'Guaranty Trust Bank', email: 'contact@gtbank.com' },
          { _id: '2', clientName: 'Access Bank', company: 'Access Bank Plc', email: 'info@accessbank.com' },
          { _id: '3', clientName: 'Zenith Bank', company: 'Zenith Bank Plc', email: 'support@zenithbank.com' },
          { _id: '4', clientName: 'UBA', company: 'United Bank for Africa', email: 'contact@ubagroup.com' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching closed clients:', err);
      setClosedClients([
        { _id: '1', clientName: 'GTBank', company: 'Guaranty Trust Bank', email: 'contact@gtbank.com' },
        { _id: '2', clientName: 'Access Bank', company: 'Access Bank Plc', email: 'info@accessbank.com' }
      ]);
    }
  };

  const sampleProjects = [
    { id: '1', name: 'GTBank Software Upgrade', progress: 75, status: 'on-track', tasksCompleted: 18, totalTasks: 24, team: 8, deadline: 'Dec 15, 2024' },
    { id: '2', name: 'Access Bank ATM Installation', progress: 45, status: 'delayed', tasksCompleted: 14, totalTasks: 32, team: 6, deadline: 'Dec 20, 2024' },
    { id: '3', name: 'Zenith Bank Maintenance Contract', progress: 90, status: 'on-track', tasksCompleted: 18, totalTasks: 20, team: 4, deadline: 'Dec 5, 2024' },
    { id: '4', name: 'UBA System Integration', progress: 30, status: 'at-risk', tasksCompleted: 12, totalTasks: 40, team: 10, deadline: 'Jan 15, 2025' },
  ];

  const milestones = [
    { project: 'Zenith Bank Maintenance', milestone: 'Final Testing', date: 'Dec 3, 2024', status: 'upcoming' },
    { project: 'GTBank Software Upgrade', milestone: 'Phase 2 Deployment', date: 'Dec 12, 2024', status: 'upcoming' },
    { project: 'Access Bank Installation', milestone: 'Site Survey Complete', date: 'Dec 18, 2024', status: 'pending' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-orange-100 text-orange-800';
      case 'at-risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track': return '✓';
      case 'delayed': return '⏰';
      case 'at-risk': return '⚠️';
      default: return '•';
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Creating project with data:', { formData, scopeTasks });
    
    // Validate that at least one task is added
    if (scopeTasks.length === 0) {
      alert('❌ Please add at least one task to the scope of work before creating the project.');
      return;
    }
    
    // Validate client is selected
    if (!formData.clientName || !formData.clientId) {
      alert('❌ Please select a client from the dropdown.');
      return;
    }
    

    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Fallback to localStorage for demo
        console.log('No token found, using localStorage');
        
        try {
          const newProject = {
            id: Date.now().toString(),
            name: formData.name,
            progress: Math.round((scopeTasks.filter(t => t.completed).length / scopeTasks.length) * 100),
            status: 'on-track',
            tasksCompleted: scopeTasks.filter(t => t.completed).length,
            totalTasks: scopeTasks.length,
            team: 1,
            deadline: scopeTasks.length > 0 
              ? new Date(Math.max(...scopeTasks.map(t => new Date(t.dueDate).getTime()))).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })
              : 'TBD',
            description: formData.description,
            clientName: formData.clientName,
            scopeTasks: scopeTasks,
          };
          
          console.log('Creating new project:', newProject);
          
          const updatedProjects = [...projects, newProject];
          setProjects(updatedProjects);
          
          try {
            localStorage.setItem('projects', JSON.stringify(updatedProjects));
            console.log('Project saved to localStorage');
          } catch (storageError) {
            console.error('Error saving to localStorage:', storageError);
            throw new Error('Failed to save project to storage');
          }
          
          // Success!
          alert('✅ Project created successfully!\n\n' + 
                `Project: ${formData.name}\n` +
                `Client: ${formData.clientName}\n` +
                `Tasks: ${scopeTasks.length}`);
          
          setShowAddModal(false);
          setScopeTasks([]);
          setFormData({
            name: '',
            clientName: '',
            clientId: '',
            scopeOfWork: '',
            totalTasks: 0,
            description: '',
          });
          
          return; // Exit after successful localStorage save
          
        } catch (localError: any) {
          console.error('Error creating project locally:', localError);
          throw localError;
        }
      }
      
      // Try API first, fallback to localStorage if it fails
      try {
        console.log('Token found, trying API');
        
        const response = await fetch(`${API_BASE}/projects`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            clientName: formData.clientName,
            clientId: formData.clientId,
            scopeOfWork: JSON.stringify(scopeTasks),
            description: formData.description,
            totalTasks: scopeTasks.length,
            team: [],
            tasks: scopeTasks,
            milestones: []
          }),
        });

        if (response.ok) {
          console.log('Project created via API');
          await fetchProjects(); // Refresh list
          
          // Success!
          alert('✅ Project created successfully!\n\n' + 
                `Project: ${formData.name}\n` +
                `Client: ${formData.clientName}\n` +
                `Tasks: ${scopeTasks.length}`);
          
          setShowAddModal(false);
          setScopeTasks([]);
          setFormData({
            name: '',
            clientName: '',
            clientId: '',
            scopeOfWork: '',
            totalTasks: 0,
            description: '',
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', errorData);
          throw new Error(errorData.error || 'Failed to create project via API');
        }
      } catch (apiError: any) {
        console.warn('API failed, falling back to localStorage:', apiError.message);
        
        // Fallback to localStorage if API fails
        try {
          const newProject = {
            id: Date.now().toString(),
            name: formData.name,
            progress: Math.round((scopeTasks.filter(t => t.completed).length / scopeTasks.length) * 100),
            status: 'on-track',
            tasksCompleted: scopeTasks.filter(t => t.completed).length,
            totalTasks: scopeTasks.length,
            team: 1,
            deadline: scopeTasks.length > 0 
              ? new Date(Math.max(...scopeTasks.map(t => new Date(t.dueDate).getTime()))).toLocaleDateString('en-US', { 
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : 'TBD',
            description: formData.description,
            clientName: formData.clientName,
            scopeTasks: scopeTasks,
          };
          
          const updatedProjects = [...projects, newProject];
          setProjects(updatedProjects);
          localStorage.setItem('projects', JSON.stringify(updatedProjects));
          
          // Success with fallback!
          alert('✅ Project created successfully (using local storage)!\n\n' + 
                `Project: ${formData.name}\n` +
                `Client: ${formData.clientName}\n` +
                `Tasks: ${scopeTasks.length}\n\n` +
                `Note: API unavailable, saved locally.`);
          
          setShowAddModal(false);
          setScopeTasks([]);
          setFormData({
            name: '',
            clientName: '',
            clientId: '',
            scopeOfWork: '',
            totalTasks: 0,
            description: '',
          });
          
          return; // Exit successfully after fallback
        } catch (fallbackError: any) {
          console.error('Fallback also failed:', fallbackError);
          throw new Error('Failed to save project: ' + fallbackError.message);
        }
      }
    } catch (err: any) {
      console.error('Error creating project:', err);
      alert('❌ Failed to create project: ' + (err.message || 'Unknown error'));
      setError('Failed to create project: ' + (err.message || 'Unknown error'));
    }
  };

  const handleViewDetails = async (project: any) => {
    setSelectedProject(project);
    
    try {
      const token = localStorage.getItem('token');
      
      if (token && project._id) {
        // Fetch fresh project data from API
        const response = await fetch(`${API_BASE}/projects/${project._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSelectedProject(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching project details:', err);
    }
    
    const projectInfo = `
Project Details:

Name: ${selectedProject?.name || project.name}
Progress: ${project.progress}%
Status: ${project.status}
Tasks: ${project.tasksCompleted}/${project.totalTasks}
Team: ${project.team || project.teamSize} members
Deadline: ${project.deadline}

${project.description || 'No description available'}

${project.risks && project.risks.length > 0 ? '\nRisks:\n' + project.risks.join('\n') : ''}
${project.recommendations && project.recommendations.length > 0 ? '\nRecommendations:\n' + project.recommendations.join('\n') : ''}
    `.trim();
    
    alert(projectInfo);
  };

  const handleProjectReport = () => {
    setShowReportModal(true);
  };

  const handleTimelineView = () => {
    setShowTimelineModal(true);
  };

  const handleGanttChart = () => {
    setShowGanttModal(true);
  };

  const handleAnalyzeProject = async (projectId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login to use AI analysis features');
        return;
      }

      const response = await fetch(`${API_BASE}/projects/${projectId}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`AI Analysis Results:\n\n${JSON.stringify(data.data, null, 2)}`);
        await fetchProjects(); // Refresh to show updated risks/recommendations
      } else {
        throw new Error('Analysis failed');
      }
    } catch (err) {
      console.error('Error analyzing project:', err);
      alert('Failed to analyze project. Please try again.');
    }
  };

  const stats = {
    active: projects.filter(p => p.progress < 100).length,
    onTrack: projects.filter(p => p.status === 'on-track' && p.progress < 100).length,
    atRisk: projects.filter(p => (p.status === 'delayed' || p.status === 'at-risk') && p.progress < 100).length,
    completed: projects.filter(p => p.progress === 100).length,
  };

  // Filter projects based on selected filter
  const filteredProjects = projects.filter(project => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return project.progress < 100;
    if (filterStatus === 'on-track') return project.status === 'on-track' && project.progress < 100;
    if (filterStatus === 'at-risk') return (project.status === 'delayed' || project.status === 'at-risk') && project.progress < 100;
    if (filterStatus === 'completed') return project.progress === 100;
    return true;
  });

  const handleFilterChange = (status: 'all' | 'active' | 'on-track' | 'at-risk' | 'completed') => {
    setFilterStatus(status);
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Project Manager</h1>
              <p className="mt-1 text-sm text-gray-600">ATM installation and software projects</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              + New Project
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <button 
                  onClick={() => setFilterStatus(filterStatus === 'active' ? 'all' : 'active')}
                  className={`bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow cursor-pointer ${
                    filterStatus === 'active' ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-600">Active Projects</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{stats.active}</div>
                  {filterStatus === 'active' && (
                    <div className="text-xs text-blue-600 mt-1">Filtered ✓</div>
                  )}
                </button>
                <button 
                  onClick={() => setFilterStatus(filterStatus === 'on-track' ? 'all' : 'on-track')}
                  className={`bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow cursor-pointer ${
                    filterStatus === 'on-track' ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-600">On Track</div>
                  <div className="text-3xl font-bold text-green-600 mt-2">{stats.onTrack}</div>
                  {filterStatus === 'on-track' && (
                    <div className="text-xs text-green-600 mt-1">Filtered ✓</div>
                  )}
                </button>
                <button 
                  onClick={() => setFilterStatus(filterStatus === 'at-risk' ? 'all' : 'at-risk')}
                  className={`bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow cursor-pointer ${
                    filterStatus === 'at-risk' ? 'ring-2 ring-red-500' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-600">At Risk</div>
                  <div className="text-3xl font-bold text-red-600 mt-2">{stats.atRisk}</div>
                  {filterStatus === 'at-risk' && (
                    <div className="text-xs text-red-600 mt-1">Filtered ✓</div>
                  )}
                </button>
                <button 
                  onClick={() => setFilterStatus(filterStatus === 'completed' ? 'all' : 'completed')}
                  className={`bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow cursor-pointer ${
                    filterStatus === 'completed' ? 'ring-2 ring-gray-500' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-600">Completed</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{stats.completed}</div>
                  {filterStatus === 'completed' && (
                    <div className="text-xs text-gray-600 mt-1">Filtered ✓</div>
                  )}
                </button>
              </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Projects */}
            <div className="lg:col-span-2 space-y-4">
              {filterStatus !== 'all' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm text-blue-800">
                    Showing {filteredProjects.length} {filterStatus.replace('-', ' ')} project{filteredProjects.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear Filter ✕
                  </button>
                </div>
              )}
              {filteredProjects.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-500 text-lg">No projects found for this filter.</p>
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Show All Projects
                  </button>
                </div>
              ) : (
                filteredProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600">{project.tasksCompleted}/{project.totalTasks} tasks · {project.team} team members</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(project.status)}`}>
                      <span>{getStatusIcon(project.status)}</span>
                      {project.status.toUpperCase().replace('-', ' ')}
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className={`h-3 rounded-full ${
                        project.status === 'on-track' ? 'bg-green-600' :
                        project.status === 'delayed' ? 'bg-orange-600' : 'bg-red-600'
                      }`} style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Deadline: <span className="font-medium text-gray-900">{project.deadline}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setSelectedProject(project);
                          setShowTasksModal(true);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-medium"
                      >
                        ✓ Tasks
                      </button>
                      <button 
                        onClick={() => handleViewDetails(project)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>

            {/* Milestones */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Milestones</h3>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="border-l-4 border-blue-600 pl-4 py-2">
                    <div className="font-medium text-gray-900">{milestone.milestone}</div>
                    <div className="text-sm text-gray-600">{milestone.project}</div>
                    <div className="text-sm text-gray-500 mt-1">{milestone.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium"
            >
              New Project
            </button>
            <button 
              onClick={handleProjectReport}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium"
            >
              Project Report
            </button>
            <button 
              onClick={handleTimelineView}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium"
            >
              Timeline View
            </button>
            <button 
              onClick={handleGanttChart}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium"
            >
              Gantt Chart
            </button>
          </div>
            </>
          )}
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., GTBank Software Upgrade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => {
                      const client = closedClients.find(c => c._id === e.target.value);
                      setFormData({
                        ...formData, 
                        clientId: e.target.value,
                        clientName: client ? client.clientName : ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value="">Select a client from closed sales...</option>
                    {closedClients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.clientName} - {client.company}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Only clients from closed-won sales are shown</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scope of Work / Tasks <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                    {/* Task Input Form */}
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <input
                          type="text"
                          placeholder="Task title..."
                          className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          id="newTaskTitle"
                        />
                        <input
                          type="text"
                          placeholder="Description..."
                          className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          id="newTaskDesc"
                        />
                        <input
                          type="date"
                          placeholder="Start date"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          id="newTaskStart"
                        />
                        <input
                          type="date"
                          placeholder="Due date"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          id="newTaskDue"
                        />
                        <input
                          type="number"
                          placeholder="Estimated hours"
                          min="1"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          id="newTaskHours"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const title = (document.getElementById('newTaskTitle') as HTMLInputElement).value;
                            const description = (document.getElementById('newTaskDesc') as HTMLInputElement).value;
                            const startDate = (document.getElementById('newTaskStart') as HTMLInputElement).value;
                            const dueDate = (document.getElementById('newTaskDue') as HTMLInputElement).value;
                            const estimatedHours = parseInt((document.getElementById('newTaskHours') as HTMLInputElement).value) || 0;
                            
                            if (title && startDate && dueDate) {
                              const newTask = {
                                id: Date.now().toString(),
                                title,
                                description,
                                startDate,
                                dueDate,
                                estimatedHours,
                                completed: false
                              };
                              setScopeTasks([...scopeTasks, newTask]);
                              setFormData({...formData, totalTasks: scopeTasks.length + 1});
                              
                              // Clear inputs
                              (document.getElementById('newTaskTitle') as HTMLInputElement).value = '';
                              (document.getElementById('newTaskDesc') as HTMLInputElement).value = '';
                              (document.getElementById('newTaskStart') as HTMLInputElement).value = '';
                              (document.getElementById('newTaskDue') as HTMLInputElement).value = '';
                              (document.getElementById('newTaskHours') as HTMLInputElement).value = '';
                            } else {
                              alert('Please fill in task title, start date, and due date');
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          + Add Task
                        </button>
                      </div>
                    </div>

                    {/* Tasks List with Checkboxes */}
                    <div className="space-y-2">
                      {scopeTasks.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No tasks added yet. Add tasks above to define scope of work.</p>
                      ) : (
                        scopeTasks.map((task) => (
                          <div key={task.id} className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-md hover:border-blue-300">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={(e) => {
                                setScopeTasks(scopeTasks.map(t => 
                                  t.id === task.id ? {...t, completed: e.target.checked} : t
                                ));
                              }}
                              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className={`font-medium text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                  {task.title}
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setScopeTasks(scopeTasks.filter(t => t.id !== task.id));
                                    setFormData({...formData, totalTasks: scopeTasks.length - 1});
                                  }}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  Remove
                                </button>
                              </div>
                              {task.description && (
                                <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                              )}
                              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                <span>📅 {task.startDate} → {task.dueDate}</span>
                                <span>⏱️ {task.estimatedHours}h</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Total Tasks: {scopeTasks.length} | Completed: {scopeTasks.filter(t => t.completed).length}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Project description and objectives..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Tasks</label>
                    <input
                      type="number"
                      readOnly
                      value={scopeTasks.length}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                      title="Auto-calculated from tasks added above"
                    />
                    <p className="mt-1 text-xs text-gray-500">Auto-calculated from tasks above</p>
                  </div>
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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Project Summary Report</h2>
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Overall Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Total Projects</div>
                  <div className="text-2xl font-bold text-blue-900">{projects.length}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">On Track</div>
                  <div className="text-2xl font-bold text-green-900">
                    {projects.filter(p => p.status === 'on-track').length}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600 font-medium">At Risk</div>
                  <div className="text-2xl font-bold text-red-900">
                    {projects.filter(p => p.status === 'at-risk').length}
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Project Breakdown</h3>
                <div className="space-y-3">
                  {projects.map(project => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{project.name}</h4>
                          <p className="text-sm text-gray-600">
                            {project.tasksCompleted}/{project.totalTasks} tasks completed
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status.toUpperCase().replace('-', ' ')}
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  alert('Report export feature coming soon!');
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Export Report
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline View Modal */}
      {showTimelineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Project Timeline</h2>
              <button 
                onClick={() => setShowTimelineModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {projects.map((project, index) => {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - Math.floor(project.progress * 0.3));
                
                return (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        <p className="text-sm text-gray-600">
                          {startDate.toLocaleDateString()} → {project.deadline}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.progress}%
                      </span>
                    </div>
                    
                    {/* Timeline bar */}
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                        <div 
                          className={`h-8 rounded-full transition-all ${
                            project.status === 'on-track' ? 'bg-green-500' :
                            project.status === 'delayed' ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                            {project.progress > 10 && `${project.tasksCompleted}/${project.totalTasks} tasks`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowTimelineModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gantt Chart Modal */}
      {showGanttModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Gantt Chart View</h2>
              <button 
                onClick={() => setShowGanttModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {/* Gantt Chart */}
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-3 font-medium text-gray-700">Project</div>
                  <div className="col-span-9 grid grid-cols-12 text-center text-xs text-gray-600">
                    {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 
                      'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'].map((week) => (
                      <div key={week}>{week}</div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                {projects.map((project, index) => {
                  const duration = Math.ceil(project.totalTasks / 2); // Weeks
                  const startWeek = index * 2;
                  
                  return (
                    <div key={project.id} className="grid grid-cols-12 gap-2 mb-3">
                      <div className="col-span-3">
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                        <div className="text-xs text-gray-600">{project.team} members</div>
                      </div>
                      <div className="col-span-9 grid grid-cols-12 gap-1">
                        {Array.from({ length: 12 }, (_, i) => {
                          const isInRange = i >= startWeek && i < startWeek + duration;
                          const isCompleted = i < startWeek + (duration * project.progress / 100);
                          
                          return (
                            <div 
                              key={i} 
                              className={`h-8 rounded ${
                                isCompleted ? 'bg-blue-600' :
                                isInRange ? 'bg-blue-200' : 'bg-gray-100'
                              }`}
                            ></div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-200 rounded"></div>
                  <span>Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span>Not Started</span>
                </div>
              </div>
              <button
                onClick={() => setShowGanttModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Management Modal */}
      {showTasksModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Tasks - {selectedProject.name}
              </h2>
              <button 
                onClick={() => setShowTasksModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600">Progress: </span>
                  <span className="font-semibold text-blue-600">{selectedProject.progress}%</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Completed: </span>
                  <span className="font-semibold">{selectedProject.tasksCompleted}/{selectedProject.totalTasks}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {selectedProject.scopeTasks && selectedProject.scopeTasks.length > 0 ? (
                selectedProject.scopeTasks.map((task: any) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed || false}
                        onChange={() => {
                          // Update task completion in localStorage
                          const updatedProject = {
                            ...selectedProject,
                            scopeTasks: selectedProject.scopeTasks.map((t: any) =>
                              t.id === task.id ? { ...t, completed: !t.completed } : t
                            )
                          };
                          
                          // Update completed count
                          updatedProject.tasksCompleted = updatedProject.scopeTasks.filter((t: any) => t.completed).length;
                          updatedProject.progress = Math.round((updatedProject.tasksCompleted / updatedProject.totalTasks) * 100);
                          
                          // Save to localStorage
                          const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
                          const updatedProjects = allProjects.map((p: any) =>
                            p.id === selectedProject.id ? updatedProject : p
                          );
                          localStorage.setItem('projects', JSON.stringify(updatedProjects));
                          
                          // Update state
                          setSelectedProject(updatedProject);
                          setProjects(updatedProjects);
                        }}
                        className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      
                      <div className="flex-1">
                        <div className={`font-medium text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">📅 Start:</span>
                            <span className="font-medium text-gray-900">{task.startDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">📅 Due:</span>
                            <span className="font-medium text-gray-900">{task.dueDate}</span>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <span className="text-gray-600">⏱️ Estimated:</span>
                          <span className="font-medium text-blue-600">{task.estimatedHours} hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : selectedProject.tasks && selectedProject.tasks.length > 0 ? (
                selectedProject.tasks.map((task: any) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.isCompleted || false}
                      onChange={async (e) => {
                        const token = localStorage.getItem('token');
                        if (!token) {
                          alert('Please login to update tasks');
                          return;
                        }

                        try {
                          const response = await fetch(
                            `${API_BASE}/projects/${selectedProject._id}/tasks/${task.id}`,
                            {
                              method: 'PUT',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                isCompleted: e.target.checked
                              }),
                            }
                          );

                          if (response.ok) {
                            const data = await response.json();
                            // Update local state
                            setSelectedProject({
                              ...selectedProject,
                              progress: data.data.progress,
                              tasksCompleted: data.data.tasksCompleted,
                              tasks: selectedProject.tasks.map((t: any) => 
                                t.id === task.id ? { ...t, isCompleted: e.target.checked } : t
                              )
                            });
                            await fetchProjects(); // Refresh project list
                          }
                        } catch (err) {
                          console.error('Error updating task:', err);
                          alert('Failed to update task');
                        }
                      }}
                      className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    
                    <div className="flex-1">
                      <div className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.description}
                      </div>
                      
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-gray-600">Start Date:</label>
                          <input
                            type="date"
                            value={task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : ''}
                            className="ml-2 px-2 py-1 border border-gray-300 rounded text-gray-900"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-gray-600">Due Date:</label>
                          <input
                            type="date"
                            value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                            className="ml-2 px-2 py-1 border border-gray-300 rounded text-gray-900"
                            readOnly
                          />
                        </div>
                      </div>

                      {task.timeline && (
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div className="text-gray-600">
                            Est. Hours: <span className="font-medium text-gray-900">{task.timeline.estimatedHours || 0}h</span>
                          </div>
                          <div className="text-gray-600">
                            Actual Hours: <span className="font-medium text-gray-900">{task.timeline.actualHours || 0}h</span>
                          </div>
                        </div>
                      )}

                      {task.assignedTo && (
                        <div className="mt-2 text-sm text-gray-600">
                          Assigned to: <span className="font-medium text-gray-900">{task.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg font-medium">No tasks defined for this project yet.</p>
                  <p className="text-sm mt-2">Tasks will appear here once they are added to the project.</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowTasksModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Add Task feature - Coming soon!');
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                + Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
