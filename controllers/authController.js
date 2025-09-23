const jwt = require("jsonwebtoken");
const User = require("../models/User");
const passport = require("passport");
const axios = require("axios");
const bcrypt = require("bcryptjs");
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
 * Hàm được Passport-Facebook-Strategy gọi sau khi xác thực thành công.
 * Tìm user trong CSDL bằng facebookId, nếu không có thì tạo mới.
 */
exports.findOrCreateFacebookUser = async (
  accessToken,
  refreshToken,
  profile,
  done
) => {
  try {
    let user = await User.findOne({ facebookId: profile.id });
    if (user) return done(null, user);

    const newUser = new User({
      facebookId: profile.id,
      fullName: profile.displayName,
      email: profile.emails?.[0]?.value,
      picture: profile.photos?.[0]?.value,
      isVerified: true,
    });
    await newUser.save();
    done(null, newUser);
  } catch (error) {
    done(error, null);
  }
};
exports.facebookAuth = passport.authenticate("facebook", { scope: ["email"] });

exports.facebookCallback = [
  passport.authenticate("facebook", { session: false, failureRedirect: "/" }),
  (req, res) => {
    const user = req.user;
    const token = generateToken(user);
    const redirectUrl = `${process.env.EXPO_PUBLIC_SCHEME}://auth?token=${token}`;
    res.redirect(redirectUrl);
  },
];
exports.facebookToken = async (req, res) => {
  const { access_token } = req.body;
  if (!access_token) {
    return res.status(400).json({ message: "No access_token" });
  }

  try {
    // Lấy thông tin user từ Facebook Graph API
    const fbRes = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${access_token}`
    );
    const profile = fbRes.data;

    // Nếu Facebook không trả về email, không thể tiếp tục
    if (!profile.email) {
      return res
        .status(400)
        .json({ message: "Facebook did not return an email address." });
    }

    // <<< THAY ĐỔI QUAN TRỌNG BẮT ĐẦU TỪ ĐÂY >>>

    // Tìm người dùng bằng EMAIL, không phải facebookId
    let user = await User.findOne({ email: profile.email });

    if (user) {
      // Người dùng đã tồn tại (có thể đã đăng ký bằng Google hoặc email)
      // Chúng ta sẽ cập nhật facebookId nếu nó chưa được liên kết
      if (!user.facebookId) {
        user.facebookId = profile.id;
        // Bạn cũng có thể cập nhật ảnh đại diện mới nhất từ Facebook
        user.picture = profile.picture?.data?.url;
        await user.save();
      }
    } else {
      // Người dùng chưa tồn tại -> tạo một người dùng hoàn toàn mới
      user = new User({
        facebookId: profile.id,
        fullName: profile.name,
        email: profile.email,
        picture: profile.picture?.data?.url,
        isVerified: true, // Email từ Facebook được coi là đã xác thực
      });
      await user.save();
    }

    // <<< KẾT THÚC THAY ĐỔI QUAN TRỌNG >>>

    // Tạo JWT cho người dùng (dù là cũ hay mới)
    const token = generateToken({
      id: user._id,
      name: user.fullName,
      email: user.email,
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error(
      "Facebook token login error:",
      error?.response?.data || error
    );
    // Phân biệt lỗi do token FB sai và lỗi server
    if (error.isAxiosError) {
      return res
        .status(401)
        .json({ message: "Invalid or expired Facebook access token" });
    }
    // Gửi lỗi chung nếu có vấn đề khác (ví dụ: lỗi database)
    res.status(500).json({ message: "An internal server error occurred." });
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

/**
 * @desc    Đăng ký người dùng mới bằng email và mật khẩu
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    // 2. Kiểm tra email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email này đã được sử dụng." });
    }

    // 3. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Tạo người dùng mới
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword, // Lưu mật khẩu đã mã hóa
    });
    await newUser.save();

    // 5. Tạo JWT và trả về cho client
    const token = generateToken(newUser);
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        picture: newUser.picture,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * @desc    Đăng nhập người dùng bằng email và mật khẩu
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu." });
    }

    // 2. Tìm người dùng trong CSDL
    const user = await User.findOne({ email });

    // 3. Nếu tìm thấy user, so sánh mật khẩu
    if (user && (await bcrypt.compare(password, user.password))) {
      // Mật khẩu khớp -> Tạo JWT và trả về
      const token = generateToken(user);
      res.status(200).json({
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          picture: user.picture,
        },
      });
    } else {
      // User không tồn tại hoặc sai mật khẩu
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác." });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};
