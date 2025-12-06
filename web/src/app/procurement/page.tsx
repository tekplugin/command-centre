'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function ProcurementPage() {
  const [showAddRequest, setShowAddRequest] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    const savedRequests = localStorage.getItem('procurement_requests');
    const savedVendors = localStorage.getItem('procurement_vendors');
    if (savedRequests) {
      try {
        setRequests(JSON.parse(savedRequests));
      } catch (e) {
        console.error('Error loading requests:', e);
      }
    }
    if (savedVendors) {
      try {
        setVendors(JSON.parse(savedVendors));
      } catch (e) {
        console.error('Error loading vendors:', e);
      }
    }
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Procurement</h1>
            <p className="text-gray-600 mt-1">Manage purchase requests and vendors</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddRequest(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              + New Request
            </button>
            <button
              onClick={() => setShowVendorModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              + Add Vendor
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Total Requests</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{requests.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Pending Finance</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {requests.filter(r => r.status === 'pending-finance').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Approved</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {requests.filter(r => r.status === 'approved').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Active Vendors</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{vendors.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Purchase Requests</h3>
            </div>
            <div className="p-6">
              {requests.length > 0 ? (
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div 
                      key={request.id} 
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailModal(true);
                      }}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{request.item}</div>
                          <div className="text-sm text-gray-500">{request.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Quantity: {request.quantity} | Budget: ₦{request.budget?.toLocaleString()}
                          </div>
                          {request.department && (
                            <div className="text-xs text-blue-600 mt-1">
                              Requested by: {request.department}
                            </div>
                          )}
                          {request.vendor && (
                            <div className="text-xs text-green-600 mt-1">
                              Vendor: {request.vendor}
                            </div>
                          )}
                          {request.negotiatedPrice && (
                            <div className="text-xs text-purple-600 mt-1">
                              Negotiated Price: ₦{request.negotiatedPrice?.toLocaleString()}
                            </div>
                          )}
                          {request.invoices && request.invoices.length > 0 && (
                            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <span>📄</span> {request.invoices.length} invoice(s) attached
                            </div>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'pending-finance' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status === 'pending-finance' ? 'PENDING FINANCE' : request.status?.toUpperCase()}
                        </span>
                      </div>
                      
                      {request.status === 'draft' && (
                        <div className="flex gap-2 mt-3 pt-3 border-t">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!request.invoices || request.invoices.length === 0) {
                                alert('⚠️ Please upload invoice first. Click on the request to add invoice.');
                                return;
                              }
                              if (!request.vendor || !request.negotiatedPrice) {
                                alert('⚠️ Please add vendor and negotiated price first.');
                                return;
                              }
                              const updatedRequests = requests.map(r =>
                                r.id === request.id ? { ...r, status: 'pending-finance' } : r
                              );
                              setRequests(updatedRequests);
                              localStorage.setItem('procurement_requests', JSON.stringify(updatedRequests));
                              alert('✅ Request sent to Finance for approval!');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
                          >
                            Send to Finance
                          </button>
                        </div>
                      )}
                      
                      {request.status === 'rejected' && request.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          <strong>Rejection Reason:</strong> {request.rejectionReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-lg font-medium">No purchase requests yet</p>
                  <p className="text-sm mt-2">Create your first purchase request</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Vendors</h3>
            </div>
            <div className="p-6">
              {vendors.length > 0 ? (
                <div className="space-y-3">
                  {vendors.map((vendor) => (
                    <div key={vendor.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{vendor.name}</div>
                          <div className="text-sm text-gray-500">{vendor.category}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Contact: {vendor.contact} | {vendor.email}
                          </div>
                        </div>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                          ACTIVE
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🏢</div>
                  <p className="text-lg font-medium">No vendors yet</p>
                  <p className="text-sm mt-2">Add your first vendor</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {showAddRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">New Purchase Request</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const vendor = formData.get('vendor') as string;
                const negotiatedPrice = formData.get('negotiatedPrice') as string;
                
                const newRequest = {
                  id: Date.now().toString(),
                  item: formData.get('item'),
                  description: formData.get('description'),
                  quantity: formData.get('quantity'),
                  budget: parseFloat(formData.get('budget') as string),
                  category: formData.get('category'),
                  department: formData.get('department'),
                  vendor: vendor || undefined,
                  negotiatedPrice: negotiatedPrice ? parseFloat(negotiatedPrice) : undefined,
                  requestedBy: `${user.firstName} ${user.lastName}`,
                  status: 'draft',
                  createdAt: new Date().toISOString()
                };
                const updatedRequests = [...requests, newRequest];
                setRequests(updatedRequests);
                localStorage.setItem('procurement_requests', JSON.stringify(updatedRequests));
                setShowAddRequest(false);
                
                if (vendor && negotiatedPrice) {
                  alert('✅ Purchase request created with vendor! You can now send it to Finance for approval.');
                } else {
                  alert('✅ Purchase request created! Add vendor and negotiate price before sending to Finance.');
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requesting Department *</label>
                    <select name="department" required className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900">
                      <option value="">Select department</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Legal">Legal</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Operations">Operations</option>
                      <option value="IT">IT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                    <input
                      type="text"
                      name="item"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      placeholder="e.g., Office Chairs"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      placeholder="Detailed description..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                      <input
                        type="number"
                        name="quantity"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₦) *</label>
                      <input
                        type="number"
                        name="budget"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select name="category" required className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900">
                      <option value="">Select category</option>
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Furniture">Furniture</option>
                      <option value="IT Hardware">IT Hardware</option>
                      <option value="Services">Services</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor (Optional)</label>
                    <select 
                      name="vendor" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    >
                      <option value="">Select vendor (or add later)</option>
                      {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.name}>
                          {vendor.name} - {vendor.category}
                        </option>
                      ))}
                    </select>
                    {vendors.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        No vendors available. Add vendors first using the "+ Add Vendor" button.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Negotiated Price (₦) (Optional)</label>
                    <input
                      type="number"
                      name="negotiatedPrice"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      placeholder="Enter negotiated price if known"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium">
                    Create Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddRequest(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showVendorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Vendor</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newVendor = {
                  id: Date.now().toString(),
                  name: formData.get('name'),
                  category: formData.get('category'),
                  contact: formData.get('contact'),
                  email: formData.get('email'),
                  phone: formData.get('phone'),
                  address: formData.get('address'),
                  status: 'active',
                  createdAt: new Date().toISOString()
                };
                const updatedVendors = [...vendors, newVendor];
                setVendors(updatedVendors);
                localStorage.setItem('procurement_vendors', JSON.stringify(updatedVendors));
                setShowVendorModal(false);
                alert('✅ Vendor added successfully!');
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <input
                      type="text"
                      name="category"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      placeholder="e.g., Office Supplies"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                      <input
                        type="text"
                        name="contact"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      name="address"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium">
                    Add Vendor
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVendorModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDetailModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Purchase Request Details</h2>
                <button 
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedRequest(null);
                  }} 
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedRequest = {
                  ...selectedRequest,
                  item: formData.get('item'),
                  description: formData.get('description'),
                  quantity: formData.get('quantity'),
                  budget: parseFloat(formData.get('budget') as string),
                  category: formData.get('category'),
                  department: formData.get('department'),
                  vendor: formData.get('vendor'),
                  negotiatedPrice: formData.get('negotiatedPrice') ? parseFloat(formData.get('negotiatedPrice') as string) : undefined,
                  updatedAt: new Date().toISOString()
                };
                const updatedRequests = requests.map(r => r.id === selectedRequest.id ? updatedRequest : r);
                setRequests(updatedRequests);
                localStorage.setItem('procurement_requests', JSON.stringify(updatedRequests));
                setShowDetailModal(false);
                alert('✅ Purchase request updated successfully!');
              }}>
                <div className="space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedRequest.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedRequest.status === 'pending-finance' ? 'bg-blue-100 text-blue-800' :
                      selectedRequest.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      selectedRequest.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedRequest.status === 'pending-finance' ? 'PENDING FINANCE' : selectedRequest.status?.toUpperCase()}
                    </span>
                  </div>

                  {/* Basic Information */}
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Requesting Department *</label>
                        <select 
                          name="department" 
                          defaultValue={selectedRequest.department}
                          required 
                          disabled={selectedRequest.status !== 'draft'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">Select department</option>
                          <option value="HR">HR</option>
                          <option value="Finance">Finance</option>
                          <option value="Sales">Sales</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Legal">Legal</option>
                          <option value="Engineering">Engineering</option>
                          <option value="Operations">Operations</option>
                          <option value="IT">IT</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <input
                          type="text"
                          name="category"
                          defaultValue={selectedRequest.category}
                          required
                          disabled={selectedRequest.status !== 'draft'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Item Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                        <input
                          type="text"
                          name="item"
                          defaultValue={selectedRequest.item}
                          required
                          disabled={selectedRequest.status !== 'draft'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          name="description"
                          defaultValue={selectedRequest.description}
                          rows={3}
                          disabled={selectedRequest.status !== 'draft'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                          <input
                            type="number"
                            name="quantity"
                            defaultValue={selectedRequest.quantity}
                            required
                            disabled={selectedRequest.status !== 'draft'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₦) *</label>
                          <input
                            type="number"
                            name="budget"
                            defaultValue={selectedRequest.budget}
                            required
                            disabled={selectedRequest.status !== 'draft'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vendor & Pricing */}
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Vendor & Pricing</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                        <input
                          type="text"
                          name="vendor"
                          defaultValue={selectedRequest.vendor || ''}
                          disabled={selectedRequest.status !== 'draft'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="Enter vendor name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Negotiated Price (₦)</label>
                        <input
                          type="number"
                          name="negotiatedPrice"
                          defaultValue={selectedRequest.negotiatedPrice || ''}
                          disabled={selectedRequest.status !== 'draft'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="Enter negotiated price"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Invoice Upload Section */}
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Invoice & Documents</h3>
                    
                    {/* Upload Invoice */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Invoice (PDF, JPG, PNG)</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const invoiceData = {
                                name: file.name,
                                type: file.type,
                                size: file.size,
                                data: event.target?.result,
                                uploadedAt: new Date().toISOString()
                              };
                              const updatedRequest = {
                                ...selectedRequest,
                                invoices: [...(selectedRequest.invoices || []), invoiceData]
                              };
                              const updatedRequests = requests.map(r => r.id === selectedRequest.id ? updatedRequest : r);
                              setRequests(updatedRequests);
                              setSelectedRequest(updatedRequest);
                              localStorage.setItem('procurement_requests', JSON.stringify(updatedRequests));
                              alert('✅ Invoice uploaded successfully!');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Maximum file size: 5MB</p>
                    </div>

                    {/* Display Uploaded Invoices */}
                    {selectedRequest.invoices && selectedRequest.invoices.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Invoices:</h4>
                        <div className="space-y-2">
                          {selectedRequest.invoices.map((invoice: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">📄</span>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{invoice.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(invoice.size / 1024).toFixed(2)} KB • {new Date(invoice.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <a
                                  href={invoice.data}
                                  download={invoice.name}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  Download
                                </a>
                                <button
                                  onClick={() => {
                                    if (confirm('Delete this invoice?')) {
                                      const updatedInvoices = selectedRequest.invoices.filter((_: any, i: number) => i !== index);
                                      const updatedRequest = { ...selectedRequest, invoices: updatedInvoices };
                                      const updatedRequests = requests.map(r => r.id === selectedRequest.id ? updatedRequest : r);
                                      setRequests(updatedRequests);
                                      setSelectedRequest(updatedRequest);
                                      localStorage.setItem('procurement_requests', JSON.stringify(updatedRequests));
                                      alert('✅ Invoice deleted');
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Additional Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Requested By:</span>
                        <p className="font-medium text-gray-900">{selectedRequest.requestedBy || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Created:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedRequest.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Rejection Reason:</h4>
                      <p className="text-sm text-red-700">{selectedRequest.rejectionReason}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    {selectedRequest.status === 'draft' && (
                      <>
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedRequest.vendor || !selectedRequest.negotiatedPrice) {
                              alert('⚠️ Please add vendor and negotiated price first');
                              return;
                            }
                            if (!selectedRequest.invoices || selectedRequest.invoices.length === 0) {
                              alert('⚠️ Please upload at least one invoice before sending to Finance');
                              return;
                            }
                            const updatedRequests = requests.map(r =>
                              r.id === selectedRequest.id ? { ...r, status: 'pending-finance' } : r
                            );
                            setRequests(updatedRequests);
                            localStorage.setItem('procurement_requests', JSON.stringify(updatedRequests));
                            setShowDetailModal(false);
                            alert('✅ Request sent to Finance for approval!');
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium"
                        >
                          Send to Finance
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Delete this purchase request?')) {
                          const updatedRequests = requests.filter(r => r.id !== selectedRequest.id);
                          setRequests(updatedRequests);
                          localStorage.setItem('procurement_requests', JSON.stringify(updatedRequests));
                          setShowDetailModal(false);
                          alert('✅ Purchase request deleted');
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDetailModal(false);
                        setSelectedRequest(null);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
