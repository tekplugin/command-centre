'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

interface Document {
  id: string;
  title: string;
  category: string;
  type: string;
  clientName?: string;
  employeeName?: string; // For staff documents
  employeeId?: string; // For staff documents
  uploadDate: string;
  expiryDate?: string;
  fileSize: string;
  fileUrl?: string;
  description: string;
  tags: string[];
  status: 'active' | 'expired' | 'expiring-soon';
}

export default function LegalPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [clientSearchQuery, setClientSearchQuery] = useState('all');
  const [viewMode, setViewMode] = useState<'internal' | 'client' | 'staff'>('internal');
  const [uploadData, setUploadData] = useState({
    title: '',
    category: '',
    type: '',
    clientName: '',
    employeeName: '', // For staff documents
    employeeId: '', // For staff documents
    expiryDate: '',
    description: '',
    tags: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCloseSaleModal, setShowCloseSaleModal] = useState(false);
  const [selectedClientForClose, setSelectedClientForClose] = useState<string>('');

  // Required documents for closing a sale
  const REQUIRED_DOCS_FOR_CLOSE = ['Award Letter', 'Legal Agreement', 'SLA (Service Level Agreement)'];

  // Storage helper functions to prevent quota exceeded errors
  const saveDocumentsToStorage = (docs: Document[]) => {
    try {
      // Only store document metadata, not large file data
      const metadata = docs.map(doc => ({
        ...doc,
        fileUrl: undefined, // Don't store large base64 data
      }));
      sessionStorage.setItem('legal_documents_meta', JSON.stringify(metadata));
    } catch (e) {
      console.warn('Storage quota exceeded, continuing without cache:', e);
      // Clear old data and try again
      sessionStorage.removeItem('legal_documents_meta');
    }
  };

  const loadDocumentsFromStorage = () => {
    try {
      const saved = sessionStorage.getItem('legal_documents_meta');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading documents:', e);
      sessionStorage.removeItem('legal_documents_meta');
    }
    return [];
  };


  // Load documents from backend API
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    async function fetchLegalDocuments() {
      try {
        const res = await fetch(`${apiUrl}/legal/documents`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (res.ok) {
          setDocuments(await res.json());
        }
      } catch (e) {
        console.error('Error loading legal documents:', e);
      }
    }
    fetchLegalDocuments();
  }, []);

  // Check document expiry status
  const getDocumentStatus = (expiryDate?: string): 'active' | 'expired' | 'expiring-soon' => {
    if (!expiryDate) return 'active';
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring-soon';
    return 'active';
  };

  const categories = [
    'Staff Document - NDA',
    'Staff Document - Offer Letter',
    'Staff Document - Employment Contract',
    'Staff Document - Certificate',
    'Staff Document - ID/Passport',
    'Staff Document - Reference Letter',
    'Staff Document - Other',
    'SLA (Service Level Agreement)',
    'Contract',
    'Award Letter',
    'CAC Document',
    'Certificate',
    'License',
    'Insurance',
    'Legal Agreement',
    'Compliance Document',
    'Other',
  ];

  const documentTypes = [
    'PDF',
    'Word Document',
    'Image',
    'Scanned Document',
    'Other',
  ];

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }
    
    // Auto-generate title for staff documents
    let documentTitle = uploadData.title;
    if (uploadData.category.startsWith('Staff Document') && uploadData.employeeName && uploadData.employeeId) {
      const categoryName = uploadData.category.replace('Staff Document - ', '');
      documentTitle = `${categoryName} - ${uploadData.employeeName} (${uploadData.employeeId})`;
    }
    
    // Create document without storing file content to prevent quota issues
    // In production, file would be uploaded to server/cloud storage
    const newDocument: Document = {
      id: Date.now().toString(),
      title: documentTitle,
      category: uploadData.category,
      type: uploadData.type,
      clientName: uploadData.clientName || undefined,
      employeeName: uploadData.employeeName || undefined,
      employeeId: uploadData.employeeId || undefined,
      uploadDate: new Date().toISOString().split('T')[0],
      expiryDate: uploadData.expiryDate || undefined,
      fileSize: `${(selectedFile.size / 1024).toFixed(2)} KB`,
      fileUrl: undefined, // Don't store base64 to prevent quota issues
      description: uploadData.description,
      tags: uploadData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      status: getDocumentStatus(uploadData.expiryDate || undefined),
    };

    setDocuments([newDocument, ...documents]);
    setShowUploadModal(false);
    setUploadData({
      title: '',
      category: '',
      type: '',
      clientName: '',
      employeeName: '',
      employeeId: '',
      expiryDate: '',
      description: '',
        tags: '',
      });
      setSelectedFile(null);

      alert('Document uploaded successfully!');
  };

  // Extract unique client names for dropdown
  const uniqueClients = Array.from(new Set(
    documents
      .map(doc => doc.clientName)
      .filter(name => name && name.trim() !== '')
  )).sort();

  // Separate internal, client, and staff documents
  const internalDocuments = documents.filter(doc => 
    !doc.clientName && !doc.employeeId && (!doc.category || !doc.category.startsWith('Staff Document'))
  );
  const clientDocuments = documents.filter(doc => doc.clientName && doc.clientName.trim() !== '');
  const staffDocuments = documents.filter(doc => 
    doc.employeeId || doc.employeeName || (doc.category && doc.category.startsWith('Staff Document'))
  );

  const filteredDocuments = (() => {
    let docsToFilter = internalDocuments;
    if (viewMode === 'client') docsToFilter = clientDocuments;
    if (viewMode === 'staff') docsToFilter = staffDocuments;
    
    return docsToFilter.filter(doc => {
      const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
      const matchesClientSearch = viewMode !== 'client' || clientSearchQuery === 'all' || clientSearchQuery === '' || 
                                 (doc.clientName && doc.clientName === clientSearchQuery);
      const matchesSearch = searchQuery === '' ||
                           doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (doc.employeeName && doc.employeeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           (doc.employeeId && doc.employeeId.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesClientSearch && matchesSearch;
    });
  })();

  // Check if client has all required documents for closing sale
  const checkClientDocuments = (clientName: string) => {
    const clientDocs = documents.filter(d => d.clientName === clientName);
    const missingDocs: string[] = [];
    
    REQUIRED_DOCS_FOR_CLOSE.forEach(requiredCategory => {
      const hasDoc = clientDocs.some(d => d.category === requiredCategory);
      if (!hasDoc) {
        missingDocs.push(requiredCategory);
      }
    });
    
    return {
      hasAllDocs: missingDocs.length === 0,
      missingDocs,
      existingDocs: clientDocs.filter(d => REQUIRED_DOCS_FOR_CLOSE.includes(d.category))
    };
  };

  // Get list of clients in Legal stage
  const getClientsInLegalStage = () => {
    try {
      const savedDeals = localStorage.getItem('sales_deals');
      if (savedDeals) {
        const deals = JSON.parse(savedDeals);
        return deals
          .filter((deal: any) => deal.stage === 'legal')
          .map((deal: any) => ({ id: deal.id, client: deal.client }));
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
    return [];
  };

  // Close sale and move to closed-won
  const handleCloseSale = (clientName: string) => {
    const check = checkClientDocuments(clientName);
    
    if (!check.hasAllDocs) {
      alert(`Cannot close sale. Missing required documents:\n\n${check.missingDocs.join('\n')}\n\nPlease upload all required documents before closing.`);
      return false;
    }

    try {
      const savedDeals = localStorage.getItem('sales_deals');
      if (savedDeals) {
        const deals = JSON.parse(savedDeals);
        const updatedDeals = deals.map((deal: any) => {
          if (deal.client === clientName && deal.stage === 'legal') {
            return { ...deal, stage: 'closed-won', probability: 100 };
          }
          return deal;
        });
        localStorage.setItem('sales_deals', JSON.stringify(updatedDeals));
        alert(`✅ Sale closed successfully for ${clientName}!\n\nAll required documents verified:\n${REQUIRED_DOCS_FOR_CLOSE.join('\n')}\n\nClient moved to Closed-Won stage.`);
        setShowCloseSaleModal(false);
        setSelectedClientForClose('');
        return true;
      }
    } catch (error) {
      console.error('Error closing sale:', error);
      alert('Error closing sale. Please try again.');
    }
    return false;
  };

  const documentStats = {
    total: documents.length,
    internal: internalDocuments.length,
    client: clientDocuments.length,
    staff: staffDocuments.length,
    active: documents.filter(d => d.status === 'active').length,
    expiringSoon: documents.filter(d => d.status === 'expiring-soon').length,
    expired: documents.filter(d => d.status === 'expired').length,
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Legal Document Management</h1>
              <p className="mt-1 text-sm text-gray-600">Manage all company legal documents, contracts, and certificates</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCloseSaleModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                🎯 Close Sale
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'staff' 
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : viewMode === 'client'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                + Upload {viewMode === 'staff' ? 'Staff' : viewMode === 'client' ? 'Client' : 'Internal'} Document
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Documents</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{documentStats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Internal Docs</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">{documentStats.internal}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Client Docs</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{documentStats.client}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Staff Docs</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{documentStats.staff}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Expiring Soon</div>
              <div className="text-2xl font-bold text-orange-600 mt-1">{documentStats.expiringSoon}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Expired</div>
              <div className="text-2xl font-bold text-red-600 mt-1">{documentStats.expired}</div>
            </div>
          </div>

          {/* Required Documents Banner */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">Required Documents for Closing Sales</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p className="mb-2">To close a sale from Legal stage, the following documents are <strong>mandatory</strong>:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {REQUIRED_DOCS_FOR_CLOSE.map(doc => (
                      <li key={doc}>{doc}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-blue-600">All three documents must be uploaded for the client before closing.</p>
                </div>
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => setViewMode('internal')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                viewMode === 'internal'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📄 Internal Documents ({documentStats.internal})
            </button>
            <button
              onClick={() => setViewMode('client')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                viewMode === 'client'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🤝 Client Documents ({documentStats.client})
            </button>
            <button
              onClick={() => setViewMode('staff')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                viewMode === 'staff'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👥 Staff Documents ({documentStats.staff})
            </button>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className={`grid grid-cols-1 ${viewMode === 'client' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {viewMode === 'client' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Client/Customer</label>
                  <select
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value="all">All Clients</option>
                    {uniqueClients.length > 0 ? (
                      uniqueClients.map(client => (
                        <option key={client} value={client}>{client}</option>
                      ))
                    ) : (
                      <option disabled>No clients yet</option>
                    )}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Filter documents by client</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, description, or tags..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {viewMode === 'internal' ? '📄 Internal Company Documents' : 
                 viewMode === 'client' ? '🤝 Client Legal Documents' : 
                 '👥 Staff Documents'}
              </h3>
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    {viewMode === 'internal' 
                      ? 'No internal company documents found' 
                      : viewMode === 'client'
                      ? 'No client legal documents found'
                      : 'No staff documents found. Upload employee documents before adding them to HR.'}
                  </p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Upload your first document
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedDocument(doc);
                        setShowViewModal(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-semibold text-gray-900">{doc.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              doc.status === 'active' ? 'bg-green-100 text-green-800' :
                              doc.status === 'expiring-soon' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {doc.status === 'active' ? 'ACTIVE' :
                               doc.status === 'expiring-soon' ? 'EXPIRING SOON' :
                               'EXPIRED'}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm text-gray-600">{doc.category}</span>
                            {doc.clientName && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-blue-600 font-medium">Client: {doc.clientName}</span>
                              </>
                            )}
                            {doc.employeeName && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-green-600 font-medium">Employee: {doc.employeeName}</span>
                              </>
                            )}
                            {doc.employeeId && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-green-700 font-medium">ID: {doc.employeeId}</span>
                              </>
                            )}
                          </div>
                          <div className="mt-2 text-sm text-gray-500">{doc.description}</div>
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span>Uploaded: {doc.uploadDate}</span>
                            {doc.expiryDate && <span>Expires: {doc.expiryDate}</span>}
                            <span>{doc.type}</span>
                          </div>
                          {doc.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {doc.tags.map((tag, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[10000]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Upload {viewMode === 'staff' ? '👥 Staff' : viewMode === 'client' ? '🤝 Client' : '📄 Internal'} Document
              </h2>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                viewMode === 'staff' ? 'bg-green-100 text-green-800' :
                viewMode === 'client' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {viewMode === 'staff' ? 'Staff' : viewMode === 'client' ? 'Client' : 'Internal'}
              </span>
            </div>
            <form onSubmit={handleUpload}>
              <div className="space-y-4">
                {/* Document Title - Hidden for Staff Documents */}
                {viewMode !== 'staff' && !uploadData.category.startsWith('Staff Document') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Title *</label>
                    <input
                      type="text"
                      required={viewMode !== 'internal' && !uploadData.category.startsWith('Staff Document')}
                      value={uploadData.title}
                      onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="e.g., CAC Certificate 2025"
                    />
                  </div>
                )}

                {/* Client Name - Only show for Client Documents */}
                {viewMode === 'client' && !uploadData.category.startsWith('Staff Document') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client/Customer Name (Optional)</label>
                    <select
                      value={uploadData.clientName}
                      onChange={(e) => setUploadData({...uploadData, clientName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Select client (optional)</option>
                      {uniqueClients.length > 0 ? (
                        uniqueClients.map(client => (
                          <option key={client} value={client}>{client}</option>
                        ))
                      ) : (
                        <option disabled>No clients available</option>
                      )}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Select from existing clients or add new</p>
                  </div>
                )}

                {/* Staff Document Fields - Only show if category is Staff Document */}
                {uploadData.category.startsWith('Staff Document') && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                    <h3 className="text-sm font-semibold text-blue-900">📄 Staff Document Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-1">Employee Name *</label>
                        <input
                          type="text"
                          required
                          value={uploadData.employeeName}
                          onChange={(e) => setUploadData({...uploadData, employeeName: e.target.value})}
                          className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          placeholder="e.g., Chidi Okonkwo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-1">Employee ID *</label>
                        <input
                          type="text"
                          required
                          value={uploadData.employeeId}
                          onChange={(e) => setUploadData({...uploadData, employeeId: e.target.value})}
                          className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          placeholder="e.g., EMP-001"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-blue-700">
                      ⚠️ These documents must be uploaded before the employee can be added to HR system
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      required
                      value={uploadData.category}
                      onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Select category</option>
                      {categories
                        .filter(cat => {
                          // Filter categories based on current view mode
                          if (viewMode === 'staff') {
                            return cat.startsWith('Staff Document');
                          } else if (viewMode === 'client') {
                            return !cat.startsWith('Staff Document');
                          } else {
                            return !cat.startsWith('Staff Document');
                          }
                        })
                        .map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {viewMode === 'staff' 
                        ? 'Select staff document type (NDA, Offer Letter, etc.)'
                        : viewMode === 'client'
                        ? 'Select client document type'
                        : 'Select internal company document type'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                    <select
                      required
                      value={uploadData.type}
                      onChange={(e) => setUploadData({...uploadData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Select type</option>
                      {documentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={uploadData.expiryDate}
                    onChange={(e) => setUploadData({...uploadData, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                  <p className="mt-1 text-xs text-gray-500">System will track expiry and send notifications</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={uploadData.description}
                    onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Brief description of the document..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Optional)</label>
                  <input
                    type="text"
                    value={uploadData.tags}
                    onChange={(e) => setUploadData({...uploadData, tags: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Separate tags with commas (e.g., bidding, registration, 2025)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload File *</label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 cursor-pointer transition-colors"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    {selectedFile ? (
                      <div className="space-y-2">
                        <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                          className="text-xs text-red-600 hover:text-red-800 underline"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
                      </>
                    )}
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            alert('File size must be less than 10MB');
                            return;
                          }
                          setSelectedFile(file);
                        }
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">File will be stored locally in browser</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Document Modal */}
      {showViewModal && selectedDocument && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowViewModal(false)}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-[10000]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedDocument.title}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-gray-600">{selectedDocument.category}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedDocument.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedDocument.status === 'expiring-soon' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedDocument.status === 'active' ? 'ACTIVE' :
                     selectedDocument.status === 'expiring-soon' ? 'EXPIRING SOON' :
                     'EXPIRED'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{selectedDocument.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Upload Date</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDocument.uploadDate}</p>
                </div>
                {selectedDocument.expiryDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDocument.expiryDate}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Document Type</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDocument.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">File Size</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDocument.fileSize}</p>
                </div>
              </div>

              {selectedDocument.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Tags</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedDocument.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">Document Preview</p>
                  <p className="text-xs text-gray-500 mt-1">File preview requires backend integration</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => alert('Download functionality requires backend integration')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Download
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this document?')) {
                    setDocuments(documents.filter(d => d.id !== selectedDocument.id));
                    setShowViewModal(false);
                    alert('Document deleted successfully');
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Sale Modal */}
      {showCloseSaleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Close Sale - Document Verification</h2>
              <button 
                onClick={() => {
                  setShowCloseSaleModal(false);
                  setSelectedClientForClose('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Required Documents:</strong> All three documents must be uploaded before closing:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-yellow-700 space-y-1">
                {REQUIRED_DOCS_FOR_CLOSE.map(doc => (
                  <li key={doc}>{doc}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Client to Close Sale
              </label>
              <select
                value={selectedClientForClose}
                onChange={(e) => setSelectedClientForClose(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                <option value="">-- Select a client in Legal stage --</option>
                {getClientsInLegalStage().map((client: any) => (
                  <option key={client.id} value={client.client}>
                    {client.client}
                  </option>
                ))}
              </select>
            </div>

            {selectedClientForClose && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Document Status for {selectedClientForClose}</h3>
                {(() => {
                  const check = checkClientDocuments(selectedClientForClose);
                  return (
                    <div className="space-y-2">
                      {REQUIRED_DOCS_FOR_CLOSE.map(doc => {
                        const hasDoc = check.existingDocs.some(d => d.category === doc);
                        return (
                          <div key={doc} className="flex items-center justify-between py-2 border-b border-gray-200">
                            <span className="text-sm text-gray-700">{doc}</span>
                            {hasDoc ? (
                              <span className="text-green-600 font-medium">✓ Uploaded</span>
                            ) : (
                              <span className="text-red-600 font-medium">✗ Missing</span>
                            )}
                          </div>
                        );
                      })}
                      
                      {check.hasAllDocs ? (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-green-800">
                            ✅ <strong>All required documents verified!</strong> This sale can be closed.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800">
                            ❌ <strong>Cannot close sale.</strong> Missing {check.missingDocs.length} document(s).
                          </p>
                          <p className="text-xs text-red-700 mt-1">
                            Please upload all required documents before attempting to close.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCloseSaleModal(false);
                  setSelectedClientForClose('');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!selectedClientForClose) {
                    alert('Please select a client');
                    return;
                  }
                  handleCloseSale(selectedClientForClose);
                }}
                disabled={!selectedClientForClose}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                🎯 Close Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
