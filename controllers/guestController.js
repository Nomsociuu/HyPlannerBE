const Guest = require("../models/Guest");
const Table = require("../models/Table");
const WeddingEvent = require("../models/WeddingEvent");
const mixpanel = require("../service/mixpanelServer");

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
    const { group, attendanceStatus, relationship } = req.query;

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

    const guests = await Guest.find(filter).sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      total: guests.length,
      totalGuests: guests.reduce((sum, g) => sum + g.totalGuests, 0),
      confirmed: guests.filter((g) => g.attendanceStatus === "confirmed")
        .length,
      declined: guests.filter((g) => g.attendanceStatus === "declined").length,
      pending: guests.filter((g) => g.attendanceStatus === "pending").length,
      groomSide: guests.filter((g) => g.group === "groom").length,
      brideSide: guests.filter((g) => g.group === "bride").length,
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
