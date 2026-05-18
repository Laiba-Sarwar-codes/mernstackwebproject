# Lab Assignment 4 Requirements Checklist

## 1. API Route Structure

| Requirement | Status | File |
|---|---:|---|
| `GET /api/v1/products` returns JSON list of products | Done | `routes/apiRoutes.js` |
| Product API includes pagination/filtering/sorting | Done | `routes/apiRoutes.js` |
| `GET /api/v1/products/:id` returns one product as JSON | Done | `routes/apiRoutes.js` |
| `POST /api/v1/orders` requires JWT | Done | `routes/apiRoutes.js`, `middleware/jwtAuth.js` |
| `GET /api/v1/user/profile` requires JWT | Done | `routes/apiRoutes.js`, `middleware/jwtAuth.js` |

## 2. JWT Implementation

| Requirement | Status | File |
|---|---:|---|
| `POST /api/v1/auth/login` endpoint | Done | `routes/apiRoutes.js` |
| Email/password verified using existing bcrypt user logic | Done | `models/User.js`, `routes/apiRoutes.js` |
| JWT generated after successful login | Done | `routes/apiRoutes.js` |
| JWT payload includes `user_id` and `role` | Done | `routes/apiRoutes.js` |
| `JWT_SECRET` stored in `.env` | Done | `.env`, `.env.example` |
| Token expiry set to `1h` | Done | `.env`, `routes/apiRoutes.js` |

## 3. Authentication Middleware

| Requirement | Status | File |
|---|---:|---|
| Extracts token from `Authorization: Bearer <token>` | Done | `middleware/jwtAuth.js` |
| Verifies token with `JWT_SECRET` | Done | `middleware/jwtAuth.js` |
| Appends decoded user data to `req.user` | Done | `middleware/jwtAuth.js` |
| Missing token returns `401 Unauthorized` | Done | `middleware/jwtAuth.js` |
| Invalid/expired token returns `403 Forbidden` | Done | `middleware/jwtAuth.js` |

## Added Files

```txt
middleware/jwtAuth.js
models/Order.js
routes/apiRoutes.js
API_TESTING_GUIDE.md
LAB4_REQUIREMENTS_CHECKLIST.md
```
