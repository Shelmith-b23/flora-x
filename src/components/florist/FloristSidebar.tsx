import React from 'react';
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  Box,
  ClipboardList,
  Users,
  MessageSquare,
  Star,
  Tag,
  Wallet,
  TrendingUp,
  Sparkles,
  Settings,
  Eye,
  ChevronRight,
  ChevronLeft,
  Lock
} from 'lucide-react';

interface FloristSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  verificationStatus?: string;
}

export default function FloristSidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  verificationStatus = 'approved'
}: FloristSidebarProps) {
  const isRestricted = verificationStatus === 'suspended' || verificationStatus === 'rejected';

  const navigationGroups = [
    {
      group: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'shop', label: 'Shop Management', icon: Store, isNewBadge: true },
        { id: 'products', label: 'Products', icon: ShoppingBag },
        { id: 'inventory', label: 'Inventory', icon: Box },
        { id: 'orders', label: 'Orders', icon: ClipboardList },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'chat', label: 'Messages', icon: MessageSquare },
      ]
    },
    {
      group: 'GROWTH',
      items: [
        { id: 'reviews', label: 'Reviews', icon: Star },
        { id: 'discounts', label: 'Discounts', icon: Tag },
        { id: 'analytics', label: 'Reports', icon: TrendingUp },
      ]
    },
    {
      group: 'FINANCE',
      items: [
        { id: 'wallet', label: 'Wallet & Payouts', icon: Wallet },
      ]
    },
    {
      group: 'CREATIVE',
      items: [
        { id: 'ai', label: 'AI Design Center', icon: Sparkles },
      ]
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Account Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside
      className={`bg-[#1e3a1b] text-stone-100 flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 border-r border-[#2D5A27]/40 shadow-xl ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand & Toggle Header */}
      <div className="p-4 flex items-center justify-between border-b border-[#2D5A27]/60 bg-[#172e15]/50">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-serif text-emerald-300 font-bold text-lg shadow-inner">
              ✿
            </div>
            <div>
              <span className="font-serif tracking-wide text-base font-bold text-stone-50 block leading-tight">
                Flora_X
              </span>
              <span className="text-[10px] text-emerald-300 font-sans uppercase tracking-widest block font-medium">
                Florist Partner
              </span>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-serif text-emerald-300 font-bold text-lg mx-auto">
            ✿
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-[#2D5A27]/50 transition-colors hidden md:block"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Account Status Alert Mini Bar if Restricted */}
      {!isCollapsed && isRestricted && (
        <div className="mx-3 mt-3 p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
          <Lock size={14} className="text-rose-400 shrink-0" />
          <span className="text-[11px] font-medium leading-snug">
            {verificationStatus === 'suspended' ? 'Account Suspended' : 'Application Rejected'} (Read-Only)
          </span>
        </div>
      )}

      {/* Navigation Groups */}
      <nav className="flex-1 py-3 space-y-4 overflow-y-auto px-3 scrollbar-thin scrollbar-thumb-emerald-900">
        {navigationGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-semibold text-emerald-400/80 uppercase tracking-wider font-mono">
                {group.group}
              </h3>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#2D5A27] text-white shadow-md border border-emerald-400/30'
                      : 'text-stone-300 hover:bg-[#2D5A27]/40 hover:text-white'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  title={item.label}
                >
                  <Icon
                    size={18}
                    className={`${
                      isActive ? 'text-emerald-300' : 'text-emerald-400/70 group-hover:text-emerald-300'
                    } shrink-0`}
                  />
                  {!isCollapsed && (
                    <span className="flex-1 text-left truncate tracking-wide">{item.label}</span>
                  )}
                  {!isCollapsed && item.isNewBadge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      NEW
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / Store Link */}
      <div className="p-3 border-t border-[#2D5A27]/60 bg-[#172e15]/30">
        <button
          onClick={() => (window.location.hash = '#/')}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 border border-stone-700/60 hover:border-emerald-500/50 rounded-xl text-xs text-stone-300 hover:text-white hover:bg-[#2D5A27]/30 transition-all"
        >
          <Eye size={14} className="text-emerald-400" />
          {!isCollapsed && <span className="font-medium">View Marketplace</span>}
        </button>
      </div>
    </aside>
  );
}
