const Product = require("../models/Product");
const User = require("../models/User");
const defaultProducts = require("./defaultProducts");

async function ensureDefaultProducts() {
  const count = await Product.countDocuments();

  if (count === 0) {
    await Product.insertMany(defaultProducts);
    console.log(`Seeded ${defaultProducts.length} default products.`);
    return;
  }

  console.log(`Products already available in database: ${count}`);
}

async function ensureDefaultAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@unzelondon.com").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  let admin = await User.findOne({ email: adminEmail });

  if (!admin) {
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });
    console.log(`Admin user created: ${adminEmail}`);
    return;
  }

  let changed = false;

  if (admin.role !== "admin") {
    admin.role = "admin";
    changed = true;
  }

  const passwordMatches = await admin.comparePassword(adminPassword);
  if (!passwordMatches) {
    admin.password = adminPassword;
    changed = true;
  }

  if (changed) {
    await admin.save();
    console.log(`Admin user updated: ${adminEmail}`);
  } else {
    console.log(`Admin user ready: ${adminEmail}`);
  }
}

async function bootstrapDatabase() {
  await ensureDefaultProducts();
  await ensureDefaultAdmin();
}

module.exports = {
  bootstrapDatabase,
  ensureDefaultProducts,
  ensureDefaultAdmin,
};
