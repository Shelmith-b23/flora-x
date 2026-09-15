import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Star,
  RefreshCw,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertCircle,
  CornerDownRight,
  Send,
  Lock,
  Sparkles,
  Heart,
  X,
  Filter
} from 'lucide-react';

interface Review {
  id: string;
  floristId?: string;
  productId?: string;
  productTitle?: string;
  customerName?: string;
  customerEmail?: string;
  rating: number;
  reviewText: string;
  moderationStatus?: string;
  hasReply?: boolean;
  replyText?: string;
  replyDate?: string;
  repliedBy?: string;
  created_at?: string;
}

interface ReviewsViewProps {
  verificationStatus?: string;
}

export default function ReviewsView({ verificationStatus = 'approved' }: ReviewsViewProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterReplyStatus, setFilterReplyStatus] = useState<string>('all'); // 'all' | 'unanswered' | 'responded'

  // Response Composer State
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccessId, setReplySuccessId] = useState<string | null>(null);

  const isRestricted = verificationStatus === 'suspended' || verificationStatus === 'rejected';

  const loadReviews = (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    axios
      .get('/api/v1/florist/reviews')
      .then((r) => {
        setReviews(r.data || []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((err) => {
        console.error('Failed to load reviews:', err);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleOpenReply = (review: Review) => {
    if (isRestricted) return;
    setActiveReplyId(review.id);
    setReplyText(review.replyText || '');
    setReplyError(null);
    setReplySuccessId(null);
  };

  const handleCancelReply = () => {
    setActiveReplyId(null);
    setReplyText('');
    setReplyError(null);
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim() || isRestricted || submittingReply) return;

    setSubmittingReply(true);
    setReplyError(null);

    try {
      const resp = await axios.post(`/api/v1/florist/reviews/${reviewId}/reply`, {
        replyText: replyText.trim()
      });

      const updatedReview = resp.data?.review;
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, ...updatedReview } : r))
      );

      setReplySuccessId(reviewId);
      setActiveReplyId(null);
      setReplyText('');
      setSubmittingReply(false);

      setTimeout(() => {
        setReplySuccessId(null);
      }, 4000);
    } catch (err: any) {
      console.error('Failed to submit review response:', err);
      setReplyError(err.response?.data?.error || 'Failed to submit response. Please try again.');
      setSubmittingReply(false);
    }
  };

  // Metrics Calculations (Authoritative from review objects)
  const totalReviews = reviews.length;
  const avgRatingNumber =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews
      : 5.0;
  const averageRating = avgRatingNumber.toFixed(1);

  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let unansweredCount = 0;
  let respondedCount = 0;

  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
    starCounts[star] = (starCounts[star] || 0) + 1;
    if (r.hasReply) respondedCount += 1;
    else unansweredCount += 1;
  });

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    // Search query
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      r.customerName?.toLowerCase().includes(q) ||
      r.productTitle?.toLowerCase().includes(q) ||
      r.reviewText?.toLowerCase().includes(q) ||
      r.replyText?.toLowerCase().includes(q);

    // Rating filter
    const matchRating =
      filterRating === 'all' || Math.round(r.rating || 5) === parseInt(filterRating, 10);

    // Reply status filter
    const matchReply =
      filterReplyStatus === 'all' ||
      (filterReplyStatus === 'unanswered' && !r.hasReply) ||
      (filterReplyStatus === 'responded' && r.hasReply);

    return matchSearch && matchRating && matchReply;
  });

  const formatDate = (iso?: string) => {
    if (!iso) return 'Recent';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-KE', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-16 text-center shadow-xs">
        <RefreshCw className="animate-spin text-[#2D5A27] mx-auto mb-3" size={28} />
        <p className="text-sm font-medium text-stone-700">Loading Atelier Reviews & Client Sentiment...</p>
        <p className="text-xs text-stone-400 mt-1">Retrieving authentic verified customer feedback</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* RESTRICTION BANNER */}
      {isRestricted && (
        <div className="p-4 rounded-2xl bg-rose-950/90 text-rose-100 border border-rose-800 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center space-x-2.5">
            <Lock size={16} className="text-rose-400 shrink-0" />
            <span>
              Your florist account is currently {verificationStatus}. Public review responses are in read-only mode.
            </span>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-stone-900">Customer Feedback & Sentiment</h2>
          <p className="text-xs text-stone-500">
            Verified ratings, client testimonials, and official atelier responses.
          </p>
        </div>

        <button
          onClick={() => loadReviews(true)}
          disabled={refreshing}
          className="px-3 py-1.5 rounded-xl border border-stone-200 hover:border-[#2D5A27] text-stone-600 hover:text-[#2D5A27] text-xs font-medium transition-colors flex items-center space-x-1.5 self-end sm:self-auto bg-stone-50/50"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#2D5A27]' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Reviews'}</span>
        </button>
      </div>

      {/* RATING DASHBOARD & KPI METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Card */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-1">
              Atelier Reputation Score
            </span>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-4xl font-serif font-bold text-stone-900">{averageRating}</span>
              <span className="text-sm font-sans text-stone-400 font-medium">/ 5.0</span>
            </div>

            <div className="flex items-center space-x-1 text-amber-400 my-3" aria-label={`Rating: ${averageRating} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  fill={star <= Math.round(avgRatingNumber) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={star <= Math.round(avgRatingNumber) ? 0 : 1.5}
                />
              ))}
            </div>
            <p className="text-xs text-stone-500">
              Based on <strong className="text-stone-800 font-semibold">{totalReviews}</strong> verified customer reviews.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100 mt-4">
            <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-stone-100 text-center">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Awaiting Reply</span>
              <span className={`text-base font-serif font-bold ${unansweredCount > 0 ? 'text-amber-600' : 'text-stone-700'}`}>
                {unansweredCount}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-stone-100 text-center">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Responded</span>
              <span className="text-base font-serif font-bold text-[#2D5A27]">{respondedCount}</span>
            </div>
          </div>
        </div>

        {/* Rating Breakdown Distribution */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs lg:col-span-2 space-y-2.5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif font-bold text-stone-800 text-sm">Rating Distribution</h3>
            <span className="text-[11px] text-stone-400">Verified buyer ratings breakdown</span>
          </div>

          {[5, 4, 3, 2, 1].map((starLevel) => {
            const count = starCounts[starLevel] || 0;
            const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={starLevel} className="flex items-center space-x-3 text-xs">
                <button
                  onClick={() => setFilterRating(filterRating === starLevel.toString() ? 'all' : starLevel.toString())}
                  className={`flex items-center space-x-1 w-12 shrink-0 font-medium hover:text-[#2D5A27] transition-colors ${
                    filterRating === starLevel.toString() ? 'text-[#2D5A27] font-bold' : 'text-stone-600'
                  }`}
                >
                  <span>{starLevel}</span>
                  <Star size={12} fill="currentColor" className="text-amber-400" />
                </button>

                <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      starLevel >= 4 ? 'bg-[#2D5A27]' : starLevel === 3 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />
                </div>

                <div className="w-16 text-right font-mono text-[11px] text-stone-500 shrink-0">
                  <span>{count}</span>
                  <span className="text-stone-400 text-[10px] ml-1">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search reviews, client name, arrangement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs bg-[#FAF9F6] focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Rating filter pills */}
          <div className="flex items-center space-x-1 border border-stone-200 rounded-xl p-1 bg-[#FAF9F6] text-xs">
            <span className="text-[10px] text-stone-400 px-2 font-medium">Rating:</span>
            {['all', '5', '4', '3', '2', '1'].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRating(r)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  filterRating === r
                    ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-200/60'
                }`}
              >
                {r === 'all' ? 'All' : `${r}★`}
              </button>
            ))}
          </div>

          {/* Response status pills */}
          <div className="flex items-center space-x-1 border border-stone-200 rounded-xl p-1 bg-[#FAF9F6] text-xs">
            <button
              onClick={() => setFilterReplyStatus('all')}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                filterReplyStatus === 'all'
                  ? 'bg-[#2D5A27] text-white font-semibold shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterReplyStatus('unanswered')}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer flex items-center space-x-1 ${
                filterReplyStatus === 'unanswered'
                  ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              <span>Awaiting</span>
              {unansweredCount > 0 && (
                <span className="px-1 py-0.2 bg-amber-100 text-amber-900 rounded-full text-[9px] font-bold">
                  {unansweredCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterReplyStatus('responded')}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                filterReplyStatus === 'responded'
                  ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              Responded
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {replySuccessId && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Your atelier response has been published and sent to the client!</span>
        </div>
      )}

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        {filteredReviews.map((r) => {
          const isReplying = activeReplyId === r.id;
          return (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs transition-all space-y-4 hover:border-stone-300"
            >
              {/* Review Card Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] font-serif font-bold text-sm flex items-center justify-center">
                    {(r.customerName || 'Customer')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-serif font-bold text-sm text-stone-900">
                        {r.customerName || 'Verified Buyer'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                        Verified Order
                      </span>
                    </div>
                    <span className="text-xs text-stone-500">
                      Product: <strong className="text-stone-700 font-medium">{r.productTitle || 'Custom Bouquet'}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end">
                  <div className="flex items-center space-x-1 text-amber-400" aria-label={`Rating: ${r.rating} stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < (r.rating || 5) ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth={i < (r.rating || 5) ? 0 : 1.5}
                      />
                    ))}
                    <span className="text-xs font-mono font-bold text-stone-700 ml-1">
                      {r.rating?.toFixed(1) || '5.0'}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 mt-0.5">{formatDate(r.created_at)}</span>
                </div>
              </div>

              {/* Review Text */}
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-stone-100">
                <p className="text-xs text-stone-800 leading-relaxed font-sans italic">
                  "{r.reviewText || 'No commentary provided.'}"
                </p>
              </div>

              {/* EXISTING FLORIST REPLY (IF PRESENT) */}
              {r.hasReply && !isReplying && (
                <div className="ml-4 sm:ml-6 pl-4 border-l-2 border-[#2D5A27] space-y-1 bg-emerald-50/40 p-3.5 rounded-r-xl">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1.5 text-[#2D5A27] font-semibold">
                      <CornerDownRight size={13} />
                      <span>{r.repliedBy || 'Florist Atelier'} (You)</span>
                    </div>
                    <span className="text-[10px] text-stone-400">{formatDate(r.replyDate)}</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">{r.replyText}</p>
                  {!isRestricted && (
                    <button
                      onClick={() => handleOpenReply(r)}
                      className="text-[11px] text-[#2D5A27] hover:underline font-medium pt-1 block cursor-pointer"
                    >
                      Edit Response
                    </button>
                  )}
                </div>
              )}

              {/* ACTION: RESPOND BUTTON (IF UNANSWERED AND NOT REPLYING) */}
              {!r.hasReply && !isReplying && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleOpenReply(r)}
                    disabled={isRestricted}
                    className="px-4 py-2 rounded-xl border border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27] hover:text-white transition-colors text-xs font-medium shadow-2xs flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <MessageSquare size={13} />
                    <span>Respond to Review</span>
                  </button>
                </div>
              )}

              {/* INLINE RESPONSE COMPOSER */}
              {isReplying && (
                <div className="bg-white rounded-xl border-2 border-[#2D5A27]/40 p-4 shadow-sm space-y-3 mt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <div className="flex items-center space-x-2 text-xs font-serif font-bold text-stone-800">
                      <MessageSquare size={14} className="text-[#2D5A27]" />
                      <span>Respond to {r.customerName || 'Client'}</span>
                    </div>
                    <button
                      onClick={handleCancelReply}
                      className="text-stone-400 hover:text-stone-600 p-1"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-500 italic">
                    Editorial guideline: Thank the customer, acknowledge their feedback, and keep the response warm, gracious, and professional.
                  </p>

                  <textarea
                    rows={3}
                    placeholder="Dear customer, thank you for choosing our atelier..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={submittingReply}
                    className="w-full p-3 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] bg-[#FAF9F6] resize-none"
                  />

                  {replyError && (
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center space-x-1.5">
                      <AlertCircle size={13} className="shrink-0 text-rose-600" />
                      <span>{replyError}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-stone-400">
                      {replyText.length} characters
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleCancelReply}
                        disabled={submittingReply}
                        className="px-3 py-1.5 border border-stone-200 rounded-xl text-xs text-stone-600 hover:bg-stone-50 cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSubmitReply(r.id)}
                        disabled={submittingReply || !replyText.trim()}
                        className="bg-[#2D5A27] hover:bg-[#23471f] text-white px-4 py-1.5 rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {submittingReply ? (
                          <RefreshCw size={13} className="animate-spin" />
                        ) : (
                          <Send size={13} />
                        )}
                        <span>{r.hasReply ? 'Update Response' : 'Publish Response'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* EMPTY STATES */}
        {reviews.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-200/80 p-16 text-center shadow-xs space-y-3">
            <Star size={40} className="mx-auto text-stone-300 stroke-[1.2]" />
            <h3 className="font-serif font-bold text-stone-800 text-base">Your Sales Story & Reviews Await</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Your customer feedback will appear here as orders are completed and delivered across Kenya.
            </p>
          </div>
        )}

        {reviews.length > 0 && filteredReviews.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-xs space-y-2">
            <Filter size={32} className="mx-auto text-stone-300" />
            <h4 className="font-serif font-bold text-stone-800 text-sm">No Matching Reviews</h4>
            <p className="text-xs text-stone-500">
              {filterReplyStatus === 'unanswered'
                ? "You're all caught up. Every review has been acknowledged!"
                : 'No reviews found matching the current search or rating filter.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterRating('all');
                setFilterReplyStatus('all');
              }}
              className="mt-2 text-xs font-semibold text-[#2D5A27] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
