import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Store,
  Building2,
  Image as ImageIcon,
  MapPin,
  Truck,
  Clock,
  Share2,
  ShieldAlert,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Phone,
  Mail,
  FileText,
  DollarSign
} from 'lucide-react';
import { FloristProfileData } from '../../types';

export default function ShopManagementView() {
  const [profile, setProfile] = useState<FloristProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeSection, setActiveSection] = useState<'profile' | 'branding' | 'location' | 'delivery' | 'hours' | 'social'>('profile');

  // Form State
  const [formData, setFormData] = useState<Partial<FloristProfileData>>({
    storeName: '',
    legalBusinessName: '',
    businessRegistrationNumber: '',
    mpesaTillNumber: '',
    description: '',
    contactPhone: '',
    contactEmail: '',
    addressText: '',
    county: 'Nairobi',
    town: 'Westlands',
    latitude: -1.2676,
    longitude: 36.8115,
    logoUrl: '',
    bannerUrl: '',
    deliveryRadiusKm: 15,
    minimumOrderAmount: 1500,
    deliveryFeeStandard: 350,
    sameDayDeliveryAvailable: true,
    deliveryCutoffTime: '15:00',
    businessHours: [
      { day: 'Monday', open: '08:00', close: '18:00', isClosed: false },
      { day: 'Tuesday', open: '08:00', close: '18:00', isClosed: false },
      { day: 'Wednesday', open: '08:00', close: '18:00', isClosed: false },
      { day: 'Thursday', open: '08:00', close: '18:00', isClosed: false },
      { day: 'Friday', open: '08:00', close: '18:00', isClosed: false },
      { day: 'Saturday', open: '09:00', close: '17:00', isClosed: false },
      { day: 'Sunday', open: '10:00', close: '15:00', isClosed: true },
    ],
    socials: {
      instagram: '',
      facebook: '',
      tiktok: '',
      whatsapp: '',
    }
  });

  const fetchProfile = () => {
    setLoading(true);
    axios
      .get('/api/v1/florist/profile')
      .then((res) => {
        setProfile(res.data);
        setFormData({
          ...res.data,
          businessHours: res.data.businessHours?.length
            ? res.data.businessHours
            : [
                { day: 'Monday', open: '08:00', close: '18:00', isClosed: false },
                { day: 'Tuesday', open: '08:00', close: '18:00', isClosed: false },
                { day: 'Wednesday', open: '08:00', close: '18:00', isClosed: false },
                { day: 'Thursday', open: '08:00', close: '18:00', isClosed: false },
                { day: 'Friday', open: '08:00', close: '18:00', isClosed: false },
                { day: 'Saturday', open: '09:00', close: '17:00', isClosed: false },
                { day: 'Sunday', open: '10:00', close: '15:00', isClosed: true },
              ],
          socials: res.data.socials || { instagram: '', facebook: '', tiktok: '', whatsapp: '' }
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load florist profile:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const isRestricted =
    profile?.verificationStatus === 'suspended' ||
    profile?.verificationStatus === 'rejected' ||
    profile?.verificationStatus === 'inactive';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRestricted) {
      setErrorMessage(
        `Your account status is "${profile?.verificationStatus}". Changes are currently restricted by platform governance.`
      );
      return;
    }

    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      await axios.put('/api/v1/florist/profile', formData);
      setSaveSuccess(true);
      setSaving(false);
      fetchProfile();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaving(false);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to update shop profile.';
      setErrorMessage(msg);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-xs">
        <RefreshCw className="animate-spin text-[#2D5A27] mx-auto mb-3" size={28} />
        <p className="text-sm font-medium text-stone-600">Loading Shop Profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification Status Banner */}
      {isRestricted ? (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-xs flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <Lock size={20} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wide">
                Account Status: {profile?.verificationStatus}
              </h3>
              <span className="text-[10px] bg-rose-200/80 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                Read-Only Restricted
              </span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed font-medium">
              Your florist account status is currently <strong>{profile?.verificationStatus}</strong>. You can review your existing information and orders, but changes and new transactions are temporarily restricted. Please contact Flora_X seller support if you need assistance.
            </p>
          </div>
        </div>
      ) : profile?.verificationStatus === 'pending_review' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide">
                Account Status: Pending Approval Review
              </h3>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your store details have been submitted to Flora_X compliance team for review. Your store will become visible on the public marketplace once approved.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#FAF9F6] border border-[#2D5A27]/20 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center font-bold">
              ✿
            </div>
            <div>
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Public Store Status: Active Marketplace Seller
              </span>
              <span className="text-xs text-stone-500">
                Slug: <code className="font-mono text-[#2D5A27]">{profile?.slug}</code>
              </span>
            </div>
          </div>
          <a
            href={`/#/florist/${profile?.slug || profile?.id}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold px-3 py-1.5 bg-[#2D5A27] text-white hover:bg-[#23471f] rounded-xl transition-colors"
          >
            Preview Live Shop Page
          </a>
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-3 shadow-xs space-y-1 h-fit">
          <button
            onClick={() => setActiveSection('profile')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'profile'
                ? 'bg-[#2D5A27] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Building2 size={16} />
            <span>Business Profile</span>
          </button>

          <button
            onClick={() => setActiveSection('branding')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'branding'
                ? 'bg-[#2D5A27] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <ImageIcon size={16} />
            <span>Branding & Media</span>
          </button>

          <button
            onClick={() => setActiveSection('location')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'location'
                ? 'bg-[#2D5A27] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <MapPin size={16} />
            <span>Location & Map</span>
          </button>

          <button
            onClick={() => setActiveSection('delivery')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'delivery'
                ? 'bg-[#2D5A27] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Truck size={16} />
            <span>Delivery Settings</span>
          </button>

          <button
            onClick={() => setActiveSection('hours')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'hours'
                ? 'bg-[#2D5A27] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Clock size={16} />
            <span>Operating Hours</span>
          </button>

          <button
            onClick={() => setActiveSection('social')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'social'
                ? 'bg-[#2D5A27] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Share2 size={16} />
            <span>Social & Messaging</span>
          </button>
        </div>

        {/* Content Form Panel */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs">
          <form onSubmit={handleSave} className="space-y-6">
            {/* SECTION 1: BUSINESS PROFILE */}
            {activeSection === 'profile' && (
              <div className="space-y-5">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-base font-serif font-bold text-stone-800">Business Profile & Verification</h3>
                  <p className="text-xs text-stone-500">Official business registration details, M-Pesa payouts till, and store bio.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      Store Front Name *
                    </label>
                    <input
                      type="text"
                      disabled={isRestricted}
                      value={formData.storeName || ''}
                      onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      required
                      placeholder="e.g. Rift Valley Floral Studio"
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      Legal Registered Business Name *
                    </label>
                    <input
                      type="text"
                      disabled={isRestricted}
                      value={formData.legalBusinessName || ''}
                      onChange={(e) => setFormData({ ...formData, legalBusinessName: e.target.value })}
                      required
                      placeholder="e.g. Rift Valley Roses Ltd"
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      Business Reg / KRA PIN Number
                    </label>
                    <input
                      type="text"
                      disabled={isRestricted}
                      value={formData.businessRegistrationNumber || ''}
                      onChange={(e) => setFormData({ ...formData, businessRegistrationNumber: e.target.value })}
                      placeholder="e.g. CPR/2024/112233"
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      M-Pesa Buy Goods Till Number *
                    </label>
                    <input
                      type="text"
                      disabled={isRestricted}
                      value={formData.mpesaTillNumber || ''}
                      onChange={(e) => setFormData({ ...formData, mpesaTillNumber: e.target.value })}
                      required
                      placeholder="e.g. 522123"
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      Direct Contact Phone
                    </label>
                    <input
                      type="text"
                      disabled={isRestricted}
                      value={formData.contactPhone || ''}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="e.g. +254 712 345 678"
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      Store Support Email
                    </label>
                    <input
                      type="email"
                      disabled={isRestricted}
                      value={formData.contactEmail || ''}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="e.g. orders@riftvalleyroses.co.ke"
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    Store Bio & Artisan Story
                  </label>
                  <textarea
                    rows={4}
                    disabled={isRestricted}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell buyers about your flower farm sourcing, bouquet style, and floral design philosophy..."
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* SECTION 2: BRANDING */}
            {activeSection === 'branding' && (
              <div className="space-y-5">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-base font-serif font-bold text-stone-800">Branding & Visual Presentation</h3>
                  <p className="text-xs text-stone-500">Configure store logo, hero banner image, and visual cards.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      Logo Image URL
                    </label>
                    <input
                      type="text"
                      disabled={isRestricted}
                      value={formData.logoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="Paste image link e.g. https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      Cover Banner Image URL
                    </label>
                    <input
                      type="text"
                      disabled={isRestricted}
                      value={formData.bannerUrl || ''}
                      onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                      placeholder="Paste Unsplash wide banner link"
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800"
                    />
                  </div>

                  {/* Live Brand Card Preview */}
                  <div className="mt-6 p-4 border border-stone-200 rounded-2xl bg-[#FAF9F6]">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-3">
                      Public Store Header Preview
                    </span>
                    <div className="relative rounded-xl overflow-hidden border border-stone-200 shadow-sm bg-white">
                      <div className="h-32 bg-stone-200 relative overflow-hidden">
                        <img
                          src={formData.bannerUrl || 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800&auto=format&fit=crop&q=60'}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-2xl border-2 border-white shadow-md bg-stone-100 overflow-hidden shrink-0 -mt-8 relative z-10">
                          <img
                            src={formData.logoUrl || 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=150&auto=format&fit=crop&q=60'}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-stone-800 text-sm">
                            {formData.storeName || 'Your Store Name'}
                          </h4>
                          <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                            {formData.description || 'Artisan flower studio & fresh Kenyan bouquets.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: LOCATION */}
            {activeSection === 'location' && (
              <div className="space-y-5">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-base font-serif font-bold text-stone-800">Physical Studio Location</h3>
                  <p className="text-xs text-stone-500">Physical pickup location and county coordinates for route routing.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      Physical Street Address / Building Name *
                    </label>
                    <input
                      type="text"
                      disabled={isRestricted}
                      value={formData.addressText || ''}
                      onChange={(e) => setFormData({ ...formData, addressText: e.target.value })}
                      required
                      placeholder="e.g. Peponi Plaza, Ground Floor, Peponi Road"
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      County
                    </label>
                    <select
                      disabled={isRestricted}
                      value={formData.county || 'Nairobi'}
                      onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800 bg-white"
                    >
                      <option value="Nairobi">Nairobi</option>
                      <option value="Kiambu">Kiambu</option>
                      <option value="Nakuru">Nakuru (Naivasha)</option>
                      <option value="Machakos">Machakos</option>
                      <option value="Kajiado">Kajiado</option>
                      <option value="Mombasa">Mombasa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      Town / Area
                    </label>
                    <input
                      type="text"
                      disabled={isRestricted}
                      value={formData.town || ''}
                      onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                      placeholder="e.g. Westlands, Karen, Lavington, Naivasha"
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      Latitude Coordinates
                    </label>
                    <input
                      type="number"
                      step="any"
                      disabled={isRestricted}
                      value={formData.latitude ?? -1.2676}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      Longitude Coordinates
                    </label>
                    <input
                      type="number"
                      step="any"
                      disabled={isRestricted}
                      value={formData.longitude ?? 36.8115}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: DELIVERY SETTINGS */}
            {activeSection === 'delivery' && (
              <div className="space-y-5">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-base font-serif font-bold text-stone-800">Delivery Logistics & Thresholds</h3>
                  <p className="text-xs text-stone-500">Service coverage radius, order minimums, and cut-off schedule.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      Delivery Radius (Kilometers)
                    </label>
                    <input
                      type="number"
                      disabled={isRestricted}
                      value={formData.deliveryRadiusKm ?? 15}
                      onChange={(e) => setFormData({ ...formData, deliveryRadiusKm: parseInt(e.target.value) })}
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      Minimum Order Amount (KES)
                    </label>
                    <input
                      type="number"
                      disabled={isRestricted}
                      value={formData.minimumOrderAmount ?? 1500}
                      onChange={(e) => setFormData({ ...formData, minimumOrderAmount: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      Standard Delivery Fee (KES)
                    </label>
                    <input
                      type="number"
                      disabled={isRestricted}
                      value={formData.deliveryFeeStandard ?? 350}
                      onChange={(e) => setFormData({ ...formData, deliveryFeeStandard: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      Same-Day Order Cut-Off Time
                    </label>
                    <input
                      type="time"
                      disabled={isRestricted}
                      value={formData.deliveryCutoffTime || '15:00'}
                      onChange={(e) => setFormData({ ...formData, deliveryCutoffTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800 font-semibold"
                    />
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <label className="flex items-center space-x-3 p-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={isRestricted}
                        checked={formData.sameDayDeliveryAvailable ?? true}
                        onChange={(e) => setFormData({ ...formData, sameDayDeliveryAvailable: e.target.checked })}
                        className="w-4 h-4 text-[#2D5A27] rounded focus:ring-[#2D5A27]"
                      />
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">Offer Same-Day Flower Delivery</span>
                        <span className="text-[11px] text-stone-500">Allow customers to place same-day delivery orders before the cut-off time.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: OPERATING HOURS */}
            {activeSection === 'hours' && (
              <div className="space-y-5">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-base font-serif font-bold text-stone-800">Weekly Operating Schedule</h3>
                  <p className="text-xs text-stone-500">Define store open hours for customer pickups and order dispatch.</p>
                </div>

                <div className="space-y-3">
                  {formData.businessHours?.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl border border-stone-100 bg-stone-50/50 gap-3">
                      <div className="w-28 flex items-center space-x-2">
                        <span className="text-xs font-bold text-stone-800">{item.day}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-1.5 text-xs text-stone-600 font-medium">
                          <input
                            type="checkbox"
                            disabled={isRestricted}
                            checked={item.isClosed}
                            onChange={(e) => {
                              const updated = [...(formData.businessHours || [])];
                              updated[idx].isClosed = e.target.checked;
                              setFormData({ ...formData, businessHours: updated });
                            }}
                            className="w-3.5 h-3.5 text-[#2D5A27] rounded"
                          />
                          <span>Closed Day</span>
                        </label>
                      </div>

                      {!item.isClosed && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="time"
                            disabled={isRestricted}
                            value={item.open}
                            onChange={(e) => {
                              const updated = [...(formData.businessHours || [])];
                              updated[idx].open = e.target.value;
                              setFormData({ ...formData, businessHours: updated });
                            }}
                            className="px-2.5 py-1.5 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 font-mono"
                          />
                          <span className="text-xs text-stone-400">to</span>
                          <input
                            type="time"
                            disabled={isRestricted}
                            value={item.close}
                            onChange={(e) => {
                              const updated = [...(formData.businessHours || [])];
                              updated[idx].close = e.target.value;
                              setFormData({ ...formData, businessHours: updated });
                            }}
                            className="px-2.5 py-1.5 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 font-mono"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 6: SOCIAL MEDIA */}
            {activeSection === 'social' && (
              <div className="space-y-5">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-base font-serif font-bold text-stone-800">Social Media & Direct Channels</h3>
                  <p className="text-xs text-stone-500">Connect your Instagram, TikTok, and WhatsApp Business link.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      Instagram Handle / URL
                    </label>
                    <input
                      type="text"
                      disabled={isRestricted}
                      value={formData.socials?.instagram || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, socials: { ...formData.socials, instagram: e.target.value } })
                      }
                      placeholder="@riftvalleyroses"
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      WhatsApp Business Number
                    </label>
                    <input
                      type="text"
                      disabled={isRestricted}
                      value={formData.socials?.whatsapp || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, socials: { ...formData.socials, whatsapp: e.target.value } })
                      }
                      placeholder="+254712345678"
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      Facebook Page URL
                    </label>
                    <input
                      type="text"
                      disabled={isRestricted}
                      value={formData.socials?.facebook || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, socials: { ...formData.socials, facebook: e.target.value } })
                      }
                      placeholder="https://facebook.com/riftvalleyroses"
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      TikTok Account
                    </label>
                    <input
                      type="text"
                      disabled={isRestricted}
                      value={formData.socials?.tiktok || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, socials: { ...formData.socials, tiktok: e.target.value } })
                      }
                      placeholder="@riftvalleyroses"
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:bg-stone-50 text-stone-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center space-x-2">
                <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Save Action Bar */}
            <div className="flex items-center justify-between border-t border-stone-100 pt-4">
              <div>
                {saveSuccess && (
                  <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1.5">
                    <CheckCircle2 size={16} />
                    <span>Shop Management details updated successfully!</span>
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={saving || isRestricted}
                className="bg-[#2D5A27] hover:bg-[#23471f] disabled:bg-stone-300 text-white font-semibold py-2.5 px-6 rounded-xl text-xs shadow-xs transition-colors flex items-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                <span>{saving ? 'Saving...' : 'Save Shop Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
