const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require("../models/Product");
const { isAdmin } = require("../middleware/authMiddleware");

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
  if (data.oldPrice < data.price) return "Old price should be greater than or equal to sale price.";
  if (Number.isNaN(data.rating) || data.rating < 0 || data.rating > 5) return "Rating must be between 0 and 5.";
  if (Number.isNaN(data.stock) || data.stock < 0) return "Stock must be a valid number.";
  if (Number.isNaN(data.colors) || data.colors < 1) return "Colors must be at least 1.";
  if (Number.isNaN(data.discount) || data.discount < 0 || data.discount > 100) return "Discount must be between 0 and 100.";
  if (imageRequired && !file) return "Product image is required.";
  return null;
}

router.get("/login", (req, res) => res.redirect("/login"));

// Every route below this line is protected by role-based access control.
router.use(isAdmin);

router.get("/", async (req, res) => {
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

router.get("/products/add", (req, res) => {
  res.render("admin/add-product", { error: null, formData: {} });
});

router.post("/products/add", upload.single("image"), async (req, res) => {
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

    req.flash("success", "Product added successfully.");
    res.redirect("/admin");
  } catch (error) {
    res.render("admin/add-product", {
      error: error.message || "Unable to add product.",
      formData: req.body,
    });
  }
});

router.get("/products/edit/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found.");

    res.render("admin/edit-product", { error: null, product });
  } catch (error) {
    res.status(500).send("Unable to load edit product page.");
  }
});

router.post("/products/edit/:id", upload.single("image"), async (req, res) => {
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
    req.flash("success", "Product updated successfully.");
    res.redirect("/admin");
  } catch (error) {
    res.status(500).send("Unable to update product.");
  }
});

router.post("/products/delete/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      deleteUploadedFile(product.image);
      await Product.findByIdAndDelete(req.params.id);
      req.flash("success", "Product deleted successfully.");
    }
    res.redirect("/admin");
  } catch (error) {
    res.status(500).send("Unable to delete product.");
  }
});

module.exports = router;
