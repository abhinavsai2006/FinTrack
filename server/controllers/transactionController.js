const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Get all transactions for logged in user (with filtering & pagination)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const query = { user: req.user.id };

    if (type && type !== 'all') {
      query.type = type.toLowerCase();
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { notes: searchRegex }];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: transactions.length,
      totalCount,
      page: pageNum,
      pages: Math.ceil(totalCount / limitNum) || 1,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this transaction',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, notes, paymentMethod } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, amount, type (income/expense), and category.',
      });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number greater than 0.',
      });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      title: title.trim(),
      amount: parsedAmount,
      type: type.toLowerCase(),
      category: category.trim(),
      date: date ? new Date(date) : new Date(),
      notes: notes ? notes.trim() : '',
      paymentMethod: paymentMethod || 'Cash',
    });

    res.status(201).json({
      success: true,
      message: 'Transaction added successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this transaction',
      });
    }

    const { title, amount, type, category, date, notes, paymentMethod } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than zero.',
        });
      }
      updateData.amount = parsedAmount;
    }
    if (type !== undefined) updateData.type = type.toLowerCase();
    if (category !== undefined) updateData.category = category.trim();
    if (date !== undefined) updateData.date = new Date(date);
    if (notes !== undefined) updateData.notes = notes.trim();
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this transaction',
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get summary analytics (Totals, Category breakdown, Monthly trend, Budget progress)
// @route   GET /api/transactions/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryExpenseMap = {};
    const categoryIncomeMap = {};
    const monthlyMap = {};

    // Get current month info for budget comparison
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    let currentMonthExpense = 0;
    let currentMonthIncome = 0;

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      const isCurrentMonth =
        txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;

      // Format month key: 'YYYY-MM'
      const monthYearKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[monthYearKey]) {
        const monthName = txDate.toLocaleString('default', { month: 'short' });
        monthlyMap[monthYearKey] = {
          key: monthYearKey,
          month: `${monthName} ${txDate.getFullYear().toString().slice(-2)}`,
          income: 0,
          expense: 0,
          net: 0,
        };
      }

      if (tx.type === 'income') {
        totalIncome += tx.amount;
        categoryIncomeMap[tx.category] = (categoryIncomeMap[tx.category] || 0) + tx.amount;
        monthlyMap[monthYearKey].income += tx.amount;
        monthlyMap[monthYearKey].net += tx.amount;

        if (isCurrentMonth) {
          currentMonthIncome += tx.amount;
        }
      } else if (tx.type === 'expense') {
        totalExpense += tx.amount;
        categoryExpenseMap[tx.category] = (categoryExpenseMap[tx.category] || 0) + tx.amount;
        monthlyMap[monthYearKey].expense += tx.amount;
        monthlyMap[monthYearKey].net -= tx.amount;

        if (isCurrentMonth) {
          currentMonthExpense += tx.amount;
        }
      }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : '0.0';

    // Format category expenses array for Pie Chart
    const categoryExpenses = Object.keys(categoryExpenseMap).map((cat) => ({
      name: cat,
      value: categoryExpenseMap[cat],
      percentage: totalExpense > 0 ? ((categoryExpenseMap[cat] / totalExpense) * 100).toFixed(1) : 0,
    })).sort((a, b) => b.value - a.value);

    // Format category income array
    const categoryIncomes = Object.keys(categoryIncomeMap).map((cat) => ({
      name: cat,
      value: categoryIncomeMap[cat],
      percentage: totalIncome > 0 ? ((categoryIncomeMap[cat] / totalIncome) * 100).toFixed(1) : 0,
    })).sort((a, b) => b.value - a.value);

    // Sort monthly trend chronologically (last 6 to 12 months)
    const monthlyTrends = Object.values(monthlyMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6); // last 6 months

    // Budget utilization
    const monthlyBudget = user.monthlyBudget || 0;
    const budgetUtilization = monthlyBudget > 0
      ? Math.min(100, ((currentMonthExpense / monthlyBudget) * 100)).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalIncome: Number(totalIncome.toFixed(2)),
        totalExpense: Number(totalExpense.toFixed(2)),
        netBalance: Number(netBalance.toFixed(2)),
        savingsRate: Number(savingsRate),
        transactionCount: transactions.length,
        currentMonth: {
          income: Number(currentMonthIncome.toFixed(2)),
          expense: Number(currentMonthExpense.toFixed(2)),
          budget: monthlyBudget,
          budgetSpentPercentage: Number(budgetUtilization),
          budgetRemaining: Number(Math.max(0, monthlyBudget - currentMonthExpense).toFixed(2)),
          isOverBudget: monthlyBudget > 0 && currentMonthExpense > monthlyBudget,
        },
        categoryExpenses,
        categoryIncomes,
        monthlyTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export transactions as CSV
// @route   GET /api/transactions/export
// @access  Private
const exportTransactionsCSV = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });

    const csvHeaders = 'ID,Date,Title,Type,Category,Amount,Payment Method,Notes\n';
    const csvRows = transactions
      .map((tx) => {
        const dateStr = new Date(tx.date).toISOString().split('T')[0];
        const safeTitle = `"${(tx.title || '').replace(/"/g, '""')}"`;
        const safeCategory = `"${(tx.category || '').replace(/"/g, '""')}"`;
        const safeNotes = `"${(tx.notes || '').replace(/"/g, '""')}"`;
        const safePayment = `"${(tx.paymentMethod || '').replace(/"/g, '""')}"`;
        return `${tx._id},${dateStr},${safeTitle},${tx.type},${safeCategory},${tx.amount},${safePayment},${safeNotes}`;
      })
      .join('\n');

    const csvContent = csvHeaders + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=transactions-${new Date().toISOString().split('T')[0]}.csv`
    );
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc    Seed realistic demo transactions for the user
// @route   POST /api/transactions/seed
// @access  Private
const seedDemoData = async (req, res, next) => {
  try {
    const now = new Date();
    const demoItems = [
      {
        title: 'Monthly Salary',
        amount: 4500,
        type: 'income',
        category: 'Salary',
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        paymentMethod: 'Bank Transfer',
        notes: 'Monthly direct deposit from employer',
      },
      {
        title: 'Apartment Rent',
        amount: 1400,
        type: 'expense',
        category: 'Housing & Rent',
        date: new Date(now.getFullYear(), now.getMonth(), 2),
        paymentMethod: 'Bank Transfer',
        notes: 'Downtown apartment monthly rent',
      },
      {
        title: 'Whole Foods Groceries',
        amount: 185.5,
        type: 'expense',
        category: 'Food & Dining',
        date: new Date(now.getFullYear(), now.getMonth(), 4),
        paymentMethod: 'Credit Card',
        notes: 'Weekly fresh grocery essentials',
      },
      {
        title: 'Freelance UI/UX Design Project',
        amount: 850,
        type: 'income',
        category: 'Freelance',
        date: new Date(now.getFullYear(), now.getMonth(), 6),
        paymentMethod: 'UPI / Digital Wallet',
        notes: 'Landing page design milestone',
      },
      {
        title: 'Electric & Internet Utilities',
        amount: 145.2,
        type: 'expense',
        category: 'Utilities',
        date: new Date(now.getFullYear(), now.getMonth(), 8),
        paymentMethod: 'Debit Card',
        notes: 'Fiber internet and electricity bill',
      },
      {
        title: 'Dinner with Colleagues',
        amount: 68.75,
        type: 'expense',
        category: 'Food & Dining',
        date: new Date(now.getFullYear(), now.getMonth(), 10),
        paymentMethod: 'Credit Card',
        notes: 'Italian restaurant dinner',
      },
      {
        title: 'Metro Transit Monthly Pass',
        amount: 80,
        type: 'expense',
        category: 'Transportation',
        date: new Date(now.getFullYear(), now.getMonth(), 12),
        paymentMethod: 'Credit Card',
        notes: 'Monthly public transport card reload',
      },
      {
        title: 'Gym & Fitness Membership',
        amount: 55,
        type: 'expense',
        category: 'Healthcare',
        date: new Date(now.getFullYear(), now.getMonth(), 15),
        paymentMethod: 'Debit Card',
        notes: 'Monthly fitness center subscription',
      },
      {
        title: 'Netflix & Spotify Subscriptions',
        amount: 28.99,
        type: 'expense',
        category: 'Entertainment',
        date: new Date(now.getFullYear(), now.getMonth(), 18),
        paymentMethod: 'Credit Card',
        notes: 'Streaming services bundle',
      },
      {
        title: 'Dividend Payout',
        amount: 120,
        type: 'income',
        category: 'Investments',
        date: new Date(now.getFullYear(), now.getMonth(), 20),
        paymentMethod: 'Bank Transfer',
        notes: 'Quarterly index fund dividend',
      },
      {
        title: 'Clothing & Wardrobe Shopping',
        amount: 140,
        type: 'expense',
        category: 'Shopping',
        date: new Date(now.getFullYear(), now.getMonth(), 22),
        paymentMethod: 'Credit Card',
        notes: 'New seasonal jackets and shoes',
      },
      // Previous month sample records for historical charts
      {
        title: 'Previous Month Salary',
        amount: 4500,
        type: 'income',
        category: 'Salary',
        date: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        paymentMethod: 'Bank Transfer',
        notes: 'Direct deposit',
      },
      {
        title: 'Previous Month Rent',
        amount: 1400,
        type: 'expense',
        category: 'Housing & Rent',
        date: new Date(now.getFullYear(), now.getMonth() - 1, 2),
        paymentMethod: 'Bank Transfer',
        notes: 'Apartment rent',
      },
      {
        title: 'Previous Month Groceries',
        amount: 420,
        type: 'expense',
        category: 'Food & Dining',
        date: new Date(now.getFullYear(), now.getMonth() - 1, 14),
        paymentMethod: 'Credit Card',
        notes: 'Groceries and snacks',
      },
      {
        title: 'Car Maintenance & Fuel',
        amount: 210,
        type: 'expense',
        category: 'Transportation',
        date: new Date(now.getFullYear(), now.getMonth() - 1, 18),
        paymentMethod: 'Debit Card',
        notes: 'Oil change and highway fuel',
      },
    ];

    const created = await Transaction.insertMany(
      demoItems.map((item) => ({ ...item, user: req.user.id }))
    );

    // Also set a default reasonable monthly budget if user doesn't have one
    const user = await User.findById(req.user.id);
    if (!user.monthlyBudget || user.monthlyBudget === 0) {
      user.monthlyBudget = 2500;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: `Successfully seeded ${created.length} demo transactions!`,
      count: created.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  exportTransactionsCSV,
  seedDemoData,
};

