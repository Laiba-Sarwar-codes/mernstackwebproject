# Labtask3 / Assignment 4 - Authentication + RBAC

## Implemented requirements

- One shared login page for both customers and admins.
- One shared register page for both customers and admins.
- Customers can register normally.
- Admin accounts are handled safely in two ways:
  - a default admin is pre-created/updated from `.env` on startup, and
  - new admin registration requires `ADMIN_SECRET_CODE`.
- The `role` field is stored in MongoDB in the User collection.
- The login form asks whether the user is logging in as Customer or Admin.
- The selected login type does not grant permissions by itself; the app verifies the actual role from MongoDB.
- Passwords are hashed using `bcryptjs` before saving.
- Email addresses are unique.
- Password length validation is enforced.
- Sessions are stored in MongoDB using `express-session` and `connect-mongo`.
- Navigation updates dynamically for guests and logged-in users.
- Checkout is protected with `isLoggedIn` middleware.
- The whole admin panel is protected with `isAdmin` middleware.
- Customers who try to open `/admin` are redirected with an access denied flash message.
- Flash messages are used for login, logout, registration, access denied, and admin CRUD actions.
- Products are loaded dynamically from MongoDB with pagination, filtering, and sorting.
- Default products are inserted automatically if the products collection is empty.

## Run steps

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000/products
```

## Customer flow

1. Open `/register`.
2. Select `Customer`.
3. Create the account.
4. Open `/login`.
5. Select `Customer`.
6. Login and continue to the products page.

## Admin flow

### Option 1: use the pre-created admin

The app creates/updates this admin on startup using `.env`:

```text
ADMIN_EMAIL=admin@unzelondon.com
ADMIN_PASSWORD=admin123
```

Login at `/login`, select `Admin`, and use the admin email/password.

### Option 2: register a new admin with the secret code

1. Open `/register`.
2. Select `Admin`.
3. Enter the admin secret code from `.env`:

```text
ADMIN_SECRET_CODE=admin-secret-123
```

4. After registration, open `/login`, select `Admin`, and log in.

## Manual seeding commands

The app auto-seeds products and admin on startup, but these commands are also available:

```bash
npm run seed
npm run seed:admin
npm run seed:all
```

`npm run seed` resets the products collection and inserts the default products.

## Security note

For a real deployment, change `ADMIN_PASSWORD`, `ADMIN_SECRET_CODE`, and `SESSION_SECRET`. Do not publish your real `.env` file publicly.

## Lab Assignment 4 Added: Secure RESTful API with JWT

This version keeps the existing Lab 3 EJS website and adds a headless JSON API under `/api/v1`.

### Implemented API Requirements

- `GET /api/v1/products` — returns JSON product list with pagination, filtering, and sorting.
- `GET /api/v1/products/:id` — returns JSON details for one product.
- `POST /api/v1/auth/login` — verifies email/password and returns a JWT.
- JWT payload includes `user_id` and `role`.
- JWT secret is stored in `.env` as `JWT_SECRET`.
- Token expiry is controlled with `JWT_EXPIRES_IN=1h`.
- `verifyToken` middleware extracts `Authorization: Bearer <token>`, verifies the token, and attaches decoded user info to `req.user`.
- `GET /api/v1/user/profile` — protected route that returns authenticated user data.
- `POST /api/v1/orders` — protected route that allows logged-in users to submit orders.

### Important Files Added

```txt
middleware/jwtAuth.js
models/Order.js
routes/apiRoutes.js
API_TESTING_GUIDE.md
```

### Quick Test

```bash
npm install
npm start
```

Then open or test:

```txt
GET http://localhost:3000/api/v1/products
POST http://localhost:3000/api/v1/auth/login
GET http://localhost:3000/api/v1/user/profile
POST http://localhost:3000/api/v1/orders
```

See `API_TESTING_GUIDE.md` for complete Postman / Thunder Client testing steps.

