import React from 'react';
import { motion } from 'motion/react';
import { Heart, Star, Eye, Truck, ShieldCheck, Check } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export function ProductCard({ product }: ProductCardProps) {
  const { wishlist, toggleWishlist, setQuickViewProduct, addToCart } = useApp();
  const isWishlisted = wishlist.includes(product.id);

  const handleCardClick = () => {
    window.location.hash = `#/product/${product.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      product,
      quantity: 1,
      size: 'Standard',
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleFloristClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.hash = `#/florist/${product.floristId}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white border border-utility-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_12px_28px_rgba(45,90,39,0.08)] hover:border-brand-primary/30 cursor-pointer"
      id={`product-card-${product.id}`}
    >
      {/* 1. Image Canvas & Overlays */}
      <div className="relative aspect-[4/5] bg-canvas overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-xs shadow-xs text-text-secondary hover:text-brand-secondary transition-all hover:scale-110 active:scale-95 cursor-pointer"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          id={`wishlist-btn-${product.id}`}
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-300 ${
              isWishlisted ? 'fill-brand-secondary text-brand-secondary' : 'text-text-secondary'
            }`}
          />
        </button>

        {/* Badges Stack */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {product.isTrending && (
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase font-display bg-brand-primary text-white rounded-xs shadow-xs">
              Trending
            </span>
          )}
          {product.isSeasonal && (
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase font-display bg-brand-secondary text-white rounded-xs shadow-xs">
              Seasonal
            </span>
          )}
        </div>

        {/* Quick View Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 px-4 gap-2 z-10">
          <button
            onClick={handleQuickView}
            className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider bg-white text-text-primary hover:bg-canvas transition-all rounded-lg shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            id={`quickview-btn-${product.id}`}
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
          
          <button
            onClick={handleQuickAdd}
            className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider bg-brand-primary text-white hover:bg-brand-primary-hover transition-all rounded-lg shadow-md cursor-pointer"
            id={`quickadd-btn-${product.id}`}
          >
            + Add to Cart
          </button>
        </div>
      </div>

      {/* 2. Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Florist Credential & Rating */}
          <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
            <span
              onClick={handleFloristClick}
              className="font-medium text-text-muted hover:text-brand-primary transition-colors truncate flex items-center gap-1 cursor-pointer"
              title={`View ${product.floristName}'s Storefront`}
            >
              <span className="truncate">{product.floristName}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-brand-primary shrink-0" />
            </span>

            {product.rating > 0 && (
              <div className="flex items-center gap-0.5 shrink-0 text-amber-600 font-semibold font-mono text-[11px]">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{product.rating.toFixed(1)}</span>
                {product.reviewsCount > 0 && (
                  <span className="text-text-muted font-normal">({product.reviewsCount})</span>
                )}
              </div>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-display font-semibold text-sm md:text-base text-text-primary group-hover:text-brand-primary transition-colors line-clamp-1 leading-snug">
            {product.title}
          </h3>
        </div>

        {/* 3. Delivery Availability Indicator */}
        <div className="pt-2 border-t border-utility-border/70 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-medium">
            <Truck className="w-3.5 h-3.5 text-brand-primary shrink-0" />
            <span className="truncate">{product.deliveryEstimate || 'Same-day delivery in Nairobi'}</span>
          </div>

          {/* Price & Primary CTA */}
          <div className="flex items-center justify-between mt-1">
            <div className="text-base md:text-lg font-bold font-mono text-brand-primary tracking-tight">
              KSh {product.price.toLocaleString()}
            </div>
            <span className="text-[11px] font-semibold text-brand-primary group-hover:underline flex items-center gap-0.5">
              View Bouquet →
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
