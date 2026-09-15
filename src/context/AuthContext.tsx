import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface UserProfile {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatarUrl: string | null;
}

export interface User {
  id: string;
  email: string;
  role: 'customer' | 'florist' | 'admin' | 'super_admin';
  isVerified: boolean;
  profile: UserProfile;
  floristStatus?: 'pending_review' | 'approved' | 'rejected' | 'suspended' | null;
  onboardingStep?: 'business_info' | 'complete' | null;
}

export interface Address {
  id: string;
  label: string;
  streetAddress: string;
  city: string;
  latitude: number;
  longitude: number;
  deliveryInstructions: string;
  isDefault: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  addresses: Address[];
  auditLogs: any[];
  usersList: any[];
  pendingFlorists: any[];
  allFlorists: any[];
  dashboardStats: any;
  activityFeed: any[];
  ordersList: any[];
  withdrawalsList: any[];
  productsList: any[];
  reviewsList: any[];
  couponsList: any[];
  categoriesList: any[];
  systemConfig: any;
  administratorsList: any[];
  cmsContent: any;
  deliveryZones: any[];
  login: (email: string, password: string) => Promise<User>;
  registerUser: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, password: string) => Promise<void>;
  submitFloristOnboarding: (onboardingData: any) => Promise<any>;
  fetchAddresses: () => Promise<void>;
  addAddress: (addressData: any) => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  fetchAdminData: () => Promise<void>;
  approveFlorist: (id: string) => Promise<void>;
  rejectFlorist: (id: string, reason: string) => Promise<void>;
  toggleFloristSuspension: (id: string) => Promise<void>;
  toggleUserSuspension: (id: string) => Promise<void>;
  resetUserPassword: (userId: string) => Promise<string>;
  deleteUserAccount: (userId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  refundOrder: (orderId: string, amount: number, reason: string) => Promise<void>;
  approveWithdrawal: (id: string, ref?: string) => Promise<void>;
  rejectWithdrawal: (id: string, reason: string) => Promise<void>;
  moderateProduct: (id: string, payload: any) => Promise<void>;
  moderateReview: (id: string, action: string) => Promise<void>;
  createCoupon: (data: any) => Promise<void>;
  toggleCouponStatus: (id: string) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  createCategory: (data: any) => Promise<void>;
  updateSystemConfig: (config: any) => Promise<void>;
  createAdministrator: (data: any) => Promise<any>;
  toggleAdminStatus: (id: string) => Promise<void>;
  resetAdminPassword: (id: string) => Promise<string>;
  deleteAdministrator: (id: string) => Promise<void>;
  fetchSystemHealth: () => Promise<any>;
  updateCMSSection: (section: string, data: any) => Promise<void>;
  broadcastNotification: (data: any) => Promise<void>;
  fetchAIAdminInsights: (queryType: string) => Promise<string>;
  fetchFloristDetail: (id: string) => Promise<any>;
  fetchUserDetail: (id: string) => Promise<any>;
  fetchOrderDetail: (id: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Ensure Axios has default Authorization header immediately on module load if available
if (typeof window !== 'undefined') {
  const initialToken = localStorage.getItem('florax_token');
  if (initialToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
  }
}

// Request interceptor to ensure all outgoing requests carry the token
axios.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const currentToken = localStorage.getItem('florax_token');
    if (currentToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
  }
  return config;
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('florax_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('florax_token');
  });

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [pendingFlorists, setPendingFlorists] = useState<any[]>([]);
  const [allFlorists, setAllFlorists] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [couponsList, setCouponsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>({});
  const [administratorsList, setAdministratorsList] = useState<any[]>([]);
  const [cmsContent, setCmsContent] = useState<any>({});
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);

  // Configure global axios authorization headers if token exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('florax_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('florax_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('florax_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('florax_user');
    }
  }, [user]);

  // LOGIN
  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const resp = await axios.post('/api/v1/auth/login', { email, password });
      const { accessToken, user: userData } = resp.data;
      setToken(accessToken);
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err: any) {
      setLoading(false);
      throw new Error(err.response?.data?.error || 'Login failed. Please check your credentials.');
    }
  };

  // REGISTER
  const registerUser = async (data: any): Promise<any> => {
    setLoading(true);
    try {
      const resp = await axios.post('/api/v1/auth/register', data);
      setLoading(false);
      return resp.data;
    } catch (err: any) {
      setLoading(false);
      throw new Error(err.response?.data?.error || 'Registration failed.');
    }
  };

  // LOGOUT
  const logout = async () => {
    setLoading(true);
    try {
      await axios.post('/api/v1/auth/logout');
    } catch (err) {
      console.warn('Logout endpoint failed, clearing state locally:', err);
    } finally {
      setToken(null);
      setUser(null);
      setAddresses([]);
      setAuditLogs([]);
      setUsersList([]);
      setPendingFlorists([]);
      setLoading(false);
      window.location.hash = '#/';
    }
  };

  // VERIFY EMAIL
  const verifyEmail = async (verifyToken: string) => {
    setLoading(true);
    try {
      await axios.post('/api/v1/auth/verify-email', { token: verifyToken });
      if (user) {
        setUser({ ...user, isVerified: true });
      }
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      throw new Error(err.response?.data?.error || 'Email verification failed.');
    }
  };

  // FORGOT PASSWORD
  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      const resp = await axios.post('/api/v1/auth/forgot-password', { email });
      setLoading(false);
      return resp.data;
    } catch (err: any) {
      setLoading(false);
      throw new Error(err.response?.data?.error || 'Request failed.');
    }
  };

  // RESET PASSWORD
  const resetPassword = async (resetToken: string, password: string) => {
    setLoading(true);
    try {
      await axios.post('/api/v1/auth/reset-password', { token: resetToken, password });
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      throw new Error(err.response?.data?.error || 'Password reset failed.');
    }
  };

  // FLORIST ONBOARDING SUBMIT
  const submitFloristOnboarding = async (onboardingData: any) => {
    setLoading(true);
    try {
      const resp = await axios.post('/api/v1/florist/onboard', onboardingData);
      if (user) {
        setUser({
          ...user,
          floristStatus: 'pending_review',
          onboardingStep: 'complete'
        });
      }
      setLoading(false);
      return resp.data;
    } catch (err: any) {
      setLoading(false);
      throw new Error(err.response?.data?.error || 'Onboarding wizard submission failed.');
    }
  };

  // FETCH ADDRESSES
  const fetchAddresses = async () => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('florax_token') : null);
    if (!activeToken) {
      setAddresses([]);
      return;
    }
    try {
      const resp = await axios.get('/api/v1/customer/addresses', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      setAddresses(Array.isArray(resp.data) ? resp.data : []);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 404) {
        setAddresses([]);
      } else {
        console.warn('Addresses could not be fetched:', err.message);
        setAddresses([]);
      }
    }
  };

  // ADD ADDRESS
  const addAddress = async (addressData: any) => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('florax_token') : null);
    try {
      await axios.post('/api/v1/customer/addresses', addressData, {
        headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {}
      });
      await fetchAddresses();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to save address.');
    }
  };

  // UPDATE PROFILE
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      await axios.put('/api/v1/customer/profile', profileData);
      if (user) {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            ...profileData
          }
        } as User);
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to update profile.');
    }
  };

  // FETCH ALL ADMIN DASHBOARD DATA & LISTS
  const fetchAdminData = async () => {
    if (!token) return;
    try {
      const [
        logsResp,
        usersResp,
        pendingResp,
        floristsResp,
        statsResp,
        activityResp,
        ordersResp,
        withdrawalsResp,
        productsResp,
        reviewsResp,
        couponsResp,
        categoriesResp,
        configResp,
        cmsResp
      ] = await Promise.all([
        axios.get('/api/v1/admin/audit-logs').catch(() => ({ data: [] })),
        axios.get('/api/v1/admin/users').catch(() => ({ data: [] })),
        axios.get('/api/v1/admin/florists/pending').catch(() => ({ data: [] })),
        axios.get('/api/v1/admin/florists').catch(() => ({ data: [] })),
        axios.get('/api/v1/admin/dashboard/stats').catch(() => ({ data: null })),
        axios.get('/api/v1/admin/activity-feed').catch(() => ({ data: [] })),
        axios.get('/api/v1/admin/orders').catch(() => ({ data: [] })),
        axios.get('/api/v1/admin/withdrawals').catch(() => ({ data: [] })),
        axios.get('/api/v1/admin/products').catch(() => ({ data: [] })),
        axios.get('/api/v1/admin/reviews').catch(() => ({ data: [] })),
        axios.get('/api/v1/admin/coupons').catch(() => ({ data: [] })),
        axios.get('/api/v1/admin/categories').catch(() => ({ data: [] })),
        axios.get('/api/v1/admin/system/config').catch(() => ({ data: {} })),
        axios.get('/api/v1/admin/cms').catch(() => ({ data: {} }))
      ]);

      setAuditLogs(logsResp.data || []);
      setUsersList(usersResp.data || []);
      setPendingFlorists(pendingResp.data || []);
      setAllFlorists(floristsResp.data || []);
      setDashboardStats(statsResp.data || null);
      setActivityFeed(activityResp.data || []);
      setOrdersList(ordersResp.data || []);
      setWithdrawalsList(withdrawalsResp.data || []);
      setProductsList(productsResp.data || []);
      setReviewsList(reviewsResp.data || []);
      setCouponsList(couponsResp.data || []);
      setCategoriesList(categoriesResp.data || []);
      setSystemConfig(configResp.data || {});
      setCmsContent(cmsResp.data || {});

      if (user?.role === 'super_admin') {
        axios.get('/api/v1/admin/administrators').then(r => setAdministratorsList(r.data)).catch(() => {});
      }
    } catch (err) {
      console.error('Error loading administrative lists:', err);
    }
  };

  // ADMIN APPROVE FLORIST
  const approveFlorist = async (floristId: string) => {
    try {
      await axios.post(`/api/v1/admin/florists/${floristId}/approve`);
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Approval action failed.');
    }
  };

  // ADMIN REJECT FLORIST
  const rejectFlorist = async (floristId: string, reason: string) => {
    try {
      await axios.post(`/api/v1/admin/florists/${floristId}/reject`, { reason });
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Rejection action failed.');
    }
  };

  // ADMIN TOGGLE FLORIST SUSPENSION
  const toggleFloristSuspension = async (floristId: string) => {
    try {
      await axios.post(`/api/v1/admin/florists/${floristId}/suspend`);
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Florist suspension action failed.');
    }
  };

  // ADMIN SUSPEND / REACTIVATE USER
  const toggleUserSuspension = async (userId: string) => {
    try {
      await axios.post(`/api/v1/admin/users/${userId}/suspend`);
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Suspension toggle failed.');
    }
  };

  // ADMIN RESET USER PASSWORD
  const resetUserPassword = async (userId: string): Promise<string> => {
    try {
      const resp = await axios.post(`/api/v1/admin/users/${userId}/reset-password`);
      await fetchAdminData();
      return resp.data?.message || 'Password reset triggered.';
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Password reset failed.');
    }
  };

  // SUPER ADMIN DELETE USER ACCOUNT
  const deleteUserAccount = async (userId: string) => {
    try {
      await axios.delete(`/api/v1/admin/users/${userId}`);
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'User deletion failed.');
    }
  };

  // ADMIN CANCEL ORDER
  const cancelOrder = async (orderId: string) => {
    try {
      await axios.post(`/api/v1/admin/orders/${orderId}/cancel`);
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Order cancellation failed.');
    }
  };

  // ADMIN REFUND ORDER
  const refundOrder = async (orderId: string, amount: number, reason: string) => {
    try {
      await axios.post(`/api/v1/admin/orders/${orderId}/refund`, { amount, reason });
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Refund failed.');
    }
  };

  // ADMIN APPROVE WITHDRAWAL PAYOUT
  const approveWithdrawal = async (id: string, ref?: string) => {
    try {
      await axios.post(`/api/v1/admin/withdrawals/${id}/approve`, { payoutReference: ref });
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Withdrawal approval failed.');
    }
  };

  // ADMIN REJECT WITHDRAWAL
  const rejectWithdrawal = async (id: string, reason: string) => {
    try {
      await axios.post(`/api/v1/admin/withdrawals/${id}/reject`, { reason });
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Withdrawal rejection failed.');
    }
  };

  // MODERATE PRODUCT
  const moderateProduct = async (id: string, payload: any) => {
    try {
      await axios.post(`/api/v1/admin/products/${id}/moderate`, payload);
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Product moderation failed.');
    }
  };

  // MODERATE REVIEW
  const moderateReview = async (id: string, action: string) => {
    try {
      await axios.post(`/api/v1/admin/reviews/${id}/moderate`, { action });
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Review moderation failed.');
    }
  };

  // CREATE COUPON
  const createCoupon = async (data: any) => {
    try {
      await axios.post('/api/v1/admin/coupons', data);
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Coupon creation failed.');
    }
  };

  // TOGGLE COUPON STATUS
  const toggleCouponStatus = async (id: string) => {
    try {
      await axios.post(`/api/v1/admin/coupons/${id}/toggle`);
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Coupon status toggle failed.');
    }
  };

  // DELETE COUPON
  const deleteCoupon = async (id: string) => {
    try {
      await axios.delete(`/api/v1/admin/coupons/${id}`);
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Coupon deletion failed.');
    }
  };

  // FETCH FLORIST DETAIL
  const fetchFloristDetail = async (id: string) => {
    try {
      const resp = await axios.get(`/api/v1/admin/florists/${id}`);
      return resp.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to fetch florist details.');
    }
  };

  // FETCH USER DETAIL
  const fetchUserDetail = async (id: string) => {
    try {
      const resp = await axios.get(`/api/v1/admin/users/${id}`);
      return resp.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to fetch user profile.');
    }
  };

  // FETCH ORDER DETAIL
  const fetchOrderDetail = async (id: string) => {
    try {
      const resp = await axios.get(`/api/v1/admin/orders/${id}`);
      return resp.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to fetch order details.');
    }
  };

  // CREATE CATEGORY
  const createCategory = async (data: any) => {
    try {
      await axios.post('/api/v1/admin/categories', data);
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Category creation failed.');
    }
  };

  // UPDATE SYSTEM CONFIG
  const updateSystemConfig = async (configData: any) => {
    try {
      await axios.put('/api/v1/admin/system/config', configData);
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'System config update failed.');
    }
  };

  // CREATE ADMINISTRATOR
  const createAdministrator = async (data: any) => {
    try {
      const resp = await axios.post('/api/v1/admin/administrators', data);
      await fetchAdminData();
      return resp.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Administrator creation failed.');
    }
  };

  // TOGGLE ADMIN STATUS
  const toggleAdminStatus = async (id: string) => {
    try {
      await axios.post(`/api/v1/admin/administrators/${id}/status`);
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to update administrator status.');
    }
  };

  // RESET ADMIN PASSWORD
  const resetAdminPassword = async (id: string): Promise<string> => {
    try {
      const resp = await axios.post(`/api/v1/admin/administrators/${id}/reset-password`);
      await fetchAdminData();
      return resp.data.tempPassword || resp.data.message;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to reset administrator password.');
    }
  };

  // DELETE ADMINISTRATOR
  const deleteAdministrator = async (id: string) => {
    try {
      await axios.delete(`/api/v1/admin/administrators/${id}`);
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to remove administrator.');
    }
  };

  // FETCH SYSTEM HEALTH
  const fetchSystemHealth = async () => {
    try {
      const resp = await axios.get('/api/v1/admin/system/health');
      return resp.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to fetch system health telemetry.');
    }
  };

  // UPDATE CMS SECTION
  const updateCMSSection = async (section: string, data: any) => {
    try {
      await axios.put(`/api/v1/admin/cms/${section}`, data);
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'CMS section update failed.');
    }
  };

  // BROADCAST NOTIFICATION
  const broadcastNotification = async (data: any) => {
    try {
      await axios.post('/api/v1/admin/notifications/broadcast', data);
      await fetchAdminData();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Broadcast notification failed.');
    }
  };

  // AI ADMIN INSIGHTS
  const fetchAIAdminInsights = async (queryType: string): Promise<string> => {
    try {
      const resp = await axios.post('/api/v1/admin/ai/insights', { queryType });
      return resp.data?.insights || '';
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'AI Insights request failed.');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      addresses,
      auditLogs,
      usersList,
      pendingFlorists,
      allFlorists,
      dashboardStats,
      activityFeed,
      ordersList,
      withdrawalsList,
      productsList,
      reviewsList,
      couponsList,
      categoriesList,
      systemConfig,
      administratorsList,
      cmsContent,
      deliveryZones,
      login,
      registerUser,
      logout,
      verifyEmail,
      forgotPassword,
      resetPassword,
      submitFloristOnboarding,
      fetchAddresses,
      addAddress,
      updateProfile,
      fetchAdminData,
      approveFlorist,
      rejectFlorist,
      toggleFloristSuspension,
      toggleUserSuspension,
      resetUserPassword,
      deleteUserAccount,
      cancelOrder,
      refundOrder,
      approveWithdrawal,
      rejectWithdrawal,
      moderateProduct,
      moderateReview,
      createCoupon,
      toggleCouponStatus,
      deleteCoupon,
      createCategory,
      updateSystemConfig,
      createAdministrator,
      toggleAdminStatus,
      resetAdminPassword,
      deleteAdministrator,
      fetchSystemHealth,
      updateCMSSection,
      broadcastNotification,
      fetchAIAdminInsights,
      fetchFloristDetail,
      fetchUserDetail,
      fetchOrderDetail
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
