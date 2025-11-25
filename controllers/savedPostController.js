const SavedPost = require("../models/SavedPost");
const Post = require("../models/Post");
const Album = require("../models/Album");
const mixpanel = require("../service/mixpanelServer");

// Lưu post
// POST /saved-posts
exports.savePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId, albumId, note } = req.body;

    if (!postId) {
      return res.status(400).json({
        message: "Thiếu thông tin post",
      });
    }

    // Kiểm tra post tồn tại
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Không tìm thấy bài viết",
      });
    }

    // Kiểm tra đã lưu chưa
    const existingSaved = await SavedPost.findOne({ userId, postId });
    if (existingSaved) {
      return res.status(400).json({
        message: "Bài viết đã được lưu",
      });
    }

    const savedPost = new SavedPost({
      userId,
      postId,
      albumId,
      note,
    });

    await savedPost.save();

    // Cập nhật totalSaves của post
    await Post.findByIdAndUpdate(postId, {
      $inc: { totalSaves: 1 },
    });

    mixpanel.track("Community - Save Post", {
      distinct_id: userId.toString(),
      postId: postId.toString(),
      hasAlbum: !!albumId,
    });

    res.status(201).json({
      message: "Lưu bài viết thành công!",
      savedPost,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lưu post:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Bỏ lưu post
// DELETE /saved-posts/:postId
exports.unsavePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    const savedPost = await SavedPost.findOne({ userId, postId });

    if (!savedPost) {
      return res.status(404).json({
        message: "Bài viết chưa được lưu",
      });
    }

    await SavedPost.findByIdAndDelete(savedPost._id);

    // Cập nhật totalSaves của post
    await Post.findByIdAndUpdate(postId, {
      $inc: { totalSaves: -1 },
    });

    mixpanel.track("Community - Unsave Post", {
      distinct_id: userId.toString(),
      postId: postId.toString(),
    });

    res.status(200).json({
      message: "Đã bỏ lưu bài viết",
    });
  } catch (error) {
    console.error("❌ Lỗi khi bỏ lưu post:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Lấy danh sách posts đã lưu
// GET /saved-posts?page=1&limit=10&albumId=xxx
exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { albumId } = req.query;

    let filter = { userId };
    if (albumId) {
      filter.albumId = albumId;
    }

    const savedPosts = await SavedPost.find(filter)
      .populate({
        path: "postId",
        populate: { path: "userId", select: "fullName picture email" },
      })
      .populate("albumId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SavedPost.countDocuments(filter);

    mixpanel.track("Community - View Saved Posts", {
      distinct_id: userId.toString(),
      page: page,
    });

    res.status(200).json({
      savedPosts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSavedPosts: total,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy saved posts:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Kiểm tra post đã được lưu chưa
// GET /saved-posts/check/:postId
exports.checkPostSaved = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    const savedPost = await SavedPost.findOne({ userId, postId });

    res.status(200).json({
      saved: !!savedPost,
      savedPost: savedPost || null,
    });
  } catch (error) {
    console.error("❌ Lỗi khi check saved post:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Cập nhật note hoặc album cho saved post
// PUT /saved-posts/:id
exports.updateSavedPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { albumId, note } = req.body;

    const savedPost = await SavedPost.findById(id);

    if (!savedPost) {
      return res.status(404).json({
        message: "Không tìm thấy saved post",
      });
    }

    if (savedPost.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền cập nhật",
      });
    }

    if (albumId !== undefined) savedPost.albumId = albumId;
    if (note !== undefined) savedPost.note = note;

    await savedPost.save();

    res.status(200).json({
      message: "Cập nhật thành công!",
      savedPost,
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật saved post:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

module.exports = exports;
