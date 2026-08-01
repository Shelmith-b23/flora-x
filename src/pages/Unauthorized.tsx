import React from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen flex items-center justify-center px-6" id="unauthorized-page">
      <div className="w-full max-w-md bg-white border border-utility-border rounded-2xl p-8 shadow-xs text-center space-y-6">
        
        <div className="w-14 h-14 bg-brand-primary/5 text-brand-primary rounded-full flex items-center justify-center mx-auto border border-brand-primary/10">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary block">
            Access Restricted
          </span>
          <h1 className="text-2xl font-display font-semibold text-text-primary tracking-tight">
            Unauthorized Session
          </h1>
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
            You must be logged in to access this secured dashboard. Please sign in with your Flora_X security credentials.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => { window.location.hash = '#/login'; }}
            className="w-full py-3 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            Go to Sign In
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div>
          <a href="#/" className="text-xs font-semibold text-text-muted hover:text-brand-primary uppercase tracking-wider">
            Back to Home
          </a>
        </div>

      </div>
    </div>
  );
}
