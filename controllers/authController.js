const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Hàm trợ giúp để tạo JWT
const generateToken = (user) => {
  const payload = { id: user._id, name: user.fullName, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/**
 * Hàm được Passport-Google-Strategy gọi sau khi xác thực thành công.
 * Tìm user trong CSDL bằng googleId, nếu không có thì tạo mới.
 */
exports.findOrCreateUser = async (accessToken, refreshToken, profile, done) => {
  try {
    // Tìm user dựa trên googleId
    let user = await User.findOne({ googleId: profile.id });

    // Nếu tìm thấy user, trả về user đó
    if (user) {
      return done(null, user);
    }

    // Nếu không tìm thấy, tạo user mới
    const newUser = new User({
      googleId: profile.id,
      fullName: profile.displayName,
      email: profile.emails[0].value,
      picture: profile.photos[0].value,
      // Đánh dấu tài khoản email là đã được xác thực vì nó đến từ Google
      isVerified: true,
    });

    await newUser.save();
    done(null, newUser);
  } catch (error) {
    done(error, null);
  }
};

/**
 * Hàm được gọi sau khi passport.authenticate trong route callback thành công.
 * Tạo JWT và chuyển hướng người dùng về ứng dụng client (Expo) với token.
 */
exports.googleCallback = (req, res) => {
  const user = req.user; // User được passport gắn vào req
  const token = generateToken(user);

  // const userForApp = {
  //   id: user._id,
  //   name: user.fullName,
  //   email: user.email,
  //   picture: user.picture,
  // };

  // // Tạo URL để chuyển hướng về ứng dụng Expo với token và thông tin user
  // const redirectUrl = `${
  //   process.env.EXPO_PUBLIC_SCHEME
  // }://auth?token=${token}&user=${encodeURIComponent(
  //   JSON.stringify(userForApp)
  // )}`;

  const redirectUrl = `${process.env.EXPO_PUBLIC_SCHEME}://auth?token=${token}`;

  // THÊM DÒNG NÀY ĐỂ DEBUG
  console.log("Redirecting to URL:", redirectUrl);

  // Chuyển hướng về app
  res.redirect(redirectUrl);
};

exports.getMe = (req, res) => {
  // `req.user` đã được middleware `protect` gắn vào
  res.status(200).json(req.user);
};
