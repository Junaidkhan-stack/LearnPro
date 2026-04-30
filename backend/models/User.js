const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student", // SYSTEM ASSIGNED
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otpExpires: Date,

  },

  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
