import React from 'react';
import { ShieldX, ArrowLeft } from 'lucide-react';

export default function Forbidden() {
  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen flex items-center justify-center px-6" id="forbidden-page">
      <div className="w-full max-w-md bg-white border border-utility-border rounded-2xl p-8 shadow-xs text-center space-y-6">
        
        <div className="w-14 h-14 bg-utility-error/10 text-brand-primary rounded-full flex items-center justify-center mx-auto">
          <ShieldX className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary block">
            Access Denied
          </span>
          <h1 className="text-2xl font-display font-semibold text-text-primary tracking-tight">
            Role Conflict (403)
          </h1>
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
            Your active role does not possess the administrative privileges required to access this routing directory.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => { window.location.hash = '#/'; }}
            className="w-full py-3 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}
