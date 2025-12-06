'use client';

import { useState, useEffect } from 'react';
import { 
  PayrollEmployee, 
  calculatePayrollBreakdown, 
  formatNaira,
  PayrollSubmission 
} from '@/utils/nigerianPayroll';

interface PayrollPreparationProps {
  onClose: () => void;
  onSubmit: (payroll: PayrollSubmission) => void;
  existingPayroll?: PayrollSubmission;
}

export default function PayrollPreparation({ onClose, onSubmit, existingPayroll }: PayrollPreparationProps) {
  const [month, setMonth] = useState(existingPayroll?.month || new Date().toLocaleString('default', { month: 'long' }));
  const [year, setYear] = useState(existingPayroll?.year || new Date().getFullYear().toString());
  const [employees, setEmployees] = useState<PayrollEmployee[]>(existingPayroll?.employees || []);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<PayrollEmployee>({
    id: Date.now().toString(),
    employeeId: '',
    name: '',
    department: '',
    position: '',
    basicSalary: 0,
    housingAllowance: 0,
    transportAllowance: 0,
    otherAllowances: 0,
    loan: 0,
    advance: 0,
    otherDeductions: 0
  });

  // Auto-load all employees if creating new payroll
  useEffect(() => {
    if (!existingPayroll) {
      const savedEmployees = localStorage.getItem('employees');
      if (savedEmployees) {
        try {
          const employeeList = JSON.parse(savedEmployees);
          const activeEmployees = employeeList.filter((emp: any) => emp.status === 'active');
          
          // Convert employees to payroll format
          const payrollEmployees: PayrollEmployee[] = activeEmployees.map((emp: any) => {
            const monthlyGross = emp.employeeType === 'permanent' 
              ? parseFloat(emp.annualGross || 0) / 12 
              : parseFloat(emp.atmCount || 0) * parseFloat(emp.ratePerAtm || 0);
            
            return {
              id: Date.now().toString() + '_' + emp.id,
              employeeId: emp.employeeId,
              name: emp.name,
              department: emp.department,
              position: emp.role,
              basicSalary: emp.employeeType === 'permanent' ? monthlyGross * (emp.basicPercent / 100) : 0,
              housingAllowance: emp.employeeType === 'permanent' ? monthlyGross * (emp.housingPercent / 100) : 0,
              transportAllowance: emp.employeeType === 'permanent' ? monthlyGross * (emp.transportPercent / 100) : 0,
              otherAllowances: emp.employeeType === 'permanent' ? monthlyGross * (emp.othersPercent / 100) : monthlyGross,
              loan: parseFloat(emp.loan || 0),
              advance: 0,
              otherDeductions: parseFloat(emp.hmo || 0)
            };
          });
          
          setEmployees(payrollEmployees);
        } catch (e) {
          console.error('Error loading employees:', e);
        }
      }
    }
  }, [existingPayroll]);

  const handleAddEmployee = () => {
    if (!currentEmployee.name || !currentEmployee.employeeId || currentEmployee.basicSalary <= 0) {
      alert('Please fill in required fields');
      return;
    }

    setEmployees([...employees, { ...currentEmployee, id: Date.now().toString() }]);
    setCurrentEmployee({
      id: Date.now().toString(),
      employeeId: '',
      name: '',
      department: '',
      position: '',
      basicSalary: 0,
      housingAllowance: 0,
      transportAllowance: 0,
      otherAllowances: 0,
      loan: 0,
      advance: 0,
      otherDeductions: 0
    });
    setShowAddEmployee(false);
  };

  const handleRemoveEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const calculateTotals = () => {
    let totalGross = 0;
    let totalNet = 0;
    let totalDeductions = 0;

    employees.forEach(emp => {
      const breakdown = calculatePayrollBreakdown(emp);
      totalGross += breakdown.grossSalary;
      totalNet += breakdown.netPay;
      totalDeductions += breakdown.totalDeductions;
    });

    return { totalGross, totalNet, totalDeductions };
  };

  const handleSubmit = (status: 'draft' | 'submitted') => {
    if (employees.length === 0) {
      alert('Please add at least one employee');
      return;
    }

    // Check for duplicate payroll period (only for new submissions, not updates)
    if (!existingPayroll) {
      const savedPayrolls = localStorage.getItem('payroll_submissions');
      if (savedPayrolls) {
        try {
          const payrolls: PayrollSubmission[] = JSON.parse(savedPayrolls);
          const duplicate = payrolls.find(p => 
            p.month === month && 
            p.year === year && 
            p.status !== 'rejected'
          );
          
          if (duplicate) {
            alert(`⚠️ A payroll for ${month} ${year} already exists!\n\nStatus: ${duplicate.status.toUpperCase()}\n\nOnly one payroll is allowed per period. Please edit the existing payroll or delete it first.`);
            return;
          }
        } catch (e) {
          console.error('Error checking for duplicates:', e);
        }
      }
    }

    const totals = calculateTotals();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const payroll: PayrollSubmission = {
      id: existingPayroll?.id || Date.now().toString(),
      month,
      year,
      employees,
      totalGross: totals.totalGross,
      totalNet: totals.totalNet,
      totalDeductions: totals.totalDeductions,
      status,
      submittedBy: existingPayroll?.submittedBy || `${user.firstName} ${user.lastName}`,
      submittedAt: existingPayroll?.submittedAt || new Date().toISOString(),
      ...(existingPayroll?.approvedBy && { approvedBy: existingPayroll.approvedBy }),
      ...(existingPayroll?.approvedAt && { approvedAt: existingPayroll.approvedAt }),
      ...(existingPayroll?.rejectedBy && { rejectedBy: existingPayroll.rejectedBy }),
      ...(existingPayroll?.rejectedAt && { rejectedAt: existingPayroll.rejectedAt }),
      ...(existingPayroll?.rejectionReason && { rejectionReason: existingPayroll.rejectionReason }),
    };

    onSubmit(payroll);
    alert(existingPayroll ? 'Payroll updated successfully!' : (status === 'draft' ? 'Payroll saved as draft' : 'Payroll submitted to Finance for approval!'));
    onClose();
  };

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Prepare Payroll</h2>
              <p className="text-sm text-gray-600 mt-1">Nigerian Payroll System - Auto-calculated deductions</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* Period Selection */}
          <div className="mt-4 flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select 
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Total Employees</p>
              <p className="text-2xl font-bold text-blue-900">{employees.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Total Gross</p>
              <p className="text-2xl font-bold text-green-900">{formatNaira(totals.totalGross)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-700 font-medium">Total Net Pay</p>
              <p className="text-2xl font-bold text-purple-900">{formatNaira(totals.totalNet)}</p>
            </div>
          </div>

          {/* Add Employee Button */}
          <button
            onClick={() => setShowAddEmployee(true)}
            className="w-full mb-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Add Employee to Payroll
          </button>

          {/* Employees List */}
          {employees.length > 0 && (
            <div className="space-y-4">
              {employees.map((emp) => {
                const breakdown = calculatePayrollBreakdown(emp);
                return (
                  <div key={emp.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                            <p className="text-sm text-gray-600">{emp.employeeId} • {emp.position} • {emp.department}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveEmployee(emp.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded"
                          >
                            ✕ Remove
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-gray-600">Basic: <span className="font-medium text-gray-900">{formatNaira(breakdown.basicSalary)}</span></p>
                            <p className="text-gray-600">Housing: <span className="font-medium text-gray-900">{formatNaira(breakdown.housingAllowance)}</span></p>
                            <p className="text-gray-600">Transport: <span className="font-medium text-gray-900">{formatNaira(breakdown.transportAllowance)}</span></p>
                            <p className="text-gray-600">Others: <span className="font-medium text-gray-900">{formatNaira(breakdown.otherAllowances)}</span></p>
                            <p className="font-semibold text-gray-900 mt-1">Gross: {formatNaira(breakdown.grossSalary)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Pension (8%): <span className="text-red-600">{formatNaira(breakdown.pensionEmployee)}</span></p>
                            <p className="text-gray-600">NHF (2.5%): <span className="text-red-600">{formatNaira(breakdown.nhf)}</span></p>
                            <p className="text-gray-600">PAYE Tax: <span className="text-red-600">{formatNaira(breakdown.paye)}</span></p>
                            {breakdown.loan > 0 && <p className="text-gray-600">Loan: <span className="text-red-600">{formatNaira(breakdown.loan)}</span></p>}
                            <p className="font-semibold text-green-700 mt-1">Net Pay: {formatNaira(breakdown.netPay)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Employee Form */}
          {showAddEmployee && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Add Employee</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                      <input
                        type="text"
                        value={currentEmployee.employeeId}
                        onChange={(e) => setCurrentEmployee({...currentEmployee, employeeId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={currentEmployee.name}
                        onChange={(e) => setCurrentEmployee({...currentEmployee, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={currentEmployee.department}
                        onChange={(e) => setCurrentEmployee({...currentEmployee, department: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <input
                        type="text"
                        value={currentEmployee.position}
                        onChange={(e) => setCurrentEmployee({...currentEmployee, position: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">💰 Earnings</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary * (₦)</label>
                        <input
                          type="number"
                          value={currentEmployee.basicSalary || ''}
                          onChange={(e) => setCurrentEmployee({...currentEmployee, basicSalary: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Housing Allowance (₦)</label>
                        <input
                          type="number"
                          value={currentEmployee.housingAllowance || ''}
                          onChange={(e) => setCurrentEmployee({...currentEmployee, housingAllowance: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Transport Allowance (₦)</label>
                        <input
                          type="number"
                          value={currentEmployee.transportAllowance || ''}
                          onChange={(e) => setCurrentEmployee({...currentEmployee, transportAllowance: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Other Allowances (₦)</label>
                        <input
                          type="number"
                          value={currentEmployee.otherAllowances || ''}
                          onChange={(e) => setCurrentEmployee({...currentEmployee, otherAllowances: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">➖ Additional Deductions (Optional)</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loan (₦)</label>
                        <input
                          type="number"
                          value={currentEmployee.loan || ''}
                          onChange={(e) => setCurrentEmployee({...currentEmployee, loan: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Advance (₦)</label>
                        <input
                          type="number"
                          value={currentEmployee.advance || ''}
                          onChange={(e) => setCurrentEmployee({...currentEmployee, advance: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Others (₦)</label>
                        <input
                          type="number"
                          value={currentEmployee.otherDeductions || ''}
                          onChange={(e) => setCurrentEmployee({...currentEmployee, otherDeductions: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  {currentEmployee.basicSalary > 0 && (
                    <div className="border-t pt-4 bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">📊 Preview</h4>
                      {(() => {
                        const preview = calculatePayrollBreakdown(currentEmployee);
                        return (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p className="text-gray-700">Gross Salary: <span className="font-semibold text-gray-900">{formatNaira(preview.grossSalary)}</span></p>
                            <p className="text-gray-700">Total Deductions: <span className="font-semibold text-red-600">{formatNaira(preview.totalDeductions)}</span></p>
                            <p className="text-gray-700 col-span-2 mt-2 text-lg">Net Pay: <span className="font-bold text-green-700">{formatNaira(preview.netPay)}</span></p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddEmployee(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEmployee}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Add Employee
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit('draft')}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              disabled={employees.length === 0}
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit('submitted')}
              className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              disabled={employees.length === 0}
            >
              Submit to Finance for Approval →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
