const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* ================= REGISTER ================= */
const crypto = require("crypto");
const { sendOTPEmail } = require("../services/email.service");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      // 🔥 If already verified → block
      if (userExists.isVerified) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // 🔥 If NOT verified → resend OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      userExists.otp = otp;
      userExists.otpExpires = Date.now() + 10 * 60 * 1000;

      await userExists.save();

      await sendOTPEmail(userExists.email, otp);

      return res.status(200).json({
        message: "OTP resent. Please verify your email.",
        userId: userExists._id,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000, // 10 min
    });

    // 🔥 Send email
    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "Signup successful. Verify OTP sent to email.",
      userId: user._id,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Signup failed" });
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Email verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("VERIFY ERROR:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};
/* ================= RESEND OTP ================= */
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 🔥 Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendOTPEmail(user.email, otp);

    res.json({ message: "OTP resent successfully" });
  } catch (error) {
    console.log("RESEND OTP ERROR:", error);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

/* ================= GET PROFILE ================= */
exports.getMe = async (req, res) => {
  try {
    res.status(200).json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (error) {
    console.log("❌ getMe error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendOTPEmail(user.email, otp);

    res.json({
      message: "OTP sent successfully",
      userId: user._id, // 🔥 IMPORTANT
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.verifyResetOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({
      message: "OTP verified successfully",
      userId: user._id,
    });

  } catch (error) {
    res.status(500).json({ message: "OTP verification failed" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: "Reset failed" });
  }
};

exports.setPassword = async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    inviteToken: token,
    inviteExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid invite" });
  }

  user.password = await bcrypt.hash(password, 10);
  user.isVerified = true;
  user.inviteToken = undefined;
  user.inviteExpires = undefined;

  await user.save();

  res.json({ message: "Account activated" });
};