'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

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
    const savedAssets = localStorage.getItem('company_assets');
    if (savedAssets) {
      try {
        setAssets(JSON.parse(savedAssets));
      } catch (e) {
        console.error('Error loading assets:', e);
      }
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

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Asset Management</h1>
            <p className="text-gray-600 mt-1">Track assets, investments, and capital expenditure</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            + Add Asset
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Total Assets</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{filteredAssets.length}</div>
            <div className="text-xs text-gray-500 mt-1">{assetsByClass.length} categories</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Purchase Value</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{formatCurrency(totalPurchaseValue)}</div>
            <div className="text-xs text-gray-500 mt-1">Total invested</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Current Value</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(totalCurrentValue)}</div>
            <div className="text-xs text-gray-500 mt-1">Market value</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Appreciation</div>
            <div className={`text-3xl font-bold mt-2 ${totalAppreciation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {appreciationPercent >= 0 ? '+' : ''}{appreciationPercent.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">{formatCurrency(totalAppreciation)}</div>
          </div>
        </div>

        {/* Filter by Asset Class */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Asset Class</label>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
          >
            <option value="all">All Assets ({assets.length})</option>
            {assetsByClass.map(ac => (
              <option key={ac.name} value={ac.name}>
                {ac.name} ({ac.count}) - {formatCurrency(ac.value)}
              </option>
            ))}
          </select>
        </div>

        {/* Assets List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {filterClass === 'all' ? 'All Assets' : filterClass}
            </h3>
          </div>
          <div className="overflow-x-auto">
            {filteredAssets.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssets.map((asset) => {
                    const appreciation = ((asset.currentValue - asset.purchasePrice) / asset.purchasePrice * 100);
                    return (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{asset.assetClass}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(asset.purchaseDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatCurrency(asset.purchasePrice * asset.quantity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                          {formatCurrency(asset.currentValue * asset.quantity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">{asset.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            asset.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                            asset.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                            asset.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {asset.condition}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setShowDetailModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-lg font-medium">No assets found</p>
                <p className="text-sm mt-2">
                  {filterClass === 'all' 
                    ? 'Start tracking your assets and investments'
                    : `No assets in ${filterClass} category`
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Asset Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Asset</h2>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedAsset.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedAsset.assetClass}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedAsset(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Purchase Value</div>
                    <div className="text-2xl font-bold text-blue-700 mt-1">
                      {formatCurrency(selectedAsset.purchasePrice * selectedAsset.quantity)}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {formatCurrency(selectedAsset.purchasePrice)} × {selectedAsset.quantity}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Current Value</div>
                    <div className="text-2xl font-bold text-green-700 mt-1">
                      {formatCurrency(selectedAsset.currentValue * selectedAsset.quantity)}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {((selectedAsset.currentValue - selectedAsset.purchasePrice) / selectedAsset.purchasePrice * 100).toFixed(1)}% change
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Asset Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Purchase Date:</span>
                      <p className="font-medium text-gray-900">{new Date(selectedAsset.purchaseDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Condition:</span>
                      <p className="font-medium text-gray-900 capitalize">{selectedAsset.condition}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Quantity:</span>
                      <p className="font-medium text-gray-900">{selectedAsset.quantity}</p>
                    </div>
                    {selectedAsset.depreciationRate && (
                      <div>
                        <span className="text-gray-600">Depreciation Rate:</span>
                        <p className="font-medium text-gray-900">{selectedAsset.depreciationRate}%</p>
                      </div>
                    )}
                    {selectedAsset.interestRate && (
                      <div>
                        <span className="text-gray-600">Interest Rate (p.a.):</span>
                        <p className="font-medium text-gray-900">{selectedAsset.interestRate}%</p>
                      </div>
                    )}
                    {selectedAsset.nextInterestDate && (
                      <div>
                        <span className="text-gray-600">Next Interest Date:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedAsset.nextInterestDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedAsset.location && (
                      <div>
                        <span className="text-gray-600">Location:</span>
                        <p className="font-medium text-gray-900">{selectedAsset.location}</p>
                      </div>
                    )}
                    {selectedAsset.serialNumber && (
                      <div>
                        <span className="text-gray-600">Serial Number:</span>
                        <p className="font-medium text-gray-900">{selectedAsset.serialNumber}</p>
                      </div>
                    )}
                    {selectedAsset.supplier && (
                      <div>
                        <span className="text-gray-600">Supplier:</span>
                        <p className="font-medium text-gray-900">{selectedAsset.supplier}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Added By:</span>
                      <p className="font-medium text-gray-900">{selectedAsset.addedBy}</p>
                    </div>
                  </div>
                </div>

                {selectedAsset.notes && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                    <p className="text-sm text-gray-700">{selectedAsset.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedAsset(null);
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
