import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Sparkles, ShieldCheck, Heart, Clock, Compass, ArrowRight, ArrowUpRight, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_PRODUCTS, MOCK_OCCASIONS, MOCK_BLOGS, MOCK_REVIEWS } from '../data';
import { ProductCard } from '../components/ProductCard';

export function Home() {
  const { setSearchQuery, setSelectedLocation, setQuickViewProduct } = useApp();
  const [searchInput, setSearchInput] = useState('');
  const [locInput, setLocInput] = useState('Nairobi');

  // Filter products for trending & seasonal sections
  const trendingProducts = MOCK_PRODUCTS.filter((p) => p.isTrending);
  const seasonalProducts = MOCK_PRODUCTS.filter((p) => p.isSeasonal);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setSelectedLocation(locInput);
    window.location.hash = `#/shop?search=${encodeURIComponent(searchInput)}&location=${encodeURIComponent(locInput)}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectOccasion = (occName: string) => {
    window.location.hash = `#/shop?occasion=${encodeURIComponent(occName)}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative overflow-x-hidden" id="home-page">
      {/* 1. Immersive Editorial Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-canvas pt-20 pb-16 md:py-32">
        {/* Background lifestyle decorative visual assets */}
        <div className="absolute inset-0 z-0 opacity-15 overflow-hidden pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=1600&auto=format&fit=crop&q=80"
            alt=""
            className="w-full h-full object-cover scale-105 filter blur-xs"
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-primary bg-brand-primary/10 rounded-full font-display">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              Kenya's Premium Florist Collective
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-text-primary leading-[1.1]">
              Beautiful arrangements, <br />
              <span className="text-brand-primary">hand-crafted</span> near you.
            </h1>
            
            <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Flora_X connects Kenya’s most exceptional independent florists directly with your doorstep. Beautiful, sustainably harvested Naivasha roses, potted orchids, and tropical centerpieces.
            </p>

            {/* Smart Search Panel */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2.5 rounded-xl border border-utility-border shadow-xl max-w-2xl mx-auto lg:mx-0 flex flex-col md:flex-row gap-2"
              id="hero-search-form"
            >
              <div className="flex-1 flex items-center gap-2 px-3 border-b md:border-b-0 md:border-r border-utility-border py-2 md:py-0">
                <Search className="w-4 h-4 text-brand-primary shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by flower, occasion, or florist..."
                  className="w-full text-xs md:text-sm bg-transparent border-0 focus:ring-0 focus:outline-hidden placeholder-text-muted text-text-primary"
                />
              </div>

              <div className="w-full md:w-44 flex items-center gap-2 px-3 py-2 md:py-0 shrink-0">
                <MapPin className="w-4 h-4 text-brand-secondary shrink-0" />
                <select
                  value={locInput}
                  onChange={(e) => setLocInput(e.target.value)}
                  className="w-full text-xs md:text-sm bg-transparent border-0 focus:ring-0 focus:outline-hidden text-text-secondary cursor-pointer"
                >
                  <option value="Nairobi">Nairobi</option>
                  <option value="Naivasha">Naivasha</option>
                  <option value="Mombasa">Mombasa</option>
                  <option value="Eldoret">Eldoret</option>
                  <option value="Nanyuki">Nanyuki</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-lg transition-all shrink-0 cursor-pointer"
                id="search-btn-hero"
              >
                Search Blooms
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] w-full max-w-[400px] mx-auto bg-surface border border-utility-border rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&auto=format&fit=crop&q=80"
                alt="Signature Imperial Arrangement"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-4 rounded-xl border border-utility-border flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-brand-secondary uppercase tracking-widest font-display">Featured Curated Bouquet</div>
                  <div className="text-xs font-semibold text-text-primary">Imperial Safari Rose</div>
                  <div className="text-[11px] font-mono text-text-muted">KES 4,800 • Naivasha Farmed</div>
                </div>
                <button
                  onClick={() => window.location.hash = '#/shop'}
                  className="p-2 bg-brand-primary text-white rounded-full hover:scale-105 transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop by Occasion Section */}
      <section className="py-16 bg-surface border-t border-utility-border" id="shop-by-occasion">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-brand-secondary font-display block mb-1">
                Occasion First
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-semibold text-text-primary tracking-tight">
                Shop Arrangements by Occasion
              </h2>
            </div>
            <button
              onClick={() => window.location.hash = '#/occasions'}
              className="text-xs uppercase tracking-widest font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1.5 mt-4 md:mt-0 cursor-pointer"
            >
              See All Occasions
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {MOCK_OCCASIONS.slice(0, 5).map((occ) => (
              <div
                key={occ.id}
                onClick={() => selectOccasion(occ.name)}
                className="group relative aspect-square rounded-xl overflow-hidden border border-utility-border cursor-pointer shadow-xs"
              >
                <img
                  src={occ.image}
                  alt={occ.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-sm font-display font-semibold text-white tracking-wide">
                    {occ.name}
                  </h3>
                  <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">
                    {occ.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* 4. Trending & Seasonal Collections (Bento grid) */}
      <section className="py-16 bg-surface border-t border-utility-border" id="trending-flowers">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center justify-center text-center mb-12">
            <span className="text-xs uppercase tracking-wider font-semibold text-brand-secondary font-display block mb-1">
              Top Picks
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-text-primary tracking-tight">
              Trending Arrangements
            </h2>
            <p className="text-xs md:text-sm text-text-secondary mt-2 max-w-xl">
              Fresh floral compositions currently loved across Kenya. Same-day logistics available.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>



      {/* 6. Why Choose Flora_X */}
      <section className="py-16 bg-surface border-t border-utility-border" id="why-choose-us">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-wider font-semibold text-brand-secondary font-display block mb-1">
              Guaranteed Satisfaction
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-text-primary tracking-tight">
              Why Floral Connoisseurs Trust Flora_X
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-5 text-center space-y-3 bg-canvas border border-utility-border rounded-xl">
              <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-sm text-text-primary">Verified Florists</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                We strictly audit every single florist partner to guarantee hand-crafted packaging and top-shelf farm sourcing.
              </p>
            </div>

            <div className="p-5 text-center space-y-3 bg-canvas border border-utility-border rounded-xl">
              <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-sm text-text-primary">Same-Day Delivery</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Order before 1 PM for prompt hand-deliveries utilizing secure temperature-regulated regional logistics.
              </p>
            </div>

            <div className="p-5 text-center space-y-3 bg-canvas border border-utility-border rounded-xl">
              <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-sm text-text-primary">STK Push Payments</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Frictionless security via standard Safaricom M-Pesa API STK push or absolute bank-grade secure card payments.
              </p>
            </div>

            <div className="p-5 text-center space-y-3 bg-canvas border border-utility-border rounded-xl">
              <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-sm text-text-primary">Live Tracking</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Follow your bouquet’s dynamic journey with SMS updates directly from the florists work benches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Customer Reviews Section */}
      <section className="py-16 bg-canvas border-t border-utility-border" id="testimonials">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-brand-secondary font-display block mb-1">
                Verified Reviews
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-semibold text-text-primary tracking-tight">
                Praise From Our Premium Community
              </h2>
            </div>
            <button
              onClick={() => window.location.hash = '#/reviews'}
              className="text-xs uppercase tracking-widest font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1.5 mt-4 md:mt-0 cursor-pointer"
            >
              Read All Customer Reviews
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_REVIEWS.map((review) => (
              <div
                key={review.id}
                className="bg-white p-6 border border-utility-border rounded-xl shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-utility-border">
                  <img
                    src={review.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={review.customerName}
                    className="w-10 h-10 rounded-full object-cover border border-utility-border"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-text-primary">{review.customerName}</h4>
                    <span className="text-[10px] text-text-muted">
                      {review.productName} • {review.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* 9. Blog Preview Grid */}
      <section className="py-16 bg-surface border-t border-utility-border" id="blog-preview">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-brand-secondary font-display block mb-1">
                Floral Journal
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-semibold text-text-primary tracking-tight">
                Insights From The Highlands
              </h2>
            </div>
            <button
              onClick={() => window.location.hash = '#/blog'}
              className="text-xs uppercase tracking-widest font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1.5 mt-4 md:mt-0 cursor-pointer"
            >
              Read Entire Journal
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MOCK_BLOGS.slice(0, 3).map((blog) => (
              <div
                key={blog.id}
                onClick={() => window.location.hash = `#/blog/${blog.id}`}
                className="group flex flex-col space-y-3 cursor-pointer"
              >
                <div className="aspect-[16/10] bg-canvas rounded-lg overflow-hidden border border-utility-border">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                  />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                  <span>{blog.category}</span>
                  <span className="w-1 h-1 bg-text-muted rounded-full" />
                  <span className="text-text-muted lowercase">{blog.readTime}</span>
                </div>
                <h3 className="font-display font-semibold text-sm md:text-base text-text-primary group-hover:text-brand-primary transition-colors line-clamp-1">
                  {blog.title}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  {blog.excerpt}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-primary group-hover:underline">
                  Read Article
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Newsletter Form */}
      <section className="py-16 bg-canvas border-t border-utility-border" id="newsletter-form">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="bg-white border border-utility-border rounded-xl p-8 md:p-12 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3 text-center lg:text-left">
              <h3 className="font-display font-semibold text-lg md:text-2xl text-text-primary tracking-tight">
                Join our premium newsletter network
              </h3>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                Receive floral arrangement insights from Naivasha farmers, exclusive seasonal promotions, and early notification of limited luxury peony releases.
              </p>
            </div>
            <div className="lg:col-span-5">
              <form onSubmit={(e) => { e.preventDefault(); alert("Asante! You have been successfully subscribed to Flora_X newsletters."); }} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  className="w-full px-4 py-3 text-xs md:text-sm border border-utility-border rounded-lg bg-canvas focus:outline-hidden focus:border-brand-primary"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                >
                  Join Us
                </button>
              </form>
              <span className="text-[10px] text-text-muted mt-2 block text-center lg:text-left">
                No spam. Unsubscribe anytime.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
