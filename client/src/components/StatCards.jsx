import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const StatCards = ({ summary, currency = '$', onSetBudget }) => {
  const netBalance = summary?.netBalance || 0;
  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const savingsRate = summary?.savingsRate || 0;

  const currentMonth = summary?.currentMonth || {};
  const budget = currentMonth?.budget || 0;
  const currentMonthExpense = currentMonth?.expense || 0;
  const budgetSpentPct = budget > 0 ? Math.round((currentMonthExpense / budget) * 100) : 0;
  const isOverBudget = currentMonth?.isOverBudget || false;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* 1. Net Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-lg shadow-emerald-900/10 transition-all hover:shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-100">Total Net Balance</span>
          <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
            <Wallet className="h-5 w-5 text-emerald-100" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {formatCurrency(netBalance, currency)}
          </h3>
          <p className="mt-1 text-xs text-emerald-200">
            {netBalance >= 0 ? 'Surplus / Net positive' : 'Deficit / Needs attention'}
          </p>
        </div>
      </div>

      {/* 2. Total Income Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Income</span>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {formatCurrency(totalIncome, currency)}
          </h3>
          <div className="mt-1 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span>+{summary?.categoryIncomes?.length || 0} active income sources</span>
          </div>
        </div>
      </div>

      {/* 3. Total Expense Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</span>
          <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <ArrowDownRight className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {formatCurrency(totalExpense, currency)}
          </h3>
          <div className="mt-1 flex items-center text-xs text-rose-600 dark:text-rose-400 font-medium">
            <span>Across {summary?.categoryExpenses?.length || 0} spending categories</span>
          </div>
        </div>
      </div>

      {/* 4. Budget & Savings Rate Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {budget > 0 ? 'Month Budget Usage' : 'Savings Rate'}
          </span>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
            isOverBudget
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
          }`}>
            {isOverBudget ? <AlertTriangle className="h-5 w-5" /> : <PiggyBank className="h-5 w-5" />}
          </div>
        </div>
        <div className="mt-4">
          {budget > 0 ? (
            <>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  {budgetSpentPct}%
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatCurrency(currentMonthExpense, currency)} / {formatCurrency(budget, currency)}
                </span>
              </div>
              <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverBudget
                      ? 'bg-rose-500'
                      : budgetSpentPct >= 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, budgetSpentPct)}%` }}
                ></div>
              </div>
              <p className={`mt-1.5 text-xs font-medium ${
                isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {isOverBudget
                  ? `Over budget by ${formatCurrency(currentMonthExpense - budget, currency)}!`
                  : `${formatCurrency(currentMonth?.budgetRemaining || 0, currency)} remaining`}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {savingsRate}%
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Net income saved overall
              </p>
              <button
                onClick={onSetBudget}
                className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                + Set Monthly Target
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

