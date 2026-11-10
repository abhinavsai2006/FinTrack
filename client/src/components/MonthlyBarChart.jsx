import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../utils/formatters';
import { BarChart3 } from 'lucide-react';

export const MonthlyBarChart = ({ monthlyTrends = [], currency = '$' }) => {
  if (!monthlyTrends || monthlyTrends.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center min-h-[340px] text-center">
        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">No Monthly Trends Yet</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
          Monthly income and expense comparisons will appear here as transactions are recorded.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const income = payload.find((p) => p.dataKey === 'income')?.value || 0;
      const expense = payload.find((p) => p.dataKey === 'expense')?.value || 0;
      const net = income - expense;

      return (
        <div className="rounded-xl bg-slate-900/95 dark:bg-slate-800/95 p-3 text-white shadow-xl backdrop-blur-sm border border-slate-700 text-xs min-w-[170px]">
          <p className="font-bold text-sm text-slate-100 border-b border-slate-700 pb-1.5 mb-2">
            {label}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-emerald-400">
              <span>Income:</span>
              <span className="font-bold">{formatCurrency(income, currency)}</span>
            </div>
            <div className="flex justify-between items-center text-rose-400">
              <span>Expenses:</span>
              <span className="font-bold">{formatCurrency(expense, currency)}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-700 font-semibold text-slate-200">
              <span>Net Savings:</span>
              <span className={net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {formatCurrency(net, currency)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Cash Flow Trends
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monthly Income vs Expense Comparison
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyTrends}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0', opacity: 0.3 }}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${currency}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              dataKey="expense"
              name="Expense"
              fill="#ef4444"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

