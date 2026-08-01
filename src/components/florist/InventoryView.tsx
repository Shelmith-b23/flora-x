import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  RefreshCw,
  Box,
  AlertTriangle,
  Lock,
  Plus,
  Minus,
  CheckCircle2,
  X,
  PackageCheck,
  PackageX,
  Package,
  Layers,
  SlidersHorizontal,
  ArrowRightLeft
} from 'lucide-react';

interface InventoryViewProps {
  verificationStatus?: string;
  onRefreshParent?: () => void;
}

export default function InventoryView({ verificationStatus = 'approved', onRefreshParent }: InventoryViewProps) {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [stockTab, setStockTab] = useState<'all' | 'low' | 'out' | 'healthy'>('all');
  const [loading, setLoading] = useState(true);

  // Modal State for custom stock edit
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [adjustMode, setAdjustMode] = useState<'delta' | 'set'>('delta');
  const [adjustValue, setAdjustValue] = useState<number>(0);
  const [adjusting, setAdjusting] = useState(false);

  // Feedback messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isRestricted = verificationStatus === 'suspended' || verificationStatus === 'rejected';

  const loadStock = () => {
    setLoading(true);
    axios
      .get('/api/v1/florist/inventory')
      .then((r) => {
        setItems(r.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load inventory:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadStock();
  }, []);

  const adjustStock = async (variantId: string, delta: number) => {
    if (isRestricted) {
      setErrorMsg(`Your account status is "${verificationStatus}". Adjusting stock is restricted.`);
      return;
    }
    setErrorMsg('');
    try {
      await axios.post('/api/v1/florist/inventory/adjust', { variantId, qtyDelta: delta });
      setSuccessMsg('Stock quantity updated successfully.');
      loadStock();
      if (onRefreshParent) onRefreshParent();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Stock adjustment failed');
    }
  };

  const openCustomModal = (item: any) => {
    if (isRestricted) return;
    setSelectedItem(item);
    setAdjustMode('delta');
    setAdjustValue(1);
    setErrorMsg('');
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    let delta = adjustValue;
    if (adjustMode === 'set') {
      // Delta = desiredStock - currentStock
      delta = adjustValue - selectedItem.currentStock;
    }

    if (delta === 0) {
      setSelectedItem(null);
      return;
    }

    setAdjusting(true);
    try {
      await axios.post('/api/v1/florist/inventory/adjust', {
        variantId: selectedItem.variantId,
        qtyDelta: delta
      });
      setAdjusting(false);
      setSelectedItem(null);
      setSuccessMsg(`Inventory updated for ${selectedItem.productTitle}.`);
      loadStock();
      if (onRefreshParent) onRefreshParent();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setAdjusting(false);
      setErrorMsg(err.response?.data?.error || 'Failed to update stock');
    }
  };

  // Metrics
  const totalSKUs = items.length;
  const outOfStockItems = items.filter((i) => i.currentStock <= 0);
  const lowStockItems = items.filter((i) => i.currentStock > 0 && i.currentStock <= 5);
  const healthyStockItems = items.filter((i) => i.currentStock > 5);

  // Filter items
  const filtered = items.filter((i) => {
    const matchesSearch =
      i.productTitle?.toLowerCase().includes(search.toLowerCase()) ||
      i.sku?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (stockTab === 'low') return i.currentStock > 0 && i.currentStock <= 5;
    if (stockTab === 'out') return i.currentStock <= 0;
    if (stockTab === 'healthy') return i.currentStock > 5;
    return true;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-xs">
        <RefreshCw className="animate-spin text-[#2D5A27] mx-auto mb-3" size={28} />
        <p className="text-sm font-serif font-semibold text-stone-700">Loading Stock Ledger...</p>
        <p className="text-xs text-stone-400 mt-1">Reconciling physical counts and product SKU variants.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-serif font-bold text-stone-800">Inventory</h2>
            <span className="text-xs bg-[#2D5A27]/10 text-[#2D5A27] font-semibold px-2.5 py-0.5 rounded-full">
              {totalSKUs} SKUs
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Real-time stock ledger, low-stock alerts, SKU management, and rapid inventory reconciliation.
          </p>
        </div>

        <button
          onClick={loadStock}
          className="self-start sm:self-auto px-3.5 py-2 border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className="text-stone-500" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Account Restriction Banner */}
      {isRestricted && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-3">
          <Lock size={18} className="text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold">Account Restricted ({verificationStatus.toUpperCase()})</p>
            <p className="text-amber-700 mt-0.5">
              Stock updates are disabled while your account status is {verificationStatus}. Contact support@florax.co.ke.
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Attention Callout if Low/Out of Stock */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="font-serif font-bold text-amber-950">Stock Attention Required</p>
              <p className="text-amber-800 mt-0.5">
                {outOfStockItems.length > 0 && `${outOfStockItems.length} product(s) out of stock. `}
                {lowStockItems.length > 0 && `${lowStockItems.length} product(s) low in stock.`}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {outOfStockItems.length > 0 && (
              <button
                onClick={() => setStockTab('out')}
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-3 py-1.5 rounded-xl text-[11px] transition-colors"
              >
                View Out of Stock
              </button>
            )}
            {lowStockItems.length > 0 && (
              <button
                onClick={() => setStockTab('low')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-3 py-1.5 rounded-xl text-[11px] transition-colors"
              >
                View Low Stock
              </button>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setStockTab('all')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            stockTab === 'all'
              ? 'bg-[#2D5A27]/5 border-[#2D5A27] shadow-xs'
              : 'bg-white border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center space-x-2 text-stone-500 mb-1">
            <Package size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Total SKUs</span>
          </div>
          <p className="text-lg font-serif font-bold text-stone-800">{totalSKUs}</p>
        </div>

        <div
          onClick={() => setStockTab('healthy')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            stockTab === 'healthy'
              ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
              : 'bg-white border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center space-x-2 text-emerald-700 mb-1">
            <PackageCheck size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Healthy Stock</span>
          </div>
          <p className="text-lg font-serif font-bold text-emerald-800">{healthyStockItems.length}</p>
        </div>

        <div
          onClick={() => setStockTab('low')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            stockTab === 'low'
              ? 'bg-amber-50/80 border-amber-500 shadow-xs'
              : 'bg-white border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center space-x-2 text-amber-700 mb-1">
            <AlertTriangle size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Low Stock (1-5)</span>
          </div>
          <p className="text-lg font-serif font-bold text-amber-800">{lowStockItems.length}</p>
        </div>

        <div
          onClick={() => setStockTab('out')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            stockTab === 'out'
              ? 'bg-rose-50/80 border-rose-500 shadow-xs'
              : 'bg-white border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center space-x-2 text-rose-700 mb-1">
            <PackageX size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Out of Stock</span>
          </div>
          <p className="text-lg font-serif font-bold text-rose-800">{outOfStockItems.length}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {/* Tabs */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setStockTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                stockTab === 'all' ? 'bg-white shadow-xs text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              All ({totalSKUs})
            </button>
            <button
              onClick={() => setStockTab('healthy')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                stockTab === 'healthy' ? 'bg-white shadow-xs text-emerald-800 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Healthy ({healthyStockItems.length})
            </button>
            <button
              onClick={() => setStockTab('low')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                stockTab === 'low' ? 'bg-white shadow-xs text-amber-800 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Low Stock ({lowStockItems.length})
            </button>
            <button
              onClick={() => setStockTab('out')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                stockTab === 'out' ? 'bg-white shadow-xs text-rose-800 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Out of Stock ({outOfStockItems.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search SKU or bouquet title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] bg-[#FAF9F6]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-200 text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-stone-50/60">
              <th className="py-3 px-4">Flower Bouquet</th>
              <th className="py-3 px-4">SKU Code</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
              <th className="py-3 px-4 text-center">Physical Stock</th>
              <th className="py-3 px-4">Stock Health</th>
              <th className="py-3 px-4 text-right">Stock Reconciliation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs">
            {filtered.map((item, idx) => (
              <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                <td className="py-3.5 px-4 font-serif font-bold text-stone-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 font-bold shrink-0">
                      <Box size={16} />
                    </div>
                    <span>{item.productTitle}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-stone-500 text-[11px]">{item.sku}</td>
                <td className="py-3.5 px-4 text-right font-bold text-[#2D5A27]">
                  KES {item.price?.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-stone-900 text-sm">
                  {item.currentStock}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.currentStock <= 0
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : item.currentStock <= 5
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {item.currentStock <= 0
                      ? 'OUT OF STOCK'
                      : item.currentStock <= 5
                      ? 'LOW STOCK'
                      : 'HEALTHY'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center space-x-1.5">
                    <button
                      onClick={() => adjustStock(item.variantId, -5)}
                      disabled={isRestricted || item.currentStock === 0}
                      className="px-2 py-1 border border-stone-200 text-stone-600 hover:bg-stone-100 rounded-lg font-bold text-[11px] disabled:opacity-40 transition-colors cursor-pointer"
                      title="Deduct 5 items"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => adjustStock(item.variantId, -1)}
                      disabled={isRestricted || item.currentStock === 0}
                      className="px-2 py-1 border border-stone-200 text-stone-600 hover:bg-stone-100 rounded-lg font-bold text-[11px] disabled:opacity-40 transition-colors cursor-pointer"
                      title="Deduct 1 item"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => adjustStock(item.variantId, 1)}
                      disabled={isRestricted}
                      className="px-2 py-1 border border-stone-200 text-stone-600 hover:bg-stone-100 rounded-lg font-bold text-[11px] disabled:opacity-40 transition-colors cursor-pointer"
                      title="Add 1 item"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => adjustStock(item.variantId, 5)}
                      disabled={isRestricted}
                      className="px-2 py-1 border border-stone-200 text-stone-600 hover:bg-stone-100 rounded-lg font-bold text-[11px] disabled:opacity-40 transition-colors cursor-pointer"
                      title="Add 5 items"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => openCustomModal(item)}
                      disabled={isRestricted}
                      className="px-2.5 py-1 bg-stone-800 hover:bg-stone-900 text-white rounded-lg font-medium text-[11px] disabled:opacity-40 transition-colors flex items-center space-x-1 cursor-pointer"
                      title="Set Exact Quantity"
                    >
                      <SlidersHorizontal size={12} />
                      <span className="hidden md:inline">Edit</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-stone-400 space-y-2">
                  <Box size={36} className="mx-auto text-stone-300" />
                  <p className="text-sm font-serif font-semibold text-stone-700">No Inventory Items Found</p>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    {search
                      ? 'No SKU records match your search filter.'
                      : stockTab === 'low'
                      ? 'Great news! You currently have no low stock items needing attention.'
                      : stockTab === 'out'
                      ? 'All your listed products currently have positive stock quantities.'
                      : 'No inventory items recorded yet.'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Custom Stock Adjustment Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-xl">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal size={18} className="text-[#2D5A27]" />
                <h3 className="font-serif font-bold text-stone-800 text-sm">Reconcile Stock</h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-stone-400 hover:text-stone-700 text-xs">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                <p className="font-serif font-bold text-stone-800 text-sm">{selectedItem.productTitle}</p>
                <div className="flex justify-between items-center mt-1 text-[11px] text-stone-500">
                  <span>SKU: {selectedItem.sku}</span>
                  <span>Unit Price: KES {selectedItem.price?.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-stone-200">
                <span className="text-stone-600 font-medium">Current Physical Stock:</span>
                <span className="font-bold text-stone-900 text-base">{selectedItem.currentStock}</span>
              </div>

              {/* Mode Toggle */}
              <div className="space-y-2">
                <label className="block font-semibold text-stone-700">Reconciliation Mode</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustMode('delta');
                      setAdjustValue(1);
                    }}
                    className={`py-1.5 text-center font-semibold rounded-lg transition-all ${
                      adjustMode === 'delta' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500'
                    }`}
                  >
                    Add / Subtract Delta
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustMode('set');
                      setAdjustValue(selectedItem.currentStock);
                    }}
                    className={`py-1.5 text-center font-semibold rounded-lg transition-all ${
                      adjustMode === 'set' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500'
                    }`}
                  >
                    Set New Total Count
                  </button>
                </div>
              </div>

              {/* Input */}
              {adjustMode === 'delta' ? (
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Stock Delta (+ or -)</label>
                  <input
                    type="number"
                    value={adjustValue}
                    onChange={(e) => setAdjustValue(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Use positive numbers to add stock, negative to subtract.</p>
                </div>
              ) : (
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">New Total Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    value={adjustValue}
                    onChange={(e) => setAdjustValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    This will adjust the stock ledger from {selectedItem.currentStock} to {adjustValue}.
                  </p>
                </div>
              )}

              {/* Preview */}
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex justify-between items-center text-emerald-900">
                <span className="font-semibold">Calculated Final Stock:</span>
                <span className="font-bold text-base">
                  {adjustMode === 'set'
                    ? adjustValue
                    : Math.max(0, selectedItem.currentStock + adjustValue)}
                </span>
              </div>
            </div>

            <form onSubmit={handleCustomSubmit} className="flex justify-end space-x-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl text-xs hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adjusting}
                className="bg-[#2D5A27] hover:bg-[#23471f] disabled:bg-stone-300 text-white font-medium px-5 py-2 rounded-xl text-xs shadow-xs flex items-center space-x-1.5"
              >
                {adjusting && <RefreshCw size={14} className="animate-spin" />}
                <span>{adjusting ? 'Updating...' : 'Save Stock Level'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
