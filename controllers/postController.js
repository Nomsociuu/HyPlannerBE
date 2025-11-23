const Post = require("../models/Post");
const Comment = require("../models/Comment");
const mixpanel = require("../service/mixpanelServer");

// Tạo post mới
// POST /posts/create
exports.createPost = async (req, res) => {
  try {
    const userId = req.user._id; // Lấy từ auth middleware
    const { content, images } = req.body;

    // Validate input
    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Nội dung không được để trống",
      });
    }

    // Tạo post mới
    const newPost = new Post({
      userId,
      content,
      images: images || [],
    });

    await newPost.save();

    // Populate user info
    await newPost.populate("userId", "fullName picture email");

    // Track với Mixpanel
    mixpanel.track("Community - Create Post", {
      distinct_id: userId.toString(),
      postId: newPost._id.toString(),
      hasImages: images && images.length > 0,
      imageCount: images ? images.length : 0,
      contentLength: content.length,
    });

    res.status(201).json({
      message: "Đăng bài thành công!",
      post: newPost,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Lấy tất cả posts (có phân trang)
// GET /posts?page=1&limit=10
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isActive: true })
      .populate("userId", "fullName picture email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ isActive: true });

    // Track với Mixpanel
    if (req.user) {
      mixpanel.track("Community - View All Posts", {
        distinct_id: req.user._id.toString(),
        page: page,
        limit: limit,
        totalPosts: total,
      });
    }

    res.status(200).json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        limit,
      },
    });
  } catch (error) {
    console.error("Error getting posts:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Lấy post theo ID
// GET /posts/:id
exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findOne({ _id: postId, isActive: true }).populate(
      "userId",
      "fullName picture email"
    );

    if (!post) {
      return res.status(404).json({
        message: "Không tìm thấy bài viết",
      });
    }

    // Track với Mixpanel
    if (req.user) {
      mixpanel.track("Community - View Post Detail", {
        distinct_id: req.user._id.toString(),
        postId: postId,
        postAuthorId: post.userId._id.toString(),
        isOwnPost: req.user._id.toString() === post.userId._id.toString(),
        totalComments: post.totalComments,
        totalReactions: post.totalReactions,
      });
    }

    res.status(200).json({
      post,
    });
  } catch (error) {
    console.error("Error getting post:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Lấy posts của một user
// GET /posts/user/:userId?page=1&limit=10
exports.getPostsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ userId, isActive: true })
      .populate("userId", "fullName picture email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ userId, isActive: true });

    res.status(200).json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        limit,
      },
    });
  } catch (error) {
    console.error("Error getting user posts:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Cập nhật post
// PUT /posts/:id
exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const { content, images } = req.body;

    // Tìm post
    const post = await Post.findOne({ _id: postId, isActive: true });

    if (!post) {
      return res.status(404).json({
        message: "Không tìm thấy bài viết",
      });
    }

    // Kiểm tra quyền sở hữu
    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền chỉnh sửa bài viết này",
      });
    }

    // Validate
    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Nội dung không được để trống",
      });
    }

    // Cập nhật
    post.content = content;
    if (images !== undefined) {
      post.images = images;
    }

    await post.save();
    await post.populate("userId", "fullName picture email");

    // Track với Mixpanel
    mixpanel.track("Community - Update Post", {
      distinct_id: userId.toString(),
      postId: postId,
      hasImages: images !== undefined && images.length > 0,
      imageCount: images ? images.length : 0,
    });

    res.status(200).json({
      message: "Cập nhật bài viết thành công",
      post,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Xóa post (soft delete)
// DELETE /posts/:id
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    // Tìm post
    const post = await Post.findOne({ _id: postId, isActive: true });

    if (!post) {
      return res.status(404).json({
        message: "Không tìm thấy bài viết",
      });
    }

    // Kiểm tra quyền sở hữu
    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa bài viết này",
      });
    }

    // Soft delete
    post.isActive = false;
    await post.save();

    // Cũng soft delete tất cả comments của post này
    await Comment.updateMany({ postId }, { isActive: false });

    // Track với Mixpanel
    mixpanel.track("Community - Delete Post", {
      distinct_id: userId.toString(),
      postId: postId,
      hadComments: post.totalComments > 0,
      totalComments: post.totalComments,
      totalReactions: post.totalReactions,
    });

    res.status(200).json({
      message: "Xóa bài viết thành công",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Thả reaction vào post
// POST /posts/:id/react
exports.reactToPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const { type } = req.body; // type: 'like' hoặc 'love'

    if (!["like", "love"].includes(type)) {
      return res.status(400).json({
        message: "Loại reaction không hợp lệ. Chỉ chấp nhận 'like' hoặc 'love'",
      });
    }

    const post = await Post.findOne({ _id: postId, isActive: true });

    if (!post) {
      return res.status(404).json({
        message: "Không tìm thấy bài viết",
      });
    }

    // Kiểm tra user đã react chưa
    const hasLiked = post.reactions.like.includes(userId);
    const hasLoved = post.reactions.love.includes(userId);

    // Nếu đã react cùng loại thì bỏ react
    if (type === "like" && hasLiked) {
      post.reactions.like = post.reactions.like.filter(
        (id) => id.toString() !== userId.toString()
      );
      post.totalReactions = Math.max(0, post.totalReactions - 1);
    }
    // Nếu đã react loại khác thì chuyển sang loại mới
    else if (type === "like" && hasLoved) {
      post.reactions.love = post.reactions.love.filter(
        (id) => id.toString() !== userId.toString()
      );
      post.reactions.like.push(userId);
    }
    // Thêm react mới
    else if (type === "like" && !hasLiked) {
      post.reactions.like.push(userId);
      post.totalReactions += 1;
    }
    // Tương tự cho love
    else if (type === "love" && hasLoved) {
      post.reactions.love = post.reactions.love.filter(
        (id) => id.toString() !== userId.toString()
      );
      post.totalReactions = Math.max(0, post.totalReactions - 1);
    } else if (type === "love" && hasLiked) {
      post.reactions.like = post.reactions.like.filter(
        (id) => id.toString() !== userId.toString()
      );
      post.reactions.love.push(userId);
    } else if (type === "love" && !hasLoved) {
      post.reactions.love.push(userId);
      post.totalReactions += 1;
    }

    await post.save();

    // Track với Mixpanel
    const action =
      (type === "like" && hasLiked) || (type === "love" && hasLoved)
        ? "Remove Reaction"
        : (type === "like" && hasLoved) || (type === "love" && hasLiked)
        ? "Change Reaction"
        : "Add Reaction";

    mixpanel.track("Community - React to Post", {
      distinct_id: userId.toString(),
      postId: postId,
      reactionType: type,
      action: action,
      totalReactions: post.totalReactions,
    });

    res.status(200).json({
      message: "React thành công",
      reactions: post.reactions,
      totalReactions: post.totalReactions,
    });
  } catch (error) {
    console.error("Error reacting to post:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Bỏ react khỏi post
// DELETE /posts/:id/react
exports.unreactToPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findOne({ _id: postId, isActive: true });

    if (!post) {
      return res.status(404).json({
        message: "Không tìm thấy bài viết",
      });
    }

    // Xóa react của user
    const hadLike = post.reactions.like.includes(userId);
    const hadLove = post.reactions.love.includes(userId);

    post.reactions.like = post.reactions.like.filter(
      (id) => id.toString() !== userId.toString()
    );
    post.reactions.love = post.reactions.love.filter(
      (id) => id.toString() !== userId.toString()
    );

    if (hadLike || hadLove) {
      post.totalReactions = Math.max(0, post.totalReactions - 1);
    }

    await post.save();

    res.status(200).json({
      message: "Đã bỏ react",
      reactions: post.reactions,
      totalReactions: post.totalReactions,
    });
  } catch (error) {
    console.error("Error unreacting to post:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};
