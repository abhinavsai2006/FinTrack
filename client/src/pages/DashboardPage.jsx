import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import { StatCards } from '../components/StatCards';
import { CategoryPieChart } from '../components/CategoryPieChart';
import { MonthlyBarChart } from '../components/MonthlyBarChart';
import { TransactionTable } from '../components/TransactionTable';
import { TransactionModal } from '../components/TransactionModal';
import { BudgetModal } from '../components/BudgetModal';
import toast from 'react-hot-toast';

export const DashboardPage = () => {
  const { user, updateProfile } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  const currency = user?.currency || '$';

  // Load dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, txRes] = await Promise.all([
        api.transactions.getSummary(),
        api.transactions.getAll({ limit: 100 }),
      ]);

      if (sumRes.success) {
        setSummary(sumRes.summary);
      }
      if (txRes.success) {
        setTransactions(txRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Failed to refresh data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add / Edit Transaction
  const handleSaveTransaction = async (formData) => {
    try {
      if (selectedTx) {
        await api.transactions.update(selectedTx._id, formData);
        toast.success('Transaction updated successfully!');
      } else {
        await api.transactions.create(formData);
        toast.success('New transaction recorded!');
      }
      setSelectedTx(null);
      await fetchData();
    } catch (err) {
      toast.error(err.message || 'Error saving transaction.');
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id) => {
    try {
      await api.transactions.delete(id);
      toast.success('Transaction removed.');
      await fetchData();
    } catch (err) {
      toast.error(err.message || 'Error deleting transaction.');
    }
  };

  // Seed Demo Data
  const handleSeedDemo = async () => {
    try {
      const res = await api.transactions.seedDemo();
      toast.success(res.message || 'Sample data loaded!');
      await fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to seed sample data.');
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      await api.transactions.exportCSV();
      toast.success('Transactions exported to CSV!');
    } catch (err) {
      toast.error('Failed to export CSV.');
    }
  };

  // Save budget / currency settings
  const handleSaveBudget = async (updateData) => {
    await updateProfile(updateData);
    await fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      <Navbar
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        summary={summary}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Financial Overview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track your earnings, expenses, and cashflow health in real-time.
            </p>
          </div>
        </div>

        {/* 1. Stat Cards */}
        <StatCards
          summary={summary}
          currency={currency}
          onSetBudget={() => setIsBudgetModalOpen(true)}
        />

        {/* 2. Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryPieChart
            categoryExpenses={summary?.categoryExpenses || []}
            currency={currency}
          />
          <MonthlyBarChart
            monthlyTrends={summary?.monthlyTrends || []}
            currency={currency}
          />
        </div>

        {/* 3. Transactions Table */}
        <TransactionTable
          transactions={transactions}
          loading={loading}
          currency={currency}
          onAddTransaction={() => {
            setSelectedTx(null);
            setIsTxModalOpen(true);
          }}
          onEditTransaction={(tx) => {
            setSelectedTx(tx);
            setIsTxModalOpen(true);
          }}
          onDeleteTransaction={handleDeleteTransaction}
          onSeedDemo={handleSeedDemo}
          onExportCSV={handleExportCSV}
        />
      </main>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setSelectedTx(null);
        }}
        onSubmit={handleSaveTransaction}
        initialData={selectedTx}
        currency={currency}
      />

      {/* Budget & Currency Settings Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        user={user}
        onSave={handleSaveBudget}
      />
    </div>
  );
};

