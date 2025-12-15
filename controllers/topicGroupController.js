const TopicGroup = require("../models/TopicGroup");
const Post = require("../models/Post");
const mixpanel = require("../service/mixpanelServer");

// Tạo Topic Group mới
// POST /topic-groups/create
exports.createTopicGroup = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, description, category, coverImage, isPublic } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        message: "Tên nhóm không được để trống",
      });
    }

    const newGroup = new TopicGroup({
      name,
      description,
      category,
      coverImage,
      createdBy: userId,
      members: [userId], // Người tạo tự động là thành viên
      totalMembers: 1,
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    await newGroup.save();
    await newGroup.populate("createdBy", "fullName picture email").lean();

    mixpanel.track("Community - Create Topic Group", {
      distinct_id: userId.toString(),
      groupId: newGroup._id.toString(),
      groupName: name,
      category: category,
    });

    res.status(201).json({
      message: "Tạo nhóm thành công!",
      group: newGroup,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Lấy tất cả Topic Groups (có phân trang & lọc)
// GET /topic-groups?page=1&limit=10&category=Rustic
exports.getAllTopicGroups = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { category, search } = req.query;

    let filter = { isActive: true, isPublic: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const groups = await TopicGroup.find(filter)
      .populate("createdBy", "fullName picture")
      .sort({ totalMembers: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await TopicGroup.countDocuments(filter);

    if (req.user) {
      mixpanel.track("Community - View Topic Groups", {
        distinct_id: req.user._id.toString(),
        page: page,
        category: category || "all",
      });
    }

    res.status(200).json({
      groups,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalGroups: total,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Lấy thông tin chi tiết một Topic Group
// GET /topic-groups/:id
exports.getTopicGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await TopicGroup.findById(id)
      .populate("createdBy", "fullName picture email")
      .populate("members", "fullName picture")
      .lean();

    if (!group) {
      return res.status(404).json({
        message: "Không tìm thấy nhóm",
      });
    }

    if (req.user) {
      mixpanel.track("Community - View Topic Group Detail", {
        distinct_id: req.user._id.toString(),
        groupId: id,
      });
    }

    res.status(200).json({ group });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Tham gia Topic Group
// POST /topic-groups/:id/join
exports.joinTopicGroup = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const group = await TopicGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        message: "Không tìm thấy nhóm",
      });
    }

    // Kiểm tra đã là thành viên chưa
    if (group.members.includes(userId)) {
      return res.status(400).json({
        message: "Bạn đã là thành viên của nhóm này",
      });
    }

    group.members.push(userId);
    group.totalMembers = group.members.length;
    await group.save();

    mixpanel.track("Community - Join Topic Group", {
      distinct_id: userId.toString(),
      groupId: id,
    });

    res.status(200).json({
      message: "Tham gia nhóm thành công!",
      group,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Rời khỏi Topic Group
// POST /topic-groups/:id/leave
exports.leaveTopicGroup = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const group = await TopicGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        message: "Không tìm thấy nhóm",
      });
    }

    // Kiểm tra có phải thành viên không
    const memberIndex = group.members.indexOf(userId);
    if (memberIndex === -1) {
      return res.status(400).json({
        message: "Bạn không phải thành viên của nhóm này",
      });
    }

    // Người tạo không thể rời khỏi nhóm
    if (group.createdBy.toString() === userId.toString()) {
      return res.status(400).json({
        message: "Người tạo nhóm không thể rời khỏi nhóm",
      });
    }

    group.members.splice(memberIndex, 1);
    group.totalMembers = group.members.length;
    await group.save();

    mixpanel.track("Community - Leave Topic Group", {
      distinct_id: userId.toString(),
      groupId: id,
    });

    res.status(200).json({
      message: "Rời nhóm thành công!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Lấy các bài viết trong Topic Group
// GET /topic-groups/:id/posts?page=1&limit=10
exports.getTopicGroupPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const group = await TopicGroup.findById(id);
    if (!group) {
      return res.status(404).json({
        message: "Không tìm thấy nhóm",
      });
    }

    const posts = await Post.find({ topicGroupId: id, isActive: true })
      .populate("userId", "fullName picture email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments({
      topicGroupId: id,
      isActive: true,
    });

    if (req.user) {
      mixpanel.track("Community - View Topic Group Posts", {
        distinct_id: req.user._id.toString(),
        groupId: id,
        page: page,
      });
    }

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Cập nhật Topic Group (chỉ người tạo)
// PUT /topic-groups/:id
exports.updateTopicGroup = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { name, description, category, coverImage, isPublic } = req.body;

    const group = await TopicGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        message: "Không tìm thấy nhóm",
      });
    }

    // Chỉ người tạo mới được cập nhật
    if (group.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền cập nhật nhóm này",
      });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (category) group.category = category;
    if (coverImage !== undefined) group.coverImage = coverImage;
    if (isPublic !== undefined) group.isPublic = isPublic;

    await group.save();

    mixpanel.track("Community - Update Topic Group", {
      distinct_id: userId.toString(),
      groupId: id,
    });

    res.status(200).json({
      message: "Cập nhật nhóm thành công!",
      group,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Xóa Topic Group (chỉ người tạo)
// DELETE /topic-groups/:id
exports.deleteTopicGroup = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const group = await TopicGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        message: "Không tìm thấy nhóm",
      });
    }

    // Chỉ người tạo mới được xóa
    if (group.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa nhóm này",
      });
    }

    group.isActive = false;
    await group.save();

    mixpanel.track("Community - Delete Topic Group", {
      distinct_id: userId.toString(),
      groupId: id,
    });

    res.status(200).json({
      message: "Xóa nhóm thành công!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Lấy danh sách nhóm mà user đã tham gia
// GET /topic-groups/my-groups
exports.getMyTopicGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await TopicGroup.find({
      members: userId,
      isActive: true,
    })
      .populate("createdBy", "fullName picture")
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({
      groups,
      total: groups.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};
