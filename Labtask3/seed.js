const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");
const defaultProducts = require("./config/defaultProducts");

async function seedProducts() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is missing. Check that your .env file is named exactly .env.");
    }

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log("MongoDB connected for product seeding.");

    await Product.deleteMany({});
    await Product.insertMany(defaultProducts);

    console.log(`${defaultProducts.length} products inserted successfully.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("Product seeding error:", error.message);
    process.exit(1);
  }
}

seedProducts();
