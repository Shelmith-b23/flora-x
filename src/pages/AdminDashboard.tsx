import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Users, Store, FileText, Check, X, AlertCircle, RefreshCw, 
  TrendingUp, DollarSign, ShoppingBag, CreditCard, Award, Sparkles, Sliders, 
  Send, Tag, Layers, Search, Eye, KeyRound, Trash2, ArrowUpRight, CheckCircle2, 
  XCircle, Clock, Lock, Settings, Cpu
} from 'lucide-react';

export default function AdminDashboard() {
  const { 
    user, 
    auditLogs, 
    usersList, 
    pendingFlorists, 
    allFlorists,
    dashboardStats,
    activityFeed,
    ordersList,
    withdrawalsList,
    productsList,
    reviewsList,
    couponsList,
    categoriesList,
    systemConfig,
    administratorsList,
    cmsContent,
    fetchAdminData, 
    approveFlorist, 
    rejectFlorist, 
    toggleFloristSuspension,
    toggleUserSuspension,
    resetUserPassword,
    deleteUserAccount,
    cancelOrder,
    refundOrder,
    approveWithdrawal,
    rejectWithdrawal,
    moderateProduct,
    moderateReview,
    createCoupon,
    createCategory,
    updateSystemConfig,
    createAdministrator,
    updateCMSSection,
    broadcastNotification,
    fetchAIAdminInsights
  } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'florists' | 'users' | 'orders' | 'payouts' | 'catalog' | 'coupons' | 'cms' | 'ai' | 'system' | 'audit'
  >('overview');

  const [loading, setLoading] = useState(false);
  const [actionErr, setActionErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals & Forms local states
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  const [withdrawalApproveId, setWithdrawalApproveId] = useState<string | null>(null);
  const [payoutRef, setPayoutRef] = useState('');
  const [withdrawalRejectId, setWithdrawalRejectId] = useState<string | null>(null);
  const [withdrawalRejectReason, setWithdrawalRejectReason] = useState('');

  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState('percentage');
  const [newCouponVal, setNewCouponVal] = useState('');
  const [newCouponMin, setNewCouponMin] = useState('1000');

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const [notifTarget, setNotifTarget] = useState('all_users');
  const [notifChannel, setNotifChannel] = useState('in_app');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  const [aiQueryType, setAiQueryType] = useState('executive_summary');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [commissionRate, setCommissionRate] = useState('20');
  const [minOrderAmt, setMinOrderAmt] = useState('1500');

  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminDept, setNewAdminDept] = useState('Operations');

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [floristSearchTerm, setFloristSearchTerm] = useState('');
  const [tempPassResult, setTempPassResult] = useState<{ id: string; msg: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    setActionErr('');
    try {
      await fetchAdminData();
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      loadData();
    }
  }, [user]);

  // Sync initial system config
  useEffect(() => {
    if (systemConfig?.platformCommissionPercent) {
      setCommissionRate(String(systemConfig.platformCommissionPercent));
    }
    if (systemConfig?.minimumOrderAmount) {
      setMinOrderAmt(String(systemConfig.minimumOrderAmount));
    }
  }, [systemConfig]);

  // Secure Role Gatekeeper
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    window.location.hash = '#/forbidden';
    return null;
  }

  const isSuperAdmin = user.role === 'super_admin';

  // Handlers
  const handleApproveFlorist = async (id: string) => {
    setActionErr('');
    try {
      await approveFlorist(id);
      setSuccessMsg('Florist approved successfully.');
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleRejectFloristSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId || !rejectReason) return;
    setActionErr('');
    try {
      await rejectFlorist(rejectId, rejectReason);
      setRejectId(null);
      setRejectReason('');
      setSuccessMsg('Florist application rejected.');
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleToggleFloristStatus = async (id: string) => {
    setActionErr('');
    try {
      await toggleFloristSuspension(id);
      setSuccessMsg('Florist status updated.');
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleToggleUserSuspend = async (userId: string) => {
    setActionErr('');
    try {
      await toggleUserSuspension(userId);
      setSuccessMsg('User suspension state toggled.');
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleResetPassword = async (userId: string) => {
    setActionErr('');
    try {
      const res = await resetUserPassword(userId);
      setTempPassResult({ id: userId, msg: res });
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user account?')) return;
    setActionErr('');
    try {
      await deleteUserAccount(userId);
      setSuccessMsg('User deleted permanently.');
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleApproveWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalApproveId) return;
    setActionErr('');
    try {
      await approveWithdrawal(withdrawalApproveId, payoutRef);
      setWithdrawalApproveId(null);
      setPayoutRef('');
      setSuccessMsg('Vendor payout approved and processed.');
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleRejectWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalRejectId || !withdrawalRejectReason) return;
    setActionErr('');
    try {
      await rejectWithdrawal(withdrawalRejectId, withdrawalRejectReason);
      setWithdrawalRejectId(null);
      setWithdrawalRejectReason('');
      setSuccessMsg('Withdrawal payout request rejected.');
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleCancelOrderSubmit = async (orderId: string) => {
    if (!confirm(`Cancel Parent Order #${orderId}?`)) return;
    setActionErr('');
    try {
      await cancelOrder(orderId);
      setSuccessMsg(`Order #${orderId} cancelled.`);
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundOrderId) return;
    setActionErr('');
    try {
      await refundOrder(refundOrderId, Number(refundAmount), refundReason);
      setRefundOrderId(null);
      setRefundAmount('');
      setRefundReason('');
      setSuccessMsg('Refund issued successfully.');
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleCreateCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponVal) return;
    setActionErr('');
    try {
      await createCoupon({
        code: newCouponCode,
        discountType: newCouponType,
        discountValue: Number(newCouponVal),
        minimumPurchase: Number(newCouponMin)
      });
      setNewCouponCode('');
      setNewCouponVal('');
      setSuccessMsg('Coupon promo code created.');
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    setActionErr('');
    try {
      await createCategory({ name: newCatName, description: newCatDesc });
      setNewCatName('');
      setNewCatDesc('');
      setSuccessMsg('Category created successfully.');
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;
    setActionErr('');
    try {
      await broadcastNotification({
        targetGroup: notifTarget,
        channel: notifChannel,
        title: notifTitle,
        message: notifMessage
      });
      setNotifTitle('');
      setNotifMessage('');
      setSuccessMsg(`Broadcast sent to target group: ${notifTarget}.`);
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleRunAIAdmin = async () => {
    setAiLoading(true);
    setActionErr('');
    try {
      const resp = await fetchAIAdminInsights(aiQueryType);
      setAiResponse(resp);
      setAiLoading(false);
    } catch (err: any) {
      setAiLoading(false);
      setActionErr(err.message);
    }
  };

  const handleSaveSystemConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionErr('');
    try {
      await updateSystemConfig({
        platformCommissionPercent: Number(commissionRate),
        minimumOrderAmount: Number(minOrderAmt)
      });
      setSuccessMsg('Platform global settings updated.');
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminName) return;
    setActionErr('');
    try {
      await createAdministrator({
        name: newAdminName,
        email: newAdminEmail,
        department: newAdminDept,
        role: 'admin'
      });
      setNewAdminName('');
      setNewAdminEmail('');
      setSuccessMsg('New Administrator account created.');
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  // Filtered lists for search
  const filteredUsers = usersList.filter(u => 
    u.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredFlorists = allFlorists.filter(f =>
    (f.storeName || f.store_name)?.toLowerCase().includes(floristSearchTerm.toLowerCase()) ||
    (f.addressText || f.address_text)?.toLowerCase().includes(floristSearchTerm.toLowerCase()) ||
    f.verificationStatus?.toLowerCase().includes(floristSearchTerm.toLowerCase())
  );

  return (
    <div className="pt-24 pb-20 bg-canvas min-h-screen font-sans text-text-primary" id="admin-dashboard-page">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 space-y-8">

        {/* TOP EDITORIAL BANNER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white border border-utility-border rounded-2xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center gap-4 z-10">
            <div className="w-14 h-14 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center border border-brand-primary/20 shadow-xs">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-display font-semibold tracking-tight text-text-primary">Platform Operational Command</h1>
                <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full tracking-wider ${
                  isSuperAdmin ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-text-secondary font-medium mt-0.5">
                Flora_X Editorial Botanical Architecture • Logged in as <span className="text-brand-primary font-bold font-mono">{user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 z-10 w-full md:w-auto">
            <button
              onClick={loadData}
              disabled={loading}
              className="w-full md:w-auto px-4 py-2.5 border border-utility-border hover:bg-canvas rounded-xl cursor-pointer text-xs font-semibold uppercase tracking-wider text-text-secondary transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-brand-primary ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* ERROR / SUCCESS ALERTS */}
        {actionErr && (
          <div className="p-4 bg-utility-error/10 border border-utility-error/30 rounded-xl text-xs text-brand-primary flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{actionErr}</span>
            </div>
            <button onClick={() => setActionErr('')} className="text-text-muted hover:text-text-primary text-xs">Dismiss</button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 text-xs">Dismiss</button>
          </div>
        )}

        {/* PRIMARY NAVIGATION TABS */}
        <div className="flex overflow-x-auto pb-2 border-b border-utility-border gap-1 scrollbar-none">
          {[
            { id: 'overview', label: 'Executive Metrics', icon: TrendingUp },
            { id: 'florists', label: 'Florists & Vetting', icon: Store, badge: pendingFlorists.length },
            { id: 'users', label: 'Identity Directory', icon: Users, badge: usersList.length },
            { id: 'orders', label: 'Orders & Fulfillment', icon: ShoppingBag, badge: ordersList.length },
            { id: 'payouts', label: 'Vendor Payouts', icon: CreditCard, badge: withdrawalsList.filter(w => w.status === 'pending').length },
            { id: 'catalog', label: 'Catalog & Moderation', icon: Layers },
            { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
            { id: 'cms', label: 'CMS & Broadcasts', icon: Send },
            { id: 'ai', label: 'AI Intelligence', icon: Sparkles },
            ...(isSuperAdmin ? [{ id: 'system', label: 'Platform Config', icon: Settings }] : []),
            { id: 'audit', label: 'Audit Inspector', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 font-display font-semibold text-xs uppercase tracking-wider border-b-2 cursor-pointer flex items-center gap-2 shrink-0 transition-all ${
                  isSel 
                    ? 'border-brand-primary text-brand-primary font-bold bg-brand-primary/5 rounded-t-lg' 
                    : 'border-transparent text-text-muted hover:text-brand-primary hover:bg-canvas/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                    isSel ? 'bg-brand-primary text-white' : 'bg-canvas text-text-secondary border border-utility-border'
                  }`}>{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS CONTAINER */}
        <div className="bg-white border border-utility-border rounded-2xl overflow-hidden shadow-xs min-h-[500px]">

          {/* 1. EXECUTIVE METRICS OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-semibold text-text-primary text-lg">Marketplace Financial & Operations Dashboard</h3>
                  <p className="text-xs text-text-muted">Calculated from live marketplace orders, M-Pesa settlements, and florist commissions.</p>
                </div>
                <div className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[11px] font-bold text-brand-primary font-mono">
                  Commission Rate: {systemConfig?.platformCommissionPercent || 12}%
                </div>
              </div>

              {/* STAT CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 border border-utility-border rounded-xl bg-canvas/20 space-y-2">
                  <div className="flex justify-between items-center text-text-muted">
                    <span className="text-xs uppercase font-bold tracking-wider font-mono">Gross Revenue</span>
                    <DollarSign className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-text-primary">
                    KES {(dashboardStats?.totalPaidRevenue || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Today: KES {(dashboardStats?.revenueToday || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-5 border border-utility-border rounded-xl bg-canvas/20 space-y-2">
                  <div className="flex justify-between items-center text-text-muted">
                    <span className="text-xs uppercase font-bold tracking-wider font-mono">Platform Revenue ({systemConfig?.platformCommissionPercent || commissionRate || 20}%)</span>
                    <Award className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-brand-primary">
                    KES {(dashboardStats?.platformCommissionEarned || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-text-muted font-medium">
                    Earned Net Platform Fee
                  </div>
                </div>

                <div className="p-5 border border-utility-border rounded-xl bg-canvas/20 space-y-2">
                  <div className="flex justify-between items-center text-text-muted">
                    <span className="text-xs uppercase font-bold tracking-wider font-mono">Verified Florists</span>
                    <Store className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-text-primary">
                    {dashboardStats?.verifiedFlorists || 0} / {dashboardStats?.totalFlorists || 0}
                  </div>
                  <div className="text-[11px] text-amber-700 font-medium">
                    {dashboardStats?.pendingFloristApprovals || 0} Pending Approvals
                  </div>
                </div>

                <div className="p-5 border border-utility-border rounded-xl bg-canvas/20 space-y-2">
                  <div className="flex justify-between items-center text-text-muted">
                    <span className="text-xs uppercase font-bold tracking-wider font-mono">Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-text-primary">
                    {dashboardStats?.completedOrders || 0} Paid
                  </div>
                  <div className="text-[11px] text-text-muted font-medium">
                    AOV: KES {(dashboardStats?.averageOrderValue || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* SECOND ROW METRICS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 border border-utility-border rounded-xl bg-white space-y-1">
                  <span className="text-text-muted text-[10px] uppercase font-bold">Pending Vendor Withdrawals</span>
                  <div className="text-lg font-bold text-amber-600">
                    KES {(dashboardStats?.pendingWithdrawalsSum || 0).toLocaleString()} ({dashboardStats?.pendingWithdrawalsCount || 0} requests)
                  </div>
                </div>
                <div className="p-4 border border-utility-border rounded-xl bg-white space-y-1">
                  <span className="text-text-muted text-[10px] uppercase font-bold">Registered Platform Customers</span>
                  <div className="text-lg font-bold text-text-primary">
                    {dashboardStats?.totalCustomers || 0} Accounts
                  </div>
                </div>
                <div className="p-4 border border-utility-border rounded-xl bg-white space-y-1">
                  <span className="text-text-muted text-[10px] uppercase font-bold">Conversion & Repeat Metrics</span>
                  <div className="text-lg font-bold text-emerald-700">
                    {dashboardStats?.conversionRate} Conv • {dashboardStats?.repeatPurchaseRate} Repeat
                  </div>
                </div>
              </div>

              {/* REAL TIME ACTIVITY FEED */}
              <div className="space-y-4 pt-4 border-t border-utility-border">
                <h4 className="font-display font-semibold text-text-primary text-sm uppercase tracking-wider">Live System Activity Feed</h4>
                <div className="space-y-2">
                  {(activityFeed.length > 0 ? activityFeed : [
                    { id: 'act-1', type: 'order', message: 'Parent Order #PO-98231 placed by customer user-382 (KES 14,500)', time: '5 mins ago' },
                    { id: 'act-2', type: 'vendor', message: 'Florist Naivasha Floral Craft requested withdrawal payout KES 45,000', time: '18 mins ago' },
                    { id: 'act-3', type: 'system', message: 'M-Pesa Express Callback STK-OK verified for transaction MP-771239', time: '1 hour ago' }
                  ]).map((item: any) => (
                    <div key={item.id} className="p-3 border border-utility-border rounded-xl bg-canvas/30 text-xs flex justify-between items-center font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                        <span className="text-text-primary">{item.message}</span>
                      </div>
                      <span className="text-[10px] text-text-muted">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. FLORISTS & VETTING QUEUE */}
          {activeTab === 'florists' && (
            <div className="p-6 space-y-8">
              {/* PENDING QUEUE */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-display font-semibold text-text-primary text-base">Florist Vetting Queue ({pendingFlorists.length})</h3>
                    <p className="text-xs text-text-muted">Review, verify, approve, or reject new florist store applications.</p>
                  </div>
                </div>

                {pendingFlorists.length === 0 ? (
                  <div className="text-center py-10 space-y-2 border border-dashed border-utility-border rounded-xl">
                    <Store className="w-8 h-8 text-text-muted mx-auto" />
                    <p className="text-xs text-text-secondary font-semibold">Vetting queue is empty</p>
                    <p className="text-[11px] text-text-muted">All registrants have been audited.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingFlorists.map((f: any) => (
                      <div key={f.id} className="p-5 border border-utility-border rounded-xl space-y-4 bg-canvas/20">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-1.5">
                            <h4 className="font-bold text-text-primary text-base">{f.storeName || f.store_name}</h4>
                            <p className="text-xs text-text-secondary leading-relaxed">{f.description}</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[10px] font-mono text-text-muted pt-1">
                              <div>🏢 Corp Name: <span className="text-text-primary font-bold">{f.legalBusinessName || f.legal_business_name}</span></div>
                              <div>📍 Address: <span className="text-text-primary font-bold">{f.addressText || f.address_text}</span></div>
                              <div>💸 Till: <span className="text-text-primary font-bold">{f.mpesaTillNumber || f.mpesa_till_number}</span></div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleApproveFlorist(f.id)}
                              className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg flex items-center gap-1.5 cursor-pointer text-xs font-bold transition-all shadow-xs"
                            >
                              <Check className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => setRejectId(f.id)}
                              className="px-4 py-2 border border-utility-error/30 hover:bg-utility-error/5 text-brand-primary rounded-lg flex items-center gap-1.5 cursor-pointer text-xs font-bold transition-all"
                            >
                              <X className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>

                        {/* Reject Form Drawer */}
                        {rejectId === f.id && (
                          <form onSubmit={handleRejectFloristSubmit} className="p-4 border border-utility-error/30 bg-utility-error/5 rounded-xl flex flex-col md:flex-row items-end gap-3">
                            <div className="flex-1 space-y-1 text-left w-full">
                              <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-primary">
                                Rejection Reason
                              </label>
                              <input
                                type="text"
                                required
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="e.g. Invalid business registration document or till discrepancy"
                                className="w-full p-2.5 text-xs border border-utility-border rounded-lg bg-white text-text-primary focus:outline-hidden"
                              />
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => setRejectId(null)}
                                className="px-3 py-2 text-xs font-semibold text-text-muted uppercase cursor-pointer hover:text-text-primary"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-2 bg-brand-primary text-white text-xs font-bold uppercase rounded-lg cursor-pointer"
                              >
                                Submit Rejection
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ALL FLORISTS DIRECTORY */}
              <div className="space-y-4 pt-6 border-t border-utility-border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-display font-semibold text-text-primary text-base">All Registered Florists Directory</h3>
                    <p className="text-xs text-text-muted">Manage active stores, view wallet balances, and toggle store suspensions.</p>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search florists..."
                      value={floristSearchTerm}
                      onChange={(e) => setFloristSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-utility-border rounded-lg bg-canvas/30 text-text-primary focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-utility-border text-text-muted uppercase tracking-wider font-semibold text-[10px] bg-canvas/40">
                        <th className="p-3">Store Name</th>
                        <th className="p-3">Legal Business Name</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">M-Pesa Till</th>
                        <th className="p-3">Wallet Balance</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFlorists.map((f: any) => (
                        <tr key={f.id} className="border-b border-utility-border hover:bg-canvas/20 text-text-secondary">
                          <td className="p-3 font-bold text-text-primary">{f.storeName || f.store_name}</td>
                          <td className="p-3 font-mono text-[11px]">{f.legalBusinessName || f.legal_business_name}</td>
                          <td className="p-3">{f.addressText || f.address_text}</td>
                          <td className="p-3 font-mono font-bold text-brand-primary">{f.mpesaTillNumber || f.mpesa_till_number}</td>
                          <td className="p-3 font-mono font-bold text-emerald-700">KES {(f.walletBalance || 0).toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                              f.verificationStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                              f.verificationStatus === 'pending_review' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {f.verificationStatus}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleToggleFloristStatus(f.id)}
                              className="px-3 py-1.5 border border-utility-border hover:bg-canvas rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-all"
                            >
                              {f.verificationStatus === 'suspended' ? 'Reactivate' : 'Suspend'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. IDENTITY DIRECTORY */}
          {activeTab === 'users' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-display font-semibold text-text-primary text-base">Platform Identity Directories</h3>
                  <p className="text-xs text-text-muted">Inspect registered accounts, reset credentials, or suspend access.</p>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, role..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-utility-border rounded-lg bg-canvas/30 text-text-primary focus:outline-hidden"
                  />
                </div>
              </div>

              {tempPassResult && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 font-mono">
                  {tempPassResult.msg}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-utility-border text-text-muted uppercase tracking-wider font-semibold text-[10px] bg-canvas/40">
                      <th className="p-3">User Profile</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Assigned Role</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((usr: any) => (
                      <tr key={usr.id} className="border-b border-utility-border hover:bg-canvas/20 text-text-secondary">
                        <td className="p-3 font-semibold text-text-primary">
                          {usr.firstName ? `${usr.firstName} ${usr.lastName}` : 'Unprofiled Account'}
                        </td>
                        <td className="p-3 font-mono text-[11px]">{usr.email}</td>
                        <td className="p-3 font-mono font-bold text-brand-primary uppercase text-[10px]">
                          {usr.role}
                        </td>
                        <td className="p-3 font-mono">{usr.phoneNumber || '—'}</td>
                        <td className="p-3">
                          {usr.isSuspended ? (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-bold rounded-full uppercase">Suspended</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full uppercase">Active</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {usr.role !== 'super_admin' && usr.id !== user.id && (
                            <>
                              <button
                                onClick={() => handleToggleUserSuspend(usr.id)}
                                className="px-3 py-1.5 border border-utility-border hover:bg-canvas rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-all"
                              >
                                {usr.isSuspended ? 'Reactivate' : 'Suspend'}
                              </button>
                              <button
                                onClick={() => handleResetPassword(usr.id)}
                                className="px-3 py-1.5 border border-utility-border hover:bg-canvas rounded-lg text-[10px] font-bold uppercase cursor-pointer text-text-primary transition-all"
                                title="Generate temporary password"
                              >
                                Reset Pass
                              </button>
                              {isSuperAdmin && (
                                <button
                                  onClick={() => handleDeleteUser(usr.id)}
                                  className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-all"
                                  title="Delete Account"
                                >
                                  <Trash2 className="w-3.5 h-3.5 inline" />
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. ORDERS & FULFILLMENT */}
          {activeTab === 'orders' && (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-semibold text-text-primary text-base">Platform Parent Orders Management</h3>
                  <p className="text-xs text-text-muted">Inspect multi-vendor orders, payment statuses, and issue cancellations or refunds.</p>
                </div>
              </div>

              {refundOrderId && (
                <form onSubmit={handleRefundSubmit} className="p-4 border border-brand-primary/30 bg-brand-primary/5 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-brand-primary">Issue Refund for Order #{refundOrderId}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="number"
                      required
                      placeholder="Amount (KES)"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="p-2.5 text-xs border border-utility-border rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Refund Reason"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="p-2.5 text-xs border border-utility-border rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setRefundOrderId(null)} className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-brand-primary text-white text-xs font-bold uppercase rounded-lg">Confirm Refund</button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-utility-border text-text-muted uppercase tracking-wider font-semibold text-[10px] bg-canvas/40">
                      <th className="p-3">Order Ref</th>
                      <th className="p-3">Customer ID</th>
                      <th className="p-3">Grand Total</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Sub-Orders</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersList.map((ord: any) => (
                      <tr key={ord.id} className="border-b border-utility-border hover:bg-canvas/20 text-text-secondary">
                        <td className="p-3 font-mono font-bold text-text-primary">{ord.id}</td>
                        <td className="p-3 font-mono text-[11px]">{ord.customerId}</td>
                        <td className="p-3 font-mono font-bold text-text-primary">KES {(ord.grandTotal || 0).toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                            ord.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                            ord.paymentStatus === 'refunded' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[10px]">
                          {ord.subOrders?.length || 0} sub-orders ({ord.subOrders?.map((s: any) => s.floristStoreName).join(', ')})
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {ord.paymentStatus === 'paid' && (
                            <button
                              onClick={() => { setRefundOrderId(ord.id); setRefundAmount(String(ord.grandTotal)); }}
                              className="px-3 py-1.5 border border-utility-border hover:bg-canvas rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                            >
                              Refund
                            </button>
                          )}
                          {ord.paymentStatus !== 'cancelled' && (
                            <button
                              onClick={() => handleCancelOrderSubmit(ord.id)}
                              className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. VENDOR PAYOUTS & WITHDRAWALS */}
          {activeTab === 'payouts' && (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-semibold text-text-primary text-base">Florist Payout & Withdrawal Requests</h3>
                  <p className="text-xs text-text-muted">Approve M-Pesa B2C payouts to verified florist Buy Goods Till accounts.</p>
                </div>
              </div>

              {/* MODALS FOR PAYOUT APPROVE / REJECT */}
              {withdrawalApproveId && (
                <form onSubmit={handleApproveWithdrawalSubmit} className="p-4 border border-emerald-300 bg-emerald-50 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900">Confirm M-Pesa Payout Entry</h4>
                  <input
                    type="text"
                    required
                    placeholder="M-Pesa Outbound Reference e.g. MP-OUT-99120"
                    value={payoutRef}
                    onChange={(e) => setPayoutRef(e.target.value)}
                    className="w-full p-2.5 text-xs border border-utility-border rounded-lg bg-white"
                  />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setWithdrawalApproveId(null)} className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-emerald-700 text-white text-xs font-bold uppercase rounded-lg">Authorize Payout</button>
                  </div>
                </form>
              )}

              {withdrawalRejectId && (
                <form onSubmit={handleRejectWithdrawalSubmit} className="p-4 border border-rose-300 bg-rose-50 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-rose-900">Reject Payout Request</h4>
                  <input
                    type="text"
                    required
                    placeholder="Reason for rejection"
                    value={withdrawalRejectReason}
                    onChange={(e) => setWithdrawalRejectReason(e.target.value)}
                    className="w-full p-2.5 text-xs border border-utility-border rounded-lg bg-white"
                  />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setWithdrawalRejectId(null)} className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-rose-700 text-white text-xs font-bold uppercase rounded-lg">Submit Rejection</button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-utility-border text-text-muted uppercase tracking-wider font-semibold text-[10px] bg-canvas/40">
                      <th className="p-3">Florist Store</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">M-Pesa Till</th>
                      <th className="p-3">Date Requested</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawalsList.map((w: any) => (
                      <tr key={w.id} className="border-b border-utility-border hover:bg-canvas/20 text-text-secondary">
                        <td className="p-3 font-bold text-text-primary">{w.floristName}</td>
                        <td className="p-3 font-mono font-bold text-emerald-700">KES {(w.amount || 0).toLocaleString()}</td>
                        <td className="p-3 font-mono font-bold text-brand-primary">{w.mpesaTillNumber}</td>
                        <td className="p-3 font-mono text-[11px]">{w.requestedAt}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                            w.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            w.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {w.status === 'pending' && (
                            <>
                              <button
                                onClick={() => setWithdrawalApproveId(w.id)}
                                className="px-3 py-1.5 bg-brand-primary text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                              >
                                Approve Payout
                              </button>
                              <button
                                onClick={() => setWithdrawalRejectId(w.id)}
                                className="px-3 py-1.5 border border-utility-border text-text-secondary rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. CATALOG & CONTENT MODERATION */}
          {activeTab === 'catalog' && (
            <div className="p-6 space-y-8">
              {/* CATEGORY MANAGER */}
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-text-primary text-base">Product Categories</h3>
                <form onSubmit={handleCreateCategorySubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    placeholder="New Category Name e.g. Tropical Orchids"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="p-2.5 text-xs border border-utility-border rounded-lg bg-canvas/30 text-text-primary focus:outline-hidden flex-1"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className="p-2.5 text-xs border border-utility-border rounded-lg bg-canvas/30 text-text-primary focus:outline-hidden flex-1"
                  />
                  <button type="submit" className="px-4 py-2.5 bg-brand-primary text-white text-xs font-bold uppercase rounded-lg cursor-pointer">
                    Add Category
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-2">
                  {categoriesList.map((c: any) => (
                    <div key={c.id} className="px-3 py-1.5 border border-utility-border rounded-full text-xs font-mono bg-canvas/40 flex items-center gap-2">
                      <span className="font-bold text-text-primary">{c.name}</span>
                      <span className="text-[10px] text-text-muted">({c.slug})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* REVIEWS MODERATION */}
              <div className="space-y-4 pt-6 border-t border-utility-border">
                <h3 className="font-display font-semibold text-text-primary text-base">Customer Review Moderation Desk</h3>
                <div className="space-y-3">
                  {reviewsList.map((r: any) => (
                    <div key={r.id} className="p-4 border border-utility-border rounded-xl bg-canvas/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-text-primary">{r.authorName}</span>
                          <span className="text-amber-500 font-bold">★ {r.rating}</span>
                          <span className="text-[10px] text-text-muted">Product ID: {r.productId}</span>
                        </div>
                        <p className="text-xs text-text-secondary italic">"{r.comment}"</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => moderateReview(r.id, 'approve')}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => moderateReview(r.id, 'hide')}
                          className="px-3 py-1.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                        >
                          Hide Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. COUPONS & MARKETING */}
          {activeTab === 'coupons' && (
            <div className="p-6 space-y-6">
              <h3 className="font-display font-semibold text-text-primary text-base">Global Coupon & Promo Code Engine</h3>
              
              <form onSubmit={handleCreateCouponSubmit} className="p-4 border border-utility-border rounded-xl bg-canvas/30 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary">Create Promo Discount Code</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Coupon Code e.g. FLORA15"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    className="p-2.5 text-xs border border-utility-border rounded-lg bg-white uppercase font-mono font-bold"
                  />
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value)}
                    className="p-2.5 text-xs border border-utility-border rounded-lg bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (KES)</option>
                  </select>
                  <input
                    type="number"
                    required
                    placeholder="Discount Value"
                    value={newCouponVal}
                    onChange={(e) => setNewCouponVal(e.target.value)}
                    className="p-2.5 text-xs border border-utility-border rounded-lg bg-white font-mono"
                  />
                  <input
                    type="number"
                    placeholder="Min Purchase (KES)"
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(e.target.value)}
                    className="p-2.5 text-xs border border-utility-border rounded-lg bg-white font-mono"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-brand-primary text-white text-xs font-bold uppercase rounded-lg cursor-pointer">
                  Create Coupon Code
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-utility-border text-text-muted uppercase tracking-wider font-semibold text-[10px] bg-canvas/40">
                      <th className="p-3">Promo Code</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Discount Value</th>
                      <th className="p-3">Min Order</th>
                      <th className="p-3">Redeemed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {couponsList.map((c: any) => (
                      <tr key={c.id} className="border-b border-utility-border hover:bg-canvas/20">
                        <td className="p-3 font-mono font-bold text-brand-primary">{c.code}</td>
                        <td className="p-3 uppercase text-[10px] font-bold">{c.discountType}</td>
                        <td className="p-3 font-mono font-bold">{c.discountType === 'percentage' ? `${c.discountValue}%` : `KES ${c.discountValue}`}</td>
                        <td className="p-3 font-mono">KES {c.minimumPurchase || 0}</td>
                        <td className="p-3 font-mono">{c.usedCount || 0} times</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. CMS & BROADCASTS */}
          {activeTab === 'cms' && (
            <div className="p-6 space-y-6">
              <h3 className="font-display font-semibold text-text-primary text-base">Broadcast Announcements & Push Notifications</h3>
              
              <form onSubmit={handleBroadcastNotification} className="p-4 border border-utility-border rounded-xl bg-canvas/30 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">Target Audience</label>
                    <select
                      value={notifTarget}
                      onChange={(e) => setNotifTarget(e.target.value)}
                      className="w-full p-2.5 text-xs border border-utility-border rounded-lg bg-white"
                    >
                      <option value="all_users">All Platform Users & Customers</option>
                      <option value="florists_only">Verified Florists Only</option>
                      <option value="customers_only">Customers Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">Delivery Channel</label>
                    <select
                      value={notifChannel}
                      onChange={(e) => setNotifChannel(e.target.value)}
                      className="w-full p-2.5 text-xs border border-utility-border rounded-lg bg-white"
                    >
                      <option value="in_app">In-App Notification Center</option>
                      <option value="email">Broadcast Email Alert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">Broadcast Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mother's Day Rush Guidelines for Florists"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    className="w-full p-2.5 text-xs border border-utility-border rounded-lg bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">Announcement Message Body</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter broadcast message details..."
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    className="w-full p-2.5 text-xs border border-utility-border rounded-lg bg-white"
                  />
                </div>

                <button type="submit" className="px-5 py-2.5 bg-brand-primary text-white text-xs font-bold uppercase rounded-lg cursor-pointer flex items-center gap-2">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast Announcement</span>
                </button>
              </form>
            </div>
          )}

          {/* 9. AI ADMIN INTELLIGENCE */}
          {activeTab === 'ai' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-display font-semibold text-text-primary text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-primary" />
                  <span>Gemini AI Executive Intelligence Center</span>
                </h3>
                <p className="text-xs text-text-muted">Analyze live store telemetry for demand forecasting, fraud risk scans, and SEO strategy.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <select
                  value={aiQueryType}
                  onChange={(e) => setAiQueryType(e.target.value)}
                  className="w-full sm:w-auto p-2.5 text-xs border border-utility-border rounded-lg bg-canvas/30 text-text-primary font-semibold"
                >
                  <option value="executive_summary">Executive Summary & Demand Forecast</option>
                  <option value="vendor_health">Vendor Quality & Fulfillment Risk Scan</option>
                  <option value="fraud_scan">M-Pesa Payment Security Audit</option>
                  <option value="growth_seo">Growth Marketing & Keyword Strategy</option>
                </select>

                <button
                  onClick={handleRunAIAdmin}
                  disabled={aiLoading}
                  className="w-full sm:w-auto px-5 py-2.5 bg-brand-primary text-white text-xs font-bold uppercase rounded-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                  <span>{aiLoading ? 'Synthesizing Data...' : 'Run Gemini AI Analysis'}</span>
                </button>
              </div>

              {aiResponse && (
                <div className="p-6 border border-brand-primary/20 bg-brand-primary/5 rounded-2xl space-y-3 font-sans text-xs text-text-secondary leading-relaxed">
                  <div className="flex items-center gap-2 text-brand-primary font-bold uppercase tracking-wider text-[10px]">
                    <Cpu className="w-4 h-4" />
                    <span>Gemini AI Strategic Executive Report</span>
                  </div>
                  <div className="whitespace-pre-wrap font-mono text-[11px] bg-white p-4 rounded-xl border border-utility-border">
                    {aiResponse}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 10. SYSTEM CONFIG & SUPER ADMIN CONTROL */}
          {activeTab === 'system' && isSuperAdmin && (
            <div className="p-6 space-y-8">
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-text-primary text-base">Global Marketplace Settings</h3>
                <form onSubmit={handleSaveSystemConfig} className="p-4 border border-utility-border rounded-xl bg-canvas/30 space-y-4 max-w-xl">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">
                      Platform Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      required
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(e.target.value)}
                      className="w-full p-2.5 text-xs border border-utility-border rounded-lg bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">
                      Minimum Order Amount (KES)
                    </label>
                    <input
                      type="number"
                      required
                      value={minOrderAmt}
                      onChange={(e) => setMinOrderAmt(e.target.value)}
                      className="w-full p-2.5 text-xs border border-utility-border rounded-lg bg-white font-mono font-bold"
                    />
                  </div>
                  <button type="submit" className="px-5 py-2.5 bg-brand-primary text-white text-xs font-bold uppercase rounded-lg cursor-pointer">
                    Save Global Settings
                  </button>
                </form>
              </div>

              {/* ADMINISTRATOR TEAM MEMBERS */}
              <div className="space-y-4 pt-6 border-t border-utility-border">
                <h3 className="font-display font-semibold text-text-primary text-base">Administrators & Operations Team</h3>
                <form onSubmit={handleCreateAdminSubmit} className="p-4 border border-utility-border rounded-xl bg-canvas/30 space-y-3 max-w-2xl">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary">Grant Admin Credentials</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="p-2.5 text-xs border border-utility-border rounded-lg bg-white"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Admin Email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="p-2.5 text-xs border border-utility-border rounded-lg bg-white"
                    />
                    <select
                      value={newAdminDept}
                      onChange={(e) => setNewAdminDept(e.target.value)}
                      className="p-2.5 text-xs border border-utility-border rounded-lg bg-white"
                    >
                      <option value="Operations">Operations</option>
                      <option value="Finance & Risk">Finance & Risk</option>
                      <option value="Florist Relations">Florist Relations</option>
                    </select>
                  </div>
                  <button type="submit" className="px-4 py-2 bg-brand-primary text-white text-xs font-bold uppercase rounded-lg cursor-pointer">
                    Create Administrator
                  </button>
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-utility-border text-text-muted uppercase tracking-wider font-semibold text-[10px] bg-canvas/40">
                        <th className="p-3">Administrator Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {administratorsList.map((adm: any) => (
                        <tr key={adm.id} className="border-b border-utility-border hover:bg-canvas/20">
                          <td className="p-3 font-bold text-text-primary">{adm.name}</td>
                          <td className="p-3 font-mono text-[11px]">{adm.email}</td>
                          <td className="p-3 font-mono font-bold text-brand-primary uppercase text-[10px]">{adm.role}</td>
                          <td className="p-3 text-text-secondary">{adm.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 11. AUDIT LOG INSPECTOR */}
          {activeTab === 'audit' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-display font-semibold text-text-primary text-base">Cryptographic System Audit Inspector</h3>
                <p className="text-xs text-text-muted">Immutably logged administrative actions, operator IDs, and target record changes.</p>
              </div>

              {auditLogs.length === 0 ? (
                <div className="text-center py-12 space-y-2 border border-dashed border-utility-border rounded-xl">
                  <FileText className="w-8 h-8 text-text-muted mx-auto" />
                  <p className="text-xs text-text-secondary font-semibold">Log buffer is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log: any) => (
                    <div key={log.id} className="p-4 border border-utility-border rounded-xl bg-canvas/30 text-[11px] font-mono space-y-1.5 leading-relaxed">
                      <div className="flex justify-between items-center text-[10px] text-text-muted border-b border-utility-border pb-1">
                        <span>Log Ref: <span className="font-bold text-text-primary">{log.id}</span></span>
                        <span>{log.timestamp}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 font-semibold">
                        <div>Operator: <span className="text-text-primary font-bold">{log.adminId}</span></div>
                        <div>Action: <span className="text-brand-primary font-bold uppercase">{log.action}</span></div>
                        <div>Target ID: <span className="text-text-primary font-bold">{log.targetId} ({log.targetTable})</span></div>
                      </div>
                      {log.reason && (
                        <div className="text-brand-primary font-sans italic pt-1">Note/Reason: "{log.reason}"</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
