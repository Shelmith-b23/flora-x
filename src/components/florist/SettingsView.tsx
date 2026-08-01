import React, { useState } from 'react';
import { Settings, Shield, Bell, Moon, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

interface SettingsViewProps {
  setActiveTab: (tab: string) => void;
}

export default function SettingsView({ setActiveTab }: SettingsViewProps) {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [awayMode, setAwayMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-lg font-serif font-bold text-stone-800">Account & Security Preferences</h2>
          <p className="text-xs text-stone-500">Configure notification alerts, away mode, and account security.</p>
        </div>
      </div>

      {/* Shortcut to Shop Management */}
      <div className="bg-[#FAF9F6] border border-[#2D5A27]/20 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-stone-800 text-sm">Looking for Shop Profile & Delivery Settings?</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Store location, M-Pesa till number, logo, and delivery cut-off times are managed in the primary Shop Management section.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('shop')}
          className="px-4 py-2 bg-[#2D5A27] hover:bg-[#23471f] text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 shrink-0"
        >
          <span>Open Shop Management</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Store Away Mode */}
          <div className="space-y-3 border-b border-stone-100 pb-5">
            <h3 className="text-sm font-serif font-bold text-stone-800">Vacation / Away Mode</h3>
            <label className="flex items-center space-x-3 p-4 rounded-xl border border-stone-200 bg-[#FAF9F6] cursor-pointer">
              <input
                type="checkbox"
                checked={awayMode}
                onChange={(e) => setAwayMode(e.target.checked)}
                className="w-4 h-4 text-[#2D5A27] rounded focus:ring-[#2D5A27]"
              />
              <div>
                <span className="text-xs font-bold text-stone-800 block">Pause Marketplace Orders (Away Mode)</span>
                <span className="text-[11px] text-stone-500">
                  Temporarily hide your shop from buyer searches while you are on holiday or restocking.
                </span>
              </div>
            </label>
          </div>

          {/* Section 2: Notification Preferences */}
          <div className="space-y-3 border-b border-stone-100 pb-5">
            <h3 className="text-sm font-serif font-bold text-stone-800">Order Dispatch Alerts</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 text-xs text-stone-700">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 text-[#2D5A27] rounded"
                />
                <span>Email Notifications for New Orders & Customer Messages</span>
              </label>

              <label className="flex items-center space-x-3 text-xs text-stone-700">
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 text-[#2D5A27] rounded"
                />
                <span>Instant SMS Alerts for High-Priority Dispatch Orders</span>
              </label>
            </div>
          </div>

          {saveMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-1.5">
              <CheckCircle2 size={16} />
              <span>Account preferences saved!</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-[#2D5A27] hover:bg-[#23471f] text-white font-semibold py-2.5 px-6 rounded-xl text-xs shadow-xs"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
