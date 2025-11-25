const Album = require("../models/Album");
const UserSelection = require("../models/UserSelection");
const mixpanel = require("../service/mixpanelServer");

// Tạo Album mới
// POST /albums/create
exports.createAlbum = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, selections, images, description, note, isPublic } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        message: "Tên album không được để trống",
      });
    }

    const newAlbum = new Album({
      user: userId,
      name,
      selections: selections || [],
      images: images || [],
      description,
      note,
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    await newAlbum.save();
    await newAlbum.populate("user", "fullName picture email");

    mixpanel.track("Community - Create Album", {
      distinct_id: userId.toString(),
      albumId: newAlbum._id.toString(),
      albumName: name,
      selectionCount: selections ? selections.length : 0,
      imageCount: images ? images.length : 0,
    });

    res.status(201).json({
      message: "Tạo album thành công!",
      album: newAlbum,
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo Album:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Lấy tất cả Albums công khai (có phân trang)
// GET /albums?page=1&limit=10
exports.getAllAlbums = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const albums = await Album.find({ isPublic: true })
      .populate("user", "fullName picture")
      .populate("selections")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Album.countDocuments({ isPublic: true });

    if (req.user) {
      mixpanel.track("Community - View Albums", {
        distinct_id: req.user._id.toString(),
        page: page,
      });
    }

    res.status(200).json({
      albums,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalAlbums: total,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách Albums:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Lấy Albums của user hiện tại
// GET /albums/my-albums
exports.getMyAlbums = async (req, res) => {
  try {
    const userId = req.user._id;

    const albums = await Album.find({ user: userId })
      .populate("selections")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      albums,
      total: albums.length,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy albums của user:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Lấy thông tin chi tiết một Album
// GET /albums/:id
exports.getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findById(id)
      .populate("user", "fullName picture email")
      .populate("selections");

    if (!album) {
      return res.status(404).json({
        message: "Không tìm thấy album",
      });
    }

    // Kiểm tra quyền xem album private
    if (
      !album.isPublic &&
      album.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Bạn không có quyền xem album này",
      });
    }

    if (req.user) {
      mixpanel.track("Community - View Album Detail", {
        distinct_id: req.user._id.toString(),
        albumId: id,
      });
    }

    res.status(200).json({ album });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thông tin Album:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Cập nhật Album
// PUT /albums/:id
exports.updateAlbum = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { name, selections, images, description, note, isPublic } = req.body;

    const album = await Album.findById(id);

    if (!album) {
      return res.status(404).json({
        message: "Không tìm thấy album",
      });
    }

    // Chỉ chủ sở hữu mới được cập nhật
    if (album.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền cập nhật album này",
      });
    }

    if (name) album.name = name;
    if (selections !== undefined) album.selections = selections;
    if (images !== undefined) album.images = images;
    if (description !== undefined) album.description = description;
    if (note !== undefined) album.note = note;
    if (isPublic !== undefined) album.isPublic = isPublic;

    await album.save();
    await album.populate("user", "fullName picture email");
    await album.populate("selections");

    mixpanel.track("Community - Update Album", {
      distinct_id: userId.toString(),
      albumId: id,
    });

    res.status(200).json({
      message: "Cập nhật album thành công!",
      album,
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật Album:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Xóa Album
// DELETE /albums/:id
exports.deleteAlbum = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const album = await Album.findById(id);

    if (!album) {
      return res.status(404).json({
        message: "Không tìm thấy album",
      });
    }

    // Chỉ chủ sở hữu mới được xóa
    if (album.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa album này",
      });
    }

    await Album.findByIdAndDelete(id);

    mixpanel.track("Community - Delete Album", {
      distinct_id: userId.toString(),
      albumId: id,
    });

    res.status(200).json({
      message: "Xóa album thành công!",
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa Album:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Thêm selection vào album
// POST /albums/:id/add-selection
exports.addSelectionToAlbum = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { selectionId } = req.body;

    const album = await Album.findById(id);

    if (!album) {
      return res.status(404).json({
        message: "Không tìm thấy album",
      });
    }

    if (album.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền chỉnh sửa album này",
      });
    }

    // Kiểm tra selection đã tồn tại chưa
    if (album.selections.includes(selectionId)) {
      return res.status(400).json({
        message: "Selection đã có trong album",
      });
    }

    album.selections.push(selectionId);
    await album.save();
    await album.populate("selections");

    res.status(200).json({
      message: "Thêm selection vào album thành công!",
      album,
    });
  } catch (error) {
    console.error("❌ Lỗi khi thêm selection vào Album:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Xóa selection khỏi album
// POST /albums/:id/remove-selection
exports.removeSelectionFromAlbum = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { selectionId } = req.body;

    const album = await Album.findById(id);

    if (!album) {
      return res.status(404).json({
        message: "Không tìm thấy album",
      });
    }

    if (album.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền chỉnh sửa album này",
      });
    }

    const index = album.selections.indexOf(selectionId);
    if (index === -1) {
      return res.status(400).json({
        message: "Selection không tồn tại trong album",
      });
    }

    album.selections.splice(index, 1);
    await album.save();
    await album.populate("selections");

    res.status(200).json({
      message: "Xóa selection khỏi album thành công!",
      album,
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa selection khỏi Album:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Lấy featured albums (cho Inspire Board)
// GET /albums/featured
exports.getFeaturedAlbums = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const albums = await Album.find({ isPublic: true, isFeatured: true })
      .populate("user", "fullName picture")
      .populate("selections")
      .sort({ averageRating: -1, totalVotes: -1, createdAt: -1 })
      .limit(limit);

    if (req.user) {
      mixpanel.track("Community - View Featured Albums", {
        distinct_id: req.user._id.toString(),
      });
    }

    res.status(200).json({
      albums,
      total: albums.length,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy featured albums:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};
