import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, MapPin, Key, Trash2, AlertCircle, Plus, CheckCircle, Smartphone, Globe, LogOut,
  ShoppingBag, Heart, MessageSquare, Bell, Star, Award, Gift, Settings, ArrowRight,
  Truck, Calendar, Clipboard, Check, RefreshCw, Send, Paperclip, ChevronRight, Download, Info, Search, Filter, Edit3, Compass, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { MOCK_PRODUCTS } from '../data';
import CustomerSidebar from '../components/customer/CustomerSidebar';
import CustomerHeader from '../components/customer/CustomerHeader';

export default function Profile() {
  const { user, addresses, fetchAddresses, addAddress, updateProfile, logout } = useAuth();
  const { cart, wishlist, toggleWishlist, addToCart } = useApp();

  // Active Tab: 'overview' | 'orders' | 'wishlist' | 'addresses' | 'inbox' | 'notifications' | 'reviews' | 'rewards' | 'settings'
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load state and general messages
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tab 1: Overview Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState({
    pointsBalance: 50,
    activeDeliveriesCount: 0,
    successfulReferralsCount: 1,
    recentOrder: null as any
  });

  // Tab 2: Orders States
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderFilter, setOrderFilter] = useState<string>('all'); // 'all' | 'active' | 'completed' | 'cancelled'
  const [newOrderNote, setNewOrderNote] = useState<string>('');
  const [isUpdatingNote, setIsUpdatingNote] = useState<string | null>(null);

  // Tab 3: Wishlist items state matching MOCK_PRODUCTS
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  // Tab 4: Addresses States
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [showAddAddrForm, setShowAddAddrForm] = useState(false);
  const [label, setLabel] = useState('Home');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Nairobi');
  const [latitude, setLatitude] = useState(-1.2921);
  const [longitude, setLongitude] = useState(36.8219);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Tab 5: Inbox States
  const [activeContact, setActiveContact] = useState<string>('f1');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentProgress, setAttachmentProgress] = useState(0);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  // Tab 6: Notifications States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifFilter, setNotifFilter] = useState<string>('all');

  // Tab 7: Reviews States
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewProduct, setReviewProduct] = useState('p1');
  const [reviewFlorist, setReviewFlorist] = useState('f1');

  // Tab 8: Rewards & Referrals States
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState<any>({ totalInvited: 0, successfulOrders: 0, totalPointsEarned: 0 });
  const [referralLink, setReferralLink] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  // Tab 9: Settings States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Time of day greeting
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good Morning');
    else if (hours < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    if (user) {
      setFirstName(user.profile.firstName || '');
      setLastName(user.profile.lastName || '');
      setPhoneNumber(user.profile.phoneNumber || '');
      loadAllPortalData();
    }
  }, [user, activeTab]);

  if (!user) {
    window.location.hash = '#/login';
    return null;
  }

  // Unified loader for all portal database queries
  const loadAllPortalData = async () => {
    try {
      setLoadingPortal(true);
      await fetchAddresses();

      // Get Orders
      const ordsResp = await axios.get('/api/v1/customer/orders').catch(() => ({ data: [] }));
      const orderList = Array.isArray(ordsResp.data) ? ordsResp.data : [];
      setOrders(orderList);

      // Get Wishlist
      const wlResp = await axios.get('/api/v1/customer/wishlist').catch(() => ({ data: [] }));
      const wishlistedData = Array.isArray(wlResp.data) ? wlResp.data : [];
      // Match with MOCK_PRODUCTS
      const matchedWL = MOCK_PRODUCTS.filter(p => wishlistedData.some((w: any) => w.productId === p.id));
      setWishlistItems(matchedWL);

      // Get Messages
      const msgResp = await axios.get('/api/v1/customer/messages').catch(() => ({ data: [] }));
      setMessages(Array.isArray(msgResp.data) ? msgResp.data : []);

      // Get Notifications
      const notifResp = await axios.get('/api/v1/customer/notifications').catch(() => ({ data: [] }));
      setNotifications(Array.isArray(notifResp.data) ? notifResp.data : []);

      // Get Reviews
      const revsResp = await axios.get('/api/v1/customer/reviews').catch(() => ({ data: [] }));
      setReviews(Array.isArray(revsResp.data) ? revsResp.data : []);

      // Get Rewards Points History & Balance
      const rewResp = await axios.get('/api/v1/customer/rewards').catch(() => ({ data: { balance: 50, history: [] } }));
      setPointsHistory(rewResp.data.history || []);
      setDashboardStats(prev => ({ ...prev, pointsBalance: rewResp.data.balance || 50 }));

      // Get Referral stats
      const refResp = await axios.get('/api/v1/customer/referrals').catch(() => ({ data: {} }));
      setReferralsList(refResp.data.invitedFriends || []);
      setReferralStats(refResp.data.statistics || { totalInvited: 0, successfulOrders: 0, totalPointsEarned: 0 });
      setReferralCode(refResp.data.referralCode || '');
      setReferralLink(refResp.data.referralLink || '');

      // Compute general summary indicators
      const activeDeliveries = orderList.filter((o: any) => ['order_received', 'preparing', 'ready', 'out_for_delivery'].includes(o.status));
      setDashboardStats(prev => ({
        ...prev,
        activeDeliveriesCount: activeDeliveries.length,
        recentOrder: orderList[0] || null
      }));

      setLoadingPortal(false);
    } catch (err: any) {
      console.error('Portal sync error:', err);
      setLoadingPortal(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await updateProfile({ firstName, lastName, phoneNumber });
      setSuccessMsg('Your profile profile metadata has been refreshed.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Profile save failed.');
    }
  };

  // Addresses addition
  const handleAddressAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await addAddress({ label, streetAddress, city, latitude, longitude, deliveryInstructions, isDefault });
      setSuccessMsg('New physical delivery node added to address book.');
      setStreetAddress('');
      setDeliveryInstructions('');
      setIsDefault(false);
      setShowAddAddrForm(false);
      await loadAllPortalData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register address.');
    }
  };

  // Addresses editing
  const handleAddressEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await axios.put(`/api/v1/customer/addresses/${editingAddress.id}`, editingAddress);
      setSuccessMsg('Saved address node refreshed.');
      setEditingAddress(null);
      await loadAllPortalData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to edit address.');
    }
  };

  // Addresses deletion
  const handleAddressDelete = async (id: string) => {
    if (!confirm('Are you sure you want to drop this delivery address?')) return;
    try {
      await axios.delete(`/api/v1/customer/addresses/${id}`);
      setSuccessMsg('Address node purged successfully.');
      await loadAllPortalData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg('Failed to drop address node.');
    }
  };

  // Order cancelling
  const handleOrderCancel = async (id: string) => {
    if (!confirm('Cancel this arrangement booking? If paid, a full STK refund request will be initiated.')) return;
    try {
      await axios.post(`/api/v1/customer/orders/${id}/cancel`);
      setSuccessMsg('Booking cancelled. M-Pesa STK roll-back sequence queued.');
      setSelectedOrder(null);
      await loadAllPortalData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg('Cancellation sequence failed.');
    }
  };

  // Request refund
  const handleRequestRefund = async (id: string) => {
    try {
      await axios.post(`/api/v1/customer/orders/${id}/refund`);
      setSuccessMsg('Your cold-chain refund inquiry has been registered.');
      await loadAllPortalData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg('Refund request failed.');
    }
  };

  // Update order special notes
  const handleUpdateOrderNotes = async (id: string) => {
    try {
      await axios.post(`/api/v1/customer/orders/${id}/notes`, { note: newOrderNote });
      setSuccessMsg('Courier notes successfully updated on active courier terminal.');
      setIsUpdatingNote(null);
      await loadAllPortalData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg('Notes update failed.');
    }
  };

  // Order reordering / Duplicate order booking
  const handleOrderReorder = async (id: string) => {
    try {
      const resp = await axios.post(`/api/v1/customer/orders/${id}/reorder`);
      setSuccessMsg('Duplicate bouquet booking registered successfully.');
      setActiveTab('orders');
      await loadAllPortalData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg('Reordering failed.');
    }
  };

  // Sending message to florist
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() && !attachedFile) return;

    try {
      const messagePayload = {
        conversationId: user.id,
        recipientId: activeContact,
        content: newMessageText,
        imageUrl: attachedFile
      };

      await axios.post('/api/v1/customer/messages', messagePayload);
      setNewMessageText('');
      setAttachedFile(null);
      
      // Instantly refresh local lists
      const msgResp = await axios.get('/api/v1/customer/messages');
      setMessages(msgResp.data);

      // Fast auto-scroll chat
      setTimeout(() => {
        const el = document.getElementById('chat-window-inner');
        if (el) el.scrollTop = el.scrollHeight;
      }, 200);

      // Automated live-feedback chat simulation triggers notification refresh in 2 seconds
      setTimeout(async () => {
        const refreshResp = await axios.get('/api/v1/customer/messages');
        setMessages(refreshResp.data);
        const el = document.getElementById('chat-window-inner');
        if (el) el.scrollTop = el.scrollHeight;
      }, 2100);

    } catch (err) {
      setErrorMsg('Failed to transmit message.');
    }
  };

  // Simulated layout file attachment progress
  const handleAttachMockLayout = () => {
    setIsUploadingAttachment(true);
    setAttachmentProgress(0);
    const interval = setInterval(() => {
      setAttachmentProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploadingAttachment(false);
          setAttachedFile('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200&auto=format&fit=crop&q=60');
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  // Mark dynamic notifications as read
  const handleMarkNotifRead = async (id: string) => {
    try {
      await axios.post(`/api/v1/customer/notifications/${id}/read`);
      await loadAllPortalData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotif = async (id: string) => {
    try {
      await axios.delete(`/api/v1/customer/notifications/${id}`);
      await loadAllPortalData();
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Product/Florist reviews
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const selectedProd = MOCK_PRODUCTS.find(p => p.id === reviewProduct);
      const payload = {
        rating,
        comment,
        productId: reviewProduct,
        productName: selectedProd?.title || 'Floral Arrangement',
        floristId: selectedProd?.floristId || 'f1',
        floristName: selectedProd?.floristName || 'Flora_X Florist'
      };

      await axios.post('/api/v1/customer/reviews', payload);
      setSuccessMsg('Botanical designer feedback successfully registered.');
      setComment('');
      await loadAllPortalData();
      
      // Refresh florist feedback in 5 seconds
      setTimeout(async () => {
        await loadAllPortalData();
      }, 5000);

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Failed to register review.');
    }
  };

  // Redeem Reward Point Coupons
  const handleRedeemReward = async (pointsCost: number, title: string) => {
    if (dashboardStats.pointsBalance < pointsCost) {
      alert(`You need ${pointsCost} points to redeem this reward. Settle more arrangements to collect points!`);
      return;
    }

    try {
      // Simulate coupon generation
      const code = 'REDEEM-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      // Deduct points locally and alert user
      alert(`🎉 Congratulations! You have redeemed "${title}".\nYour Coupon Code is: ${code} (copied to clipboard!).`);
      navigator.clipboard.writeText(code);
      
      // Log point redemption
      // In a real app we'd trigger a POST, let's update profile point count via API / customer profiles
      setDashboardStats(prev => ({ ...prev, pointsBalance: prev.pointsBalance - pointsCost }));
    } catch {
      setErrorMsg('Redemption error.');
    }
  };

  // Referral Invite
  const handleReferralInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await axios.post('/api/v1/customer/referrals/invite', { email: inviteEmail });
      setSuccessMsg(`Rift Valley invite dispatched to ${inviteEmail}.`);
      setInviteEmail('');
      setInviting(false);
      await loadAllPortalData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrorMsg('Failed to invite friend.');
      setInviting(false);
    }
  };

  // Portability - Export Personal Data Bundle
  const handleExportPersonalData = async () => {
    try {
      const resp = await axios.post('/api/v1/customer/export-data');
      const dataStr = JSON.stringify(resp.data.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'FloraX_Personal_Data_Registry.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setSuccessMsg('Your personal data bundle has been compiled and downloaded.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrorMsg('Data export failed.');
    }
  };

  // Password Modification
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    try {
      await axios.put('/api/v1/customer/change-password', { currentPassword, newPassword });
      setSuccessMsg('Security credentials refreshed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Password update failed.');
    }
  };

  // Request permanent account deletion
  const handlePermanentAccountDeletion = async () => {
    try {
      await axios.delete('/api/v1/customer/delete-account');
      alert('Your account and Rift Valley registry items have been permanently deleted. Goodbye!');
      logout();
    } catch {
      setErrorMsg('Account deletion request failed.');
    }
  };

  // Filter orders according to selected state
  const getFilteredOrders = () => {
    if (orderFilter === 'all') return orders;
    if (orderFilter === 'active') {
      return orders.filter(o => ['order_received', 'preparing', 'ready', 'out_for_delivery'].includes(o.status));
    }
    if (orderFilter === 'completed') {
      return orders.filter(o => o.status === 'delivered');
    }
    if (orderFilter === 'cancelled') {
      return orders.filter(o => o.status === 'cancelled' || o.status === 'refunded');
    }
    return orders;
  };

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;
  const badgeCounts = {
    orders: dashboardStats.activeDeliveriesCount,
    wishlist: wishlistItems.length,
    notifications: unreadNotifsCount,
    points: dashboardStats.pointsBalance
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-800 flex font-sans antialiased selection:bg-[#2D5A27] selection:text-white" id="customer-portal-root">
      {/* Editorial Botanical Customer Sidebar */}
      <CustomerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        badgeCounts={badgeCounts}
      />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Header Bar */}
        <CustomerHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadNotificationsCount={unreadNotifsCount}
          pointsBalance={dashboardStats.pointsBalance}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* Main View Area with Smooth Transitions */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {/* Global Success / Error Toast Banners */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2.5 mb-6 shadow-xs max-w-7xl mx-auto"
              >
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-semibold flex items-center gap-2.5 mb-6 shadow-xs max-w-7xl mx-auto"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {loadingPortal ? (
            <div className="max-w-7xl mx-auto bg-white border border-stone-200/80 rounded-2xl p-16 text-center space-y-4 shadow-xs">
              <div className="w-10 h-10 border-4 border-[#2D5A27] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider font-mono">
                Loading your floral concierge portal...
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="max-w-7xl mx-auto space-y-6"
              >
                  
                  {/* TAB 1: OVERVIEW HUB */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      
                      {/* Metric cards grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        
                        <div className="bg-white border border-utility-border rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted block">Loyalty Balance</span>
                            <span className="text-2xl font-display font-extrabold text-brand-primary font-mono">{dashboardStats.pointsBalance} pts</span>
                            <span className="text-[10px] text-text-muted block">Gold Botanical Tier</span>
                          </div>
                          <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center">
                            <Award className="w-6 h-6" />
                          </div>
                        </div>

                        <div className="bg-white border border-utility-border rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted block">Active Transits</span>
                            <span className="text-2xl font-display font-extrabold text-brand-secondary font-mono">{dashboardStats.activeDeliveriesCount} Shipment(s)</span>
                            <span className="text-[10px] text-text-muted block">Cold-Chain Temperature 4°C</span>
                          </div>
                          <div className="w-12 h-12 bg-brand-primary/10 text-brand-secondary rounded-xl flex items-center justify-center">
                            <Truck className="w-6 h-6" />
                          </div>
                        </div>

                        <div className="bg-white border border-utility-border rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted block">Referral Profits</span>
                            <span className="text-2xl font-display font-extrabold text-text-primary font-mono">{referralStats.totalPointsEarned} pts</span>
                            <span className="text-[10px] text-text-muted block">Code: {referralCode || 'FLORAX-MOCK'}</span>
                          </div>
                          <div className="w-12 h-12 bg-brand-primary/10 text-text-primary rounded-xl flex items-center justify-center">
                            <Gift className="w-6 h-6" />
                          </div>
                        </div>

                      </div>

                      {/* Recent shipment update box */}
                      <div className="bg-white border border-utility-border rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex justify-between items-center border-b border-utility-border pb-3">
                          <h3 className="font-display font-bold text-sm text-text-primary uppercase tracking-wider">Latest Order Tracker</h3>
                          <span onClick={() => { setActiveTab('orders'); }} className="text-xs font-bold text-brand-primary hover:underline cursor-pointer flex items-center gap-1">
                            View All Bookings <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        {dashboardStats.recentOrder ? (
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-canvas/40 p-4 rounded-2xl border border-utility-border">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-text-primary">{dashboardStats.recentOrder.id}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  dashboardStats.recentOrder.status === 'delivered' ? 'bg-utility-success/10 text-brand-primary' : 'bg-brand-primary/15 text-brand-primary'
                                }`}>
                                  {dashboardStats.recentOrder.status.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-xs text-text-secondary font-medium">Placed on: {new Date(dashboardStats.recentOrder.created_at).toLocaleDateString()}</p>
                              <p className="text-[11px] text-text-muted">Metropolitan Target: {dashboardStats.recentOrder.deliveryAddress?.streetAddress}</p>
                            </div>
                            <button
                              onClick={() => { setSelectedOrder(dashboardStats.recentOrder); setActiveTab('orders'); }}
                              className="px-4 py-2.5 bg-white border border-utility-border text-text-primary hover:bg-canvas font-bold text-xs uppercase tracking-wider rounded-lg transition-all"
                            >
                              Track Shipment Live
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-6 text-text-muted text-xs">
                            No arrangements ordered yet. Fill your shopping bag with highlands flowers!
                          </div>
                        )}
                      </div>

                      {/* AI recommendations bento widget */}
                      <div className="bg-white border border-utility-border rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 border-b border-utility-border pb-3">
                          <span className="w-2 h-2 bg-brand-primary rounded-full animate-ping" />
                          <h3 className="font-display font-bold text-sm text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                            AI Botanical Matchmaker
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                          {MOCK_PRODUCTS.slice(0, 2).map((prod) => (
                            <div key={prod.id} className="border border-utility-border rounded-2xl overflow-hidden hover:shadow-md transition-all bg-canvas/10 flex flex-col justify-between">
                              <div className="relative h-40">
                                <img src={prod.images[0]} alt="" className="w-full h-full object-cover" />
                                <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                                  {prod.category}
                                </div>
                              </div>
                              <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                                <div className="space-y-1.5">
                                  <h4 className="font-display font-bold text-xs text-text-primary">{prod.title}</h4>
                                  <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">{prod.description}</p>
                                  <div className="p-2 bg-brand-primary/5 rounded border border-brand-primary/10 text-[10px] text-brand-primary italic">
                                    💡 Matches your profile interest in volcanic soil Rift Valley lilies.
                                  </div>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-utility-border/50">
                                  <span className="font-mono text-xs font-extrabold text-brand-primary">KES {prod.price.toLocaleString()}</span>
                                  <button
                                    onClick={() => {
                                      addToCart(prod, 'Standard');
                                      alert(`${prod.title} added to shopping bag!`);
                                    }}
                                    className="px-3 py-1.5 bg-brand-primary text-white text-[10px] uppercase font-bold tracking-wider rounded"
                                  >
                                    Add to Bag
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: MY ORDERS & LIVE TIMELINE TRACKING */}
                  {activeTab === 'orders' && (
                    <div className="space-y-6">
                      
                      {!selectedOrder ? (
                        <div className="bg-white border border-utility-border rounded-3xl p-6 shadow-xs space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-utility-border pb-4">
                            <div>
                              <h3 className="font-display font-bold text-sm text-text-primary uppercase tracking-wider">Metropolitan Booking Ledger</h3>
                              <p className="text-xs text-text-muted">A comprehensive audit of active and archived floral transfers.</p>
                            </div>
                            
                            {/* Filters */}
                            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0 shrink-0">
                              {[
                                { id: 'all', label: 'All' },
                                { id: 'active', label: 'Active Transits' },
                                { id: 'completed', label: 'Completed' },
                                { id: 'cancelled', label: 'Cancelled' },
                              ].map((btn) => (
                                <button
                                  key={btn.id}
                                  onClick={() => setOrderFilter(btn.id)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                                    orderFilter === btn.id
                                      ? 'bg-brand-primary text-white'
                                      : 'bg-canvas text-text-secondary border border-utility-border hover:bg-canvas/80'
                                  }`}
                                >
                                  {btn.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Orders List */}
                          <div className="space-y-4 pt-2">
                            {getFilteredOrders().length === 0 ? (
                              <div className="text-center py-12 text-text-muted text-xs space-y-2">
                                <Clipboard className="w-10 h-10 mx-auto text-text-muted" />
                                <p>No flower orders matching filter parameters.</p>
                              </div>
                            ) : (
                              getFilteredOrders().map((ord) => (
                                <div key={ord.id} className="p-5 border border-utility-border rounded-2xl hover:border-brand-primary/40 transition-all bg-canvas/10 space-y-4">
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-utility-border pb-3">
                                    <div>
                                      <span className="font-mono text-xs font-bold text-text-primary">{ord.id}</span>
                                      <p className="text-[10px] text-text-muted">Placed: {new Date(ord.created_at).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                        ord.status === 'delivered' ? 'bg-utility-success/10 text-brand-primary' : ord.status === 'cancelled' ? 'bg-utility-error/10 text-brand-secondary' : 'bg-brand-primary/10 text-brand-primary'
                                      }`}>
                                        {ord.status.replace('_', ' ')}
                                      </span>
                                      <span className="font-mono font-bold text-xs text-text-primary">KES {ord.total.toLocaleString()}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    {ord.items.map((it: any, i: number) => (
                                      <div key={i} className="flex gap-3 text-xs">
                                        <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-canvas">
                                          <img src={it.product?.images?.[0] || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=100'} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                          <p className="font-bold text-text-primary">{it.product?.title}</p>
                                          <p className="text-[10px] text-text-muted">{it.size} • Qty: {it.quantity} • {it.floristName}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="flex justify-between items-center pt-2 border-t border-utility-border/60">
                                    <button
                                      onClick={() => handleOrderReorder(ord.id)}
                                      className="text-xs font-bold text-brand-primary hover:underline cursor-pointer flex items-center gap-1"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" /> Repeat Arrangement
                                    </button>
                                    
                                    <button
                                      onClick={() => setSelectedOrder(ord)}
                                      className="px-4 py-2 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                                    >
                                      Track Shipment & Details
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          
                          {/* Selected order visual tracker panel */}
                          <div className="bg-white border border-utility-border rounded-3xl p-6 shadow-xs space-y-4">
                            <div className="flex justify-between items-center border-b border-utility-border pb-3">
                              <button onClick={() => setSelectedOrder(null)} className="text-xs font-bold text-text-muted hover:text-text-primary uppercase tracking-wider">
                                ← Back to Booking Ledger
                              </button>
                              <span className="font-mono text-xs font-semibold text-text-primary">Order ID: {selectedOrder.id}</span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                              
                              {/* Left stepper tracker */}
                              <div className="lg:col-span-5 space-y-4 border-r border-utility-border/60 pr-2">
                                <h4 className="text-xs uppercase tracking-wider font-bold text-text-muted font-display">Tracking Timeline</h4>
                                
                                <div className="relative pl-6 space-y-6 border-l border-utility-border">
                                  {selectedOrder.statusTimeline.map((step: any, idx: number) => {
                                    const isComplete = step.completed || selectedOrder.status === step.status || (idx === 0) || (selectedOrder.status === 'delivered');
                                    return (
                                      <div key={idx} className="relative">
                                        <span className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] ${
                                          isComplete ? 'bg-brand-primary text-white animate-pulse' : 'bg-canvas text-text-muted border border-utility-border'
                                        }`}>
                                          {isComplete ? '✓' : idx + 1}
                                        </span>
                                        <div className="space-y-0.5">
                                          <p className={`text-xs font-semibold ${isComplete ? 'text-text-primary' : 'text-text-muted'}`}>{step.title}</p>
                                          <p className="text-[10px] text-text-muted leading-relaxed">{step.description}</p>
                                          {step.timestamp && (
                                            <span className="text-[9px] text-text-muted font-mono">{new Date(step.timestamp).toLocaleTimeString()}</span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Right courier delivery logistics card */}
                              <div className="lg:col-span-7 space-y-4">
                                <div className="flex justify-between items-center">
                                  <h4 className="text-xs uppercase tracking-wider font-bold text-text-muted font-display">Courier Delivery Information</h4>
                                  <span className="text-[10px] text-brand-primary font-bold font-mono px-2 py-0.5 bg-brand-primary/10 rounded-md">
                                    {selectedOrder.status === 'delivered' ? 'DELIVERED' : 'IN PROGRESS'}
                                  </span>
                                </div>

                                <div className="bg-canvas border border-utility-border rounded-2xl p-5 space-y-4">
                                  <div className="flex items-center gap-3 pb-3 border-b border-utility-border/60">
                                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                                      <Truck className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs font-bold text-text-primary">
                                        {selectedOrder.deliveryPartner || 'Direct Florist Courier Fleet'}
                                      </div>
                                      <div className="text-[11px] text-text-muted">
                                        Dedicated floral handling • Climate controlled transport
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="p-3 bg-white rounded-xl border border-utility-border/60 space-y-1">
                                      <span className="text-[10px] uppercase font-bold text-text-muted font-display block">Destination</span>
                                      <p className="font-semibold text-text-primary text-[11px] truncate">
                                        {selectedOrder.deliveryAddress?.streetAddress || 'Customer Address'}
                                      </p>
                                      <p className="text-[10px] text-text-muted">
                                        {selectedOrder.deliveryAddress?.city || 'Nairobi, Kenya'}
                                      </p>
                                    </div>

                                    <div className="p-3 bg-white rounded-xl border border-utility-border/60 space-y-1">
                                      <span className="text-[10px] uppercase font-bold text-text-muted font-display block">Scheduled Delivery</span>
                                      <p className="font-semibold text-text-primary text-[11px]">
                                        {selectedOrder.deliveryDate || 'Standard Delivery'}
                                      </p>
                                      <p className="text-[10px] text-text-muted">
                                        {selectedOrder.deliverySlot || 'Between 9:00 AM - 6:00 PM'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="p-3 bg-brand-primary/5 border border-brand-primary/15 rounded-xl text-[11px] text-text-secondary leading-relaxed flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
                                    <span>
                                      Freshness guarantee: Hand-arranged stems conditioned in preservative water solution for doorstep presentation.
                                    </span>
                                  </div>
                                </div>
                              </div>

                            </div>

                            {/* Additional metadata info inside order */}
                            <div className="border-t border-utility-border pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                              <div className="space-y-2">
                                <h5 className="font-bold text-text-primary uppercase tracking-wider text-[10px]">Arrangement Metadata</h5>
                                <div className="space-y-1 bg-canvas/30 p-3 rounded-xl border border-utility-border">
                                  <div className="flex justify-between">
                                    <span className="text-text-muted">Target Recipient Address:</span>
                                    <span className="font-semibold text-right">{selectedOrder.deliveryAddress?.streetAddress}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-text-muted">Gift Note Message:</span>
                                    <span className="font-semibold italic text-right">"{selectedOrder.cardMessage || 'No gift message'}"</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-text-muted">Logistics Instructions:</span>
                                    <span className="font-semibold text-right">{selectedOrder.deliveryInstructions || 'None'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h5 className="font-bold text-text-primary uppercase tracking-wider text-[10px]">Action Operations</h5>
                                
                                <div className="space-y-2">
                                  {/* Update Notes on-the-fly */}
                                  {isUpdatingNote ? (
                                    <div className="space-y-1.5 p-2 bg-canvas border border-utility-border rounded-xl">
                                      <textarea
                                        value={newOrderNote}
                                        onChange={(e) => setNewOrderNote(e.target.value)}
                                        rows={2}
                                        placeholder="Add guard instructions or delivery landmarks..."
                                        className="w-full p-2 border border-utility-border rounded-md text-xs resize-none focus:outline-hidden"
                                      />
                                      <div className="flex justify-end gap-1.5">
                                        <button onClick={() => setIsUpdatingNote(null)} className="px-2 py-1 text-[10px] text-text-muted uppercase font-bold">Cancel</button>
                                        <button onClick={() => handleUpdateOrderNotes(selectedOrder.id)} className="px-3 py-1 bg-brand-primary text-white rounded text-[10px] uppercase font-bold">Save Notes</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => { setIsUpdatingNote(selectedOrder.id); setNewOrderNote(selectedOrder.orderNotes || ''); }}
                                      className="w-full py-2 bg-white border border-utility-border text-text-secondary hover:bg-canvas rounded-lg font-semibold uppercase tracking-wider text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-brand-primary" />
                                      Modify Gate / Guard Instructions
                                    </button>
                                  )}

                                  {selectedOrder.status === 'order_received' && (
                                    <button
                                      onClick={() => handleOrderCancel(selectedOrder.id)}
                                      className="w-full py-2 border border-brand-secondary/20 hover:bg-brand-secondary/5 text-brand-secondary rounded-lg font-semibold uppercase tracking-wider text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Request 1-Click Cancellation
                                    </button>
                                  )}

                                  {selectedOrder.status === 'delivered' && (
                                    <button
                                      onClick={() => handleRequestRefund(selectedOrder.id)}
                                      className="w-full py-2 border border-utility-border hover:bg-canvas text-text-secondary rounded-lg font-semibold uppercase tracking-wider text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                      <AlertCircle className="w-3.5 h-3.5 text-brand-secondary" />
                                      Initiate Refund / Return Inquiry
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* TAB 3: WISHLIST FAVORITES */}
                  {activeTab === 'wishlist' && (
                    <div className="bg-white border border-utility-border rounded-3xl p-6 shadow-xs space-y-6">
                      <div>
                        <h3 className="font-display font-bold text-sm text-text-primary uppercase tracking-wider">Saved Arrangements</h3>
                        <p className="text-xs text-text-muted">Favorites stored persistently for quick metropolitan scheduling.</p>
                      </div>

                      {/* Wishlist Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        {wishlistItems.length === 0 ? (
                          <div className="md:col-span-2 text-center py-16 space-y-3 text-text-muted text-xs">
                            <Heart className="w-10 h-10 mx-auto text-text-muted" />
                            <p>Your saved favorites vault is empty.</p>
                            <button onClick={() => { window.location.hash = '#/shop'; }} className="px-4 py-2 bg-brand-primary text-white rounded text-[11px] font-bold uppercase tracking-wider">Browse Collections</button>
                          </div>
                        ) : (
                          wishlistItems.map((prod) => (
                            <div key={prod.id} className="p-4 border border-utility-border rounded-2xl flex gap-4 bg-canvas/15 items-center">
                              <div className="w-16 h-16 rounded-md overflow-hidden bg-canvas shrink-0">
                                <img src={prod.images[0]} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-grow min-w-0">
                                <h4 className="text-xs font-bold text-text-primary truncate">{prod.title}</h4>
                                <p className="text-[10px] text-text-muted">{prod.floristName}</p>
                                <span className="text-xs font-mono font-bold text-brand-primary mt-1 block">KES {prod.price.toLocaleString()}</span>
                              </div>
                              <div className="flex flex-col gap-2 shrink-0">
                                <button
                                  onClick={() => toggleWishlist(prod.id)}
                                  className="p-1.5 bg-brand-secondary/5 border border-brand-secondary/10 hover:bg-brand-secondary/10 rounded-full cursor-pointer text-brand-secondary"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    addToCart(prod, 'Standard');
                                    alert(`${prod.title} loaded to shopping bag!`);
                                  }}
                                  className="px-2.5 py-1.5 bg-brand-primary text-white text-[10px] uppercase font-bold rounded tracking-wider"
                                >
                                  Add to Bag
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Wishlist promotional alerts box */}
                      {wishlistItems.length > 0 && (
                        <div className="p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl text-xs space-y-1.5">
                          <span className="font-bold text-brand-primary uppercase tracking-wider text-[10px] font-display block">🔥 Active Florist Promotion Alerts</span>
                          <p className="text-text-secondary leading-relaxed">
                            Rift Valley Roses has updated prices for <strong>Imperial Safari Rose Bouquet</strong>. Double rewards points (+96 pts) are available for checkout in Nairobi metropolis before 6 PM today.
                          </p>
                        </div>
                      )}

                    </div>
                  )}

                  {/* TAB 4: SAVED ADDRESSES */}
                  {activeTab === 'addresses' && (
                    <div className="bg-white border border-utility-border rounded-3xl p-6 shadow-xs space-y-6">
                      
                      <div className="flex justify-between items-center border-b border-utility-border pb-3">
                        <div>
                          <h3 className="font-display font-bold text-sm text-text-primary uppercase tracking-wider">Metropolitan Address Book</h3>
                          <p className="text-xs text-text-muted">Register and coordinate default same-day delivery nodes.</p>
                        </div>
                        <button
                          onClick={() => { setShowAddAddrForm(!showAddAddrForm); setEditingAddress(null); }}
                          className="px-3.5 py-2 border border-brand-primary bg-brand-primary/5 rounded-lg text-xs font-bold uppercase tracking-wider text-brand-primary cursor-pointer transition-all hover:bg-brand-primary/10 flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4 text-brand-primary" /> Add Destination
                        </button>
                      </div>

                      {/* ADD NEW ADDRESS FORM */}
                      {showAddAddrForm && (
                        <form onSubmit={handleAddressAdd} className="p-5 border border-brand-primary/15 bg-brand-primary/5 rounded-2xl space-y-4">
                          <div className="flex justify-between items-center mb-1 border-b border-brand-primary/10 pb-2">
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-primary">Configure New Location Coordinates</span>
                            <button type="button" onClick={() => setShowAddAddrForm(false)} className="text-[10px] font-bold text-text-muted hover:text-text-primary uppercase">Cancel</button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1">
                                Destination Label
                              </label>
                              <select
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                className="w-full p-2.5 text-xs border border-utility-border rounded-md bg-white text-text-secondary font-semibold"
                              >
                                <option>Home</option>
                                <option>Work / Corporate</option>
                                <option>Gift Recipient</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1">
                                Metropolis City
                              </label>
                              <input
                                type="text"
                                required
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden text-text-secondary font-medium"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1">
                              Street Address / House / Landmark
                            </label>
                            <input
                              type="text"
                              required
                              value={streetAddress}
                              onChange={(e) => setStreetAddress(e.target.value)}
                              placeholder="e.g. Rhapta Road, Block B, Westlands Apartments"
                              className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden text-text-secondary"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1">
                                GPS Latitude coordinate
                              </label>
                              <input
                                type="number"
                                step="0.000001"
                                required
                                value={latitude}
                                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                                className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden text-text-secondary font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1">
                                GPS Longitude coordinate
                              </label>
                              <input
                                type="number"
                                step="0.000001"
                                required
                                value={longitude}
                                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                                className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden text-text-secondary font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1">
                              Gate Guard / Courier logistics instructions
                            </label>
                            <textarea
                              rows={2}
                              value={deliveryInstructions}
                              onChange={(e) => setDeliveryInstructions(e.target.value)}
                              placeholder="e.g. Leave with gate guard Alamin, ring bell"
                              className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden text-text-secondary resize-none"
                            />
                          </div>

                          <label className="flex items-center gap-2 text-xs text-text-secondary font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isDefault}
                              onChange={(e) => setIsDefault(e.target.checked)}
                              className="accent-brand-primary animate-pulse"
                            />
                            Establish as Default Destination node
                          </label>

                          <button
                            type="submit"
                            className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                          >
                            Submit Address Node
                          </button>
                        </form>
                      )}

                      {/* EDIT EXISTING ADDRESS FORM */}
                      {editingAddress && (
                        <form onSubmit={handleAddressEdit} className="p-5 border border-brand-primary/15 bg-canvas rounded-2xl space-y-4">
                          <div className="flex justify-between items-center mb-1 border-b border-utility-border pb-2">
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-primary">Edit Address Node</span>
                            <button type="button" onClick={() => setEditingAddress(null)} className="text-[10px] font-bold text-text-muted hover:text-text-primary uppercase">Cancel</button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1">
                                Label
                              </label>
                              <input
                                type="text"
                                value={editingAddress.label}
                                onChange={(e) => setEditingAddress({ ...editingAddress, label: e.target.value })}
                                className="w-full p-2 text-xs border border-utility-border rounded-md bg-white text-text-secondary font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1">
                                City
                              </label>
                              <input
                                type="text"
                                value={editingAddress.city}
                                onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                                className="w-full p-2 text-xs border border-utility-border rounded-md"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1">
                              Street Address
                            </label>
                            <input
                              type="text"
                              value={editingAddress.streetAddress}
                              onChange={(e) => setEditingAddress({ ...editingAddress, streetAddress: e.target.value })}
                              className="w-full p-2 text-xs border border-utility-border rounded-md"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1">
                              Instructions
                            </label>
                            <textarea
                              rows={2}
                              value={editingAddress.deliveryInstructions}
                              onChange={(e) => setEditingAddress({ ...editingAddress, deliveryInstructions: e.target.value })}
                              className="w-full p-2 text-xs border border-utility-border rounded-md resize-none"
                            />
                          </div>

                          <label className="flex items-center gap-2 text-xs text-text-secondary font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingAddress.isDefault}
                              onChange={(e) => setEditingAddress({ ...editingAddress, isDefault: e.target.checked })}
                              className="accent-brand-primary"
                            />
                            Set as Default Destination
                          </label>

                          <button
                            type="submit"
                            className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                          >
                            Save Refreshed Parameters
                          </button>
                        </form>
                      )}

                      {/* ADDRESS LIST GRID */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        {addresses.length === 0 ? (
                          <div className="col-span-2 text-center py-12 text-text-muted text-xs space-y-1">
                            <MapPin className="w-10 h-10 mx-auto text-text-muted" />
                            <p>Saved address ledger is empty.</p>
                          </div>
                        ) : (
                          addresses.map((addr) => (
                            <div key={addr.id} className="p-5 border border-utility-border rounded-2xl relative bg-canvas/10 space-y-3 flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-text-primary text-xs uppercase tracking-wider">{addr.label}</span>
                                  {addr.isDefault && (
                                    <span className="px-2.5 py-0.5 bg-brand-primary/10 rounded-full text-[8px] font-bold uppercase tracking-wider text-brand-primary font-mono">Default Node</span>
                                  )}
                                </div>
                                <p className="text-xs text-text-secondary leading-relaxed font-semibold">{addr.streetAddress}, {addr.city}</p>
                                <p className="text-[10px] text-text-muted font-mono">Coords: {addr.latitude}, {addr.longitude}</p>
                                {addr.deliveryInstructions && (
                                  <p className="text-[10px] text-text-muted italic bg-white p-2 rounded border border-utility-border mt-1">
                                    📝 Notes: {addr.deliveryInstructions}
                                  </p>
                                )}
                              </div>

                              <div className="flex justify-end gap-2 border-t border-utility-border/40 pt-2 shrink-0">
                                <button
                                  onClick={() => { setEditingAddress({ ...addr }); setShowAddAddrForm(false); }}
                                  className="px-2.5 py-1.5 bg-white border border-utility-border hover:bg-canvas rounded-lg text-[10px] font-bold uppercase tracking-wider text-text-secondary"
                                >
                                  Edit parameters
                                </button>
                                <button
                                  onClick={() => handleAddressDelete(addr.id)}
                                  className="p-1.5 bg-brand-secondary/5 border border-brand-secondary/10 hover:bg-brand-secondary/10 rounded-lg text-brand-secondary cursor-pointer"
                                  title="Purge Node"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB 5: GUILD INBOX MESSAGES */}
                  {activeTab === 'inbox' && (
                    <div className="bg-white border border-utility-border rounded-3xl p-6 shadow-xs space-y-6">
                      
                      <div className="border-b border-utility-border pb-3">
                        <h3 className="font-display font-bold text-sm text-text-primary uppercase tracking-wider">Metropolitan Florist Messaging</h3>
                        <p className="text-xs text-text-muted">Direct telemetry channel with active master botanical workshops.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 border border-utility-border rounded-2xl overflow-hidden h-96">
                        
                        {/* Florists Side Panel */}
                        <div className="md:col-span-4 border-r border-utility-border bg-canvas/10 p-3 space-y-2 overflow-y-auto">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted px-2 block mb-1">Available Florist Nodes</span>
                          
                          {[
                            { id: 'florist-1', name: 'Nairobi Blooms Westlands', logo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100' },
                            { id: 'florist-2', name: 'Rift Valley Roses farm', logo: 'https://images.unsplash.com/photo-1533750349088-cd871a92f311?w=100' },
                          ].map((partner) => (
                            <button
                              key={partner.id}
                              onClick={() => setActiveContact(partner.id)}
                              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                                activeContact === partner.id
                                  ? 'bg-white border border-utility-border shadow-xs'
                                  : 'hover:bg-white/40'
                              }`}
                            >
                              <img src={partner.logo} alt="" className="w-8 h-8 rounded-full object-cover border border-utility-border shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-text-primary truncate">{partner.name}</p>
                                <span className="text-[9px] text-brand-primary animate-pulse font-mono">🟢 ACTIVE LOGS</span>
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Interactive Chat Window */}
                        <div className="md:col-span-8 flex flex-col justify-between bg-white h-full">
                          
                          {/* Messages list */}
                          <div id="chat-window-inner" className="flex-grow overflow-y-auto p-4 space-y-4">
                            {messages.filter(m => m.senderId === activeContact || m.recipientId === activeContact).length === 0 ? (
                              <div className="text-center py-16 text-text-muted text-xs">
                                <MessageSquare className="w-10 h-10 mx-auto text-text-muted opacity-40 mb-2" />
                                <p>Begin messaging directly with this botanical studio.</p>
                              </div>
                            ) : (
                              messages
                                .filter(m => m.senderId === activeContact || m.recipientId === activeContact || m.conversationId === user.id)
                                .map((msg) => {
                                  const isMe = msg.senderRole === 'customer';
                                  return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[80%] rounded-2xl p-3 text-xs space-y-1 shadow-xs ${
                                        isMe ? 'bg-brand-primary text-white' : 'bg-canvas/50 border border-utility-border text-text-primary'
                                      }`}>
                                        <p className="font-semibold text-[10px] opacity-80">{msg.senderName}</p>
                                        <p className="leading-relaxed font-medium">{msg.content}</p>
                                        {msg.imageUrl && (
                                          <div className="w-40 h-28 rounded overflow-hidden mt-1 bg-black">
                                            <img src={msg.imageUrl} alt="" className="w-full h-full object-cover" />
                                          </div>
                                        )}
                                        <p className="text-[9px] opacity-60 text-right font-mono">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                      </div>
                                    </div>
                                  );
                                })
                            )}
                          </div>

                          {/* Chat footer input panel */}
                          <form onSubmit={handleSendMessage} className="p-3 border-t border-utility-border bg-canvas/10 space-y-2">
                            {attachedFile && (
                              <div className="flex items-center gap-2 p-1.5 bg-brand-primary/10 rounded border border-brand-primary/20 text-[10px] text-brand-primary">
                                <Paperclip className="w-3.5 h-3.5" />
                                <span>Design reference loaded successfully.</span>
                                <button type="button" onClick={() => setAttachedFile(null)} className="ml-auto font-bold uppercase">Clear</button>
                              </div>
                            )}

                            {isUploadingAttachment && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-[9px] font-mono font-bold text-brand-primary">
                                  <span>TRANSMITTING IMAGE ATTACHMENT...</span>
                                  <span>{attachmentProgress}%</span>
                                </div>
                                <div className="w-full bg-canvas rounded-full h-1">
                                  <div className="bg-brand-primary h-1 rounded-full transition-all duration-150" style={{ width: `${attachmentProgress}%` }} />
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 items-center">
                              <button
                                type="button"
                                onClick={handleAttachMockLayout}
                                className="p-2.5 bg-white border border-utility-border rounded-xl hover:bg-canvas cursor-pointer text-text-secondary"
                                title="Attach photo bouquet arrangement"
                              >
                                <Paperclip className="w-4 h-4 text-brand-primary" />
                              </button>
                              
                              <input
                                type="text"
                                value={newMessageText}
                                onChange={(e) => setNewMessageText(e.target.value)}
                                placeholder="Query dispatch status or bespoke flower adjustments..."
                                className="flex-grow p-2.5 text-xs border border-utility-border rounded-xl focus:outline-hidden bg-white text-text-secondary font-medium"
                              />
                              
                              <button
                                type="submit"
                                className="p-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl transition-all shadow cursor-pointer"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </form>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* TAB 6: NOTIFICATIONS INBOX */}
                  {activeTab === 'notifications' && (
                    <div className="bg-white border border-utility-border rounded-3xl p-6 shadow-xs space-y-6">
                      
                      <div className="flex justify-between items-center border-b border-utility-border pb-3">
                        <div>
                          <h3 className="font-display font-bold text-sm text-text-primary uppercase tracking-wider">Metropolitan Alerts Registry</h3>
                          <p className="text-xs text-text-muted">A timeline log of telemetry notifications, rewards, and promotions.</p>
                        </div>
                        
                        <div className="flex gap-1.5">
                          {[
                            { id: 'all', label: 'All logs' },
                            { id: 'orders', label: 'Shipments' },
                            { id: 'promotions', label: 'Vouchers' },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => setNotifFilter(cat.id)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                                notifFilter === cat.id
                                  ? 'bg-brand-primary text-white'
                                  : 'bg-canvas text-text-secondary border border-utility-border'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notifications ledger list */}
                      <div className="space-y-3 pt-2">
                        {notifications.filter(n => notifFilter === 'all' || n.type === notifFilter).length === 0 ? (
                          <div className="text-center py-12 text-text-muted text-xs space-y-1">
                            <Bell className="w-10 h-10 mx-auto text-text-muted" />
                            <p>All clear. No notifications in selected telemetry stream.</p>
                          </div>
                        ) : (
                          notifications
                            .filter(n => notifFilter === 'all' || n.type === notifFilter)
                            .map((notif) => (
                              <div
                                key={notif.id}
                                className={`p-4 border border-utility-border rounded-2xl flex justify-between items-start gap-4 transition-all ${
                                  notif.isRead ? 'bg-canvas/10' : 'bg-brand-primary/5 border-brand-primary/10 shadow-xs'
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-text-primary text-xs leading-none">{notif.title}</span>
                                    <span className="px-2 py-0.5 bg-brand-primary/10 rounded text-[8px] font-bold uppercase tracking-wider text-brand-primary font-mono">{notif.type}</span>
                                  </div>
                                  <p className="text-xs text-text-secondary leading-relaxed font-semibold">{notif.body}</p>
                                  <span className="text-[9px] text-text-muted block font-mono">{new Date(notif.created_at).toLocaleString()}</span>
                                </div>

                                <div className="flex gap-2 shrink-0">
                                  {!notif.isRead && (
                                    <button
                                      onClick={() => handleMarkNotifRead(notif.id)}
                                      className="px-2 py-1 bg-white border border-utility-border text-text-secondary rounded text-[9px] font-bold uppercase tracking-wider"
                                    >
                                      Mark read
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteNotif(notif.id)}
                                    className="p-1 text-brand-secondary hover:bg-brand-secondary/5 rounded"
                                    title="Purge log"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB 7: BOTANICAL REVIEWS */}
                  {activeTab === 'reviews' && (
                    <div className="bg-white border border-utility-border rounded-3xl p-6 shadow-xs space-y-6">
                      
                      <div className="border-b border-utility-border pb-3">
                        <h3 className="font-display font-bold text-sm text-text-primary uppercase tracking-wider">Botanical Designer Reviews</h3>
                        <p className="text-xs text-text-muted">Register and review Completed Rift Valley arrangements to support the Florist Guild.</p>
                      </div>

                      {/* Add Review Form */}
                      <form onSubmit={handleReviewSubmit} className="p-5 border border-utility-border rounded-2xl bg-canvas/20 space-y-4">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-primary block border-b border-utility-border pb-2">Draft New Bouquet Review</span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                              Arrangement Product
                            </label>
                            <select
                              value={reviewProduct}
                              onChange={(e) => setReviewProduct(e.target.value)}
                              className="w-full p-2.5 text-xs border border-utility-border rounded-md bg-white text-text-secondary font-semibold"
                            >
                              {MOCK_PRODUCTS.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                              Star Rating Score
                            </label>
                            <div className="flex gap-1 pt-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => setRating(s)}
                                  className="text-yellow-500 cursor-pointer hover:scale-110 transition-transform"
                                >
                                  <Star className={`w-6 h-6 ${rating >= s ? 'fill-yellow-500' : 'text-text-muted'}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1">
                            Your review comments
                          </label>
                          <textarea
                            rows={3}
                            required
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Detail arrangement freshness, stem conditions, cold-chain speed..."
                            className="w-full p-3 text-xs border border-utility-border rounded-xl focus:outline-hidden bg-white text-text-secondary"
                          />
                        </div>

                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                        >
                          Submit Review to Guild
                        </button>
                      </form>

                      {/* Saved reviews display list */}
                      <div className="space-y-4 pt-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted block">Existing Reviews Vault</span>
                        
                        {reviews.length === 0 ? (
                          <p className="text-xs text-text-muted text-center py-6">You have not drafted any bouquet reviews yet.</p>
                        ) : (
                          reviews.map((rev) => (
                            <div key={rev.id} className="p-4 border border-utility-border rounded-2xl bg-white space-y-3 shadow-2xs">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <h4 className="text-xs font-bold text-text-primary">{rev.productName}</h4>
                                  <p className="text-[10px] text-text-muted">By {rev.floristName} • Logs date: {rev.date}</p>
                                </div>
                                <div className="flex gap-0.5 text-yellow-500">
                                  {Array.from({ length: rev.rating }).map((_, i) => (
                                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                  ))}
                                </div>
                              </div>

                              <p className="text-xs text-text-secondary leading-relaxed font-semibold">"{rev.comment}"</p>

                              {rev.replyText && (
                                <div className="p-3 bg-brand-primary/5 border-l-2 border-brand-primary rounded text-[11px] text-text-secondary space-y-1">
                                  <div className="flex justify-between font-bold text-brand-primary text-[10px] uppercase">
                                    <span>Florist Guild response:</span>
                                    <span>{rev.replyDate}</span>
                                  </div>
                                  <p className="leading-relaxed font-medium italic">"{rev.replyText}"</p>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB 8: LOYALTY CARD & REFERRAL PROGRAM */}
                  {activeTab === 'rewards' && (
                    <div className="space-y-6">
                      
                      {/* Visual Loyalty Card */}
                      <div className="bg-brand-primary text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-lg space-y-6">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-secondary/15 rounded-full blur-3xl" />
                        
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/70 block">Flora_X Premium Loyalty Certificate</span>
                            <h3 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight text-white">{user.profile.firstName} {user.profile.lastName}</h3>
                          </div>
                          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-display font-bold text-sm text-white border border-white/20">
                            F_X
                          </div>
                        </div>

                        <div className="flex justify-between items-end pt-4">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-white/60 block">Ledger points balance</span>
                            <span className="text-3xl font-display font-extrabold text-white font-mono">{dashboardStats.pointsBalance} PTS</span>
                          </div>
                          <div className="text-right space-y-1.5 font-mono text-[10px]">
                            <p>Status: Gold Botanical VIP</p>
                            <p>Registry No: {user.id.substring(0, 12).toUpperCase()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Point Ledger & Redeem rewards shop */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="bg-white border border-utility-border rounded-3xl p-6 shadow-xs space-y-4">
                          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">Redeem point coupons</h4>
                          
                          <div className="space-y-3.5">
                            {[
                              { title: 'Free Premium Velvet Wrapping', cost: 30, desc: 'Elevate your arrangement wrap with textured ribbon.' },
                              { title: 'KES 500 Flat discount code', cost: 100, desc: 'KES 500 flat off any Naivasha rose arrangements.' },
                              { title: 'Artisanal Cylindrical Crystal Vase', cost: 150, desc: 'A heavy luxury crystalline vase for rose longevity.' }
                            ].map((rew, idx) => (
                              <div key={idx} className="p-3 border border-utility-border rounded-xl text-xs space-y-2 flex justify-between items-center bg-canvas/10">
                                <div className="space-y-0.5">
                                  <p className="font-bold text-text-primary">{rew.title}</p>
                                  <p className="text-[10px] text-text-muted leading-relaxed max-w-[170px]">{rew.desc}</p>
                                </div>
                                <button
                                  onClick={() => handleRedeemReward(rew.cost, rew.title)}
                                  className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded text-[10px] uppercase font-bold tracking-wider shrink-0"
                                >
                                  {rew.cost} pts
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Invited Friends program */}
                        <div className="bg-white border border-utility-border rounded-3xl p-6 shadow-xs space-y-4">
                          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">Refer friends, earn points</h4>
                          
                          <form onSubmit={handleReferralInvite} className="space-y-3">
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1">
                                Friend email address
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="email"
                                  required
                                  value={inviteEmail}
                                  onChange={(e) => setInviteEmail(e.target.value)}
                                  placeholder="amani.kiama@gmail.com"
                                  className="flex-grow p-2.5 text-xs border border-utility-border rounded-xl focus:outline-hidden bg-white text-text-secondary"
                                />
                                <button
                                  type="submit"
                                  disabled={inviting}
                                  className="px-4 py-2.5 bg-brand-primary text-white hover:bg-brand-primary-hover rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 cursor-pointer"
                                >
                                  {inviting ? 'Sending...' : 'Invite'}
                                </button>
                              </div>
                            </div>
                          </form>

                          <div className="p-3.5 bg-canvas rounded-2xl border border-utility-border space-y-2 text-xs text-text-secondary leading-relaxed">
                            <span className="font-bold text-[10px] uppercase text-text-primary block">Your Sharing parameters:</span>
                            <p>Referral Link: <span className="font-semibold text-brand-primary text-[11px] underline select-all">{referralLink}</span></p>
                            <p>Invite Code: <span className="font-mono font-bold text-text-primary">{referralCode}</span></p>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* TAB 9: ACCOUNT SETTINGS & DATA PORTABILITY */}
                  {activeTab === 'settings' && (
                    <div className="space-y-6">
                      
                      {/* Personal Parameters update */}
                      <div className="bg-white border border-utility-border rounded-3xl p-6 shadow-xs space-y-4">
                        <h3 className="font-display font-bold text-sm text-text-primary uppercase tracking-wider">Personal parameters</h3>
                        
                        <form onSubmit={handleProfileSave} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                                First Name
                              </label>
                              <input
                                type="text"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full p-2.5 text-xs border border-utility-border rounded-md text-text-secondary font-medium focus:outline-hidden"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                                Last Name
                              </label>
                              <input
                                type="text"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full p-2.5 text-xs border border-utility-border rounded-md text-text-secondary font-medium focus:outline-hidden"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                                Email (Read Only)
                              </label>
                              <input
                                type="email"
                                disabled
                                value={user.email}
                                className="w-full p-2.5 text-xs border border-utility-border rounded-md bg-canvas text-text-muted font-mono cursor-not-allowed"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                                Phone parameters
                              </label>
                              <input
                                type="text"
                                required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full p-2.5 text-xs border border-utility-border rounded-md text-text-secondary font-medium focus:outline-hidden"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            Save Changes
                          </button>
                        </form>
                      </div>

                      {/* Security Credentials Modification */}
                      <div className="bg-white border border-utility-border rounded-3xl p-6 shadow-xs space-y-4">
                        <h3 className="font-display font-bold text-sm text-text-primary uppercase tracking-wider">Change security password</h3>
                        
                        <form onSubmit={handleChangePassword} className="space-y-4">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                              Current Password
                            </label>
                            <input
                              type="password"
                              required
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden text-text-secondary"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                                New Password
                              </label>
                              <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden text-text-secondary"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                                Confirm New Password
                              </label>
                              <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden text-text-secondary"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            Refresh Credentials
                          </button>
                        </form>
                      </div>

                      {/* Data Portability exporter */}
                      <div className="bg-white border border-utility-border rounded-3xl p-6 shadow-xs space-y-4">
                        <h3 className="font-display font-bold text-sm text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                          <Download className="w-4 h-4 text-brand-primary" />
                          Rift Valley personal data portability
                        </h3>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          In compliance with the East Africa Data Protection parameters, you can export your complete personal account logs (including profile, saved address coordinates, flower booking invoice history, reviews, and messaging threads) in standard machine-readable JSON format.
                        </p>
                        
                        <button
                          onClick={handleExportPersonalData}
                          className="px-5 py-3 bg-canvas hover:bg-canvas/80 border border-utility-border rounded-xl text-xs font-bold uppercase tracking-wider text-text-secondary transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-brand-primary" />
                          Compile & Download Data Bundle
                        </button>
                      </div>

                      {/* Secure account purging */}
                      <div className="bg-white border border-brand-secondary/10 rounded-3xl p-6 shadow-xs space-y-4">
                        <h3 className="font-display font-bold text-sm text-brand-secondary uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-brand-secondary animate-bounce" />
                          Permanent Account Purge
                        </h3>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Once triggered, all active metropolitan floral bookings, points balances, saved directions, review comments, and direct chat history will be permanently wiped from the Rift Valley database. This operation is completely irreversible.
                        </p>

                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="px-5 py-3 border border-brand-secondary/25 hover:bg-brand-secondary/5 rounded-xl text-xs font-bold uppercase tracking-wider text-brand-secondary transition-all cursor-pointer"
                        >
                          Request Permanent Registry Purge
                        </button>
                      </div>

                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            )}
        </main>
      </div>

      {/* Permanent account purging secure warning popup */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowDeleteModal(false)} />
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative z-10 border border-utility-border">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-brand-secondary/10 text-brand-secondary rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-text-primary text-base uppercase">Confirm Registry Purge?</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                You are about to permanently drop your companion profile from the Flora_X Horti-Guild registry. This destroys all points balances, active bookings, and is completely irreversible.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 border border-utility-border hover:bg-canvas rounded-xl text-xs font-bold uppercase tracking-wider text-text-secondary cursor-pointer"
              >
                No, abort
              </button>
              <button
                onClick={handlePermanentAccountDeletion}
                className="flex-1 py-3 bg-brand-secondary text-white hover:bg-brand-secondary/90 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Yes, Purge registry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
