const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('Transactions API Endpoints', () => {
  let token;
  let userId;

  beforeEach(async () => {
    await Transaction.deleteMany({});
    await User.deleteMany({});

    const reg = await request(app).post('/api/auth/register').send({
      name: 'Test Analyst',
      email: 'analyst@test.com',
      password: 'password123',
      monthlyBudget: 1500,
      currency: '$',
    });

    token = reg.body.token;
    userId = reg.body.user.id;
  });

  describe('POST /api/transactions', () => {
    it('should create an expense transaction successfully', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Groceries Market',
          amount: 85.5,
          type: 'expense',
          category: 'Food & Dining',
          paymentMethod: 'Credit Card',
          notes: 'Fresh vegetables and fruits',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Groceries Market');
      expect(res.body.data.amount).toBe(85.5);
      expect(res.body.data.type).toBe('expense');
    });

    it('should create an income transaction successfully', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Consulting Gig',
          amount: 1200,
          type: 'income',
          category: 'Freelance',
          paymentMethod: 'Bank Transfer',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(1200);
      expect(res.body.data.type).toBe('income');
    });

    it('should reject invalid amount', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Bad Amount',
          amount: -50,
          type: 'expense',
          category: 'Shopping',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/transactions and filters', () => {
    beforeEach(async () => {
      await Transaction.create([
        {
          user: userId,
          title: 'Salary Check',
          amount: 3000,
          type: 'income',
          category: 'Salary',
          date: new Date('2026-01-01'),
        },
        {
          user: userId,
          title: 'Rent',
          amount: 1000,
          type: 'expense',
          category: 'Housing & Rent',
          date: new Date('2026-01-02'),
        },
        {
          user: userId,
          title: 'Coffee shop',
          amount: 15,
          type: 'expense',
          category: 'Food & Dining',
          date: new Date('2026-01-05'),
        },
      ]);
    });

    it('should list all transactions for the user', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(3);
    });

    it('should filter transactions by type=expense', async () => {
      const res = await request(app)
        .get('/api/transactions?type=expense')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.data.every((t) => t.type === 'expense')).toBe(true);
    });

    it('should filter transactions by category', async () => {
      const res = await request(app)
        .get('/api/transactions?category=Salary')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].title).toBe('Salary Check');
    });
  });

  describe('GET /api/transactions/summary', () => {
    it('should compute totals, net balance, and category breakdown correctly', async () => {
      await Transaction.create([
        {
          user: userId,
          title: 'Salary',
          amount: 4000,
          type: 'income',
          category: 'Salary',
        },
        {
          user: userId,
          title: 'Groceries',
          amount: 300,
          type: 'expense',
          category: 'Food & Dining',
        },
        {
          user: userId,
          title: 'Dining out',
          amount: 100,
          type: 'expense',
          category: 'Food & Dining',
        },
      ]);

      const res = await request(app)
        .get('/api/transactions/summary')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.summary.totalIncome).toBe(4000);
      expect(res.body.summary.totalExpense).toBe(400);
      expect(res.body.summary.netBalance).toBe(3600);
      expect(res.body.summary.savingsRate).toBe(90);

      // Category breakdown
      const foodCategory = res.body.summary.categoryExpenses.find(
        (c) => c.name === 'Food & Dining'
      );
      expect(foodCategory).toBeDefined();
      expect(foodCategory.value).toBe(400);
    });
  });

  describe('PUT /api/transactions/:id & DELETE /api/transactions/:id', () => {
    it('should update an existing transaction', async () => {
      const tx = await Transaction.create({
        user: userId,
        title: 'Original Title',
        amount: 50,
        type: 'expense',
        category: 'Shopping',
      });

      const res = await request(app)
        .put(`/api/transactions/${tx._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Title',
          amount: 75,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.amount).toBe(75);
    });

    it('should delete a transaction', async () => {
      const tx = await Transaction.create({
        user: userId,
        title: 'To Delete',
        amount: 20,
        type: 'expense',
        category: 'Other Expense',
      });

      const res = await request(app)
        .delete(`/api/transactions/${tx._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const findTx = await Transaction.findById(tx._id);
      expect(findTx).toBeNull();
    });
  });

  describe('GET /api/transactions/export (CSV) and POST /api/transactions/seed', () => {
    it('should seed demo data', async () => {
      const res = await request(app)
        .post('/api/transactions/seed')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.count).toBeGreaterThan(5);

      const count = await Transaction.countDocuments({ user: userId });
      expect(count).toBeGreaterThan(5);
    });

    it('should export transactions as CSV', async () => {
      await request(app)
        .post('/api/transactions/seed')
        .set('Authorization', `Bearer ${token}`);

      const res = await request(app)
        .get('/api/transactions/export')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/);
      expect(res.text).toContain('ID,Date,Title,Type,Category,Amount');
      expect(res.text).toContain('Salary');
    });
  });
});

