const Vote = require("../models/Vote");
const Post = require("../models/Post");
const Album = require("../models/Album");
const UserSelection = require("../models/UserSelection");
const mixpanel = require("../service/mixpanelServer");

// Vote cho một item (Post, Album, UserSelection)
// POST /votes
exports.createVote = async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetId, targetType, voteType } = req.body;

    if (!targetId || !targetType || !voteType) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc",
      });
    }

    // Kiểm tra đã vote chưa
    const existingVote = await Vote.findOne({ userId, targetId, targetType });

    if (existingVote) {
      // Nếu vote type giống nhau thì xóa vote (toggle)
      if (existingVote.voteType === voteType) {
        await Vote.findByIdAndDelete(existingVote._id);
        await updateTargetVoteCount(targetId, targetType, -1);

        mixpanel.track("Community - Remove Vote", {
          distinct_id: userId.toString(),
          targetId: targetId.toString(),
          targetType,
          voteType,
        });

        return res.status(200).json({
          message: "Đã hủy vote",
          action: "removed",
        });
      } else {
        // Đổi loại vote
        existingVote.voteType = voteType;
        await existingVote.save();

        mixpanel.track("Community - Change Vote", {
          distinct_id: userId.toString(),
          targetId: targetId.toString(),
          targetType,
          voteType,
        });

        return res.status(200).json({
          message: "Đã thay đổi vote",
          vote: existingVote,
          action: "changed",
        });
      }
    }

    // Tạo vote mới
    const newVote = new Vote({
      userId,
      targetId,
      targetType,
      voteType,
    });

    await newVote.save();
    await updateTargetVoteCount(targetId, targetType, 1);

    mixpanel.track("Community - Create Vote", {
      distinct_id: userId.toString(),
      targetId: targetId.toString(),
      targetType,
      voteType,
    });

    res.status(201).json({
      message: "Vote thành công!",
      vote: newVote,
      action: "created",
    });
  } catch (error) {
    console.error("❌ Lỗi khi vote:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Lấy tổng số vote của một item
// GET /votes/:targetType/:targetId/count
exports.getVoteCount = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const upvotes = await Vote.countDocuments({
      targetId,
      targetType,
      voteType: "upvote",
    });

    const downvotes = await Vote.countDocuments({
      targetId,
      targetType,
      voteType: "downvote",
    });

    res.status(200).json({
      upvotes,
      downvotes,
      total: upvotes - downvotes,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy vote count:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Lấy vote status của user cho một item
// GET /votes/:targetType/:targetId/status
exports.getUserVoteStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetType, targetId } = req.params;

    const vote = await Vote.findOne({ userId, targetId, targetType });

    res.status(200).json({
      voted: !!vote,
      voteType: vote ? vote.voteType : null,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy vote status:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

// Helper function để cập nhật vote count trong target
async function updateTargetVoteCount(targetId, targetType, increment) {
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
    $inc: { totalVotes: increment },
  });
}

module.exports = exports;
