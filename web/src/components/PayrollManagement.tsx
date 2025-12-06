'use client';

import { useState } from 'react';
import { PayrollSubmission, formatNaira, calculatePayrollBreakdown } from '@/utils/nigerianPayroll';
import PayrollPreparation from './PayrollPreparation';

interface PayrollManagementProps {
  payrolls: PayrollSubmission[];
  onUpdate: (payrolls: PayrollSubmission[]) => void;
  onClose: () => void;
}

export default function PayrollManagement({ payrolls, onUpdate, onClose }: PayrollManagementProps) {
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollSubmission | null>(null);
  const [expandedPayrollId, setExpandedPayrollId] = useState<string | null>(null);

  const handleCreateNew = (payroll: PayrollSubmission) => {
    const updatedPayrolls = [...payrolls, payroll];
    onUpdate(updatedPayrolls);
    setShowCreateNew(false);
  };

  const handleEdit = (payroll: PayrollSubmission) => {
    setEditingPayroll(payroll);
  };

  const handleUpdatePayroll = (updatedPayroll: PayrollSubmission) => {
    const updatedPayrolls = payrolls.map(p => 
      p.id === updatedPayroll.id ? updatedPayroll : p
    );
    onUpdate(updatedPayrolls);
    setEditingPayroll(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this payroll?')) {
      const updatedPayrolls = payrolls.filter(p => p.id !== id);
      onUpdate(updatedPayrolls);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      submitted: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      paid: 'bg-purple-100 text-purple-700'
    };
    return `px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || styles.draft}`;
  };

  // Show create new payroll form
  if (showCreateNew) {
    return <PayrollPreparation onClose={() => setShowCreateNew(false)} onSubmit={handleCreateNew} />;
  }

  // Show edit payroll form
  if (editingPayroll) {
    return (
      <PayrollPreparation 
        onClose={() => setEditingPayroll(null)} 
        onSubmit={handleUpdatePayroll}
        existingPayroll={editingPayroll}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Payroll Management</h2>
              <p className="text-sm text-gray-600 mt-1">Create, view, and modify payroll submissions</p>
            </div>
            <div className="flex gap-2">
              {payrolls.length > 0 && (
                <button 
                  onClick={() => {
                    if (confirm('⚠️ Are you sure you want to delete ALL payroll submissions? This action cannot be undone!')) {
                      onUpdate([]);
                      alert('✅ All payroll submissions have been deleted');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                >
                  🗑️ Delete All
                </button>
              )}
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <span className="text-2xl">×</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Create New Payroll Button */}
          <button
            onClick={() => setShowCreateNew(true)}
            className="w-full mb-6 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            Create New Payroll
          </button>

          {/* Payroll List */}
          {payrolls.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payrolls Yet</h3>
              <p className="text-gray-600">Add employees first, then create payroll from the Add Employee flow</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payrolls.map((payroll) => (
                <div key={payroll.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {payroll.month} {payroll.year}
                        </h3>
                        <span className={getStatusBadge(payroll.status)}>
                          {payroll.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Created on {new Date(payroll.submittedAt).toLocaleDateString()}
                      </p>
                      {payroll.status === 'rejected' && payroll.rejectionReason && (
                        <p className="text-sm text-red-600 mt-1">
                          ✗ Rejected: {payroll.rejectionReason}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {(payroll.status === 'draft' || payroll.status === 'rejected') && (
                        <>
                          <button
                            onClick={() => handleEdit(payroll)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(payroll.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="grid grid-cols-4 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Employees</p>
                      <p className="text-xl font-bold text-gray-900">{payroll.employees.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Gross</p>
                      <p className="text-xl font-bold text-blue-900">{formatNaira(payroll.totalGross)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Deductions</p>
                      <p className="text-xl font-bold text-red-900">{formatNaira(payroll.totalDeductions)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Net Pay</p>
                      <p className="text-xl font-bold text-green-900">{formatNaira(payroll.totalNet)}</p>
                    </div>
                  </div>

                  {/* Toggle Details */}
                  <button
                    onClick={() => setExpandedPayrollId(expandedPayrollId === payroll.id ? null : payroll.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {expandedPayrollId === payroll.id ? '▼ Hide Employees' : '► View Employees'}
                  </button>

                  {/* Employee Details */}
                  {expandedPayrollId === payroll.id && (
                    <div className="mt-4 space-y-3 bg-blue-50 p-4 rounded-lg">
                      {payroll.employees.map((emp) => {
                        const breakdown = calculatePayrollBreakdown(emp);
                        return (
                          <div key={emp.id} className="bg-white p-4 rounded border border-blue-100">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900">{emp.name}</p>
                                <p className="text-sm text-gray-600">{emp.employeeId} • {emp.position}</p>
                              </div>
                              <p className="text-lg font-bold text-green-700">{formatNaira(breakdown.netPay)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                              <div>
                                <p className="text-gray-600">Gross: <span className="font-medium text-gray-900">{formatNaira(breakdown.grossSalary)}</span></p>
                              </div>
                              <div>
                                <p className="text-gray-600">Deductions: <span className="font-medium text-red-600">{formatNaira(breakdown.totalDeductions)}</span></p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
