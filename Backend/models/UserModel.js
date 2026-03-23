const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    employeeId: { type: String, unique: true, sparse: true },

    department: { type: String },

    designation: { type: String },

    role: {
      type: String,
      enum: ["SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE"],
      default: "EMPLOYEE",
    },

    joiningDate: { type: Date },

    isActive: { type: Boolean, default: true },

    // Extended profile fields for employee self-service
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    emergencyContact: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    bio: { type: String, default: "" },

    // OTP fields
    otpCode:      { type: String, default: null },
    otpExpiresAt: { type: Date,   default: null },
    otpPurpose:   { type: String, default: null }, // 'forgot-password' | 'change-password'
  },
  { timestamps: true }
);

// 🔐 Auto hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;