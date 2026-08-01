import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const resp = await forgotPassword(email);
      setLoading(false);
      setSubmitted(true);
      if (resp.token) {
        setToken(resp.token);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen flex items-center justify-center px-6" id="forgot-password-page">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header Block */}
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary block">
            Access Recovery
          </span>
          <h1 className="text-3xl font-display font-semibold text-text-primary tracking-tight">
            Forgot Password
          </h1>
          <p className="text-xs md:text-sm text-text-muted">
            Enter your email below. We'll send instructions to reset your password.
          </p>
        </div>

        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-utility-border rounded-2xl p-6 md:p-8 shadow-xs text-center space-y-6"
          >
            <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display font-semibold text-text-primary text-sm">Check Your Inbox</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                If an account matches <span className="font-semibold text-text-primary">{email}</span>, we have sent a secure recovery link.
              </p>
            </div>

            {/* Simulated Token Block for Developer Experience */}
            <div className="bg-canvas border border-utility-border rounded-xl p-4 space-y-3 text-left">
              <div className="flex items-center gap-1 font-bold text-brand-primary uppercase tracking-wider text-[10px]">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                <span>Developer Sandbox Simulator</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                We intercepted the reset email. Click the button below to simulate receiving the email link:
              </p>
              <button
                onClick={() => {
                  const targetToken = token || 'pwd-' + Math.random().toString(36).substr(2, 9);
                  window.location.hash = `#/reset-password?token=${targetToken}`;
                }}
                className="w-full py-2 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-[10px] uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                Simulate Reset Password
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="pt-2">
              <a href="#/login" className="text-xs font-semibold text-text-muted hover:text-brand-primary uppercase tracking-wider">
                Return to Sign In
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-utility-border rounded-2xl p-6 md:p-8 shadow-xs space-y-6"
          >
            {error && (
              <div className="p-3 bg-utility-error/10 border border-utility-error/25 rounded-md flex items-center gap-2 text-xs text-brand-primary">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="e.g. user@florax.co.ke"
                    className="w-full pl-9 pr-4 py-3 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:bg-brand-primary/50"
              >
                {loading ? 'Processing...' : 'Send Recovery Link'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="text-center text-xs text-text-secondary pt-2">
              Remembered your password?{' '}
              <a href="#/login" className="font-bold text-brand-primary hover:underline">
                Sign in
              </a>
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
}
