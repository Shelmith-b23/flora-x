import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  ShieldCheck,
  Award,
  LogOut,
  ShoppingBag,
  Menu,
  Sparkles
} from 'lucide-react';

interface CustomerHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadNotificationsCount?: number;
  pointsBalance?: number;
  onOpenMobileMenu?: () => void;
}

export default function CustomerHeader({
  activeTab,
  setActiveTab,
  unreadNotificationsCount = 0,
  pointsBalance = 50,
  onOpenMobileMenu
}: CustomerHeaderProps) {
  const { user, logout } = useAuth();

  const getTabDetails = () => {
    switch (activeTab) {
      case 'overview':
        return {
          title: 'Customer Dashboard',
          subtitle: 'Welcome to your Rift Valley floriculture member lounge'
        };
      case 'orders':
        return {
          title: 'Orders & Deliveries',
          subtitle: 'Real-time cold-chain tracking, courier notes & fulfillment history'
        };
      case 'wishlist':
        return {
          title: 'Wishlist & Favorites',
          subtitle: 'Curated artisanal arrangements saved for your special occasions'
        };
      case 'addresses':
        return {
          title: 'Saved Delivery Addresses',
          subtitle: 'Manage verified doorstep dispatch coordinates across Kenya'
        };
      case 'inbox':
        return {
          title: 'Guild Communications',
          subtitle: 'Direct messaging with partner florists & custom arrangement queries'
        };
      case 'notifications':
        return {
          title: 'Notifications & Alerts',
          subtitle: 'Courier dispatch milestones, price updates & seasonal releases'
        };
      case 'reviews':
        return {
          title: 'Reviews & Feedback',
          subtitle: 'Share your verified botanical experience with partner florists'
        };
      case 'rewards':
        return {
          title: 'Loyalty Rewards & Referrals',
          subtitle: 'Earn bouquet points, unlock guild vouchers & invite friends'
        };
      case 'settings':
        return {
          title: 'Account & Security Settings',
          subtitle: 'Update personal credentials, privacy preferences & data export'
        };
      default:
        return {
          title: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
          subtitle: 'Flora_X Member Services'
        };
    }
  };

  const { title, subtitle } = getTabDetails();

  const userInitial = user?.profile?.firstName ? user.profile.firstName.charAt(0).toUpperCase() : 'C';

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-stone-200/80 py-3.5 px-4 sm:px-6 md:px-8 flex justify-between items-center z-20 sticky top-0 shadow-xs">
      {/* Left: Mobile Menu Toggle & Title Header */}
      <div className="flex items-center space-x-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors md:hidden"
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>
        )}
        <div>
          <h1 className="text-lg sm:text-xl font-serif font-bold text-stone-800 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-[11px] text-stone-500 font-sans hidden sm:block mt-0.5 truncate max-w-md">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls & User Info */}
      <div className="flex items-center space-x-2.5 sm:space-x-4">
        {/* Quick Shop Button */}
        <button
          onClick={() => (window.location.hash = '#/shop')}
          className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#2D5A27] text-xs font-semibold border border-emerald-200 transition-colors"
          title="Browse catalog"
        >
          <ShoppingBag size={14} />
          <span>Shop Bouquets</span>
        </button>

        {/* Loyalty Points Pill */}
        <div
          onClick={() => setActiveTab('rewards')}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 cursor-pointer hover:bg-amber-100 transition-colors"
          title="View Loyalty Rewards"
        >
          <Award size={13} className="text-amber-600" />
          <span className="font-mono">{pointsBalance}</span>
          <span className="text-[10px] text-amber-700 font-normal uppercase tracking-wider">pts</span>
        </div>

        {/* Verified Member Badge */}
        {user?.isVerified && (
          <span className="hidden xl:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Verified</span>
          </span>
        )}

        {/* Notifications Icon Button */}
        <button
          onClick={() => setActiveTab('notifications')}
          className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors relative"
          title="View Notifications"
        >
          <Bell size={18} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white ring-1 ring-rose-200 animate-pulse" />
          )}
        </button>

        {/* User Profile Info Pill */}
        <div className="flex items-center space-x-2 pl-2 border-l border-stone-200">
          <div className="w-8 h-8 rounded-full bg-[#2D5A27] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {userInitial}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="font-semibold text-xs text-stone-800 leading-tight">
              {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim() : user?.email}
            </span>
            <span className="text-[10px] text-stone-500 font-medium capitalize">
              Customer Member
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center space-x-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
          title="Sign Out"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
