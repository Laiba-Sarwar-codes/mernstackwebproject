# Unze London — E-Commerce + Live Sales Dashboard

## What Was Added

This project extends the existing e-commerce application with a **Live Sales Dashboard** at `/sales`.

### New / Updated Files

| File | Description |
|---|---|
| `routes/salesRoutes.js` | `GET /sales` (page) and `GET /api/sales-data` (JSON API) |
| `controllers/salesController.js` | Mongoose aggregation for revenue, orders, top product, recent transactions |
| `views/sales.ejs` | Dashboard page with EJS server-side render + jQuery 10-second polling |
| `views/layouts/main.ejs` | Shared layout used by the sales dashboard |
| `models/Order.js` | Order model with items, totalAmount, status, user |
| `seedSales.js` | Seeds demo orders so the dashboard has data to display |
| `.env.example` | Environment variable template |
| `.gitignore` | Excludes node_modules, .env, .DS_Store |

---

## Quick Start

### 1. Install dependencies

```
npm install
```

### 2. Create .env

Windows:
```
copy .env.example .env
```

Mac / Linux:
```
cp .env.example .env
```

### 3. Add your MongoDB URI

Open .env and set:

```
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/LAB_FINAL?retryWrites=true&w=majority&appName=unzelondon
```

### 4. Seed demo sales data

```
npm run seed:sales
```

### 5. Start the server

```
npm start
```

---

## URLs to Test

- http://localhost:3000/sales          → Sales Dashboard (auto-refreshes every 10s)
- http://localhost:3000/api/sales-data → Raw JSON API
- http://localhost:3000/products       → Product listing
- http://localhost:3000/login          → Login page
- http://localhost:3000/admin          → Admin panel (admin role required)

---

## Verify Polling in DevTools

1. Open http://localhost:3000/sales
2. Press F12 → Network tab
3. Watch /api/sales-data appear every 10 seconds automatically
4. Dashboard cards update without a page reload

---

## Available Scripts

```
npm start          Start the server
npm run dev        Start with nodemon
npm run seed:sales Seed demo orders (run before visiting /sales)
npm run seed:all   Run all seed scripts
```

---

## Login Credentials (after seeding)

- Admin:    admin@unzelondon.com    / admin123
- Customer: customer@unzelondon.com / customer123

---

## How the Sales Dashboard Works

1. Server renders initial data via EJS on first page load — no blank flash.
2. jQuery polls /api/sales-data every 10 seconds using $.getJSON.
3. Cards update in place: Total Revenue, Total Orders, Top-Selling Product.
4. Recent Transactions table rebuilds rows dynamically from JSON.
5. All stats exclude cancelled orders (only pending and confirmed count).
