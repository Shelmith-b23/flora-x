import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, RefreshCw, Gift, MessageSquare, Check, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_PRODUCTS } from '../data';
import { Product } from '../types';

export function AIGiftWizard() {
  const { addToCart } = useApp();
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState('');
  const [tone, setTone] = useState('');
  const [vibe, setVibe] = useState('');
  const [occasion, setOccasion] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendedProduct, setRecommendedProduct] = useState<Product | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  const recipients = [
    { id: 'partner', label: 'My Romantic Partner', emoji: '❤️' },
    { id: 'mother', label: 'My Mother', emoji: '🌸' },
    { id: 'friend', label: 'A Close Friend', emoji: '✨' },
    { id: 'colleague', label: 'A Business Colleague', emoji: '💼' }
  ];

  const tones = [
    { id: 'romantic', label: 'Romantic & Deep', desc: 'Passionate crimson shades' },
    { id: 'warm', label: 'Warm & Cheerful', desc: 'Bright, joyful yellow and orange tones' },
    { id: 'respectful', label: 'Dignified & Classic', desc: 'Pristine whites and orchids' },
    { id: 'soft', label: 'Soft & Comforting', desc: 'Pastel pinks and purples' }
  ];

  const occasions = [
    { id: 'birthday', label: 'Birthday Celebration' },
    { id: 'anniversary', label: 'Anniversary Milestone' },
    { id: 'sympathy', label: 'Sorrow or Sympathy' },
    { id: 'just-because', label: 'Just Because / Love Letter' }
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      // Find matching product based on criteria
      let match: Product = MOCK_PRODUCTS[0]; // fallback
      let message = '';

      if (recipient === 'partner' || tone === 'romantic') {
        match = MOCK_PRODUCTS.find(p => p.id === 'p1') || MOCK_PRODUCTS[0]; // Imperial Safari
        message = `To the love of my life on our ${occasion === 'anniversary' ? 'Anniversary' : 'special day'}. These Naivasha roses represent a passion that blooms deeper with every passing sunrise. Forever yours.`;
      } else if (recipient === 'mother' || tone === 'soft') {
        match = MOCK_PRODUCTS.find(p => p.id === 'p5') || MOCK_PRODUCTS[4]; // Pastel Symphony or Peonies
        message = `Dear Mom, wishing you a beautiful day filled with the peace and joy you bring to all of us. These fresh highlands blooms are a small reflection of your everlasting grace. All my love.`;
      } else if (tone === 'warm' || occasion === 'birthday') {
        match = MOCK_PRODUCTS.find(p => p.id === 'p2') || MOCK_PRODUCTS[1]; // Golden Sunrise
        message = `Happy Birthday! May your day be as vibrant and joyful as this stunning golden arrangement. Celebrating you and wishing you a magnificent year ahead!`;
      } else if (tone === 'respectful' || recipient === 'colleague') {
        match = MOCK_PRODUCTS.find(p => p.id === 'p3') || MOCK_PRODUCTS[2]; // Premium Orchid Pot
        message = `Please accept this premium Mount Kenya orchid as a token of my sincere appreciation and deep respect. May it bring classic elegance and quiet beauty to your surroundings.`;
      }

      setRecommendedProduct(match);
      setGeneratedMessage(message);
      setIsGenerating(false);
      setStep(4);
    }, 1500);
  };

  const handleAddRecommended = () => {
    if (!recommendedProduct) return;
    addToCart({
      product: recommendedProduct,
      quantity: 1,
      size: 'Standard',
      cardMessage: generatedMessage
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const resetWizard = () => {
    setRecipient('');
    setTone('');
    setOccasion('');
    setStep(1);
    setRecommendedProduct(null);
    setGeneratedMessage('');
  };

  return (
    <div className="bg-white border border-utility-border rounded-xl p-6 md:p-8 shadow-[0_8px_32px_rgba(45,90,39,0.03)]" id="ai-gift-wizard">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-md">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-text-primary text-base md:text-lg">
            AI Gift recommendation Engine
          </h3>
          <p className="text-xs text-text-muted">
            Answer 3 quick questions. Get a matching Kenyan curation and custom handwritten note.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <label className="block text-xs uppercase tracking-wider font-semibold font-display text-text-muted mb-2">
              Step 1: Who is receiving these blooms?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {recipients.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => {
                    setRecipient(rec.id);
                    setStep(2);
                  }}
                  className={`p-4 rounded-lg border text-left transition-all hover:border-brand-primary cursor-pointer flex items-center gap-3 ${
                    recipient === rec.id
                      ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                      : 'border-utility-border bg-canvas text-text-secondary'
                  }`}
                >
                  <span className="text-xl shrink-0">{rec.emoji}</span>
                  <span className="text-xs font-semibold">{rec.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <label className="block text-xs uppercase tracking-wider font-semibold font-display text-text-muted mb-2">
              Step 2: What is the emotional tone of the gift?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tones.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTone(t.id);
                    setStep(3);
                  }}
                  className={`p-3.5 rounded-lg border text-left transition-all hover:border-brand-primary cursor-pointer flex flex-col ${
                    tone === t.id
                      ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                      : 'border-utility-border bg-canvas text-text-secondary'
                  }`}
                >
                  <span className="text-xs font-semibold mb-0.5">{t.label}</span>
                  <span className="text-[10px] text-text-muted">{t.desc}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="text-xs text-brand-primary font-semibold hover:underline mt-2">
              ← Back to Recipient
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <label className="block text-xs uppercase tracking-wider font-semibold font-display text-text-muted mb-2">
              Step 3: Choose the milestone occasion
            </label>
            <div className="grid grid-cols-2 gap-3">
              {occasions.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOccasion(o.id)}
                  className={`p-3 rounded-lg border text-center transition-all hover:border-brand-primary cursor-pointer text-xs font-semibold ${
                    occasion === o.id
                      ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                      : 'border-utility-border bg-canvas text-text-secondary'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-utility-border">
              <button onClick={() => setStep(2)} className="text-xs text-brand-primary font-semibold hover:underline">
                ← Back to Tone
              </button>
              
              <button
                disabled={!occasion || isGenerating}
                onClick={handleGenerate}
                className="px-5 py-2.5 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Analyzing Curation...
                  </>
                ) : (
                  <>
                    Generate Curation
                    <Sparkles className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && recommendedProduct && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <div className="p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-lg flex flex-col md:flex-row gap-4 items-center">
              <div className="w-20 h-20 rounded-md overflow-hidden shrink-0 border border-utility-border bg-white">
                <img src={recommendedProduct.images[0]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-1.5 mb-1">
                  <Gift className="w-4 h-4 text-brand-secondary" />
                  <span className="text-[10px] font-semibold text-brand-secondary uppercase tracking-widest font-display">
                    Perfect Match
                  </span>
                </div>
                <h4 className="font-display font-medium text-text-primary text-sm">
                  {recommendedProduct.title}
                </h4>
                <div className="text-xs font-mono font-semibold text-brand-primary mt-0.5">
                  KES {recommendedProduct.price.toLocaleString()} • By {recommendedProduct.floristName}
                </div>
              </div>
            </div>

            <div className="bg-canvas border border-utility-border p-4 rounded-lg relative">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-brand-primary" />
                Suggested Handwritten Card Message
              </div>
              <p className="text-xs text-text-secondary italic leading-relaxed">
                "{generatedMessage}"
              </p>
              <div className="absolute top-3 right-3 text-[10px] text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded-sm uppercase tracking-widest font-mono">
                Bespoke Card
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button onClick={resetWizard} className="text-xs text-text-muted font-semibold hover:text-brand-primary flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                Try Another Recipe
              </button>

              <button
                onClick={handleAddRecommended}
                disabled={isAdded}
                className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all flex items-center gap-2 cursor-pointer ${
                  isAdded
                    ? 'bg-utility-success text-white'
                    : 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-md'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    Curation Added!
                  </>
                ) : (
                  <>
                    Add Bouquet + Custom Card
                    <ShoppingBag className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
