const passport = require("passport");
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { googleCallback, getMe } = require("../controllers/authController");

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

router.get("/me", protect, getMe);

module.exports = router;
