import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, RefreshCw, Send, Lock, ArrowDownRight, ArrowUpRight, DollarSign, ShieldCheck } from 'lucide-react';
import { FloristWalletData } from '../../types';

interface WalletViewProps {
  verificationStatus?: string;
  mpesaTillNumber?: string;
}

export default function WalletView({ verificationStatus = 'approved', mpesaTillNumber }: WalletViewProps) {
  const [wallet, setWallet] = useState<FloristWalletData | null>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestAmount, setRequestAmount] = useState('3000');
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isRestricted = verificationStatus === 'suspended' || verificationStatus === 'rejected';

  const loadWallet = () => {
    setLoading(true);
    Promise.all([
      axios.get('/api/v1/florist/wallet'),
      axios.get('/api/v1/florist/withdrawals')
    ])
      .then(([wResp, pResp]) => {
        setWallet(wResp.data);
        setPayouts(pResp.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load wallet data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRestricted) {
      setErrorMessage(`Payouts are restricted while account status is "${verificationStatus}".`);
      return;
    }

    const amt = parseFloat(requestAmount);
    if (!amt || amt <= 0) {
      setErrorMessage('Please specify a valid payout amount.');
      return;
    }

    if (wallet && amt > wallet.availableBalance) {
      setErrorMessage(`Requested KES ${amt.toLocaleString()} exceeds available balance of KES ${wallet.availableBalance.toLocaleString()}.`);
      return;
    }

    setErrorMessage('');
    try {
      await axios.post('/api/v1/florist/withdrawals', {
        amount: amt,
        payoutChannel: 'mpesa'
      });
      setRequestAmount('');
      setPayoutSuccess(true);
      loadWallet();
      setTimeout(() => setPayoutSuccess(false), 5000);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Payout request failed.';
      setErrorMessage(msg);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-xs">
        <RefreshCw className="animate-spin text-[#2D5A27] mx-auto mb-3" size={28} />
        <p className="text-sm font-medium text-stone-600">Loading Authoritative Ledger & Wallet Balances...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Wallet Balance Summary & Payout Form */}
      <div className="space-y-6">
        {/* Authoritative Financial Breakdown Card */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-5">
          <div className="border-b border-stone-100 pb-3 flex justify-between items-center">
            <h3 className="font-serif font-bold text-stone-800 text-base">Ledger Balances</h3>
            <span className="text-[10px] font-mono font-bold text-[#2D5A27] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              AUDITED LEDGER
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
              Available For Payout
            </span>
            <span className="text-3xl font-serif font-bold text-stone-900 block">
              KES {wallet?.availableBalance?.toLocaleString() || '0'}
            </span>
            <p className="text-[11px] text-stone-500">
              Earnings from fulfilled orders credited after platform commission.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-xs">
            <div>
              <span className="text-stone-400 block uppercase font-semibold text-[10px] tracking-wider">
                Gross Sales
              </span>
              <span className="font-bold text-stone-800 font-mono">
                KES {wallet?.grossSales?.toLocaleString() || '0'}
              </span>
            </div>

            <div>
              <span className="text-stone-400 block uppercase font-semibold text-[10px] tracking-wider">
                Platform Commission
              </span>
              <span className="font-bold text-stone-800 font-mono">
                KES {wallet?.commissionDeducted?.toLocaleString() || '0'}
              </span>
            </div>

            <div>
              <span className="text-stone-400 block uppercase font-semibold text-[10px] tracking-wider">
                Held in Escrow
              </span>
              <span className="font-bold text-amber-700 font-mono">
                KES {wallet?.pendingBalance?.toLocaleString() || '0'}
              </span>
            </div>

            <div>
              <span className="text-stone-400 block uppercase font-semibold text-[10px] tracking-wider">
                Total Paid Payouts
              </span>
              <span className="font-bold text-[#2D5A27] font-mono">
                KES {wallet?.withdrawnToDate?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        </div>

        {/* Request Instant Payout Form */}
        <form onSubmit={handleWithdrawal} className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-stone-800 text-base">Request Instant M-Pesa Payout</h3>

          {isRestricted ? (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <Lock size={16} className="text-rose-600 shrink-0" />
              <span>Payout requests are disabled in status: {verificationStatus}</span>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Payout Amount (KES) *
                </label>
                <input
                  type="number"
                  required
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Payout Destination
                </label>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 flex items-center justify-between">
                  <span>Safaricom Lipa Na M-Pesa Buy Goods Till</span>
                  <span className="font-mono text-[#2D5A27] font-bold">{mpesaTillNumber || 'Till Configured'}</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {errorMessage}
                </div>
              )}

              {payoutSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  Payout request submitted! Funds dispatched via M-Pesa ledger.
                </div>
              )}

              <button
                type="submit"
                disabled={isRestricted || !wallet || wallet.availableBalance <= 0}
                className="w-full bg-[#2D5A27] hover:bg-[#23471f] disabled:bg-stone-300 text-white font-semibold py-2.5 rounded-xl text-xs shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Send size={14} />
                <span>Submit M-Pesa Payout Request</span>
              </button>
            </>
          )}
        </form>
      </div>

      {/* Ledger History Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs lg:col-span-2 space-y-4 flex flex-col h-[calc(100vh-180px)] overflow-hidden">
        <div className="border-b border-stone-100 pb-3 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-serif font-bold text-stone-800 text-base">Reconciled Financial Ledger</h3>
            <p className="text-xs text-stone-500">Live transaction credits, commission splits, and payouts.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-stone-50/60 sticky top-0 bg-white z-10">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Entry Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {wallet?.history?.map((entry: any, idx: number) => (
                <tr key={idx} className="hover:bg-stone-50">
                  <td className="py-3 px-3 text-stone-500 font-mono text-[11px]">{entry.date?.split(' ')[0]}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        entry.entryType?.startsWith('credit')
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {entry.entryType?.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-stone-800">{entry.description}</td>
                  <td
                    className={`py-3 px-3 text-right font-bold font-mono ${
                      entry.amount > 0 ? 'text-[#2D5A27]' : 'text-rose-700'
                    }`}
                  >
                    KES {entry.amount?.toLocaleString()}
                  </td>
                </tr>
              ))}

              {(!wallet?.history || wallet.history.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-stone-400 text-xs">
                    No ledger transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
