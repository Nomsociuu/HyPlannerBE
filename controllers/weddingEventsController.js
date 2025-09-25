const weddingEvent = require("../models/WeddingEvents");
const phase = require("../models/Phase");
const Hashids = require("hashids/cjs");
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
    const newWeddingEvent = new weddingEvent({
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
    res.status(201).json({ message: "Wedding event created", newWeddingEvent });
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
        $or: [
          { creatorId: userId },
          { member: userId },
        ],
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
  console.log(eventId, userId);
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
