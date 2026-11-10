import React, { useState } from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';

const SUPPORTED_CURRENCIES = [
  { symbol: '$', label: 'USD ($)' },
  { symbol: '€', label: 'EUR (€)' },
  { symbol: '£', label: 'GBP (£)' },
  { symbol: '₹', label: 'INR (₹)' },
  { symbol: '¥', label: 'JPY (¥)' },
  { symbol: 'C$', label: 'CAD (C$)' },
  { symbol: 'A$', label: 'AUD (A$)' },
];

export const BudgetModal = ({ isOpen, onClose, user, onSave }) => {
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget || 0);
  const [currency, setCurrency] = useState(user?.currency || '$');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        monthlyBudget: Number(monthlyBudget),
        currency,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Budget & Currency Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize your spending limits & unit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
              Select Currency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SUPPORTED_CURRENCIES.map((curr) => (
                <button
                  type="button"
                  key={curr.symbol}
                  onClick={() => setCurrency(curr.symbol)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                    currency === curr.symbol
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {curr.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
              Monthly Expense Target ({currency})
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Set your target monthly expense limit. FinTrack will warn you when you reach 80% or exceed it.
            </p>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">
                {currency}
              </span>
              <input
                type="number"
                min="0"
                step="10"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                placeholder="2500"
                className="w-full pl-8 pr-3 py-2 text-base font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

