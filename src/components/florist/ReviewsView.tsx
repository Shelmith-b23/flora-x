import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, RefreshCw, MessageCircle } from 'lucide-react';

export default function ReviewsView() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/v1/florist/reviews')
      .then((r) => {
        setReviews(r.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load reviews:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-xs">
        <RefreshCw className="animate-spin text-[#2D5A27] mx-auto mb-3" size={28} />
        <p className="text-sm font-medium text-stone-600">Loading Customer Reviews...</p>
      </div>
    );
  }

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-stone-800">Customer Feedback & Ratings</h2>
          <p className="text-xs text-stone-500">Public ratings and verified buyer feedback on your arrangements.</p>
        </div>

        <div className="flex items-center space-x-3 bg-[#FAF9F6] p-3 rounded-xl border border-stone-200/60">
          <div className="text-center px-2">
            <span className="text-2xl font-serif font-bold text-stone-800">{averageRating}</span>
            <span className="text-[10px] text-stone-400 block font-sans">/ 5.0 Rating</span>
          </div>
          <div className="flex text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} fill="currentColor" />
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="p-4 rounded-xl border border-stone-100 space-y-2 bg-[#FAF9F6]">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-serif font-bold text-sm text-stone-800">{r.customerName}</span>
                <span className="text-xs text-stone-500 block">Product: {r.productTitle || 'Custom Bouquet'}</span>
              </div>
              <div className="flex text-amber-400">
                {Array.from({ length: r.rating || 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
            </div>
            <p className="text-xs text-stone-700 italic leading-relaxed">"{r.reviewText || 'No comment provided.'}"</p>
            <span className="text-[10px] text-stone-400 block pt-1">Submitted: {r.createdAt}</span>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-12 text-stone-400 space-y-2">
            <Star size={36} className="mx-auto text-stone-300" />
            <p className="text-xs">No customer reviews submitted for your shop yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
