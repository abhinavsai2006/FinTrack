import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CATEGORY_COLORS, formatCurrency } from '../utils/formatters';
import { PieChart as PieIcon } from 'lucide-react';

const FALLBACK_COLORS = [
  '#f97316', '#ef4444', '#06b6d4', '#8b5cf6',
  '#ec4899', '#10b981', '#3b82f6', '#6366f1',
];

export const CategoryPieChart = ({ categoryExpenses = [], currency = '$' }) => {
  if (!categoryExpenses || categoryExpenses.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center min-h-[340px] text-center">
        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <PieIcon className="h-6 w-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">No Expense Data Yet</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
          Add your first expense or load demo data to visualize your category breakdown.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl bg-slate-900/90 dark:bg-slate-800/95 p-3 text-white shadow-xl backdrop-blur-sm border border-slate-700 text-xs">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-emerald-400 font-bold mt-1">
            {formatCurrency(data.value, currency)}
          </p>
          <p className="text-slate-400 mt-0.5">
            {data.percentage}% of total expenses
          </p>
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
            Expenses by Category
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Spending distribution
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {categoryExpenses.length} Categories
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryExpenses}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {categoryExpenses.map((entry, index) => {
                const color =
                  CATEGORY_COLORS[entry.name] ||
                  FALLBACK_COLORS[index % FALLBACK_COLORS.length];
                return <Cell key={`cell-${index}`} fill={color} strokeWidth={0} />;
              })}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top Categories Badges */}
      <div className="mt-4 grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
        {categoryExpenses.map((entry, idx) => {
          const color =
            CATEGORY_COLORS[entry.name] ||
            FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
          return (
            <div
              key={entry.name}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                ></span>
                <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                  {entry.name}
                </span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 ml-2">
                {entry.percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

