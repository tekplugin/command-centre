'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

interface Part {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorderPoint: number;
  price: string;
  supplier: string;
  lastRestocked: string;
}

export default function InventoryPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: 0,
    reorderPoint: 0,
    price: '',
    supplier: '',
  });

  // Load inventory from localStorage
  useEffect(() => {
    const savedParts = localStorage.getItem('inventory');
    if (savedParts) {
      try {
        setParts(JSON.parse(savedParts));
      } catch (e) {
        console.error('Error loading inventory:', e);
      }
    }
  }, []);

  const sampleParts: Part[] = [
    {
      id: '1',
      name: 'Cash Dispenser Unit',
      category: 'Dispensers',
      stock: 8,
      reorderPoint: 5,
      price: '₦450,000',
      supplier: 'Diebold Nixdorf',
      lastRestocked: '2024-11-15',
    },
    {
      id: '2',
      name: 'Card Reader Module',
      category: 'Readers',
      stock: 3,
      reorderPoint: 8,
      price: '₦125,000',
      supplier: 'NCR Corporation',
      lastRestocked: '2024-11-20',
    },
    {
      id: '3',
      name: 'Receipt Printer',
      category: 'Printers',
      stock: 12,
      reorderPoint: 10,
      price: '₦85,000',
      supplier: 'Wincor Nixdorf',
      lastRestocked: '2024-11-22',
    },
    {
      id: '4',
      name: 'EMV Chip Reader',
      category: 'Readers',
      stock: 15,
      reorderPoint: 12,
      price: '₦95,000',
      supplier: 'Ingenico',
      lastRestocked: '2024-11-10',
    },
    {
      id: '5',
      name: 'Touchscreen Display',
      category: 'Screens',
      stock: 6,
      reorderPoint: 8,
      price: '₦180,000',
      supplier: 'Samsung',
      lastRestocked: '2024-11-18',
    },
    {
      id: '6',
      name: 'Power Supply Unit',
      category: 'Power',
      stock: 10,
      reorderPoint: 6,
      price: '₦55,000',
      supplier: 'Mean Well',
      lastRestocked: '2024-11-25',
    },
    {
      id: '7',
      name: 'Bill Validator',
      category: 'Sensors',
      stock: 0,
      reorderPoint: 5,
      price: '₦320,000',
      supplier: 'JCM Global',
      lastRestocked: '2024-10-30',
    },
    {
      id: '8',
      name: 'Thermal Paper Rolls',
      category: 'Consumables',
      stock: 250,
      reorderPoint: 100,
      price: '₦2,500',
      supplier: 'Local Supplier',
      lastRestocked: '2024-11-28',
    },
    {
      id: '9',
      name: 'Anti-Skimming Device',
      category: 'Security',
      stock: 5,
      reorderPoint: 8,
      price: '₦145,000',
      supplier: 'Fico',
      lastRestocked: '2024-11-12',
    },
    {
      id: '10',
      name: 'Network Router',
      category: 'Network',
      stock: 14,
      reorderPoint: 10,
      price: '₦75,000',
      supplier: 'Cisco',
      lastRestocked: '2024-11-24',
    },
  ];

  const getStockStatus = (stock: number, reorderPoint: number) => {
    if (stock === 0) return { label: 'OUT OF STOCK', color: 'bg-red-100 text-red-800' };
    if (stock < reorderPoint * 0.5) return { label: 'CRITICAL', color: 'bg-red-100 text-red-800' };
    if (stock < reorderPoint) return { label: 'LOW STOCK', color: 'bg-orange-100 text-orange-800' };
    return { label: 'GOOD', color: 'bg-green-100 text-green-800' };
  };

  const getStockPercentage = (stock: number, reorderPoint: number) => {
    const maxStock = reorderPoint * 2;
    return Math.min((stock / maxStock) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 0) return 'bg-red-600';
    if (percentage < 25) return 'bg-red-500';
    if (percentage < 50) return 'bg-orange-500';
    if (percentage < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const stats = {
    totalItems: parts.length,
    lowStock: parts.filter(p => p.stock < p.reorderPoint).length,
    outOfStock: parts.filter(p => p.stock === 0).length,
    totalValue: '₦2.8M',
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Parts Inventory</h1>
            <div className="flex gap-2">
              <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                Generate Report
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                + Add Part
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Total Items</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalItems}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Low Stock</div>
              <div className="text-3xl font-bold text-orange-600 mt-2">{stats.lowStock}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Out of Stock</div>
              <div className="text-3xl font-bold text-red-600 mt-2">{stats.outOfStock}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Total Value</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalValue}</div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Part Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parts.map((part) => {
                  const status = getStockStatus(part.stock, part.reorderPoint);
                  const percentage = getStockPercentage(part.stock, part.reorderPoint);
                  
                  return (
                    <tr key={part.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{part.name}</div>
                        <div className="text-sm text-gray-500">Reorder at: {part.reorderPoint} units</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                          {part.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 mb-1">{part.stock} units</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(percentage)}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {part.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{part.supplier}</div>
                        <div className="text-xs text-gray-500">Last: {part.lastRestocked}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Restock</button>
                        <button className="text-gray-600 hover:text-gray-900">Edit</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Part Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Part</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              // TODO: Submit to backend API
              console.log('New part:', formData);
              setShowAddModal(false);
              setFormData({
                name: '',
                category: '',
                stock: 0,
                reorderPoint: 0,
                price: '',
                supplier: '',
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., Card Reader Module"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Dispensers">Dispensers</option>
                    <option value="Readers">Readers</option>
                    <option value="Printers">Printers</option>
                    <option value="Screens">Screens</option>
                    <option value="Power">Power</option>
                    <option value="Sensors">Sensors</option>
                    <option value="Security">Security</option>
                    <option value="Network">Network</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.reorderPoint}
                      onChange={(e) => setFormData({...formData, reorderPoint: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                  <input
                    type="text"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., 125,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    required
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., NCR Corporation"
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
                  Add Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
