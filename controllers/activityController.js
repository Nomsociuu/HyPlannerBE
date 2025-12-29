const groupActivities = require("../models/GroupActivity");
const activity = require("../models/Activity");
const WeddingEvent = require("../models/WeddingEvent");
const mixpanel = require("../service/mixpanelServer");

// GET: http://localhost:8082/activities/getActivity/:activityId
exports.getActivity = async (req, res) => {
  const { activityId } = req.params;
  try {
    const activityDoc = await activity.findById(activityId);
    if (!activityDoc) {
      return res.status(404).json({ message: "Hoạt động không tồn tại" });
    }
    res.json(activityDoc);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy hoạt động" });
  }
};
// POST: http://localhost:8082/activities/createActivity/groupActivityId
exports.createActivity = async (req, res) => {
  const { activityName, activityNote, expectedBudget, actualBudget, payer } =
    req.body;
  const { groupActivityId } = req.params;
  const userId = req.user._id;

  try {
    // Check if user is creator by finding wedding event through groupActivity
    const groupActivity = await groupActivities.findById(groupActivityId);
    if (!groupActivity) {
      return res.status(404).json({ message: "Nhóm hoạt động không tồn tại" });
    }

    const event = await WeddingEvent.findOne({
      groupActivities: groupActivityId,
      creatorId: userId,
    });

    if (!event) {
      return res
        .status(403)
        .json({ message: "Chỉ người tạo mới có quyền thêm ngân sách" });
    }

    const newActivity = new activity({
      activityName,
      activityNote,
      expectedBudget,
      actualBudget,
      payer,
    });
    await newActivity.save();
    // Cập nhật groupActivity để thêm activity vào
    await groupActivities.findByIdAndUpdate(groupActivityId, {
      $push: { activities: newActivity._id },
    });

    // Track với Mixpanel
    if (payer) {
      mixpanel.track("Budget - Activity Created", {
        distinct_id: payer.toString(),
        activityId: newActivity._id.toString(),
        groupActivityId: groupActivityId,
        expectedBudget: expectedBudget || 0,
        actualBudget: actualBudget || 0,
      });
    }

    res.status(201).json(newActivity);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo hoạt động" });
  }
};
// PUT: http://localhost:8082/activities/updateActivity/activityId
exports.updateActivity = async (req, res) => {
  const { activityId } = req.params;
  const { activityName, activityNote, expectedBudget, actualBudget, payer } =
    req.body;
  const userId = req.user._id;

  try {
    // Find which groupActivity contains this activity
    const groupActivity = await groupActivities.findOne({
      activities: activityId,
    });
    if (!groupActivity) {
      return res.status(404).json({ message: "Hoạt động không tồn tại" });
    }

    // Check if user is creator or has edit permission
    const event = await WeddingEvent.findOne({
      groupActivities: groupActivity._id,
      $or: [
        { creatorId: userId },
        { "sharers.userId": userId, "sharers.permission": "edit" },
      ],
    });

    if (!event) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chỉnh sửa ngân sách này" });
    }

    const updatedActivity = await activity.findByIdAndUpdate(
      activityId,
      {
        activityName,
        activityNote,
        expectedBudget,
        actualBudget,
        payer,
      },
      { new: true, runValidators: true }
    );
    if (!updatedActivity) {
      return res.status(404).json({ message: "Hoạt động không tồn tại" });
    }
    res.json(updatedActivity);
  } catch (error) {
    console.error("Error updating activity:", error);
    const errorMessage = error.message || "Lỗi khi cập nhật hoạt động";
    res.status(500).json({ message: errorMessage, error: error.toString() });
  }
};

// DELETE: http://localhost:8082/activities/deleteActivity/activityId
exports.deleteActivity = async (req, res) => {
  const { activityId } = req.params;
  const userId = req.user._id;

  try {
    // Find which groupActivity contains this activity
    const groupActivity = await groupActivities.findOne({
      activities: activityId,
    });
    if (!groupActivity) {
      return res.status(404).json({ message: "Hoạt động không tồn tại" });
    }

    // Check if user is creator
    const event = await WeddingEvent.findOne({
      groupActivities: groupActivity._id,
      creatorId: userId,
    });

    if (!event) {
      return res
        .status(403)
        .json({ message: "Chỉ người tạo mới có quyền xóa ngân sách" });
    }

    const deletedActivity = await activity.findByIdAndDelete(activityId);
    if (!deletedActivity) {
      return res.status(404).json({ message: "Hoạt động không tồn tại" });
    }
    await groupActivities.updateMany(
      { activities: activityId },
      { $pull: { activities: activityId } }
    );
    res.json({ message: "Xóa hoạt động thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa hoạt động" });
  }
};
