const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");

router.get("/me", protect, async (req, res) => {
  res.status(200).json({
    user: req.user,
  });
});

module.exports = router;