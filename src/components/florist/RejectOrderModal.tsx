import React, { useState } from 'react';
import { Ban, AlertTriangle, X } from 'lucide-react';

interface RejectOrderModalProps {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

const REJECTION_REASONS = [
  'Flower stems out of stock / fresh stock unavailable',
  'Delivery address outside active delivery zone',
  'Atelier daily order capacity exceeded',
  'Special instructions cannot be fulfilled',
  'Other operational constraint',
];

export default function RejectOrderModal({
  isOpen,
  orderId,
  onClose,
  onConfirm,
}: RejectOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const finalReason = selectedReason.includes('Other') && customReason ? customReason : selectedReason;
    try {
      await onConfirm(finalReason);
      setSubmitting(false);
      onClose();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-xl">
        <div className="flex justify-between items-center border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2 text-rose-700">
            <Ban size={20} />
            <h3 className="font-serif font-bold text-stone-800 text-sm">Decline / Reject Order</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-xs">
            <X size={16} />
          </button>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-start space-x-2.5">
          <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Rejecting Order #{orderId.substring(0, 8).toUpperCase()}</p>
            <p className="text-rose-700 text-[11px] mt-0.5">
              Rejecting an order notifies the customer and triggers an immediate automatic payment refund or reassignment.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-2">Select Primary Reason</label>
            <div className="space-y-2">
              {REJECTION_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'border-rose-500 bg-rose-50/50 text-stone-900 font-medium'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectionReason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-rose-600"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason.includes('Other') && (
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Specify Reason</label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={2}
                placeholder="Provide brief reason for customer notification..."
                className="w-full p-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl text-xs hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2 rounded-xl text-xs shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Ban size={14} />
              <span>{submitting ? 'Processing...' : 'Confirm Order Rejection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
