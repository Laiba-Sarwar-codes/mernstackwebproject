const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.log("MongoDB connection error:", error.message));

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/products", productRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
