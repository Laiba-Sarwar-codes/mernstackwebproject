const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");
const { ensureDefaultProducts } = require("./config/bootstrap");

function makeOrderItems(products, orderPlan) {
  return orderPlan.map(({ productIndex, quantity }) => {
    const product = products[productIndex % products.length];
    const subtotal = Number((product.price * quantity).toFixed(2));

    return {
      product: product._id,
      name: product.name,
      quantity,
      price: product.price,
      subtotal,
    };
  });
}

async function seedSales() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is missing. Check that your .env file is named exactly .env.");
    }

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log("MongoDB connected for sales seeding.");

    await ensureDefaultProducts();

    let customer = await User.findOne({ email: "customer@unzelondon.com" });
    if (!customer) {
      customer = await User.create({
        name: "Demo Customer",
        email: "customer@unzelondon.com",
        password: "customer123",
        role: "customer",
      });
      console.log("Demo customer created: customer@unzelondon.com / customer123");
    }

    const existingOrders = await Order.countDocuments();
    if (existingOrders > 0) {
      console.log(`Sales/orders already available: ${existingOrders}. No demo orders inserted.`);
      await mongoose.disconnect();
      return;
    }

    const products = await Product.find().sort({ createdAt: 1 }).limit(8);
    if (products.length < 3) {
      throw new Error("At least 3 products are required before seeding demo sales.");
    }

    const orderPlans = [
      { items: [{ productIndex: 0, quantity: 2 }, { productIndex: 1, quantity: 1 }], status: "confirmed", daysAgo: 0 },
      { items: [{ productIndex: 2, quantity: 3 }], status: "pending", daysAgo: 0 },
      { items: [{ productIndex: 1, quantity: 2 }, { productIndex: 3, quantity: 1 }], status: "confirmed", daysAgo: 1 },
      { items: [{ productIndex: 4, quantity: 1 }, { productIndex: 0, quantity: 1 }], status: "confirmed", daysAgo: 2 },
      { items: [{ productIndex: 2, quantity: 2 }, { productIndex: 5, quantity: 1 }], status: "confirmed", daysAgo: 3 },
    ];

    const orders = orderPlans.map((plan) => {
      const items = makeOrderItems(products, plan.items);
      const totalAmount = Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
      const date = new Date(Date.now() - plan.daysAgo * 24 * 60 * 60 * 1000);

      return {
        user: customer._id,
        items,
        totalAmount,
        shippingAddress: "Demo shipping address, Lahore, Pakistan",
        status: plan.status,
        createdAt: date,
        updatedAt: date,
      };
    });

    await Order.insertMany(orders);
    console.log(`${orders.length} demo sales/orders inserted successfully.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("Sales seeding error:", error.message);
    process.exit(1);
  }
}

seedSales();
