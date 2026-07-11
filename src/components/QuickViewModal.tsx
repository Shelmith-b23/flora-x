import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Calendar, MessageSquare, Plus, Minus, Check, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useApp();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [size, setSize] = useState<'Standard' | 'Deluxe' | 'Grandee'>('Standard');
  const [quantity, setQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Morning (8 AM - 12 PM)');
  const [cardMessage, setCardMessage] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  // Set default date to today or tomorrow
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setDeliveryDate(`${year}-${month}-${day}`);
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  // Sizing pricing multipliers
  const sizePriceAdjustment = {
    Standard: 0,
    Deluxe: 1500,
    Grandee: 3000,
  };

  const finalPrice = quickViewProduct.price + sizePriceAdjustment[size];

  const handleAddToCart = () => {
    addToCart({
      product: quickViewProduct,
      quantity,
      size,
      deliveryDate,
      deliverySlot,
      cardMessage: cardMessage.trim() || undefined,
    });
    
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setQuickViewProduct(null); // Close modal on success
      // Reset variables
      setSize('Standard');
      setQuantity(1);
      setCardMessage('');
    }, 1200);
  };

  // Keyboard dismiss
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setQuickViewProduct(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setQuickViewProduct(null)}
          className="fixed inset-0 bg-text-primary/40 backdrop-blur-xs"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-4xl bg-surface border border-utility-border rounded-xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]"
          id="quickview-modal"
        >
          {/* Close Button */}
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-text-primary border border-utility-border hover:scale-105 active:scale-95 transition-all shadow-sm"
            aria-label="Close modal"
            id="close-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Left Column: Image Area */}
          <div className="w-full md:w-1/2 bg-canvas flex flex-col p-4 md:p-6 border-b md:border-b-0 md:border-r border-utility-border justify-center overflow-hidden">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white border border-utility-border">
              <img
                src={quickViewProduct.images[activeImageIdx]}
                alt={quickViewProduct.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Image Thumbnail Selector */}
            {quickViewProduct.images.length > 1 && (
              <div className="flex gap-2.5 mt-4 justify-center">
                {quickViewProduct.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`w-14 h-14 rounded-md overflow-hidden border-2 transition-all ${
                      activeImageIdx === i ? 'border-brand-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Interaction Form */}
          <div className="w-full md:w-1/2 flex flex-col p-6 md:p-8 overflow-y-auto max-h-[60vh] md:max-h-full">
            {/* Header */}
            <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary font-display mb-1">
              By {quickViewProduct.floristName}
            </span>
            <h2 className="text-xl md:text-2xl font-display font-semibold text-text-primary tracking-tight mb-2">
              {quickViewProduct.title}
            </h2>

            {/* Rating and Price */}
            <div className="flex items-center justify-between border-b border-utility-border pb-4 mb-4">
              <div className="flex items-center gap-1">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(quickViewProduct.rating) ? 'fill-current' : 'text-utility-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-text-secondary">
                  ({quickViewProduct.reviewsCount} reviews)
                </span>
              </div>
              <div className="text-lg md:text-xl font-semibold font-mono text-brand-primary">
                KES {finalPrice.toLocaleString()}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed mb-5">
              {quickViewProduct.description}
            </p>

            {/* Sizes */}
            <div className="mb-5">
              <label className="block text-xs uppercase tracking-wider font-semibold font-display text-text-muted mb-2">
                Choose Bouquet Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Standard', 'Deluxe', 'Grandee'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`p-2.5 rounded-md border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                      size === s
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                        : 'border-utility-border bg-white text-text-secondary hover:border-text-muted'
                    }`}
                  >
                    <span className="text-xs font-semibold">{s}</span>
                    <span className="text-[10px] text-text-muted mt-0.5">
                      {s === 'Standard' ? 'Base Price' : `+ KES ${sizePriceAdjustment[s].toLocaleString()}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Date & Slots */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                  Select Delivery Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full p-2 text-xs border border-utility-border rounded-md bg-white focus:outline-hidden focus:border-brand-primary font-mono text-text-secondary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                  Delivery Window
                </label>
                <select
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                  className="w-full p-2 text-xs border border-utility-border rounded-md bg-white focus:outline-hidden focus:border-brand-primary text-text-secondary"
                >
                  <option>Morning (8 AM - 12 PM)</option>
                  <option>Afternoon (12 PM - 4 PM)</option>
                  <option>Evening (4 PM - 8 PM)</option>
                </select>
              </div>
            </div>

            {/* Message Card */}
            <div className="mb-6">
              <label className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-brand-secondary" />
                Handwritten Gift Message (Optional)
              </label>
              <textarea
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value)}
                placeholder="Enter a message to be handwritten on our luxury cards. (Max 150 characters)"
                maxLength={150}
                rows={2}
                className="w-full p-2.5 text-xs border border-utility-border rounded-md bg-white focus:outline-hidden focus:border-brand-primary text-text-secondary resize-none"
              />
              <span className="text-[10px] text-text-muted text-right block mt-1 font-mono">
                {cardMessage.length}/150 chars
              </span>
            </div>

            {/* Bottom Actions: Quantity & Add to Cart */}
            <div className="mt-auto pt-4 border-t border-utility-border flex items-center gap-4">
              <div className="flex items-center border border-utility-border rounded-md h-11 bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 text-text-secondary hover:text-brand-primary hover:scale-110 active:scale-95 transition-all"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-semibold font-mono text-sm text-text-primary select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 text-text-secondary hover:text-brand-primary hover:scale-110 active:scale-95 transition-all"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`flex-1 h-11 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isAdded
                    ? 'bg-utility-success text-white'
                    : 'bg-brand-primary text-white hover:bg-brand-primary-hover active:scale-[0.98]'
                }`}
                id="add-to-cart-submit"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 animate-bounce" />
                    Added Successfully!
                  </>
                ) : (
                  <>
                    Add To Bouquet Cart
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
