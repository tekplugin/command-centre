'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaQuestionCircle } from 'react-icons/fa';

interface Asset {
  id: string;
  name: string;
  assetClass: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  quantity: number;
  location?: string;
  serialNumber?: string;
  supplier?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  depreciationRate?: number;
  interestRate?: number;
  lastInterestDate?: string;
  nextInterestDate?: string;
  notes?: string;
  addedBy: string;
  addedAt: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [filterClass, setFilterClass] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assetClasses = [
    'Property & Buildings',
    'Vehicles',
    'Equipment & Machinery',
    'Computers & IT',
    'Furniture & Fixtures',
    'Investments - Stocks',
    'Investments - Bonds',
    'Investments - Real Estate',
    'Investments - Mutual Funds',
    'Investments - Money Market',
    'Investments - Cryptocurrency',
    'Land',
    'Other Assets'
  ];

  useEffect(() => {
    try {
      const savedAssets = localStorage.getItem('company_assets');
      if (savedAssets) setAssets(JSON.parse(savedAssets));
      setLoading(false);
    } catch (e: any) {
      setError('Failed to load assets.');
      setLoading(false);
    }
  }, []);

  const handleAddAsset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const assetClass = formData.get('assetClass') as string;
    const purchaseDate = formData.get('purchaseDate') as string;
    const interestRate = parseFloat(formData.get('interestRate') as string) || undefined;
    
    // Calculate next interest date for money market (quarterly - 3 months)
    let nextInterestDate: string | undefined;
    if (assetClass === 'Investments - Money Market' && interestRate) {
      const purchase = new Date(purchaseDate);
      const next = new Date(purchase);
      next.setMonth(next.getMonth() + 3);
      nextInterestDate = next.toISOString().split('T')[0];
    }

    const newAsset: Asset = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      assetClass,
      purchaseDate,
      purchasePrice: parseFloat(formData.get('purchasePrice') as string),
      currentValue: parseFloat(formData.get('currentValue') as string),
      quantity: parseInt(formData.get('quantity') as string) || 1,
      location: formData.get('location') as string,
      serialNumber: formData.get('serialNumber') as string,
      supplier: formData.get('supplier') as string,
      condition: formData.get('condition') as Asset['condition'],
      depreciationRate: parseFloat(formData.get('depreciationRate') as string) || undefined,
      interestRate,
      nextInterestDate,
      notes: formData.get('notes') as string,
      addedBy: `${user.firstName} ${user.lastName}`,
      addedAt: new Date().toISOString()
    };

    const updatedAssets = [newAsset, ...assets];
    setAssets(updatedAssets);
    localStorage.setItem('company_assets', JSON.stringify(updatedAssets));
    setShowAddModal(false);
    alert('✅ Asset added successfully!');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredAssets = filterClass === 'all'
    ? assets
    : assets.filter(a => a.assetClass === filterClass);

  const totalPurchaseValue = filteredAssets.reduce((sum, a) => sum + (a.purchasePrice * a.quantity), 0);
  const totalCurrentValue = filteredAssets.reduce((sum, a) => sum + (a.currentValue * a.quantity), 0);
  const totalAppreciation = totalCurrentValue - totalPurchaseValue;
  const appreciationPercent = totalPurchaseValue > 0 ? ((totalAppreciation / totalPurchaseValue) * 100) : 0;

  // Group by asset class
  const assetsByClass = assetClasses.map(className => ({
    name: className,
    count: assets.filter(a => a.assetClass === className).length,
    value: assets.filter(a => a.assetClass === className).reduce((sum, a) => sum + (a.currentValue * a.quantity), 0)
  })).filter(c => c.count > 0);

  const getConditionBadge = (condition: Asset['condition']) => {
    switch (condition) {
      case 'excellent': return <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700 text-xs"><FaCheckCircle className="mr-1" />Excellent</span>;
      case 'good': return <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs"><FaCheckCircle className="mr-1" />Good</span>;
      case 'fair': return <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs"><FaExclamationCircle className="mr-1" />Fair</span>;
      case 'poor': return <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-700 text-xs"><FaTimesCircle className="mr-1" />Poor</span>;
      default: return <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs"><FaQuestionCircle className="mr-1" />Unknown</span>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
  }
  if (error) {
    return <div className="text-red-600 text-center mt-8">{error}</div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Company Assets</h1>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-all">+ Add Asset</button>
        </div>
        <div className="mb-4 flex gap-2 flex-wrap">
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="border rounded px-3 py-2">
            <option value="all">All Classes</option>
            {assetClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-xs text-gray-600">Name</th>
                <th className="px-4 py-2 text-left text-xs text-gray-600">Class</th>
                <th className="px-4 py-2 text-left text-xs text-gray-600">Value</th>
                <th className="px-4 py-2 text-left text-xs text-gray-600">Condition</th>
                <th className="px-4 py-2 text-left text-xs text-gray-600">Location</th>
                <th className="px-4 py-2 text-left text-xs text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(asset => (
                <tr key={asset.id} className="hover:bg-blue-50 transition cursor-pointer">
                  <td className="px-4 py-2 font-medium text-gray-900" onClick={() => { setSelectedAsset(asset); setShowDetailModal(true); }}>{asset.name}</td>
                  <td className="px-4 py-2 text-gray-700">{asset.assetClass}</td>
                  <td className="px-4 py-2 text-blue-700 font-bold">₦{asset.currentValue.toLocaleString()}</td>
                  <td className="px-4 py-2">{getConditionBadge(asset.condition)}</td>
                  <td className="px-4 py-2 text-gray-600">{asset.location || '-'}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => { setSelectedAsset(asset); setShowDetailModal(true); }} className="text-blue-600 hover:underline">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Add Asset Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">Add New Asset</h2>
              <form onSubmit={handleAddAsset} id="assetForm">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        placeholder="e.g., Dell Laptop, Toyota Hilux"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Asset Class *</label>
                      <select
                        name="assetClass"
                        required
                        id="assetClassSelect"
                        onChange={(e) => {
                          const form = document.getElementById('assetForm') as HTMLFormElement;
                          const isMoneyMarket = e.target.value === 'Investments - Money Market';
                          const interestField = form?.querySelector('#interestRateField') as HTMLDivElement;
                          if (interestField) {
                            interestField.style.display = isMoneyMarket ? 'block' : 'none';
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      >
                        <option value="">Select class</option>
                        {assetClasses.map(ac => (
                          <option key={ac} value={ac}>{ac}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
                      <input
                        type="date"
                        name="purchaseDate"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (₦) *</label>
                      <input
                        type="number"
                        name="purchasePrice"
                        required
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Value (₦) *</label>
                      <input
                        type="number"
                        name="currentValue"
                        required
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        defaultValue="1"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
                      <select
                        name="condition"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Depreciation Rate (%)</label>
                      <input
                        type="number"
                        name="depreciationRate"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        placeholder="e.g., 10"
                      />
                    </div>
                    <div id="interestRateField" style={{ display: 'none' }}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interest Rate (% p.a.) *
                      </label>
                      <input
                        type="number"
                        name="interestRate"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        placeholder="e.g., 12.5"
                      />
                      <p className="text-xs text-gray-500 mt-1">Interest paid quarterly (every 3 months)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        placeholder="e.g., Head Office"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                      <input
                        type="text"
                        name="serialNumber"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        placeholder="Asset ID or S/N"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                      <input
                        type="text"
                        name="supplier"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        placeholder="Vendor name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      placeholder="Additional information about this asset..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
                  >
                    Add Asset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Asset Detail Modal */}
        {showDetailModal && selectedAsset && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">Asset Details</h2>
              <div className="mb-2"><span className="font-semibold">Name:</span> {selectedAsset.name}</div>
              <div className="mb-2"><span className="font-semibold">Class:</span> {selectedAsset.assetClass}</div>
              <div className="mb-2"><span className="font-semibold">Value:</span> ₦{selectedAsset.currentValue.toLocaleString()}</div>
              <div className="mb-2"><span className="font-semibold">Condition:</span> {getConditionBadge(selectedAsset.condition)}</div>
              <div className="mb-2"><span className="font-semibold">Location:</span> {selectedAsset.location || '-'}</div>
              <div className="mb-2"><span className="font-semibold">Serial Number:</span> {selectedAsset.serialNumber || '-'}</div>
              <div className="mb-2"><span className="font-semibold">Supplier:</span> {selectedAsset.supplier || '-'}</div>
              <div className="mb-2"><span className="font-semibold">Notes:</span> {selectedAsset.notes || '-'}</div>
              <button onClick={() => setShowDetailModal(false)} className="mt-6 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded">Close</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
