const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth API Endpoints', () => {
  const sampleUser = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    currency: '$',
    monthlyBudget: 2500,
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return a JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(sampleUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.name).toBe(sampleUser.name);
      expect(res.body.user.email).toBe(sampleUser.email);
      expect(res.body.user.currency).toBe('$');
      expect(res.body.user.monthlyBudget).toBe(2500);
    });

    it('should fail if email is already registered', async () => {
      await request(app).post('/api/auth/register').send(sampleUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(sampleUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should fail if password is less than 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...sampleUser, password: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/at least 6 characters/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(sampleUser);
    });

    it('should log in an existing user with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: sampleUser.email,
        password: sampleUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(sampleUser.email);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: sampleUser.email,
        password: 'wrongpassword',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me & PUT /api/auth/profile', () => {
    let token;

    beforeEach(async () => {
      const reg = await request(app).post('/api/auth/register').send(sampleUser);
      token = reg.body.token;
    });

    it('should reject access without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should get current user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(sampleUser.email);
    });

    it('should update user budget and currency preference', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          monthlyBudget: 3500,
          currency: '€',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.monthlyBudget).toBe(3500);
      expect(res.body.user.currency).toBe('€');
    });
  });
});

