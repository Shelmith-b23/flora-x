import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  RefreshCw,
  LogOut,
  Menu
} from 'lucide-react';

interface AdminHeaderProps {
  activeTab: string;
  isSuperAdmin: boolean;
  loading: boolean;
  onRefresh: () => void;
  onOpenMobileMenu?: () => void;
}

export default function AdminHeader({
  activeTab,
  isSuperAdmin,
  loading,
  onRefresh,
  onOpenMobileMenu
}: AdminHeaderProps) {
  const { user, logout } = useAuth();

  const formattedTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Executive Metrics';
      case 'florists':
        return 'Florists & Partner Vetting';
      case 'users':
        return 'Identity & Access Directory';
      case 'orders':
        return 'Orders & Multi-Vendor Fulfillment';
      case 'payouts':
        return 'Vendor Payouts & Ledgers';
      case 'catalog':
        return 'Catalog Management & Moderation';
      case 'coupons':
        return 'Promotions & Discount Vouchers';
      case 'cms':
        return 'Editorial CMS & Push Broadcasts';
      case 'ai':
        return 'AI Marketplace Intelligence';
      case 'system':
        return 'System & Payment Gateway Configuration';
      case 'audit':
        return 'Platform Audit & Security Log';
      default:
        return activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.hash = '#/admin/login';
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-stone-200/80 py-4 px-4 sm:px-6 md:px-8 flex justify-between items-center z-20 sticky top-0 shadow-xs">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center space-x-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl md:hidden transition-colors"
            title="Open Menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div>
          <h1 className="text-xl font-serif font-bold text-stone-800 tracking-tight">
            {formattedTabTitle()}
          </h1>
          <p className="text-xs text-stone-500 font-sans flex items-center space-x-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-stone-600">Flora_X Operational Command</span>
          </p>
        </div>
      </div>

      {/* Right Controls & Admin Identity */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Status Badge */}
        <div className="hidden sm:block">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>{isSuperAdmin ? 'Super Admin Active' : 'System Operational'}</span>
          </span>
        </div>

        {/* Refresh Metrics Action Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 text-stone-600 hover:text-[#2D5A27] hover:bg-emerald-50/60 rounded-xl transition-colors relative disabled:opacity-50 cursor-pointer"
          title="Refresh Metrics"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin text-[#2D5A27]' : ''} />
        </button>

        {/* User Identity Chip */}
        <div className="hidden md:flex flex-col text-right pl-2 border-l border-stone-200">
          <span className="font-semibold text-xs text-stone-800 truncate max-w-[180px]">
            {user?.email || 'Administrator'}
          </span>
          <span className="text-[10px] text-emerald-700 font-mono font-bold uppercase tracking-wider">
            {isSuperAdmin ? 'SUPER ADMIN' : 'PLATFORM ADMIN'}
          </span>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
