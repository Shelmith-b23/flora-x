import React from 'react';
import {
  LayoutDashboard,
  Store,
  Users,
  ClipboardList,
  Wallet,
  Layers,
  Tag,
  Send,
  Sparkles,
  Settings,
  ShieldCheck,
  Eye,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  isSuperAdmin: boolean;
  badgeCounts?: {
    pendingFlorists?: number;
    pendingPayouts?: number;
    orders?: number;
    users?: number;
  };
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen = false,
  setIsMobileOpen,
  isSuperAdmin,
  badgeCounts = {}
}: AdminSidebarProps) {
  const navigationGroups = [
    {
      group: 'OPERATIONS',
      items: [
        { id: 'overview', label: 'Executive Metrics', icon: LayoutDashboard },
        { id: 'orders', label: 'Orders & Fulfillment', icon: ClipboardList, badge: badgeCounts.orders },
        { id: 'payouts', label: 'Vendor Payouts', icon: Wallet, badge: badgeCounts.pendingPayouts, badgeColor: 'amber' },
      ]
    },
    {
      group: 'DIRECTORY',
      items: [
        { id: 'florists', label: 'Florists & Vetting', icon: Store, badge: badgeCounts.pendingFlorists, badgeColor: 'rose' },
        { id: 'users', label: 'Identity Directory', icon: Users, badge: badgeCounts.users },
        { id: 'catalog', label: 'Catalog & Moderation', icon: Layers },
      ]
    },
    {
      group: 'MARKETING & AI',
      items: [
        { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
        { id: 'cms', label: 'CMS & Broadcasts', icon: Send },
        { id: 'ai', label: 'AI Intelligence', icon: Sparkles, isNewBadge: true },
      ]
    },
    {
      group: 'GOVERNANCE',
      items: [
        ...(isSuperAdmin ? [{ id: 'system', label: 'Platform Config', icon: Settings }] : []),
        { id: 'audit', label: 'Audit Inspector', icon: ShieldCheck },
      ]
    }
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
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
                {isSuperAdmin ? 'Super Admin Command' : 'Platform Operations'}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-serif text-emerald-300 font-bold text-lg mx-auto">
            ✿
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-[#2D5A27]/50 transition-colors hidden md:block"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Mobile Close Button */}
        {setIsMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-[#2D5A27]/50 transition-colors md:hidden"
            title="Close Menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Role Indicator Banner */}
      {!isCollapsed && (
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-[#172e15] border border-emerald-500/20 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span className="text-[11px] font-medium text-stone-200">
              {isSuperAdmin ? 'Master Root Access' : 'Administrative Scope'}
            </span>
          </div>
          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 font-bold">
            {isSuperAdmin ? 'SUPER' : 'ADMIN'}
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
                  onClick={() => handleSelect(item.id)}
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
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      AI
                    </span>
                  )}
                  {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        item.badgeColor === 'rose'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                          : item.badgeColor === 'amber'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Marketplace Link */}
      <div className="p-3 border-t border-[#2D5A27]/60 bg-[#172e15]/30">
        <button
          onClick={() => (window.location.hash = '#/')}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 border border-stone-700/60 hover:border-emerald-500/50 rounded-xl text-xs text-stone-300 hover:text-white hover:bg-[#2D5A27]/30 transition-all cursor-pointer"
        >
          <Eye size={14} className="text-emerald-400" />
          {!isCollapsed && <span className="font-medium">View Marketplace</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:flex bg-[#1e3a1b] text-stone-100 flex-col h-screen sticky top-0 transition-all duration-300 z-30 border-r border-[#2D5A27]/40 shadow-xl shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-[#1e3a1b] text-stone-100 flex flex-col h-full shadow-2xl z-10 border-r border-[#2D5A27]/40">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
