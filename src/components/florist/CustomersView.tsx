import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  Search,
  Mail,
  Phone,
  ShoppingBag,
  DollarSign,
  Calendar,
  MapPin,
  RefreshCw,
  MessageSquare,
  ChevronRight,
  UserCheck,
  UserPlus,
  Sparkles,
  X,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Ban
} from 'lucide-react';

interface SubOrder {
  id: string;
  parentOrderId: string;
  created_at: string;
  deliveryDate: string;
  deliverySlot: string;
  subTotal: number;
  fulfillmentStatus: string;
  paymentStatus: string;
  recipientName: string;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
}

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
  city: string;
  orders: SubOrder[];
}

interface CustomersViewProps {
  setActiveTab?: (tab: string) => void;
  onSelectOrder?: (orderId: string) => void;
  onSelectConvo?: (convoId: string) => void;
  verificationStatus?: string;
}

export default function CustomersView({
  setActiveTab,
  onSelectOrder,
  onSelectConvo,
  verificationStatus = 'approved'
}: CustomersViewProps) {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'repeat' | 'new' | 'recent'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [messagingCustomer, setMessagingCustomer] = useState<CustomerRecord | null>(null);
  const [initialMessageText, setInitialMessageText] = useState('');
  const [startingChat, setStartingChat] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const isRestricted = verificationStatus === 'suspended' || verificationStatus === 'rejected';

  const loadCustomers = () => {
    setLoading(true);
    setError(null);
    axios
      .get('/api/v1/florist/customers')
      .then((res) => {
        setCustomers(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load florist customers:', err);
        setError('Unable to load customer relationships. Please verify your connection.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Filtered customers based on search and category tab
  const filteredCustomers = customers.filter((c) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query) ||
      c.city.toLowerCase().includes(query) ||
      c.orders?.some((o) => o.id.toLowerCase().includes(query) || o.parentOrderId.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (activeFilterTab === 'repeat') return c.totalOrders > 1;
    if (activeFilterTab === 'new') return c.totalOrders === 1;
    if (activeFilterTab === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(c.lastOrderDate) >= thirtyDaysAgo;
    }

    return true;
  });

  // KPI Calculations
  const totalCustomerCount = customers.length;
  const repeatCustomerCount = customers.filter((c) => c.totalOrders > 1).length;
  const newCustomerCount = customers.filter((c) => c.totalOrders === 1).length;
  const repeatRevenue = customers
    .filter((c) => c.totalOrders > 1)
    .reduce((sum, c) => sum + c.totalSpent, 0);

  // Helper for status badges
  const getFulfillmentBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={11} />
            <span>Delivered</span>
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
            <Truck size={11} />
            <span>In Transit</span>
          </span>
        );
      case 'in_preparation':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Package size={11} />
            <span>In Atelier</span>
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <Ban size={11} />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
            <Clock size={11} />
            <span className="capitalize">{status.replace('_', ' ')}</span>
          </span>
        );
    }
  };

  // Initiate conversation with customer
  const handleStartMessageThread = async (customer: CustomerRecord, customMessage?: string) => {
    if (isRestricted) {
      setActionNotice('Your account is restricted. Customer communication is disabled.');
      return;
    }

    setStartingChat(true);
    try {
      const resp = await axios.post('/api/v1/florist/conversations', {
        customerEmail: customer.email,
        customerName: customer.name,
        customerPhone: customer.phone,
        initialMessage: customMessage || `Hello ${customer.name}, thank you for choosing our floral atelier.`
      });

      const convo = resp.data;
      setStartingChat(false);
      setMessagingCustomer(null);
      setSelectedCustomer(null);

      if (onSelectConvo) {
        onSelectConvo(convo.id);
      }
      if (setActiveTab) {
        setActiveTab('chat');
      }
    } catch (err: any) {
      console.error('Failed to initiate conversation:', err);
      setActionNotice(err.response?.data?.error || 'Failed to start message thread. Please try again.');
      setStartingChat(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Notice Bar if present */}
      {actionNotice && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-amber-900 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert size={16} className="text-amber-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-amber-700 hover:text-amber-900 font-bold px-2 py-1 rounded-lg hover:bg-amber-100/60"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Studio Section */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#2D5A27]/10 text-[#2D5A27]">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
                Customer Relationships
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Understand your buyers, nurture repeat relationships, and deliver a personal floral experience.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={loadCustomers}
            disabled={loading}
            className="p-2.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-white text-stone-600 hover:text-stone-900 transition-colors shadow-xs flex items-center justify-center"
            title="Refresh Customer Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#2D5A27]' : ''} />
          </button>
        </div>
      </div>

      {/* Metric Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
            <span>Total Buyers</span>
            <Users size={16} className="text-[#2D5A27]" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900">
            {loading ? '...' : totalCustomerCount}
          </div>
          <p className="text-[10px] text-stone-400 mt-1">Unique clients with completed sub-orders</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
            <span>Repeat Clients</span>
            <UserCheck size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-800">
            {loading ? '...' : repeatCustomerCount}
          </div>
          <p className="text-[10px] text-stone-400 mt-1">
            {totalCustomerCount > 0
              ? `${Math.round((repeatCustomerCount / totalCustomerCount) * 100)}% repeat client retention`
              : '0% retention'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
            <span>New Clients</span>
            <UserPlus size={16} className="text-sky-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900">
            {loading ? '...' : newCustomerCount}
          </div>
          <p className="text-[10px] text-stone-400 mt-1">First-time bouquet order buyers</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs bg-gradient-to-br from-emerald-900 to-[#1e3a1b] text-white">
          <div className="flex items-center justify-between text-emerald-200 text-xs mb-2">
            <span>Repeat Volume</span>
            <Sparkles size={16} className="text-amber-300" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-100 font-mono">
            {loading ? '...' : `KES ${repeatRevenue.toLocaleString()}`}
          </div>
          <p className="text-[10px] text-emerald-300/80 mt-1">Net revenue generated by loyal clients</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
              activeFilterTab === 'all'
                ? 'bg-[#2D5A27] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Clients ({totalCustomerCount})
          </button>
          <button
            onClick={() => setActiveFilterTab('repeat')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
              activeFilterTab === 'repeat'
                ? 'bg-[#2D5A27] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Repeat Buyers ({repeatCustomerCount})
          </button>
          <button
            onClick={() => setActiveFilterTab('new')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
              activeFilterTab === 'new'
                ? 'bg-[#2D5A27] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            New Buyers ({newCustomerCount})
          </button>
          <button
            onClick={() => setActiveFilterTab('recent')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
              activeFilterTab === 'recent'
                ? 'bg-[#2D5A27] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Recent (30 Days)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search name, email, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] bg-[#FAF9F6]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw size={28} className="animate-spin text-[#2D5A27] mx-auto" />
            <p className="text-xs text-stone-500 font-medium">Gathering Client Atelier Records...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <ShieldAlert size={32} className="text-rose-500 mx-auto" />
            <p className="text-xs text-stone-700 font-medium">{error}</p>
            <button
              onClick={loadCustomers}
              className="px-4 py-2 bg-[#2D5A27] text-white rounded-xl text-xs font-medium hover:bg-[#23471f] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Users size={40} className="text-stone-300 mx-auto" />
            <h3 className="font-serif font-bold text-stone-800 text-sm">
              {search ? 'No Matching Customers Found' : 'No Customer Relationships Yet'}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {search
                ? `No client records matched "${search}". Try refining your keywords.`
                : 'When customers place orders for your artisanal floral designs, their records, contact details, and purchase history will appear here.'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-2 text-xs text-[#2D5A27] font-semibold underline underline-offset-4 hover:text-[#23471f]"
              >
                Clear Search Query
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-stone-50/70">
                  <th className="py-3.5 px-4">Client Identity</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-center">Sub-Orders</th>
                  <th className="py-3.5 px-4 text-right">Net Spend</th>
                  <th className="py-3.5 px-4">Last Order</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {filteredCustomers.map((customer) => {
                  const isLoyal = customer.totalOrders >= 3;
                  const isRepeat = customer.totalOrders === 2;

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-[#FAF9F6]/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] font-serif font-bold flex items-center justify-center text-xs shrink-0 border border-[#2D5A27]/20">
                            {customer.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-serif font-bold text-stone-900 group-hover:text-[#2D5A27] transition-colors flex items-center space-x-2">
                              <span>{customer.name}</span>
                              {isLoyal && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  VIP Loyal
                                </span>
                              )}
                              {isRepeat && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Repeat
                                </span>
                              )}
                              {!isLoyal && !isRepeat && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                                  New Buyer
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-stone-400 font-mono block">
                              ID: {customer.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-stone-600" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-0.5">
                          <a
                            href={`mailto:${customer.email}`}
                            className="flex items-center space-x-1.5 hover:text-[#2D5A27] transition-colors"
                          >
                            <Mail size={12} className="text-stone-400 shrink-0" />
                            <span className="font-mono text-[11px] truncate">{customer.email}</span>
                          </a>
                          <a
                            href={`tel:${customer.phone}`}
                            className="flex items-center space-x-1.5 hover:text-[#2D5A27] transition-colors text-stone-500 text-[11px]"
                          >
                            <Phone size={12} className="text-stone-400 shrink-0" />
                            <span className="font-mono">{customer.phone}</span>
                          </a>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-stone-600">
                        <div className="flex items-center space-x-1.5 text-xs">
                          <MapPin size={12} className="text-stone-400 shrink-0" />
                          <span>{customer.city}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-1 rounded-full bg-stone-100 text-stone-800 font-bold text-xs border border-stone-200">
                          {customer.totalOrders}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right font-serif font-bold text-[#2D5A27] text-xs font-mono">
                        KES {customer.totalSpent.toLocaleString()}
                      </td>

                      <td className="py-4 px-4 text-stone-500 text-xs">
                        {formatDate(customer.lastOrderDate)}
                      </td>

                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:border-[#2D5A27] text-stone-700 hover:text-[#2D5A27] text-[11px] font-medium transition-colors bg-white shadow-2xs flex items-center space-x-1"
                          >
                            <span>History</span>
                            <ChevronRight size={12} />
                          </button>
                          <button
                            onClick={() => setMessagingCustomer(customer)}
                            disabled={isRestricted}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors shadow-2xs flex items-center space-x-1 ${
                              isRestricted
                                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                : 'bg-[#2D5A27] text-white hover:bg-[#23471f]'
                            }`}
                            title={isRestricted ? 'Restricted Account' : 'Message Customer'}
                          >
                            <MessageSquare size={12} />
                            <span className="hidden sm:inline">Message</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CUSTOMER DETAIL DRAWER / SIDE SHEET MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-stone-200 overflow-hidden animate-slideInRight">
            {/* Drawer Header */}
            <div className="p-6 bg-[#FAF9F6] border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2D5A27] text-white font-serif font-bold text-lg flex items-center justify-center shadow-md">
                  {selectedCustomer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-lg flex items-center space-x-2">
                    <span>{selectedCustomer.name}</span>
                    {selectedCustomer.totalOrders >= 3 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        VIP Loyal
                      </span>
                    ) : selectedCustomer.totalOrders === 2 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Repeat
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                        New Client
                      </span>
                    )}
                  </h3>
                  <span className="text-xs text-stone-500 font-mono">
                    Client ID: {selectedCustomer.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Quick Key Metrics */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60">
                  <span className="text-[10px] text-stone-400 font-medium block">Lifetime Spend</span>
                  <span className="font-serif font-bold text-[#2D5A27] text-sm font-mono block mt-0.5">
                    KES {selectedCustomer.totalSpent.toLocaleString()}
                  </span>
                </div>
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60">
                  <span className="text-[10px] text-stone-400 font-medium block">Sub-Orders</span>
                  <span className="font-serif font-bold text-stone-900 text-sm block mt-0.5">
                    {selectedCustomer.totalOrders}
                  </span>
                </div>
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60">
                  <span className="text-[10px] text-stone-400 font-medium block">Avg Order (AOV)</span>
                  <span className="font-serif font-bold text-stone-800 text-sm font-mono block mt-0.5">
                    KES {Math.round(selectedCustomer.totalSpent / (selectedCustomer.totalOrders || 1)).toLocaleString()}
                  </span>
                </div>
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60">
                  <span className="text-[10px] text-stone-400 font-medium block">First Order</span>
                  <span className="text-xs font-semibold text-stone-700 block mt-1 truncate">
                    {formatDate(selectedCustomer.firstOrderDate)}
                  </span>
                </div>
              </div>

              {/* Contact Information Box */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider font-mono border-b border-stone-100 pb-2">
                  Client Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Email Address</span>
                    <a
                      href={`mailto:${selectedCustomer.email}`}
                      className="text-[#2D5A27] hover:underline font-mono text-xs flex items-center space-x-1 mt-0.5"
                    >
                      <span>{selectedCustomer.email}</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Phone Line</span>
                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="text-[#2D5A27] hover:underline font-mono text-xs flex items-center space-x-1 mt-0.5"
                    >
                      <span>{selectedCustomer.phone}</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Primary City</span>
                    <span className="text-stone-800 font-medium block mt-0.5">
                      {selectedCustomer.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Purchase History Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider font-mono">
                    Atelier Sub-Orders History ({selectedCustomer.orders?.length || 0})
                  </h4>
                  <span className="text-[10px] text-stone-400">
                    Scoped to {verificationStatus === 'approved' ? 'Active Florist Store' : 'Your Florist Atelier'}
                  </span>
                </div>

                {!selectedCustomer.orders || selectedCustomer.orders.length === 0 ? (
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-8 text-center text-stone-500 text-xs">
                    No order history recorded for this customer.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCustomer.orders.map((subOrder) => (
                      <div
                        key={subOrder.id}
                        className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs hover:border-[#2D5A27]/50 transition-colors space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-xs text-stone-900">
                              #{subOrder.id}
                            </span>
                            {getFulfillmentBadge(subOrder.fulfillmentStatus)}
                          </div>
                          <span className="text-[11px] text-stone-500">
                            {formatDate(subOrder.created_at)}
                          </span>
                        </div>

                        {/* Items list summary */}
                        <div className="space-y-1">
                          {subOrder.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-stone-800">
                                {item.quantity}x {item.title}
                              </span>
                              <span className="font-mono text-stone-600">
                                KES {(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                          <div className="text-stone-500">
                            Recipient: <span className="font-medium text-stone-800">{subOrder.recipientName}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-serif font-bold text-[#2D5A27] font-mono">
                              Subtotal: KES {subOrder.subTotal.toLocaleString()}
                            </span>
                            {onSelectOrder && setActiveTab && (
                              <button
                                onClick={() => {
                                  setSelectedCustomer(null);
                                  onSelectOrder(subOrder.id);
                                  setActiveTab('orders');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#2D5A27] hover:text-white text-stone-700 text-[11px] font-medium transition-colors flex items-center space-x-1"
                              >
                                <span>View Order</span>
                                <ArrowUpRight size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 text-xs font-medium hover:bg-stone-200 transition-colors"
              >
                Close Panel
              </button>
              <button
                onClick={() => {
                  setMessagingCustomer(selectedCustomer);
                }}
                disabled={isRestricted}
                className={`px-5 py-2.5 rounded-xl text-xs font-medium transition-colors shadow-xs flex items-center space-x-2 ${
                  isRestricted
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-[#2D5A27] text-white hover:bg-[#23471f]'
                }`}
              >
                <MessageSquare size={14} />
                <span>Start Direct Message Thread</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK MESSAGE COMPOSER MODAL */}
      {messagingCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#2D5A27]/10 text-[#2D5A27]">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-sm">
                    Message {messagingCustomer.name}
                  </h3>
                  <span className="text-[11px] text-stone-500 font-mono">
                    {messagingCustomer.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMessagingCustomer(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-stone-700 block">
                Message Content
              </label>
              <textarea
                rows={4}
                value={initialMessageText}
                onChange={(e) => setInitialMessageText(e.target.value)}
                placeholder={`Hello ${messagingCustomer.name}, thank you for choosing our floral atelier. How can we assist you today?`}
                className="w-full p-3 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] bg-[#FAF9F6]"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setMessagingCustomer(null)}
                className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStartMessageThread(messagingCustomer, initialMessageText)}
                disabled={startingChat}
                className="px-5 py-2 bg-[#2D5A27] hover:bg-[#23471f] text-white rounded-xl text-xs font-medium transition-colors shadow-xs flex items-center space-x-2"
              >
                {startingChat ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Initiating Thread...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare size={13} />
                    <span>Open in Messaging Hub</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
