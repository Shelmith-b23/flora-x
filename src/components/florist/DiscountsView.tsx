import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Plus, RefreshCw, Lock } from 'lucide-react';

interface DiscountsViewProps {
  verificationStatus?: string;
}

export default function DiscountsView({ verificationStatus = 'approved' }: DiscountsViewProps) {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('15');
  const [minimumPurchase, setMinimumPurchase] = useState('2500');
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [errorMessage, setErrorMessage] = useState('');

  const isRestricted = verificationStatus === 'suspended' || verificationStatus === 'rejected';

  const loadCoupons = () => {
    setLoading(true);
    axios
      .get('/api/v1/florist/coupons')
      .then((r) => {
        setCoupons(r.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load coupons:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRestricted) {
      setErrorMessage(`Account status is "${verificationStatus}". Coupon creation is restricted.`);
      return;
    }

    try {
      await axios.post('/api/v1/florist/coupons', {
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: parseFloat(discountValue),
        minimumPurchase: parseFloat(minimumPurchase),
        startDate,
        endDate
      });
      setShowForm(false);
      setCode('');
      loadCoupons();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to create coupon');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-xs">
        <RefreshCw className="animate-spin text-[#2D5A27] mx-auto mb-3" size={28} />
        <p className="text-sm font-medium text-stone-600">Loading Promo Coupons...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-serif font-bold text-stone-800">Promo Coupons & Campaigns</h2>
          <p className="text-xs text-stone-500">Create custom discount codes to boost seasonal buyer conversion.</p>
        </div>

        {!showForm && (
          <button
            onClick={() => {
              if (isRestricted) {
                alert(`Account status is "${verificationStatus}". Creation is disabled.`);
                return;
              }
              setShowForm(true);
            }}
            disabled={isRestricted}
            className="bg-[#2D5A27] hover:bg-[#23471f] disabled:bg-stone-300 text-white font-semibold py-2 px-4 rounded-xl flex items-center space-x-2 text-xs shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            <span>Create Promo Coupon</span>
          </button>
        )}
      </div>

      {isRestricted && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <Lock size={16} className="text-rose-600 shrink-0" />
          <span>Coupon creation is disabled while account status is {verificationStatus}.</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border-2 border-[#2D5A27]/30 p-6 shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">Coupon Code *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. NAIVASHA20"
              className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">Discount Type</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed_amount">Fixed Amount (KES)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">Discount Value</label>
            <input
              type="number"
              required
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">Min. Purchase (KES)</label>
            <input
              type="number"
              required
              value={minimumPurchase}
              onChange={(e) => setMinimumPurchase(e.target.value)}
              className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">Start Date</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">End Date</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
            />
          </div>

          {errorMessage && (
            <div className="md:col-span-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {errorMessage}
            </div>
          )}

          <div className="md:col-span-2 flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl text-xs hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRestricted}
              className="bg-[#2D5A27] hover:bg-[#23471f] text-white font-semibold px-6 py-2 rounded-xl text-xs shadow-xs"
            >
              Activate Coupon
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-stone-50/60">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount Value</th>
                <th className="py-3 px-4">Min. Purchase</th>
                <th className="py-3 px-4">Validity Range</th>
                <th className="py-3 px-4 text-center">Times Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {coupons.map((c, idx) => (
                <tr key={idx} className="hover:bg-stone-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-stone-800">{c.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#2D5A27]">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `KES ${c.discountValue?.toLocaleString()} OFF`}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-600">KES {c.minimumPurchase?.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-stone-500 text-[11px]">{c.startDate} to {c.endDate}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-stone-700">{c.usedCount || 0}</td>
                </tr>
              ))}

              {coupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400 text-xs">
                    No active discount coupons configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
