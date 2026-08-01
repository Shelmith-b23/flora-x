import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ClipboardList,
  RefreshCw,
  Search,
  MapPin,
  Clock,
  Printer,
  CheckCircle2,
  Package,
  Truck,
  Lock,
  FileText,
  AlertTriangle,
  Inbox,
  Sparkles,
  PackageCheck,
  CheckCheck,
  Ban,
  XCircle,
  Phone,
  Mail,
  User,
  SlidersHorizontal,
  ChevronRight,
  ArrowUpDown,
  LayoutGrid,
  List,
  Gift,
  DollarSign,
  Info
} from 'lucide-react';
import FulfillmentTimeline from './FulfillmentTimeline';
import RejectOrderModal from './RejectOrderModal';

interface OrdersViewProps {
  verificationStatus?: string;
  onRefreshParent?: () => void;
  initialOrderId?: string | null;
}

export default function OrdersView({
  verificationStatus = 'approved',
  onRefreshParent,
  initialOrderId = null,
}: OrdersViewProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Filters & Controls
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'delivery' | 'amount'>('newest');
  const [viewMode, setViewMode] = useState<'split' | 'table'>('split');

  // Modals & Feedback
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const isRestricted = verificationStatus === 'suspended' || verificationStatus === 'rejected';

  const loadOrders = () => {
    setLoading(true);
    axios
      .get('/api/v1/florist/orders')
      .then((r) => {
        const fetchedOrders = Array.isArray(r.data) ? r.data : [];
        setOrders(fetchedOrders);
        if (fetchedOrders.length > 0) {
          if (initialOrderId) {
            const found = fetchedOrders.find((o) => o.id === initialOrderId || o.parentOrderId === initialOrderId);
            if (found) {
              setSelectedOrder(found);
            } else {
              setSelectedOrder(fetchedOrders[0]);
            }
          } else {
            // preserve selected order if still exists, else select first
            setSelectedOrder((prev: any) => {
              if (!prev) return fetchedOrders[0];
              const matching = fetchedOrders.find((o) => o.id === prev.id);
              return matching || fetchedOrders[0];
            });
          }
        } else {
          setSelectedOrder(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load orders:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const changeStatus = async (orderId: string, nextStatus: string, rejectionReason?: string) => {
    if (isRestricted) {
      setActionError(`Account status is "${verificationStatus}". Order modifications are locked.`);
      return;
    }

    const orderToUpdate = orders.find((o) => o.id === orderId);
    if (orderToUpdate && orderToUpdate.paymentStatus && orderToUpdate.paymentStatus !== 'paid') {
      setActionError('Fulfillment is blocked because payment has not been confirmed for this order.');
      return;
    }

    setActionError('');
    setActionSuccess('');
    setUpdatingStatus(true);

    try {
      await axios.put(`/api/v1/florist/orders/${orderId}/status`, {
        status: nextStatus,
        rejectionReason,
      });

      setActionSuccess(`Order status successfully updated to "${nextStatus.replace(/_/g, ' ')}".`);
      loadOrders();
      if (onRefreshParent) onRefreshParent();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOpenRejectModal = (orderId: string) => {
    if (isRestricted) return;
    setRejectingOrderId(orderId);
    setRejectModalOpen(true);
  };

  const handleConfirmRejection = async (reason: string) => {
    if (!rejectingOrderId) return;
    await changeStatus(rejectingOrderId, 'rejected', reason);
    setRejectModalOpen(false);
    setRejectingOrderId(null);
  };

  // Operational metrics
  const newCount = orders.filter((o) => o.fulfillmentStatus === 'received' || o.fulfillmentStatus === 'new').length;
  const acceptedCount = orders.filter((o) => o.fulfillmentStatus === 'accepted').length;
  const prepCount = orders.filter((o) => o.fulfillmentStatus === 'preparing').length;
  const readyCount = orders.filter((o) => o.fulfillmentStatus === 'ready_for_pickup').length;
  const transitCount = orders.filter((o) => o.fulfillmentStatus === 'out_for_delivery').length;
  const deliveredCount = orders.filter((o) => o.fulfillmentStatus === 'delivered').length;
  const exceptionCount = orders.filter((o) => o.fulfillmentStatus === 'rejected' || o.fulfillmentStatus === 'cancelled').length;

  // Filtering & Sorting
  const filteredOrders = orders
    .filter((o) => {
      // Status filter
      if (filterStatus === 'new') {
        if (o.fulfillmentStatus !== 'received' && o.fulfillmentStatus !== 'new') return false;
      } else if (filterStatus === 'cancelled_rejected') {
        if (o.fulfillmentStatus !== 'rejected' && o.fulfillmentStatus !== 'cancelled') return false;
      } else if (filterStatus !== 'all' && o.fulfillmentStatus !== filterStatus) {
        return false;
      }

      // Payment filter
      if (paymentFilter !== 'all') {
        if (paymentFilter === 'paid' && o.paymentStatus !== 'paid') return false;
        if (paymentFilter === 'pending' && o.paymentStatus === 'paid') return false;
      }

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesId = o.id.toLowerCase().includes(query);
        const matchesRecipient = o.recipientName?.toLowerCase().includes(query);
        const matchesEmail = o.customerEmail?.toLowerCase().includes(query);
        const matchesPhone = o.customerPhone?.toLowerCase().includes(query);
        if (!matchesId && !matchesRecipient && !matchesEmail && !matchesPhone) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      if (sortBy === 'delivery') {
        return new Date(a.deliveryDate || 0).getTime() - new Date(b.deliveryDate || 0).getTime();
      }
      if (sortBy === 'amount') {
        return (b.subTotal || 0) - (a.subTotal || 0);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-xs">
        <RefreshCw className="animate-spin text-[#2D5A27] mx-auto mb-3" size={28} />
        <p className="text-sm font-serif font-semibold text-stone-700">Loading Fulfillment Studio...</p>
        <p className="text-xs text-stone-400 mt-1">Retrieving florist sub-orders, delivery windows, and payment ledgers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-serif font-bold text-stone-800">Orders & Fulfillment</h2>
            <span className="text-xs bg-[#2D5A27]/10 text-[#2D5A27] font-semibold px-2.5 py-0.5 rounded-full">
              {orders.length} Total Sub-Orders
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Manage your marketplace orders from confirmation to delivery.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="self-start sm:self-auto px-3.5 py-2 border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className="text-stone-500" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Account Restriction Banner */}
      {isRestricted && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-3">
          <Lock size={18} className="text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold">Account Restricted ({verificationStatus.toUpperCase()})</p>
            <p className="text-amber-700 mt-0.5">
              Your account status is currently {verificationStatus}. Order management actions and fulfillment status updates are restricted.
            </p>
          </div>
        </div>
      )}

      {/* Success / Error Feedback Banners */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Operational Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div
          onClick={() => setFilterStatus('new')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === 'new'
              ? 'bg-amber-50 border-amber-500 shadow-xs'
              : 'bg-white border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center space-x-1.5 text-amber-700 mb-1">
            <Inbox size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">New</span>
          </div>
          <p className="text-base font-serif font-bold text-amber-900">{newCount}</p>
        </div>

        <div
          onClick={() => setFilterStatus('accepted')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === 'accepted'
              ? 'bg-blue-50 border-blue-500 shadow-xs'
              : 'bg-white border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center space-x-1.5 text-blue-700 mb-1">
            <CheckCircle2 size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Accepted</span>
          </div>
          <p className="text-base font-serif font-bold text-blue-900">{acceptedCount}</p>
        </div>

        <div
          onClick={() => setFilterStatus('preparing')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === 'preparing'
              ? 'bg-purple-50 border-purple-500 shadow-xs'
              : 'bg-white border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center space-x-1.5 text-purple-700 mb-1">
            <Sparkles size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Preparing</span>
          </div>
          <p className="text-base font-serif font-bold text-purple-900">{prepCount}</p>
        </div>

        <div
          onClick={() => setFilterStatus('ready_for_pickup')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === 'ready_for_pickup'
              ? 'bg-indigo-50 border-indigo-500 shadow-xs'
              : 'bg-white border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center space-x-1.5 text-indigo-700 mb-1">
            <PackageCheck size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Ready Pickup</span>
          </div>
          <p className="text-base font-serif font-bold text-indigo-900">{readyCount}</p>
        </div>

        <div
          onClick={() => setFilterStatus('out_for_delivery')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === 'out_for_delivery'
              ? 'bg-amber-50 border-amber-600 shadow-xs'
              : 'bg-white border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center space-x-1.5 text-amber-700 mb-1">
            <Truck size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">In Transit</span>
          </div>
          <p className="text-base font-serif font-bold text-amber-900">{transitCount}</p>
        </div>

        <div
          onClick={() => setFilterStatus('delivered')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === 'delivered'
              ? 'bg-emerald-50 border-emerald-500 shadow-xs'
              : 'bg-white border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center space-x-1.5 text-emerald-700 mb-1">
            <CheckCheck size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Delivered</span>
          </div>
          <p className="text-base font-serif font-bold text-emerald-900">{deliveredCount}</p>
        </div>

        <div
          onClick={() => setFilterStatus('cancelled_rejected')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === 'cancelled_rejected'
              ? 'bg-rose-50 border-rose-500 shadow-xs'
              : 'bg-white border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center space-x-1.5 text-rose-700 mb-1">
            <Ban size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Cancelled</span>
          </div>
          <p className="text-base font-serif font-bold text-rose-900">{exceptionCount}</p>
        </div>
      </div>

      {/* Filter Tabs & Search / Sort Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          {/* Status Tabs */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs overflow-x-auto w-full lg:w-auto scrollbar-none">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === 'all' ? 'bg-white shadow-xs text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setFilterStatus('new')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === 'new' ? 'bg-white shadow-xs text-amber-800 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              New ({newCount})
            </button>
            <button
              onClick={() => setFilterStatus('accepted')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === 'accepted' ? 'bg-white shadow-xs text-blue-800 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Accepted ({acceptedCount})
            </button>
            <button
              onClick={() => setFilterStatus('preparing')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === 'preparing' ? 'bg-white shadow-xs text-purple-800 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Preparing ({prepCount})
            </button>
            <button
              onClick={() => setFilterStatus('ready_for_pickup')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === 'ready_for_pickup' ? 'bg-white shadow-xs text-indigo-800 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Ready ({readyCount})
            </button>
            <button
              onClick={() => setFilterStatus('out_for_delivery')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === 'out_for_delivery' ? 'bg-white shadow-xs text-amber-800 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              In Transit ({transitCount})
            </button>
            <button
              onClick={() => setFilterStatus('delivered')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === 'delivered' ? 'bg-white shadow-xs text-emerald-800 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Delivered ({deliveredCount})
            </button>
            <button
              onClick={() => setFilterStatus('cancelled_rejected')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === 'cancelled_rejected' ? 'bg-white shadow-xs text-rose-800 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Exceptions ({exceptionCount})
            </button>
          </div>

          {/* Secondary Controls: Payment Filter, Search, Sort, View Mode */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Payment status filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-1.5 border border-stone-200 rounded-xl text-xs bg-stone-50 font-medium focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid Only</option>
              <option value="pending">Pending Payment</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-stone-200 rounded-xl text-xs bg-stone-50 font-medium focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="delivery">Delivery Date</option>
              <option value="amount">Subtotal Value</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search order # or recipient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] bg-[#FAF9F6]"
              />
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200">
              <button
                onClick={() => setViewMode('split')}
                title="Split Panel View"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'split' ? 'bg-white text-[#2D5A27] shadow-xs' : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Full Table View"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-[#2D5A27] shadow-xs' : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List Panel */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs lg:col-span-1 space-y-3 flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100 shrink-0 text-xs">
              <span className="font-serif font-bold text-stone-800">Order Queue ({filteredOrders.length})</span>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                Click to inspect
              </span>
            </div>

            {/* Scrollable Order List Cards */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredOrders.map((o) => {
                const isSelected = selectedOrder?.id === o.id;
                const isUnpaid = o.paymentStatus !== 'paid';

                return (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2.5 ${
                      isSelected
                        ? 'border-[#2D5A27] bg-[#2D5A27]/5 shadow-xs'
                        : 'border-stone-100 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-mono font-bold text-stone-800 text-xs">
                            #{o.id.substring(0, 8).toUpperCase()}
                          </h4>
                          {isUnpaid && (
                            <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded-sm">
                              UNPAID
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-stone-700 block mt-0.5">
                          For: {o.recipientName}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          o.fulfillmentStatus === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : o.fulfillmentStatus === 'preparing'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : o.fulfillmentStatus === 'ready_for_pickup'
                            ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                            : o.fulfillmentStatus === 'out_for_delivery'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : o.fulfillmentStatus === 'rejected' || o.fulfillmentStatus === 'cancelled'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {o.fulfillmentStatus?.replace(/_/g, ' ')?.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center text-[11px] text-stone-500 space-x-2">
                      <Clock size={13} className="text-stone-400 shrink-0" />
                      <span>
                        Deliver: {o.deliveryDate} ({o.deliverySlot || 'Standard Slot'})
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-2 border-t border-stone-100/80">
                      <span className="text-stone-500 font-medium">{o.items?.length || 1} Item(s)</span>
                      <span className="font-bold text-[#2D5A27]">KES {o.subTotal?.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}

              {filteredOrders.length === 0 && (
                <div className="py-20 text-center text-stone-400 space-y-2">
                  <ClipboardList size={36} className="mx-auto text-stone-300" />
                  <p className="text-xs font-semibold text-stone-600">No orders match criteria</p>
                  <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                    Try clearing search filters or checking other fulfillment status tabs.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Order Detailed Workspace */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs lg:col-span-2 space-y-6 h-[calc(100vh-220px)] min-h-[500px] overflow-y-auto">
            {selectedOrder ? (
              <div className="space-y-6">
                {/* Order Header & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif font-bold text-stone-800 text-lg">
                        Order #{selectedOrder.id.substring(0, 8).toUpperCase()}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          selectedOrder.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        Payment: {selectedOrder.paymentStatus?.toUpperCase() || 'PAID'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 font-mono mt-0.5">
                      Parent Order Ref: {selectedOrder.parentOrderId || selectedOrder.id}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Printer size={14} />
                      <span>Print Packing Slip</span>
                    </button>
                  </div>
                </div>

                {/* Fulfillment Timeline Visualizer */}
                <FulfillmentTimeline
                  status={selectedOrder.fulfillmentStatus || 'received'}
                  createdDate={selectedOrder.created_at}
                  updatedDate={selectedOrder.updated_at}
                  rejectionReason={selectedOrder.rejectionReason}
                />

                {/* Payment Warning Callout */}
                {selectedOrder.paymentStatus && selectedOrder.paymentStatus !== 'paid' && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-3">
                    <AlertTriangle size={20} className="text-rose-600 shrink-0" />
                    <div>
                      <p className="font-serif font-bold">Unpaid Order Safeguard</p>
                      <p className="text-rose-700 mt-0.5">
                        Payment status is "{selectedOrder.paymentStatus}". Fulfillment state changes are locked until payment is verified by M-Pesa or platform administrator.
                      </p>
                    </div>
                  </div>
                )}

                {/* Primary Fulfillment Next Action Controls */}
                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-stone-200/80 space-y-3">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Fulfillment Workflow Control
                  </span>

                  {isRestricted ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-2">
                      <Lock size={16} />
                      <span>Fulfillment status changes disabled under account restriction.</span>
                    </div>
                  ) : selectedOrder.paymentStatus && selectedOrder.paymentStatus !== 'paid' ? (
                    <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-stone-500 text-xs flex items-center space-x-2">
                      <Lock size={16} />
                      <span>Fulfillment controls disabled until payment is confirmed.</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Received / New State Actions */}
                      {(selectedOrder.fulfillmentStatus === 'received' || selectedOrder.fulfillmentStatus === 'new') && (
                        <>
                          <button
                            onClick={() => changeStatus(selectedOrder.id, 'accepted')}
                            disabled={updatingStatus}
                            className="bg-[#2D5A27] hover:bg-[#23471f] text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 size={14} />
                            <span>Confirm & Accept Order</span>
                          </button>
                          <button
                            onClick={() => handleOpenRejectModal(selectedOrder.id)}
                            disabled={updatingStatus}
                            className="bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            <Ban size={14} />
                            <span>Decline / Reject Order</span>
                          </button>
                        </>
                      )}

                      {/* Accepted State Action */}
                      {selectedOrder.fulfillmentStatus === 'accepted' && (
                        <button
                          onClick={() => changeStatus(selectedOrder.id, 'preparing')}
                          disabled={updatingStatus}
                          className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <Sparkles size={14} />
                          <span>Start Preparing Arrangement</span>
                        </button>
                      )}

                      {/* Preparing State Action */}
                      {selectedOrder.fulfillmentStatus === 'preparing' && (
                        <button
                          onClick={() => changeStatus(selectedOrder.id, 'ready_for_pickup')}
                          disabled={updatingStatus}
                          className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <PackageCheck size={14} />
                          <span>Mark Ready for Pickup / Dispatch</span>
                        </button>
                      )}

                      {/* Ready for Pickup Action */}
                      {selectedOrder.fulfillmentStatus === 'ready_for_pickup' && (
                        <button
                          onClick={() => changeStatus(selectedOrder.id, 'out_for_delivery')}
                          disabled={updatingStatus}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <Truck size={14} />
                          <span>Handover to Courier (Out for Delivery)</span>
                        </button>
                      )}

                      {/* Out for Delivery Action */}
                      {selectedOrder.fulfillmentStatus === 'out_for_delivery' && (
                        <button
                          onClick={() => changeStatus(selectedOrder.id, 'delivered')}
                          disabled={updatingStatus}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <CheckCheck size={14} />
                          <span>Confirm Delivery Completed</span>
                        </button>
                      )}

                      {/* Delivered Terminal State */}
                      {selectedOrder.fulfillmentStatus === 'delivered' && (
                        <div className="flex items-center space-x-2 text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
                          <CheckCheck size={16} />
                          <span>Order Completed & Handed Over</span>
                        </div>
                      )}

                      {/* Rejected/Cancelled Terminal State */}
                      {(selectedOrder.fulfillmentStatus === 'rejected' || selectedOrder.fulfillmentStatus === 'cancelled') && (
                        <div className="flex items-center space-x-2 text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
                          <Ban size={16} />
                          <span>Order Status Closed ({selectedOrder.fulfillmentStatus?.toUpperCase()})</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Two-Column Grid: Customer/Recipient Details + Delivery Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recipient & Customer Contact Info */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-3 text-xs">
                    <span className="font-serif font-bold text-stone-800 text-sm block border-b border-stone-200 pb-2">
                      Recipient & Buyer Details
                    </span>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-stone-700">
                        <User size={14} className="text-[#2D5A27] shrink-0" />
                        <div>
                          <span className="font-bold text-stone-900">{selectedOrder.recipientName}</span>
                          <span className="text-[10px] text-stone-400 block">Recipient</span>
                        </div>
                      </div>

                      {selectedOrder.recipientPhone && (
                        <div className="flex items-center space-x-2 text-stone-700">
                          <Phone size={14} className="text-[#2D5A27] shrink-0" />
                          <a href={`tel:${selectedOrder.recipientPhone}`} className="hover:underline text-stone-800 font-mono">
                            {selectedOrder.recipientPhone}
                          </a>
                        </div>
                      )}

                      {selectedOrder.customerEmail && (
                        <div className="flex items-center space-x-2 text-stone-700">
                          <Mail size={14} className="text-[#2D5A27] shrink-0" />
                          <span className="text-stone-600 font-mono text-[11px]">{selectedOrder.customerEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Location & Timing */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-3 text-xs">
                    <span className="font-serif font-bold text-stone-800 text-sm block border-b border-stone-200 pb-2">
                      Delivery Window & Destination
                    </span>

                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <MapPin size={14} className="text-[#2D5A27] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-stone-900 block">
                            {typeof selectedOrder.deliveryAddress === 'string'
                              ? selectedOrder.deliveryAddress
                              : `${selectedOrder.deliveryAddress?.streetAddress || 'Nairobi'}, ${selectedOrder.deliveryAddress?.city || 'Nairobi'}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-stone-700">
                        <Clock size={14} className="text-[#2D5A27] shrink-0" />
                        <span>
                          {selectedOrder.deliveryDate} | {selectedOrder.deliverySlot || 'Standard Delivery'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gift Card Message */}
                {selectedOrder.giftCardMessage && (
                  <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-amber-900 font-serif font-bold">
                      <Gift size={16} className="text-amber-700" />
                      <span>Gift Card Message Attached</span>
                    </div>
                    <p className="italic text-stone-700 bg-white p-3 rounded-lg border border-stone-200/80 leading-relaxed font-serif">
                      "{selectedOrder.giftCardMessage}"
                    </p>
                  </div>
                )}

                {/* Arrangement Stems & Product Items Table */}
                <div className="space-y-3">
                  <span className="font-serif font-bold text-stone-800 text-sm block">
                    Floral Items & Arrangements Included
                  </span>

                  <div className="border border-stone-200/80 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          <th className="py-2.5 px-3">Item Description</th>
                          <th className="py-2.5 px-3 text-center">Qty</th>
                          <th className="py-2.5 px-3 text-right">Unit Price</th>
                          <th className="py-2.5 px-3 text-right">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {selectedOrder.items?.map((item: any, idx: number) => {
                          const quantity = item.quantity || item.qty || 1;
                          const lineTotal = (item.unitPrice || 0) * quantity;

                          return (
                            <tr key={idx} className="hover:bg-stone-50/50">
                              <td className="py-3 px-3">
                                <span className="font-serif font-bold text-stone-800 block">
                                  {item.productTitle || item.title || 'Floral Arrangement'}
                                </span>
                                {item.variantTitle && (
                                  <span className="text-[10px] text-stone-400 block">Variant: {item.variantTitle}</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-stone-800">{quantity}</td>
                              <td className="py-3 px-3 text-right text-stone-600 font-mono">
                                KES {(item.unitPrice || 0).toLocaleString()}
                              </td>
                              <td className="py-3 px-3 text-right font-bold text-[#2D5A27] font-mono">
                                KES {lineTotal.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Authoritative Financial Breakdown Card */}
                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-stone-200/80 space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                    <span className="font-serif font-bold text-stone-800 text-xs">Financial Statement (SubOrder Ledger)</span>
                    <span className="text-[10px] text-stone-400 font-mono">Authoritative Ledger Data</span>
                  </div>

                  <div className="space-y-1.5 text-stone-600">
                    <div className="flex justify-between">
                      <span>Items Subtotal:</span>
                      <span className="font-mono text-stone-800">KES {(selectedOrder.subTotal || 0).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Delivery Fee Allocation:</span>
                      <span className="font-mono text-stone-800">KES {(selectedOrder.deliveryFee || 0).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-stone-400">
                      <span>Marketplace Commission (20%):</span>
                      <span className="font-mono text-rose-600">- KES {(selectedOrder.platformCommission || 0).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-200 text-sm">
                      <span className="text-[#2D5A27]">Florist Net Payout Earnings:</span>
                      <span className="font-mono text-[#2D5A27]">
                        KES {(selectedOrder.floristNetEarnings || selectedOrder.subTotal - (selectedOrder.platformCommission || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-stone-400 space-y-2 my-auto">
                <ClipboardList size={40} className="mx-auto text-stone-300" />
                <p className="text-sm font-serif font-semibold text-stone-700">Select an Order</p>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Choose an order from the pipeline on the left to inspect fulfillment instructions, delivery addresses, and status controls.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* FULL TABLE VIEW MODE */
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-stone-50/60">
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Delivery Window</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredOrders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => {
                    setSelectedOrder(o);
                    setViewMode('split');
                  }}
                  className="hover:bg-stone-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-stone-800">
                    #{o.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-stone-900 block">{o.recipientName}</span>
                    <span className="text-[10px] text-stone-400 block">{o.customerPhone || o.customerEmail}</span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    {o.deliveryDate} ({o.deliverySlot || 'Standard'})
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-stone-800">
                    {o.items?.length || 1}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#2D5A27] font-mono">
                    KES {o.subTotal?.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        o.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {o.paymentStatus?.toUpperCase() || 'PAID'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        o.fulfillmentStatus === 'delivered'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : o.fulfillmentStatus === 'preparing'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : o.fulfillmentStatus === 'ready_for_pickup'
                          ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                          : o.fulfillmentStatus === 'out_for_delivery'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : o.fulfillmentStatus === 'rejected' || o.fulfillmentStatus === 'cancelled'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {o.fulfillmentStatus?.replace(/_/g, ' ')?.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(o);
                        setViewMode('split');
                      }}
                      className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[11px] font-semibold cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    No orders match current search and status filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingOrderId && (
        <RejectOrderModal
          isOpen={rejectModalOpen}
          orderId={rejectingOrderId}
          onClose={() => {
            setRejectModalOpen(false);
            setRejectingOrderId(null);
          }}
          onConfirm={handleConfirmRejection}
        />
      )}
    </div>
  );
}
