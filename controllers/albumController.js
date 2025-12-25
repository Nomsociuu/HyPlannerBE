const Album = require("../models/Album");
const UserSelection = require("../models/UserSelection");
const AlbumVote = require("../models/AlbumVote");
const SavedAlbum = require("../models/SavedAlbum");
const mixpanel = require("../service/mixpanelServer");

// Tạo Album mới
// POST /albums/create
exports.createAlbum = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      authorName,
      coverImage,
      selections,
      images,
      description,
      note,
      isPublic,
    } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        message: "Tên album không được để trống",
      });
    }

    // Nếu có selections được cung cấp, populate để lấy images
    let albumImages = images || [];
    if (selections && selections.length > 0) {
      const populatedSelections = await UserSelection.find({
        _id: { $in: selections },
      }).populate([
        // Wedding Dress
        "styles",
        "materials",
        "necklines",
        "details",
        "accessories.veils",
        "accessories.jewelries",
        "accessories.hairpins",
        "accessories.crowns",
        "flowers",
        // Venue & Theme
        "weddingVenues",
        "weddingThemes",
        // Tone Colors
        "weddingToneColors",
        "engageToneColors",
        // Vest
        "vestStyles",
        "vestMaterials",
        "vestColors",
        "vestLapels",
        "vestPockets",
        "vestDecorations",
        // Bride Engage
        "brideEngageStyles",
        "brideEngageMaterials",
        "brideEngagePatterns",
        "brideEngageHeadwears",
        // Groom Engage
        "groomEngageOutfits",
        "groomEngageAccessories",
      ]);

      // Lấy tất cả images từ các selections
      populatedSelections.forEach((selection) => {
        // Wedding Dress selections
        if (selection.styles && selection.styles.length > 0) {
          selection.styles.forEach((style) => {
            if (style.image) albumImages.push(style.image);
          });
        }
        if (selection.materials && selection.materials.length > 0) {
          selection.materials.forEach((mat) => {
            if (mat.image) albumImages.push(mat.image);
          });
        }
        if (selection.necklines && selection.necklines.length > 0) {
          selection.necklines.forEach((neck) => {
            if (neck.image) albumImages.push(neck.image);
          });
        }
        if (selection.details && selection.details.length > 0) {
          selection.details.forEach((det) => {
            if (det.image) albumImages.push(det.image);
          });
        }
        if (selection.accessories) {
          ["veils", "jewelries", "hairpins", "crowns"].forEach((key) => {
            if (
              selection.accessories[key] &&
              selection.accessories[key].length > 0
            ) {
              selection.accessories[key].forEach((acc) => {
                if (acc.image) albumImages.push(acc.image);
              });
            }
          });
        }
        if (selection.flowers && selection.flowers.length > 0) {
          selection.flowers.forEach((flower) => {
            if (flower.image) albumImages.push(flower.image);
          });
        }

        // Venue & Theme selections
        if (selection.weddingVenues && selection.weddingVenues.length > 0) {
          selection.weddingVenues.forEach((venue) => {
            if (venue.image) albumImages.push(venue.image);
          });
        }
        if (selection.weddingThemes && selection.weddingThemes.length > 0) {
          selection.weddingThemes.forEach((theme) => {
            if (theme.image) albumImages.push(theme.image);
          });
        }

        // Tone Colors
        if (
          selection.weddingToneColors &&
          selection.weddingToneColors.length > 0
        ) {
          selection.weddingToneColors.forEach((tone) => {
            if (tone.image) albumImages.push(tone.image);
          });
        }
        if (
          selection.engageToneColors &&
          selection.engageToneColors.length > 0
        ) {
          selection.engageToneColors.forEach((tone) => {
            if (tone.image) albumImages.push(tone.image);
          });
        }

        // Vest selections
        if (selection.vestStyles && selection.vestStyles.length > 0) {
          selection.vestStyles.forEach((style) => {
            if (style.image) albumImages.push(style.image);
          });
        }
        if (selection.vestMaterials && selection.vestMaterials.length > 0) {
          selection.vestMaterials.forEach((mat) => {
            if (mat.image) albumImages.push(mat.image);
          });
        }
        if (selection.vestColors && selection.vestColors.length > 0) {
          selection.vestColors.forEach((color) => {
            if (color.image) albumImages.push(color.image);
          });
        }
        if (selection.vestLapels && selection.vestLapels.length > 0) {
          selection.vestLapels.forEach((lapel) => {
            if (lapel.image) albumImages.push(lapel.image);
          });
        }
        if (
          selection.vestPocketSquares &&
          selection.vestPocketSquares.length > 0
        ) {
          selection.vestPocketSquares.forEach((pocket) => {
            if (pocket.image) albumImages.push(pocket.image);
          });
        }
        if (selection.vestDecorations && selection.vestDecorations.length > 0) {
          selection.vestDecorations.forEach((decor) => {
            if (decor.image) albumImages.push(decor.image);
          });
        }

        // Bride Engage selections
        if (
          selection.brideEngageStyles &&
          selection.brideEngageStyles.length > 0
        ) {
          selection.brideEngageStyles.forEach((style) => {
            if (style.image) albumImages.push(style.image);
          });
        }
        if (
          selection.brideEngageMaterials &&
          selection.brideEngageMaterials.length > 0
        ) {
          selection.brideEngageMaterials.forEach((mat) => {
            if (mat.image) albumImages.push(mat.image);
          });
        }
        if (
          selection.brideEngagePatterns &&
          selection.brideEngagePatterns.length > 0
        ) {
          selection.brideEngagePatterns.forEach((pattern) => {
            if (pattern.image) albumImages.push(pattern.image);
          });
        }
        if (
          selection.brideEngageHeadwears &&
          selection.brideEngageHeadwears.length > 0
        ) {
          selection.brideEngageHeadwears.forEach((head) => {
            if (head.image) albumImages.push(head.image);
          });
        }

        // Groom Engage selections
        if (
          selection.groomEngageOutfits &&
          selection.groomEngageOutfits.length > 0
        ) {
          selection.groomEngageOutfits.forEach((outfit) => {
            if (outfit.image) albumImages.push(outfit.image);
          });
        }
        if (
          selection.groomEngageAccessories &&
          selection.groomEngageAccessories.length > 0
        ) {
          selection.groomEngageAccessories.forEach((acc) => {
            if (acc.image) albumImages.push(acc.image);
          });
        }
      });

      // Remove duplicates
      albumImages = [...new Set(albumImages)];
    }

    const newAlbum = new Album({
      user: userId,
      name,
      authorName: authorName || "",
      coverImage: coverImage || "",
      selections: selections || [],
      images: albumImages,
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
      imageCount: albumImages.length,
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
      .populate({
        path: "selections",
        populate: [
          { path: "styles" },
          { path: "materials" },
          { path: "necklines" },
          { path: "details" },
          { path: "accessories.veils" },
          { path: "accessories.jewelries" },
          { path: "accessories.hairpins" },
          { path: "accessories.crowns" },
          { path: "flowers" },
          { path: "weddingToneColors" },
          { path: "engageToneColors" },
          { path: "vestStyles" },
          { path: "vestMaterials" },
          { path: "vestColors" },
          { path: "vestLapels" },
          { path: "vestPockets" },
          { path: "vestDecorations" },
          { path: "brideEngageStyles" },
          { path: "brideEngageMaterials" },
          { path: "brideEngagePatterns" },
          { path: "brideEngageHeadwears" },
          { path: "groomEngageOutfits" },
          { path: "groomEngageAccessories" },
          { path: "weddingVenues" },
          { path: "weddingThemes" },
        ],
      })
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

// Lấy Albums công khai của user hiện tại (đã đăng lên cộng đồng)
// GET /albums/my-public-albums
exports.getMyPublicAlbums = async (req, res) => {
  try {
    const userId = req.user._id;

    // ✅ OPTIMIZED: Add select() to limit fields, reduce payload size
    const albums = await Album.find({ user: userId, isPublic: true })
      .populate("user", "fullName picture")
      .populate({
        path: "selections",
        populate: [
          { path: "styles", select: "name image" },
          { path: "materials", select: "name image" },
          { path: "necklines", select: "name image" },
          { path: "details", select: "name image" },
          { path: "accessories.veils", select: "name image" },
          { path: "accessories.jewelries", select: "name image" },
          { path: "accessories.hairpins", select: "name image" },
          { path: "accessories.crowns", select: "name image" },
          { path: "flowers", select: "name image" },
          { path: "weddingToneColors", select: "name image colorCode" },
          { path: "engageToneColors", select: "name image colorCode" },
          { path: "vestStyles", select: "name image" },
          { path: "vestMaterials", select: "name image" },
          { path: "vestColors", select: "name image colorCode" },
          { path: "vestLapels", select: "name image" },
          { path: "vestPockets", select: "name image" },
          { path: "vestDecorations", select: "name image" },
          { path: "brideEngageStyles", select: "name image" },
          { path: "brideEngageMaterials", select: "name image" },
          { path: "brideEngagePatterns", select: "name image" },
          { path: "brideEngageHeadwears", select: "name image" },
          { path: "groomEngageOutfits", select: "name image" },
          { path: "groomEngageAccessories", select: "name image" },
          { path: "weddingVenues", select: "name image location" },
          { path: "weddingThemes", select: "name image description" },
        ],
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      albums,
      total: albums.length,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy public albums của user:", error);
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

    // ✅ OPTIMIZED: Add select() to limit fields, reduce payload size
    const album = await Album.findById(id)
      .populate("user", "fullName picture email")
      .populate({
        path: "selections",
        populate: [
          { path: "styles", select: "name image description" },
          { path: "materials", select: "name image description" },
          { path: "necklines", select: "name image description" },
          { path: "details", select: "name image description" },
          { path: "accessories.veils", select: "name image description" },
          { path: "accessories.jewelries", select: "name image description" },
          { path: "accessories.hairpins", select: "name image description" },
          { path: "accessories.crowns", select: "name image description" },
          { path: "flowers", select: "name image description" },
          {
            path: "weddingToneColors",
            select: "name image colorCode description",
          },
          {
            path: "engageToneColors",
            select: "name image colorCode description",
          },
          { path: "vestStyles", select: "name image description" },
          { path: "vestMaterials", select: "name image description" },
          { path: "vestColors", select: "name image colorCode description" },
          { path: "vestLapels", select: "name image description" },
          { path: "vestPockets", select: "name image description" },
          { path: "vestDecorations", select: "name image description" },
          { path: "brideEngageStyles", select: "name image description" },
          { path: "brideEngageMaterials", select: "name image description" },
          { path: "brideEngagePatterns", select: "name image description" },
          { path: "brideEngageHeadwears", select: "name image description" },
          { path: "groomEngageOutfits", select: "name image description" },
          { path: "groomEngageAccessories", select: "name image description" },
          { path: "weddingVenues", select: "name image location description" },
          { path: "weddingThemes", select: "name image description" },
        ],
      });

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

// Đăng/Gỡ album lên cộng đồng
// PUT /albums/:id/publish
exports.publishAlbum = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { isPublic } = req.body;

    const album = await Album.findById(id);

    if (!album) {
      return res.status(404).json({
        message: "Không tìm thấy album",
      });
    }

    // Chỉ chủ sở hữu mới được publish
    if (album.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền chỉnh sửa album này",
      });
    }

    album.isPublic = isPublic !== undefined ? isPublic : true;
    await album.save();

    // Khi unpublish album, xóa tất cả SavedAlbum records
    if (!album.isPublic) {
      await SavedAlbum.deleteMany({ albumId: id });
    }

    mixpanel.track(isPublic ? "Album Published" : "Album Unpublished", {
      distinct_id: userId.toString(),
      albumId: id,
    });

    res.status(200).json({
      message: isPublic
        ? "Đã đăng album lên cộng đồng"
        : "Đã gỡ album khỏi cộng đồng",
      album,
    });
  } catch (error) {
    console.error("❌ Lỗi khi publish album:", error);
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

// Lấy trending albums (albums hot trong tuần)
// GET /albums/trending
exports.getTrendingAlbums = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const albums = await Album.find({
      isPublic: true,
      createdAt: { $gte: dateThreshold },
      totalReactions: { $gte: 1 },
      totalComments: { $gte: 1 },
      totalSaves: { $gte: 1 },
    })
      .populate("user", "fullName picture")
      .populate("selections")
      .sort({
        totalReactions: -1,
        totalVotes: -1,
        totalSaves: -1,
        totalComments: -1,
      })
      .limit(limit);

    if (req.user) {
      mixpanel.track("Community - View Trending Albums", {
        distinct_id: req.user._id.toString(),
        days: days,
      });
    }

    res.status(200).json({
      albums,
      total: albums.length,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy trending albums:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Like album
// POST /albums/:id/like
exports.likeAlbum = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ message: "Không tìm thấy album" });
    }

    // Check if already liked
    const existingVote = await AlbumVote.findOne({ userId, albumId: id });
    if (existingVote) {
      return res.status(400).json({ message: "Đã like album này rồi" });
    }

    // Create vote
    await AlbumVote.create({ userId, albumId: id });

    // Update totalVotes
    album.totalVotes = (album.totalVotes || 0) + 1;
    await album.save();

    mixpanel.track("Album Liked", {
      distinct_id: userId.toString(),
      album_id: id,
    });

    res.status(200).json({
      message: "Đã like album",
      totalVotes: album.totalVotes,
    });
  } catch (error) {
    console.error("❌ Lỗi khi like album:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Unlike album
// DELETE /albums/:id/like
exports.unlikeAlbum = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ message: "Không tìm thấy album" });
    }

    // Delete vote
    const result = await AlbumVote.findOneAndDelete({ userId, albumId: id });
    if (!result) {
      return res.status(400).json({ message: "Chưa like album này" });
    }

    // Update totalVotes
    album.totalVotes = Math.max((album.totalVotes || 0) - 1, 0);
    await album.save();

    mixpanel.track("Album Unliked", {
      distinct_id: userId.toString(),
      album_id: id,
    });

    res.status(200).json({
      message: "Đã bỏ like album",
      totalVotes: album.totalVotes,
    });
  } catch (error) {
    console.error("❌ Lỗi khi unlike album:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Save album
// POST /albums/:id/save
exports.saveAlbum = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ message: "Không tìm thấy album" });
    }

    // Check if already saved
    const existingSave = await SavedAlbum.findOne({ userId, albumId: id });
    if (existingSave) {
      return res.status(400).json({ message: "Đã lưu album này rồi" });
    }

    // Create saved album
    await SavedAlbum.create({ userId, albumId: id });

    // Update totalSaves
    album.totalSaves = (album.totalSaves || 0) + 1;
    await album.save();

    mixpanel.track("Album Saved", {
      distinct_id: userId.toString(),
      album_id: id,
    });

    res.status(200).json({
      message: "Đã lưu album",
      totalSaves: album.totalSaves,
    });
  } catch (error) {
    console.error("❌ Lỗi khi save album:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Unsave album
// DELETE /albums/:id/save
exports.unsaveAlbum = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ message: "Không tìm thấy album" });
    }

    // Delete saved album
    const result = await SavedAlbum.findOneAndDelete({ userId, albumId: id });
    if (!result) {
      return res.status(400).json({ message: "Chưa lưu album này" });
    }

    // Update totalSaves
    album.totalSaves = Math.max((album.totalSaves || 0) - 1, 0);
    await album.save();

    mixpanel.track("Album Unsaved", {
      distinct_id: userId.toString(),
      album_id: id,
    });

    res.status(200).json({
      message: "Đã bỏ lưu album",
      totalSaves: album.totalSaves,
    });
  } catch (error) {
    console.error("❌ Lỗi khi unsave album:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Get saved albums
// GET /albums/saved
exports.getSavedAlbums = async (req, res) => {
  try {
    const userId = req.user._id;

    const savedAlbums = await SavedAlbum.find({ userId })
      .populate({
        path: "albumId",
        populate: [
          { path: "user", select: "fullName picture" },
          { path: "selections" },
        ],
      })
      .sort({ createdAt: -1 });

    mixpanel.track("View Saved Albums", {
      distinct_id: userId.toString(),
    });

    res.status(200).json(savedAlbums);
  } catch (error) {
    console.error("❌ Lỗi khi lấy saved albums:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Check if user liked/saved album
// GET /albums/:id/check-interaction
exports.checkAlbumInteraction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const [isLiked, isSaved] = await Promise.all([
      AlbumVote.exists({ userId, albumId: id }),
      SavedAlbum.exists({ userId, albumId: id }),
    ]);

    res.status(200).json({
      isLiked: !!isLiked,
      isSaved: !!isSaved,
    });
  } catch (error) {
    console.error("❌ Lỗi khi check interaction:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Generate share code for album
// POST /albums/:id/generate-share-code
exports.generateShareCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const album = await Album.findOne({ _id: id, user: userId });
    if (!album) {
      return res
        .status(404)
        .json({ message: "Album không tồn tại hoặc không có quyền truy cập" });
    }

    // Generate random 8-character code (alphanumeric)
    const generateCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    // Ensure unique code
    let shareCode;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      shareCode = generateCode();
      const existing = await Album.findOne({ shareCode });
      if (!existing) break;
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return res
        .status(500)
        .json({ message: "Không thể tạo mã share code duy nhất" });
    }

    album.shareCode = shareCode;
    await album.save();

    res.status(200).json({
      success: true,
      shareCode: shareCode,
      message: "Đã tạo mã share code thành công",
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo share code:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Clone album by share code
// POST /albums/clone-by-code
exports.cloneAlbumByCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shareCode } = req.body;

    if (!shareCode || shareCode.trim() === "") {
      return res
        .status(400)
        .json({ message: "Mã share code không được để trống" });
    }

    // Find album by share code
    const sourceAlbum = await Album.findOne({
      shareCode: shareCode.toUpperCase(),
    }).populate("selections");

    if (!sourceAlbum) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy album với mã này" });
    }

    // Clone selections first
    const clonedSelectionIds = [];
    if (sourceAlbum.selections && sourceAlbum.selections.length > 0) {
      for (const selection of sourceAlbum.selections) {
        const selectionData = selection.toObject();
        delete selectionData._id;
        delete selectionData.user;
        delete selectionData.createdAt;
        delete selectionData.updatedAt;

        const newSelection = new UserSelection({
          ...selectionData,
          user: userId,
        });
        await newSelection.save();
        clonedSelectionIds.push(newSelection._id);
      }
    }

    // Clone album
    const clonedAlbum = new Album({
      user: userId,
      name: `${sourceAlbum.name} (Sao chép)`,
      authorName: sourceAlbum.authorName,
      coverImage: sourceAlbum.coverImage,
      selections: clonedSelectionIds,
      images: sourceAlbum.images || [],
      customImages: [], // Don't copy custom uploaded images
      description: sourceAlbum.description,
      note: sourceAlbum.note,
      isPublic: false, // Default to private
    });

    await clonedAlbum.save();

    // Populate for response
    await clonedAlbum.populate("selections");

    res.status(201).json({
      success: true,
      album: clonedAlbum,
      message: "Đã sao chép album thành công",
    });
  } catch (error) {
    console.error("❌ Lỗi khi clone album:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};
