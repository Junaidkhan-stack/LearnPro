const express = require("express");
const router = express.Router();

const { getTeacherDashboard } = require("../controllers/dashboard.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.get(
  "/teacher",
  protect,
  authorize("teacher"),
  getTeacherDashboard
);

module.exports = router;