const express = require("express");
const router = express.Router();

const { register, login, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

/* ================= AUTH ================= */
router.post("/register", register);
router.post("/login", login);

/* ================= PROFILE ================= */
router.get("/me", protect, getMe);

module.exports = router;