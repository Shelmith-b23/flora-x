import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, Sparkles, MapPin, Store, Heart, Clock } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_FLORISTS, MOCK_OCCASIONS } from '../data';
import { Product, Florist, Occasion } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('florax_recent_searches');
      return saved ? JSON.parse(saved) : ['Naivasha Roses', 'Birthday Flowers', 'Lilies', 'Same-day Nairobi'];
    } catch {
      return ['Naivasha Roses', 'Birthday Flowers', 'Lilies', 'Same-day Nairobi'];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const handleSearchSubmit = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    const term = searchTerm.trim();
    const updated = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('florax_recent_searches', JSON.stringify(updated));
    } catch (e) {}

    onClose();
    window.location.hash = `#/shop?search=${encodeURIComponent(term)}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Live filter matching products, florists, and occasions
  const trimmed = query.trim().toLowerCase();
  const matchedProducts = trimmed
    ? MOCK_PRODUCTS.filter(
        (p) =>
          p.title.toLowerCase().includes(trimmed) ||
          p.description.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed) ||
          p.flowerType.some((f) => f.toLowerCase().includes(trimmed))
      ).slice(0, 5)
    : [];

  const matchedFlorists = trimmed
    ? MOCK_FLORISTS.filter(
        (f) =>
          f.name.toLowerCase().includes(trimmed) ||
          f.location.toLowerCase().includes(trimmed) ||
          f.about.toLowerCase().includes(trimmed)
      ).slice(0, 3)
    : [];

  const matchedOccasions = trimmed
    ? MOCK_OCCASIONS.filter(
        (o) =>
          o.name.toLowerCase().includes(trimmed) ||
          o.description.toLowerCase().includes(trimmed)
      ).slice(0, 3)
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          {/* Overlay Click to Close */}
          <div className="fixed inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-white border border-utility-border rounded-2xl shadow-2xl overflow-hidden z-10 my-auto md:my-0"
            id="search-modal-container"
          >
            {/* Search Input Header */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchSubmit(query);
              }}
              className="p-4 border-b border-utility-border flex items-center gap-3 bg-canvas/40"
            >
              <Search className="w-5 h-5 text-brand-primary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search roses, birthday flowers, graduation bouquets, florists..."
                className="w-full text-sm md:text-base bg-transparent border-0 focus:ring-0 focus:outline-hidden text-text-primary placeholder-text-muted"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1 text-xs font-semibold text-text-secondary hover:text-text-primary rounded-md border border-utility-border hover:bg-canvas cursor-pointer shrink-0"
              >
                Esc
              </button>
            </form>

            {/* Results or Suggestions Body */}
            <div className="max-h-[70vh] overflow-y-auto p-5 space-y-6">
              {/* If user is actively typing */}
              {query.trim() ? (
                <div className="space-y-6">
                  {/* Matching Products */}
                  {matchedProducts.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted font-display mb-2 flex items-center justify-between">
                        <span>Arrangements ({matchedProducts.length})</span>
                        <span
                          onClick={() => handleSearchSubmit(query)}
                          className="text-brand-primary hover:underline cursor-pointer lowercase"
                        >
                          view all results →
                        </span>
                      </div>
                      <div className="divide-y divide-utility-border">
                        {matchedProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              onClose();
                              window.location.hash = `#/product/${p.id}`;
                            }}
                            className="py-2.5 flex items-center gap-3 hover:bg-canvas/80 px-2 rounded-lg cursor-pointer transition-colors"
                          >
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="w-12 h-12 rounded-lg object-cover border border-utility-border shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs md:text-sm font-semibold text-text-primary truncate">
                                {p.title}
                              </h4>
                              <div className="text-[11px] text-text-muted truncate">
                                {p.floristName} • {p.category}
                              </div>
                            </div>
                            <div className="font-mono text-xs font-bold text-brand-primary shrink-0">
                              KSh {p.price.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Florists */}
                  {matchedFlorists.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted font-display mb-2">
                        Florist Studios
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {matchedFlorists.map((f) => (
                          <div
                            key={f.id}
                            onClick={() => {
                              onClose();
                              window.location.hash = `#/florist/${f.id}`;
                            }}
                            className="p-3 border border-utility-border rounded-xl hover:border-brand-primary transition-all flex items-center gap-3 cursor-pointer bg-white"
                          >
                            <img
                              src={f.logo}
                              alt={f.name}
                              className="w-10 h-10 rounded-lg object-cover border border-utility-border shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-text-primary truncate">
                                {f.name}
                              </div>
                              <div className="text-[11px] text-text-muted flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-brand-secondary" />
                                {f.location}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Occasions */}
                  {matchedOccasions.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted font-display mb-2">
                        Occasions
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {matchedOccasions.map((o) => (
                          <button
                            key={o.id}
                            onClick={() => {
                              onClose();
                              window.location.hash = `#/shop?occasion=${encodeURIComponent(o.name)}`;
                            }}
                            className="px-3 py-1.5 rounded-full border border-utility-border bg-canvas text-xs font-medium text-text-primary hover:border-brand-primary hover:text-brand-primary transition-colors cursor-pointer"
                          >
                            {o.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Zero State */}
                  {matchedProducts.length === 0 &&
                    matchedFlorists.length === 0 &&
                    matchedOccasions.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-sm text-text-secondary">
                          No direct matches for "{query}".
                        </p>
                        <button
                          onClick={() => handleSearchSubmit(query)}
                          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-primary-hover cursor-pointer"
                        >
                          Search Full Catalog for "{query}"
                        </button>
                      </div>
                    )}
                </div>
              ) : (
                /* Default View: Recents, Popular, and Categories */
                <div className="space-y-6">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted font-display mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Recent Searches
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            onClick={() => handleSearchSubmit(term)}
                            className="px-3 py-1 bg-canvas hover:bg-brand-primary/10 hover:text-brand-primary text-text-secondary text-xs rounded-full border border-utility-border transition-colors cursor-pointer"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Occasions Quick Links */}
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted font-display mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                      Popular Moments
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {MOCK_OCCASIONS.slice(0, 4).map((occ) => (
                        <button
                          key={occ.id}
                          onClick={() => {
                            onClose();
                            window.location.hash = `#/shop?occasion=${encodeURIComponent(occ.name)}`;
                          }}
                          className="p-2.5 rounded-xl border border-utility-border hover:border-brand-primary hover:shadow-xs transition-all text-left bg-white cursor-pointer group"
                        >
                          <div className="text-xs font-semibold text-text-primary group-hover:text-brand-primary transition-colors">
                            {occ.name}
                          </div>
                          <div className="text-[10px] text-text-muted truncate mt-0.5">
                            Shop flowers →
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
