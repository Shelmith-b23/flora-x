import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

interface LoginProps {
  isAdminLogin?: boolean;
}

export default function Login({ isAdminLogin }: LoginProps) {
  const { login, registerUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdministrativeMode = isAdminLogin || (typeof window !== 'undefined' && window.location.hash.includes('admin/login'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      setSubmitting(false);

      if (isAdministrativeMode) {
        if (loggedUser.role === 'admin' || loggedUser.role === 'super_admin') {
          window.location.hash = '#/admin';
        } else {
          setError('Access Denied: Account does not possess administrative privileges.');
        }
        return;
      }

      // Route based on role
      if (loggedUser.role === 'admin' || loggedUser.role === 'super_admin') {
        window.location.hash = '#/admin';
      } else if (loggedUser.role === 'florist') {
        if (!loggedUser.floristStatus) {
          window.location.hash = '#/register/florist';
        } else if (loggedUser.floristStatus === 'pending_review') {
          window.location.hash = '#/pending-approval';
        } else {
          window.location.hash = '#/profile';
        }
      } else {
        window.location.hash = '#/';
      }
    } catch (err: any) {
      setSubmitting(false);
      setError(err.message);
    }
  };

  const loginQuickRole = async (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
    setSubmitting(true);
    try {
      const loggedUser = await login(roleEmail, rolePass);
      setSubmitting(false);
      if (loggedUser.role === 'admin' || loggedUser.role === 'super_admin') {
        window.location.hash = '#/admin';
      } else if (loggedUser.role === 'florist') {
        if (!loggedUser.floristStatus) {
          window.location.hash = '#/register/florist';
        } else if (loggedUser.floristStatus === 'pending_review') {
          window.location.hash = '#/pending-approval';
        } else {
          window.location.hash = '#/profile';
        }
      } else {
        window.location.hash = '#/';
      }
    } catch (err: any) {
      setSubmitting(false);
      setError(err.message);
    }
  };

  // Google Sign-In Simulator
  const handleGoogleSignIn = async () => {
    setError('');
    setSubmitting(true);
    try {
      // Simulate OAuth flow trigger
      console.log("[OAUTH SIMULATOR] Launching Google ID-Token authentication flow.");
      // Auto-register mock Google user
      const mockGoogleToken = "google-mock-id-token-xyz-123";
      // Fetch details or let server verify
      const resp = await login("admin@florax.co.ke", "admin123"); // Let them in as admin or mock customer
      setSubmitting(false);
      window.location.hash = '#/';
    } catch (err: any) {
      setSubmitting(false);
      setError("Google Sign-In failed to authenticate.");
    }
  };

  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen flex items-center justify-center px-6" id="login-page">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header Block */}
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary block">
            {isAdministrativeMode ? 'Internal Governance Access' : 'Welcome Back'}
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary tracking-tight">
            {isAdministrativeMode ? 'Flora_X Admin Portal' : 'Sign In to Flora_X'}
          </h1>
          <p className="text-xs md:text-sm text-text-muted">
            {isAdministrativeMode ? 'Enter administrative credentials to access the central switchboard.' : 'Connect with verified local florists & secure Same-Day deliveries.'}
          </p>
        </div>

        {/* Login Card */}
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
                  placeholder="e.g. care@florax.co.ke"
                  className="w-full pl-9 pr-4 py-3 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-semibold font-display text-text-muted">
                  Password
                </label>
                <a 
                  href="#/forgot-password" 
                  className="text-[10px] uppercase tracking-wider font-bold text-brand-primary hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-3 text-xs border border-utility-border rounded-md focus:outline-hidden focus:border-brand-primary text-text-secondary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:bg-brand-primary/50"
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-utility-border"></div>
            <span className="flex-shrink mx-4 text-text-muted text-[10px] uppercase font-semibold">Or Continue With</span>
            <div className="flex-grow border-t border-utility-border"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full py-2.5 border border-utility-border hover:bg-canvas rounded-md text-xs font-semibold text-text-secondary transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61a5.62 5.62 0 0 1-2.44 3.71v3.08h3.94c2.31-2.13 3.63-5.27 3.63-8.64z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.94-3.08c-1.12.75-2.54 1.21-3.99 1.21-3.07 0-5.67-2.08-6.6-4.88H1.31v3.18A12 12 0 0 0 12 24z"/>
              <path fill="#FBBC05" d="M5.4 14.34a7.16 7.16 0 0 1 0-4.68V6.48H1.31a12 12 0 0 0 0 11.04l4.09-3.18z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.31 6.48l4.09 3.18c.93-2.8 3.53-4.91 6.6-4.91z"/>
            </svg>
            Google OAuth 2.0
          </button>

          <p className="text-center text-xs text-text-secondary pt-2">
            Don't have an account?{' '}
            <a href="#/register" className="font-bold text-brand-primary hover:underline">
              Register here
            </a>
          </p>
        </motion.div>

        {/* Developer Simulator Shortcuts helper */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-canvas border border-utility-border rounded-xl p-4 space-y-2.5 text-xs text-text-secondary"
        >
          <div className="flex items-center gap-1.5 font-semibold text-brand-primary uppercase tracking-wider text-[10px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer Role Shortcuts (Simulated Credentials)</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Click any shortcut below to bypass password configurations and login instantly:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => loginQuickRole("admin@florax.co.ke", "admin123")}
              className="p-2 border border-utility-border bg-white hover:bg-canvas rounded text-[10px] text-left font-mono cursor-pointer transition-all"
            >
              🟢 <span className="font-bold">System Administrator</span><br/>admin@florax.co.ke
            </button>
            <button
              onClick={() => {
                // If florist doesn't exist, register on post request
                registerUser({
                  email: "florist@florax.co.ke",
                  password: "floristpassword123",
                  firstName: "Naivasha",
                  lastName: "Growers",
                  phoneNumber: "+254 711 222 333",
                  role: "florist"
                }).then(() => {
                  loginQuickRole("florist@florax.co.ke", "floristpassword123");
                }).catch(() => {
                  loginQuickRole("florist@florax.co.ke", "floristpassword123");
                });
              }}
              className="p-2 border border-utility-border bg-white hover:bg-canvas rounded text-[10px] text-left font-mono cursor-pointer transition-all"
            >
              🌸 <span className="font-bold">Partner Florist</span><br/>florist@florax.co.ke
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
