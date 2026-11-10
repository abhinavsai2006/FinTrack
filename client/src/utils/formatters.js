export const formatCurrency = (amount, currency = '$') => {
  const num = Number(amount) || 0;
  const formatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (num < 0) {
    return `-${currency}${formatted}`;
  }
  return `${currency}${formatted}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const CATEGORY_COLORS = {
  // Expense
  'Food & Dining': '#f97316', // Orange
  'Housing & Rent': '#ef4444', // Red
  'Utilities': '#06b6d4', // Cyan
  'Transportation': '#8b5cf6', // Purple
  'Entertainment': '#ec4899', // Pink
  'Healthcare': '#10b981', // Emerald
  'Shopping': '#3b82f6', // Blue
  'Education': '#6366f1', // Indigo
  'Personal Care': '#d946ef', // Fuchsia
  'Travel': '#14b8a6', // Teal
  'Bills & Fees': '#64748b', // Slate
  'Other Expense': '#94a3b8',

  // Income
  'Salary': '#10b981', // Green
  'Freelance': '#0ea5e9', // Sky blue
  'Investments': '#8b5cf6', // Purple
  'Gift': '#f59e0b', // Amber
  'Business': '#22c55e', // Lime/Green
  'Other Income': '#64748b',
};

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Housing & Rent',
  'Utilities',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Personal Care',
  'Travel',
  'Bills & Fees',
  'Other Expense',
];

export const DEFAULT_INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Gift',
  'Business',
  'Other Income',
];

