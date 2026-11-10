# 💰 FinTrack - Personal Finance Tracker & Budget Visualizer

> A responsive, full-stack personal finance application built with **React**, **Node.js/Express**, **MongoDB/Mongoose**, **Tailwind CSS**, and **Recharts**.

[![Tests](https://img.shields.io/badge/tests-28%20passed-brightgreen.svg)]()
[![Stack](https://img.shields.io/badge/stack-MERN-blue.svg)]()
[![License](https://img.shields.io/badge/license-ISC-green.svg)]()

---

## 🎯 Key Features & Use Cases

- **🔐 Secure JWT Authentication**: User registration, login, hashed passwords with `bcryptjs`, and protected API routes via Bearer tokens.
- **⚡ Instant 1-Click Demo Sign-in**: Explore the app without manual registration using the instant demo sign-in button.
- **💵 Real-time Income & Expense CRUD**: Add, edit, and delete transactions with optimistic UI feedback and confirmation safeguards.
- **📊 Interactive Data Visualizations**:
  - **Category-wise Expense Donut Chart**: Breakdown of spending habits with color-coded categories and percentage tooltips.
  - **Cash Flow Monthly Trends (Bar Chart)**: Compare income vs. expenses side-by-side across months.
- **🎯 Dynamic Budget & Target Tracking**:
  - Set a monthly spending goal with real-time progress bars.
  - Color-coded budget alerts: Normal (green), Warning (>80% spent, amber), Over-budget (pulsing red).
- **🔍 Advanced Filtering & Sorting**: Filter transactions by type (*Income/Expense*), category, or time range (*All Time*, *This Month*, *Last 30 Days*), and search across notes/titles.
- **📤 Export to CSV**: One-click download of all transaction history for accounting or spreadsheet analysis.
- **✨ Sample Data Seeder**: Built-in 1-click button to load realistic mock transactions spanning multiple categories and months.
- **🌓 Dark / Light Mode**: Beautiful dark mode with persistent user preference stored in `localStorage`.
- **📱 100% Mobile Responsive**: Fluid UI built with Tailwind CSS, supporting mobile, tablet, and desktop viewports.
- **🛡️ Turnkey Local Experience**: Embedded zero-config MongoDB memory server fallback when external MongoDB URI is not set, meaning anyone can clone and run immediately!

---

## 🏗️ Project Architecture

```
personal-expenses-cal/
├── client/                     # Frontend React (Vite)
│   ├── src/
│   │   ├── components/         # Navbar, StatCards, CategoryPieChart, MonthlyBarChart,
│   │   │                       # TransactionTable, TransactionModal, BudgetModal
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── pages/              # DashboardPage, LoginPage, RegisterPage
│   │   ├── services/           # api.js (REST fetch client)
│   │   ├── test/               # Vitest component & unit tests
│   │   ├── utils/              # formatters.js (currency, dates, categories)
│   │   ├── App.jsx             # Main router & root view
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend Node.js / Express API
│   ├── config/
│   │   └── db.js               # MongoDB connection with In-Memory fallback
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Me, UpdateProfile
│   │   └── transactionController.js # CRUD, Summary analytics, CSV Export, Demo Seeder
│   ├── middleware/
│   │   ├── auth.js             # JWT bearer verification middleware
│   │   └── errorHandler.js     # Standardized JSON error response handler
│   ├── models/
│   │   ├── User.js             # User schema with bcrypt password hashing
│   │   └── Transaction.js      # Transaction schema with indexed user & date
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── transactionRoutes.js
│   ├── tests/
│   │   ├── auth.test.js        # Jest integration tests for auth
│   │   └── transactions.test.js # Jest integration tests for CRUD & analytics
│   ├── server.js               # Express application entrypoint
│   └── package.json
│
├── package.json                # Root orchestration & scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- *(Optional)* MongoDB connection string (if omitted, the app starts with an embedded in-memory MongoDB instance automatically!).

### 1. Installation
Install all root, backend, and frontend dependencies:
```bash
# Install root orchestration tools
npm install

# Install server dependencies
npm --prefix server install

# Install client dependencies
npm --prefix client install
```

### 2. Environment Setup
The server comes with defaults ready for development in `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=personal_finance_tracker_jwt_super_secret_key_2026!
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```
> *Tip:* If `MONGODB_URI` is left blank, the app runs an embedded in-memory MongoDB server for testing or local development. To connect your cloud MongoDB Atlas database, simply paste your URI into `MONGODB_URI`.

### 3. Run Development Servers
Start both the backend server and frontend client concurrently with a single command:
```bash
npm run dev
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🧪 Running Automated Tests

Run the full end-to-end test suite (28 passing tests across backend & frontend):
```bash
npm test
```

Or test layers individually:
```bash
# Run backend Jest integration tests
npm run test:server

# Run frontend Vitest component tests
npm run test:client
```

---

## 📡 REST API Reference

### Authentication Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Login with email & password, receive JWT |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile & budget |
| `PUT` | `/api/auth/profile` | Private | Update user budget target or currency |

### Transaction Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/transactions` | Private | List user transactions (supports filters: `type`, `category`, `search`, `sortBy`) |
| `POST` | `/api/transactions` | Private | Create a new income or expense record |
| `GET` | `/api/transactions/:id` | Private | Retrieve a single transaction by ID |
| `PUT` | `/api/transactions/:id` | Private | Update an existing transaction |
| `DELETE` | `/api/transactions/:id` | Private | Delete a transaction |
| `GET` | `/api/transactions/summary` | Private | Aggregate total balance, category breakdown, and monthly trends |
| `GET` | `/api/transactions/export` | Private | Download transactions as formatted CSV |
| `POST` | `/api/transactions/seed` | Private | Generate realistic sample data for demoing charts |

---

## 🌐 Production Deployment Guide

### Deploying Frontend (Vercel)
1. Push your repository to GitHub.
2. In [Vercel](https://vercel.com), import your repository.
3. Configure the **Root Directory** as `client`.
4. Set build command: `npm run build` and output directory: `dist`.
5. Add environment variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://fintrack-api.onrender.com`).

### Deploying Backend (Render / Railway)
1. In [Render](https://render.com) or [Railway](https://railway.app), create a new **Web Service**.
2. Set root directory to `server` (or run from root with start script `node server/server.js`).
3. Set environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI`: Your MongoDB Atlas cluster connection string.
   - `JWT_SECRET`: A secure random secret key.
   - `CLIENT_URL`: Your deployed Vercel frontend URL.
4. Deploy!

