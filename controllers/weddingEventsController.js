const weddingEvent = require("../models/WeddingEvents");
const mongoose = require("mongoose");
// const phase = require("../models/Phase");
const Activity = require("../models/Activity");
const GroupActivity = require("../models/GroupActivity");
const Task = require("../models/Task");
const Phase = require("../models/Phase");
const Hashids = require("hashids/cjs");
const { createSampleWeddingData } = require("../sampleData/createSampleWeddingData");


const hashids = new Hashids(process.env.SECRET_KEY_SALT, 6);

// Get all wedding events (for developer testing)
// GET http://localhost:8082/weddingEvents/getAllWeddingEvents
exports.getAllWeddingEvents = async (req, res) => {
  try {
    const events = await weddingEvent.find({ member: req.user._id });
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

    // Tạo sample data
    const sampleData = createSampleWeddingData(creatorId, new Date(timeToMarried));

    // Tạo các activities và lưu vào database
    const createdActivities = {
      jewelry: [],
      photoVideo: [],
      costume: [],
      engagement: [],
      ceremony: [],
      party: [],
      logistics: [],
      afterWedding: []
    };

    // Tạo activities cho từng nhóm (KHÔNG có member)
    for (const [groupKey, activities] of Object.entries(sampleData.activities)) {
      for (const activityData of activities) {        
        const newActivity = new Activity(activityData);
        const savedActivity = await newActivity.save();
        createdActivities[groupKey].push(savedActivity._id);
      }
    }

    // Tạo GroupActivities với activities đã tạo (KHÔNG có member)
    const createdGroupActivities = [];
    const groupActivityMapping = [
      { groupName: "Trang sức & Nhẫn cưới", activities: createdActivities.jewelry },
      { groupName: "Ảnh và video", activities: createdActivities.photoVideo },
      { groupName: "Trang phục – Make up", activities: createdActivities.costume },
      { groupName: "Lễ ăn hỏi / Đám ngõ", activities: createdActivities.engagement },
      { groupName: "Lễ cưới", activities: createdActivities.ceremony },
      { groupName: "Tiệc cưới", activities: createdActivities.party },
      { groupName: "Hậu cần & Khác", activities: createdActivities.logistics },
      { groupName: "Dự phòng & Sau cưới", activities: createdActivities.afterWedding }
    ];

    for (const groupData of groupActivityMapping) {      
      const newGroupActivity = new GroupActivity(groupData);
      const savedGroupActivity = await newGroupActivity.save();
      createdGroupActivities.push(savedGroupActivity._id);
    }

    // Tạo Tasks cho từng phase với member
    const createdTasks = {
      phase1: [],
      phase2: [],
      phase3: [],
      phase4: [],
      phase5: [],
      phase6: [],
      phase7: [],
      phase8: [],
      phase9: [],
      phase10: [],
      afterWedding: []
    };

    for (const [phaseKey, tasks] of Object.entries(sampleData.tasks)) {
      for (const taskData of tasks) {
        // CHỈ có TASK mới có member
        const taskWithMember = {
          ...taskData,
          member: [creatorId] // Override member với creatorId
        };
        
        const newTask = new Task(taskWithMember);
        const savedTask = await newTask.save();
        
        createdTasks[phaseKey].push(savedTask._id);
      }
    }

    // Tạo Phases với tasks đã tạo (KHÔNG có member)
    const createdPhases = [];
    const phaseTaskMapping = [
      { ...sampleData.phases[0], tasks: createdTasks.phase1 },
      { ...sampleData.phases[1], tasks: createdTasks.phase2 },
      { ...sampleData.phases[2], tasks: createdTasks.phase3 },
      { ...sampleData.phases[3], tasks: createdTasks.phase4 },
      { ...sampleData.phases[4], tasks: createdTasks.phase5 },
      { ...sampleData.phases[5], tasks: createdTasks.phase6 },
      { ...sampleData.phases[6], tasks: createdTasks.phase7 },
      { ...sampleData.phases[7], tasks: createdTasks.phase8 },
      { ...sampleData.phases[8], tasks: createdTasks.phase9 },
      { ...sampleData.phases[9], tasks: createdTasks.phase10 },
      { ...sampleData.phases[10], tasks: createdTasks.afterWedding }
    ];

    for (const phaseData of phaseTaskMapping) {      
      const newPhase = new Phase(phaseData);
      const savedPhase = await newPhase.save();
      createdPhases.push(savedPhase._id);
    }

    // Tạo wedding event với sample data đã tạo
    const newWeddingEvent = new weddingEvent({
      creatorId,
      brideName,
      groomName,
      budget,
      timeToMarried,
      member: [creatorId],
      phases: createdPhases,
      groupActivities: createdGroupActivities,
    });

    await newWeddingEvent.save();
    res.status(201).json({ 
      message: "Wedding event created with sample data", 
      newWeddingEvent 
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
    const events = await weddingEvent
      .findOne({
        $or: [{ creatorId: userId }, { member: userId }],
      })
      .populate("member", "-password");
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
    const event = await weddingEvent.findById(eventId).populate("phases");
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
    const event = await weddingEvent.findById(eventId);
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
    const event = await weddingEvent.findById(eventId);
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
    const foundEvent = await weddingEvent.findOne(query);

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
    console.error("Lỗi khi kiểm tra sự kiện cưới của người dùng:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
  }
};
