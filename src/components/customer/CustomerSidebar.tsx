import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Heart,
  MapPin,
  MessageSquare,
  Bell,
  Star,
  Award,
  Settings,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  X,
  Compass
} from 'lucide-react';

interface CustomerSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  badgeCounts?: {
    orders?: number;
    wishlist?: number;
    notifications?: number;
    points?: number;
  };
}

export default function CustomerSidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen = false,
  setIsMobileOpen,
  badgeCounts = {}
}: CustomerSidebarProps) {
  const navigationGroups = [
    {
      group: 'MAIN',
      items: [
        { id: 'overview', label: 'Overview Hub', icon: LayoutDashboard },
        { id: 'orders', label: 'Orders & Tracking', icon: Truck, badge: badgeCounts.orders },
        { id: 'wishlist', label: 'Wishlist Favorites', icon: Heart, badge: badgeCounts.wishlist },
        { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
        { id: 'inbox', label: 'Florist Messages', icon: MessageSquare },
      ]
    },
    {
      group: 'ENGAGEMENT',
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: badgeCounts.notifications },
        { id: 'reviews', label: 'Reviews & Feedback', icon: Star },
        { id: 'rewards', label: 'Rewards & Referrals', icon: Award, isPoints: true, points: badgeCounts.points },
      ]
    },
    {
      group: 'ACCOUNT',
      items: [
        { id: 'settings', label: 'Account & Security', icon: Settings },
      ]
    }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
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
                Customer Portal
              </span>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-serif text-emerald-300 font-bold text-lg mx-auto">
            ✿
          </div>
        )}

        {/* Mobile close button */}
        {isMobileOpen && setIsMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-[#2D5A27]/50 transition-colors md:hidden"
            title="Close Menu"
          >
            <X size={18} />
          </button>
        )}

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-[#2D5A27]/50 transition-colors hidden md:block"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

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
                  onClick={() => handleTabClick(item.id)}
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
                  {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 font-mono">
                      {item.badge}
                    </span>
                  )}
                  {!isCollapsed && item.isPoints && item.points !== undefined && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 font-mono">
                      {item.points} pts
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / Marketplace Quick Links */}
      <div className="p-3 border-t border-[#2D5A27]/60 bg-[#172e15]/30 space-y-1.5">
        <button
          onClick={() => (window.location.hash = '#/shop')}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 border border-stone-700/60 hover:border-emerald-500/50 rounded-xl text-xs text-stone-300 hover:text-white hover:bg-[#2D5A27]/30 transition-all"
        >
          <ShoppingBag size={14} className="text-emerald-400" />
          {!isCollapsed && <span className="font-medium">Browse Bouquets</span>}
        </button>
        <button
          onClick={() => (window.location.hash = '#/')}
          className="w-full flex items-center justify-center space-x-2 py-1.5 px-3 rounded-xl text-[11px] text-stone-400 hover:text-stone-200 transition-colors"
        >
          <Compass size={13} className="text-emerald-400/80" />
          {!isCollapsed && <span>Return to Storefront</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:flex bg-[#1e3a1b] text-stone-100 flex-col h-screen sticky top-0 transition-all duration-300 z-30 border-r border-[#2D5A27]/40 shadow-xl ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer & Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#1e3a1b] text-stone-100 shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
