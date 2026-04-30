const express = require("express");
const router = express.Router();

const {
  register,
  verifyEmail,
  login,
  getMe,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  setPassword
} = require("../controllers/auth.controller");

const { protect } = require("../middleware/auth.middleware");

/* ================= AUTH ================= */
router.post("/register", register);
router.post("/verify", verifyEmail);

router.post("/resend-otp", resendOTP);

/* 🔥 FORGOT PASSWORD FLOW (ADD HERE) */
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);
router.post("/set-password", setPassword);


router.post("/login", login);

/* ================= PROFILE ================= */
router.get("/me", protect, getMe);

module.exports = router;