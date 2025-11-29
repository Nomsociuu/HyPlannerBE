const jwt = require("jsonwebtoken");
const User = require("../models/User");
const passport = require("passport");
const axios = require("axios");
const asyncHandler = require("express-async-handler");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const mixpanel = require("../service/mixpanelServer");

const trackMixpanelSignup = (user, method) => {
  try {
    const userId = user._id.toString();

    // 1. Gửi sự kiện "Signed Up"
    mixpanel.track("Signed Up", {
      distinct_id: userId,
      "Signup Method": method, // 'Email', 'Google', 'Facebook'
    });

    // 2. Tạo hồ sơ người dùng (User Profile)
    mixpanel.people.set(userId, {
      $first_name: user.fullName.split(" ")[0] || "", // Lấy tên
      $last_name: user.fullName.split(" ").slice(1).join(" ") || "", // Lấy họ
      $name: user.fullName,
      $email: user.email,
      $created: new Date().toISOString(),
      "Signup Method": method,
    });
  } catch (err) {
    console.error("Mixpanel signup tracking error:", err);
    // Không block flow đăng ký dù Mixpanel lỗi
  }
};
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
    trackMixpanelSignup(newUser, "Google");
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
    trackMixpanelSignup(newUser, "Facebook");
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
    let isNewUser = false;

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
      isNewUser = true;
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

    if (isNewUser) {
      trackMixpanelSignup(user, "Facebook");
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
 * @desc    Đăng ký người dùng mới (ĐÃ REFACTOR)
 */
exports.registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  // 1. Validation cơ bản
  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error("Vui lòng nhập đầy đủ thông tin.");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const userExists = await User.findOne({ email: normalizedEmail });

  // 2. Xử lý logic người dùng tồn tại
  // Nếu user đã tồn tại VÀ đã được xác thực -> Báo lỗi
  if (userExists && userExists.isVerified) {
    res.status(400);
    throw new Error("Email này đã được sử dụng.");
  }

  // Nếu user tồn tại nhưng CHƯA xác thực, ta sẽ dùng lại bản ghi đó.
  // Nếu không, tạo một bản ghi mới.
  const user = userExists || new User({ fullName, email: normalizedEmail });

  // Chỉ gán mật khẩu cho người dùng mới hoàn toàn
  if (!userExists) {
    user.password = password;
  }

  // 3. Tạo và lưu OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP có hiệu lực 10 phút

  // Đảm bảo trạng thái isVerified là false
  user.isVerified = false;

  await user.save();

  // 4. Gửi email chứa OTP
  const message = `Chào mừng bạn đến với HyPlanner! Mã xác thực đăng ký của bạn là: ${otp}. Mã này sẽ hết hạn sau 10 phút.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Xác thực tài khoản HyPlanner",
      message,
    });

    // 5. Trả về thông báo thành công (KHÔNG trả về token)
    res.status(200).json({
      success: true,
      message:
        "Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.",
    });
  } catch (err) {
    // Nếu gửi email thất bại, xóa OTP đã lưu để người dùng có thể thử lại
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    console.error("Email sending error:", err);
    res.status(500);
    throw new Error("Lỗi xảy ra khi gửi email xác thực, vui lòng thử lại.");
  }
});

// === HÀM MỚI: XÁC THỰC EMAIL SAU KHI ĐĂNG KÝ ===
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    otp,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn.");
  }

  // Nếu OTP đúng -> xác thực user và đăng nhập
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  trackMixpanelSignup(user, "Email");

  // Trả về token và thông tin user để app tự động đăng nhập
  res.status(200).json({
    token: generateToken(user),
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      picture: user.picture,
    },
  });
});

/**
 * @desc    Đăng nhập người dùng (ĐÃ REFACTOR)
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu." });
    }

    const user = await User.findOne({ email: normalizedEmail });

    // Dùng phương thức user.matchPassword đã tầo trong model
    if (user && (await user.matchPassword(password))) {
      // Track login với Mixpanel
      mixpanel.track("Logged In", {
        distinct_id: user._id.toString(),
        "Login Method": "Email",
        Email: user.email,
      });

      // Cập nhật last login time
      mixpanel.people.set(user._id.toString(), {
        $last_login: new Date().toISOString(),
      });

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
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác." });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * @desc    Cập nhật thông tin người dùng
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }

  // Lấy các trường mật khẩu từ body
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  // --- LOGIC MỚI: ƯU TIÊN XỬ LÝ ĐỔI MẬT KHẨU ---
  if (oldPassword && newPassword) {
    // 1. Kiểm tra mật khẩu cũ có đúng không
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      res.status(401); // 401 Unauthorized
      throw new Error("Mật khẩu cũ không chính xác.");
    }

    // 2. Kiểm tra mật khẩu mới có khớp không
    if (newPassword !== confirmNewPassword) {
      res.status(400); // 400 Bad Request
      throw new Error("Mật khẩu mới không khớp.");
    }

    // 3. Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save(); // pre('save') hook sẽ tự động hash mật khẩu

    res.status(200).json({ message: "Cập nhật mật khẩu thành công." });
    return; // Kết thúc hàm sau khi đổi mật khẩu
  }

  // --- LOGIC CŨ: XỬ LÝ CẬP NHẬT CÁC THÔNG TIN KHÁC ---
  user.fullName = req.body.fullName || user.fullName;
  user.email = req.body.email || user.email; // Cẩn thận khi cho phép đổi email
  user.picture = req.body.picture || user.picture;

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    fullName: updatedUser.fullName,
    email: updatedUser.email,
    picture: updatedUser.picture,
  });
});

/**
 * @desc    YÊU CẦU ĐỔI EMAIL
 * @route   POST auth/change-email/request
 * @access  Private
 */
exports.requestEmailChange = asyncHandler(async (req, res) => {
  const { newEmail } = req.body;
  const user = await User.findById(req.user._id);

  // Kiểm tra email mới có bị trùng không
  const emailExists = await User.findOne({ email: newEmail });
  if (emailExists) {
    res.status(400);
    throw new Error("Email này đã được sử dụng");
  }

  // Tạo OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Lưu OTP và email chờ vào user
  user.pendingEmail = newEmail;
  user.changeEmailOtp = otp;
  user.changeEmailOtpExpires = Date.now() + 10 * 60 * 1000; // 10 phút
  await user.save();

  // Gửi email
  const message = `Mã xác thực để thay đổi email của bạn là: ${otp}. Mã này sẽ hết hạn sau 10 phút.`;
  try {
    await sendEmail({
      email: newEmail,
      subject: "Mã xác thực thay đổi Email",
      message,
    });
    res
      .status(200)
      .json({ success: true, message: "OTP đã được gửi đến email mới." });
  } catch (err) {
    console.error(err);
    user.changeEmailOtp = undefined;
    user.changeEmailOtpExpires = undefined;
    user.pendingEmail = undefined;
    await user.save();
    throw new Error("Lỗi gửi email, vui lòng thử lại.");
  }
});

/**
 * @desc    XÁC THỰC OTP VÀ ĐỔI EMAIL
 * @route   POST auth/change-email/verify
 * @access  Private
 */
exports.verifyEmailChange = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const user = await User.findById(req.user._id);

  // Kiểm tra OTP
  if (
    !user.pendingEmail ||
    user.changeEmailOtp !== otp ||
    user.changeEmailOtpExpires < Date.now()
  ) {
    res.status(400);
    throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn.");
  }

  // Cập nhật email thành công
  user.email = user.pendingEmail;
  user.pendingEmail = undefined;
  user.changeEmailOtp = undefined;
  user.changeEmailOtpExpires = undefined;

  const updatedUser = await user.save();

  // Trả về user đã cập nhật để redux có thể update
  res.json({
    _id: updatedUser._id,
    fullName: updatedUser.fullName,
    email: updatedUser.email,
    picture: updatedUser.picture,
  });
});
// === HÀM 1: GỬI YÊU CẦU QUÊN MẬT KHẨU ===
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Luôn trả về thông báo thành công để tránh lộ thông tin email có tồn tại hay không
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "Nếu email tồn tại, bạn sẽ nhận được mã OTP.",
    });
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 phút
  await user.save();

  const message = `Mã khôi phục mật khẩu của bạn là: ${otp}. Mã này sẽ hết hạn sau 10 phút.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Yêu cầu khôi phục mật khẩu",
      message,
    });
    res
      .status(200)
      .json({ success: true, message: "OTP đã được gửi đến email của bạn." });
  } catch (err) {
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    throw new Error("Lỗi gửi email, vui lòng thử lại.");
  }
});

// === HÀM 2: XÁC THỰC OTP VÀ TẠO TOKEN RESET ===
exports.verifyPasswordResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({
    email,
    otp,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn.");
  }

  // Tạo một token reset an toàn
  const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Token cũng có hạn 10 phút
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.status(200).json({ success: true, token: resetToken });
});

// === HÀM 3: ĐẶT LẠI MẬT KHẨU MỚI ===
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, token, password } = req.body;

  const user = await User.findOne({
    email,
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Token không hợp lệ hoặc đã hết hạn.");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Mật khẩu đã được đặt lại thành công." });
});

/**
 * @desc    Lấy trạng thái tài khoản của người dùng hiện tại
 * @route   GET /auth/status
 * @access  Private
 */
exports.getUserAccountStatus = async (req, res) => {
  try {
    // req.user.id được lấy từ middleware "protect"
    const user = await User.findById(req.user.id).select("accountType");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    res.status(200).json({ accountType: user.accountType });
  } catch (error) {
    console.error("Lỗi khi lấy trạng thái tài khoản:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * @desc    Cập nhật Expo push notification token
 * @route   POST /auth/push-token
 * @access  Private
 */
exports.updatePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;
    const userId = req.user._id;

    if (!pushToken) {
      return res.status(400).json({ message: "Push token is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.pushToken = pushToken;
    user.pushTokenUpdatedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Push token updated successfully",
    });
  } catch (error) {
    console.error("Error updating push token:", error);
    res.status(500).json({ message: "Server error" });
  }
};
