import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Lock, Check, AlertCircle, ArrowRight } from 'lucide-react';

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Parse token from hash query parameter
    const hash = window.location.hash;
    const paramStr = hash.split('?')[1] || '';
    const params = new URLSearchParams(paramStr);
    const tok = params.get('token');
    
    if (tok) {
      setToken(tok);
    } else {
      setStatus('error');
      setErrorMsg('Recovery token is missing. Please initiate a new recovery request.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setSubmitting(false);
      setStatus('success');
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg(err.message || 'Password reset failed. The token may be invalid or expired.');
    }
  };

  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen flex items-center justify-center px-6" id="reset-password-page">
      <div className="w-full max-w-md bg-white border border-utility-border rounded-2xl p-6 md:p-8 shadow-xs text-center">
        
        {status === 'form' && (
          <div className="space-y-6 text-left">
            <div className="text-center space-y-1">
              <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary block">
                Security Update
              </span>
              <h1 className="text-2xl font-display font-semibold text-text-primary tracking-tight">
                Reset Password
              </h1>
              <p className="text-xs text-text-muted">Set a secure, durable, and unique new password.</p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-utility-error/10 border border-utility-error/25 rounded-md flex items-center gap-2 text-xs text-brand-primary">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                  New Password
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

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retype password"
                    className="w-full pl-9 pr-4 py-3 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:bg-brand-primary/50"
              >
                {submitting ? 'Updating...' : 'Complete Reset'}
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}

        {status === 'success' && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6"
          >
            <div className="w-14 h-14 bg-utility-success/10 text-brand-primary rounded-full flex items-center justify-center mx-auto">
              <Check className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-semibold text-text-primary">Password Reset!</h1>
              <p className="text-xs text-text-secondary leading-relaxed">
                Your credentials have been updated successfully. All active sessions have been revoked for your security.
              </p>
            </div>
            <button
              onClick={() => { window.location.hash = '#/login'; }}
              className="w-full py-3 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Sign In with New Password
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6 animate-fade-in"
          >
            <div className="w-14 h-14 bg-utility-error/10 text-brand-primary rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-semibold text-text-primary">Error Resolving Token</h1>
              <p className="text-xs text-brand-primary leading-relaxed">{errorMsg}</p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => { window.location.hash = '#/forgot-password'; }}
                className="w-full py-3 border border-utility-border hover:bg-canvas font-semibold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer"
              >
                Request New Password Link
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
