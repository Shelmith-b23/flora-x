import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';

import FloristSidebar from '../components/florist/FloristSidebar';
import FloristHeader from '../components/florist/FloristHeader';

import DashboardView from '../components/florist/DashboardView';
import ShopManagementView from '../components/florist/ShopManagementView';
import ProductsView from '../components/florist/ProductsView';
import InventoryView from '../components/florist/InventoryView';
import OrdersView from '../components/florist/OrdersView';
import CustomersView from '../components/florist/CustomersView';
import MessagesView from '../components/florist/MessagesView';
import ReviewsView from '../components/florist/ReviewsView';
import DiscountsView from '../components/florist/DiscountsView';
import WalletView from '../components/florist/WalletView';
import ReportsView from '../components/florist/ReportsView';
import AIDesignCenterView from '../components/florist/AIDesignCenterView';
import SettingsView from '../components/florist/SettingsView';

import { FloristProfileData } from '../types';

export default function FloristPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState<FloristProfileData | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);

  // Role Protection
  useEffect(() => {
    if (!user) {
      window.location.hash = '#/login';
    } else if (user.role !== 'florist') {
      window.location.hash = '#/unauthorized';
    }
  }, [user]);

  // Load Florist Profile for header status badge & shop info
  useEffect(() => {
    if (user && user.role === 'florist') {
      axios
        .get('/api/v1/florist/profile')
        .then((res) => setProfile(res.data))
        .catch((err) => console.error('Failed to load florist profile in shell:', err));
    }
  }, [user]);

  if (!user || user.role !== 'florist') {
    return null;
  }

  const verificationStatus = profile?.verificationStatus || 'approved';
  const storeName = profile?.storeName || 'Florist Partner';

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-800 flex font-sans antialiased selection:bg-[#2D5A27] selection:text-white">
      {/* Editorial Botanical Sidebar */}
      <FloristSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        verificationStatus={verificationStatus}
      />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <FloristHeader
          activeTab={activeTab}
          storeName={storeName}
          verificationStatus={verificationStatus}
        />

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
              {activeTab === 'shop' && <ShopManagementView />}
              {activeTab === 'products' && <ProductsView verificationStatus={verificationStatus} />}
              {activeTab === 'inventory' && <InventoryView verificationStatus={verificationStatus} />}
              {activeTab === 'orders' && (
                <OrdersView
                  verificationStatus={verificationStatus}
                  initialOrderId={selectedOrderId}
                />
              )}
              {activeTab === 'customers' && (
                <CustomersView
                  setActiveTab={setActiveTab}
                  onSelectOrder={(orderId) => setSelectedOrderId(orderId)}
                  onSelectConvo={(convoId) => setSelectedConvoId(convoId)}
                  verificationStatus={verificationStatus}
                />
              )}
              {activeTab === 'chat' && (
                <MessagesView
                  verificationStatus={verificationStatus}
                  initialConvoId={selectedConvoId}
                  setActiveTab={setActiveTab}
                  onSelectOrder={(orderId) => setSelectedOrderId(orderId)}
                />
              )}
              {activeTab === 'reviews' && <ReviewsView verificationStatus={verificationStatus} />}
              {activeTab === 'discounts' && <DiscountsView verificationStatus={verificationStatus} />}
              {activeTab === 'wallet' && (
                <WalletView
                  verificationStatus={verificationStatus}
                  mpesaTillNumber={profile?.mpesaTillNumber}
                />
              )}
              {activeTab === 'analytics' && <ReportsView />}
              {activeTab === 'ai' && <AIDesignCenterView />}
              {activeTab === 'settings' && <SettingsView setActiveTab={setActiveTab} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
