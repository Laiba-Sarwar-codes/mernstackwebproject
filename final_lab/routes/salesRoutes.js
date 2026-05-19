const express = require("express");
const {
  renderSalesDashboard,
  getSalesDataApi,
} = require("../controllers/salesController");

const router = express.Router();

// Server-rendered sales dashboard page.
router.get("/sales", renderSalesDashboard);

// JSON endpoint used by jQuery polling on the dashboard.
router.get("/api/sales-data", getSalesDataApi);

module.exports = router;
