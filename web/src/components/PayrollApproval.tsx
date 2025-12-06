'use client';

import { useState } from 'react';
import { PayrollSubmission, calculatePayrollBreakdown, formatNaira } from '@/utils/nigerianPayroll';

interface PayrollApprovalProps {
  payrolls: PayrollSubmission[];
  onApprove: (id: string, comments: string) => void;
  onReject: (id: string, reason: string) => void;
  onMarkPaid: (id: string) => void;
  onClose: () => void;
}

export default function PayrollApproval({ payrolls, onApprove, onReject, onMarkPaid, onClose }: PayrollApprovalProps) {
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollSubmission | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

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

  const handleApprove = () => {
    if (selectedPayroll) {
      onApprove(selectedPayroll.id, comments);
      setShowApproveModal(false);
      setComments('');
      setSelectedPayroll(null);
    }
  };

  const handleReject = () => {
    if (selectedPayroll && rejectionReason.trim()) {
      onReject(selectedPayroll.id, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedPayroll(null);
    } else {
      alert('Please provide a rejection reason');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Payroll Approvals</h2>
              <p className="text-sm text-gray-600 mt-1">Review and approve payroll submissions from HR</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {payrolls.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payroll Submissions</h3>
              <p className="text-gray-600">Payroll submissions from HR will appear here for approval</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payrolls.map((payroll) => (
                <div key={payroll.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {payroll.month} {payroll.year} Payroll
                        </h3>
                        <span className={getStatusBadge(payroll.status)}>
                          {payroll.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Submitted by {payroll.submittedBy} on {new Date(payroll.submittedAt).toLocaleDateString()}
                      </p>
                      {payroll.approvedBy && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ Approved by {payroll.approvedBy} on {new Date(payroll.approvedAt!).toLocaleDateString()}
                        </p>
                      )}
                      {payroll.rejectedBy && (
                        <p className="text-sm text-red-600 mt-1">
                          ✗ Rejected by {payroll.rejectedBy} on {new Date(payroll.rejectedAt!).toLocaleDateString()}
                        </p>
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

                  {/* Employee Details */}
                  <button
                    onClick={() => setSelectedPayroll(selectedPayroll?.id === payroll.id ? null : payroll)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-3"
                  >
                    {selectedPayroll?.id === payroll.id ? '▼ Hide Details' : '► View Employee Details'}
                  </button>

                  {selectedPayroll?.id === payroll.id && (
                    <div className="space-y-3 mb-4 bg-blue-50 p-4 rounded-lg">
                      {payroll.employees.map((emp) => {
                        const breakdown = calculatePayrollBreakdown(emp);
                        return (
                          <div key={emp.id} className="bg-white p-4 rounded border border-blue-100">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">{emp.name}</p>
                                <p className="text-sm text-gray-600">{emp.employeeId} • {emp.position}</p>
                              </div>
                              <p className="text-lg font-bold text-green-700">{formatNaira(breakdown.netPay)}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-2 text-sm border-t pt-2">
                              <div>
                                <p className="text-gray-600">Gross: <span className="font-medium text-gray-900">{formatNaira(breakdown.grossSalary)}</span></p>
                                <p className="text-gray-600 text-xs mt-1">
                                  Basic: {formatNaira(breakdown.basicSalary)}<br/>
                                  Housing: {formatNaira(breakdown.housingAllowance)}<br/>
                                  Transport: {formatNaira(breakdown.transportAllowance)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Deductions: <span className="font-medium text-red-600">{formatNaira(breakdown.totalDeductions)}</span></p>
                                <p className="text-gray-600 text-xs mt-1">
                                  Pension: {formatNaira(breakdown.pensionEmployee)}<br/>
                                  NHF: {formatNaira(breakdown.nhf)}<br/>
                                  PAYE: {formatNaira(breakdown.paye)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Tax Info:</p>
                                <p className="text-gray-600 text-xs mt-1">
                                  CRA: {formatNaira(breakdown.cra)}<br/>
                                  Taxable: {formatNaira(breakdown.taxableIncome)}<br/>
                                  Employer Pension: {formatNaira(breakdown.pensionEmployer)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    {payroll.status === 'submitted' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedPayroll(payroll);
                            setShowRejectModal(true);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                        >
                          ✗ Reject
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPayroll(payroll);
                            setShowApproveModal(true);
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                        >
                          ✓ Approve Payroll
                        </button>
                      </>
                    )}
                    {payroll.status === 'approved' && !payroll.paidAt && (
                      <button
                        onClick={() => onMarkPaid(payroll.id)}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                      >
                        💰 Mark as Paid
                      </button>
                    )}
                    {payroll.status === 'rejected' && payroll.rejectionReason && (
                      <div className="flex-1 bg-red-50 border border-red-200 p-3 rounded-lg">
                        <p className="text-sm font-medium text-red-900">Rejection Reason:</p>
                        <p className="text-sm text-red-700 mt-1">{payroll.rejectionReason}</p>
                      </div>
                    )}
                    {payroll.status === 'paid' && (
                      <div className="flex-1 bg-purple-50 border border-purple-200 p-3 rounded-lg">
                        <p className="text-sm font-medium text-purple-900">
                          ✓ Paid on {new Date(payroll.paidAt!).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approve Modal */}
        {showApproveModal && selectedPayroll && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Approve Payroll</h3>
              <p className="text-gray-700 mb-4">
                You are about to approve payroll for <strong>{selectedPayroll.month} {selectedPayroll.year}</strong> with total net pay of <strong>{formatNaira(selectedPayroll.totalNet)}</strong>.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments (Optional)</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  placeholder="Add any comments..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedPayroll && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Payroll</h3>
              <p className="text-gray-700 mb-4">
                Please provide a reason for rejecting the payroll for <strong>{selectedPayroll.month} {selectedPayroll.year}</strong>.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  placeholder="Explain why this payroll is being rejected..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
