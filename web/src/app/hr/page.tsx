'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function HRPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedEmployeeForDocs, setSelectedEmployeeForDocs] = useState<any>(null);
  const [legalDocuments, setLegalDocuments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  
  // Load legal documents to check for staff documents
  useEffect(() => {
    const savedDocuments = localStorage.getItem('legal_documents');
    if (savedDocuments) {
      try {
        setLegalDocuments(JSON.parse(savedDocuments));
      } catch (e) {
        console.error('Error loading legal documents:', e);
      }
    }

    // Load employees from localStorage
    const savedEmployees = localStorage.getItem('employees');
    if (savedEmployees) {
      try {
        setEmployees(JSON.parse(savedEmployees));
      } catch (e) {
        console.error('Error loading employees:', e);
      }
    }

    // Load leave requests from localStorage
    const savedLeaves = localStorage.getItem('leave_requests');
    if (savedLeaves) {
      try {
        setLeaveRequests(JSON.parse(savedLeaves));
      } catch (e) {
        console.error('Error loading leave requests:', e);
      }
    }
  }, [showAddModal]); // Reload when modal opens
  
  // Get unique employees from legal documents
  const getEmployeesFromLegal = () => {
    const employeeMap = new Map();
    
    legalDocuments.forEach(doc => {
      if (doc.employeeId && doc.employeeName) {
        employeeMap.set(doc.employeeId, {
          id: doc.employeeId,
          name: doc.employeeName,
        });
      }
    });
    
    return Array.from(employeeMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };
  
  const employeesWithDocs = getEmployeesFromLegal();
  
  // Check if employee has required documents in Legal
  const checkEmployeeDocuments = (employeeId: string, employeeName: string) => {
    const requiredDocs = [
      'Staff Document - NDA',
      'Staff Document - Offer Letter',
      'Staff Document - Employment Contract',
    ];
    
    const employeeDocs = legalDocuments.filter(doc => 
      doc.employeeId === employeeId || doc.employeeName === employeeName
    );
    
    const uploadedCategories = employeeDocs.map(doc => doc.category);
    const missingDocs = requiredDocs.filter(req => !uploadedCategories.includes(req));
    
    return {
      hasAllRequired: missingDocs.length === 0,
      missingDocs,
      uploadedDocs: employeeDocs.length,
    };
  };
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    employeeId: '',
    role: '',
    department: '',
    email: '',
    phone: '',
    startDate: '',
    
    // Employment Type
    employeeType: 'permanent', // 'permanent' or 'contract'
    
    // Salary Info (Permanent Staff)
    annualGross: '',
    basicPercent: 15,
    transportPercent: 15,
    housingPercent: 15,
    othersPercent: 55,
    
    // Contract Staff Info
    atmCount: '0',
    ratePerAtm: '0',
    
    // Deductions
    hmo: '0',
    hmoCompany: '0',
    loan: '0',
  });

  // Calculate pro-rata salary based on start date
  const calculateProRata = () => {
    if (!formData.startDate || !formData.annualGross) return null;
    
    const startDate = new Date(formData.startDate);
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);
    
    // Days remaining in the year
    const daysInYear = 365;
    const daysRemaining = Math.ceil((yearEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const annualGross = parseFloat(formData.annualGross) || 0;
    const proRataAnnual = (annualGross / daysInYear) * daysRemaining;
    const monthlyGross = annualGross / 12;
    
    // First month pro-rata
    const firstMonthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const firstMonthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    const daysInFirstMonth = firstMonthEnd.getDate();
    const daysWorkedInFirstMonth = daysInFirstMonth - startDate.getDate() + 1;
    const firstMonthProRata = (monthlyGross / daysInFirstMonth) * daysWorkedInFirstMonth;
    
    return {
      annualGross,
      proRataAnnual,
      monthlyGross,
      firstMonthProRata,
      daysRemaining,
      daysWorkedInFirstMonth,
      daysInFirstMonth,
      startDate: startDate.toLocaleDateString(),
    };
  };

  // Calculate payroll breakdown
  const calculatePayrollBreakdown = () => {
    if (formData.employeeType === 'contract') {
      const atmCount = parseFloat(formData.atmCount) || 0;
      const ratePerAtm = parseFloat(formData.ratePerAtm) || 0;
      return {
        type: 'contract',
        monthlyGross: atmCount * ratePerAtm,
        atmCount,
        ratePerAtm,
      };
    }
    
    const annualGross = parseFloat(formData.annualGross) || 0;
    const monthlyGross = annualGross / 12;
    
    const basic = (monthlyGross * formData.basicPercent) / 100;
    const transport = (monthlyGross * formData.transportPercent) / 100;
    const housing = (monthlyGross * formData.housingPercent) / 100;
    const others = (monthlyGross * formData.othersPercent) / 100;
    
    // CRA
    const craOption1 = annualGross * 0.01;
    const craOption2 = 200000 + (annualGross * 0.20);
    const craAnnual = Math.max(craOption1, craOption2);
    const craMonthly = craAnnual / 12;
    
    // Pension
    const pensionEmployee = monthlyGross * 0.08;
    const pensionEmployer = monthlyGross * 0.10;
    
    // Tax calculation
    const totalReliefs = craMonthly + pensionEmployee;
    const taxablePay = monthlyGross - totalReliefs;
    
    let taxPayable = 0;
    let remaining = taxablePay * 12;
    
    if (remaining > 0) {
      const bracket1 = Math.min(remaining, 300000);
      taxPayable += bracket1 * 0.07;
      remaining -= bracket1;
    }
    if (remaining > 0) {
      const bracket2 = Math.min(remaining, 300000);
      taxPayable += bracket2 * 0.11;
      remaining -= bracket2;
    }
    if (remaining > 0) {
      const bracket3 = Math.min(remaining, 500000);
      taxPayable += bracket3 * 0.15;
      remaining -= bracket3;
    }
    if (remaining > 0) {
      const bracket4 = Math.min(remaining, 500000);
      taxPayable += bracket4 * 0.19;
      remaining -= bracket4;
    }
    if (remaining > 0) {
      const bracket5 = Math.min(remaining, 1600000);
      taxPayable += bracket5 * 0.21;
      remaining -= bracket5;
    }
    if (remaining > 0) {
      taxPayable += remaining * 0.24;
    }
    
    const monthlyTax = taxPayable / 12;
    const minimumTax = monthlyGross * 0.005;
    const taxDue = Math.max(monthlyTax, minimumTax);
    
    const hmo = parseFloat(formData.hmo) || 0;
    const loan = parseFloat(formData.loan) || 0;
    const totalDeductions = pensionEmployee + taxDue + hmo + loan;
    const netPay = monthlyGross - totalDeductions;
    
    return {
      type: 'permanent',
      monthlyGross,
      basic,
      transport,
      housing,
      others,
      craMonthly,
      pensionEmployee,
      pensionEmployer,
      taxablePay,
      taxDue,
      netPay,
      totalDeductions,
    };
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calculate stats from real data
  const stats = {
    total: employees.length,
    onLeave: employees.filter(e => e.status === 'on-leave').length,
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    departments: new Set(employees.map(e => e.department)).size,
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">HR Management</h1>
              <p className="mt-1 text-sm text-gray-600">Employee directory and leave management</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              + Add Employee
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Total Employees</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">On Leave</div>
              <div className="text-3xl font-bold text-orange-600 mt-2">{stats.onLeave}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Pending Requests</div>
              <div className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Departments</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{stats.departments}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Members */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
              </div>
              <div className="p-6 space-y-4">
                {employees.length > 0 ? (
                  employees.map((emp) => {
                    const empDocs = legalDocuments.filter(doc => 
                      doc.employeeId === emp.employeeId || doc.employeeName === emp.name
                    );
                    return (
                      <div key={emp.id} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                              {emp.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div className="ml-3">
                              <div className="font-medium text-gray-900">{emp.name}</div>
                              <div className="text-sm text-gray-500">{emp.role} · {emp.department}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                📄 {empDocs.length} document{empDocs.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedEmployeeForDocs(emp);
                                setShowDocumentModal(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-xs font-medium"
                              title="Upload Documents"
                            >
                              📎 Docs
                            </button>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {emp.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No employees yet</p>
                    <p className="text-sm mt-2">Add your first employee by clicking "Add Employee" above</p>
                  </div>
                )}
              </div>
            </div>

            {/* Leave Requests */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Leave Requests</h3>
              </div>
              <div className="p-6 space-y-4">
                {leaveRequests.length > 0 ? (
                  leaveRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-gray-900">{request.employee}</div>
                          <div className="text-sm text-gray-500">{request.type}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">{request.dates} ({request.days} days)</div>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-medium">
                            Approve
                          </button>
                          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm font-medium">
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No leave requests</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowLeaveModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              <span>📝</span>
              Leave Requests
            </button>
            <button 
              onClick={() => setShowPayrollModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              <span>💰</span>
              Process Payroll
            </button>
            <button 
              onClick={() => setShowPerformanceModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              <span>⭐</span>
              Performance Review
            </button>
            <button 
              onClick={() => setShowAttendanceModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              <span>📅</span>
              Attendance
            </button>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Employee</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              
              // Check if employee has required legal documents
              const docCheck = checkEmployeeDocuments(formData.employeeId, formData.name);
              
              if (!docCheck.hasAllRequired) {
                alert(`❌ Cannot Add Employee - Missing Required Legal Documents!\n\n` +
                      `Employee: ${formData.name} (${formData.employeeId})\n\n` +
                      `Missing Documents:\n${docCheck.missingDocs.map(doc => `• ${doc}`).join('\n')}\n\n` +
                      `Documents uploaded: ${docCheck.uploadedDocs}\n\n` +
                      `⚠️ Please upload all required documents in the Legal module first:\n` +
                      `1. NDA (Non-Disclosure Agreement)\n` +
                      `2. Offer Letter\n` +
                      `3. Employment Contract\n\n` +
                      `Then try adding the employee again.`);
                return;
              }
              
              const proRata = calculateProRata();
              const breakdown = calculatePayrollBreakdown();
              console.log('New employee:', formData);
              console.log('Pro-rata calculation:', proRata);
              console.log('Payroll breakdown:', breakdown);
              alert(`✅ Employee Added Successfully!\n\n` +
                    `Name: ${formData.name}\n` +
                    `Type: ${formData.employeeType === 'permanent' ? 'Permanent Staff' : 'Contract Staff'}\n` +
                    `Legal Documents: ✓ All required documents verified\n\n` +
                    `${proRata ? `Pro-Rata Info:\nFirst Month Salary: ${formatCurrency(proRata.firstMonthProRata)}\nDays worked in first month: ${proRata.daysWorkedInFirstMonth}/${proRata.daysInFirstMonth} days\n\n` : ''}` +
                    `Monthly Net Pay: ${formatCurrency(breakdown.netPay || breakdown.monthlyGross)}`);
              setShowAddModal(false);
            }}>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee Name * {employeesWithDocs.length > 0 && <span className="text-green-600 text-xs">(from Legal)</span>}
                      </label>
                      <select
                        required
                        value={formData.name}
                        onChange={(e) => {
                          const selectedEmployee = employeesWithDocs.find(emp => emp.name === e.target.value);
                          setFormData({
                            ...formData, 
                            name: e.target.value,
                            employeeId: selectedEmployee?.id || ''
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="">Select employee from Legal</option>
                        {employeesWithDocs.length > 0 ? (
                          employeesWithDocs.map(emp => (
                            <option key={emp.id} value={emp.name}>{emp.name} ({emp.id})</option>
                          ))
                        ) : (
                          <option disabled>No employees with documents in Legal</option>
                        )}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Upload staff documents in Legal first</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                      <input
                        type="text"
                        required
                        value={formData.employeeId}
                        onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        placeholder="EMP-001"
                        readOnly={formData.name !== ''}
                      />
                      <p className="text-xs text-gray-500 mt-1">Auto-filled from Legal</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                      <input
                        type="text"
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        placeholder="Senior Engineer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        required
                      >
                        <option value="">Select department</option>
                        <option value="Operations">Operations</option>
                        <option value="Technology">Technology</option>
                        <option value="Sales">Sales</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Finance">Finance</option>
                        <option value="HR">HR</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        placeholder="john@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        placeholder="+234 801 234 5678"
                      />
                    </div>
                  </div>

                  {/* Legal Documents Status Check */}
                  {formData.employeeId && formData.name && (() => {
                    const docCheck = checkEmployeeDocuments(formData.employeeId, formData.name);
                    return (
                      <div className={`mt-4 p-3 rounded-lg border ${docCheck.hasAllRequired ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            {docCheck.hasAllRequired ? (
                              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <h4 className={`text-sm font-semibold ${docCheck.hasAllRequired ? 'text-green-900' : 'text-red-900'}`}>
                              {docCheck.hasAllRequired ? '✓ Legal Documents Complete' : '⚠️ Missing Required Legal Documents'}
                            </h4>
                            <div className="mt-1 text-xs">
                              {docCheck.hasAllRequired ? (
                                <p className="text-green-700">
                                  All required documents uploaded ({docCheck.uploadedDocs} documents total)
                                </p>
                              ) : (
                                <div className="text-red-700">
                                  <p className="font-medium mb-1">Missing documents:</p>
                                  <ul className="list-disc list-inside space-y-0.5">
                                    {docCheck.missingDocs.map((doc, idx) => (
                                      <li key={idx}>{doc.replace('Staff Document - ', '')}</li>
                                    ))}
                                  </ul>
                                  <p className="mt-2 font-medium">→ Please upload these documents in the Legal module first</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Employment Type & Start Date */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Employment Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type *</label>
                      <select
                        value={formData.employeeType}
                        onChange={(e) => setFormData({...formData, employeeType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        required
                      >
                        <option value="permanent">Permanent Staff</option>
                        <option value="contract">Contract Staff (Field Engineer)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Salary Information - Conditional based on employee type */}
                {formData.employeeType === 'permanent' ? (
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Salary Information (Permanent Staff)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Annual Gross Salary (₦) *</label>
                        <input
                          type="number"
                          required
                          value={formData.annualGross}
                          onChange={(e) => setFormData({...formData, annualGross: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          placeholder="12000000"
                        />
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="text-xs text-blue-700 font-medium">Monthly Gross</div>
                        <div className="text-xl font-bold text-blue-900">
                          {formData.annualGross ? formatCurrency(parseFloat(formData.annualGross) / 12) : '₦0.00'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Basic %</label>
                        <input
                          type="number"
                          value={formData.basicPercent}
                          onChange={(e) => setFormData({...formData, basicPercent: parseFloat(e.target.value)})}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Transport %</label>
                        <input
                          type="number"
                          value={formData.transportPercent}
                          onChange={(e) => setFormData({...formData, transportPercent: parseFloat(e.target.value)})}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Housing %</label>
                        <input
                          type="number"
                          value={formData.housingPercent}
                          onChange={(e) => setFormData({...formData, housingPercent: parseFloat(e.target.value)})}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Others %</label>
                        <input
                          type="number"
                          value={formData.othersPercent}
                          onChange={(e) => setFormData({...formData, othersPercent: parseFloat(e.target.value)})}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Contract Details (Paid per ATM)</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of ATMs *</label>
                        <input
                          type="number"
                          required
                          value={formData.atmCount}
                          onChange={(e) => setFormData({...formData, atmCount: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rate per ATM (₦) *</label>
                        <input
                          type="number"
                          required
                          value={formData.ratePerAtm}
                          onChange={(e) => setFormData({...formData, ratePerAtm: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          placeholder="15000"
                        />
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="text-xs text-blue-700 font-medium">Monthly Payment</div>
                        <div className="text-xl font-bold text-blue-900">
                          {formatCurrency((parseFloat(formData.atmCount) || 0) * (parseFloat(formData.ratePerAtm) || 0))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Deductions */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Optional Deductions</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">HMO (₦/month)</label>
                      <input
                        type="number"
                        value={formData.hmo}
                        onChange={(e) => setFormData({...formData, hmo: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">HMO Company (₦/month)</label>
                      <input
                        type="number"
                        value={formData.hmoCompany}
                        onChange={(e) => setFormData({...formData, hmoCompany: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loan Deduction (₦/month)</label>
                      <input
                        type="number"
                        value={formData.loan}
                        onChange={(e) => setFormData({...formData, loan: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Pro-Rata and Payroll Summary */}
                {formData.startDate && (formData.annualGross || (formData.atmCount && formData.ratePerAtm)) && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">💰 Payroll Summary</h3>
                    
                    {formData.employeeType === 'permanent' && (() => {
                      const proRata = calculateProRata();
                      const breakdown = calculatePayrollBreakdown();
                      return proRata && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded border">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">📅 Pro-Rata Calculation</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Start Date:</span>
                                <span className="font-medium text-gray-900">{proRata.startDate}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Days in First Month:</span>
                                <span className="font-medium text-gray-900">{proRata.daysInFirstMonth} days</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Days Worked:</span>
                                <span className="font-medium text-blue-600">{proRata.daysWorkedInFirstMonth} days</span>
                              </div>
                              <div className="border-t pt-1 mt-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-700 font-medium">First Month Salary:</span>
                                  <span className="font-bold text-green-600">{formatCurrency(proRata.firstMonthProRata)}</span>
                                </div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Regular Monthly:</span>
                                <span>{formatCurrency(proRata.monthlyGross)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded border">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">💵 Monthly Breakdown</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Gross Pay:</span>
                                <span className="font-medium text-gray-900">{formatCurrency(breakdown.monthlyGross)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Pension (8%):</span>
                                <span className="font-medium text-red-600">-{formatCurrency(breakdown.pensionEmployee || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tax (PAYE):</span>
                                <span className="font-medium text-red-600">-{formatCurrency(breakdown.taxDue || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Other Deductions:</span>
                                <span className="font-medium text-red-600">-{formatCurrency((parseFloat(formData.hmo) || 0) + (parseFloat(formData.loan) || 0))}</span>
                              </div>
                              <div className="border-t pt-1 mt-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-700 font-medium">Net Pay:</span>
                                  <span className="font-bold text-green-600">{formatCurrency(breakdown.netPay || 0)}</span>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Employer Pension: {formatCurrency(breakdown.pensionEmployer || 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {formData.employeeType === 'contract' && (() => {
                      const breakdown = calculatePayrollBreakdown();
                      return (
                        <div className="bg-white p-3 rounded border">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">💵 Contract Payment</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">ATM Count:</span>
                              <span className="font-medium text-gray-900">{breakdown.atmCount} units</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Rate per ATM:</span>
                              <span className="font-medium text-gray-900">{formatCurrency(breakdown.ratePerAtm || 0)}</span>
                            </div>
                            <div className="border-t pt-1 mt-2">
                              <div className="flex justify-between">
                                <span className="text-gray-700 font-medium">Monthly Payment:</span>
                                <span className="font-bold text-green-600">{formatCurrency(breakdown.monthlyGross)}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              *Contract staff handle their own tax obligations
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
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
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Leave Request Management</h2>
              <button onClick={() => setShowLeaveModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="space-y-4">
              {leaveRequests.length > 0 ? (
                leaveRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{request.employee}</div>
                        <div className="text-sm text-gray-600">{request.type}</div>
                        <div className="text-sm text-gray-500 mt-1">{request.dates} • {request.days} days</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    {request.reason && (
                      <div className="text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </div>
                    )}
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const updated = leaveRequests.map(r =>
                              r.id === request.id ? { ...r, status: 'approved' } : r
                            );
                            setLeaveRequests(updated);
                            localStorage.setItem('leave_requests', JSON.stringify(updated));
                            alert('Leave request approved!');
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-medium"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => {
                            const updated = leaveRequests.map(r =>
                              r.id === request.id ? { ...r, status: 'rejected' } : r
                            );
                            setLeaveRequests(updated);
                            localStorage.setItem('leave_requests', JSON.stringify(updated));
                            alert('Leave request rejected.');
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm font-medium"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No leave requests at the moment</p>
                  <p className="text-sm mt-2">Leave requests from employees will appear here</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Modal */}
      {showPayrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Process Payroll</h2>
              <button onClick={() => setShowPayrollModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Payroll Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-blue-700">Total Employees</div>
                  <div className="text-2xl font-bold text-blue-900">{employees.length}</div>
                </div>
                <div>
                  <div className="text-blue-700">Total Gross Pay</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(employees.reduce((sum, emp) => sum + (emp.monthlyGross || 0), 0))}
                  </div>
                </div>
                <div>
                  <div className="text-blue-700">Total Net Pay</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(employees.reduce((sum, emp) => sum + (emp.netPay || emp.monthlyGross || 0), 0))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <div key={emp.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{emp.name}</div>
                        <div className="text-sm text-gray-600">{emp.role} • {emp.department}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Net Pay</div>
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(emp.netPay || emp.monthlyGross || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No employees to process</p>
                  <p className="text-sm mt-2">Add employees first to process payroll</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowPayrollModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Close
              </button>
              {employees.length > 0 && (
                <button
                  onClick={() => {
                    alert(`Payroll processed for ${employees.length} employees!\n\nTotal: ${formatCurrency(employees.reduce((sum, emp) => sum + (emp.netPay || emp.monthlyGross || 0), 0))}`);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Process Payroll
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Performance Review Modal */}
      {showPerformanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Performance Reviews</h2>
              <button onClick={() => setShowPerformanceModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="space-y-4">
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <div key={emp.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{emp.name}</div>
                        <div className="text-sm text-gray-600">{emp.role} • {emp.department}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Rating</div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {emp.rating || '⭐⭐⭐⭐'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          alert(`Performance review for ${emp.name}\n\nSchedule a one-on-one meeting to discuss:\n• Goals & Objectives\n• Achievements\n• Areas for improvement\n• Career development`);
                        }}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded text-sm font-medium"
                      >
                        Schedule Review
                      </button>
                      <button
                        onClick={() => {
                          alert(`View performance history for ${emp.name}`);
                        }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded text-sm font-medium"
                      >
                        View History
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No employees to review</p>
                  <p className="text-sm mt-2">Add employees first to conduct performance reviews</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowPerformanceModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Employee Attendance</h2>
              <button onClick={() => setShowAttendanceModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">Today's Attendance</h3>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-orange-700">Present</div>
                  <div className="text-2xl font-bold text-green-600">{Math.floor(employees.length * 0.85)}</div>
                </div>
                <div>
                  <div className="text-orange-700">Absent</div>
                  <div className="text-2xl font-bold text-red-600">{Math.floor(employees.length * 0.05)}</div>
                </div>
                <div>
                  <div className="text-orange-700">On Leave</div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.onLeave}</div>
                </div>
                <div>
                  <div className="text-orange-700">Late</div>
                  <div className="text-2xl font-bold text-orange-600">{Math.floor(employees.length * 0.1)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {employees.length > 0 ? (
                employees.map((emp) => {
                  const statuses = ['present', 'present', 'present', 'late', 'absent', 'on-leave'];
                  const status = emp.status === 'on-leave' ? 'on-leave' : statuses[Math.floor(Math.random() * 4)];
                  
                  return (
                    <div key={emp.id} className="border rounded-lg p-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          {emp.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{emp.name}</div>
                          <div className="text-sm text-gray-600">{emp.department}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                          {status === 'present' && 'Check-in: 08:45 AM'}
                          {status === 'late' && 'Check-in: 09:30 AM'}
                          {status === 'absent' && 'No check-in'}
                          {status === 'on-leave' && 'On approved leave'}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          status === 'present' ? 'bg-green-100 text-green-800' :
                          status === 'late' ? 'bg-orange-100 text-orange-800' :
                          status === 'absent' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {status === 'on-leave' ? 'ON LEAVE' : status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No employees to track</p>
                  <p className="text-sm mt-2">Add employees first to track attendance</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Close
              </button>
              {employees.length > 0 && (
                <button
                  onClick={() => {
                    alert('Attendance report exported!');
                  }}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Export Report
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Employee Document Upload Modal */}
      {showDocumentModal && selectedEmployeeForDocs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Employee Documents</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedEmployeeForDocs.name} • {selectedEmployeeForDocs.employeeId}</p>
              </div>
              <button 
                onClick={() => {
                  setShowDocumentModal(false);
                  setSelectedEmployeeForDocs(null);
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {/* Document Upload Form */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Upload New Document</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const category = formData.get('category') as string;
                const file = formData.get('file') as File;
                
                if (!file || !category) {
                  alert('Please select a document type and file');
                  return;
                }

                // Create document record
                const newDoc = {
                  id: Date.now().toString(),
                  employeeId: selectedEmployeeForDocs.employeeId,
                  employeeName: selectedEmployeeForDocs.name,
                  category: category,
                  fileName: file.name,
                  fileSize: file.size,
                  uploadDate: new Date().toISOString(),
                  uploadedBy: 'HR Admin',
                  status: 'active',
                };

                // Save to legal documents
                const updatedDocs = [...legalDocuments, newDoc];
                setLegalDocuments(updatedDocs);
                localStorage.setItem('legal_documents', JSON.stringify(updatedDocs));

                alert(`✅ Document uploaded successfully!\n\n${category}\n${file.name}`);
                e.currentTarget.reset();
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                    <select
                      name="category"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Select document type</option>
                      <option value="Staff Document - NDA">NDA (Non-Disclosure Agreement)</option>
                      <option value="Staff Document - Offer Letter">Offer Letter</option>
                      <option value="Staff Document - Employment Contract">Employment Contract</option>
                      <option value="Staff Document - Performance Review">Performance Review</option>
                      <option value="Staff Document - Training Certificate">Training Certificate</option>
                      <option value="Staff Document - ID Card">ID Card / Badge</option>
                      <option value="Staff Document - Medical Records">Medical Records</option>
                      <option value="Staff Document - Bank Details">Bank Details</option>
                      <option value="Staff Document - Tax Documents">Tax Documents</option>
                      <option value="Staff Document - Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload File *</label>
                    <input
                      type="file"
                      name="file"
                      required
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
                    />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    📎 Upload Document
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Documents */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Existing Documents ({
                legalDocuments.filter(doc => 
                  doc.employeeId === selectedEmployeeForDocs.employeeId || 
                  doc.employeeName === selectedEmployeeForDocs.name
                ).length
              })</h3>
              
              <div className="space-y-2">
                {legalDocuments
                  .filter(doc => 
                    doc.employeeId === selectedEmployeeForDocs.employeeId || 
                    doc.employeeName === selectedEmployeeForDocs.name
                  )
                  .map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{doc.category.replace('Staff Document - ', '')}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            📄 {doc.fileName}
                            {doc.fileSize && (
                              <span className="text-gray-500 ml-2">
                                ({(doc.fileSize / 1024).toFixed(1)} KB)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Uploaded {new Date(doc.uploadDate).toLocaleDateString()} 
                            {doc.uploadedBy && ` by ${doc.uploadedBy}`}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              alert(`View document:\n\n${doc.category}\n${doc.fileName}`);
                            }}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-3 rounded text-xs font-medium"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete this document?\n\n${doc.category}\n${doc.fileName}`)) {
                                const updatedDocs = legalDocuments.filter(d => d.id !== doc.id);
                                setLegalDocuments(updatedDocs);
                                localStorage.setItem('legal_documents', JSON.stringify(updatedDocs));
                                alert('Document deleted');
                              }
                            }}
                            className="bg-red-100 hover:bg-red-200 text-red-700 py-1 px-3 rounded text-xs font-medium"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                
                {legalDocuments.filter(doc => 
                  doc.employeeId === selectedEmployeeForDocs.employeeId || 
                  doc.employeeName === selectedEmployeeForDocs.name
                ).length === 0 && (
                  <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                    <p className="text-lg">No documents uploaded yet</p>
                    <p className="text-sm mt-2">Upload employee documents using the form above</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  setShowDocumentModal(false);
                  setSelectedEmployeeForDocs(null);
                }}
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
