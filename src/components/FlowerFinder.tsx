import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, ArrowRight, RotateCcw, Check, Heart, ShieldCheck, Star } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_FLORISTS } from '../data';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FlowerFinderProps {
  onSelectProduct?: (product: Product) => void;
}

export function FlowerFinder({ onSelectProduct }: FlowerFinderProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedOccasion, setSelectedOccasion] = useState<string>('');
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedTiming, setSelectedTiming] = useState<string>('today');
  const [results, setResults] = useState<Product[]>([]);

  const occasions = [
    { id: 'birthday', label: 'Birthday', desc: 'Bright, celebratory, cheerful blooms' },
    { id: 'anniversary', label: 'Anniversary', desc: 'Romantic, passionate, timeless roses' },
    { id: 'valentine', label: 'Valentine’s', desc: 'Deep reds, pinks, luxury arrangements' },
    { id: 'graduation', label: 'Graduation', desc: 'Vibrant statements & grand bouquets' },
    { id: 'apology', label: 'Apology', desc: 'Soft pastels, thoughtful lilies' },
    { id: 'thank_you', label: 'Thank You', desc: 'Warm gratitude & garden freshness' },
    { id: 'just_because', label: 'Just Because', desc: 'Effortless, spontaneous beauty' },
    { id: 'other', label: 'Other Moments', desc: 'Versatile, elegant arrangements' },
  ];

  const budgetTiers = [
    { id: 'under_2000', label: 'Under KSh 2,000', min: 0, max: 2000, desc: 'Thoughtful everyday floral gestures' },
    { id: '2000_4000', label: 'KSh 2,000 – 4,000', min: 2000, max: 4000, desc: 'Handcrafted signature bouquets' },
    { id: '4000_7000', label: 'KSh 4,000 – 7,000', min: 4000, max: 7000, desc: 'Grand Naivasha roses & luxury centerpieces' },
    { id: '7000_plus', label: 'KSh 7,000+', min: 7000, max: 100000, desc: 'Lavish floral sculptures & bespoke displays' },
  ];

  const styles = [
    { id: 'romantic', label: 'Romantic & Classic', desc: 'Velvety roses, eucalyptus, soft ribbons' },
    { id: 'elegant', label: 'Elegant & Sculptural', desc: 'Alpine orchids, white lilies, tall silhouettes' },
    { id: 'bright', label: 'Bright & Cheerful', desc: 'Sunflowers, yellow roses, tropical gerberas' },
    { id: 'minimal', label: 'Minimal & Modern', desc: 'Clean architectural stems, neutral wrapping' },
    { id: 'luxury', label: 'Luxury & Grand', desc: 'Dense multi-stem bouquets with premium glass vase' },
    { id: 'natural', label: 'Natural & Wildflower', desc: 'Rift Valley meadow foliage, dried florals' },
  ];

  const timings = [
    { id: 'today', label: 'Today (Same-Day)', desc: 'Order by 2:00 PM for doorstep arrival today' },
    { id: 'tomorrow', label: 'Tomorrow', desc: 'Farm-cut at dawn, delivered tomorrow' },
    { id: 'scheduled', label: 'Specific Date Ahead', desc: 'Plan ahead for upcoming anniversary or birthday' },
  ];

  // Deterministic rule-based filter
  const computeResults = (occ: string, budId: string, sty: string) => {
    const budget = budgetTiers.find((b) => b.id === budId);
    const minPrice = budget ? budget.min : 0;
    const maxPrice = budget ? budget.max : 100000;

    let matched = MOCK_PRODUCTS.filter((p) => {
      // 1. Budget check
      const withinBudget = p.price >= minPrice && p.price <= maxPrice;

      // 2. Occasion relevance check
      const occasionMatch =
        !occ ||
        occ === 'other' ||
        p.occasions.some((o) => o.toLowerCase().includes(occ.toLowerCase().replace('_', ' '))) ||
        (occ === 'anniversary' && p.category.toLowerCase().includes('roses')) ||
        (occ === 'birthday' && (p.category.toLowerCase().includes('bouquets') || p.isTrending));

      return withinBudget && occasionMatch;
    });

    // If budget too tight or filtered too low, fall back to closest budget items
    if (matched.length === 0) {
      matched = MOCK_PRODUCTS.filter((p) => p.price <= maxPrice).slice(0, 4);
    }
    if (matched.length === 0) {
      matched = MOCK_PRODUCTS.slice(0, 4);
    }

    setResults(matched);
    setStep(5);
  };

  const handleReset = () => {
    setSelectedOccasion('');
    setSelectedBudget('');
    setSelectedStyle('');
    setSelectedTiming('today');
    setResults([]);
    setStep(1);
  };

  return (
    <div className="bg-surface border border-utility-border rounded-2xl p-6 md:p-10 shadow-xs max-w-5xl mx-auto" id="flower-finder-component">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-utility-border pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold rounded-full uppercase tracking-wider mb-2 font-display">
            <Sparkles className="w-3.5 h-3.5" />
            Deterministic Flower Matcher
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-semibold text-text-primary tracking-tight">
            Find the Perfect Floral Arrangement
          </h2>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Answer four quick questions. Our rule-based matcher pairs you with verified local florists.
          </p>
        </div>

        {step > 1 && (
          <button
            onClick={handleReset}
            className="self-start md:self-auto inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-brand-primary transition-colors cursor-pointer py-1.5 px-3 rounded-lg border border-utility-border hover:bg-canvas"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Start Over
          </button>
        )}
      </div>

      {/* Progress Indicators */}
      {step < 5 && (
        <div className="flex items-center justify-between gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-brand-primary' : 'bg-utility-border'
                }`}
              />
              <div className="mt-1 text-[11px] font-medium text-text-muted hidden sm:block">
                {i === 1 && '1. Occasion'}
                {i === 2 && '2. Budget'}
                {i === 3 && '3. Style'}
                {i === 4 && '4. Delivery'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-display font-semibold text-text-primary">
                Step 1: What is the meaningful occasion?
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Every moment has an emotional floral tone—from passionate celebrations to gentle sympathies.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {occasions.map((occ) => (
                <button
                  key={occ.id}
                  onClick={() => {
                    setSelectedOccasion(occ.id);
                    setStep(2);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer group hover:border-brand-primary hover:shadow-xs ${
                    selectedOccasion === occ.id
                      ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary'
                      : 'border-utility-border bg-white hover:bg-canvas'
                  }`}
                >
                  <div className="font-display font-semibold text-sm text-text-primary group-hover:text-brand-primary transition-colors">
                    {occ.label}
                  </div>
                  <div className="text-xs text-text-muted mt-1 leading-snug">
                    {occ.desc}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-display font-semibold text-text-primary">
                Step 2: What is your comfortable budget?
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                We only match arrangements with transparent, upfront pricing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {budgetTiers.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => {
                    setSelectedBudget(tier.id);
                    setStep(3);
                  }}
                  className={`p-5 rounded-xl border text-left transition-all cursor-pointer group hover:border-brand-primary hover:shadow-xs ${
                    selectedBudget === tier.id
                      ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary'
                      : 'border-utility-border bg-white hover:bg-canvas'
                  }`}
                >
                  <div className="font-display font-semibold text-base text-text-primary group-hover:text-brand-primary transition-colors">
                    {tier.label}
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    {tier.desc}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-display font-semibold text-text-primary">
                Step 3: What floral style fits their personality?
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Select an aesthetic that mirrors how you want them to feel upon unboxing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {styles.map((sty) => (
                <button
                  key={sty.id}
                  onClick={() => {
                    setSelectedStyle(sty.id);
                    setStep(4);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer group hover:border-brand-primary hover:shadow-xs ${
                    selectedStyle === sty.id
                      ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary'
                      : 'border-utility-border bg-white hover:bg-canvas'
                  }`}
                >
                  <div className="font-display font-semibold text-sm text-text-primary group-hover:text-brand-primary transition-colors">
                    {sty.label}
                  </div>
                  <div className="text-xs text-text-muted mt-1 leading-snug">
                    {sty.desc}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-display font-semibold text-text-primary">
                Step 4: When do the flowers need to arrive?
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                We'll prioritize florists with confirmed fulfillment capacity in your delivery window.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {timings.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTiming(t.id);
                    computeResults(selectedOccasion, selectedBudget, selectedStyle);
                  }}
                  className={`p-5 rounded-xl border text-left transition-all cursor-pointer group hover:border-brand-primary hover:shadow-xs ${
                    selectedTiming === t.id
                      ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary'
                      : 'border-utility-border bg-white hover:bg-canvas'
                  }`}
                >
                  <div className="font-display font-semibold text-sm text-text-primary group-hover:text-brand-primary transition-colors">
                    {t.label}
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="step-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-primary font-display">
                  Matches Found: {results.length} Handpicked Arrangements
                </div>
                <div className="text-xs text-text-secondary mt-0.5">
                  Filtered for: <strong className="capitalize">{selectedOccasion.replace('_', ' ') || 'Occasion'}</strong> • {budgetTiers.find(b => b.id === selectedBudget)?.label} • <span className="capitalize">{selectedStyle || 'Selected Style'}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  window.location.hash = `#/shop?occasion=${encodeURIComponent(selectedOccasion)}`;
                }}
                className="text-xs font-semibold text-brand-primary hover:underline cursor-pointer shrink-0"
              >
                View Full Catalog Filter →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
