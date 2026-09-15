import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { 
  ShieldCheck, Users, Store, FileText, Check, X, AlertCircle, RefreshCw, 
  TrendingUp, DollarSign, ShoppingBag, CreditCard, Award, Sparkles, Sliders, 
  Send, Tag, Layers, Search, Eye, KeyRound, Trash2, ArrowUpRight, CheckCircle2, 
  XCircle, Clock, Lock, Settings, Cpu, Download, ExternalLink, MapPin, Phone, 
  Mail, Package, AlertTriangle, ChevronRight, FileSpreadsheet, Percent,
  Activity, Server, HardDrive, Radio, Copy, CheckSquare, Square, UserX, UserCheck, RotateCcw
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
    toggleCouponStatus,
    deleteCoupon,
    createCategory,
    updateSystemConfig,
    createAdministrator,
    toggleAdminStatus,
    resetAdminPassword,
    deleteAdministrator,
    fetchSystemHealth,
    updateCMSSection,
    broadcastNotification,
    fetchAIAdminInsights,
    fetchFloristDetail,
    fetchUserDetail,
    fetchOrderDetail
  } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'florists' | 'users' | 'orders' | 'payouts' | 'catalog' | 'coupons' | 'cms' | 'ai' | 'system' | 'audit'
  >('overview');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [actionErr, setActionErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Inspection Drawers/Modals state
  const [selectedFloristId, setSelectedFloristId] = useState<string | null>(null);
  const [floristDetailData, setFloristDetailData] = useState<any | null>(null);
  const [floristDetailLoading, setFloristDetailLoading] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetailData, setUserDetailData] = useState<any | null>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetailData, setOrderDetailData] = useState<any | null>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);

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
  const [couponScopeFilter, setCouponScopeFilter] = useState<'all' | 'global' | 'florist'>('all');

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const [notifTarget, setNotifTarget] = useState('all_users');
  const [notifChannel, setNotifChannel] = useState('in_app');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  const [aiQueryType, setAiQueryType] = useState('executive_summary');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // System Config States
  const [commissionRate, setCommissionRate] = useState('20');
  const [minOrderAmt, setMinOrderAmt] = useState('1500');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoApproveFlorists, setAutoApproveFlorists] = useState(false);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [supportEmail, setSupportEmail] = useState('concierge@florax.co.ke');
  const [mpesaEnvironment, setMpesaEnvironment] = useState('sandbox');

  // Administrator Management States
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminDept, setNewAdminDept] = useState('Operations');
  const [newAdminRole, setNewAdminRole] = useState('admin');
  const [newAdminPermissions, setNewAdminPermissions] = useState<string[]>([
    'users.view', 'florists.view', 'florists.verify', 'orders.view', 'reports.view'
  ]);
  const [createdAdminCredentials, setCreatedAdminCredentials] = useState<{
    name: string;
    email: string;
    tempPass: string;
    role: string;
  } | null>(null);
  const [adminPassResetResult, setAdminPassResetResult] = useState<{ id: string; name: string; tempPass: string } | null>(null);

  // Telemetry state
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [systemHealthLoading, setSystemHealthLoading] = useState(false);

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [floristSearchTerm, setFloristSearchTerm] = useState('');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('all');
  const [tempPassResult, setTempPassResult] = useState<{ id: string; msg: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    setActionErr('');
    try {
      await fetchAdminData();
      if (user?.role === 'super_admin') {
        loadSystemHealth();
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const loadSystemHealth = async () => {
    setSystemHealthLoading(true);
    try {
      const data = await fetchSystemHealth();
      setSystemHealth(data);
    } catch {
      // Graceful fallback
    } finally {
      setSystemHealthLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      loadData();
    }
  }, [user]);

  // Sync initial system config
  useEffect(() => {
    if (systemConfig?.platformCommissionPercent !== undefined) {
      setCommissionRate(String(systemConfig.platformCommissionPercent));
    }
    if (systemConfig?.minimumOrderAmount !== undefined) {
      setMinOrderAmt(String(systemConfig.minimumOrderAmount));
    }
    if (systemConfig?.maintenanceMode !== undefined) {
      setMaintenanceMode(Boolean(systemConfig.maintenanceMode));
    }
    if (systemConfig?.autoApproveFlorists !== undefined) {
      setAutoApproveFlorists(Boolean(systemConfig.autoApproveFlorists));
    }
    if (systemConfig?.maxLoginAttempts !== undefined) {
      setMaxLoginAttempts(String(systemConfig.maxLoginAttempts));
    }
    if (systemConfig?.supportEmail) {
      setSupportEmail(systemConfig.supportEmail);
    }
    if (systemConfig?.mpesaEnvironment) {
      setMpesaEnvironment(systemConfig.mpesaEnvironment);
    }
  }, [systemConfig]);

  // Handle Florist Detail Modal Open
  const handleOpenFloristDetail = async (floristId: string) => {
    setSelectedFloristId(floristId);
    setFloristDetailLoading(true);
    try {
      const data = await fetchFloristDetail(floristId);
      setFloristDetailData(data);
    } catch (err: any) {
      setActionErr(err.message || 'Failed to load florist profile.');
    } finally {
      setFloristDetailLoading(false);
    }
  };

  // Handle User Detail Modal Open
  const handleOpenUserDetail = async (userId: string) => {
    setSelectedUserId(userId);
    setUserDetailLoading(true);
    try {
      const data = await fetchUserDetail(userId);
      setUserDetailData(data);
    } catch (err: any) {
      setActionErr(err.message || 'Failed to load user profile.');
    } finally {
      setUserDetailLoading(false);
    }
  };

  // Handle Order Detail Modal Open
  const handleOpenOrderDetail = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setOrderDetailLoading(true);
    try {
      const data = await fetchOrderDetail(orderId);
      setOrderDetailData(data);
    } catch (err: any) {
      setActionErr(err.message || 'Failed to load order details.');
    } finally {
      setOrderDetailLoading(false);
    }
  };

  // CSV Export Utility
  const exportToCSV = (filename: string, rows: object[]) => {
    if (!rows || !rows.length) {
      setActionErr('No data available to export.');
      return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows.map(row => {
        return keys.map(k => {
          let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
          cell = cell instanceof Date ? cell.toLocaleString() : String(cell).replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
          return cell;
        }).join(separator);
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessMsg(`Data exported to ${filename}.csv`);
  };

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
      if (selectedFloristId === id) {
        handleOpenFloristDetail(id);
      }
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
      if (selectedFloristId === rejectId) {
        setSelectedFloristId(null);
      }
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleToggleFloristStatus = async (id: string) => {
    setActionErr('');
    try {
      await toggleFloristSuspension(id);
      setSuccessMsg('Florist status updated.');
      if (selectedFloristId === id) {
        handleOpenFloristDetail(id);
      }
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleToggleUserSuspend = async (userId: string) => {
    setActionErr('');
    try {
      await toggleUserSuspension(userId);
      setSuccessMsg('User suspension state toggled.');
      if (selectedUserId === userId) {
        handleOpenUserDetail(userId);
      }
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleResetPassword = async (userId: string) => {
    setActionErr('');
    try {
      const res = await resetUserPassword(userId);
      setTempPassResult({ id: userId, msg: res });
      setSuccessMsg('Temporary credentials generated.');
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
      if (selectedUserId === userId) {
        setSelectedUserId(null);
      }
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleCancelOrderSubmit = async (orderId: string) => {
    if (!confirm(`Are you sure you want to cancel order ${orderId}?`)) return;
    setActionErr('');
    try {
      await cancelOrder(orderId);
      setSuccessMsg(`Order ${orderId} cancelled.`);
      if (selectedOrderId === orderId) {
        handleOpenOrderDetail(orderId);
      }
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundOrderId || !refundAmount || !refundReason) return;
    setActionErr('');
    try {
      await refundOrder(refundOrderId, Number(refundAmount), refundReason);
      setRefundOrderId(null);
      setRefundAmount('');
      setRefundReason('');
      setSuccessMsg('Refund processed successfully.');
      if (selectedOrderId === refundOrderId) {
        handleOpenOrderDetail(refundOrderId);
      }
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
      setSuccessMsg('Withdrawal payout approved and marked completed.');
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
      setSuccessMsg('Withdrawal request rejected.');
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

  const handleToggleCoupon = async (id: string) => {
    setActionErr('');
    try {
      await toggleCouponStatus(id);
      setSuccessMsg('Coupon status updated.');
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to remove this promo coupon?')) return;
    setActionErr('');
    try {
      await deleteCoupon(id);
      setSuccessMsg('Coupon deleted.');
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
        minimumOrderAmount: Number(minOrderAmt),
        maintenanceMode: Boolean(maintenanceMode),
        autoApproveFlorists: Boolean(autoApproveFlorists),
        maxLoginAttempts: Number(maxLoginAttempts) || 5,
        supportEmail: supportEmail.trim(),
        mpesaEnvironment
      });
      setSuccessMsg('Global platform policies and configuration saved successfully.');
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleTogglePermission = (perm: string) => {
    setNewAdminPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminName) return;
    setActionErr('');
    try {
      const res = await createAdministrator({
        name: newAdminName.trim(),
        email: newAdminEmail.trim().toLowerCase(),
        department: newAdminDept,
        role: newAdminRole,
        permissions: newAdminPermissions
      });
      setCreatedAdminCredentials({
        name: newAdminName,
        email: newAdminEmail,
        tempPass: res?.tempPassword || 'Auto-generated',
        role: newAdminRole
      });
      setNewAdminName('');
      setNewAdminEmail('');
      setSuccessMsg(`Administrator account for ${newAdminName} created successfully.`);
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleToggleAdminStatus = async (id: string, name: string) => {
    setActionErr('');
    try {
      await toggleAdminStatus(id);
      setSuccessMsg(`Updated status for administrator: ${name}`);
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleResetAdminPassword = async (id: string, name: string) => {
    setActionErr('');
    try {
      const tempPass = await resetAdminPassword(id);
      setAdminPassResetResult({ id, name, tempPass });
      setSuccessMsg(`Password reset for ${name}. Temporary password generated.`);
    } catch (err: any) {
      setActionErr(err.message);
    }
  };

  const handleDeleteAdmin = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently revoke credentials and delete administrator ${name}?`)) return;
    setActionErr('');
    try {
      await deleteAdministrator(id);
      setSuccessMsg(`Administrator ${name} removed from the platform.`);
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
    f.verificationStatus?.toLowerCase().includes(floristSearchTerm.toLowerCase()) ||
    (f.mpesaTillNumber || f.mpesa_till_number)?.includes(floristSearchTerm)
  );

  const filteredOrders = ordersList.filter(o =>
    o.id?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
    o.customerId?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
    o.paymentStatus?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
    o.subOrders?.some((s: any) => s.floristStoreName?.toLowerCase().includes(orderSearchTerm.toLowerCase()))
  );

  const filteredCoupons = couponsList.filter(c => {
    if (couponScopeFilter === 'global') return c.scope === 'global' || !c.floristId;
    if (couponScopeFilter === 'florist') return c.scope === 'florist' || Boolean(c.floristId);
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-800 flex font-sans antialiased selection:bg-[#2D5A27] selection:text-white" id="admin-dashboard-page">
      {/* Editorial Botanical Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        isSuperAdmin={isSuperAdmin}
        badgeCounts={{
          pendingFlorists: pendingFlorists.length,
          pendingPayouts: withdrawalsList.filter(w => w.status === 'pending').length,
          orders: ordersList.length,
          users: usersList.length,
        }}
      />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin Header Bar */}
        <AdminHeader
          activeTab={activeTab}
          isSuperAdmin={isSuperAdmin}
          loading={loading}
          onRefresh={loadData}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* ERROR / SUCCESS ALERTS */}
            {actionErr && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-medium">{actionErr}</span>
                </div>
                <button onClick={() => setActionErr('')} className="text-rose-600 hover:text-rose-800 text-xs font-semibold cursor-pointer">Dismiss</button>
              </div>
            )}

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-semibold">{successMsg}</span>
                </div>
                <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold cursor-pointer">Dismiss</button>
              </div>
            )}

            {/* TAB CONTENTS CONTAINER WRAPPED IN ANIMATEPRESENCE FOR SMOOTH NAVIGATION */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs min-h-[500px]"
              >

          {/* 1. EXECUTIVE METRICS OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-display font-semibold text-text-primary text-lg">Marketplace Financial & Operations Dashboard</h3>
                  <p className="text-xs text-text-muted">Calculated from live marketplace orders, M-Pesa settlements, and florist commissions.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => exportToCSV('FloraX_Financial_Ledger', ordersList.map(o => ({
                      OrderID: o.id,
                      CustomerID: o.customerId,
                      GrandTotal_KES: o.grandTotal,
                      PaymentStatus: o.paymentStatus,
                      SubOrdersCount: o.subOrders?.length || 1,
                      CreatedAt: o.created_at || o.createdAt
                    })))}
                    className="px-3.5 py-1.5 border border-utility-border hover:bg-canvas rounded-lg text-xs font-semibold text-text-secondary flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Export Ledger</span>
                  </button>
                  <div className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[11px] font-bold text-brand-primary font-mono">
                    Commission Rate: {systemConfig?.platformCommissionPercent || 20}%
                  </div>
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
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-text-primary text-base">{f.storeName || f.store_name}</h4>
                              <button 
                                onClick={() => handleOpenFloristDetail(f.id)}
                                className="text-xs text-brand-primary hover:underline flex items-center gap-1 font-semibold"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect Full Dossier</span>
                              </button>
                            </div>
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
                    <h3 className="font-display font-semibold text-text-primary text-base">All Registered Florists Directory ({allFlorists.length})</h3>
                    <p className="text-xs text-text-muted">Manage active stores, view live wallet balances, and inspect store performance.</p>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => exportToCSV('FloraX_Florists_Registry', allFlorists.map(f => ({
                        FloristID: f.id,
                        StoreName: f.storeName || f.store_name,
                        LegalBusinessName: f.legalBusinessName || f.legal_business_name,
                        Address: f.addressText || f.address_text,
                        MpesaTill: f.mpesaTillNumber || f.mpesa_till_number,
                        WalletBalance_KES: f.walletBalance || 0,
                        GrossSales_KES: f.grossSales || 0,
                        Status: f.verificationStatus
                      })))}
                      className="px-3 py-2 border border-utility-border hover:bg-canvas rounded-lg text-xs font-semibold text-text-secondary flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Download className="w-3.5 h-3.5 text-brand-primary" />
                      <span>Export Florists</span>
                    </button>
                    <div className="relative flex-1 md:w-64">
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
                          <td className="p-3 font-bold text-text-primary">
                            <button
                              onClick={() => handleOpenFloristDetail(f.id)}
                              className="text-left font-bold text-brand-primary hover:underline flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>{f.storeName || f.store_name}</span>
                              <ChevronRight className="w-3 h-3 text-text-muted" />
                            </button>
                          </td>
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
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => handleOpenFloristDetail(f.id)}
                              className="px-2.5 py-1.5 bg-canvas hover:bg-brand-primary/10 text-brand-primary rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-all border border-utility-border"
                              title="Inspect Performance Dossier"
                            >
                              <Eye className="w-3.5 h-3.5 inline mr-1" />
                              Inspect
                            </button>
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
                  <h3 className="font-display font-semibold text-text-primary text-base">Platform Identity Directories ({usersList.length})</h3>
                  <p className="text-xs text-text-muted">Inspect registered accounts, review CRM lifetime metrics, or moderate credentials.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => exportToCSV('FloraX_Users_Directory', usersList.map(u => ({
                      UserID: u.id,
                      Email: u.email,
                      Role: u.role,
                      FirstName: u.firstName || '',
                      LastName: u.lastName || '',
                      Phone: u.phoneNumber || '',
                      LifetimeSpend_KES: u.lifetimeSpend || 0,
                      OrdersCount: u.ordersCount || 0,
                      IsSuspended: Boolean(u.isSuspended)
                    })))}
                    className="px-3 py-2 border border-utility-border hover:bg-canvas rounded-lg text-xs font-semibold text-text-secondary flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Export Users</span>
                  </button>
                  <div className="relative flex-1 md:w-64">
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
              </div>

              {tempPassResult && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 font-mono flex items-center justify-between">
                  <span>{tempPassResult.msg}</span>
                  <button onClick={() => setTempPassResult(null)} className="text-xs text-blue-700 hover:text-blue-900 font-bold ml-2">Dismiss</button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-utility-border text-text-muted uppercase tracking-wider font-semibold text-[10px] bg-canvas/40">
                      <th className="p-3">User Profile</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">CRM Metrics</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((usr: any) => (
                      <tr key={usr.id} className="border-b border-utility-border hover:bg-canvas/20 text-text-secondary">
                        <td className="p-3">
                          <button
                            onClick={() => handleOpenUserDetail(usr.id)}
                            className="font-semibold text-brand-primary hover:underline text-left flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>{usr.firstName ? `${usr.firstName} ${usr.lastName}` : 'Unprofiled Account'}</span>
                            <ChevronRight className="w-3 h-3 text-text-muted" />
                          </button>
                        </td>
                        <td className="p-3 font-mono text-[11px]">{usr.email}</td>
                        <td className="p-3 font-mono font-bold text-brand-primary uppercase text-[10px]">
                          {usr.role}
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          {usr.ordersCount !== undefined ? (
                            <span className="text-text-primary font-semibold">
                              {usr.ordersCount} orders • KES {(usr.lifetimeSpend || 0).toLocaleString()}
                              {usr.isRepeatCustomer && <span className="ml-1.5 px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[9px] rounded font-bold">Repeat</span>}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="p-3">
                          {usr.isSuspended ? (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-bold rounded-full uppercase">Suspended</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full uppercase">Active</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleOpenUserDetail(usr.id)}
                            className="px-2.5 py-1.5 bg-canvas hover:bg-brand-primary/10 text-brand-primary rounded-lg text-[10px] font-bold uppercase cursor-pointer border border-utility-border"
                          >
                            <Eye className="w-3.5 h-3.5 inline mr-1" />
                            Dossier
                          </button>
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
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-display font-semibold text-text-primary text-base">Platform Parent Orders Management ({ordersList.length})</h3>
                  <p className="text-xs text-text-muted">Inspect multi-vendor orders, payment statuses, and issue cancellations or refunds.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => exportToCSV('FloraX_Orders_Ledger', ordersList.map(o => ({
                      ParentOrderID: o.id,
                      CustomerID: o.customerId,
                      GrandTotal_KES: o.grandTotal,
                      PaymentStatus: o.paymentStatus,
                      DeliveryAddress: o.deliveryAddressText,
                      SubOrdersCount: o.subOrders?.length || 1,
                      CreatedAt: o.created_at || o.createdAt
                    })))}
                    className="px-3 py-2 border border-utility-border hover:bg-canvas rounded-lg text-xs font-semibold text-text-secondary flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Export Orders</span>
                  </button>
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={orderSearchTerm}
                      onChange={(e) => setOrderSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-utility-border rounded-lg bg-canvas/30 text-text-primary focus:outline-hidden"
                    />
                  </div>
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
                      className="p-2.5 text-xs border border-utility-border rounded-lg bg-white font-mono"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Refund Reason e.g. Stock exhaustion or delivery delay"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="p-2.5 text-xs border border-utility-border rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setRefundOrderId(null)} className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-brand-primary text-white text-xs font-bold uppercase rounded-lg cursor-pointer">Confirm Refund</button>
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
                      <th className="p-3">Sub-Orders Breakdown</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((ord: any) => (
                      <tr key={ord.id} className="border-b border-utility-border hover:bg-canvas/20 text-text-secondary">
                        <td className="p-3 font-mono font-bold text-text-primary">
                          <button
                            onClick={() => handleOpenOrderDetail(ord.id)}
                            className="text-brand-primary hover:underline flex items-center gap-1 cursor-pointer font-bold"
                          >
                            <span>{ord.id}</span>
                            <Eye className="w-3.5 h-3.5 text-text-muted" />
                          </button>
                        </td>
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
                          <button
                            onClick={() => handleOpenOrderDetail(ord.id)}
                            className="px-2.5 py-1.5 bg-canvas hover:bg-brand-primary/10 text-brand-primary rounded-lg text-[10px] font-bold uppercase cursor-pointer border border-utility-border"
                          >
                            Inspect
                          </button>
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
                  <h3 className="font-display font-semibold text-text-primary text-base">Florist Payout & Withdrawal Requests ({withdrawalsList.length})</h3>
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
                    <button type="button" onClick={() => setWithdrawalApproveId(null)} className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-emerald-700 text-white text-xs font-bold uppercase rounded-lg cursor-pointer">Authorize Payout</button>
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
                    <button type="button" onClick={() => setWithdrawalRejectId(null)} className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-rose-700 text-white text-xs font-bold uppercase rounded-lg cursor-pointer">Submit Rejection</button>
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
                <h3 className="font-display font-semibold text-text-primary text-base">Product Categories ({categoriesList.length})</h3>
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
                <h3 className="font-display font-semibold text-text-primary text-base">Customer Review Moderation Desk ({reviewsList.length})</h3>
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-display font-semibold text-text-primary text-base">Global Coupon & Promo Code Engine</h3>
                  <p className="text-xs text-text-muted">Manage marketplace-wide discounts, florist campaigns, and usage redemption limits.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-muted">Scope Filter:</span>
                  <select
                    value={couponScopeFilter}
                    onChange={(e) => setCouponScopeFilter(e.target.value as any)}
                    className="p-1.5 text-xs border border-utility-border rounded-lg bg-white"
                  >
                    <option value="all">All Discounts ({couponsList.length})</option>
                    <option value="global">Platform Global Only</option>
                    <option value="florist">Florist Campaigns Only</option>
                  </select>
                </div>
              </div>
              
              <form onSubmit={handleCreateCouponSubmit} className="p-4 border border-utility-border rounded-xl bg-canvas/30 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary">Create Platform Global Promo Code</h4>
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
                      <th className="p-3">Creator / Scope</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Discount Value</th>
                      <th className="p-3">Min Order</th>
                      <th className="p-3">Redeemed</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoupons.map((c: any) => (
                      <tr key={c.id} className="border-b border-utility-border hover:bg-canvas/20">
                        <td className="p-3 font-mono font-bold text-brand-primary">{c.code}</td>
                        <td className="p-3 font-mono text-[11px] text-text-secondary">{c.floristName || 'Platform Global'}</td>
                        <td className="p-3 uppercase text-[10px] font-bold">{c.discountType}</td>
                        <td className="p-3 font-mono font-bold">{c.discountType === 'percentage' ? `${c.discountValue}%` : `KES ${c.discountValue}`}</td>
                        <td className="p-3 font-mono">KES {c.minimumPurchase || 0}</td>
                        <td className="p-3 font-mono">{c.usedCount || 0} times</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                            c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {c.isActive ? 'Active' : 'Paused'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleToggleCoupon(c.id)}
                            className="px-2.5 py-1.5 border border-utility-border hover:bg-canvas rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                          >
                            {c.isActive ? 'Pause' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="px-2 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3 h-3 inline" />
                          </button>
                        </td>
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
              
              {/* SYSTEM HEALTH & TELEMETRY LIVE PANEL */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="font-display font-semibold text-text-primary text-base flex items-center gap-2">
                      <Activity className="w-5 h-5 text-brand-primary" />
                      <span>System Health & Infrastructure Telemetry</span>
                    </h3>
                    <p className="text-xs text-text-muted">Live status of critical application gateways, databases, and third-party payment rails.</p>
                  </div>
                  <button
                    onClick={loadSystemHealth}
                    disabled={systemHealthLoading}
                    className="px-3 py-1.5 border border-utility-border hover:bg-canvas rounded-lg text-xs font-semibold text-text-secondary flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-brand-primary ${systemHealthLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh Telemetry</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* API GATEWAY */}
                  <div className="p-4 border border-utility-border rounded-xl bg-canvas/30 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-brand-primary" />
                        API Gateway
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {systemHealth?.services?.api?.status || 'ONLINE'}
                      </span>
                    </div>
                    <div className="text-base font-bold text-text-primary font-mono">
                      {systemHealth?.services?.api?.uptimeFormatted || 'Operational'}
                    </div>
                    <div className="text-[10px] text-text-secondary font-mono flex justify-between">
                      <span>Memory: {systemHealth?.services?.api?.memoryRssMb || 48} MB</span>
                      <span>Node {systemHealth?.services?.api?.nodeVersion || 'v20'}</span>
                    </div>
                  </div>

                  {/* DATABASE LEDGER */}
                  <div className="p-4 border border-utility-border rounded-xl bg-canvas/30 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-brand-primary" />
                        Storage Ledger
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                        CONNECTED
                      </span>
                    </div>
                    <div className="text-base font-bold text-text-primary font-mono">
                      {(systemHealth?.services?.database?.records?.orders || ordersList.length)} Orders Logged
                    </div>
                    <div className="text-[10px] text-text-secondary font-mono flex justify-between">
                      <span>{usersList.length} Users</span>
                      <span>{allFlorists.length} Florists</span>
                    </div>
                  </div>

                  {/* SAFARICOM M-PESA */}
                  <div className="p-4 border border-utility-border rounded-xl bg-canvas/30 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-brand-primary" />
                        Safaricom M-Pesa
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                        {mpesaEnvironment}
                      </span>
                    </div>
                    <div className="text-base font-bold text-text-primary font-mono">
                      Till & B2C Active
                    </div>
                    <div className="text-[10px] text-text-secondary font-mono flex justify-between">
                      <span>Daraja Express C2B</span>
                      <span>B2C Payouts</span>
                    </div>
                  </div>

                  {/* GEMINI AI ENGINE */}
                  <div className="p-4 border border-utility-border rounded-xl bg-canvas/30 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                        Gemini AI Core
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ACTIVE
                      </span>
                    </div>
                    <div className="text-base font-bold text-text-primary font-mono">
                      gemini-3.6-flash
                    </div>
                    <div className="text-[10px] text-text-secondary font-mono">
                      Demand & Quality Models Loaded
                    </div>
                  </div>
                </div>
              </div>

              {/* GLOBAL MARKETPLACE & POLICY SETTINGS */}
              <div className="space-y-4 pt-6 border-t border-utility-border">
                <div>
                  <h3 className="font-display font-semibold text-text-primary text-base">Global Marketplace & Policy Governance</h3>
                  <p className="text-xs text-text-muted">Configure baseline financial commission rates, minimum order cutoffs, and platform security flags.</p>
                </div>

                <form onSubmit={handleSaveSystemConfig} className="p-6 border border-utility-border rounded-2xl bg-canvas/20 space-y-6 max-w-3xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">
                        Platform Commission Rate (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          required
                          value={commissionRate}
                          onChange={(e) => setCommissionRate(e.target.value)}
                          className="w-full p-2.5 text-xs border border-utility-border rounded-lg bg-white font-mono font-bold"
                        />
                        <Percent className="w-3.5 h-3.5 text-text-muted absolute right-3 top-3" />
                      </div>
                      <p className="text-[10px] text-text-muted mt-1">Applies to all newly placed sub-orders. Past settled financials remain immutable.</p>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">
                        Minimum Order Amount (KES)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        required
                        value={minOrderAmt}
                        onChange={(e) => setMinOrderAmt(e.target.value)}
                        className="w-full p-2.5 text-xs border border-utility-border rounded-lg bg-white font-mono font-bold"
                      />
                      <p className="text-[10px] text-text-muted mt-1">Cart checkout threshold across all combined artisan sub-orders.</p>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">
                        Max Login Attempts Before Lockout
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="20"
                        required
                        value={maxLoginAttempts}
                        onChange={(e) => setMaxLoginAttempts(e.target.value)}
                        className="w-full p-2.5 text-xs border border-utility-border rounded-lg bg-white font-mono font-bold"
                      />
                      <p className="text-[10px] text-text-muted mt-1">Protects accounts against brute-force credential stuffing attacks.</p>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">
                        Official Concierge Support Email
                      </label>
                      <input
                        type="email"
                        required
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full p-2.5 text-xs border border-utility-border rounded-lg bg-white font-sans text-xs"
                      />
                      <p className="text-[10px] text-text-muted mt-1">Recipient of escalated customer disputes and vendor verification filings.</p>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">
                        Safaricom M-Pesa Gateway Mode
                      </label>
                      <select
                        value={mpesaEnvironment}
                        onChange={(e) => setMpesaEnvironment(e.target.value)}
                        className="w-full p-2.5 text-xs border border-utility-border rounded-lg bg-white font-bold text-brand-primary"
                      >
                        <option value="sandbox">Sandbox (Development / Test Rails)</option>
                        <option value="production">Production (Live Daraja Gateway)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-utility-border">
                    <label className="flex items-start gap-3 p-3.5 border border-utility-border rounded-xl bg-white cursor-pointer hover:bg-canvas/30">
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="mt-0.5 rounded border-utility-border text-brand-primary focus:ring-brand-primary"
                      />
                      <div>
                        <span className="block font-bold text-xs text-text-primary">Maintenance Mode Lock</span>
                        <span className="block text-[10px] text-text-muted">Temporarily pauses customer checkout and order dispatching for infrastructure maintenance.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 border border-utility-border rounded-xl bg-white cursor-pointer hover:bg-canvas/30">
                      <input
                        type="checkbox"
                        checked={autoApproveFlorists}
                        onChange={(e) => setAutoApproveFlorists(e.target.checked)}
                        className="mt-0.5 rounded border-utility-border text-brand-primary focus:ring-brand-primary"
                      />
                      <div>
                        <span className="block font-bold text-xs text-text-primary">Auto-Approve Verified Florists</span>
                        <span className="block text-[10px] text-text-muted">Automatically approves new florist applications that pass automated M-Pesa till verification.</span>
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="px-6 py-2.5 bg-brand-primary text-white text-xs font-bold uppercase rounded-xl cursor-pointer hover:bg-brand-primary/90 transition-all shadow-xs">
                      Save Global Governance Settings
                    </button>
                  </div>
                </form>
              </div>

              {/* ADMINISTRATOR TEAM MEMBERS */}
              <div className="space-y-4 pt-6 border-t border-utility-border">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="font-display font-semibold text-text-primary text-base">Administrators & Operations Team</h3>
                    <p className="text-xs text-text-muted">Provision staff credentials, designate departmental assignments, and configure RBAC authorization policies.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                    {administratorsList.length} Active Operators
                  </span>
                </div>

                {/* TEMPORARY CREDENTIALS ALERT MODAL / BANNER */}
                {createdAdminCredentials && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Administrator Account Provisioned Successfully
                      </span>
                      <button onClick={() => setCreatedAdminCredentials(null)} className="text-xs text-emerald-700 hover:text-emerald-900 cursor-pointer">
                        Dismiss
                      </button>
                    </div>
                    <div className="p-3 bg-white border border-emerald-200 rounded-lg font-mono text-xs space-y-1 text-text-primary">
                      <div>Name: <span className="font-bold">{createdAdminCredentials.name}</span></div>
                      <div>Email: <span className="font-bold">{createdAdminCredentials.email}</span></div>
                      <div>Assigned Role: <span className="font-bold uppercase text-brand-primary">{createdAdminCredentials.role}</span></div>
                      <div className="flex items-center justify-between pt-1">
                        <div>Initial Temporary Password: <span className="px-2 py-0.5 bg-canvas font-bold text-brand-primary rounded">{createdAdminCredentials.tempPass}</span></div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`Email: ${createdAdminCredentials.email}\nPassword: ${createdAdminCredentials.tempPass}`);
                            setSuccessMsg('Credentials copied to clipboard!');
                          }}
                          className="px-2 py-1 text-[10px] font-bold uppercase bg-brand-primary text-white rounded cursor-pointer flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Credentials</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {adminPassResetResult && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-purple-600" />
                        Administrator Password Reset for {adminPassResetResult.name}
                      </span>
                      <button onClick={() => setAdminPassResetResult(null)} className="text-xs text-purple-700 hover:text-purple-900 cursor-pointer">
                        Dismiss
                      </button>
                    </div>
                    <div className="p-3 bg-white border border-purple-200 rounded-lg font-mono text-xs flex justify-between items-center">
                      <span>Temporary Password: <strong className="text-purple-700">{adminPassResetResult.tempPass}</strong></span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(adminPassResetResult.tempPass);
                          setSuccessMsg('Password copied to clipboard!');
                        }}
                        className="px-2 py-1 text-[10px] font-bold uppercase bg-purple-600 text-white rounded cursor-pointer flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* CREATE ADMINISTRATOR FORM */}
                <form onSubmit={handleCreateAdminSubmit} className="p-5 border border-utility-border rounded-2xl bg-canvas/20 space-y-4 max-w-3xl">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-primary" />
                    <span>Grant Administrator Credentials</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                      className="p-2.5 text-xs border border-utility-border rounded-lg bg-white font-medium"
                    >
                      <option value="Operations">Operations</option>
                      <option value="Finance & Risk">Finance & Risk</option>
                      <option value="Florist Relations">Florist Relations</option>
                      <option value="Customer Concierge">Customer Concierge</option>
                      <option value="Tech & Security">Tech & Security</option>
                    </select>
                    <select
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value)}
                      className="p-2.5 text-xs border border-utility-border rounded-lg bg-white font-bold text-brand-primary"
                    >
                      <option value="admin">Admin Operator</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>

                  {/* GRANULAR PERMISSIONS SELECTOR */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-text-muted mb-2">
                      Granular Capability Permissions
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                      {[
                        { id: 'users.view', label: 'View Users' },
                        { id: 'users.edit', label: 'Manage Users' },
                        { id: 'florists.view', label: 'View Florists' },
                        { id: 'florists.verify', label: 'Verify/Approve Florists' },
                        { id: 'orders.view', label: 'View Orders' },
                        { id: 'orders.refund', label: 'Process Refunds' },
                        { id: 'payments.view', label: 'Approve Payouts' },
                        { id: 'reports.view', label: 'Executive Reports' },
                        { id: 'cms.manage', label: 'CMS & Broadcasts' },
                        { id: 'catalog.moderate', label: 'Catalog Moderation' }
                      ].map((perm) => {
                        const checked = newAdminPermissions.includes(perm.id);
                        return (
                          <button
                            type="button"
                            key={perm.id}
                            onClick={() => handleTogglePermission(perm.id)}
                            className={`p-2 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-all ${
                              checked 
                                ? 'bg-brand-primary/10 border-brand-primary text-brand-primary font-bold' 
                                : 'bg-white border-utility-border text-text-secondary hover:bg-canvas'
                            }`}
                          >
                            {checked ? <CheckSquare className="w-3.5 h-3.5 text-brand-primary shrink-0" /> : <Square className="w-3.5 h-3.5 text-text-muted shrink-0" />}
                            <span className="text-[11px] truncate">{perm.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="px-5 py-2.5 bg-brand-primary text-white text-xs font-bold uppercase rounded-xl cursor-pointer hover:bg-brand-primary/90 transition-all shadow-xs">
                      Provision Administrator Account
                    </button>
                  </div>
                </form>

                {/* ADMINISTRATOR ROSTER TABLE */}
                <div className="overflow-x-auto border border-utility-border rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-utility-border text-text-muted uppercase tracking-wider font-semibold text-[10px] bg-canvas/40">
                        <th className="p-3">Operator Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Assigned Permissions</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {administratorsList.map((adm: any) => (
                        <tr key={adm.id} className="border-b border-utility-border hover:bg-canvas/20">
                          <td className="p-3 font-bold text-text-primary">{adm.name}</td>
                          <td className="p-3 font-mono text-[11px]">{adm.email}</td>
                          <td className="p-3 font-mono font-bold text-brand-primary uppercase text-[10px]">{adm.role}</td>
                          <td className="p-3 text-text-secondary font-medium">{adm.department}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-full ${
                              adm.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {adm.status || 'active'}
                            </span>
                          </td>
                          <td className="p-3 max-w-[200px]">
                            <div className="flex flex-wrap gap-1">
                              {(adm.permissions || []).slice(0, 3).map((p: string) => (
                                <span key={p} className="px-1.5 py-0.5 bg-canvas text-[9px] font-mono rounded text-text-secondary border border-utility-border">
                                  {p}
                                </span>
                              ))}
                              {(adm.permissions || []).length > 3 && (
                                <span className="text-[9px] font-mono text-text-muted">+{adm.permissions.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-right space-x-1 whitespace-nowrap">
                            {adm.role !== 'super_admin' && (
                              <>
                                <button
                                  onClick={() => handleToggleAdminStatus(adm.id, adm.name)}
                                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase cursor-pointer ${
                                    adm.status === 'suspended'
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                                  }`}
                                  title={adm.status === 'suspended' ? 'Reactivate Administrator' : 'Suspend Administrator'}
                                >
                                  {adm.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                                </button>

                                <button
                                  onClick={() => handleResetAdminPassword(adm.id, adm.name)}
                                  className="px-2 py-1 bg-canvas hover:bg-utility-border text-text-secondary rounded text-[10px] font-bold uppercase cursor-pointer"
                                  title="Reset Administrator Temporary Password"
                                >
                                  Reset Pass
                                </button>

                                <button
                                  onClick={() => handleDeleteAdmin(adm.id, adm.name)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                  title="Revoke and Delete Administrator"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {adm.role === 'super_admin' && (
                              <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                                ROOT PROTECTED
                              </span>
                            )}
                          </td>
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-display font-semibold text-text-primary text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-primary" />
                    <span>Cryptographic System Audit Inspector</span>
                  </h3>
                  <p className="text-xs text-text-muted">Immutably logged administrative actions, operator IDs, and target record changes.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportToCSV('FloraX_System_Audit_Logs', auditLogs.map(l => ({
                      LogID: l.id,
                      Timestamp: l.timestamp,
                      OperatorID: l.adminId,
                      Action: l.action,
                      TargetTable: l.targetTable,
                      TargetID: l.targetId,
                      Reason: l.reason || ''
                    })))}
                    className="px-3 py-1.5 border border-utility-border hover:bg-canvas rounded-lg text-xs font-semibold text-text-secondary flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Export Audit CSV</span>
                  </button>
                </div>
              </div>

              {/* SEARCH & ACTION FILTER */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 relative">
                  <input
                    type="text"
                    placeholder="Search logs by Operator ID, Target ID, or Action keyword..."
                    value={auditSearchTerm}
                    onChange={(e) => setAuditSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-utility-border rounded-lg bg-canvas/30 text-text-primary"
                  />
                  <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5" />
                </div>
                <div>
                  <select
                    value={auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
                    className="w-full p-2 text-xs border border-utility-border rounded-lg bg-canvas/30 font-semibold"
                  >
                    <option value="all">All Action Categories</option>
                    <option value="approve">Approvals & Verifications</option>
                    <option value="suspend">Suspensions & Freezes</option>
                    <option value="refund">Refunds & Cancellations</option>
                    <option value="password">Password & Credential Resets</option>
                    <option value="config">System Config Updates</option>
                  </select>
                </div>
              </div>

              {/* FILTERED AUDIT LOGS DISPLAY */}
              {(() => {
                const filtered = auditLogs.filter(log => {
                  const matchesSearch = 
                    (log.adminId || '').toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
                    (log.action || '').toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
                    (log.targetId || '').toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
                    (log.targetTable || '').toLowerCase().includes(auditSearchTerm.toLowerCase());
                  
                  if (!matchesSearch) return false;
                  if (auditActionFilter === 'approve') return (log.action || '').includes('approve') || (log.action || '').includes('verify');
                  if (auditActionFilter === 'suspend') return (log.action || '').includes('suspend');
                  if (auditActionFilter === 'refund') return (log.action || '').includes('refund') || (log.action || '').includes('cancel');
                  if (auditActionFilter === 'password') return (log.action || '').includes('password');
                  if (auditActionFilter === 'config') return (log.action || '').includes('config') || (log.action || '').includes('settings');
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 space-y-2 border border-dashed border-utility-border rounded-xl">
                      <FileText className="w-8 h-8 text-text-muted mx-auto" />
                      <p className="text-xs text-text-secondary font-semibold">No audit log records match your filter criteria</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filtered.map((log: any) => (
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
                        {log.newValues && (
                          <div className="p-2 bg-white rounded border border-utility-border text-[10px] text-text-secondary mt-1">
                            <strong>Applied Payload:</strong> {JSON.stringify(log.newValues)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

              </motion.div>
            </AnimatePresence>

          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 1. FLORIST INSPECTION MODAL / DRAWER                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedFloristId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl border border-utility-border shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {floristDetailLoading ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-brand-primary animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-text-secondary">Loading florist performance dossier...</p>
                </div>
              ) : floristDetailData ? (
                <div className="p-6 space-y-6">
                  {/* HEADER */}
                  <div className="flex justify-between items-start border-b border-utility-border pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                        <Store className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-display font-bold text-text-primary">
                            {floristDetailData.storeName || floristDetailData.store_name}
                          </h2>
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                            floristDetailData.verificationStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            floristDetailData.verificationStatus === 'pending_review' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {floristDetailData.verificationStatus}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted font-mono mt-0.5">
                          ID: {floristDetailData.id} • Registered: {floristDetailData.created_at || 'Verified'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedFloristId(null)}
                      className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-canvas cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* FINANCIAL METRICS STRIP */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-canvas/40 border border-utility-border rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-text-muted">Gross Sales</span>
                      <div className="text-base font-bold font-mono text-text-primary">
                        KES {(floristDetailData.grossSales || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-canvas/40 border border-utility-border rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-text-muted">Platform Commission Paid</span>
                      <div className="text-base font-bold font-mono text-brand-primary">
                        KES {(floristDetailData.commissionPaid || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-canvas/40 border border-utility-border rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-text-muted">Available Wallet</span>
                      <div className="text-base font-bold font-mono text-emerald-700">
                        KES {(floristDetailData.walletBalance || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-canvas/40 border border-utility-border rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-text-muted">Paid Out to Date</span>
                      <div className="text-base font-bold font-mono text-text-primary">
                        KES {(floristDetailData.totalWithdrawn || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* DETAILS & CONTACT INFO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 border border-utility-border rounded-xl space-y-2 bg-canvas/20">
                      <h4 className="font-bold text-text-primary uppercase tracking-wider text-[10px]">Business & Vetting Information</h4>
                      <div className="space-y-1 text-text-secondary">
                        <div>Legal Name: <span className="font-bold text-text-primary">{floristDetailData.legalBusinessName || '—'}</span></div>
                        <div>M-Pesa Buy Goods Till: <span className="font-bold font-mono text-brand-primary">{floristDetailData.mpesaTillNumber}</span></div>
                        <div>Delivery Radius: <span className="font-bold">{floristDetailData.deliveryRadiusKm || 15} km</span></div>
                        <div>Address: <span className="font-medium">{floristDetailData.addressText}</span></div>
                      </div>
                    </div>

                    <div className="p-4 border border-utility-border rounded-xl space-y-2 bg-canvas/20">
                      <h4 className="font-bold text-text-primary uppercase tracking-wider text-[10px]">Store Profile & Owner Contact</h4>
                      <div className="space-y-1 text-text-secondary">
                        <div>Email: <span className="font-bold font-mono text-text-primary">{floristDetailData.ownerEmail || '—'}</span></div>
                        <div>Phone: <span className="font-bold font-mono text-text-primary">{floristDetailData.ownerPhone || '—'}</span></div>
                        <div>Total Products Listed: <span className="font-bold">{floristDetailData.products?.length || 0} items</span></div>
                        <div>Sub-Orders Fulfilled: <span className="font-bold">{floristDetailData.subOrders?.length || 0} orders</span></div>
                      </div>
                    </div>
                  </div>

                  {/* PRODUCTS LIST */}
                  <div className="space-y-3">
                    <h4 className="font-display font-semibold text-text-primary text-sm">Listed Products ({floristDetailData.products?.length || 0})</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 border border-utility-border rounded-xl p-2">
                      {(floristDetailData.products || []).map((prod: any) => (
                        <div key={prod.id} className="flex justify-between items-center p-2 text-xs hover:bg-canvas/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-text-primary">{prod.title}</span>
                            <span className="text-[10px] text-text-muted">({prod.category})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold">KES {prod.price?.toLocaleString()}</span>
                            <span className="px-2 py-0.5 text-[9px] bg-canvas border rounded font-mono">Stock: {prod.stockQuantity || prod.stock || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MODERATION ACTIONS */}
                  <div className="flex justify-between items-center pt-4 border-t border-utility-border">
                    <div className="flex gap-2">
                      {floristDetailData.verificationStatus === 'pending_review' && (
                        <button
                          onClick={() => handleApproveFlorist(floristDetailData.id)}
                          className="px-4 py-2 bg-brand-primary text-white rounded-lg text-xs font-bold uppercase cursor-pointer"
                        >
                          Approve Florist Store
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleFloristStatus(floristDetailData.id)}
                        className="px-4 py-2 border border-utility-border hover:bg-canvas rounded-lg text-xs font-bold uppercase cursor-pointer text-text-primary"
                      >
                        {floristDetailData.verificationStatus === 'suspended' ? 'Reactivate Store' : 'Suspend Store'}
                      </button>
                    </div>
                    <button
                      onClick={() => setSelectedFloristId(null)}
                      className="px-4 py-2 bg-canvas hover:bg-utility-border rounded-lg text-xs font-semibold uppercase cursor-pointer"
                    >
                      Close Dossier
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. USER CRM DOSSIER MODAL                                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl border border-utility-border shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {userDetailLoading ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-brand-primary animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-text-secondary">Loading customer CRM profile...</p>
                </div>
              ) : userDetailData ? (
                <div className="p-6 space-y-6">
                  {/* HEADER */}
                  <div className="flex justify-between items-start border-b border-utility-border pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-display font-bold text-text-primary">
                            {userDetailData.firstName ? `${userDetailData.firstName} ${userDetailData.lastName}` : userDetailData.email}
                          </h2>
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                            {userDetailData.role}
                          </span>
                          {userDetailData.isSuspended && (
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-rose-100 text-rose-800">
                              Suspended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted font-mono mt-0.5">
                          ID: {userDetailData.id} • Registered: {userDetailData.created_at || 'Verified'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedUserId(null)}
                      className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-canvas cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* CRM STATS STRIP */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-canvas/40 border border-utility-border rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-text-muted">Lifetime Spend</span>
                      <div className="text-base font-bold font-mono text-text-primary">
                        KES {(userDetailData.lifetimeSpend || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-canvas/40 border border-utility-border rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-text-muted">Orders Placed</span>
                      <div className="text-base font-bold font-mono text-brand-primary">
                        {userDetailData.ordersCount || 0} Orders
                      </div>
                    </div>
                    <div className="p-3 bg-canvas/40 border border-utility-border rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-text-muted">Average Order Value</span>
                      <div className="text-base font-bold font-mono text-emerald-700">
                        KES {(userDetailData.averageOrderValue || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-canvas/40 border border-utility-border rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-text-muted">Loyalty Tier</span>
                      <div className="text-base font-bold font-mono text-purple-800">
                        {userDetailData.isRepeatCustomer ? 'VIP Repeat' : 'Standard'}
                      </div>
                    </div>
                  </div>

                  {/* ADDRESSES & RECENT ORDERS */}
                  <div className="space-y-4">
                    <div className="p-4 border border-utility-border rounded-xl space-y-2 bg-canvas/20 text-xs">
                      <h4 className="font-bold text-text-primary uppercase tracking-wider text-[10px]">Contact & Saved Addresses</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-text-secondary">
                        <div>Email: <span className="font-mono font-bold text-text-primary">{userDetailData.email}</span></div>
                        <div>Phone: <span className="font-mono font-bold text-text-primary">{userDetailData.phoneNumber || '—'}</span></div>
                      </div>
                      {userDetailData.addresses && userDetailData.addresses.length > 0 && (
                        <div className="pt-2 border-t border-utility-border space-y-1">
                          <span className="text-[10px] font-bold text-text-muted uppercase">Saved Addresses:</span>
                          {userDetailData.addresses.map((addr: any, i: number) => (
                            <div key={i} className="font-mono text-[11px] text-text-primary">
                              • {addr.streetAddress}, {addr.city} ({addr.label || 'Home'})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-semibold text-text-primary text-sm">Order History ({userDetailData.orders?.length || 0})</h4>
                      <div className="max-h-48 overflow-y-auto space-y-2 border border-utility-border rounded-xl p-2">
                        {(userDetailData.orders || []).map((ord: any) => (
                          <div key={ord.id} className="flex justify-between items-center p-2 text-xs hover:bg-canvas/30 rounded-lg">
                            <div>
                              <span className="font-mono font-bold text-brand-primary">{ord.id}</span>
                              <span className="text-[10px] text-text-muted ml-2">{ord.createdAt || ord.created_at}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold">KES {(ord.grandTotal || 0).toLocaleString()}</span>
                              <span className="px-2 py-0.5 text-[9px] bg-emerald-50 text-emerald-800 rounded font-bold uppercase">{ord.paymentStatus}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* USER MODERATION ACTIONS */}
                  <div className="flex justify-between items-center pt-4 border-t border-utility-border">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResetPassword(userDetailData.id)}
                        className="px-4 py-2 bg-brand-primary text-white rounded-lg text-xs font-bold uppercase cursor-pointer"
                      >
                        Reset Credentials
                      </button>
                      <button
                        onClick={() => handleToggleUserSuspend(userDetailData.id)}
                        className="px-4 py-2 border border-utility-border hover:bg-canvas rounded-lg text-xs font-bold uppercase cursor-pointer text-text-primary"
                      >
                        {userDetailData.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                      </button>
                    </div>
                    <button
                      onClick={() => setSelectedUserId(null)}
                      className="px-4 py-2 bg-canvas hover:bg-utility-border rounded-lg text-xs font-semibold uppercase cursor-pointer"
                    >
                      Close Dossier
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. ORDER MULTI-VENDOR INSPECTION MODAL                                    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 0 }}
              className="bg-white rounded-2xl border border-utility-border shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {orderDetailLoading ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-brand-primary animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-text-secondary">Loading multi-vendor order ledger...</p>
                </div>
              ) : orderDetailData ? (
                <div className="p-6 space-y-6">
                  {/* HEADER */}
                  <div className="flex justify-between items-start border-b border-utility-border pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-display font-bold text-text-primary">
                            Order #{orderDetailData.id}
                          </h2>
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                            orderDetailData.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                            orderDetailData.paymentStatus === 'refunded' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {orderDetailData.paymentStatus}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted font-mono mt-0.5">
                          Customer: {orderDetailData.customerId} • Placed: {orderDetailData.created_at || orderDetailData.createdAt}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedOrderId(null)}
                      className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-canvas cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* SUMMARY CARDS */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-canvas/40 border border-utility-border rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-text-muted">Grand Total</span>
                      <div className="text-base font-bold font-mono text-text-primary">
                        KES {(orderDetailData.grandTotal || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-canvas/40 border border-utility-border rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-text-muted">Platform Commission</span>
                      <div className="text-base font-bold font-mono text-brand-primary">
                        KES {(orderDetailData.platformCommission || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-canvas/40 border border-utility-border rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-text-muted">Florists Net Total</span>
                      <div className="text-base font-bold font-mono text-emerald-700">
                        KES {((orderDetailData.grandTotal || 0) - (orderDetailData.platformCommission || 0)).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-canvas/40 border border-utility-border rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-text-muted">Delivery Address</span>
                      <div className="text-xs font-semibold text-text-primary truncate">
                        {orderDetailData.deliveryAddressText}
                      </div>
                    </div>
                  </div>

                  {/* SUB-ORDERS MULTI-VENDOR BREAKDOWN */}
                  <div className="space-y-4">
                    <h4 className="font-display font-semibold text-text-primary text-sm">
                      Multi-Vendor Sub-Orders Breakdown ({orderDetailData.subOrders?.length || 0})
                    </h4>

                    {(orderDetailData.subOrders || []).map((sub: any, idx: number) => (
                      <div key={sub.id || idx} className="p-4 border border-utility-border rounded-xl space-y-3 bg-canvas/20">
                        <div className="flex justify-between items-center border-b border-utility-border pb-2">
                          <div>
                            <div className="font-bold text-text-primary text-xs flex items-center gap-2">
                              <Store className="w-3.5 h-3.5 text-brand-primary" />
                              <span>{sub.floristStoreName}</span>
                              <span className="font-mono text-[10px] text-text-muted">({sub.id})</span>
                            </div>
                            <div className="text-[10px] font-mono text-text-muted">
                              M-Pesa Till: <span className="font-bold text-brand-primary">{sub.mpesaTillNumber}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                            sub.fulfillmentStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            sub.fulfillmentStatus === 'preparing' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {sub.fulfillmentStatus || 'Processing'}
                          </span>
                        </div>

                        {/* ITEMS LIST */}
                        <div className="space-y-1.5 text-xs">
                          {(sub.items || []).map((item: any, iIdx: number) => (
                            <div key={iIdx} className="flex justify-between items-center text-text-secondary">
                              <div>
                                <span className="font-semibold text-text-primary">{item.title}</span>
                                <span className="text-[10px] text-text-muted ml-2">x{item.quantity}</span>
                              </div>
                              <span className="font-mono font-bold text-text-primary">
                                KES {(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* FINANCIAL ACCOUNTING FOR THIS SUBORDER */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-utility-border text-[10px] font-mono text-text-muted">
                          <div>Subtotal: <span className="font-bold text-text-primary">KES {(sub.subtotal || 0).toLocaleString()}</span></div>
                          <div>Platform Fee: <span className="font-bold text-brand-primary">KES {(sub.platformCommission || 0).toLocaleString()}</span></div>
                          <div>Florist Net: <span className="font-bold text-emerald-700">KES {(sub.floristEarnings || 0).toLocaleString()}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ORDER ACTIONS */}
                  <div className="flex justify-between items-center pt-4 border-t border-utility-border">
                    <div className="flex gap-2">
                      {orderDetailData.paymentStatus === 'paid' && (
                        <button
                          onClick={() => { setRefundOrderId(orderDetailData.id); setRefundAmount(String(orderDetailData.grandTotal)); }}
                          className="px-4 py-2 bg-brand-primary text-white rounded-lg text-xs font-bold uppercase cursor-pointer"
                        >
                          Issue Order Refund
                        </button>
                      )}
                      {orderDetailData.paymentStatus !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelOrderSubmit(orderDetailData.id)}
                          className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold uppercase cursor-pointer"
                        >
                          Cancel Parent Order
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedOrderId(null)}
                      className="px-4 py-2 bg-canvas hover:bg-utility-border rounded-lg text-xs font-semibold uppercase cursor-pointer"
                    >
                      Close Order
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
