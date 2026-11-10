const express = require('express');
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  exportTransactionsCSV,
  seedDemoData,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply protect middleware to all transaction routes
router.use(protect);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.get('/summary', getSummary);
router.get('/export', exportTransactionsCSV);
router.post('/seed', seedDemoData);

router.route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;

