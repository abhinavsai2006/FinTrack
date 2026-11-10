import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatCards } from '../components/StatCards';

describe('StatCards Component', () => {
  it('renders Net Balance, Total Income, and Total Expenses with currency correctly', () => {
    const summary = {
      netBalance: 2450.5,
      totalIncome: 5000,
      totalExpense: 2549.5,
      savingsRate: 49.0,
      categoryIncomes: [{ name: 'Salary', value: 5000 }],
      categoryExpenses: [{ name: 'Rent', value: 1500 }],
      currentMonth: {
        budget: 0,
        expense: 2549.5,
      },
    };

    render(<StatCards summary={summary} currency="$" />);

    expect(screen.getByText('Total Net Balance')).toBeInTheDocument();
    expect(screen.getByText('$2,450.50')).toBeInTheDocument();

    expect(screen.getByText('Total Income')).toBeInTheDocument();
    expect(screen.getByText('$5,000.00')).toBeInTheDocument();

    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('$2,549.50')).toBeInTheDocument();

    expect(screen.getByText('Savings Rate')).toBeInTheDocument();
    expect(screen.getByText('49%')).toBeInTheDocument();
  });

  it('renders budget usage bar when monthly target is set', () => {
    const summary = {
      netBalance: 1000,
      totalIncome: 3000,
      totalExpense: 2000,
      savingsRate: 33.3,
      currentMonth: {
        budget: 2500,
        expense: 1500,
        budgetRemaining: 1000,
        isOverBudget: false,
      },
    };

    render(<StatCards summary={summary} currency="$" />);

    expect(screen.getByText('Month Budget Usage')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('$1,000.00 remaining')).toBeInTheDocument();
  });
});

