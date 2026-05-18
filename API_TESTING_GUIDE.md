# Lab Assignment 4 — RESTful API + JWT Testing Guide

This project keeps the Lab 3 EJS website and adds the required Lab 4 REST API under:

```txt
/api/v1
```

The API returns JSON and uses JWT for protected endpoints.

---

## 1. Start the Project

```bash
npm install
npm start
```

The server runs at:

```txt
http://localhost:3000
```

---

## 2. Public API Endpoints

### Health Check

```http
GET http://localhost:3000/api/v1/health
```

### Get Products with Pagination / Filtering / Sorting

```http
GET http://localhost:3000/api/v1/products?page=1&limit=8
```

Optional query parameters:

```txt
search=shoe-name
category=Sandals
minPrice=1000
maxPrice=5000
sort=newest | priceLow | priceHigh | rating | stock
```

Example:

```http
GET http://localhost:3000/api/v1/products?page=1&limit=8&category=Sandals&sort=priceLow
```

### Get Single Product by ID

```http
GET http://localhost:3000/api/v1/products/PRODUCT_ID_HERE
```

---

## 3. JWT Login Endpoint

### Login and Get Token

```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json
```

Body:

```json
{
  "email": "admin@unzelondon.com",
  "password": "admin123"
}
```

Successful response includes:

```json
{
  "success": true,
  "token": "JWT_TOKEN_HERE",
  "tokenType": "Bearer",
  "expiresIn": "1h",
  "user": {
    "id": "...",
    "name": "Admin",
    "email": "admin@unzelondon.com",
    "role": "admin"
  }
}
```

The JWT payload contains:

```json
{
  "user_id": "MongoDB user id",
  "role": "customer or admin"
}
```

---

## 4. Protected API Endpoints

For protected routes, add this header:

```http
Authorization: Bearer JWT_TOKEN_HERE
```

### Get Authenticated User Profile

```http
GET http://localhost:3000/api/v1/user/profile
Authorization: Bearer JWT_TOKEN_HERE
```

### Submit an Order

```http
POST http://localhost:3000/api/v1/orders
Content-Type: application/json
Authorization: Bearer JWT_TOKEN_HERE
```

Body:

```json
{
  "items": [
    {
      "productId": "PRODUCT_ID_HERE",
      "quantity": 2
    }
  ],
  "shippingAddress": "Lahore, Pakistan"
}
```

---

## 5. Thunder Client / Postman Steps

1. Send `GET /api/v1/products`.
2. Copy one product `_id` from the response.
3. Send `POST /api/v1/auth/login` with a valid user email and password.
4. Copy the returned JWT token.
5. Open the protected request headers and add:

```txt
Authorization: Bearer copied-token-here
```

6. Test `GET /api/v1/user/profile`.
7. Test `POST /api/v1/orders` using the copied product ID.

---

## 6. Required Environment Variables

Your `.env` must contain:

```env
MONGO_URI=your-mongodb-atlas-uri
PORT=3000
SESSION_SECRET=your-session-secret
ADMIN_EMAIL=admin@unzelondon.com
ADMIN_PASSWORD=admin123
ADMIN_SECRET_CODE=admin-secret-123
JWT_SECRET=replace-with-a-long-random-jwt-secret
JWT_EXPIRES_IN=1h
```

Do not share your real `.env` publicly.
