import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp,
  Wallet,
  ShoppingBag,
  ClipboardList,
  AlertTriangle,
  Plus,
  ArrowRight,
  RefreshCw,
  Store,
  Sparkles,
  Tag,
  Clock,
  CheckCircle2,
  Package
} from 'lucide-react';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
}

export default function DashboardView({ setActiveTab }: DashboardViewProps) {
  const [data, setData] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    setLoading(true);
    Promise.all([
      axios.get('/api/v1/florist/dashboard'),
      axios.get('/api/v1/florist/wallet')
    ])
      .then(([dashRes, walletRes]) => {
        setData(dashRes.data);
        setWallet(walletRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-xs">
        <RefreshCw className="animate-spin text-[#2D5A27] mx-auto mb-3" size={28} />
        <p className="text-sm font-medium text-stone-600">Loading Dashboard Metrics...</p>
      </div>
    );
  }

  const profile = data?.profile;
  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topProducts || [];
  const lowStockCount = data?.lowStockCount || 0;

  return (
    <div className="space-y-6">
      {/* Welcome & Store Banner */}
      <div className="bg-gradient-to-r from-[#1e3a1b] to-[#2D5A27] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-300 text-xs font-mono font-semibold uppercase tracking-wider">
              {profile?.county || 'Kenya'} • Partner Portal
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
              {profile?.verificationStatus === 'approved' ? 'Active' : profile?.verificationStatus}
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-50">
            Jambo, {profile?.storeName || 'Florist Partner'}!
          </h2>
          <p className="text-xs text-stone-200/90 max-w-xl leading-relaxed">
            Here is your live commercial dashboard, order pipeline, and wallet balances reconciled with the Flora_X ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('shop')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs border border-white/20 transition-all flex items-center space-x-1.5"
          >
            <Store size={14} />
            <span>Shop Management</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className="px-4 py-2 bg-emerald-400 text-stone-900 hover:bg-emerald-300 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Plus size={14} />
            <span>Add New Bouquet</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Available Wallet Balance */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3 relative overflow-hidden group hover:border-[#2D5A27]/40 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Available Balance
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-[#2D5A27]">
              <Wallet size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-stone-900">
              KES {wallet?.availableBalance?.toLocaleString() || '0'}
            </div>
            <p className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
              <span>Ready for payout</span>
              <button
                onClick={() => setActiveTab('wallet')}
                className="text-[#2D5A27] font-bold hover:underline"
              >
                Request →
              </button>
            </p>
          </div>
        </div>

        {/* Metric 2: Today's Gross Sales */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3 relative overflow-hidden group hover:border-[#2D5A27]/40 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Today's Gross Sales
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-stone-900">
              KES {data?.todaySales?.toLocaleString() || '0'}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Monthly: <strong className="text-stone-800">KES {data?.monthlySales?.toLocaleString() || '0'}</strong>
            </p>
          </div>
        </div>

        {/* Metric 3: Held in Escrow */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3 relative overflow-hidden group hover:border-[#2D5A27]/40 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Escrow / Pending
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-stone-900">
              KES {wallet?.pendingBalance?.toLocaleString() || '0'}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Released upon order delivery
            </p>
          </div>
        </div>

        {/* Metric 4: Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3 relative overflow-hidden group hover:border-[#2D5A27]/40 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className={`p-2 rounded-xl ${lowStockCount > 0 ? 'bg-rose-50 text-rose-700' : 'bg-stone-50 text-stone-500'}`}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-stone-900">
              {lowStockCount} <span className="text-xs font-normal text-stone-500">SKUs</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
              <span>{lowStockCount > 0 ? 'Action required' : 'Stock healthy'}</span>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-[#2D5A27] font-bold hover:underline"
              >
                Adjust →
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">
          Quick Action Workspaces
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => setActiveTab('shop')}
            className="p-3.5 rounded-xl border border-stone-200/80 hover:border-[#2D5A27] bg-[#FAF9F6] hover:bg-emerald-50/50 text-stone-800 transition-all text-left space-y-1.5 group"
          >
            <Store size={18} className="text-[#2D5A27] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold block">Shop Management</span>
            <span className="text-[10px] text-stone-500 block">Edit profile & delivery</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className="p-3.5 rounded-xl border border-stone-200/80 hover:border-[#2D5A27] bg-[#FAF9F6] hover:bg-emerald-50/50 text-stone-800 transition-all text-left space-y-1.5 group"
          >
            <ClipboardList size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold block">Order Pipeline</span>
            <span className="text-[10px] text-stone-500 block">Fulfill & update status</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className="p-3.5 rounded-xl border border-stone-200/80 hover:border-[#2D5A27] bg-[#FAF9F6] hover:bg-emerald-50/50 text-stone-800 transition-all text-left space-y-1.5 group"
          >
            <Wallet size={18} className="text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold block">Payouts & Wallet</span>
            <span className="text-[10px] text-stone-500 block">M-Pesa balance transfer</span>
          </button>

          <button
            onClick={() => setActiveTab('discounts')}
            className="p-3.5 rounded-xl border border-stone-200/80 hover:border-[#2D5A27] bg-[#FAF9F6] hover:bg-emerald-50/50 text-stone-800 transition-all text-left space-y-1.5 group"
          >
            <Tag size={18} className="text-purple-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold block">Promo Coupons</span>
            <span className="text-[10px] text-stone-500 block">Create discount codes</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className="p-3.5 rounded-xl border border-stone-200/80 hover:border-[#2D5A27] bg-[#FAF9F6] hover:bg-emerald-50/50 text-stone-800 transition-all text-left space-y-1.5 group"
          >
            <Sparkles size={18} className="text-amber-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold block">AI Studio</span>
            <span className="text-[10px] text-stone-500 block">Bouquet & copy AI</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-serif font-bold text-stone-800">Recent Marketplace Orders</h3>
              <p className="text-xs text-stone-500">Live order dispatches assigned to your studio.</p>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs font-bold text-[#2D5A27] hover:underline flex items-center space-x-1"
            >
              <span>View All Pipeline</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-stone-50/60">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Delivery Schedule</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-stone-800">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 px-3 font-medium text-stone-700">
                      {order.recipientName || 'Walk-in / Online Client'}
                    </td>
                    <td className="py-3 px-3 text-stone-500">
                      {order.deliveryDate} ({order.deliverySlot || 'Standard'})
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-stone-900">
                      KES {order.subTotal?.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          order.fulfillmentStatus === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : order.fulfillmentStatus === 'preparing'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {order.fulfillmentStatus?.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}

                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-400 text-xs">
                      No active orders currently pending.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-serif font-bold text-stone-800">Top Catalog Bouquets</h3>
              <p className="text-xs text-stone-500">Best performing arrangements.</p>
            </div>
            <button
              onClick={() => setActiveTab('products')}
              className="text-xs font-bold text-[#2D5A27] hover:underline"
            >
              Manage Catalog
            </button>
          </div>

          <div className="space-y-3">
            {topProducts.map((prod: any) => (
              <div key={prod.id} className="flex items-center justify-between p-3 rounded-xl border border-stone-100 bg-stone-50/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-200 shrink-0">
                    <img src={prod.primaryImageUrl} alt={prod.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 text-xs line-clamp-1">{prod.title}</h4>
                    <span className="text-[10px] text-stone-500">
                      KES {prod.variants[0]?.price?.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#2D5A27]">
                    {prod.orders_count || 0} sold
                  </span>
                </div>
              </div>
            ))}

            {topProducts.length === 0 && (
              <div className="py-8 text-center text-stone-400 text-xs">
                No catalog sales history yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
