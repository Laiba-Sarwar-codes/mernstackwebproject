# API Testing Guide

## Products API

```txt
GET http://localhost:3000/api/v1/products
```

## Sales Dashboard API

```txt
GET http://localhost:3000/api/sales-data
```

Expected shape:

```json
{
  "totalRevenue": 5000,
  "totalOrders": 42,
  "topSellingProduct": {
    "name": "Product Name",
    "quantitySold": 10,
    "revenue": 2500
  },
  "recentTransactions": [],
  "lastUpdated": "2026-05-18T..."
}
```
