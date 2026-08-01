import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Heart, Menu, X, Trash2, CheckCircle, Smartphone, CreditCard, Landmark, MapPin, Sparkles, Smile, Star, Phone, Mail, ArrowRight, Compass, LogOut, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { MOCK_PRODUCTS } from '../data';
import axios from 'axios';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const {
    cart,
    wishlist,
    removeFromCart,
    updateCartQuantity,
    toggleWishlist,
    isCartOpen,
    setCartOpen,
    isWishlistOpen,
    setWishlistOpen,
    clearCart
  } = useApp();

  const { user, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment' | 'processing' | 'success'>('cart');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [parentOrderId, setParentOrderId] = useState('');

  // Sync recipient and phone from user profile
  useEffect(() => {
    if (user) {
      if (!recipientName && user.profile) {
        setRecipientName(`${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim());
      }
      if (!recipientPhone && user.profile) {
        setRecipientPhone(user.profile.phoneNumber || '');
      }
      if (!mpesaPhone && user.profile) {
        setMpesaPhone(user.profile.phoneNumber || '');
      }
    }
  }, [user]);

  // Scroll listener for sticky header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate cart metrics (accounting for multi-vendor logistics)
  const cartSubtotal = cart.reduce((sum, item) => {
    const sizePriceAdjustment = { Standard: 0, Deluxe: 1500, Grandee: 3000 };
    const itemPrice = item.product.price + sizePriceAdjustment[item.size];
    return sum + itemPrice * item.quantity;
  }, 0);

  // Group items by florist to compute multi-vendor delivery fees
  const uniqueFloristIds = Array.from(new Set(cart.map((item) => item.product.floristId)));
  const baseDeliveryFee = 350; // flat KES fee per florist
  const totalDeliveryFee = uniqueFloristIds.length * baseDeliveryFee;
  const finalTotal = cartSubtotal + totalDeliveryFee;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (checkoutStep === 'cart') {
      if (!user) {
        setErrorMessage('You must be logged in to checkout.');
        return;
      }
      setCheckoutStep('payment');
    } else if (checkoutStep === 'payment') {
      if (!recipientName || !recipientPhone || !deliveryAddress || !deliveryDate) {
        setErrorMessage('All delivery fields are required.');
        return;
      }

      setCheckoutStep('processing');

      try {
        // Step 1: Create Checkout Session
        const createResp = await axios.post('/api/v1/checkout/create-session', {
          recipient_name: recipientName,
          recipient_phone: recipientPhone,
          delivery_address: deliveryAddress,
          delivery_date: deliveryDate,
          delivery_instructions: deliveryInstructions,
          items: cart.map(item => ({
            product_id: item.product.id,
            size: item.size,
            quantity: item.quantity,
            cardMessage: item.cardMessage
          }))
        });

        if (createResp.data.success) {
          const parentOrdId = createResp.data.data.parent_order_id;
          setParentOrderId(parentOrdId);

          // Step 2: Trigger M-Pesa STK Push (if mpesa) or handle card
          if (paymentMethod === 'mpesa') {
            const payResp = await axios.post('/api/v1/checkout/pay-mpesa', {
              parent_order_id: parentOrdId,
              mpesa_phone: mpesaPhone || recipientPhone
            });

            if (payResp.data.success) {
              // Start Polling Verification
              let pollCount = 0;
              const interval = setInterval(async () => {
                pollCount++;
                try {
                  const verifyResp = await axios.get(`/api/v1/checkout/verify/${parentOrdId}`);
                  if (verifyResp.data.success && verifyResp.data.data.payment_status === 'paid') {
                    clearInterval(interval);
                    setCheckoutStep('success');
                  } else if (verifyResp.data.success && verifyResp.data.data.payment_status === 'failed') {
                    clearInterval(interval);
                    setCheckoutStep('payment');
                    setErrorMessage('M-Pesa payment failed. Please try again.');
                  }
                } catch (err) {
                  console.error('Polling payment error:', err);
                }

                // Timeout after 15 polls (~30 seconds)
                if (pollCount > 15) {
                  clearInterval(interval);
                  setCheckoutStep('payment');
                  setErrorMessage('Payment confirmation timed out. Please check your transaction list later.');
                }
              }, 2000);
            } else {
              setCheckoutStep('payment');
              setErrorMessage(payResp.data.error?.message || 'Failed to initialize M-Pesa transaction.');
            }
          } else {
            // Simulated Card Checkout Success
            setTimeout(() => {
              setCheckoutStep('success');
            }, 3000);
          }
        } else {
          setCheckoutStep('payment');
          setErrorMessage(createResp.data.error?.message || 'Failed to create checkout session.');
        }
      } catch (err: any) {
        console.error('Checkout execution error:', err);
        setCheckoutStep('payment');
        const apiError = err.response?.data?.error?.message || 'An error occurred during checkout processing.';
        setErrorMessage(apiError);
      }
    }
  };

  const handleResetCheckout = () => {
    setCheckoutStep('cart');
    setCartOpen(false);
    clearCart();
    setRecipientName('');
    setRecipientPhone('');
    setDeliveryAddress('');
    setDeliveryInstructions('');
    setErrorMessage('');
    setParentOrderId('');
  };

  const wishlistedProducts = MOCK_PRODUCTS.filter((p) => wishlist.includes(p.id));

  // Five Rapid Clicks Logo Admin Access Handler
  const [logoClicks, setLogoClicks] = useState(0);
  const [lastLogoClickTime, setLastLogoClickTime] = useState(0);
  const [showAdminAccessModal, setShowAdminAccessModal] = useState(false);

  const handleLogoClick = () => {
    const now = Date.now();
    let newCount = 1;
    if (now - lastLogoClickTime <= 3000) {
      newCount = logoClicks + 1;
    }
    
    setLastLogoClickTime(now);
    setLogoClicks(newCount);

    if (newCount >= 5) {
      setShowAdminAccessModal(true);
      setLogoClicks(0);
      setLastLogoClickTime(0);
      return;
    }

    window.location.hash = '#/';
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-canvas text-text-primary" id="layout-wrapper">
      {/* 1. Header Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-canvas/95 backdrop-blur-md border-b border-utility-border py-3 shadow-xs'
            : 'bg-transparent py-5'
        }`}
        id="global-header"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-display font-semibold text-sm transition-transform group-hover:scale-105 shadow-md">
              F_X
            </div>
            <span className="font-display font-bold text-lg md:text-xl tracking-tight text-text-primary">
              Flora<span className="text-brand-primary">_X</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-text-secondary">
            <span onClick={() => { window.location.hash = '#/shop'; }} className="hover:text-brand-primary transition-colors cursor-pointer">Shop Catalog</span>
            <span onClick={() => { window.location.hash = '#/florists'; }} className="hover:text-brand-primary transition-colors cursor-pointer">Florists Guild</span>
            <span onClick={() => { window.location.hash = '#/occasions'; }} className="hover:text-brand-primary transition-colors cursor-pointer">Occasions</span>
            <span onClick={() => { window.location.hash = '#/categories'; }} className="hover:text-brand-primary transition-colors cursor-pointer">Varieties</span>
            <span onClick={() => { window.location.hash = '#/blog'; }} className="hover:text-brand-primary transition-colors cursor-pointer">Journal</span>
            <span onClick={() => { window.location.hash = '#/about'; }} className="hover:text-brand-primary transition-colors cursor-pointer">Our Roots</span>
            <span onClick={() => { window.location.hash = '#/faq'; }} className="hover:text-brand-primary transition-colors cursor-pointer">FAQ</span>
            <span onClick={() => { window.location.hash = '#/become-a-florist'; }} className="hover:text-brand-secondary transition-colors cursor-pointer text-brand-primary font-bold">Join Guild</span>
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setWishlistOpen(true)}
              className="relative p-2 rounded-full hover:bg-canvas text-text-primary hover:text-brand-primary transition-all active:scale-95 cursor-pointer"
              aria-label="Wishlist"
              id="header-wishlist-toggle"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-brand-secondary text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-canvas text-text-primary hover:text-brand-primary transition-all active:scale-95 cursor-pointer"
              aria-label="Shopping Cart"
              id="header-cart-toggle"
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-brand-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => {
                    if (user.role === 'admin' || user.role === 'super_admin') {
                      window.location.hash = '#/admin';
                    } else if (user.role === 'florist' && !user.floristStatus) {
                      window.location.hash = '#/register/florist';
                    } else if (user.role === 'florist' && user.floristStatus === 'pending_review') {
                      window.location.hash = '#/pending-approval';
                    } else {
                      window.location.hash = '#/profile';
                    }
                  }}
                  className="px-3.5 py-2 border border-brand-primary bg-brand-primary/5 rounded-lg text-xs font-bold uppercase tracking-wider text-brand-primary cursor-pointer transition-all hover:bg-brand-primary/10 flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                  {user.profile.firstName || 'My Profile'}
                </button>
                <button
                  onClick={logout}
                  className="px-3.5 py-2 border border-utility-border text-text-secondary hover:text-brand-secondary hover:border-brand-secondary/40 rounded-lg cursor-pointer hover:bg-canvas transition-all flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => { window.location.hash = '#/login'; }}
                className="hidden sm:block px-4 py-2 bg-brand-primary text-white hover:bg-brand-primary-hover font-bold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-text-primary hover:text-brand-primary focus:outline-hidden"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-utility-border shadow-md overflow-hidden shrink-0"
              id="mobile-navigation"
            >
              <div className="px-6 py-4 flex flex-col gap-3 text-xs font-bold uppercase tracking-wider text-text-secondary">
                <span
                  onClick={() => { window.location.hash = '#/shop'; setIsMobileMenuOpen(false); }}
                  className="py-2 border-b border-utility-border/5 hover:text-brand-primary cursor-pointer block"
                >
                  Shop Catalog
                </span>
                <span
                  onClick={() => { window.location.hash = '#/florists'; setIsMobileMenuOpen(false); }}
                  className="py-2 border-b border-utility-border/5 hover:text-brand-primary cursor-pointer block"
                >
                  Florists Guild
                </span>
                <span
                  onClick={() => { window.location.hash = '#/occasions'; setIsMobileMenuOpen(false); }}
                  className="py-2 border-b border-utility-border/5 hover:text-brand-primary cursor-pointer block"
                >
                  Occasions
                </span>
                <span
                  onClick={() => { window.location.hash = '#/categories'; setIsMobileMenuOpen(false); }}
                  className="py-2 border-b border-utility-border/5 hover:text-brand-primary cursor-pointer block"
                >
                  Flower Varieties
                </span>
                <span
                  onClick={() => { window.location.hash = '#/blog'; setIsMobileMenuOpen(false); }}
                  className="py-2 border-b border-utility-border/5 hover:text-brand-primary cursor-pointer block"
                >
                  Journal Blogs
                </span>
                <span
                  onClick={() => { window.location.hash = '#/about'; setIsMobileMenuOpen(false); }}
                  className="py-2 border-b border-utility-border/5 hover:text-brand-primary cursor-pointer block"
                >
                  Our Roots
                </span>
                <span
                  onClick={() => { window.location.hash = '#/faq'; setIsMobileMenuOpen(false); }}
                  className="py-2 border-b border-utility-border/5 hover:text-brand-primary cursor-pointer block"
                >
                  FAQ Support
                </span>
                <span
                  onClick={() => { window.location.hash = '#/become-a-florist'; setIsMobileMenuOpen(false); }}
                  className="py-2 text-brand-primary hover:text-brand-primary-hover cursor-pointer block"
                >
                  Become a Partner
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. Main Page Container */}
      <main className="flex-grow">
        {children}
      </main>

      {/* 3. Global Footer */}
      <footer className="bg-white border-t border-utility-border pt-16 pb-8 text-text-secondary" id="global-footer">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-display font-semibold text-sm">
                F_X
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-text-primary">
                Flora<span className="text-brand-primary">_X</span>
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Kenya’s premier botanical collective. Bridging Rift Valley floriculture directly into sophisticated local residential and corporate spaces.
            </p>
            <div className="text-[11px] font-semibold text-text-primary space-y-1.5 font-mono">
              <div>Licensed by: Horti-Guild East Africa</div>
              <div>VAT Reg: KE-554433221</div>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">
              Shopping Guild
            </h3>
            <ul className="space-y-2 text-xs">
              <li><span onClick={() => window.location.hash = '#/shop'} className="hover:text-brand-primary cursor-pointer">Premium Roses</span></li>
              <li><span onClick={() => window.location.hash = '#/shop'} className="hover:text-brand-primary cursor-pointer">Luxury Centerpieces</span></li>
              <li><span onClick={() => window.location.hash = '#/shop'} className="hover:text-brand-primary cursor-pointer">Everlasting Dried Bouquets</span></li>
              <li><span onClick={() => window.location.hash = '#/florists'} className="hover:text-brand-primary cursor-pointer">Find Local Florists</span></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">
              Trust & Support
            </h3>
            <ul className="space-y-2 text-xs">
              <li><span onClick={() => window.location.hash = '#/faq'} className="hover:text-brand-primary cursor-pointer">Fulfillment FAQs</span></li>
              <li><span onClick={() => window.location.hash = '#/careers'} className="hover:text-brand-primary cursor-pointer">Careers at Flora_X</span></li>
              <li><span onClick={() => window.location.hash = '#/privacy'} className="hover:text-brand-primary cursor-pointer">Privacy Policy</span></li>
              <li><span onClick={() => window.location.hash = '#/terms'} className="hover:text-brand-primary cursor-pointer">Terms & Conditions</span></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">
              Studio Hotline
            </h3>
            <div className="text-xs space-y-2">
              <p className="flex items-center gap-1.5 font-medium text-text-primary">
                <Phone className="w-4 h-4 text-brand-primary" />
                +254 711 000 111
              </p>
              <p className="flex items-center gap-1.5 font-medium">
                <Mail className="w-4 h-4 text-brand-primary" />
                care@florax.co.ke
              </p>
              <p className="text-[10px] text-text-muted mt-2">
                We are open for holiday consultations Mon-Sat: 8 AM - 6 PM. Hand-tied logistics 365 days a year.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-utility-border flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[11px] text-text-muted font-medium">
            © 2026 Flora_X Kenya Ltd. Built with professional design guidelines. All rights reserved.
          </span>
          <div className="flex gap-4 items-center shrink-0">
            {/* Mock payment badge assets */}
            <span className="px-2 py-0.5 bg-canvas rounded-xs text-[9px] font-bold text-text-muted uppercase tracking-wider border border-utility-border font-mono">
              M-PESA PUSH
            </span>
            <span className="px-2 py-0.5 bg-canvas rounded-xs text-[9px] font-bold text-text-muted uppercase tracking-wider border border-utility-border font-mono">
              VISA / MASTERCARD
            </span>
          </div>
        </div>
      </footer>

      {/* 4. Cart Side Drawer Overlay Portal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setCartOpen(false)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col justify-between p-6 z-10"
              id="cart-drawer-panel"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-utility-border pb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-brand-primary" />
                  <h3 className="font-display font-semibold text-text-primary text-base">Your Bouquet Bag</h3>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-1.5 bg-canvas rounded-full border border-utility-border text-text-primary hover:scale-105 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Checkout step views */}
              {checkoutStep === 'cart' && (
                <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                  {cart.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                      <div className="w-12 h-12 bg-canvas text-text-muted rounded-full flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-text-secondary">Your bag is currently empty.</p>
                      <button
                        onClick={() => { setCartOpen(false); window.location.hash = '#/shop'; }}
                        className="px-4 py-2 border border-brand-primary text-brand-primary font-semibold text-[11px] uppercase tracking-wider rounded-md"
                      >
                        Shop Flowers
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Cart List */}
                      <div className="space-y-4">
                        {cart.map((item, idx) => (
                          <div key={idx} className="flex gap-4 p-3 border border-utility-border rounded-xl">
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-canvas shrink-0">
                              <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h4 className="text-xs font-semibold text-text-primary truncate">{item.product.title}</h4>
                                <button
                                  onClick={() => removeFromCart(item.product.id, item.size)}
                                  className="text-text-muted hover:text-brand-secondary p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p className="text-[10px] text-brand-secondary font-semibold uppercase font-display mt-0.5">
                                {item.size} • KES {item.product.price.toLocaleString()}
                              </p>
                              
                              {item.cardMessage && (
                                <p className="text-[10px] text-text-muted italic bg-canvas p-1.5 rounded-sm mt-1 line-clamp-1 border border-utility-border/50">
                                  " {item.cardMessage} "
                                </p>
                              )}

                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-utility-border/40">
                                <div className="flex items-center border border-utility-border rounded-xs bg-white h-7">
                                  <button
                                    onClick={() => updateCartQuantity(item.product.id, item.size, item.quantity - 1)}
                                    className="px-2 text-text-secondary font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="w-6 text-center font-bold font-mono text-[11px] text-text-primary">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateCartQuantity(item.product.id, item.size, item.quantity + 1)}
                                    className="px-2 text-text-secondary font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="text-xs font-bold font-mono text-text-primary">
                                  KES {((item.product.price + (item.size === 'Deluxe' ? 1500 : item.size === 'Grandee' ? 3000 : 0)) * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Multivendor Fee breakdown */}
                      <div className="p-4 bg-canvas border border-utility-border rounded-xl space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-display block">
                          Logistics Cost Summary
                        </span>
                        <div className="space-y-1.5 text-xs text-text-secondary">
                          <div className="flex justify-between">
                            <span>Sourced Florists:</span>
                            <span className="font-semibold">{uniqueFloristIds.length} Studio(s)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Regional Delivery Fee:</span>
                            <span className="font-semibold font-mono">KES {totalDeliveryFee.toLocaleString()}</span>
                          </div>
                          <p className="text-[9px] text-text-muted leading-relaxed pt-1.5 border-t border-utility-border/50">
                            * Note: Since you are ordering from {uniqueFloristIds.length} separate master workshops, separate flat delivery fees of KES {baseDeliveryFee} apply per florist.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {checkoutStep === 'payment' && (
                <div className="flex-1 overflow-y-auto py-6 space-y-5">
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-md font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <div className="space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted font-display block border-b border-utility-border pb-1">
                      1. Delivery Details
                    </span>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1">
                          Recipient Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="e.g. Jane Doe"
                          className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1">
                            Recipient Phone *
                          </label>
                          <input
                            type="text"
                            required
                            value={recipientPhone}
                            onChange={(e) => setRecipientPhone(e.target.value)}
                            placeholder="e.g. +254712345678"
                            className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1">
                            Delivery Date *
                          </label>
                          <input
                            type="date"
                            required
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1">
                          Delivery Address *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="e.g. 8th Floor, Delta Towers, Westlands, Nairobi"
                            className="w-full p-2.5 pl-8 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                          />
                          <MapPin className="absolute top-3 left-2.5 w-3.5 h-3.5 text-text-muted" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1">
                          Special Instructions (Optional)
                        </label>
                        <textarea
                          value={deliveryInstructions}
                          onChange={(e) => setDeliveryInstructions(e.target.value)}
                          placeholder="e.g. ring bell, gate code 2468"
                          rows={2}
                          className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted font-display block border-b border-utility-border pb-1">
                      2. Choose Settlement Method
                    </span>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mpesa')}
                        className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'mpesa'
                            ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                            : 'border-utility-border bg-canvas text-text-secondary'
                        }`}
                      >
                        <Smartphone className="w-5 h-5 text-brand-primary" />
                        <span className="text-[11px] font-bold">M-Pesa STK</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                            : 'border-utility-border bg-canvas text-text-secondary'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-brand-secondary" />
                        <span className="text-[11px] font-bold">Card Checkout</span>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    {paymentMethod === 'mpesa' ? (
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted">
                          Safaricom M-Pesa Phone Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={mpesaPhone}
                            onChange={(e) => setMpesaPhone(e.target.value)}
                            placeholder="e.g. 0712345678"
                            className="w-full p-3 pl-10 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary font-mono text-text-secondary"
                          />
                          <Smartphone className="absolute top-3.5 left-3 w-4 h-4 text-text-muted" />
                        </div>
                        <p className="text-[10px] text-text-muted">
                          You will receive an immediate STK pin query on your mobile to securely complete the transaction.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="XXXX XXXX XXXX XXXX"
                            className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="MM/YY"
                              className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1">
                              CVV Security Code
                            </label>
                            <input
                              type="password"
                              required
                              placeholder="***"
                              maxLength={3}
                              className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-utility-border space-y-3 shrink-0">
                      <div className="flex justify-between text-xs text-text-secondary font-medium">
                        <span>Checkout Total:</span>
                        <span className="font-bold text-brand-primary font-mono text-sm">KES {finalTotal.toLocaleString()}</span>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer"
                      >
                        Confirm Settlement
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('cart')}
                        className="w-full text-center text-xs font-semibold uppercase text-text-muted hover:text-text-primary transition-all py-1 cursor-pointer"
                      >
                        ← Back to Bag
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {checkoutStep === 'processing' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 p-6">
                  <div className="w-14 h-14 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  <div className="space-y-1.5">
                    <h4 className="font-display font-semibold text-text-primary text-base">STK Push Transmitting...</h4>
                    <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                      We have sent an M-Pesa push query to <span className="font-semibold font-mono">{mpesaPhone || 'your device'}</span>. Please input your secure M-Pesa PIN on your phone to authorize this payout.
                    </p>
                  </div>
                </div>
              )}

              {checkoutStep === 'success' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 p-6">
                  <div className="w-16 h-16 bg-utility-success/10 text-brand-primary rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-display font-semibold text-text-primary text-lg">Order Booking Secured!</h4>
                    <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                      Your payout was approved successfully! Your chosen master florists have been alerted and are hand-arranging your blooms. You will receive live SMS shipping status updates shortly.
                    </p>
                  </div>
                  <button
                    onClick={handleResetCheckout}
                    className="px-6 py-2.5 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md"
                  >
                    Asante Sana • Continue
                  </button>
                </div>
              )}

              {/* Total checkout calculation footer */}
              {checkoutStep === 'cart' && cart.length > 0 && (
                <div className="border-t border-utility-border pt-4 space-y-4 shrink-0 bg-white">
                  <div className="space-y-1.5 text-xs text-text-secondary">
                    <div className="flex justify-between">
                      <span>Items Subtotal:</span>
                      <span className="font-semibold font-mono">KES {cartSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Logistics Fee:</span>
                      <span className="font-semibold font-mono">KES {totalDeliveryFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-text-primary border-t border-utility-border/50 pt-2">
                      <span>Final Total:</span>
                      <span className="font-bold text-brand-primary font-mono text-base">KES {finalTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCheckoutStep('payment')}
                    className="w-full py-3 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    Proceed To Settlement
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Wishlist Side Drawer overlay */}
      <AnimatePresence>
        {isWishlistOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setWishlistOpen(false)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col justify-between p-6 z-10"
              id="wishlist-drawer-panel"
            >
              <div className="flex items-center justify-between border-b border-utility-border pb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-brand-secondary fill-brand-secondary" />
                  <h3 className="font-display font-semibold text-text-primary text-base">Your Saved Favorites</h3>
                </div>
                <button
                  onClick={() => setWishlistOpen(false)}
                  className="p-1.5 bg-canvas rounded-full border border-utility-border text-text-primary hover:scale-105 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {wishlistedProducts.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-12 h-12 bg-canvas text-text-muted rounded-full flex items-center justify-center mx-auto">
                      <Heart className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-text-secondary">You have no saved arrangements yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wishlistedProducts.map((p) => (
                      <div key={p.id} className="flex gap-4 p-3 border border-utility-border rounded-xl items-center">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-canvas shrink-0">
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-text-primary truncate">{p.title}</h4>
                          <p className="text-[10px] text-text-muted mt-0.5">By {p.floristName}</p>
                          <div className="text-xs font-bold font-mono text-brand-primary mt-1">
                            KES {p.price.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => {
                              removeFromCart(p.id, 'Standard');
                              // Toggle to trigger add
                              toggleWishlist(p.id);
                            }}
                            className="p-1.5 bg-brand-primary/5 border border-brand-primary/10 hover:bg-brand-primary/10 rounded-full text-brand-primary cursor-pointer"
                            aria-label="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-brand-secondary" />
                          </button>
                          <button
                            onClick={() => {
                              window.location.hash = `#/product/${p.id}`;
                              setWishlistOpen(false);
                            }}
                            className="px-2.5 py-1.5 bg-brand-primary text-white text-[10px] font-bold uppercase rounded-md tracking-wider"
                          >
                            Order
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-utility-border shrink-0 bg-white">
                <button
                  onClick={() => { setWishlistOpen(false); window.location.hash = '#/shop'; }}
                  className="w-full py-3 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md"
                >
                  Browse Full Collections
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Mobile Bottom Navigation dock */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-utility-border z-30 py-2.5 px-6 flex justify-between items-center shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        <button
          onClick={() => { window.location.hash = '#/'; }}
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-text-muted hover:text-brand-primary"
        >
          <Sparkles className="w-4 h-4 text-brand-primary" />
          <span>Home</span>
        </button>
        <button
          onClick={() => { window.location.hash = '#/shop'; }}
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-text-muted hover:text-brand-primary"
        >
          <Compass className="w-4 h-4" />
          <span>Shop</span>
        </button>
        <button
          onClick={() => setWishlistOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-text-muted hover:text-brand-primary relative"
        >
          <Heart className="w-4 h-4 text-brand-secondary" />
          <span>Saved</span>
          {wishlist.length > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-secondary text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setCartOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-text-muted hover:text-brand-primary relative"
        >
          <ShoppingBag className="w-4 h-4 text-brand-primary" />
          <span>Bag</span>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Hidden Administrator Access Prompt Modal */}
      {showAdminAccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-utility-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-mono font-bold text-lg shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-text-primary text-base">
                  Administrator Access Recognized
                </h3>
                <p className="text-xs text-text-muted">
                  Flora_X Central Governance Switchboard
                </p>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed bg-canvas p-3.5 rounded-xl border border-utility-border">
              You have triggered the hidden administrative doorway via the logo verification pattern. Would you like to proceed to the Flora_X Administrator Login screen?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAdminAccessModal(false)}
                className="px-4 py-2 border border-utility-border hover:bg-canvas text-text-secondary rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAdminAccessModal(false);
                  window.location.hash = '#/admin/login';
                }}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-xs"
              >
                Continue to Admin Portal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
