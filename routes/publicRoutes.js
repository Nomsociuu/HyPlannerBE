const express = require("express");
const router = express.Router();
const InvitationLetter = require("../models/InvitationLetter");
const guestController = require("../controllers/guestController");

// Dữ liệu mẫu (sample) CŨNG CẦN được cập nhật để có cấu trúc phẳng
// và có các trường mới để trang /preview hoạt động
const sampleWeddingData = {
  groomName: "Nguyễn Văn Mẫu",
  brideName: "Trần Thị Mẫu",
  weddingDate: "Ngày 03 Tháng 06, 2036",
  aboutCouple:
    "Đây là lời giới thiệu mẫu về cặp đôi. Chúng tôi rất vui mừng được chia sẻ...",
  youtubeUrl: "https://www.youtube.com/watch?v=cpGxn9SmxTc",
  guestRsvpCount: 10, // Dữ liệu mẫu
  bankAccount: {
    // Dữ liệu mẫu
    bankBin: "970422",
    accountNumber: "1234567890",
  },
  loveStory: [
    {
      time: "Ngày đầu",
      title: "Gặp gỡ",
      content: "Đây là nội dung mẫu cho câu chuyện tình yêu.",
      image:
        "https://i1-ngoisao.vnecdn.net/2020/11/10/Copy-of-IMG-3266-7581-1604978306.jpg?w=1020&h=0&q=100&dpr=1&fit=crop&s=zcLhuW8yo_eVLGVjkXj5ZQ",
    },
    {
      time: "6 Tháng Sau",
      title: "Yêu nhau",
      content: "Đây là nội dung mẫu cho câu chuyện tình yêu.",
      image:
        "https://cdn.24h.com.vn/upload/2-2022/images/2022-06-09/xoainon1-1654737948-510-width660height824.jpg",
    },
  ],
  album: [
    "https://kenh14cdn.com/203336854389633024/2024/6/2/photo-7-1717318282976804803415.jpg",
    "https://s1.media.ngoisao.vn/resize_580/news/2023/02/11/xoai-non-va-xemesis-tung-bo-anh-valentine-dau-tien-ngot-nhu-mia-lui-1-ngoisaovn-w600-h901.jpeg",
    "https://media.yeah1.com/files/ngoctran/2023/05/19/347849210_1358945998287696_3397780704448075213_n-084529.jpg",
    "https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2020/11/16/854786/8-160484653489020906.jpg",
  ],
  events: [
    {
      name: "Lễ Thành Hôn",
      time: "18:00, Ngày 03.06.2036",
      venue: "Nhà Thờ Đức Bà Sài Gòn",
      address: "Số 1 Công xã Paris, Bến Nghé, Quận 1, TP.HCM",
      mapLink: "https://maps.app.goo.gl/your-map-link",
      image:
        "https://lh3.googleusercontent.com/gps-cs-s/AC9h4noFR1NQuJQ8wPp7bcQYxU1KpkZ2GLAO-_b01GPSGF-3VVasWu3tm93by7YMLzKzKtmTsy6HLWW0payy_EN99VrscFpPwQdG47BMAoDgN3Kxxb3-wO-8D6pZ0AU2CsiI9aPcYfxz=w243-h174-n-k-no-nu",
    },
    {
      name: "Tiệc Cưới",
      time: "19:00, Ngày 03.06.2036",
      venue: "GEM Center",
      address: "Số 8 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1, TP.HCM",
      mapLink: "https://maps.app.goo.gl/your-map-link-2",
      image:
        "https://lh3.googleusercontent.com/gps-cs-s/AC9h4noye45fPKw6sFv0AYjNhNJ5jld4KvDhBgQhVcCEW-_ox1j1nab8d-U9svNGtSjd-Utb6TMdZQ7fR8h8xl_MeQDzVfx9UDD5hYXeK02TtN2t_l1ExhUaOZdSEUWNfVcZKpy706-f=w243-h174-n-k-no-nu",
    },
  ],
  guestbookMessages: [
    { name: "Khách mời mẫu", message: "Chúc hai bạn hạnh phúc!" },
    { name: "Khách mời 2", message: "Chúc mừng hạnh phúc!" },
  ],
  slug: "sample-slug",
};

// @desc    Hiển thị trang preview cho một template
// @route   GET /inviletter/preview/:templateId
router.get("/preview/:templateId", (req, res) => {
  try {
    const { templateId } = req.params;
    const templateName = `template-${templateId}`;

    // Render template với dữ liệu mẫu (Đã sửa lại cấu trúc)
    res.render(templateName, { weddingData: sampleWeddingData });
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi máy chủ nội bộ");
  }
});

// Public route for shared guest list (no authentication required)
router.get("/guests/shared/:token", guestController.getSharedGuestList);

// @desc    Debug endpoint - Check guests data (MUST BE BEFORE /:slug)
// @route   GET /invitation/:slug/debug-guests
router.get("/invitation/:slug/debug-guests", async (req, res) => {
  try {
    const { slug } = req.params;

    const invitationLetter = await InvitationLetter.findOne({ slug });
    if (!invitationLetter) {
      return res.status(404).json({ message: "Không tìm thấy thiệp mời" });
    }

    const WeddingEvent = require("../models/WeddingEvent");
    const weddingEvent = await WeddingEvent.findOne({
      userId: invitationLetter.userId,
    });

    if (!weddingEvent) {
      return res.status(404).json({ message: "Không tìm thấy sự kiện cưới" });
    }

    const Guest = require("../models/Guest");
    const guests = await Guest.find({ weddingEventId: weddingEvent._id });

    return res.json({
      success: true,
      weddingEventId: weddingEvent._id,
      totalGuests: guests.length,
      guests: guests.map((g) => ({
        _id: g._id,
        name: g.name,
        email: g.email,
        group: g.group,
        attendanceStatus: g.attendanceStatus,
        confirmedViaInvitation: g.confirmedViaInvitation,
        invitationConfirmDate: g.invitationConfirmDate,
        invitationLetterId: g.invitationLetterId,
      })),
    });
  } catch (error) {
    console.error("Debug error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// @desc    RSVP endpoint - Khách xác nhận tham dự qua thiệp mời
// @route   POST /invitation/:slug/rsvp
router.post("/invitation/:slug/rsvp", async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ tên và email",
      });
    }

    // Find invitation letter
    const invitationLetter = await InvitationLetter.findOne({ slug });

    if (!invitationLetter) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thiệp mời",
      });
    }

    // Get WeddingEvent from userId
    const WeddingEvent = require("../models/WeddingEvent");

    const weddingEvent = await WeddingEvent.findOne({
      creatorId: invitationLetter.userId,
    });

    if (!weddingEvent) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sự kiện cưới",
      });
    }

    // Check if guest already exists
    const Guest = require("../models/Guest");
    let guest = await Guest.findOne({
      weddingEventId: weddingEvent._id,
      email: email.toLowerCase(),
    });

    if (guest) {
      // Update existing guest
      guest.attendanceStatus = "confirmed";
      guest.confirmedViaInvitation = true;
      guest.invitationConfirmDate = new Date();
      guest.invitationLetterId = invitationLetter._id;
      guest.responseDate = new Date();
      await guest.save();

      // Send push notification to wedding event creator
      const notificationController = require("../controllers/notificationController");
      await notificationController.createNotification({
        userId: weddingEvent.creatorId,
        weddingEventId: weddingEvent._id,
        type: "guest_confirmed",
        title: "🎉 Khách mời xác nhận tham dự!",
        message: `${name} đã xác nhận sẽ tham dự đám cưới của bạn qua thiệp mời online.`,
        data: {
          guestId: guest._id,
          guestName: name,
          guestEmail: email,
          newStatus: "confirmed",
        },
        priority: "high",
      });

      return res.status(200).json({
        success: true,
        message: "Cập nhật xác nhận tham dự thành công",
        data: { guest },
      });
    } else {
      // Create new guest
      guest = await Guest.create({
        weddingEventId: weddingEvent._id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        attendanceStatus: "confirmed",
        group: "both", // Default
        confirmedViaInvitation: true,
        invitationConfirmDate: new Date(),
        invitationLetterId: invitationLetter._id,
        responseDate: new Date(),
        invitationStatus: "opened",
      });

      // Increment RSVP count
      invitationLetter.guestRsvpCount =
        (invitationLetter.guestRsvpCount || 0) + 1;
      await invitationLetter.save();

      // Send push notification to wedding event creator
      const notificationController = require("../controllers/notificationController");
      await notificationController.createNotification({
        userId: weddingEvent.creatorId,
        weddingEventId: weddingEvent._id,
        type: "guest_confirmed",
        title: "🎉 Khách mời mới xác nhận tham dự!",
        message: `${name} đã xác nhận sẽ tham dự đám cưới của bạn qua thiệp mời online.`,
        data: {
          guestId: guest._id,
          guestName: name,
          guestEmail: email,
          newStatus: "confirmed",
        },
        priority: "high",
      });

      return res.status(201).json({
        success: true,
        message: "Xác nhận tham dự thành công",
        data: { guest },
      });
    }
  } catch (error) {
    console.error("RSVP error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xác nhận tham dự",
      error: error.message,
    });
  }
});

// @desc    Add wish/guestbook message
// @route   POST /invitation/:slug/add-wish
router.post("/invitation/:slug/add-wish", async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, message } = req.body;

    // Validate input
    if (!name || !message) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ tên và lời chúc",
      });
    }

    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Tên phải có từ 2-100 ký tự",
      });
    }

    if (message.trim().length < 10 || message.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: "Lời chúc phải có từ 10-500 ký tự",
      });
    }

    // Find invitation letter
    const invitationLetter = await InvitationLetter.findOne({ slug });
    if (!invitationLetter) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thiệp mời",
      });
    }

    // Add guestbook message
    invitationLetter.guestbookMessages.push({
      name: name.trim(),
      message: message.trim(),
    });

    await invitationLetter.save();

    return res.status(201).json({
      success: true,
      message: "Gửi lời chúc thành công",
      data: {
        name: name.trim(),
        message: message.trim(),
      },
    });
  } catch (error) {
    console.error("Add wish error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi gửi lời chúc",
      error: error.message,
    });
  }
});

// @desc    Hiển thị thiệp mời theo slug (MUST BE LAST - wildcard route)
// @route   GET /inviletter/:slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const invitationLetter = await InvitationLetter.findOne({ slug });

    if (!invitationLetter) {
      return res.status(404).render("404");
    }

    // --- BƯỚC QUAN TRỌNG: SỬA LẠI CẤU TRÚC DATA ---
    // File EJS của bạn cần một object phẳng, không phải object lồng nhau.
    // Chúng ta chỉ cần truyền thẳng các trường từ database.
    const weddingDataForRender = {
      groomName: invitationLetter.groomName,
      brideName: invitationLetter.brideName,
      weddingDate: invitationLetter.weddingDate,
      aboutCouple: invitationLetter.aboutCouple,
      youtubeUrl: invitationLetter.youtubeUrl,
      loveStory: invitationLetter.loveStory,
      album: invitationLetter.album,
      events: invitationLetter.events,
      guestbookMessages: invitationLetter.guestbookMessages,
      slug: invitationLetter.slug,

      // --- THÊM CÁC TRƯỜNG MỚI MÀ BẠN BỊ THIẾU ---
      guestRsvpCount: invitationLetter.guestRsvpCount,
      bankAccount: invitationLetter.bankAccount,
    };

    const templateName = `template-${invitationLetter.templateId}`;

    // Truyền object đã có cấu trúc đúng vào EJS
    res.render(templateName, { weddingData: weddingDataForRender });
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi máy chủ nội bộ");
  }
});

module.exports = router;
