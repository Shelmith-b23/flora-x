import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Store, MapPin, CheckCircle, CreditCard, ArrowRight, ArrowLeft, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function FloristRegistrationWizard() {
  const { user, submitFloristOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [description, setDescription] = useState('');
  const [addressText, setAddressText] = useState('');
  const [latitude, setLatitude] = useState(-1.2921); // Nairobi Center
  const [longitude, setLongitude] = useState(36.8219);
  const [tillNumber, setTillNumber] = useState('');
  const [deliveryRadius, setDeliveryRadius] = useState(15);
  const [minOrder, setMinOrder] = useState(1000);
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  // Validate user session
  if (!user) {
    window.location.hash = '#/login';
    return null;
  }

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!storeName || !legalName || !description) {
        setError('Please fill in all store description and name fields.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!addressText) {
        setError('Please specify your greenhouse / studio address.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!tillNumber) {
        setError('Safaricom M-Pesa Buy Goods Till is required for payouts.');
        return;
      }
      setStep(4);
    }
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await submitFloristOnboarding({
        storeName,
        description,
        legalBusinessName: legalName,
        businessRegistrationNumber: regNumber,
        mpesaTillNumber: tillNumber,
        addressText,
        latitude,
        longitude,
        logoUrl,
        bannerUrl,
        deliveryRadiusKm: deliveryRadius,
        minimumOrderAmount: minOrder,
        businessHours: [
          { dayOfWeek: 1, openTime: '08:00', closeTime: '18:00' },
          { dayOfWeek: 2, openTime: '08:00', closeTime: '18:00' },
          { dayOfWeek: 3, openTime: '08:00', closeTime: '18:00' },
          { dayOfWeek: 4, openTime: '08:00', closeTime: '18:00' },
          { dayOfWeek: 5, openTime: '08:00', closeTime: '18:00' },
          { dayOfWeek: 6, openTime: '08:00', closeTime: '15:00' },
          { dayOfWeek: 0, openTime: '09:00', closeTime: '13:00', isClosed: true }
        ]
      });
      setSubmitting(false);
      window.location.hash = '#/pending-approval';
    } catch (err: any) {
      setSubmitting(false);
      setError(err.message);
    }
  };

  // Helper mock loader for fast sandbox testing
  const populateMockFlorist = () => {
    setStoreName('Naivasha Sunset Blooms');
    setLegalName('Sunset Flora Logistics Ltd');
    setRegNumber('CPR/2026/88319');
    setDescription('Highland rose curations sourced fresh from Naivasha crater farms. Specialized in delicate premium wrapping and cold chains.');
    setAddressText('Moi South Lake Road, Naivasha');
    setLatitude(-0.7303);
    setLongitude(36.4251);
    setTillNumber('552233');
    setDeliveryRadius(25);
    setMinOrder(1500);
    setLogoUrl('https://images.unsplash.com/photo-1596436889106-be35e843f974?w=150&auto=format&fit=crop&q=60');
    setBannerUrl('https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800&auto=format&fit=crop&q=60');
  };

  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen flex items-center justify-center px-6" id="florist-wizard-page">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Progress Tracker Header */}
        <div className="space-y-4">
          <div className="text-center space-y-1.5">
            <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary block">
              Store Setup Wizard
            </span>
            <h1 className="text-3xl font-display font-semibold text-text-primary tracking-tight">
              Open Your Floral Boutique
            </h1>
            <p className="text-xs text-text-muted">Fill in your business parameters to connect with premium buyers in Kenya.</p>
          </div>

          {/* Stepper bar */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, label: 'Boutique Profile', icon: Store },
              { num: 2, label: 'Location Hub', icon: MapPin },
              { num: 3, label: 'Payouts & Assets', icon: CreditCard },
              { num: 4, label: 'Review Application', icon: CheckCircle }
            ].map((st) => {
              const IconComp = st.icon;
              const isActive = step === st.num;
              const isPassed = step > st.num;
              return (
                <div key={st.num} className="space-y-1.5 text-center">
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-brand-primary' : isPassed ? 'bg-brand-primary-hover' : 'bg-utility-border'
                  }`} />
                  <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider font-semibold">
                    <IconComp className={`w-3 h-3 ${isActive || isPassed ? 'text-brand-primary' : 'text-text-muted'}`} />
                    <span className={isActive ? 'text-text-primary font-bold' : 'text-text-muted'}>{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Main Card */}
        <motion.div 
          key={step}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white border border-utility-border rounded-2xl p-6 md:p-8 shadow-xs space-y-6"
        >
          {error && (
            <div className="p-3 bg-utility-error/10 border border-utility-error/25 rounded-md text-xs text-brand-primary">
              {error}
            </div>
          )}

          {/* STEP 1: BUSINESS BASE INFO */}
          {step === 1 && (
            <div className="space-y-4 text-left">
              <h2 className="font-display font-semibold text-text-primary text-base border-b border-utility-border pb-2">
                1. Storefront Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                    Store / Boutique Name
                  </label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Naivasha Highlands Florist"
                    className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                    Legal Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="e.g. Highlands Flora Limited"
                    className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                  Business Registration / License Number <span className="text-text-muted font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="e.g. CPR/2026/112233"
                  className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                  Store Description & Floral Sourcing ties
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell our customers and administrators about your design studio experience, cold storage capacity, and ties to Naivasha growers..."
                  className="w-full p-3 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION HUB */}
          {step === 2 && (
            <div className="space-y-4 text-left">
              <h2 className="font-display font-semibold text-text-primary text-base border-b border-utility-border pb-2">
                2. Geographic Coordinates & Hub Parameters
              </h2>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                  Studio Address Directions / Street Landmark
                </label>
                <input
                  type="text"
                  required
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  placeholder="e.g. Rhapta Road, Block C, Westlands, Nairobi"
                  className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                    Greenhouse Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                    Greenhouse Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                    Delivery Radius (Kilometers)
                  </label>
                  <input
                    type="number"
                    required
                    value={deliveryRadius}
                    onChange={(e) => setDeliveryRadius(parseInt(e.target.value))}
                    className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                    Minimum Order Amount (KES)
                  </label>
                  <input
                    type="number"
                    required
                    value={minOrder}
                    onChange={(e) => setMinOrder(parseInt(e.target.value))}
                    className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYOUTS & ASSETS */}
          {step === 3 && (
            <div className="space-y-4 text-left">
              <h2 className="font-display font-semibold text-text-primary text-base border-b border-utility-border pb-2">
                3. Safaricom M-Pesa Till & Assets
              </h2>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5 font-display">
                  Safaricom M-Pesa Buy Goods Till Number
                </label>
                <input
                  type="text"
                  required
                  value={tillNumber}
                  onChange={(e) => setTillNumber(e.target.value)}
                  placeholder="e.g. 553311"
                  className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary font-mono"
                />
                <span className="text-[10px] text-text-muted mt-1 block">
                  All customer card/M-Pesa payments on the platform are aggregated, deducting our 20% platform commission, and settled to your till.
                </span>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                  Boutique Logo Image URL
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or leave blank for preset"
                    className="w-full pl-9 pr-4 py-3 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1.5">
                  Boutique Store Banner URL
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or leave blank for preset"
                    className="w-full pl-9 pr-4 py-3 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="space-y-4 text-left">
              <h2 className="font-display font-semibold text-text-primary text-base border-b border-utility-border pb-2">
                4. Review Boutique Application
              </h2>

              <p className="text-xs text-text-secondary">
                Please audit the parameters below before committing the registration request to our curation desk:
              </p>

              <div className="bg-canvas p-4 rounded-xl border border-utility-border text-xs text-text-secondary space-y-2.5 font-medium">
                <div>🛍️ <span className="text-text-muted">Boutique Name:</span> <span className="text-text-primary font-bold">{storeName}</span></div>
                <div>🏢 <span className="text-text-muted">Legal Business Name:</span> <span className="text-text-primary">{legalName}</span></div>
                <div>📍 <span className="text-text-muted">Greenhouse Location:</span> <span className="text-text-primary">{addressText} ({latitude}, {longitude})</span></div>
                <div>💸 <span className="text-text-muted">Payout Account:</span> <span className="text-text-primary font-mono">M-Pesa Buy Goods Till: {tillNumber}</span></div>
                <div>🚚 <span className="text-text-muted">Delivery parameters:</span> <span className="text-text-primary">Min Order {minOrder} KES / Radius {deliveryRadius} Km</span></div>
              </div>

              <div className="p-3.5 bg-brand-primary/5 rounded-lg border border-brand-primary/10 text-[11px] text-text-secondary leading-relaxed">
                ⚖️ By clicking 'Submit Store Profile', you represent that your greenhouses comply with regional agricultural water reuse guidelines and agree to our standard 20% florist commission model.
              </div>
            </div>
          )}

          {/* Buttons Area */}
          <div className="pt-4 border-t border-utility-border flex justify-between items-center">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="px-4 py-2.5 border border-utility-border hover:bg-canvas rounded-md text-xs font-semibold uppercase tracking-wider text-text-secondary cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4 text-brand-primary" />
                Back
              </button>
            ) : (
              // Fast simulator populater
              <button
                type="button"
                onClick={populateMockFlorist}
                className="px-4 py-2 border border-brand-primary/20 bg-brand-primary/5 hover:bg-brand-primary/10 rounded-md text-[10px] font-bold uppercase tracking-wider text-brand-primary cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Quick Populate Form
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-brand-primary text-white hover:bg-brand-primary-hover rounded-md text-xs font-semibold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-brand-primary text-white hover:bg-brand-primary-hover rounded-md text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 disabled:bg-brand-primary/50"
              >
                {submitting ? 'Submitting App...' : 'Submit Store Profile'}
                {!submitting && <CheckCircle className="w-4 h-4" />}
              </button>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
