import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  ShoppingBag,
  Users,
  CheckCircle2,
  RefreshCw,
  Clock,
  ArrowUpRight,
  PackageCheck,
  Star,
  Layers,
  ChevronDown,
  Printer,
  Sparkles,
  BarChart3,
  Percent
} from 'lucide-react';

interface ReportData {
  financials: {
    totalGrossSales: number;
    totalCommissionDeducted: number;
    totalNetRevenue: number;
    totalDeliveryFees: number;
    paidOrdersCount: number;
    totalOrdersCount: number;
    averageOrderValue: number;
  };
  metrics: {
    uniqueCustomers: number;
    repeatCustomers: number;
    repeatCustomerRate: string;
    fulfillmentRate: string;
    averageOrderValue: number;
  };
  statusDistribution: Record<string, number>;
  weeklyTrend: Array<{
    day: string;
    date?: string;
    revenue: number;
    netRevenue: number;
    orders: number;
  }>;
  dailyTrend: Array<{
    date: string;
    grossSales: number;
    netRevenue: number;
    platformCommission: number;
    deliveryFees: number;
    ordersCount: number;
  }>;
  productPerformance: Array<{
    productId: string;
    title: string;
    category: string;
    unitsSold: number;
    grossSales: number;
    netRevenue: number;
  }>;
  reviewsSummary: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    unansweredReviews: number;
    answeredReviews: number;
  };
}

export default function ReportsView() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'30d' | '7d' | 'today' | 'all'>('30d');

  const loadReport = (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    axios
      .get('/api/v1/florist/analytics')
      .then((r) => {
        setData(r.data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((err) => {
        console.error('Failed to load florist analytics:', err);
        setError('Unable to load authoritative financial analytics. Please try again.');
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;

    const headers = ['Product Title', 'Category', 'Units Sold', 'Gross Sales (KES)', 'Net Revenue (KES)'];
    const rows = (data.productPerformance || []).map((p) => [
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.unitsSold,
      p.grossSales,
      p.netRevenue
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        `Flora_X Florist Performance Report - Generated ${new Date().toLocaleDateString('en-KE')}`,
        `Total Gross Sales: KES ${data.financials.totalGrossSales.toLocaleString()}`,
        `Platform Commission Deducted: KES ${data.financials.totalCommissionDeducted.toLocaleString()}`,
        `Net Florist Revenue: KES ${data.financials.totalNetRevenue.toLocaleString()}`,
        `Total Paid Orders: ${data.financials.paidOrdersCount}`,
        '',
        headers.join(','),
        ...rows.map((e) => e.join(','))
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `florax_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-16 text-center shadow-xs">
        <RefreshCw className="animate-spin text-[#2D5A27] mx-auto mb-3" size={28} />
        <p className="text-sm font-medium text-stone-700">Synthesizing Authoritative Florist Ledger & Analytics...</p>
        <p className="text-xs text-stone-400 mt-1">Reading real suborder sales, commissions, and repeat customer telemetry</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-12 text-center shadow-xs space-y-3">
        <p className="text-sm font-medium text-rose-700">{error || 'An error occurred while loading analytics.'}</p>
        <button
          onClick={() => loadReport(true)}
          className="bg-[#2D5A27] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#23471f] transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { financials, metrics, statusDistribution, weeklyTrend, productPerformance, reviewsSummary } = data;

  // Compute maximum daily revenue for chart scaling
  const maxWeeklyRevenue = Math.max(...weeklyTrend.map((d) => d.revenue), 1000);

  return (
    <div className="space-y-6">
      {/* HEADER & CONTROLS */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-serif font-bold text-stone-900">Performance & Sales Analytics</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#2D5A27] border border-emerald-200 text-[10px] font-semibold">
              Authoritative Ledger
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Real-time financial performance, product popularity, and fulfillment intelligence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-1 border border-stone-200 rounded-xl p-1 bg-[#FAF9F6] text-xs">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'all', label: 'All Time' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setDateRange(t.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  dateRange === t.id
                    ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-200/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadReport(true)}
            disabled={refreshing}
            title="Refresh Data"
            className="p-2 rounded-xl border border-stone-200 hover:border-[#2D5A27] text-stone-600 hover:text-[#2D5A27] transition-colors bg-stone-50/50 cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-[#2D5A27]' : ''} />
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-[#FAF9F6] hover:bg-stone-100 border border-stone-200 text-stone-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-[#2D5A27] hover:bg-[#23471f] text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Printer size={13} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* CORE FINANCIAL OVERVIEW (AUTHORITATIVE KPIS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Gross Client Sales</span>
            <DollarSign size={16} className="text-[#2D5A27]" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900">
            KES {financials.totalGrossSales.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 pt-2 border-t border-stone-100">
            <span>Paid SubOrders:</span>
            <strong className="font-mono text-stone-800">{financials.paidOrdersCount}</strong>
          </div>
        </div>

        {/* Platform Commission */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Platform Commission</span>
            <Percent size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-700">
            KES {financials.totalCommissionDeducted.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 pt-2 border-t border-stone-100">
            <span>Platform Services:</span>
            <span className="text-stone-700 font-medium">Secured Payment & Ingress</span>
          </div>
        </div>

        {/* Net Florist Revenue */}
        <div className="bg-white rounded-2xl border border-[#2D5A27]/20 p-5 shadow-xs bg-emerald-50/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#2D5A27] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Net Florist Revenue</span>
            <ArrowUpRight size={16} />
          </div>
          <div className="text-2xl font-serif font-bold text-[#2D5A27]">
            KES {financials.totalNetRevenue.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 pt-2 border-t border-stone-100">
            <span>Avg Order Value:</span>
            <strong className="font-mono text-stone-800">KES {financials.averageOrderValue.toLocaleString()}</strong>
          </div>
        </div>

        {/* Fulfillment & Retention */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Client Retention & Quality</span>
            <Users size={16} className="text-[#C88A8A]" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900">
            {metrics.repeatCustomerRate}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 pt-2 border-t border-stone-100">
            <span>Fulfillment Rate:</span>
            <strong className="text-[#2D5A27] font-semibold">{metrics.fulfillmentRate}</strong>
          </div>
        </div>
      </div>

      {/* REVENUE TIMELINE & STATUS BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Visualizer Bar Chart */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-stone-800 text-sm">Revenue & Demand Trajectory</h3>
              <p className="text-[11px] text-stone-400">Daily gross turnover vs atelier net earnings</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#2D5A27]" />
                <span className="text-stone-600 text-[11px]">Gross Sales</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#C88A8A]" />
                <span className="text-stone-600 text-[11px]">Net Earnings</span>
              </div>
            </div>
          </div>

          {/* Custom Botanical Bar Visualizer */}
          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-stone-100">
            {weeklyTrend.map((day, idx) => {
              const grossHeightPct = Math.max(12, Math.round((day.revenue / maxWeeklyRevenue) * 100));
              const netHeightPct = Math.max(8, Math.round((day.netRevenue / maxWeeklyRevenue) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Hover Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-stone-900 text-white text-[10px] p-2 rounded-lg pointer-events-none whitespace-nowrap shadow-md">
                    <p className="font-semibold">{day.day} {day.date ? `(${day.date})` : ''}</p>
                    <p className="text-emerald-300">Gross: KES {day.revenue.toLocaleString()}</p>
                    <p className="text-rose-200">Net: KES {day.netRevenue.toLocaleString()}</p>
                    <p className="text-stone-400">{day.orders} orders</p>
                  </div>

                  <div className="w-full flex items-end justify-center space-x-1 h-full">
                    {/* Gross Bar */}
                    <div
                      style={{ height: `${grossHeightPct}%` }}
                      className="w-full max-w-[18px] bg-[#2D5A27] rounded-t-md transition-all group-hover:brightness-110"
                    />
                    {/* Net Bar */}
                    <div
                      style={{ height: `${netHeightPct}%` }}
                      className="w-full max-w-[18px] bg-[#C88A8A] rounded-t-md transition-all group-hover:brightness-110"
                    />
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium mt-2 block">{day.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[11px] text-stone-400 pt-1">
            <span>Period Total Gross: <strong className="text-stone-700">KES {financials.totalGrossSales.toLocaleString()}</strong></span>
            <span>Completed Deliveries: <strong className="text-[#2D5A27]">{statusDistribution['delivered'] || 0}</strong></span>
          </div>
        </div>

        {/* Fulfillment Status Distribution */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-serif font-bold text-stone-800 text-sm mb-1">Order Pipeline Health</h3>
            <p className="text-[11px] text-stone-400 mb-4">Real-time fulfillment distribution</p>

            <div className="space-y-3">
              {[
                { key: 'delivered', label: 'Delivered to Recipient', color: 'bg-[#2D5A27]', text: 'text-[#2D5A27]' },
                { key: 'out_for_delivery', label: 'Out for Courier Delivery', color: 'bg-sky-600', text: 'text-sky-700' },
                { key: 'ready_for_pickup', label: 'Ready for Pickup / Dispatch', color: 'bg-indigo-600', text: 'text-indigo-700' },
                { key: 'preparing', label: 'Arranging in Atelier', color: 'bg-amber-500', text: 'text-amber-700' },
                { key: 'received', label: 'New / Order Confirmed', color: 'bg-emerald-600', text: 'text-emerald-700' },
                { key: 'rejected', label: 'Rejected / Cancelled', color: 'bg-rose-500', text: 'text-rose-700' }
              ].map((st) => {
                const count = (statusDistribution[st.key] || 0) + (st.key === 'in_transit' ? (statusDistribution['out_for_delivery'] || 0) : 0);
                const total = Math.max(1, financials.totalOrdersCount);
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={st.key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-600 font-medium">{st.label}</span>
                      <span className="font-mono text-stone-800 font-bold">{count}</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className={`h-full rounded-full ${st.color}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Customer Rating Avg:</span>
            <div className="flex items-center space-x-1 text-amber-500 font-bold">
              <Star size={13} fill="currentColor" />
              <span>{reviewsSummary.averageRating.toFixed(1)} / 5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* BEST SELLING FLORAL ARRANGEMENTS */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
          <div>
            <h3 className="font-serif font-bold text-stone-800 text-sm">Best-Selling Floral Arrangements</h3>
            <p className="text-[11px] text-stone-400">Detailed volume and revenue attribution per catalog item</p>
          </div>
          <span className="text-xs text-stone-500 font-mono">
            {productPerformance.length} items catalogued
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-100 text-stone-400 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Rank & Arrangement</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Units Sold</th>
                <th className="py-2.5 px-3 text-right">Gross Turnover</th>
                <th className="py-2.5 px-3 text-right">Net Atelier Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {productPerformance.map((item, index) => (
                <tr key={item.productId || index} className="hover:bg-[#FAF9F6]/60 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center font-mono ${
                          index === 0
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : index === 1
                            ? 'bg-stone-200 text-stone-800'
                            : index === 2
                            ? 'bg-orange-100 text-orange-900'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="font-serif font-bold text-stone-900 text-xs">{item.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-medium">
                      {item.category || 'Arrangements'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-stone-800">
                    {item.unitsSold || 0}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-stone-900">
                    KES {(item.grossSales || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#2D5A27]">
                    KES {(item.netRevenue || 0).toLocaleString()}
                  </td>
                </tr>
              ))}

              {productPerformance.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400 text-xs italic">
                    No product sales records found for this period.
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
