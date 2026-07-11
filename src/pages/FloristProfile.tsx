import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Award, Calendar, ShieldCheck, ArrowLeft, Star } from 'lucide-react';
import { MOCK_FLORISTS, MOCK_PRODUCTS } from '../data';
import { ProductCard } from '../components/ProductCard';

export function FloristProfile() {
  const [florist, setFlorist] = useState(MOCK_FLORISTS[0]);
  const [floristProducts, setFloristProducts] = useState(MOCK_PRODUCTS);

  useEffect(() => {
    // Parse ID from hash: e.g. #/florist/f1
    const parts = window.location.hash.split('/');
    const id = parts[parts.length - 1];
    const match = MOCK_FLORISTS.find((f) => f.id === id);
    if (match) {
      setFlorist(match);
      // Filter products by this florist
      const items = MOCK_PRODUCTS.filter((p) => p.floristId === id);
      setFloristProducts(items);
    }
  }, [window.location.hash]);

  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen" id="florist-profile-page">
      {/* Cover Banner */}
      <div className="h-64 md:h-80 w-full relative bg-canvas overflow-hidden">
        <img src={florist.banner} alt="" className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6 max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-6 items-end justify-between text-white z-10">
          <div className="flex gap-4 items-end">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-4 border-white bg-white shadow-xl shrink-0">
              <img src={florist.logo} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl md:text-3xl font-display font-semibold tracking-tight">
                  {florist.name}
                </h1>
                {florist.verified && (
                  <span className="px-2 py-0.5 bg-brand-primary text-white text-[9px] font-bold uppercase tracking-wider rounded-xs">
                    Verified Master
                  </span>
                )}
              </div>
              <p className="text-xs text-white/90 flex items-center gap-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-brand-secondary shrink-0" />
                {florist.location}
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-center shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 text-center">
              <div className="text-lg font-bold font-mono">★ {florist.rating}</div>
              <div className="text-[9px] uppercase tracking-wider text-white/80 font-semibold">{florist.reviewsCount} Reviews</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar Info Card */}
        <div className="lg:col-span-4 space-y-6">
          <button
            onClick={() => { window.location.hash = '#/florists'; }}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-brand-primary cursor-pointer mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Florists
          </button>

          <div className="bg-white border border-utility-border rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <h3 className="font-display font-semibold text-xs uppercase tracking-widest text-text-muted mb-2">
                About the Studio
              </h3>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                {florist.about}
              </p>
            </div>

            <div className="border-t border-utility-border pt-4 space-y-3">
              <h3 className="font-display font-semibold text-xs uppercase tracking-widest text-text-muted mb-2">
                Fulfillment Specs
              </h3>
              <div className="space-y-2 text-xs text-text-secondary">
                <div className="flex justify-between">
                  <span className="font-medium text-text-muted">Delivery Radius:</span>
                  <span className="font-semibold font-mono">{florist.deliveryRadiusKm} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-text-muted">Min Order:</span>
                  <span className="font-semibold font-mono">KES {florist.minOrderValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-text-muted">Delivery Fee:</span>
                  <span className="font-semibold font-mono">KES {florist.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-text-muted">Guild Member Since:</span>
                  <span className="font-semibold font-mono">{florist.established}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-utility-border pt-4 space-y-3">
              <h3 className="font-display font-semibold text-xs uppercase tracking-widest text-text-muted mb-2">
                Contact & Address
              </h3>
              <div className="space-y-2.5 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-primary shrink-0" />
                  <span className="font-semibold font-mono">{florist.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-primary shrink-0" />
                  <span className="font-semibold truncate">{florist.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <span>{florist.address}</span>
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="border-t border-utility-border pt-4 p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-primary uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                Flora_X Trust Verified
              </div>
              <ul className="space-y-1.5 text-[10px] font-medium text-text-secondary">
                <li className="flex items-center gap-1.5">🟢 Verified physical business licenses</li>
                <li className="flex items-center gap-1.5">🟢 Temperature control audit passed</li>
                <li className="flex items-center gap-1.5">🟢 Sourced from local Rift valley crops</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Product Grid Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="border-b border-utility-border pb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg text-text-primary tracking-tight">
              Bespoke Studio Curations ({floristProducts.length})
            </h2>
          </div>

          {floristProducts.length === 0 ? (
            <div className="bg-white border border-utility-border rounded-2xl p-12 text-center max-w-md mx-auto">
              <p className="text-xs text-text-secondary font-medium">No active collections found in this shop at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {floristProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
