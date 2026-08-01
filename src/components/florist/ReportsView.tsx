import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, RefreshCw, BarChart3, PieChart, ShoppingBag, DollarSign } from 'lucide-react';

export default function ReportsView() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/v1/florist/analytics')
      .then((r) => {
        setAnalytics(r.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load analytics:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-xs">
        <RefreshCw className="animate-spin text-[#2D5A27] mx-auto mb-3" size={28} />
        <p className="text-sm font-medium text-stone-600">Loading Commercial Reports & Sales Performance...</p>
      </div>
    );
  }

  const weeklyTrend = analytics?.weeklyTrend || [
    { day: 'Mon', revenue: 12500, orders: 3 },
    { day: 'Tue', revenue: 18000, orders: 4 },
    { day: 'Wed', revenue: 22000, orders: 5 },
    { day: 'Thu', revenue: 15500, orders: 3 },
    { day: 'Fri', revenue: 34000, orders: 8 },
    { day: 'Sat', revenue: 42000, orders: 11 },
    { day: 'Sun', revenue: 28000, orders: 6 },
  ];

  const maxRevenue = Math.max(...weeklyTrend.map((t: any) => t.revenue || 1));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-lg font-serif font-bold text-stone-800">Commercial Reports & Analytics</h2>
          <p className="text-xs text-stone-500">Analyze order volume trends, revenue growth, and category performance.</p>
        </div>
      </div>

      {/* Weekly Revenue Trend Chart */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-stone-800 text-sm">Weekly Gross Revenue Trend (KES)</h3>
        <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-stone-100 pb-2">
          {weeklyTrend.map((t: any, idx: number) => {
            const heightPercent = Math.max(12, Math.round((t.revenue / maxRevenue) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-mono font-bold text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  {t.revenue?.toLocaleString()}
                </span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[40px] bg-[#2D5A27] hover:bg-emerald-700 rounded-t-lg transition-all"
                />
                <span className="text-xs font-semibold text-stone-600">{t.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Average Order Value</span>
          <span className="text-2xl font-serif font-bold text-stone-800">
            KES {analytics?.averageOrderValue?.toLocaleString() || '4,250'}
          </span>
          <p className="text-[11px] text-stone-500">Per bouquet transaction</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Repeat Buyer Rate</span>
          <span className="text-2xl font-serif font-bold text-stone-800">
            {analytics?.repeatCustomerRate || '34%'}
          </span>
          <p className="text-[11px] text-stone-500">Loyal repeat clients</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Fulfillment Efficiency</span>
          <span className="text-2xl font-serif font-bold text-stone-800">
            {analytics?.fulfillmentRate || '98.5%'}
          </span>
          <p className="text-[11px] text-stone-500">On-time delivery success</p>
        </div>
      </div>
    </div>
  );
}
