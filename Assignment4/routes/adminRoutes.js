const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require("../models/Product");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname).toLowerCase());
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG and WEBP images are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 },
});

function isAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.redirect("/admin/login");
}

function deleteUploadedFile(imagePath) {
  if (!imagePath || !imagePath.startsWith("/uploads/")) return;
  const fullPath = path.join(__dirname, "..", "public", imagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

function getFormData(body) {
  return {
    name: body.name?.trim(),
    oldPrice: Number(body.oldPrice),
    price: Number(body.price),
    category: body.category?.trim(),
    rating: Number(body.rating),
    stock: Number(body.stock),
    colors: Number(body.colors || 3),
    discount: Number(body.discount || 0),
    newArrival: body.newArrival === "on",
  };
}

function validateProduct(data, imageRequired, file) {
  if (!data.name || !data.category) return "Name and category are required.";
  if (Number.isNaN(data.oldPrice) || data.oldPrice < 0) return "Old price must be a valid number.";
  if (Number.isNaN(data.price) || data.price < 0) return "Price must be a valid number.";
  if (Number.isNaN(data.rating) || data.rating < 0 || data.rating > 5) return "Rating must be between 0 and 5.";
  if (Number.isNaN(data.stock) || data.stock < 0) return "Stock must be a valid number.";
  if (Number.isNaN(data.colors) || data.colors < 1) return "Colors must be at least 1.";
  if (Number.isNaN(data.discount) || data.discount < 0 || data.discount > 100) return "Discount must be between 0 and 100.";
  if (imageRequired && !file) return "Product image is required.";
  return null;
}

router.get("/login", (req, res) => {
  res.render("admin/login", { error: null });
});

router.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (username === adminUsername && password === adminPassword) {
    req.session.isAdmin = true;
    return res.redirect("/admin");
  }

  return res.render("admin/login", { error: "Invalid admin username or password." });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

router.get("/", isAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const totalCategories = await Product.distinct("category");

    res.render("admin/dashboard", {
      products,
      totalProducts,
      totalStock,
      totalCategories: totalCategories.length,
    });
  } catch (error) {
    res.status(500).send("Unable to load admin dashboard.");
  }
});

router.get("/products/add", isAdmin, (req, res) => {
  res.render("admin/add-product", { error: null, formData: {} });
});

router.post("/products/add", isAdmin, upload.single("image"), async (req, res) => {
  try {
    const data = getFormData(req.body);
    const error = validateProduct(data, true, req.file);

    if (error) {
      if (req.file) deleteUploadedFile(`/uploads/${req.file.filename}`);
      return res.render("admin/add-product", { error, formData: req.body });
    }

    await Product.create({
      ...data,
      image: `/uploads/${req.file.filename}`,
    });

    res.redirect("/admin");
  } catch (error) {
    res.render("admin/add-product", {
      error: error.message || "Unable to add product.",
      formData: req.body,
    });
  }
});

router.get("/products/edit/:id", isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found.");

    res.render("admin/edit-product", { error: null, product });
  } catch (error) {
    res.status(500).send("Unable to load edit product page.");
  }
});

router.post("/products/edit/:id", isAdmin, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found.");

    const data = getFormData(req.body);
    const error = validateProduct(data, false, req.file);

    if (error) {
      if (req.file) deleteUploadedFile(`/uploads/${req.file.filename}`);
      return res.render("admin/edit-product", { error, product: { ...product.toObject(), ...req.body } });
    }

    if (req.file) {
      deleteUploadedFile(product.image);
      data.image = `/uploads/${req.file.filename}`;
    }

    await Product.findByIdAndUpdate(req.params.id, data, { runValidators: true });
    res.redirect("/admin");
  } catch (error) {
    res.status(500).send("Unable to update product.");
  }
});

router.post("/products/delete/:id", isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      deleteUploadedFile(product.image);
      await Product.findByIdAndDelete(req.params.id);
    }
    res.redirect("/admin");
  } catch (error) {
    res.status(500).send("Unable to delete product.");
  }
});

module.exports = router;
