import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, Phone, Mail, LogOut } from 'lucide-react';

export default function PendingApproval() {
  const { user, logout } = useAuth();

  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen flex items-center justify-center px-6" id="pending-approval-page">
      <div className="w-full max-w-lg bg-white border border-utility-border rounded-2xl p-6 md:p-8 shadow-xs text-center space-y-6">
        
        <div className="w-16 h-16 bg-brand-primary/5 text-brand-primary rounded-full flex items-center justify-center mx-auto border border-brand-primary/15 animate-pulse">
          <Clock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-brand-primary/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-brand-primary">
            Vetting Stage
          </span>
          <h1 className="text-3xl font-display font-semibold text-text-primary tracking-tight">
            Application Pending Review
          </h1>
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
            Thank you for applying to the Flora_X Florist Guild! Your store profile has been successfully built and is currently queued for audit.
          </p>
        </div>

        <div className="p-4 bg-canvas border border-utility-border rounded-xl text-left text-xs text-text-secondary space-y-3.5 leading-relaxed">
          <p className="font-semibold text-text-primary">What happens next?</p>
          <ul className="space-y-2.5 list-disc pl-4 text-[11px]">
            <li>Our local Nairobi vetting coordinators will verify your <span className="font-semibold">M-Pesa Buy Goods Till</span> number.</li>
            <li>We may schedule a brief virtual review of your cold-storage transport arrangements.</li>
            <li>Once approved, you will receive an SMS and email notification. You will then be able to upload custom flower products.</li>
          </ul>
        </div>

        {/* Contact details */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-utility-border text-left">
          <div className="flex gap-2 text-xs text-text-secondary">
            <Phone className="w-4 h-4 text-brand-primary shrink-0" />
            <div>
              <p className="font-semibold text-text-primary">Telephone Support</p>
              <p className="text-[10px] font-mono mt-0.5">+254 711 000 111</p>
            </div>
          </div>
          <div className="flex gap-2 text-xs text-text-secondary">
            <Mail className="w-4 h-4 text-brand-primary shrink-0" />
            <div>
              <p className="font-semibold text-text-primary">Support Email</p>
              <p className="text-[10px] mt-0.5">vetting@florax.co.ke</p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-between items-center gap-4">
          <button
            onClick={() => { window.location.hash = '#/'; }}
            className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-brand-primary transition-all cursor-pointer"
          >
            ← View Directory
          </button>
          
          <button
            onClick={logout}
            className="px-5 py-2.5 border border-utility-border hover:bg-canvas rounded-md text-xs font-semibold uppercase tracking-wider text-text-secondary cursor-pointer flex items-center gap-2"
          >
            Sign Out
            <LogOut className="w-4 h-4 text-brand-primary" />
          </button>
        </div>

      </div>
    </div>
  );
}
