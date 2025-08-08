const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require("../models/User"); // Cần import User model
const { findOrCreateUser, findOrCreateFacebookUser } = require("../controllers/authController");

const configurePassport = (passport) => {
  // Cấu hình chiến lược Google OAuth
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_WEB_CLIENT_ID,
        clientSecret: process.env.GOOGLE_WEB_CLIENT_SECRET,
        callbackURL: `${process.env.EXPO_PUBLIC_BASE_URL}/auth/google/callback`,
      },
      findOrCreateUser // Hàm xử lý logic sau khi xác thực thành công
    )
  );

  // Lưu thông tin user (chỉ ID) vào session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Lấy thông tin user từ CSDL dựa trên ID đã lưu trong session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Cấu hình chiến lược Facebook OAuth
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "/auth/facebook/callback",
        profileFields: ["id", "displayName", "emails", "photos"],
      },
      findOrCreateFacebookUser // Hàm xử lý logic sau khi xác thực thành công
    )
  );
};

module.exports = configurePassport;
