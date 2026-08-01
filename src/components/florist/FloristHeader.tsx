import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, ShieldCheck, AlertCircle, ShieldAlert, LogOut, Store } from 'lucide-react';

interface FloristHeaderProps {
  activeTab: string;
  storeName?: string;
  verificationStatus?: 'approved' | 'pending_review' | 'suspended' | 'rejected' | 'inactive';
}

export default function FloristHeader({ activeTab, storeName, verificationStatus = 'approved' }: FloristHeaderProps) {
  const { user, logout } = useAuth();

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Active Partner</span>
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertCircle size={14} className="text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <ShieldAlert size={14} className="text-rose-600" />
            <span>Account Suspended</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <ShieldAlert size={14} className="text-rose-600" />
            <span>Application Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            <span>{verificationStatus}</span>
          </span>
        );
    }
  };

  const formattedTabTitle = () => {
    switch (activeTab) {
      case 'shop':
        return 'Shop Management';
      case 'chat':
        return 'Messages';
      case 'analytics':
        return 'Reports & Analytics';
      case 'ai':
        return 'AI Design Studio';
      default:
        return activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-stone-200/80 py-4 px-6 md:px-8 flex justify-between items-center z-20 sticky top-0 shadow-xs">
      {/* Title & Store Name */}
      <div className="flex items-center space-x-3">
        <div>
          <h1 className="text-xl font-serif font-bold text-stone-800 tracking-tight">
            {formattedTabTitle()}
          </h1>
          {storeName && (
            <p className="text-xs text-stone-500 font-sans flex items-center space-x-1.5 mt-0.5">
              <Store size={12} className="text-[#2D5A27]" />
              <span className="font-medium text-stone-700">{storeName}</span>
            </p>
          )}
        </div>
      </div>

      {/* Right Controls & User Info */}
      <div className="flex items-center space-x-4">
        {/* Status Badge */}
        <div className="hidden sm:block">
          {getStatusBadge()}
        </div>

        {/* Notifications Icon Button */}
        <button
          className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors relative"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2D5A27]" />
        </button>

        {/* User Profile Info */}
        <div className="hidden md:flex flex-col text-right pl-2 border-l border-stone-200">
          <span className="font-semibold text-xs text-stone-800">
            {user?.profile?.first_name ? `${user.profile.first_name} ${user.profile.last_name || ''}` : user?.email}
          </span>
          <span className="text-[10px] text-stone-500 capitalize">{user?.role || 'Florist Owner'}</span>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
          title="Sign Out"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
