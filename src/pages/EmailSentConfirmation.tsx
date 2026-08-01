import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function EmailSentConfirmation() {
  const [email, setEmail] = useState('your email');
  const [role, setRole] = useState('customer');
  const [token, setToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    if (params.get('email')) setEmail(params.get('email') || '');
    if (params.get('role')) setRole(params.get('role') || '');
    
    // Check if there is a simulated token in localStorage
    const savedToken = localStorage.getItem('florax_simulated_verify_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen flex items-center justify-center px-6" id="email-sent-page">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary block">
            Verification Pending
          </span>
          <h1 className="text-3xl font-display font-semibold text-text-primary tracking-tight">
            Email Sent!
          </h1>
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
            We have dispatched a verification email to <span className="font-bold text-text-primary">{email}</span>.
            Please click the link in the message to verify your identity and activate your account.
          </p>
        </div>

        {/* Simulator Tool */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-utility-border rounded-xl p-5 space-y-3.5 text-left text-xs shadow-xs"
        >
          <div className="flex items-center gap-1.5 font-bold text-brand-primary uppercase tracking-wider text-[10px]">
            <Sparkles className="w-4 h-4 text-brand-primary shrink-0" />
            <span>Developer Sandbox Email Simulator</span>
          </div>
          <p className="text-text-muted leading-relaxed text-[11px]">
            Since this is a simulated sandbox environment, we have intercepted the verification email for you. Click the button below to simulate receiving the email and complete verification:
          </p>
          <button
            onClick={() => {
              const targetToken = token || 'tok-' + Math.random().toString(36).substr(2, 9);
              window.location.hash = `#/verify-email?token=${targetToken}`;
            }}
            className="w-full py-2.5 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            Simulate Email Link Click
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        <div className="pt-2">
          <a href="#/login" className="text-xs font-semibold text-text-muted hover:text-brand-primary uppercase tracking-wider">
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
