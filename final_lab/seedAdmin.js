const mongoose = require("mongoose");
require("dotenv").config();

const { ensureDefaultAdmin } = require("./config/bootstrap");

async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is missing. Check that your .env file is named exactly .env.");
    }

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log("MongoDB connected for admin seeding.");

    await ensureDefaultAdmin();

    console.log(`Admin email: ${process.env.ADMIN_EMAIL || "admin@unzelondon.com"}`);
    console.log(`Admin password: ${process.env.ADMIN_PASSWORD || "admin123"}`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("Admin seeding error:", error.message);
    process.exit(1);
  }
}

seedAdmin();
