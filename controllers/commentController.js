const Comment = require("../models/Comment");
const Post = require("../models/Post");
const WeddingEvent = require("../models/WeddingEvent");
const notificationController = require("./notificationController");
const mixpanel = require("../service/mixpanelServer");

// Tạo comment mới
// POST /comments/create
exports.createComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId, content, parentCommentId } = req.body;

    // Validate input
    if (!postId || !content || content.trim() === "") {
      return res.status(400).json({
        message: "Vui lòng cung cấp đủ thông tin",
      });
    }

    // Kiểm tra post tồn tại
    const post = await Post.findOne({ _id: postId, isActive: true });
    if (!post) {
      return res.status(404).json({
        message: "Không tìm thấy bài viết",
      });
    }

    // Nếu là reply, kiểm tra parent comment tồn tại
    if (parentCommentId) {
      const parentComment = await Comment.findOne({
        _id: parentCommentId,
        postId,
        isActive: true,
      });

      if (!parentComment) {
        return res.status(404).json({
          message: "Không tìm thấy comment gốc",
        });
      }
    }

    // Tạo comment mới
    const newComment = new Comment({
      postId,
      userId,
      content,
      parentCommentId: parentCommentId || null,
    });

    await newComment.save();
    await newComment.populate("userId", "fullName picture email");

    // Cập nhật số lượng comment trong post
    // Cả root comment và reply đều cần tăng totalComments của post
    post.totalComments += 1;
    await post.save();

    // Nếu là reply, cũng cần tăng totalReplies của parent comment
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $inc: { totalReplies: 1 },
      });
    }

    // Track với Mixpanel
    mixpanel.track("Community - Create Comment", {
      distinct_id: userId.toString(),
      postId: postId,
      commentId: newComment._id.toString(),
      isReply: !!parentCommentId,
      contentLength: content.length,
    });

    // Tạo notification cho chủ post (nếu không phải tự comment)
    if (post.userId.toString() !== userId.toString()) {
      try {
        const userWeddingEvent = await WeddingEvent.findOne({
          member: post.userId,
        });

        if (userWeddingEvent) {
          const commenter = req.user;
          await notificationController.createNotification({
            userId: post.userId,
            weddingEventId: userWeddingEvent._id,
            type: "post_commented",
            title: "💬 Bình luận mới",
            message: `${
              commenter.fullName || "Một người"
            } đã bình luận vào bài viết của bạn: "${content.substring(0, 50)}${
              content.length > 50 ? "..." : ""
            }"`,
            data: {
              postId: post._id,
              postTitle: post.content.substring(0, 50) + "...",
            },
            priority: "low",
          });
        }
      } catch (error) {
        console.error("Error creating comment notification:", error);
      }
    }

    res.status(201).json({
      message: "Comment thành công!",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Lấy tất cả comments của một post (chỉ root comments)
// GET /comments/post/:postId?page=1&limit=20
exports.getCommentsByPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      postId,
      parentCommentId: null,
      isActive: true,
    })
      .populate("userId", "fullName picture email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({
      postId,
      parentCommentId: null,
      isActive: true,
    });

    // Track với Mixpanel
    if (req.user) {
      mixpanel.track("Community - View Comments", {
        distinct_id: req.user._id.toString(),
        postId: postId,
        page: page,
        totalComments: total,
      });
    }

    res.status(200).json({
      comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalComments: total,
        limit,
      },
    });
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Lấy tất cả replies của một comment
// GET /comments/:commentId/replies?page=1&limit=10
exports.getRepliesByComment = async (req, res) => {
  try {
    const parentCommentId = req.params.commentId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const replies = await Comment.find({
      parentCommentId,
      isActive: true,
    })
      .populate("userId", "fullName picture email")
      .sort({ createdAt: 1 }) // Replies thường sort tăng dần
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({
      parentCommentId,
      isActive: true,
    });

    res.status(200).json({
      replies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReplies: total,
        limit,
      },
    });
  } catch (error) {
    console.error("Error getting replies:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Cập nhật comment
// PUT /comments/:id
exports.updateComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id;
    const { content } = req.body;

    // Validate
    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Nội dung không được để trống",
      });
    }

    // Tìm comment
    const comment = await Comment.findOne({ _id: commentId, isActive: true });

    if (!comment) {
      return res.status(404).json({
        message: "Không tìm thấy comment",
      });
    }

    // Kiểm tra quyền sở hữu
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền chỉnh sửa comment này",
      });
    }

    // Cập nhật
    comment.content = content;
    await comment.save();
    await comment.populate("userId", "fullName picture email");

    // Track với Mixpanel
    mixpanel.track("Community - Update Comment", {
      distinct_id: userId.toString(),
      commentId: commentId,
      postId: comment.postId.toString(),
      isReply: !!comment.parentCommentId,
    });

    res.status(200).json({
      message: "Cập nhật comment thành công",
      comment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Xóa comment (soft delete)
// DELETE /comments/:id
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id;

    // Tìm comment
    const comment = await Comment.findOne({ _id: commentId, isActive: true });

    if (!comment) {
      return res.status(404).json({
        message: "Không tìm thấy comment",
      });
    }

    // Kiểm tra quyền sở hữu
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa comment này",
      });
    }

    // Soft delete comment và tất cả replies
    comment.isActive = false;
    await comment.save();

    // Xóa tất cả replies nếu là root comment
    if (!comment.parentCommentId) {
      // Đếm số replies thực tế bị xóa
      const deletedRepliesCount = await Comment.countDocuments({
        parentCommentId: commentId,
        isActive: true,
      });

      await Comment.updateMany(
        { parentCommentId: commentId },
        { isActive: false }
      );

      // Giảm số lượng comment trong post (1 root comment + tất cả replies)
      await Post.findByIdAndUpdate(comment.postId, {
        $inc: { totalComments: -(1 + deletedRepliesCount) },
      });
    } else {
      // Giảm số lượng reply trong parent comment
      await Comment.findByIdAndUpdate(comment.parentCommentId, {
        $inc: { totalReplies: -1 },
      });

      // Giảm totalComments trong post cho reply
      await Post.findByIdAndUpdate(comment.postId, {
        $inc: { totalComments: -1 },
      });
    }

    // Track với Mixpanel
    mixpanel.track("Community - Delete Comment", {
      distinct_id: userId.toString(),
      commentId: commentId,
      postId: comment.postId.toString(),
      isReply: !!comment.parentCommentId,
      hadReplies: comment.totalReplies > 0,
      totalReplies: comment.totalReplies,
    });

    res.status(200).json({
      message: "Xóa comment thành công",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Thả reaction vào comment
// POST /comments/:id/react
exports.reactToComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id;
    const { type } = req.body; // type: 'like' hoặc 'love'

    // 1. Validate
    if (!["like", "love"].includes(type)) {
      return res.status(400).json({
        message: "Loại reaction không hợp lệ. Chỉ chấp nhận 'like' hoặc 'love'",
      });
    }

    const comment = await Comment.findOne({ _id: commentId, isActive: true });

    if (!comment) {
      return res.status(404).json({
        message: "Không tìm thấy comment",
      });
    }

    // 2. Xử lý Logic Like/Love
    const hasLiked = comment.reactions.like.includes(userId);
    const hasLoved = comment.reactions.love.includes(userId);

    if (type === "like" && hasLiked) {
      // Đã like rồi -> Bỏ like
      comment.reactions.like = comment.reactions.like.filter(
        (id) => id.toString() !== userId.toString()
      );
      comment.totalReactions = Math.max(0, comment.totalReactions - 1);
    } else if (type === "like" && hasLoved) {
      // Đang love -> Chuyển sang like
      comment.reactions.love = comment.reactions.love.filter(
        (id) => id.toString() !== userId.toString()
      );
      comment.reactions.like.push(userId);
    } else if (type === "like" && !hasLiked) {
      // Chưa like -> Thêm like
      comment.reactions.like.push(userId);
      comment.totalReactions += 1;
    } else if (type === "love" && hasLoved) {
      // Đã love rồi -> Bỏ love
      comment.reactions.love = comment.reactions.love.filter(
        (id) => id.toString() !== userId.toString()
      );
      comment.totalReactions = Math.max(0, comment.totalReactions - 1);
    } else if (type === "love" && hasLiked) {
      // Đang like -> Chuyển sang love
      comment.reactions.like = comment.reactions.like.filter(
        (id) => id.toString() !== userId.toString()
      );
      comment.reactions.love.push(userId);
    } else if (type === "love" && !hasLoved) {
      // Chưa love -> Thêm love
      comment.reactions.love.push(userId);
      comment.totalReactions += 1;
    }

    await comment.save();

    // === 🔥 QUAN TRỌNG: Populate thông tin người dùng ===
    // Nếu không có dòng này, tên và avatar người comment sẽ bị mất trên UI sau khi react
    await comment.populate("userId", "fullName picture email");

    // 3. Track Mixpanel
    const action =
      (type === "like" && hasLiked) || (type === "love" && hasLoved)
        ? "Remove Reaction"
        : (type === "like" && hasLoved) || (type === "love" && hasLiked)
        ? "Change Reaction"
        : "Add Reaction";

    mixpanel.track("Community - React to Comment", {
      distinct_id: userId.toString(),
      commentId: commentId,
      reactionType: type,
      action: action,
      isReply: !!comment.parentCommentId,
    });

    // === 🔥 QUAN TRỌNG: Trả về nguyên object comment ===
    res.status(200).json({
      message: "React thành công",
      comment: comment, // <--- Redux cần cái này để cập nhật state
    });
  } catch (error) {
    console.error("Error reacting to comment:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Bỏ react khỏi comment
// DELETE /comments/:id/react
exports.unreactToComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id;

    const comment = await Comment.findOne({ _id: commentId, isActive: true });

    if (!comment) {
      return res.status(404).json({
        message: "Không tìm thấy comment",
      });
    }

    // 1. Xử lý Logic Xóa Reaction
    const hadLike = comment.reactions.like.includes(userId);
    const hadLove = comment.reactions.love.includes(userId);

    comment.reactions.like = comment.reactions.like.filter(
      (id) => id.toString() !== userId.toString()
    );
    comment.reactions.love = comment.reactions.love.filter(
      (id) => id.toString() !== userId.toString()
    );

    if (hadLike || hadLove) {
      comment.totalReactions = Math.max(0, comment.totalReactions - 1);
    }

    await comment.save();

    // === 🔥 QUAN TRỌNG: Populate thông tin người dùng ===
    await comment.populate("userId", "fullName picture email");

    // === 🔥 QUAN TRỌNG: Trả về nguyên object comment ===
    res.status(200).json({
      message: "Đã bỏ react",
      comment: comment, // <--- Redux cần cái này
    });
  } catch (error) {
    console.error("Error unreacting to comment:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};
