import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Tag,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Lock,
  Calendar,
  Percent,
  Coins,
  Copy,
  Check,
  X,
  Clock,
  Sparkles
} from 'lucide-react';

interface Coupon {
  id: string;
  floristId?: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minimumPurchase: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  status: 'active' | 'scheduled' | 'expired' | 'disabled';
  startDate?: string;
  endDate?: string;
  created_at?: string;
}

interface DiscountsViewProps {
  verificationStatus?: string;
}

export default function DiscountsView({ verificationStatus = 'approved' }: DiscountsViewProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed_amount',
    discountValue: '',
    minimumPurchase: '0',
    maxDiscount: '',
    usageLimit: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    status: 'active' as 'active' | 'scheduled' | 'disabled'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation State
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isRestricted = verificationStatus === 'suspended' || verificationStatus === 'rejected';

  const loadCoupons = (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    axios
      .get('/api/v1/florist/coupons')
      .then((r) => {
        setCoupons(r.data || []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((err) => {
        console.error('Failed to load coupons:', err);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const showNotificationMsg = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenCreateModal = () => {
    if (isRestricted) return;
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minimumPurchase: '0',
      maxDiscount: '',
      usageLimit: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      status: 'active'
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    if (isRestricted) return;
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minimumPurchase: coupon.minimumPurchase.toString(),
      maxDiscount: coupon.maxDiscount ? coupon.maxDiscount.toString() : '',
      usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
      startDate: coupon.startDate || new Date().toISOString().split('T')[0],
      endDate: coupon.endDate || '2026-12-31',
      status: (coupon.status === 'expired' ? 'disabled' : coupon.status) as any
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRestricted || submitting) return;

    const cleanCode = formData.code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 3) {
      setFormError('Coupon code must be at least 3 characters.');
      return;
    }

    const val = parseFloat(formData.discountValue);
    if (isNaN(val) || val <= 0) {
      setFormError('Discount value must be a positive number.');
      return;
    }

    if (formData.discountType === 'percentage' && val > 100) {
      setFormError('Percentage discount cannot exceed 100%.');
      return;
    }

    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      setFormError('End date must be on or after start date.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      code: cleanCode,
      description: formData.description.trim(),
      discountType: formData.discountType,
      discountValue: val,
      minimumPurchase: Math.max(0, parseFloat(formData.minimumPurchase) || 0),
      maxDiscount: formData.maxDiscount ? Math.max(0, parseFloat(formData.maxDiscount)) : null,
      usageLimit: formData.usageLimit ? Math.max(1, parseInt(formData.usageLimit, 10)) : null,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status
    };

    try {
      if (editingCoupon) {
        const res = await axios.put(`/api/v1/florist/coupons/${editingCoupon.id}`, payload);
        const updated = res.data?.coupon;
        setCoupons((prev) => prev.map((c) => (c.id === editingCoupon.id ? { ...c, ...updated } : c)));
        showNotificationMsg('success', `Campaign "${cleanCode}" updated successfully.`);
      } else {
        const res = await axios.post('/api/v1/florist/coupons', payload);
        setCoupons((prev) => [res.data, ...prev]);
        showNotificationMsg('success', `Promo Code "${cleanCode}" created successfully.`);
      }

      setShowModal(false);
      setSubmitting(false);
    } catch (err: any) {
      console.error('Failed to save coupon:', err);
      setFormError(err.response?.data?.error || 'Failed to save discount campaign.');
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    if (isRestricted) return;
    const newStatus = coupon.status === 'active' ? 'disabled' : 'active';

    try {
      const res = await axios.put(`/api/v1/florist/coupons/${coupon.id}`, {
        status: newStatus
      });
      const updated = res.data?.coupon;
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, ...updated } : c)));
      showNotificationMsg('success', `Coupon "${coupon.code}" is now ${newStatus}.`);
    } catch (err: any) {
      console.error('Failed to toggle coupon status:', err);
      showNotificationMsg('error', err.response?.data?.error || 'Failed to update status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!couponToDelete || isRestricted || deleting) return;
    setDeleting(true);

    try {
      await axios.delete(`/api/v1/florist/coupons/${couponToDelete.id}`);
      setCoupons((prev) => prev.filter((c) => c.id !== couponToDelete.id));
      showNotificationMsg('success', `Discount code "${couponToDelete.code}" deleted.`);
      setCouponToDelete(null);
      setDeleting(false);
    } catch (err: any) {
      console.error('Failed to delete coupon:', err);
      showNotificationMsg('error', err.response?.data?.error || 'Failed to delete coupon.');
      setDeleting(false);
    }
  };

  // Metrics Calculations
  const activeCoupons = coupons.filter((c) => c.status === 'active').length;
  const scheduledCoupons = coupons.filter((c) => c.status === 'scheduled').length;
  const expiredOrDisabled = coupons.filter((c) => c.status === 'disabled' || c.status === 'expired').length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  // Dynamic Status evaluation based on current date
  const computeCouponStatus = (c: Coupon): 'active' | 'scheduled' | 'expired' | 'disabled' => {
    if (c.status === 'disabled') return 'disabled';
    const now = new Date();
    if (c.endDate && new Date(c.endDate) < now) return 'expired';
    if (c.startDate && new Date(c.startDate) > now) return 'scheduled';
    return 'active';
  };

  // Filter & Search
  const filteredCoupons = coupons.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      c.code.toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q);

    const actualStatus = computeCouponStatus(c);
    const matchStatus = filterStatus === 'all' || actualStatus === filterStatus;

    return matchSearch && matchStatus;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No expiration';
    try {
      return new Date(dateStr).toLocaleDateString('en-KE', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-16 text-center shadow-xs">
        <RefreshCw className="animate-spin text-[#2D5A27] mx-auto mb-3" size={28} />
        <p className="text-sm font-medium text-stone-700">Loading Atelier Promotions & Campaigns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* RESTRICTION BANNER */}
      {isRestricted && (
        <div className="p-4 rounded-2xl bg-rose-950/90 text-rose-100 border border-rose-800 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center space-x-2.5">
            <Lock size={16} className="text-rose-400 shrink-0" />
            <span>
              Your florist account is currently {verificationStatus}. Campaign modifications are in read-only mode.
            </span>
          </div>
        </div>
      )}

      {/* NOTIFICATION BANNER */}
      {notification && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 border transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-stone-900">Promotions & Discount Campaigns</h2>
          <p className="text-xs text-stone-500">
            Create customized florist coupon codes, percentage discounts, and seasonal vouchers.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-end sm:self-auto">
          <button
            onClick={() => loadCoupons(true)}
            disabled={refreshing}
            className="px-3 py-2 rounded-xl border border-stone-200 hover:border-[#2D5A27] text-stone-600 hover:text-[#2D5A27] text-xs font-medium transition-colors flex items-center space-x-1.5 bg-stone-50/50 cursor-pointer"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#2D5A27]' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            disabled={isRestricted}
            className="bg-[#2D5A27] hover:bg-[#23471f] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Plus size={15} />
            <span>Create Discount</span>
          </button>
        </div>
      </div>

      {/* CAMPAIGN METRICS DASHBOARD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-1">
            Active Campaigns
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-serif font-bold text-[#2D5A27]">{activeCoupons}</span>
            <span className="text-xs text-stone-400">live now</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-1">
            Scheduled
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-serif font-bold text-sky-700">{scheduledCoupons}</span>
            <span className="text-xs text-stone-400">upcoming</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-1">
            Total Redemptions
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-serif font-bold text-stone-800">{totalRedemptions}</span>
            <span className="text-xs text-stone-400">orders</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-1">
            Expired / Paused
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-serif font-bold text-stone-500">{expiredOrDisabled}</span>
            <span className="text-xs text-stone-400">inactive</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search coupon code, campaign notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs bg-[#FAF9F6] focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-1 border border-stone-200 rounded-xl p-1 bg-[#FAF9F6] text-xs self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {['all', 'active', 'scheduled', 'expired', 'disabled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors cursor-pointer shrink-0 ${
                filterStatus === st
                  ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* COUPONS DIRECTORY (CARD / TABLE VIEW) */}
      <div className="space-y-4">
        {filteredCoupons.map((c) => {
          const actualStatus = computeCouponStatus(c);
          const isCopied = copiedCode === c.code;

          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:border-stone-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              {/* Left Column: Code & Value */}
              <div className="flex items-start space-x-4">
                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-stone-200 flex flex-col items-center justify-center shrink-0 w-24">
                  {c.discountType === 'percentage' ? (
                    <Percent size={20} className="text-[#2D5A27] mb-1" />
                  ) : (
                    <Coins size={20} className="text-amber-600 mb-1" />
                  )}
                  <span className="text-base font-serif font-bold text-stone-900 leading-tight">
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `KES ${c.discountValue.toLocaleString()}`}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-stone-400 font-medium">OFF</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center space-x-1.5 bg-stone-100 px-3 py-1 rounded-xl border border-stone-200">
                      <Tag size={12} className="text-stone-500" />
                      <span className="font-mono font-bold text-xs text-stone-900 tracking-wider">
                        {c.code}
                      </span>
                      <button
                        onClick={() => handleCopy(c.code)}
                        title="Copy Code"
                        className="text-stone-400 hover:text-stone-700 ml-1 cursor-pointer"
                      >
                        {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold capitalize border ${
                        actualStatus === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : actualStatus === 'scheduled'
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : actualStatus === 'expired'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      {actualStatus}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 font-medium">
                    {c.description || 'Exclusive floral atelier discount'}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-400">
                    <span>
                      Min. Order: <strong className="text-stone-700 font-mono">KES {c.minimumPurchase?.toLocaleString() || 0}</strong>
                    </span>
                    {c.maxDiscount && (
                      <span>
                        Max Discount: <strong className="text-stone-700 font-mono">KES {c.maxDiscount.toLocaleString()}</strong>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>
                        {formatDate(c.startDate)} – {formatDate(c.endDate)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Redemptions & Action Controls */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-stone-100 gap-3">
                <div className="text-left md:text-right space-y-1">
                  <span className="text-[10px] text-stone-400 block uppercase tracking-wider">Redemptions</span>
                  <div className="flex items-baseline space-x-1 md:justify-end">
                    <span className="text-sm font-serif font-bold text-stone-800">{c.usedCount || 0}</span>
                    <span className="text-xs text-stone-400">
                      {c.usageLimit ? `/ ${c.usageLimit} max` : 'used (Unlimited)'}
                    </span>
                  </div>

                  {c.usageLimit && (
                    <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden mt-1">
                      <div
                        style={{
                          width: `${Math.min(100, Math.round(((c.usedCount || 0) / c.usageLimit) * 100))}%`
                        }}
                        className="h-full bg-[#2D5A27] rounded-full"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleToggleStatus(c)}
                    disabled={isRestricted}
                    title={c.status === 'active' ? 'Pause Campaign' : 'Activate Campaign'}
                    className="p-1.5 rounded-lg border border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-900 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {c.status === 'active' ? (
                      <ToggleRight size={18} className="text-[#2D5A27]" />
                    ) : (
                      <ToggleLeft size={18} className="text-stone-400" />
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(c)}
                    disabled={isRestricted}
                    title="Edit Campaign"
                    className="p-1.5 rounded-lg border border-stone-200 hover:border-stone-300 text-stone-600 hover:text-[#2D5A27] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    onClick={() => setCouponToDelete(c)}
                    disabled={isRestricted}
                    title="Delete Campaign"
                    className="p-1.5 rounded-lg border border-stone-200 hover:border-rose-200 text-stone-400 hover:text-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* EMPTY STATE */}
        {coupons.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-200/80 p-16 text-center shadow-xs space-y-3">
            <Tag size={40} className="mx-auto text-stone-300 stroke-[1.2]" />
            <h3 className="font-serif font-bold text-stone-800 text-base">No Promotional Discounts Yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Boost your orders and delight returning floral gift buyers by offering custom promotional vouchers.
            </p>
            <button
              onClick={handleOpenCreateModal}
              disabled={isRestricted}
              className="mt-2 bg-[#2D5A27] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#23471f] transition-colors cursor-pointer"
            >
              Create First Campaign
            </button>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-stone-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base">
                  {editingCoupon ? 'Edit Promotion Campaign' : 'Create Floral Promo Code'}
                </h3>
                <p className="text-xs text-stone-500">Define code rules, discounts, and validity duration.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Code & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Promo Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VALENTINE20"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl bg-[#FAF9F6] font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Discount Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed_amount' })
                    }
                    className="w-full p-2.5 border border-stone-200 rounded-xl bg-[#FAF9F6] focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="fixed_amount">Fixed Amount (KES)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Campaign Note / Description</label>
                <input
                  type="text"
                  placeholder="e.g. 15% off grand bouquets for anniversary month"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border border-stone-200 rounded-xl bg-[#FAF9F6] focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                />
              </div>

              {/* Values & Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Discount Value <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.discountType === 'percentage' ? 100 : undefined}
                    placeholder={formData.discountType === 'percentage' ? '15' : '500'}
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl bg-[#FAF9F6] font-mono focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Min. Purchase (KES)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="2500"
                    value={formData.minimumPurchase}
                    onChange={(e) => setFormData({ ...formData, minimumPurchase: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl bg-[#FAF9F6] font-mono focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Max Cap (KES, Opt)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="1000"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl bg-[#FAF9F6] font-mono focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  />
                </div>
              </div>

              {/* Date Ranges & Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl bg-[#FAF9F6] focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl bg-[#FAF9F6] focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Usage Limit (Opt)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl bg-[#FAF9F6] font-mono focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Campaign Status</label>
                <div className="flex items-center space-x-3 pt-1">
                  {[
                    { id: 'active', label: 'Active (Live Immediately)' },
                    { id: 'scheduled', label: 'Scheduled' },
                    { id: 'disabled', label: 'Paused / Disabled' }
                  ].map((s) => (
                    <label key={s.id} className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={s.id}
                        checked={formData.status === s.id}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="text-[#2D5A27] focus:ring-[#2D5A27]"
                      />
                      <span className="text-stone-700">{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#2D5A27] hover:bg-[#23471f] text-white px-5 py-2 rounded-xl font-semibold shadow-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <RefreshCw size={13} className="animate-spin" /> : null}
                  <span>{editingCoupon ? 'Update Campaign' : 'Save & Publish Discount'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {couponToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-stone-200 p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-serif font-bold text-stone-900 text-base">Delete Promo Code?</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Are you sure you want to permanently delete code{' '}
                <strong className="font-mono text-stone-800">{couponToDelete.code}</strong>? Clients will no longer be
                able to redeem this voucher at checkout.
              </p>
            </div>

            <div className="flex justify-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCouponToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 border border-stone-200 rounded-xl text-xs text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleting ? <RefreshCw size={13} className="animate-spin" /> : null}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
