const Rating = require("../models/Rating");
const Post = require("../models/Post");
const Album = require("../models/Album");
const UserSelection = require("../models/UserSelection");
const mixpanel = require("../service/mixpanelServer");

// Tạo hoặc cập nhật rating
// POST /ratings
exports.createOrUpdateRating = async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetId, targetType, rating, review } = req.body;

    if (!targetId || !targetType || !rating) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating phải từ 1 đến 5",
      });
    }

    // Kiểm tra đã rating chưa
    let existingRating = await Rating.findOne({ userId, targetId, targetType });

    if (existingRating) {
      // Cập nhật rating
      const oldRating = existingRating.rating;
      existingRating.rating = rating;
      existingRating.review = review || existingRating.review;
      await existingRating.save();

      await updateAverageRating(targetId, targetType);

      mixpanel.track("Community - Update Rating", {
        distinct_id: userId.toString(),
        targetId: targetId.toString(),
        targetType,
        rating,
        oldRating,
      });

      return res.status(200).json({
        message: "Cập nhật đánh giá thành công!",
        rating: existingRating,
      });
    }

    // Tạo rating mới
    const newRating = new Rating({
      userId,
      targetId,
      targetType,
      rating,
      review,
    });

    await newRating.save();
    await updateAverageRating(targetId, targetType);

    mixpanel.track("Community - Create Rating", {
      distinct_id: userId.toString(),
      targetId: targetId.toString(),
      targetType,
      rating,
    });

    res.status(201).json({
      message: "Đánh giá thành công!",
      rating: newRating,
    });
  } catch (error) {
    console.error("❌ Lỗi khi rating:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Lấy ratings của một item
// GET /ratings/:targetType/:targetId
exports.getRatings = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const ratings = await Rating.find({ targetId, targetType })
      .populate("userId", "fullName picture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Rating.countDocuments({ targetId, targetType });

    // Tính average rating
    const ratingStats = await Rating.aggregate([
      {
        $match: {
          targetId: require("mongoose").Types.ObjectId(targetId),
          targetType,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      ratings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRatings: total,
      averageRating: ratingStats.length > 0 ? ratingStats[0].averageRating : 0,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy ratings:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Lấy rating của user cho một item
// GET /ratings/:targetType/:targetId/my-rating
exports.getMyRating = async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetType, targetId } = req.params;

    const rating = await Rating.findOne({ userId, targetId, targetType });

    res.status(200).json({
      rated: !!rating,
      rating: rating || null,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy my rating:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Xóa rating
// DELETE /ratings/:ratingId
exports.deleteRating = async (req, res) => {
  try {
    const userId = req.user._id;
    const { ratingId } = req.params;

    const rating = await Rating.findById(ratingId);

    if (!rating) {
      return res.status(404).json({
        message: "Không tìm thấy rating",
      });
    }

    // Chỉ người tạo mới được xóa
    if (rating.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa rating này",
      });
    }

    const targetId = rating.targetId;
    const targetType = rating.targetType;

    await Rating.findByIdAndDelete(ratingId);
    await updateAverageRating(targetId, targetType);

    mixpanel.track("Community - Delete Rating", {
      distinct_id: userId.toString(),
      ratingId,
    });

    res.status(200).json({
      message: "Xóa đánh giá thành công!",
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa rating:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Helper function để cập nhật average rating
async function updateAverageRating(targetId, targetType) {
  const ratingStats = await Rating.aggregate([
    {
      $match: {
        targetId: require("mongoose").Types.ObjectId(targetId),
        targetType,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  const avgRating = ratingStats.length > 0 ? ratingStats[0].averageRating : 0;

  let Model;
  switch (targetType) {
    case "Post":
      Model = Post;
      break;
    case "Album":
      Model = Album;
      break;
    case "UserSelection":
      Model = UserSelection;
      break;
    default:
      return;
  }

  await Model.findByIdAndUpdate(targetId, {
    averageRating: avgRating,
  });
}

module.exports = exports;
