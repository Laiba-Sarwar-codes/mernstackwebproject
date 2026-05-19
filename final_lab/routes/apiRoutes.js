const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const { verifyToken } = require("../middleware/jwtAuth");

const router = express.Router();

function normalizePositiveInteger(value, fallback, max = 100) {
  const number = Number.parseInt(value, 10);
  if (Number.isNaN(number) || number < 1) return fallback;
  return Math.min(number, max);
}

function buildProductFilter(query) {
  const filter = {};
  const search = query.search?.trim();
  const category = query.category?.trim();
  const minPrice = query.minPrice;
  const maxPrice = query.maxPrice;

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (category) {
    filter.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};

    const minimum = Number(minPrice);
    const maximum = Number(maxPrice);

    if (!Number.isNaN(minimum)) filter.price.$gte = minimum;
    if (!Number.isNaN(maximum)) filter.price.$lte = maximum;

    if (Object.keys(filter.price).length === 0) delete filter.price;
  }

  return filter;
}

function buildProductSort(sort) {
  const sortOptions = {
    newest: { createdAt: -1 },
    priceLow: { price: 1 },
    priceHigh: { price: -1 },
    rating: { rating: -1 },
    stock: { stock: -1 },
  };

  return sortOptions[sort] || sortOptions.newest;
}

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// Health check for API testing.
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running.",
    version: "v1",
  });
});

// PUBLIC: GET /api/v1/products?page=1&limit=8&search=&category=&minPrice=&maxPrice=&sort=newest
router.get("/products", async (req, res) => {
  try {
    const page = normalizePositiveInteger(req.query.page, 1);
    const limit = normalizePositiveInteger(req.query.limit, 8, 50);
    const skip = (page - 1) * limit;
    const filter = buildProductFilter(req.query);
    const sortOption = buildProductSort(req.query.sort);

    const [totalProducts, products, categories] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort(sortOption).skip(skip).limit(limit),
      Product.distinct("category"),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        search: req.query.search || "",
        category: req.query.category || "",
        minPrice: req.query.minPrice || "",
        maxPrice: req.query.maxPrice || "",
        sort: req.query.sort || "newest",
      },
      categories,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching products.",
    });
  }
});

// PUBLIC: GET /api/v1/products/:id
router.get("/products/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format.",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully.",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the product.",
    });
  }
});

// PUBLIC JWT SIGN-IN: POST /api/v1/auth/login
router.post("/auth/login", async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured on the server.",
      });
    }

    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await user.comparePassword(password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const payload = {
      user_id: user._id.toString(),
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful. Use this token in the Authorization header as Bearer <token>.",
      token,
      tokenType: "Bearer",
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to log in through API. Please try again.",
    });
  }
});

// PROTECTED: GET /api/v1/user/profile
router.get("/user/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id).select("name email role createdAt updatedAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Authenticated user was not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch user profile.",
    });
  }
});

// PROTECTED: POST /api/v1/orders
router.post("/orders", verifyToken, async (req, res) => {
  try {
    const items = req.body.items;
    const shippingAddress = typeof req.body.shippingAddress === "string" ? req.body.shippingAddress.trim() : "";

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required. Send items as an array of { productId, quantity }.",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required.",
      });
    }

    const invalidQuantityItem = items.find((item) => {
      const quantity = Number(item.quantity);
      return !Number.isInteger(quantity) || quantity < 1 || quantity > 100;
    });

    if (invalidQuantityItem) {
      return res.status(400).json({
        success: false,
        message: "Each order item quantity must be a whole number between 1 and 100.",
      });
    }

    const normalizedItems = Array.from(
      items.reduce((map, item) => {
        const productId = item.productId;
        const quantity = Number(item.quantity);
        const existing = map.get(productId);
        map.set(productId, {
          productId,
          quantity: existing ? existing.quantity + quantity : quantity,
        });
        return map;
      }, new Map()).values()
    );

    const invalidProduct = normalizedItems.find((item) => !mongoose.Types.ObjectId.isValid(item.productId));
    if (invalidProduct) {
      return res.status(400).json({
        success: false,
        message: `Invalid product ID format: ${invalidProduct.productId}`,
      });
    }

    const productIds = normalizedItems.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));

    const missingProductId = productIds.find((id) => !productMap.has(id));
    if (missingProductId) {
      return res.status(404).json({
        success: false,
        message: `Product not found: ${missingProductId}`,
      });
    }

    const orderItems = normalizedItems.map((item) => {
      const product = productMap.get(item.productId);

      if (product.stock < item.quantity) {
        const error = new Error(`Insufficient stock for ${product.name}. Available stock: ${product.stock}.`);
        error.statusCode = 400;
        throw error;
      }

      const subtotal = Number((product.price * item.quantity).toFixed(2));

      return {
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      };
    });

    const totalAmount = Number(orderItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));

    const order = await Order.create({
      user: req.user.user_id,
      items: orderItems,
      totalAmount,
      shippingAddress,
    });

    return res.status(201).json({
      success: true,
      message: "Order submitted successfully.",
      order,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to submit order.",
    });
  }
});

router.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

module.exports = router;
