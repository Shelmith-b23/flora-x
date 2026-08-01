import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Mail, Lock, User, Phone, AlertCircle, ArrowRight } from 'lucide-react';

export default function Register() {
  const { registerUser, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'customer' | 'florist'>('customer');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await registerUser({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        role
      });
      setSubmitting(false);
      
      // Auto-login or direct to confirmation page
      // Store token on local state to verify or trigger verification
      if (result.token) {
        localStorage.setItem('florax_simulated_verify_token', result.token);
      }
      
      // Let's redirect to 'email-sent' page with the registered email in parameters or state
      window.location.hash = `#/email-sent?email=${encodeURIComponent(email)}&role=${role}`;
    } catch (err: any) {
      setSubmitting(false);
      setError(err.message);
    }
  };

  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen flex items-center justify-center px-6" id="register-page">
      <div className="w-full max-w-lg space-y-8">
        
        {/* Header Block */}
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary block">
            Join the Botanical Revolution
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs md:text-sm text-text-muted">
            Register to save addresses, track same-day orders, or open your florist store.
          </p>
        </div>

        {/* Register Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-utility-border rounded-2xl p-6 md:p-8 shadow-xs space-y-6"
        >
          {error && (
            <div className="p-3 bg-utility-error/10 border border-utility-error/25 rounded-md flex items-center gap-2 text-xs text-brand-primary">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Choice Buttons */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-canvas rounded-lg border border-utility-border">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                role === 'customer' 
                  ? 'bg-white text-brand-primary shadow-xs' 
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              🛍️ Customer Registration
            </button>
            <button
              type="button"
              onClick={() => setRole('florist')}
              className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                role === 'florist' 
                  ? 'bg-white text-brand-primary shadow-xs' 
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              🌸 Florist Vendor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Alara"
                    className="w-full pl-9 pr-4 py-3 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Mwangi"
                    className="w-full pl-9 pr-4 py-3 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +254 711 000 111"
                  className="w-full pl-9 pr-4 py-3 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alara@example.com"
                  className="w-full pl-9 pr-4 py-3 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-9 pr-4 py-3 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                />
              </div>
            </div>

            {role === 'florist' && (
              <div className="p-3.5 bg-brand-primary/5 rounded-lg text-[11px] text-text-secondary leading-relaxed border border-brand-primary/10">
                ℹ️ <span className="font-bold">Next Steps for Florists:</span> Upon email validation, you will be guided through our 4-step Store Setup Wizard (till setup, greenhouse locations, legal name verification). Your store is visible only after curation approval.
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:bg-brand-primary/50"
            >
              {submitting ? 'Registering Account...' : 'Create Account'}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-xs text-text-secondary pt-2">
            Already have an account?{' '}
            <a href="#/login" className="font-bold text-brand-primary hover:underline">
              Sign in here
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
