import React from 'react';
import { motion } from 'motion/react';
import { Heart, Star, Eye, Truck } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export function ProductCard({ product }: ProductCardProps) {
  const { wishlist, toggleWishlist, setQuickViewProduct, addToCart } = useApp();
  const isWishlisted = wishlist.includes(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      product,
      quantity: 1,
      size: 'Standard',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group relative flex flex-col bg-surface border border-utility-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_12px_32px_rgba(45,90,39,0.06)] hover:border-brand-primary/20"
      id={`product-card-${product.id}`}
    >
      {/* Image Container with Badges */}
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
          onClick={() => toggleWishlist(product.id)}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-xs shadow-xs text-text-secondary hover:text-brand-secondary transition-all hover:scale-110 active:scale-95"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          id={`wishlist-btn-${product.id}`}
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-300 ${
              isWishlisted ? 'fill-brand-secondary text-brand-secondary' : 'text-text-secondary'
            }`}
          />
        </button>

        {/* Promo / Hot Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.isTrending && (
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase font-display bg-brand-primary text-white rounded-xs">
              Trending
            </span>
          )}
          {product.isSeasonal && (
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase font-display bg-brand-secondary text-white rounded-xs">
              Seasonal
            </span>
          )}
        </div>

        {/* Interactive Hover Screen Controls */}
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 gap-3">
          <button
            onClick={() => setQuickViewProduct(product)}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-white text-text-primary hover:bg-brand-primary hover:text-white transition-all rounded-xs shadow-md flex items-center gap-1.5"
            id={`quickview-btn-${product.id}`}
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
          
          <button
            onClick={handleQuickAdd}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-brand-primary text-white hover:bg-brand-primary-hover transition-all rounded-xs shadow-md"
            id={`quickadd-btn-${product.id}`}
          >
            + Add 1
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-1 text-xs text-text-muted mb-1.5">
          <span className="font-medium hover:text-brand-primary transition-colors cursor-pointer truncate">
            {product.floristName}
          </span>
          <div className="flex items-center gap-0.5 shrink-0 text-amber-500 font-semibold font-mono text-[11px]">
            <Star className="w-3 h-3 fill-current" />
            {product.rating}
          </div>
        </div>

        <h3 className="font-display font-medium text-text-primary text-sm line-clamp-1 group-hover:text-brand-primary transition-colors mb-2">
          {product.title}
        </h3>

        {/* Occasion Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.occasions.slice(0, 2).map((occ) => (
            <span
              key={occ}
              className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold font-display text-brand-primary bg-brand-primary/5 border border-brand-primary/10 rounded-xs"
            >
              {occ}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-3 border-t border-utility-border flex items-center justify-between">
          <div className="text-sm font-semibold font-mono text-text-primary">
            KES {product.price.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-medium text-text-muted">
            <Truck className="w-3 h-3 text-brand-primary shrink-0" />
            <span className="truncate max-w-[100px]">{product.deliveryEstimate.split('(')[0]}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
