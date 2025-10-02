const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  googleId: { type: String },
  facebookId: { type: String },
  fullName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, "is invalid"],
  },
  password: { type: String },
  picture: { type: String },
  createdAt: { type: Date, default: Date.now },
  otp: { type: String },
  otpExpires: { type: Date },

  pendingEmail: { type: String }, // Để lưu email mới đang chờ xác thực
  changeEmailOtp: { type: String }, // Mã OTP để đổi email
  changeEmailOtpExpires: { type: Date }, // Thời gian hết hạn của OTP
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  isVerified: {
    type: Boolean,
    default: false,
  },
  accountType: {
    type: String,
    enum: ["FREE", "VIP", "SUPER"], // Chỉ chấp nhận các giá trị này
    default: "FREE",
  },
  accountExpires: {
    type: Date, // Sẽ lưu ngày hết hạn cho gói VIP
  },
});

// Mã hóa mật khẩu trước khi lưu
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// THÊM PHƯƠNG THỨC MỚI: So sánh mật khẩu
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
