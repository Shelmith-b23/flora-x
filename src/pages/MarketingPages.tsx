import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Award, Clock, Star, HelpCircle, MessageSquare, ArrowRight, ShieldCheck, FileText, Check, Briefcase } from 'lucide-react';
import { MOCK_BLOGS, MOCK_REVIEWS, MOCK_OCCASIONS, MOCK_CATEGORIES } from '../data';

// ==========================================
// 1. ABOUT PAGE
// ==========================================
export function About() {
  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen" id="about-page">
      <div className="w-full max-w-4xl mx-auto px-6 space-y-12">
        <div className="text-center">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary font-display block mb-1">
            Our Kenya Roots
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-semibold text-text-primary tracking-tight">
            The Journey of Flora_X
          </h1>
          <p className="text-xs md:text-sm text-text-muted mt-2 max-w-xl mx-auto leading-relaxed">
            Cultivating an elegant, sustainable digital marketplace that connects Rift Valley micro-growers directly with floral connoisseurs.
          </p>
        </div>

        <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-utility-border shadow-md">
          <img
            src="https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=1200"
            alt="Beautiful Rose Fields in Naivasha"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="bg-white border border-utility-border rounded-2xl p-6 md:p-8 shadow-xs space-y-6 text-xs md:text-sm text-text-secondary leading-relaxed">
          <h2 className="font-display font-semibold text-base md:text-lg text-text-primary border-b border-utility-border pb-3">
            Our Sustainable Marketplace Vision
          </h2>
          <p>
            Traditionally, East Africa’s magnificent high-altitude roses, lilies, and orchids were flown overseas to European auction houses before ever finding a home in Nairobi. Flora_X was created to rewrite this supply chain.
          </p>
          <p>
            By establishing a digital cooperative storefront network, we enable local independent Kenyan florists to bypass multi-tier wholesalers and trade directly. This empowers local agricultural families surrounding Naivasha, Mombasa, and Eldoret while providing you with blooms cut on the exact morning of delivery.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="p-4 bg-canvas rounded-xl text-center space-y-2">
              <span className="text-2xl font-bold text-brand-primary font-mono">100%</span>
              <h4 className="text-xs font-bold text-text-primary">Locally Harvested</h4>
              <p className="text-[11px] text-text-muted">Directly supporting independent regional Kenyan greenhouse farms.</p>
            </div>
            <div className="p-4 bg-canvas rounded-xl text-center space-y-2">
              <span className="text-2xl font-bold text-brand-primary font-mono">12+ Days</span>
              <h4 className="text-xs font-bold text-text-primary">Vase Lifespan</h4>
              <p className="text-[11px] text-text-muted">Thanks to our rapid, temperature-regulated cold supply chain.</p>
            </div>
            <div className="p-4 bg-canvas rounded-xl text-center space-y-2">
              <span className="text-2xl font-bold text-brand-primary font-mono">KES 40M+</span>
              <h4 className="text-xs font-bold text-text-primary">Paid to Florists</h4>
              <p className="text-[11px] text-text-muted">Directly bolstering local artisans and craft communities.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. REVIEWS PAGE
// ==========================================
export function Reviews() {
  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen" id="reviews-page">
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary font-display block mb-1">
            Community Voice
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary tracking-tight">
            Loved Across Kenya
          </h1>
          <p className="text-xs md:text-sm text-text-muted mt-2">
            Read transparent, verified testimonials from customers, brides, and corporate partners who choose Flora_X.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_REVIEWS.map((review) => (
            <div key={review.id} className="bg-white p-6 border border-utility-border rounded-xl shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs md:text-sm text-text-secondary italic leading-relaxed">
                  "{review.comment}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-utility-border">
                <img
                  src={review.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt=""
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
    </div>
  );
}

// ==========================================
// 3. OCCASIONS PAGE
// ==========================================
export function Occasions() {
  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen" id="occasions-page">
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary font-display block mb-1">
            Emotion-Driven Gifting
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary tracking-tight">
            Shop Arrangements by Occasion
          </h1>
          <p className="text-xs md:text-sm text-text-muted mt-2">
            Every lifecycle milestone deserves a beautifully curated floral composition.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_OCCASIONS.map((occ) => (
            <div
              key={occ.id}
              onClick={() => {
                window.location.hash = `#/shop?occasion=${encodeURIComponent(occ.name)}`;
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-utility-border cursor-pointer shadow-xs"
            >
              <img
                src={occ.image}
                alt={occ.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-5 text-white">
                <h3 className="font-display font-semibold text-base mb-1">
                  {occ.name}
                </h3>
                <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">
                  {occ.description}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-accent mt-3 group-hover:underline">
                  Browse Occasion Curations
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. CATEGORIES PAGE
// ==========================================
export function Categories() {
  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen" id="categories-page">
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary font-display block mb-1">
            Botanical Catalog
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary tracking-tight">
            Browse Our Flower Varieties
          </h1>
          <p className="text-xs md:text-sm text-text-muted mt-2">
            Select standard, luxury, or potted single-variety species sourced straight from volcanic greenhouses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                window.location.hash = `#/shop?search=${encodeURIComponent(cat.name)}`;
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group bg-white rounded-xl border border-utility-border overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition-all duration-300"
            >
              <div className="aspect-[16/10] bg-canvas overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold text-sm md:text-base text-text-primary group-hover:text-brand-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  {cat.description}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-primary group-hover:underline mt-4">
                  Shop Curated {cat.name}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. CONTACT PAGE
// ==========================================
export function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen" id="contact-page">
      <div className="w-full max-w-5xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary font-display block mb-1">
            Connect With Us
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary tracking-tight">
            How Can We Assist Your Journey?
          </h1>
          <p className="text-xs md:text-sm text-text-muted mt-2">
            Get support for custom wedding designs, corporate office bookings, or track your live holiday orders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form */}
          <div className="lg:col-span-7 bg-white border border-utility-border rounded-xl p-6 md:p-8 shadow-xs">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-12 h-12 bg-utility-success/10 text-brand-primary rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-text-primary text-base">Asante Sana!</h3>
                <p className="text-xs text-text-secondary max-w-xs mx-auto">
                  Your message was successfully routed to our floral care desk. We will reach back within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                      Your Email
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                    Regarding Inquiry Topic
                  </label>
                  <select className="w-full p-2.5 text-xs border border-utility-border rounded-md bg-white focus:outline-hidden focus:border-brand-primary text-text-secondary font-medium">
                    <option>General Marketplace Order Tracking</option>
                    <option>Bespoke Wedding & Event Packages</option>
                    <option>Become a Verified Florist Partner</option>
                    <option>Corporate Office Arrangement Contracts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what you are envisioning..."
                    className="w-full p-3 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer"
                >
                  Send Inquiry Message
                </button>
              </form>
            )}
          </div>

          {/* Details Card */}
          <div className="lg:col-span-5 bg-canvas border border-utility-border rounded-xl p-6 space-y-6">
            <h3 className="font-display font-semibold text-xs uppercase tracking-widest text-text-muted mb-4 border-b border-utility-border pb-3">
              Office Details & Contacts
            </h3>

            <div className="space-y-4 text-xs text-text-secondary">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-brand-primary shrink-0" />
                <div>
                  <h4 className="font-semibold text-text-primary">Nairobi Head Office</h4>
                  <p className="mt-1 leading-relaxed">
                    Rhapta Road, Block B Westlands, Nairobi, Kenya
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone className="w-5 h-5 text-brand-primary shrink-0" />
                <div>
                  <h4 className="font-semibold text-text-primary">Telephone Support</h4>
                  <p className="mt-1 font-mono">+254 711 000 111 (Mon-Sat, 8 AM - 6 PM)</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail className="w-5 h-5 text-brand-primary shrink-0" />
                <div>
                  <h4 className="font-semibold text-text-primary">Email Desk</h4>
                  <p className="mt-1">care@florax.co.ke</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-utility-border">
              <h4 className="text-[11px] uppercase tracking-wider font-semibold text-text-muted mb-2">Same-Day Delivery Cities</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Nairobi Metro, Naivasha Center, Nyali/Mombasa, Eldoret CBD, and Nanyuki Environs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. FAQ PAGE
// ==========================================
export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does same-day delivery operate?',
      a: 'If you complete your order booking before 1:00 PM (GMT+3), our local florist partner in your specified delivery city will hand-assemble and deliver the bouquet before 6:00 PM that exact evening. Orders placed after 1:00 PM will default to next-day delivery slots.',
    },
    {
      q: 'Can I choose a specific florist to curate my order?',
      a: 'Yes, absolutely. You can browse our Florist Directory directly and shop from their specific page, or filter the search results on the catalog page by your preferred florist studio.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept secure, standard Safaricom M-Pesa payments (complete with immediate STK push to your mobile device for effortless completion) as well as global credit and debit card transactions.',
    },
    {
      q: 'How long will my fresh flowers live?',
      a: 'Due to our rapid local cold chain and direct greenhouse sourcing, our fresh Naivasha roses and mountain carnations live for an exceptional 10 to 14 days when cared for properly with clean, fresh water and the provided nutritional packets.',
    },
    {
      q: 'Can I include a handwritten note?',
      a: 'Yes, and it is completely free! During checkout or Quick View booking, you can type a custom gift card message (up to 150 characters) which our florists will personally handwrite in gorgeous cursive on our luxury card stock.',
    }
  ];

  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen" id="faq-page">
      <div className="w-full max-w-3xl mx-auto px-6 space-y-12">
        <div className="text-center">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary font-display block mb-1">
            Common Inquiries
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary tracking-tight font-display">
            Frequently Asked Questions
          </h1>
          <p className="text-xs md:text-sm text-text-muted mt-2">
            Everything you need to know about Kenya's premium multi-vendor flower marketplace.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className="bg-white border border-utility-border rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center text-xs md:text-sm font-semibold font-display text-text-primary hover:bg-canvas transition-all cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <HelpCircle className={`w-4 h-4 text-brand-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-xs text-text-secondary leading-relaxed border-t border-utility-border bg-canvas/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. CAREERS PAGE
// ==========================================
export function Careers() {
  const positions = [
    { title: 'Regional Supply Chain Logistics Manager', location: 'Nairobi (Westlands)', dept: 'Operations', desc: 'Manage local cold storage cooperative channels from Naivasha farms directly into metropolitan transit centers.' },
    { title: 'Lead Creative Product Designer (Floral Aesthetics)', location: 'Remote / Nairobi', dept: 'Design System', desc: 'Define high-fidelity UI specifications, packaging standards, and audit partner florist wrapping protocols.' },
    { title: 'Senior Full-Stack React Engineer', location: 'Nairobi (Hybrid)', dept: 'Engineering', desc: 'Expand M-Pesa API push states, spatial delivery routing dashboards, and the AI Gift recommendation engines.' }
  ];

  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen" id="careers-page">
      <div className="w-full max-w-4xl mx-auto px-6 space-y-12">
        <div className="text-center">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary font-display block mb-1">
            Grow Your Career
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary tracking-tight font-display">
            Join the Botanical Revolution
          </h1>
          <p className="text-xs md:text-sm text-text-muted mt-2">
            Help us build sustainable agricultural pipelines and premium online shopping models.
          </p>
        </div>

        <div className="space-y-4">
          {positions.map((pos, i) => (
            <div key={i} className="bg-white border border-utility-border rounded-xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex gap-2 text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                  <span>{pos.dept}</span>
                  <span>•</span>
                  <span>{pos.location}</span>
                </div>
                <h3 className="font-display font-semibold text-sm md:text-base text-text-primary">{pos.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed max-w-xl">{pos.desc}</p>
              </div>
              <button
                onClick={() => alert(`Thank you for your interest in the ${pos.title} position! Please send your professional resume to careers@florax.co.ke.`)}
                className="px-5 py-2.5 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1"
              >
                Apply Now
                <Briefcase className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. POLICIES PAGE (Privacy & Terms)
// ==========================================
export function Policies() {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');

  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen" id="policies-page">
      <div className="w-full max-w-4xl mx-auto px-6 space-y-8">
        <div className="flex justify-center border-b border-utility-border mb-6">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-6 py-3 font-display font-semibold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'privacy' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-muted hover:text-brand-primary'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-6 py-3 font-display font-semibold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'terms' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-muted hover:text-brand-primary'
            }`}
          >
            Terms & Conditions
          </button>
        </div>

        <div className="bg-white border border-utility-border rounded-2xl p-6 md:p-8 shadow-xs text-xs md:text-sm text-text-secondary leading-relaxed space-y-6">
          {activeTab === 'privacy' ? (
            <>
              <h1 className="text-xl md:text-2xl font-display font-semibold text-text-primary tracking-tight">Flora_X Privacy Policy</h1>
              <span className="text-[10px] text-text-muted block font-mono">Last updated: July 11, 2026</span>
              <p>
                At Flora_X, we prioritize safeguarding our customers’ personal data and shipping addresses. This Privacy Policy documents how we securely compile, transmit, and protect payment details and geographic coordinates within the Flora_X platform.
              </p>
              <h3 className="font-semibold text-text-primary text-sm pt-2">1. Collected Information</h3>
              <p>
                We capture standard checkout names, mobile phone numbers (specifically required to initiate M-Pesa STK API push requests), delivery street and landmark directions, and personalized handwritten message card text. We do not persist credit card raw details; all payments are routed through bank-grade secure gateways.
              </p>
              <h3 className="font-semibold text-text-primary text-sm pt-2">2. How We Route Location Data</h3>
              <p>
                To provide precise same-day delivery metrics, coordinates are mapped via the Google Maps platform. Location details are shared strictly with the single florist partner curating your bouquet.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl md:text-2xl font-display font-semibold text-text-primary tracking-tight">Flora_X Terms & Conditions</h1>
              <span className="text-[10px] text-text-muted block font-mono">Last updated: July 11, 2026</span>
              <p>
                Welcome to Flora_X. By using our website and purchasing our curated flower arrangements, you fully agree to comply with the following transaction and marketplace policies.
              </p>
              <h3 className="font-semibold text-text-primary text-sm pt-2">1. Same-Day Delivery Cutoff Guidelines</h3>
              <p>
                Our 1:00 PM cutoff is strictly enforced to guarantee cold transport chain integrity. Any orders booked past 1:00 PM (local time GMT+3) are automatically queued for the following morning delivery.
              </p>
              <h3 className="font-semibold text-text-primary text-sm pt-2">2. Multi-Vendor Sub-Orders</h3>
              <p>
                Because Flora_X is a multi-vendor collective, ordering from multiple distinct florists in a single cart session will trigger individual, calculated delivery fees matching the geographical parameters of each workshop.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. BECOME A FLORIST PAGE
// ==========================================
export function BecomeFlorist() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen" id="become-florist-page">
      <div className="w-full max-w-4xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
          <span className="px-3 py-1 bg-brand-primary/10 rounded-full text-xs font-bold uppercase tracking-wider text-brand-primary">
            Partner Program
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary tracking-tight">
            Grow Your Floral Business with Flora_X
          </h1>
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
            Gain immediate access to premium corporate buyers, secure payment processing, SMS status updates, and temperature-controlled logistics networks across Kenya.
          </p>
          <div className="space-y-2 text-xs text-text-secondary font-medium">
            <div className="flex items-center gap-2">🟢 Standard 20% platform commission model</div>
            <div className="flex items-center gap-2">🟢 Next-day payout transfers via M-Pesa Till</div>
            <div className="flex items-center gap-2">🟢 Standard delivery dispatch integrations</div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white border border-utility-border rounded-xl p-6 shadow-md">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 bg-utility-success/10 text-brand-primary rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="font-display font-semibold text-text-primary text-base">Application Received</h3>
              <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                Thank you for applying to the guild! Our vetting coordinators will reach back to schedule a cold storage greenhouse audit within 48 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-display font-semibold text-sm text-text-primary border-b border-utility-border pb-3">
                Register Your Studio
              </h3>
              
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                  Business / Studio Name
                </label>
                <input required type="text" className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                    Your City / Hub
                  </label>
                  <select className="w-full p-2.5 text-xs border border-utility-border rounded-md bg-white focus:outline-hidden focus:border-brand-primary text-text-secondary">
                    <option>Nairobi</option>
                    <option>Naivasha</option>
                    <option>Mombasa</option>
                    <option>Eldoret</option>
                    <option>Nanyuki</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                    M-Pesa Buy Goods Till
                  </label>
                  <input required type="text" placeholder="e.g. 554422" className="w-full p-2.5 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                  Describe Your Sourcing / Experience
                </label>
                <textarea required rows={3} placeholder="Tell us about your workshop, farm ties, and daily capacity..." className="w-full p-3 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary resize-none" />
              </div>

              <button type="submit" className="w-full py-3 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer">
                Submit Partner Application
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. BLOG DIRECTORY PAGE
// ==========================================
export function Blog() {
  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen" id="blog-directory-page">
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary font-display block mb-1">
            Flora_X Journal
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary tracking-tight">
            Floriculture Insights & Design
          </h1>
          <p className="text-xs md:text-sm text-text-muted mt-2">
            Explore articles written by highland rose cultivators, master designers, and shipping specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_BLOGS.map((blog) => (
            <div
              key={blog.id}
              onClick={() => { window.location.hash = `#/blog/${blog.id}`; }}
              className="group bg-white border border-utility-border rounded-xl overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              id={`blog-card-${blog.id}`}
            >
              <div>
                <div className="aspect-[16/10] overflow-hidden bg-canvas">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                    <span>{blog.category}</span>
                    <span className="w-1 h-1 bg-text-muted rounded-full" />
                    <span>{blog.readTime}</span>
                  </div>
                  <h3 className="font-display font-semibold text-sm md:text-base text-text-primary group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-utility-border bg-canvas flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                <span>By {blog.author}</span>
                <span className="group-hover:underline inline-flex items-center gap-1">
                  Read Article
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 11. BLOG DETAILS PAGE
// ==========================================
export function BlogDetails() {
  const [blog, setBlog] = useState(MOCK_BLOGS[0]);

  useEffect(() => {
    const parts = window.location.hash.split('/');
    const id = parts[parts.length - 1];
    const match = MOCK_BLOGS.find((b) => b.id === id);
    if (match) {
      setBlog(match);
    }
  }, [window.location.hash]);

  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen" id="blog-details-page">
      <div className="w-full max-w-3xl mx-auto px-6 space-y-8">
        <button
          onClick={() => { window.location.hash = '#/blog'; }}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-brand-primary cursor-pointer"
        >
          ← Back to Blog Journal
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-bold text-brand-primary uppercase tracking-wider">
            <span>{blog.category}</span>
            <span className="w-1.5 h-1.5 bg-text-muted rounded-full" />
            <span className="text-text-muted">{blog.date}</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-text-primary leading-[1.15] tracking-tight">
            {blog.title}
          </h1>
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs font-bold text-text-primary">Written By: {blog.author}</span>
            <span className="text-text-muted text-xs font-mono">{blog.readTime}</span>
          </div>
        </div>

        <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-utility-border shadow-md">
          <img src={blog.image} alt="" className="w-full h-full object-cover" />
        </div>

        <article className="prose max-w-none text-xs md:text-sm text-text-secondary leading-relaxed space-y-6">
          {blog.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </article>

        {/* Share Section */}
        <div className="pt-8 border-t border-utility-border text-center space-y-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-text-muted block">Share This Entry</span>
          <div className="flex justify-center gap-2.5 text-xs font-semibold">
            <button onClick={() => alert("Copied article link to clipboard!")} className="px-4 py-2 border border-utility-border rounded-md bg-white hover:bg-canvas text-text-primary cursor-pointer">
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
