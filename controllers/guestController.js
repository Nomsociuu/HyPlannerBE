const Guest = require("../models/Guest");
const Table = require("../models/Table");
const WeddingEvent = require("../models/WeddingEvent");
const InvitationLetter = require("../models/InvitationLetter");
const mixpanel = require("../service/mixpanelServer");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Helper: Generate unique invitation link for guest
const generatePersonalInvitationLink = (guestId, weddingEventSlug) => {
  const token = crypto.randomBytes(16).toString("hex");
  return `${weddingEventSlug}?guest=${guestId}&token=${token}`;
};

// Tạo khách mời mới
// POST /guests/create
exports.createGuest = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      weddingEventId,
      name,
      phoneNumber,
      email,
      address,
      relationship,
      group,
      category,
      numberOfCompanions,
      dietaryRestrictions,
      notes,
      tags,
    } = req.body;

    // Validate input
    if (!name || !group) {
      return res.status(400).json({
        message: "Tên và nhóm khách (nhà trai/gái) là bắt buộc",
      });
    }

    // Verify wedding event belongs to user
    const weddingEvent = await WeddingEvent.findOne({
      _id: weddingEventId,
      userId: userId,
    });

    if (!weddingEvent) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện cưới hoặc bạn không có quyền truy cập",
      });
    }

    // Create guest
    const newGuest = new Guest({
      weddingEventId,
      name,
      phoneNumber,
      email,
      address,
      relationship,
      group,
      category,
      numberOfCompanions: numberOfCompanions || 0,
      dietaryRestrictions,
      notes,
      tags: tags || [],
    });

    await newGuest.save();

    // Track with Mixpanel
    mixpanel.track("Guest Management - Create Guest", {
      distinct_id: userId.toString(),
      guestId: newGuest._id.toString(),
      group: group,
      hasCompanions: numberOfCompanions > 0,
    });

    res.status(201).json({
      message: "Thêm khách mời thành công!",
      guest: newGuest,
    });
  } catch (error) {
    console.error("Error creating guest:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Lấy tất cả khách mời của một sự kiện cưới
// GET /guests/:weddingEventId
exports.getAllGuests = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weddingEventId } = req.params;
    const { group, attendanceStatus, relationship, tags } = req.query;

    // Verify wedding event
    const weddingEvent = await WeddingEvent.findOne({
      _id: weddingEventId,
      userId: userId,
    });

    if (!weddingEvent) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện cưới",
      });
    }

    // Build filter
    const filter = { weddingEventId, isActive: true };
    if (group) filter.group = group;
    if (attendanceStatus) filter.attendanceStatus = attendanceStatus;
    if (relationship) filter.relationship = relationship;

    // Filter by tags (support multiple tags separated by comma)
    if (tags) {
      const tagArray = tags.split(",").map((t) => t.trim());
      filter.tags = { $in: tagArray };
    }

    const guests = await Guest.find(filter).sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      total: guests.length,
      totalGuests: guests.reduce((sum, g) => sum + g.totalGuests, 0),
      confirmed: guests.filter((g) => g.attendanceStatus === "confirmed")
        .length,
      declined: guests.filter((g) => g.attendanceStatus === "declined").length,
      pending: guests.filter((g) => g.attendanceStatus === "pending").length,
      noResponse: guests.filter((g) => g.attendanceStatus === "no_response")
        .length,
      groomSide: guests.filter((g) => g.group === "groom").length,
      brideSide: guests.filter((g) => g.group === "bride").length,
      // Thống kê trạng thái thiệp mời
      invitationSent: guests.filter(
        (g) =>
          g.invitationStatus === "sent" ||
          g.invitationStatus === "delivered" ||
          g.invitationStatus === "opened"
      ).length,
      invitationNotSent: guests.filter((g) => g.invitationStatus === "not_sent")
        .length,
      invitationDelivered: guests.filter(
        (g) => g.invitationStatus === "delivered"
      ).length,
      invitationOpened: guests.filter((g) => g.invitationStatus === "opened")
        .length,
      // Thống kê tổng số khách thực tế (bao gồm người đi cùng)
      totalConfirmedGuests: guests
        .filter((g) => g.attendanceStatus === "confirmed")
        .reduce((sum, g) => sum + g.totalGuests, 0),
    };

    // Track with Mixpanel
    mixpanel.track("Guest Management - View Guest List", {
      distinct_id: userId.toString(),
      weddingEventId: weddingEventId,
      totalGuests: stats.total,
    });

    res.status(200).json({
      guests,
      stats,
    });
  } catch (error) {
    console.error("Error getting guests:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Cập nhật thông tin khách mời
// PUT /guests/:guestId
exports.updateGuest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { guestId } = req.params;
    const updateData = req.body;

    // Find guest
    const guest = await Guest.findById(guestId);
    if (!guest) {
      return res.status(404).json({
        message: "Không tìm thấy khách mời",
      });
    }

    // Verify ownership
    const weddingEvent = await WeddingEvent.findOne({
      _id: guest.weddingEventId,
      userId: userId,
    });

    if (!weddingEvent) {
      return res.status(403).json({
        message: "Bạn không có quyền chỉnh sửa khách mời này",
      });
    }

    // Update guest
    Object.assign(guest, updateData);
    await guest.save();

    // Track with Mixpanel
    mixpanel.track("Guest Management - Update Guest", {
      distinct_id: userId.toString(),
      guestId: guestId,
    });

    res.status(200).json({
      message: "Cập nhật khách mời thành công!",
      guest,
    });
  } catch (error) {
    console.error("Error updating guest:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Xóa khách mời (soft delete)
// DELETE /guests/:guestId
exports.deleteGuest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { guestId } = req.params;

    const guest = await Guest.findById(guestId);
    if (!guest) {
      return res.status(404).json({
        message: "Không tìm thấy khách mời",
      });
    }

    // Verify ownership
    const weddingEvent = await WeddingEvent.findOne({
      _id: guest.weddingEventId,
      userId: userId,
    });

    if (!weddingEvent) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa khách mời này",
      });
    }

    // Soft delete
    guest.isActive = false;
    await guest.save();

    // Track with Mixpanel
    mixpanel.track("Guest Management - Delete Guest", {
      distinct_id: userId.toString(),
      guestId: guestId,
    });

    res.status(200).json({
      message: "Xóa khách mời thành công!",
    });
  } catch (error) {
    console.error("Error deleting guest:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Cập nhật trạng thái tham dự
// PUT /guests/:guestId/attendance
exports.updateAttendanceStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { guestId } = req.params;
    const { attendanceStatus } = req.body;

    if (
      !["confirmed", "declined", "pending", "no_response"].includes(
        attendanceStatus
      )
    ) {
      return res.status(400).json({
        message: "Trạng thái không hợp lệ",
      });
    }

    const guest = await Guest.findById(guestId);
    if (!guest) {
      return res.status(404).json({
        message: "Không tìm thấy khách mời",
      });
    }

    // Verify ownership
    const weddingEvent = await WeddingEvent.findOne({
      _id: guest.weddingEventId,
      userId: userId,
    });

    if (!weddingEvent) {
      return res.status(403).json({
        message: "Bạn không có quyền cập nhật",
      });
    }

    guest.attendanceStatus = attendanceStatus;
    guest.responseDate = new Date();
    await guest.save();

    res.status(200).json({
      message: "Cập nhật trạng thái thành công!",
      guest,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Cập nhật quà mừng cưới
// PUT /guests/:guestId/gift
exports.updateGift = async (req, res) => {
  try {
    const userId = req.user._id;
    const { guestId } = req.params;
    const {
      type,
      amount,
      description,
      receivedDate,
      receivedMethod,
      returnedGift,
    } = req.body;

    const guest = await Guest.findById(guestId);
    if (!guest) {
      return res.status(404).json({
        message: "Không tìm thấy khách mời",
      });
    }

    // Verify ownership
    const weddingEvent = await WeddingEvent.findOne({
      _id: guest.weddingEventId,
      userId: userId,
    });

    if (!weddingEvent) {
      return res.status(403).json({
        message: "Bạn không có quyền cập nhật",
      });
    }

    guest.gift = {
      type: type || "none",
      amount: amount || 0,
      description: description || "",
      receivedDate: receivedDate || new Date(),
      receivedMethod: receivedMethod || "not_received",
      returnedGift: returnedGift || false,
    };

    await guest.save();

    // Track with Mixpanel
    mixpanel.track("Guest Management - Update Gift", {
      distinct_id: userId.toString(),
      guestId: guestId,
      giftType: type,
      receivedMethod: receivedMethod,
      returnedGift: returnedGift,
    });

    res.status(200).json({
      message: "Cập nhật quà mừng thành công!",
      guest,
    });
  } catch (error) {
    console.error("Error updating gift:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Gợi ý số bàn tiệc tự động
// GET /guests/:weddingEventId/table-suggestions
exports.getTableSuggestions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weddingEventId } = req.params;
    const { guestsPerTable = 10 } = req.query;

    // Verify wedding event
    const weddingEvent = await WeddingEvent.findOne({
      _id: weddingEventId,
      userId: userId,
    });

    if (!weddingEvent) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện cưới",
      });
    }

    // Get confirmed and pending guests
    const guests = await Guest.find({
      weddingEventId,
      isActive: true,
      attendanceStatus: { $in: ["confirmed", "pending"] },
    });

    const totalGuests = guests.reduce((sum, g) => sum + g.totalGuests, 0);
    const confirmedGuests = guests
      .filter((g) => g.attendanceStatus === "confirmed")
      .reduce((sum, g) => sum + g.totalGuests, 0);

    const seatsPerTable = parseInt(guestsPerTable);
    const requiredTables = Math.ceil(totalGuests / seatsPerTable);
    const confirmedTables = Math.ceil(confirmedGuests / seatsPerTable);
    const reserveTables = Math.ceil(requiredTables * 0.1); // 10% dự phòng

    res.status(200).json({
      totalGuests,
      confirmedGuests,
      seatsPerTable,
      requiredTables,
      confirmedTables,
      reserveTables,
      suggestedTables: requiredTables + reserveTables,
    });
  } catch (error) {
    console.error("Error getting table suggestions:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Import khách từ Excel/CSV (bulk create)
// POST /guests/import
exports.importGuests = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weddingEventId, guests } = req.body;

    // Verify wedding event
    const weddingEvent = await WeddingEvent.findOne({
      _id: weddingEventId,
      userId: userId,
    });

    if (!weddingEvent) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện cưới",
      });
    }

    if (!Array.isArray(guests) || guests.length === 0) {
      return res.status(400).json({
        message: "Danh sách khách không hợp lệ",
      });
    }

    // Add weddingEventId to each guest
    const guestsToInsert = guests.map((g) => ({
      ...g,
      weddingEventId,
    }));

    const insertedGuests = await Guest.insertMany(guestsToInsert);

    // Track with Mixpanel
    mixpanel.track("Guest Management - Import Guests", {
      distinct_id: userId.toString(),
      weddingEventId: weddingEventId,
      guestCount: insertedGuests.length,
    });

    res.status(201).json({
      message: `Import thành công ${insertedGuests.length} khách mời!`,
      guests: insertedGuests,
    });
  } catch (error) {
    console.error("Error importing guests:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Export danh sách khách (JSON format - FE sẽ convert sang Excel)
// GET /guests/:weddingEventId/export
exports.exportGuests = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weddingEventId } = req.params;

    // Verify wedding event
    const weddingEvent = await WeddingEvent.findOne({
      _id: weddingEventId,
      userId: userId,
    });

    if (!weddingEvent) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện cưới",
      });
    }

    const guests = await Guest.find({
      weddingEventId,
      isActive: true,
    }).select("-__v -createdAt -updatedAt");

    // Track with Mixpanel
    mixpanel.track("Guest Management - Export Guests", {
      distinct_id: userId.toString(),
      weddingEventId: weddingEventId,
      guestCount: guests.length,
    });

    res.status(200).json({
      guests,
    });
  } catch (error) {
    console.error("Error exporting guests:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Lấy gợi ý số lượng bàn tiệc
// GET /guests/:weddingEventId/table-suggestions
exports.getTableSuggestions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weddingEventId } = req.params;
    const { guestsPerTable = 10 } = req.query;

    // Verify wedding event
    const weddingEvent = await WeddingEvent.findOne({
      _id: weddingEventId,
      userId: userId,
    });

    if (!weddingEvent) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện cưới",
      });
    }

    // Get all active guests
    const guests = await Guest.find({
      weddingEventId,
      isActive: true,
    });

    // Tính tổng số khách (bao gồm người đi cùng)
    const totalGuests = guests.reduce((sum, g) => sum + g.totalGuests, 0);

    // Tính số khách đã xác nhận
    const confirmedGuests = guests
      .filter((g) => g.attendanceStatus === "confirmed")
      .reduce((sum, g) => sum + g.totalGuests, 0);

    // Tính số khách có khả năng tham dự (đã xác nhận + đang chờ)
    const potentialGuests = guests
      .filter(
        (g) =>
          g.attendanceStatus === "confirmed" || g.attendanceStatus === "pending"
      )
      .reduce((sum, g) => sum + g.totalGuests, 0);

    const seatsPerTable = parseInt(guestsPerTable);

    // Tính số bàn cần thiết dựa trên tổng số khách
    const requiredTables = Math.ceil(totalGuests / seatsPerTable);

    // Tính số bàn cho khách đã xác nhận
    const confirmedTables = Math.ceil(confirmedGuests / seatsPerTable);

    // Tính số bàn dự phòng (10-15% tổng số bàn, tối thiểu 1 bàn)
    const reserveTablesPercent = Math.ceil(confirmedTables * 0.15);
    const reserveTables = Math.max(1, reserveTablesPercent);

    // Tổng số bàn gợi ý
    const suggestedTables = confirmedTables + reserveTables;

    // Tính số bàn cho khách tiềm năng (đã xác nhận + đang chờ)
    const potentialTables = Math.ceil(potentialGuests / seatsPerTable);

    // Tính tỷ lệ xác nhận
    const confirmationRate =
      totalGuests > 0
        ? ((confirmedGuests / totalGuests) * 100).toFixed(1)
        : "0";

    // Track with Mixpanel
    mixpanel.track("Guest Management - View Table Suggestions", {
      distinct_id: userId.toString(),
      weddingEventId: weddingEventId,
      totalGuests,
      confirmedGuests,
      suggestedTables,
    });

    res.status(200).json({
      totalGuests,
      confirmedGuests,
      potentialGuests,
      seatsPerTable,
      requiredTables,
      confirmedTables,
      potentialTables,
      reserveTables,
      suggestedTables,
      confirmationRate: parseFloat(confirmationRate),
      recommendations: {
        minimum: confirmedTables,
        recommended: suggestedTables,
        maximum: potentialTables + reserveTables,
      },
      breakdown: {
        confirmedGuests,
        pendingGuests: potentialGuests - confirmedGuests,
        declinedGuests: guests
          .filter((g) => g.attendanceStatus === "declined")
          .reduce((sum, g) => sum + g.totalGuests, 0),
      },
    });
  } catch (error) {
    console.error("Error getting table suggestions:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Lấy danh sách tags phổ biến
// GET /guests/:weddingEventId/popular-tags
exports.getPopularTags = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weddingEventId } = req.params;

    // Verify wedding event
    const weddingEvent = await WeddingEvent.findOne({
      _id: weddingEventId,
      userId: userId,
    });

    if (!weddingEvent) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện cười",
      });
    }

    // Get all tags from guests and count frequency
    const guests = await Guest.find({
      weddingEventId,
      isActive: true,
      tags: { $exists: true, $ne: [] },
    });

    // Count tag frequency
    const tagFrequency = {};
    guests.forEach((guest) => {
      if (guest.tags && guest.tags.length > 0) {
        guest.tags.forEach((tag) => {
          if (tag) {
            tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
          }
        });
      }
    });

    // Convert to array and sort by frequency
    const popularTags = Object.entries(tagFrequency)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 tags

    // Predefined common tags
    const commonTags = [
      "VIP",
      "Ăn chay",
      "Gia đình gần",
      "Bạn thân",
      "Khách quý",
      "Cần chăm sóc đặc biệt",
      "Không ăn hải sản",
      "Ngồi bàn VIP",
      "Có trẻ nhỏ",
      "Người cao tuổi",
      "Đồng nghiệp",
      "Bạn học",
      "Hàng xóm",
      "Người thân xa",
    ];

    res.status(200).json({
      popularTags,
      commonTags,
      totalUniqueTags: Object.keys(tagFrequency).length,
    });
  } catch (error) {
    console.error("Error getting popular tags:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Cập nhật trạng thái thiệp mời từ wedding hub
// POST /guests/:guestId/update-invitation-status
exports.updateInvitationStatusFromHub = async (req, res) => {
  try {
    const { guestId } = req.params;
    const { invitationStatus, attendanceStatus, responseMessage } = req.body;

    // Find guest
    const guest = await Guest.findById(guestId);
    if (!guest) {
      return res.status(404).json({
        message: "Không tìm thấy khách mời",
      });
    }

    // Update invitation status if provided
    if (invitationStatus) {
      guest.invitationStatus = invitationStatus;
      if (invitationStatus === "opened" && !guest.invitationSentDate) {
        guest.invitationSentDate = new Date();
      }
    }

    // Update attendance status if guest responded
    if (attendanceStatus) {
      guest.attendanceStatus = attendanceStatus;
      guest.responseDate = new Date();

      // Add response to notes if provided
      if (responseMessage) {
        const notePrefix = guest.notes ? guest.notes + "\n\n" : "";
        guest.notes =
          notePrefix +
          `Phản hồi: ${responseMessage} (${new Date().toLocaleString(
            "vi-VN"
          )})`;
      }
    }

    await guest.save();

    // Track with Mixpanel
    mixpanel.track("Guest Management - Invitation Status Updated from Hub", {
      distinct_id: guest.weddingEventId.toString(),
      guestId: guestId,
      invitationStatus,
      attendanceStatus,
    });

    res.status(200).json({
      message: "Cập nhật trạng thái thành công!",
      guest,
    });
  } catch (error) {
    console.error("Error updating invitation status:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Tạo/Cập nhật link thiệp mời cá nhân cho khách
// POST /guests/:weddingEventId/generate-invitation-links
exports.generateInvitationLinks = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weddingEventId } = req.params;

    // Verify wedding event
    const weddingEvent = await WeddingEvent.findOne({
      _id: weddingEventId,
      userId: userId,
    });

    if (!weddingEvent) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện cưới",
      });
    }

    // Find invitation letter for this wedding event
    const invitationLetter = await InvitationLetter.findOne({ userId });

    if (!invitationLetter) {
      return res.status(404).json({
        message: "Chưa tạo thiệp mời điện tử. Vui lòng tạo thiệp mời trước.",
      });
    }

    // Get all active guests
    const guests = await Guest.find({
      weddingEventId,
      isActive: true,
    });

    let updatedCount = 0;

    // Generate personal links for each guest
    for (const guest of guests) {
      if (!guest.personalInvitationLink) {
        guest.personalInvitationLink = generatePersonalInvitationLink(
          guest._id,
          invitationLetter.slug
        );
        guest.invitationLetterId = invitationLetter._id;
        await guest.save();
        updatedCount++;
      }
    }

    // Track with Mixpanel
    mixpanel.track("Guest Management - Generated Invitation Links", {
      distinct_id: userId.toString(),
      weddingEventId: weddingEventId,
      totalGuests: guests.length,
      updatedCount,
    });

    res.status(200).json({
      message: `Đã tạo link thiệp mời cho ${updatedCount} khách`,
      totalGuests: guests.length,
      updatedCount,
      invitationBaseUrl: `${req.protocol}://${req.get("host")}/inviletter/${
        invitationLetter.slug
      }`,
    });
  } catch (error) {
    console.error("Error generating invitation links:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Xuất danh sách khách ra PDF
// GET /guests/:weddingEventId/export-pdf
exports.exportGuestListPDF = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weddingEventId } = req.params;

    // Verify wedding event
    const weddingEvent = await WeddingEvent.findOne({
      _id: weddingEventId,
      userId: userId,
    });

    if (!weddingEvent) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện cưới",
      });
    }

    // Get all guests
    const guests = await Guest.find({
      weddingEventId,
      isActive: true,
    }).sort({ group: 1, name: 1 });

    // Prepare data for PDF
    const pdfData = {
      title: `Danh sách khách mời - ${weddingEvent.groomName || "Chú rể"} & ${
        weddingEvent.brideName || "Cô dâu"
      }`,
      weddingDate: weddingEvent.weddingDate,
      totalGuests: guests.reduce((sum, g) => sum + g.totalGuests, 0),
      totalInvited: guests.length,
      confirmed: guests.filter((g) => g.attendanceStatus === "confirmed")
        .length,
      pending: guests.filter((g) => g.attendanceStatus === "pending").length,
      declined: guests.filter((g) => g.attendanceStatus === "declined").length,
      guests: guests.map((g, index) => ({
        stt: index + 1,
        name: g.name,
        phoneNumber: g.phoneNumber || "",
        group:
          g.group === "groom"
            ? "Nhà trai"
            : g.group === "bride"
            ? "Nhà gái"
            : "Chung",
        relationship: g.relationship,
        totalGuests: g.totalGuests,
        attendanceStatus: g.attendanceStatus,
        tableNumber: g.tableNumber || "",
        dietaryRestrictions: g.dietaryRestrictions || "",
        notes: g.notes || "",
        tags: g.tags || [],
      })),
      generatedAt: new Date().toISOString(),
    };

    // Track with Mixpanel
    mixpanel.track("Guest Management - Export PDF", {
      distinct_id: userId.toString(),
      weddingEventId: weddingEventId,
      totalGuests: guests.length,
    });

    // Return data (Frontend will generate PDF using a library like react-native-pdf)
    res.status(200).json(pdfData);
  } catch (error) {
    console.error("Error exporting PDF:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Tầo link chia sẽ danh sách khách
// POST /guests/:weddingEventId/create-share-link
exports.createShareLink = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weddingEventId } = req.params;
    const { expiresInDays = 30, permissions = "view" } = req.body;

    // Verify wedding event
    const weddingEvent = await WeddingEvent.findOne({
      _id: weddingEventId,
      userId: userId,
    });

    if (!weddingEvent) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện cười",
      });
    }

    // Generate unique share token
    const shareToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Update wedding event with share link info
    if (!weddingEvent.shareLinks) {
      weddingEvent.shareLinks = [];
    }

    weddingEvent.shareLinks.push({
      token: shareToken,
      permissions, // 'view' or 'edit'
      createdAt: new Date(),
      expiresAt,
      isActive: true,
    });

    await weddingEvent.save();

    const shareUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/guests/shared/${shareToken}`;

    // Track with Mixpanel
    mixpanel.track("Guest Management - Create Share Link", {
      distinct_id: userId.toString(),
      weddingEventId: weddingEventId,
      permissions,
      expiresInDays,
    });

    res.status(201).json({
      message: "Tạo link chia sẽ thành công!",
      shareUrl,
      token: shareToken,
      expiresAt,
      permissions,
    });
  } catch (error) {
    console.error("Error creating share link:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Lấy danh sách khách qua link chia sẽ (public)
// GET /guests/shared/:token
exports.getSharedGuestList = async (req, res) => {
  try {
    const { token } = req.params;

    // Find wedding event with this share token
    const weddingEvent = await WeddingEvent.findOne({
      "shareLinks.token": token,
      "shareLinks.isActive": true,
    });

    if (!weddingEvent) {
      return res.status(404).json({
        message: "Link chia sẽ không hợp lệ hoặc đã hết hạn",
      });
    }

    // Find the specific share link
    const shareLink = weddingEvent.shareLinks.find(
      (link) => link.token === token && link.isActive
    );

    if (!shareLink) {
      return res.status(404).json({
        message: "Link chia sẽ không tìm thấy",
      });
    }

    // Check if expired
    if (new Date() > new Date(shareLink.expiresAt)) {
      return res.status(410).json({
        message: "Link chia sẽ đã hết hạn",
      });
    }

    // Get guests
    const guests = await Guest.find({
      weddingEventId: weddingEvent._id,
      isActive: true,
    }).sort({ group: 1, name: 1 });

    // Calculate stats
    const stats = {
      total: guests.length,
      totalGuests: guests.reduce((sum, g) => sum + g.totalGuests, 0),
      confirmed: guests.filter((g) => g.attendanceStatus === "confirmed")
        .length,
      pending: guests.filter((g) => g.attendanceStatus === "pending").length,
      declined: guests.filter((g) => g.attendanceStatus === "declined").length,
    };

    res.status(200).json({
      weddingEvent: {
        groomName: weddingEvent.groomName,
        brideName: weddingEvent.brideName,
        weddingDate: weddingEvent.weddingDate,
      },
      guests,
      stats,
      permissions: shareLink.permissions,
      expiresAt: shareLink.expiresAt,
    });
  } catch (error) {
    console.error("Error getting shared guest list:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Gửi email cảm ơn đến khách đã tham dự
// POST /guests/:weddingEventId/send-thank-you
exports.sendThankYouEmails = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weddingEventId } = req.params;
    const { message, guestIds } = req.body;

    // Verify wedding event
    const weddingEvent = await WeddingEvent.findOne({
      _id: weddingEventId,
      userId: userId,
    });

    if (!weddingEvent) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện cưới",
      });
    }

    // Get guests to send thank you
    let guests;
    if (guestIds && guestIds.length > 0) {
      // Send to specific guests
      guests = await Guest.find({
        _id: { $in: guestIds },
        weddingEventId,
        isActive: true,
      });
    } else {
      // Send to all attended guests
      guests = await Guest.find({
        weddingEventId,
        isActive: true,
        $or: [{ checkedIn: true }, { attendanceStatus: "confirmed" }],
        email: { $exists: true, $ne: "" },
      });
    }

    if (guests.length === 0) {
      return res.status(400).json({
        message: "Không có khách nào để gửi email",
      });
    }

    // Prepare email data and send emails
    const emailsToSend = [];
    const emailsSent = [];
    const emailsFailed = [];

    for (const guest of guests) {
      if (!guest.email) continue;

      const emailData = {
        to: guest.email,
        name: guest.name,
        subject: `Cảm ơn ${guest.name} đã tham dự đám cưới`,
        message:
          message ||
          `Chân thành cảm ơn ${guest.name} đã dành thời gian tham dự ngày trọng đại của chúng tôi!`,
      };

      emailsToSend.push(emailData);

      // Actually send email
      try {
        await sendEmail({
          email: guest.email,
          subject: emailData.subject,
          message: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff6b9d;">Xin chân thành cảm ơn</h2>
              <p>Kính gửi ${guest.name},</p>
              <p>${emailData.message}</p>
              <p>Sự hiện diện của bạn đã làm cho ngày đặc biệt của chúng tôi thêm phần ý nghĩa.</p>
              <br>
              <p>Trân trọng,</p>
              <p><strong>${weddingEvent.groomName || "Chú rể"} & ${
            weddingEvent.brideName || "Cô dâu"
          }</strong></p>
            </div>
          `,
        });
        emailsSent.push(emailData);
      } catch (emailError) {
        console.error(`Failed to send email to ${guest.email}:`, emailError);
        emailsFailed.push({ ...emailData, error: emailError.message });
      }
    }

    // Track with Mixpanel
    mixpanel.track("Guest Management - Send Thank You Emails", {
      distinct_id: userId.toString(),
      weddingEventId: weddingEventId,
      recipientCount: emailsSent.length,
      failedCount: emailsFailed.length,
    });

    res.status(200).json({
      message: `Đã gửi email thành công cho ${emailsSent.length}/${emailsToSend.length} khách`,
      recipients: emailsSent.length,
      total: emailsToSend.length,
      failed: emailsFailed.length,
      emails: emailsSent,
    });
  } catch (error) {
    console.error("Error sending thank you emails:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Lấy danh sách thông báo
// GET /guests/:weddingEventId/notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weddingEventId } = req.params;

    // Verify wedding event
    const weddingEvent = await WeddingEvent.findOne({
      _id: weddingEventId,
      userId: userId,
    });

    if (!weddingEvent) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện cưới",
      });
    }

    const notifications = [];
    const today = new Date();
    const weddingDate = new Date(weddingEvent.weddingDate);
    const daysUntilWedding = Math.ceil(
      (weddingDate - today) / (1000 * 60 * 60 * 24)
    );

    // Get all guests
    const guests = await Guest.find({
      weddingEventId,
      isActive: true,
    });

    const totalGuests = guests.length;
    const pendingGuests = guests.filter(
      (g) => g.attendanceStatus === "pending"
    ).length;
    const confirmedGuests = guests.filter(
      (g) => g.attendanceStatus === "confirmed"
    ).length;
    const recentResponses = guests.filter((g) => {
      if (!g.responseDate) return false;
      const daysSinceResponse = Math.ceil(
        (today - new Date(g.responseDate)) / (1000 * 60 * 60 * 24)
      );
      return daysSinceResponse <= 7;
    });

    // 1. Nhắc nhở chốt bàn (7 ngày trước đám cưới)
    if (daysUntilWedding <= 7 && daysUntilWedding > 0 && pendingGuests > 0) {
      notifications.push({
        type: "table_reminder",
        priority: "high",
        title: "Nhắc nhở chốt bàn",
        message: `Còn ${daysUntilWedding} ngày nữa đến đám cưới. Bạn có ${pendingGuests} khách chưa phản hồi. Hãy xác nhận số bàn để đặt tiệc!`,
        actionText: "Xem danh sách",
        data: {
          pendingCount: pendingGuests,
          daysLeft: daysUntilWedding,
        },
      });
    }

    // 2. Thông báo khách phản hồi (7 ngày gần đây)
    if (recentResponses.length > 0) {
      notifications.push({
        type: "guest_response",
        priority: "medium",
        title: "Khách mời đã phản hồi",
        message: `${recentResponses.length} khách mời vừa xác nhận tham dự trong 7 ngày qua.`,
        actionText: "Xem chi tiết",
        data: {
          recentCount: recentResponses.length,
          guests: recentResponses.slice(0, 5).map((g) => ({
            name: g.name,
            status: g.attendanceStatus,
            responseDate: g.responseDate,
          })),
        },
      });
    }

    // 3. Gợi ý gửi lời cảm ơn (sau đám cưới 1-3 ngày)
    if (daysUntilWedding < 0 && daysUntilWedding >= -3) {
      const attendedGuests = guests.filter(
        (g) => g.checkedIn || g.attendanceStatus === "confirmed"
      ).length;
      notifications.push({
        type: "thank_you_reminder",
        priority: "low",
        title: "Gửi lời cảm ơn",
        message: `Đã ${Math.abs(
          daysUntilWedding
        )} ngày kể từ đám cưới. Hãy gửi lời cảm ơn đến ${attendedGuests} khách đã tham dự!`,
        actionText: "Soạn tin nhắn",
        data: {
          attendedCount: attendedGuests,
          daysSinceWedding: Math.abs(daysUntilWedding),
        },
      });
    }

    // 4. Cảnh báo số lượng khách thấp (30 ngày trước)
    if (daysUntilWedding <= 30 && daysUntilWedding > 7) {
      const confirmationRate =
        totalGuests > 0
          ? ((confirmedGuests / totalGuests) * 100).toFixed(1)
          : 0;
      if (confirmationRate < 50) {
        notifications.push({
          type: "low_confirmation",
          priority: "medium",
          title: "Tỷ lệ xác nhận thấp",
          message: `Chỉ có ${confirmationRate}% khách đã xác nhận tham dự. Hãy nhắc nhở khách mời!`,
          actionText: "Gửi nhắc nhở",
          data: {
            confirmationRate: parseFloat(confirmationRate),
            confirmedCount: confirmedGuests,
            totalCount: totalGuests,
          },
        });
      }
    }

    res.status(200).json({
      notifications,
      stats: {
        total: totalGuests,
        confirmed: confirmedGuests,
        pending: pendingGuests,
        daysUntilWedding,
      },
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};
