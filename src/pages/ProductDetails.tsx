import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, Truck, Calendar, ShoppingBag, ShieldCheck, Heart, ArrowLeft, Check, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_PRODUCTS, MOCK_REVIEWS } from '../data';

export function ProductDetails() {
  const { addToCart, wishlist, toggleWishlist } = useApp();
  const [product, setProduct] = useState(MOCK_PRODUCTS[0]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [size, setSize] = useState<'Standard' | 'Deluxe' | 'Grandee'>('Standard');
  const [quantity, setQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Morning (8 AM - 12 PM)');
  const [cardMessage, setCardMessage] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const [postCode, setPostCode] = useState('');
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping'>('details');

  const sizePriceAdjustment = {
    Standard: 0,
    Deluxe: 1500,
    Grandee: 3000,
  };

  useEffect(() => {
    // Parse ID from hash: e.g. #/product/p1
    const parts = window.location.hash.split('/');
    const id = parts[parts.length - 1];
    const match = MOCK_PRODUCTS.find((p) => p.id === id);
    if (match) {
      setProduct(match);
      setActiveImageIdx(0);
    }
    
    // Set default delivery date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setDeliveryDate(`${year}-${month}-${day}`);
  }, [window.location.hash]);

  const finalPrice = product.price + sizePriceAdjustment[size];
  const isWishlisted = wishlist.includes(product.id);

  const handleAddToCart = () => {
    addToCart({
      product,
      quantity,
      size,
      deliveryDate,
      deliverySlot,
      cardMessage: cardMessage.trim() || undefined,
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handlePostCodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const postalInt = parseInt(postCode);
    if (isNaN(postalInt)) {
      setCheckResult('Invalid code. Please specify a numeric postal code.');
      return;
    }
    // Simulate same-day service codes for Kenya (e.g. Nairobi, Eldoret, Mombasa)
    if (postalInt >= 100 && postalInt <= 1100) {
      setCheckResult('🟢 Perfect! Same-Day Delivery is fully available for this location.');
    } else {
      setCheckResult('🟡 Standard Delivery (Next-Day) is available for this location.');
    }
  };

  return (
    <div className="pt-24 pb-16 bg-canvas" id="product-details-page">
      <div className="w-full max-w-7xl mx-auto px-6">
        {/* Back Link */}
        <button
          onClick={() => { window.location.hash = '#/shop'; }}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-brand-primary mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </button>

        {/* Dual Column Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-12">
          {/* Left Column: Premium Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-utility-border shadow-md">
              <img
                src={product.images[activeImageIdx]}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/95 shadow-md hover:scale-105 active:scale-95 transition-all text-text-primary"
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isWishlisted ? 'fill-brand-secondary text-brand-secondary' : 'text-text-secondary'
                  }`}
                />
              </button>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-3 justify-center">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-white shadow-xs transition-all ${
                      activeImageIdx === i ? 'border-brand-primary' : 'border-transparent opacity-80'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Customization and Checkout Details */}
          <div className="lg:col-span-6 bg-white border border-utility-border rounded-2xl p-6 md:p-8 shadow-xs">
            <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary font-display block mb-1">
              Hand-crafted By {product.floristName}
            </span>
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-text-primary tracking-tight mb-2">
              {product.title}
            </h1>

            {/* Price and Rating */}
            <div className="flex items-center justify-between border-b border-utility-border pb-4 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'fill-current' : 'text-utility-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-text-secondary font-mono">
                  {product.rating} ({product.reviewsCount} verified reviews)
                </span>
              </div>

              <div className="text-xl md:text-2xl font-semibold font-mono text-brand-primary">
                KES {finalPrice.toLocaleString()}
              </div>
            </div>

            <p className="text-xs md:text-sm text-text-secondary leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Same Day Checker */}
            <div className="p-4 bg-canvas border border-utility-border rounded-xl mb-6">
              <form onSubmit={handlePostCodeCheck} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={postCode}
                  onChange={(e) => setPostCode(e.target.value)}
                  placeholder="Enter postal code (e.g. 00100 for Nairobi)..."
                  className="w-full px-3 py-2 text-xs border border-utility-border rounded-md bg-white focus:outline-hidden focus:border-brand-primary font-mono text-text-secondary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md transition-all shrink-0 cursor-pointer"
                >
                  Verify Shipping
                </button>
              </form>
              {checkResult && (
                <p className="text-[11px] mt-2 font-medium text-text-secondary">{checkResult}</p>
              )}
            </div>

            {/* Sizing options */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider font-semibold font-display text-text-muted mb-2">
                Select Sizing Variation
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Standard', 'Deluxe', 'Grandee'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                      size === s
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                        : 'border-utility-border bg-white text-text-secondary'
                    }`}
                  >
                    <span className="text-xs font-semibold">{s}</span>
                    <span className="text-[9px] text-text-muted font-mono mt-0.5">
                      {s === 'Standard' ? 'Base Size' : `+ KES ${sizePriceAdjustment[s].toLocaleString()}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar & Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                  Fulfillment Date
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full p-2.5 text-xs border border-utility-border rounded-md bg-white focus:outline-hidden focus:border-brand-primary font-mono text-text-secondary"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                  Fulfillment Slot
                </label>
                <select
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                  className="w-full p-2.5 text-xs border border-utility-border rounded-md bg-white focus:outline-hidden focus:border-brand-primary text-text-secondary font-medium"
                >
                  <option>Morning (8 AM - 12 PM)</option>
                  <option>Afternoon (12 PM - 4 PM)</option>
                  <option>Evening (4 PM - 8 PM)</option>
                </select>
              </div>
            </div>

            {/* Card Message */}
            <div className="mb-6">
              <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                Handwritten Message Card (Free Accent)
              </label>
              <textarea
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value)}
                placeholder="Include a beautiful greeting message to be handwritten on our luxury cards. (Max 150 characters)"
                maxLength={150}
                rows={2}
                className="w-full p-3 text-xs border border-utility-border rounded-md bg-white focus:outline-hidden focus:border-brand-primary text-text-secondary resize-none"
              />
              <span className="text-[10px] text-text-muted text-right block mt-1 font-mono">
                {cardMessage.length}/150 characters
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-utility-border">
              <div className="flex items-center border border-utility-border rounded-md bg-white h-12">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 hover:text-brand-primary hover:scale-105 transition-all text-text-secondary font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold font-mono text-sm text-text-primary">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 hover:text-brand-primary hover:scale-105 transition-all text-text-secondary font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`flex-1 h-12 rounded-md font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isAdded
                    ? 'bg-utility-success text-white'
                    : 'bg-brand-primary text-white hover:bg-brand-primary-hover active:scale-[0.98]'
                }`}
                id="add-to-cart-submit"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Bouquet Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Secure Order Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights Tabs */}
        <div className="bg-white border border-utility-border rounded-2xl overflow-hidden shadow-xs mb-12">
          <div className="flex border-b border-utility-border bg-canvas">
            {(['details', 'care', 'shipping'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-r border-utility-border transition-all cursor-pointer ${
                  activeTab === t
                    ? 'bg-white text-brand-primary border-b-2 border-b-brand-primary'
                    : 'text-text-secondary hover:text-brand-primary'
                }`}
              >
                {t === 'details' ? 'Details & Features' : t === 'care' ? 'Farm Care Tips' : 'Fulfillment Logistics'}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'details' && (
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-sm text-text-primary">Signature Features:</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-text-secondary">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
                      {feat}
                    </li>
                  ))}
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
                    Includes premium flower food sachet
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
                    Arranged in our signature textured presentation wrap
                  </li>
                </ul>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
                <p>
                  To maximize the lifespan of your beautiful Kenyan blooms, follow these 3 professional floriculture tips straight from Rift Valley cultivators:
                </p>
                <ol className="list-decimal list-inside space-y-2 font-medium">
                  <li>
                    <span className="text-text-primary">Trim Stems:</span> Recut every flower stem at a 45-degree angle under cold water using sharp shears before display.
                  </li>
                  <li>
                    <span className="text-text-primary">Water Refresh:</span> Keep your vase filled with ice-cold water. Change it completely and clean the interior every 2 days.
                  </li>
                  <li>
                    <span className="text-text-primary">Placement:</span> Situate your flowers in a cool room out of direct African sunlight and away from ripening avocados or bananas.
                  </li>
                </ol>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
                <p>
                  Our advanced floral delivery system operates temperature-regulated cold chambers across all transit points:
                </p>
                <ul className="list-disc list-inside space-y-1.5 font-medium">
                  <li>Same-Day delivery cut-off: 1 PM daily.</li>
                  <li>Hand-delivered in structured water pouches to protect roots during transport.</li>
                  <li>Our logistics coordinates with M-Pesa tracking alerts.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Review logs */}
        <div className="space-y-6">
          <h2 className="font-display font-semibold text-lg text-text-primary tracking-tight">
            Arrangement Reviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_REVIEWS.filter(r => r.productName === product.title || !r.productName).map((review) => (
              <div key={review.id} className="bg-white p-5 border border-utility-border rounded-xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] text-text-muted font-mono">{review.date}</span>
                </div>
                <p className="text-xs text-text-secondary italic leading-relaxed">
                  "{review.comment}"
                </p>
                <div className="flex items-center gap-2.5 pt-2">
                  <img
                    src={review.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border border-utility-border"
                  />
                  <div className="text-[10px] font-semibold text-text-primary">
                    {review.customerName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
