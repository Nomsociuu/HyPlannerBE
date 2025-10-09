const passport = require("passport");
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  googleCallback,
  getMe,
  facebookAuth,
  facebookCallback,
  facebookToken,
  registerUser,
  loginUser,
  updateUserProfile,
  requestEmailChange,
  verifyEmailChange,
  forgotPassword,
  verifyPasswordResetOtp,
  resetPassword,
  verifyEmail,
} = require("../controllers/authController");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login-failed",
    session: false,
  }),
  googleCallback
);

// Facebook OAuth
router.get("/facebook", facebookAuth);
router.get("/facebook/callback", facebookCallback);
router.post("/facebook/token", facebookToken);
router.get("/me", protect, getMe);

//Normal login
router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/login", loginUser);

//user profile
router.put("/profile", protect, updateUserProfile);
router.post("/change-email/request", protect, requestEmailChange);
router.post("/change-email/verify", protect, verifyEmailChange);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyPasswordResetOtp);
router.post("/reset-password", resetPassword);
router.get("/status", protect, getUserAccountStatus);

module.exports = router;
