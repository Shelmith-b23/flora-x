import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal, Grid, X, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_PRODUCTS, MOCK_FLORISTS, MOCK_OCCASIONS } from '../data';
import { ProductCard } from '../components/ProductCard';

export function Shop() {
  const { searchQuery, setSearchQuery, selectedLocation, setSelectedLocation } = useApp();
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  
  // State for all filters
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedFlowerTypes, setSelectedFlowerTypes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [selectedFloristId, setSelectedFloristId] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Extract static list of unique flower types and colors from MOCK_PRODUCTS for filtering options
  const allFlowerTypes = Array.from(new Set(MOCK_PRODUCTS.flatMap(p => p.flowerType)));
  const allColors = Array.from(new Set(MOCK_PRODUCTS.flatMap(p => p.colors)));

  // Sync state filters with URL query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const search = params.get('search');
    const location = params.get('location');
    const occasion = params.get('occasion');
    const florist = params.get('florist');

    if (search) setSearchQuery(decodeURIComponent(search));
    if (location) setSelectedLocation(decodeURIComponent(location));
    if (occasion) setSelectedOccasions([decodeURIComponent(occasion)]);
    if (florist) setSelectedFloristId(decodeURIComponent(florist));
  }, []);

  // Filter application pipeline
  useEffect(() => {
    let filtered = [...MOCK_PRODUCTS];

    // 1. Text Search Filter (Flower, Occasion, Florist, Title, Description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.floristName.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.occasions.some(o => o.toLowerCase().includes(query)) ||
          p.flowerType.some(t => t.toLowerCase().includes(query))
      );
    }

    // 2. Location Filter
    if (selectedLocation && selectedLocation !== 'All') {
      const matchingFloristIds = MOCK_FLORISTS
        .filter((f) => f.location.toLowerCase().includes(selectedLocation.toLowerCase()))
        .map((f) => f.id);
      
      // If none match, don't zero-out everything immediately unless strict
      if (matchingFloristIds.length > 0) {
        filtered = filtered.filter((p) => matchingFloristIds.includes(p.floristId));
      }
    }

    // 3. Price Range Filter
    filtered = filtered.filter((p) => p.price <= priceRange);

    // 4. Occasion Multi-select
    if (selectedOccasions.length > 0) {
      filtered = filtered.filter((p) =>
        p.occasions.some((occ) => selectedOccasions.includes(occ))
      );
    }

    // 5. Flower Type Multi-select
    if (selectedFlowerTypes.length > 0) {
      filtered = filtered.filter((p) =>
        p.flowerType.some((type) => selectedFlowerTypes.includes(type))
      );
    }

    // 6. Colors Multi-select
    if (selectedColors.length > 0) {
      filtered = filtered.filter((p) =>
        p.colors.some((col) => selectedColors.includes(col))
      );
    }

    // 7. Rating Filter
    if (selectedRating !== null) {
      filtered = filtered.filter((p) => p.rating >= selectedRating);
    }

    // 8. Availability Filter
    if (onlyAvailable) {
      filtered = filtered.filter((p) => p.availability);
    }

    // 9. Florist Filter
    if (selectedFloristId) {
      filtered = filtered.filter((p) => p.floristId === selectedFloristId);
    }

    // 10. Sorting
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setProducts(filtered);
  }, [
    searchQuery,
    selectedLocation,
    priceRange,
    selectedOccasions,
    selectedFlowerTypes,
    selectedColors,
    selectedRating,
    onlyAvailable,
    selectedFloristId,
    sortBy,
  ]);

  const toggleOccasion = (occ: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  const toggleFlowerType = (type: string) => {
    setSelectedFlowerTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleColor = (col: string) => {
    setSelectedColors((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const resetAllFilters = () => {
    setPriceRange(10000);
    setSelectedOccasions([]);
    setSelectedFlowerTypes([]);
    setSelectedColors([]);
    setSelectedRating(null);
    setOnlyAvailable(false);
    setSelectedFloristId('');
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-canvas" id="shop-page">
      <div className="w-full max-w-7xl mx-auto px-6">
        {/* Banner Title */}
        <div className="mb-8 text-center md:text-left">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary font-display block mb-1">
            Flora_X Studio Catalog
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary tracking-tight">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Browse Curated Arrangements'}
          </h1>
          <p className="text-xs md:text-sm text-text-muted mt-1.5">
            Sourced daily from sustainable Rift Valley flower farms and crafted by verified master florists.
          </p>
        </div>

        {/* Toolbar controls */}
        <div className="bg-white border border-utility-border rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
          <div className="flex-1 flex gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3.5 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flowers, occasions, florists..."
                className="w-full pl-10 pr-4 py-2 text-xs md:text-sm border border-utility-border rounded-md bg-canvas focus:outline-hidden focus:border-brand-primary text-text-secondary"
              />
            </div>
            
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden px-4 py-2 border border-utility-border rounded-md text-xs font-semibold uppercase tracking-wider text-text-primary flex items-center gap-2 bg-canvas shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>

          <div className="flex gap-4 items-center w-full md:w-auto justify-end shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
              <span className="shrink-0">Location:</span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="p-1 text-xs border border-utility-border rounded-md bg-canvas font-semibold text-text-primary"
              >
                <option value="All">All Kenya</option>
                <option value="Nairobi">Nairobi</option>
                <option value="Naivasha">Naivasha</option>
                <option value="Mombasa">Mombasa</option>
                <option value="Eldoret">Eldoret</option>
                <option value="Nanyuki">Nanyuki</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
              <span className="shrink-0">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-1 text-xs border border-utility-border rounded-md bg-canvas font-semibold text-text-primary"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-8 items-start">
          {/* Sidebar Filters - Desktop */}
          <aside className="w-64 shrink-0 bg-white border border-utility-border rounded-xl p-5 shadow-xs sticky top-24 space-y-6 hidden lg:block">
            <div className="flex items-center justify-between border-b border-utility-border pb-3">
              <span className="font-display font-semibold text-sm text-text-primary flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-primary" />
                Filter Options
              </span>
              <button onClick={resetAllFilters} className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary hover:underline cursor-pointer">
                Reset All
              </button>
            </div>

            {/* Price slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-text-muted uppercase tracking-wider font-display">Max Price</span>
                <span className="text-brand-primary font-mono font-bold">KES {priceRange.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="2000"
                max="10000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-brand-primary"
              />
              <div className="flex justify-between text-[10px] text-text-muted font-mono mt-1">
                <span>KES 2k</span>
                <span>KES 10k</span>
              </div>
            </div>

            {/* Occasions */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted font-display mb-2">
                Occasions
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {MOCK_OCCASIONS.map((occ) => (
                  <label key={occ.id} className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedOccasions.includes(occ.name)}
                      onChange={() => toggleOccasion(occ.name)}
                      className="rounded-xs border-utility-border text-brand-primary focus:ring-brand-primary w-3.5 h-3.5"
                    />
                    <span>{occ.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Flower Types */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted font-display mb-2">
                Flower Type
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {allFlowerTypes.map((type) => (
                  <label key={type} className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFlowerTypes.includes(type)}
                      onChange={() => toggleFlowerType(type)}
                      className="rounded-xs border-utility-border text-brand-primary focus:ring-brand-primary w-3.5 h-3.5"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Florist filter */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted font-display mb-2">
                Florist Partner
              </span>
              <select
                value={selectedFloristId}
                onChange={(e) => setSelectedFloristId(e.target.value)}
                className="w-full p-2 text-xs border border-utility-border rounded-md bg-canvas focus:outline-hidden focus:border-brand-primary text-text-secondary font-semibold"
              >
                <option value="">All Florists</option>
                {MOCK_FLORISTS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.location.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Colors */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted font-display mb-2">
                Color Palette
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allColors.map((col) => {
                  const isActive = selectedColors.includes(col);
                  return (
                    <button
                      key={col}
                      onClick={() => toggleColor(col)}
                      className={`px-2.5 py-1 text-[10px] font-semibold uppercase rounded-full border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-brand-primary border-brand-primary text-white'
                          : 'bg-white border-utility-border text-text-secondary hover:border-text-muted'
                      }`}
                    >
                      {col}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Availability */}
            <div className="pt-2 border-t border-utility-border">
              <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="rounded-xs border-utility-border text-brand-primary focus:ring-brand-primary w-3.5 h-3.5"
                />
                <span>In-Stock / Available Today</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="flex-1">
            {products.length === 0 ? (
              <div className="bg-white border border-utility-border rounded-xl p-12 text-center max-w-xl mx-auto flex flex-col items-center justify-center space-y-4 shadow-xs">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-text-primary text-base">No arrangements found</h3>
                  <p className="text-xs text-text-secondary mt-1 max-w-sm">
                    No items match your active filter settings. Try adjusting your max price, changing locations, or clicking reset.
                  </p>
                </div>
                <button
                  onClick={resetAllFilters}
                  className="px-5 py-2.5 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Drawer Filter - Portal Backdrop overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowMobileFilters(false)} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 bottom-0 w-80 max-w-[90vw] bg-white shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-utility-border pb-3 shrink-0">
              <span className="font-display font-semibold text-sm text-text-primary flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-primary" />
                Mobile Filters
              </span>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 bg-canvas border border-utility-border rounded-full hover:scale-105 transition-all text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto">
              {/* Max Price */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-text-muted font-display uppercase tracking-wider">Max Price</span>
                  <span className="text-brand-primary font-mono font-bold">KES {priceRange.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="10000"
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-brand-primary"
                />
              </div>

              {/* Occasions */}
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted font-display mb-2">
                  Occasions
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {MOCK_OCCASIONS.map((occ) => {
                    const isActive = selectedOccasions.includes(occ.name);
                    return (
                      <button
                        key={occ.id}
                        onClick={() => toggleOccasion(occ.name)}
                        className={`p-2 rounded-md border text-center text-xs transition-all ${
                          isActive
                            ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                            : 'border-utility-border bg-canvas text-text-secondary'
                        }`}
                      >
                        {occ.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Flower types */}
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted font-display mb-2">
                  Flower Type
                </span>
                <div className="space-y-2">
                  {allFlowerTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFlowerTypes.includes(type)}
                        onChange={() => toggleFlowerType(type)}
                        className="rounded-xs border-utility-border text-brand-primary focus:ring-brand-primary w-3.5 h-3.5"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-utility-border shrink-0 grid grid-cols-2 gap-3">
              <button
                onClick={resetAllFilters}
                className="w-full py-2.5 border border-utility-border rounded-md text-xs font-semibold uppercase tracking-wider text-text-secondary bg-canvas cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-2.5 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
