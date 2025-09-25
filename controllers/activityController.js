const groupActivities = require("../models/GroupActivity");
const activity = require("../models/Activity");

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
    try {
        const newActivity = new activity({
            activityName,
            activityNote,
            expectedBudget,
            actualBudget,
            payer
        });
        await newActivity.save();
        // Cập nhật groupActivity để thêm activity vào
        await groupActivities.findByIdAndUpdate(groupActivityId, {
            $push: { activities: newActivity._id },
        });
        res.status(201).json(newActivity);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo hoạt động" });
    }
};
// PUT: http://localhost:8082/activities/updateActivity/activityId
exports.updateActivity = async (req, res) => {
  const { activityId } = req.params;
  const { activityName, activityNote, expectedBudget, actualBudget, payer } = req.body;
    try {
        const updatedActivity = await activity.findByIdAndUpdate(
            activityId,
            {
                activityName,
                activityNote,
                expectedBudget,
                actualBudget,
                payer
            },
            { new: true }
        );
        if (!updatedActivity) {
            return res.status(404).json({ message: "Hoạt động không tồn tại" });
        }
        res.json(updatedActivity);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật hoạt động" });
    }
};

// DELETE: http://localhost:8082/activities/deleteActivity/activityId
exports.deleteActivity = async (req, res) => {
  const { activityId } = req.params;
    try {
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
