const Order = require("../models/Order");

function toNumber(value) {
  return Number(value || 0);
}

function mapRecentOrder(order) {
  return {
    id: order._id.toString(),
    shortId: order._id.toString().slice(-6).toUpperCase(),
    customerName: order.user?.name || "Customer",
    customerEmail: order.user?.email || "",
    totalAmount: toNumber(order.totalAmount),
    status: order.status,
    createdAt: order.createdAt,
    itemsCount: order.items.reduce((sum, item) => sum + toNumber(item.quantity), 0),
    itemsSummary: order.items
      .map((item) => `${item.name} × ${item.quantity}`)
      .join(", "),
  };
}

async function buildSalesData() {
  const validOrderFilter = { status: { $ne: "cancelled" } };

  const [revenueResult, totalOrders, topProductResult, recentOrders] = await Promise.all([
    Order.aggregate([
      { $match: validOrderFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]),
    Order.countDocuments(validOrderFilter),
    Order.aggregate([
      { $match: validOrderFilter },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          quantitySold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { quantitySold: -1, revenue: -1 } },
      { $limit: 1 },
    ]),
    Order.find(validOrderFilter)
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("user", "name email")
      .lean(),
  ]);

  const topProduct = topProductResult[0]
    ? {
        name: topProductResult[0].name,
        quantitySold: toNumber(topProductResult[0].quantitySold),
        revenue: toNumber(topProductResult[0].revenue),
      }
    : {
        name: "No sales yet",
        quantitySold: 0,
        revenue: 0,
      };

  return {
    totalRevenue: toNumber(revenueResult[0]?.totalRevenue),
    totalOrders,
    topSellingProduct: topProduct,
    recentTransactions: recentOrders.map(mapRecentOrder),
    lastUpdated: new Date(),
  };
}

async function renderSalesDashboard(req, res) {
  try {
    const salesData = await buildSalesData();

    return res.render("sales", {
      layout: "layouts/main",
      title: "Live Sales Dashboard - Unze London",
      salesData,
      currentUser: res.locals.currentUser || null,
      successMessages: res.locals.successMessages || [],
      errorMessages: res.locals.errorMessages || [],
    });
  } catch (error) {
    console.error("Sales dashboard error:", error.message);
    return res.status(500).send("Unable to load sales dashboard.");
  }
}

async function getSalesDataApi(req, res) {
  try {
    const salesData = await buildSalesData();
    return res.status(200).json(salesData);
  } catch (error) {
    console.error("Sales API error:", error.message);
    return res.status(500).json({
      error: "Unable to fetch latest sales data.",
    });
  }
}

module.exports = {
  buildSalesData,
  renderSalesDashboard,
  getSalesDataApi,
};
