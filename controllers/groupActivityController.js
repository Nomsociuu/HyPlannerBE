const groupActivities = require("../models/GroupActivity");
const weddingEvent = require("../models/WeddingEvents");
const activity = require("../models/Activity");

// GET: http://localhost:8082/groupActivities/getAllActivities/eventId
exports.getAllActivities = async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await weddingEvent
      .findById(eventId)
      .populate({
        path: "groupActivities",
        populate: { path: "activities" },
      });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event.groupActivities);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách hoạt động" });
  }
};

// POST: http://localhost:8082/groupActivities/createGroupActivity/eventId
exports.createGroupActivity = async (req, res) => {
  const { groupName } = req.body;
  const { eventId } = req.params;

  try {
    // Tạo mới groupActivity và thêm activity vào mảng activities
    const newActivity = new groupActivities({
      groupName,
      // groupActivityTimeStart,
      // groupActivityTimeEnd,
      activities: [],
    });
    await newActivity.save();
    // Cập nhật weddingEvent để thêm groupActivity vào
    await weddingEvent.findByIdAndUpdate(eventId, {
      $push: { groupActivities: newActivity._id },
    });
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo hoạt động" });
  }
};

// PUT: http://localhost:8082/groupActivities/updateGroupActivity/activityGroupId
exports.updateGroupActivity = async (req, res) => {
  const { activityGroupId } = req.params;
  const { groupName } = req.body;
  try {
    const updatedActivity = await groupActivities.findByIdAndUpdate(
      activityGroupId,
      {
        groupName,
        // groupActivityTimeStart,
        // groupActivityTimeEnd,
      },
      { new: true }
    );

    if (!updatedActivity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.json(updatedActivity);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật hoạt động" });
  }
};

// DELETE: http://localhost:8082/groupActivities/deleteGroupActivity/activityGroupId
exports.deleteGroupActivity = async (req, res) => {
  const { activityGroupId } = req.params;
  try {
    const deletedActivity = await groupActivities.findByIdAndDelete(
      activityGroupId
    );

    if (!deletedActivity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    // Xóa groupActivity khỏi tất cả các weddingEvent chứa nó
    await weddingEvent.updateMany(
      { activities: activityGroupId },
      { $pull: { activities: activityGroupId } }
    );
    // xóa tất cả activities bên trong groupActivity
    await activity.deleteMany({ _id: { $in: deletedActivity.activities } });

    res.json({ message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa hoạt động" });
  }
};
