const phase = require("../models/Phase");
const task = require("../models/Task");
const weddingEvent = require("../models/WeddingEvents");

// GET: http://localhost:8082/phases/getAllPhases/:eventId
exports.getAllPhases = async (req, res) => {
  const { eventId } = req.params;
  try {
    // Lấy wedding event và populate phases
    const event = await weddingEvent.findById(eventId).populate({
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
    const updatedEvent = await weddingEvent
      .findByIdAndUpdate(
        eventId,
        { $push: { phases: savedPhase._id } },
        { new: true }
      )
      .populate("phases");

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
// exports.addTaskToPhase = async (req, res) => {
//   const { phaseId } = req.params;
//   const { taskName, taskNote, member } = req.body;

//   try {
//     const newTask = new task({
//       taskName,
//       taskNote,
//       member,
//     });

//     const savedTask = await newTask.save();

//     const updatedPhase = await phase.findByIdAndUpdate(
//       phaseId,
//       { $push: { tasks: savedTask._id } },
//       { new: true }
//     ).populate("tasks");

//     if (!updatedPhase) {
//       return res.status(404).json({ message: "Phase not found" });
//     }

//     res.status(200).json(updatedPhase);
//   } catch (error) {
//     res.status(500).json({ message: "Error adding task to phase" });
//   }
// };
// exports.deletePhase = async (req, res) => {
//   const { phaseId } = req.params;

//   try {
//     const deletedPhase = await phase.findByIdAndDelete(phaseId);

//     if (!deletedPhase) {
//       return res.status(404).json({ message: "Phase not found" });
//     }

//     // Xóa tất cả các task liên quan đến phase
//     await task.deleteMany({ _id: { $in: deletedPhase.tasks } });

//     res.status(200).json({ message: "Phase and related tasks deleted" });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting phase" });
//   }
// };
// exports.updatePhase = async (req, res) => {
//   const { phaseId } = req.params;
//   const { phaseName, phaseTimeStart, phaseTimeEnd } = req.body;

//   try {
//     const updatedPhase = await phase.findByIdAndUpdate(
//       phaseId,
//       { phaseName, phaseTimeStart, phaseTimeEnd },
//       { new: true }
//     );

//     if (!updatedPhase) {
//       return res.status(404).json({ message: "Phase not found" });
//     }

//     res.status(200).json(updatedPhase);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating phase" });
//   }
// };
