const phase = require("../models/Phase");
const task = require("../models/Task");
const WeddingEvent = require("../models/WeddingEvent");

// GET: http://localhost:8082/phases/getAllPhases/:eventId
exports.getAllPhases = async (req, res) => {
  const { eventId } = req.params;
  try {
    // Lấy wedding event và populate phases
    const event = await WeddingEvent.findById(eventId).populate({
      path: "phases",
      populate: {
        path: "tasks",
        populate: {
          path: "member",
          select: "-password",
        },
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event.phases);
  } catch (error) {
    res.status(500).json({ message: "Error fetching phases" });
  }
};

// POST: http://localhost:8082/phases/createPhase/eventId
exports.createPhase = async (req, res) => {
  const { phaseTimeStart, phaseTimeEnd } = req.body;
  const { eventId } = req.params;

  if (!phaseTimeStart || !phaseTimeEnd) {
    return res
      .status(400)
      .json({ message: "phaseTimeStart and phaseTimeEnd are required" });
  }
  if (new Date(phaseTimeEnd) < new Date(phaseTimeStart)) {
    return res
      .status(400)
      .json({ message: "phaseTimeEnd must be greater than phaseTimeStart" });
  }

  const newPhase = new phase({
    phaseTimeStart,
    phaseTimeEnd,
    tasks: [],
  });

  try {
    const savedPhase = await newPhase.save();

    // Thêm phase vào event tương ứng
    const updatedEvent = await WeddingEvent.findByIdAndUpdate(
      eventId,
      { $push: { phases: savedPhase._id } },
      { new: true }
    ).populate("phases");

    if (!updatedEvent) {
      // Nếu event không tồn tại, xóa phase vừa tạo để tránh rác
      await phase.findByIdAndDelete(savedPhase._id);
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(201).json({ phase: savedPhase, event: updatedEvent });
  } catch (error) {
    res.status(500).json({ message: "Error creating phase" });
  }
};

// chưa sử dụng hiện tại nhưng sẽ sử dụng trong tương lai
//Tìm phase cần xóa
// Xóa tất cả tasks thuộc phase đó
// Xóa phase
// Cập nhật wedding event (xóa phaseId khỏi array phases)
// Trả về kết quả
exports.deletePhase = async (req, res) => {
  const { phaseId } = req.params;

  try {
    // Tìm phase trước khi xóa để lấy thông tin
    const phaseToDelete = await phase.findById(phaseId);

    if (!phaseToDelete) {
      return res.status(404).json({ message: "Phase not found" });
    }

    // Xóa tất cả các task liên quan đến phase
    if (phaseToDelete.tasks && phaseToDelete.tasks.length > 0) {
      await task.deleteMany({ _id: { $in: phaseToDelete.tasks } });
    }

    // Xóa phase
    const deletedPhase = await phase.findByIdAndDelete(phaseId);

    // Cập nhật wedding event - xóa phaseId khỏi array phases
    await WeddingEvent.updateMany(
      { phases: phaseId },
      { $pull: { phases: phaseId } }
    );

    res.status(200).json({
      message: "Phase and related tasks deleted successfully",
      deletedPhase: deletedPhase,
      deletedTasksCount: phaseToDelete.tasks ? phaseToDelete.tasks.length : 0,
    });
  } catch (error) {
    console.error("Error deleting phase:", error);
    res
      .status(500)
      .json({ message: "Error deleting phase", error: error.message });
  }
};

exports.updatePhase = async (req, res) => {
  const { phaseId } = req.params;
  const { phaseTimeStart, phaseTimeEnd } = req.body;

  // Validation
  if (!phaseTimeStart && !phaseTimeEnd) {
    return res.status(400).json({
      message:
        "At least one field (phaseTimeStart or phaseTimeEnd) is required for update",
    });
  }

  // Validate dates nếu cả hai đều được cung cấp
  // if (phaseTimeStart && phaseTimeEnd) {
  //   if (new Date(phaseTimeEnd) <= new Date(phaseTimeStart)) {
  //     return res.status(400).json({
  //       message: "phaseTimeEnd must be greater than phaseTimeStart"
  //     });
  //   }
  // }

  try {
    // Tìm phase hiện tại để kiểm tra
    const currentPhase = await phase.findById(phaseId);
    if (!currentPhase) {
      return res.status(404).json({ message: "Phase not found" });
    }

    // Tạo object update chỉ với các fields được cung cấp
    const updateData = {};
    if (phaseTimeStart) updateData.phaseTimeStart = phaseTimeStart;
    if (phaseTimeEnd) updateData.phaseTimeEnd = phaseTimeEnd;

    // Validate dates với dữ liệu hiện tại
    const newStartTime = phaseTimeStart
      ? new Date(phaseTimeStart)
      : currentPhase.phaseTimeStart;
    const newEndTime = phaseTimeEnd
      ? new Date(phaseTimeEnd)
      : currentPhase.phaseTimeEnd;

    if (newEndTime <= newStartTime) {
      return res.status(400).json({
        message: "phaseTimeEnd must be greater than phaseTimeStart",
      });
    }

    // Update phase
    const updatedPhase = await phase
      .findByIdAndUpdate(phaseId, updateData, {
        new: true,
        runValidators: true,
      })
      .populate("tasks");

    res.status(200).json({
      message: "Phase updated successfully",
      updatedPhase: updatedPhase,
    });
  } catch (error) {
    console.error("Error updating phase:", error);

    // Handle validation errors
    // if (error.name === 'ValidationError') {
    //   const validationErrors = Object.values(error.errors).map(err => err.message);
    //   return res.status(400).json({
    //     message: "Validation error",
    //     errors: validationErrors
    //   });
    // }

    res.status(500).json({
      message: "Error updating phase",
      error: error.message,
    });
  }
};
