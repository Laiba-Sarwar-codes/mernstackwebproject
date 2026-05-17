const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "assignment3-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.log("MongoDB connection error:", error.message));

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/products", productRoutes);
app.use("/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Products page: http://localhost:${PORT}/products`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
