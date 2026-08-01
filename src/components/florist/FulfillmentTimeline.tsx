import React from 'react';
import {
  Inbox,
  CheckCircle2,
  Sparkles,
  PackageCheck,
  Truck,
  CheckCheck,
  XCircle,
  Ban
} from 'lucide-react';

interface FulfillmentTimelineProps {
  status: string;
  createdDate?: string;
  updatedDate?: string;
  rejectionReason?: string | null;
}

const STAGES = [
  { key: 'received', label: 'Received', icon: Inbox },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { key: 'preparing', label: 'Preparing', icon: Sparkles },
  { key: 'ready_for_pickup', label: 'Ready for Pickup', icon: PackageCheck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCheck },
];

export default function FulfillmentTimeline({
  status,
  createdDate,
  updatedDate,
  rejectionReason,
}: FulfillmentTimelineProps) {
  const isRejected = status === 'rejected';
  const isCancelled = status === 'cancelled';

  if (isRejected || isCancelled) {
    return (
      <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4 text-xs space-y-2">
        <div className="flex items-center space-x-2 text-rose-800 font-serif font-bold text-sm">
          {isRejected ? <Ban size={18} className="text-rose-600" /> : <XCircle size={18} className="text-rose-600" />}
          <span>{isRejected ? 'Order Rejected by Florist' : 'Order Cancelled'}</span>
        </div>
        <p className="text-rose-700">
          {isRejected
            ? rejectionReason
              ? `Reason: ${rejectionReason}`
              : 'This order was declined during confirmation stage.'
            : 'This order was cancelled by the customer or marketplace operator.'}
        </p>
        {updatedDate && (
          <p className="text-[10px] text-rose-500 font-mono">
            Updated: {new Date(updatedDate).toLocaleString()}
          </p>
        )}
      </div>
    );
  }

  // Map legacy / backend status aliases
  const normalizedStatus = status === 'new' ? 'received' : status;

  const currentIdx = STAGES.findIndex((s) => s.key === normalizedStatus);
  const activeIndex = currentIdx === -1 ? 0 : currentIdx;

  return (
    <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-stone-200/80 space-y-3">
      <div className="flex justify-between items-center text-[11px]">
        <span className="font-serif font-bold text-stone-800 uppercase tracking-wider">
          Fulfillment Journey
        </span>
        {createdDate && (
          <span className="text-stone-400 font-mono text-[10px]">
            Placed: {new Date(createdDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Steps bar */}
      <div className="relative flex items-center justify-between pt-2 pb-1 px-1">
        {/* Connecting Background Line */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-stone-200 rounded-full z-0" />

        {/* Progress Line */}
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-[#2D5A27] rounded-full transition-all duration-500 z-0"
          style={{
            width: `${(activeIndex / (STAGES.length - 1)) * 100}%`,
          }}
        />

        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isPassed = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isPassed
                    ? 'bg-[#2D5A27] text-white shadow-xs'
                    : isCurrent
                    ? 'bg-[#2D5A27] text-white ring-4 ring-[#2D5A27]/20 shadow-sm scale-110'
                    : 'bg-white border-2 border-stone-300 text-stone-400'
                }`}
              >
                <Icon size={14} />
              </div>

              <span
                className={`text-[10px] font-medium mt-2 whitespace-nowrap transition-colors ${
                  isCurrent
                    ? 'font-bold text-[#2D5A27]'
                    : isPassed
                    ? 'text-stone-700'
                    : 'text-stone-400'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
