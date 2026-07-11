import React from 'react';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6" id="not-found-page">
      <div className="max-w-md w-full bg-white border border-utility-border rounded-2xl p-8 text-center space-y-6 shadow-md">
        <div className="w-16 h-16 bg-brand-secondary/10 text-brand-secondary rounded-full flex items-center justify-center mx-auto animate-pulse">
          <HelpCircle className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="font-display font-semibold text-4xl text-text-primary tracking-tight">404</h1>
          <h2 className="font-display font-medium text-text-primary text-base">Arrangement Lost in Transit</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            The floral catalog path you specified could not be resolved. It may have withered or been moved to another design gallery.
          </p>
        </div>

        <button
          onClick={() => { window.location.hash = '#/'; }}
          className="w-full py-3 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Curated Gallery
        </button>
      </div>
    </div>
  );
}
