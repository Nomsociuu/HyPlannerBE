const WeddingEvent = require("../models/WeddingEvent");
const mongoose = require("mongoose");
// const phase = require("../models/Phase");
const Activity = require("../models/Activity");
const GroupActivity = require("../models/GroupActivity");
const Task = require("../models/Task");
const Phase = require("../models/Phase");
const Hashids = require("hashids/cjs");
const mixpanel = require("../service/mixpanelServer");

const hashids = new Hashids(process.env.SECRET_KEY_SALT, 6);

// Get all wedding events (for developer testing)
// GET http://localhost:8082/weddingEvents/getAllWeddingEvents
exports.getAllWeddingEvents = async (req, res) => {
  try {
    const events = await WeddingEvent.find({ member: req.user._id });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Create a new wedding event
// POST http://localhost:8082/weddingEvents/createWeddingEvent
exports.createWeddingEvent = async (req, res) => {
  try {
    const { creatorId, brideName, groomName, budget, timeToMarried } = req.body;
    if (!creatorId || !brideName || !groomName || !budget || !timeToMarried) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }
    if (new Date(timeToMarried) <= Date.now()) {
      return res
        .status(400)
        .json({ message: "timeToMarried must be in the future" });
    }
    const newWeddingEvent = new WeddingEvent({
      creatorId,
      brideName,
      groomName,
      budget,
      timeToMarried,
      member: [creatorId], // Thêm người tạo vào danh sách thành viên
      phases: [],
      groupActivities: [],
    });
    await newWeddingEvent.save();

    // Track với Mixpanel
    mixpanel.track("Wedding Event - Created", {
      distinct_id: creatorId.toString(),
      eventId: newWeddingEvent._id.toString(),
      budget: budget,
      daysUntilWedding: Math.ceil(
        (new Date(timeToMarried) - new Date()) / (1000 * 60 * 60 * 24)
      ),
    });

    // Set user properties
    mixpanel.people.set(creatorId.toString(), {
      "Wedding Date": new Date(timeToMarried).toISOString(),
      "Wedding Budget": budget,
      "Has Wedding Event": true,
    });

    res.status(201).json({ message: "Wedding event created", newWeddingEvent });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST: http://localhost:8082/weddingEvents/checkAndInsertTasks
exports.checkAndInsertTasks = async (req, res) => {
  try {
    const { eventId, phasesData } = req.body;

    if (!eventId || !phasesData) {
      return res.status(400).json({
        message: "EventId and phasesData are required",
      });
    }

    // Tìm wedding event
    const event = await WeddingEvent.findById(eventId).populate("phases");
    if (!event) {
      return res.status(404).json({ message: "Wedding event not found" });
    }

    // Kiểm tra xem đã có phases và tasks chưa
    if (event.phases && event.phases.length > 0) {
      return res.status(200).json({
        message: "Tasks already exist",
        hasData: true,
        phases: event.phases,
      });
    }

    // console.log("Inserting tasks for event:", eventId);

    // Tạo Phases và Tasks từ JSON data
    const createdPhases = [];

    for (const phaseData of phasesData) {
      // Tạo Tasks cho phase này
      const taskIds = [];

      for (const taskData of phaseData.tasks) {
        const taskWithMember = {
          taskName: taskData.taskName,
          taskNote: taskData.taskNote,
          member: [event.creatorId], // Đảm bảo member có creatorId
          completed: taskData.completed || false,
        };

        const newTask = new Task(taskWithMember);
        const savedTask = await newTask.save();
        taskIds.push(savedTask._id);
      }

      // Tạo Phase với tasks đã tạo
      const newPhaseData = {
        phaseTimeStart: new Date(
          phaseData.phaseTimeStart.replace("ISODate('", "").replace("')", "")
        ),
        phaseTimeEnd: new Date(
          phaseData.phaseTimeEnd.replace("ISODate('", "").replace("')", "")
        ),
        tasks: taskIds,
      };

      const newPhase = new Phase(newPhaseData);
      const savedPhase = await newPhase.save();
      createdPhases.push(savedPhase._id);
    }

    // Cập nhật wedding event với phases đã tạo
    event.phases = createdPhases;
    await event.save();

    res.status(201).json({
      message: "Tasks inserted successfully",
      hasData: false,
      phases: createdPhases,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Hàm kiểm tra và insert activities từ JSON data
// POST http://localhost:8082/weddingEvents/checkAndInsertActivities
exports.checkAndInsertActivities = async (req, res) => {
  try {
    const { eventId, groupActivitiesData } = req.body;

    if (!eventId || !groupActivitiesData) {
      return res.status(400).json({
        message: "EventId and groupActivitiesData are required",
      });
    }

    // Tìm wedding event
    const event = await WeddingEvent.findById(eventId)
      .populate("groupActivities")
      .lean();
    if (!event) {
      return res.status(404).json({ message: "Wedding event not found" });
    }

    // Kiểm tra xem đã có group activities chưa
    if (event.groupActivities && event.groupActivities.length > 0) {
      return res.status(200).json({
        message: "Activities already exist",
        hasData: true,
        groupActivities: event.groupActivities,
      });
    }

    // console.log("Inserting activities for event:", eventId);

    // Tạo GroupActivities và Activities từ JSON data
    const createdGroupActivities = [];

    for (const groupData of groupActivitiesData) {
      // Tạo Activities cho group này
      const activityIds = [];

      for (const activityData of groupData.activities) {
        const newActivityData = {
          activityName: activityData.activityName,
          activityNote: activityData.activityNote,
          expectedBudget: activityData.expectedBudget || 0,
          actualBudget: activityData.actualBudget || 0,
          payer: activityData.payer,
        };

        const newActivity = new Activity(newActivityData);
        const savedActivity = await newActivity.save();
        activityIds.push(savedActivity._id);
      }

      // Tạo GroupActivity với activities đã tạo
      const newGroupData = {
        groupName: groupData.groupName,
        activities: activityIds,
      };

      const newGroupActivity = new GroupActivity(newGroupData);
      const savedGroupActivity = await newGroupActivity.save();
      createdGroupActivities.push(savedGroupActivity._id);
    }

    // Cập nhật wedding event với group activities đã tạo
    event.groupActivities = createdGroupActivities;
    await event.save();

    res.status(201).json({
      message: "Activities inserted successfully",
      hasData: false,
      groupActivities: createdGroupActivities,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Hàm kiểm tra trạng thái data của một wedding event
// GET http://localhost:8082/weddingEvents/checkEventData/:eventId
exports.checkEventData = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await WeddingEvent.findById(eventId)
      .populate("phases")
      .populate("groupActivities")
      .lean();

    if (!event) {
      return res.status(404).json({ message: "Wedding event not found" });
    }

    const hasPhases = event.phases && event.phases.length > 0;
    const hasActivities =
      event.groupActivities && event.groupActivities.length > 0;

    res.status(200).json({
      eventId: eventId,
      hasPhases: hasPhases,
      hasActivities: hasActivities,
      phasesCount: event.phases ? event.phases.length : 0,
      activitiesCount: event.groupActivities ? event.groupActivities.length : 0,
      event: event,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get wedding events created by a specific user
// GET http://localhost:8082/weddingEvents/getUserWeddingEvents/:userId
exports.getUserWeddingEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    const events = await WeddingEvent.findOne({
      $or: [{ creatorId: userId }, { member: userId }],
    }).populate("member", "-password");
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a specific wedding event by ID (unused)
// GET http://localhost:8082/weddingEvents/getWeddingEvent/:eventId
exports.getWeddingEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await WeddingEvent.findById(eventId).populate("phases");
    if (!event) {
      return res.status(404).json({ message: "Wedding event not found" });
    }
    if (!event.member.includes(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add a member to a wedding event
// POST http://localhost:8082/weddingEvents/addMember
exports.joinWeddingEvent = async (req, res) => {
  const { code, userId } = req.body; //code is eventId hashed
  if (!code || !userId) {
    return res.status(400).json({ message: "Mã sự kiện không hợp lệ" });
  }
  const eventId = hashids.decodeHex(code);

  try {
    const event = await WeddingEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({
        message: "Sự kiện cưới không tồn tại. Hãy kiểm tra lại mã mời",
      });
    }

    // Kiểm tra nếu user đã là thành viên
    if (event.member.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Bạn đã là thành viên của sự kiện này" });
    }

    event.member.push(userId);
    await event.save();

    res
      .status(200)
      .json({ message: "Joined wedding event successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Leave a wedding event
// POST http://localhost:8082/weddingEvents/leaveWeddingEvent
exports.leaveWeddingEvent = async (req, res) => {
  const { eventId, userId } = req.body;
  if (!eventId || !userId) {
    return res.status(400).json({ message: "Mã sự kiện không hợp lệ" });
  }

  try {
    const event = await WeddingEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Sự kiện cưới không tồn tại" });
    }
    // Kiểm tra nếu user không phải là thành viên
    if (!event.member.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Bạn không phải là thành viên của sự kiện này" });
    }
    // kiểm tra nếu user là creator
    if (event.creatorId.toString() === userId.toString()) {
      return res
        .status(400)
        .json({ message: "Người tạo không thể rời khỏi sự kiện" });
    }

    event.member.pull(userId);
    await event.save();

    res.status(200).json({ message: "Đã rời khỏi sự kiện cưới", event });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// Delete a wedding event (Creator only)
// DELETE http://localhost:8082/weddingEvents/deleteWeddingEvent/:eventId
exports.deleteWeddingEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  try {
    const event = await WeddingEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Sự kiện cưới không tồn tại" });
    }

    // Chỉ creator mới có quyền xóa
    if (event.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Chỉ người tạo sự kiện mới có quyền xóa kế hoạch cưới",
      });
    }

    // Xóa tất cả phases và tasks liên quan
    if (event.phases && event.phases.length > 0) {
      for (const phaseId of event.phases) {
        // Tìm và xóa tất cả tasks trong phase
        const phase = await Phase.findById(phaseId);
        if (phase && phase.tasks && phase.tasks.length > 0) {
          await Task.deleteMany({ _id: { $in: phase.tasks } });
        }
        // Xóa phase
        await Phase.findByIdAndDelete(phaseId);
      }
    }

    // Xóa tất cả group activities và activities liên quan
    if (event.groupActivities && event.groupActivities.length > 0) {
      for (const groupActivityId of event.groupActivities) {
        const groupActivity = await GroupActivity.findById(groupActivityId);
        if (
          groupActivity &&
          groupActivity.activities &&
          groupActivity.activities.length > 0
        ) {
          await Activity.deleteMany({ _id: { $in: groupActivity.activities } });
        }
        await GroupActivity.findByIdAndDelete(groupActivityId);
      }
    }

    // Xóa wedding event
    await WeddingEvent.findByIdAndDelete(eventId);

    // Track với Mixpanel
    mixpanel.track("Wedding Event - Deleted", {
      distinct_id: userId.toString(),
      eventId: eventId.toString(),
      memberCount: event.member.length,
    });

    res.status(200).json({
      message: "Đã xóa kế hoạch cưới và tất cả dữ liệu liên quan thành công",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

/**
 * @desc     Kiểm tra xem người dùng đã tham gia sự kiện cưới nào chưa
 * @route    GET /api/wedding-events/check-user
 * @access   Private
 */
exports.checkUserInEvent = async (req, res) => {
  try {
    // Bước 1: Lấy userId từ middleware xác thực
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Không được phép, vui lòng đăng nhập lại." });
    }
    const userId = req.user.id;

    // Bước 2: Xây dựng query để tìm kiếm
    const query = {
      $or: [
        { creatorId: new mongoose.Types.ObjectId(userId) },
        { member: new mongoose.Types.ObjectId(userId) },
      ],
    };

    // Bước 3: Thực thi query và tìm một sự kiện duy nhất
    // SỬA Ở ĐÂY: Đổi tên biến kết quả để không bị trùng lặp
    const foundEvent = await WeddingEvent.findOne(query);

    // Bước 4: Trả response về cho frontend
    if (foundEvent) {
      // <-- SỬA Ở ĐÂY
      // Nếu tìm thấy sự kiện, trả về hasEvent: true và thông tin sự kiện
      return res.status(200).json({
        hasEvent: true,
        event: foundEvent, // <-- VÀ SỬA Ở ĐÂY
      });
    } else {
      // Nếu không tìm thấy, trả về hasEvent: false
      return res.status(200).json({
        hasEvent: false,
        event: null,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
  }
};

// Update wedding event information
// PUT http://localhost:8082/weddingEvents/updateWeddingEvent/:eventId
exports.updateWeddingEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      brideName,
      groomName,
      brideFather,
      brideMother,
      groomFather,
      groomMother,
      timeToMarried,
    } = req.body;

    // Find the wedding event
    const event = await WeddingEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Wedding event not found" });
    }

    // Verify that the user is the creator
    if (event.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the event creator can update wedding information",
      });
    }

    // Validate timeToMarried if provided
    if (timeToMarried) {
      if (new Date(timeToMarried) <= Date.now()) {
        return res
          .status(400)
          .json({ message: "timeToMarried must be in the future" });
      }
      event.timeToMarried = timeToMarried;
      event.weddingDate = timeToMarried; // Update weddingDate as well
    }

    // Update fields if provided
    if (brideName !== undefined) event.brideName = brideName;
    if (groomName !== undefined) event.groomName = groomName;
    if (brideFather !== undefined) event.brideFather = brideFather;
    if (brideMother !== undefined) event.brideMother = brideMother;
    if (groomFather !== undefined) event.groomFather = groomFather;
    if (groomMother !== undefined) event.groomMother = groomMother;

    await event.save();

    // Track with Mixpanel
    mixpanel.track("Wedding Event - Updated", {
      distinct_id: req.user._id.toString(),
      eventId: event._id.toString(),
      fieldsUpdated: Object.keys(req.body).join(", "),
    });

    res.status(200).json({
      message: "Wedding event updated successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
