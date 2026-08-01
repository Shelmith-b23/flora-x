import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Check, AlertCircle, Loader, ArrowRight } from 'lucide-react';

export default function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleVerify = async () => {
      // Parse token from hash URL parameter: #/verify-email?token=xyz
      const hash = window.location.hash;
      const paramStr = hash.split('?')[1] || '';
      const params = new URLSearchParams(paramStr);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setErrorMsg('Verification token is missing. Please check your verification link.');
        return;
      }

      try {
        await verifyEmail(token);
        setStatus('success');
        localStorage.removeItem('florax_simulated_verify_token');
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'Verification failed. The link may have expired.');
      }
    };

    // Staging delay for elegance
    const timer = setTimeout(() => {
      handleVerify();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen flex items-center justify-center px-6" id="verify-email-page">
      <div className="w-full max-w-md bg-white border border-utility-border rounded-2xl p-8 shadow-xs text-center">
        
        {status === 'verifying' && (
          <div className="space-y-6 py-8">
            <Loader className="w-10 h-10 text-brand-primary animate-spin mx-auto" />
            <div className="space-y-1">
              <h1 className="text-xl font-display font-semibold text-text-primary">Verifying Email</h1>
              <p className="text-xs text-text-muted">Confirming secure signature with Flora_X security services...</p>
            </div>
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
              <h1 className="text-2xl font-display font-semibold text-text-primary">Email Verified!</h1>
              <p className="text-xs text-text-secondary leading-relaxed">
                Asante sana! Your email address has been verified. Your security credential logs have been successfully initialized.
              </p>
            </div>
            <button
              onClick={() => { window.location.hash = '#/login'; }}
              className="w-full py-3 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Sign In to Your Account
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6"
          >
            <div className="w-14 h-14 bg-utility-error/10 text-brand-primary rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-semibold text-text-primary">Verification Failed</h1>
              <p className="text-xs text-brand-primary leading-relaxed">{errorMsg}</p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => { window.location.hash = '#/register'; }}
                className="w-full py-3 border border-utility-border hover:bg-canvas font-semibold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer"
              >
                Return to Registration
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
