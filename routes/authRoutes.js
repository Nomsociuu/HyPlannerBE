const passport = require("passport");
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { googleCallback, getMe, facebookAuth, facebookCallback } = require("../controllers/authController");

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
router.get('/facebook', facebookAuth);
router.get('/facebook/callback', facebookCallback);

router.get("/me", protect, getMe);

module.exports = router;
