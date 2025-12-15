const phase = require("../models/Phase");
const task = require("../models/Task");
const mixpanel = require("../service/mixpanelServer");

// GET: http://localhost:8082/tasks/getAllTasks/phaseId
exports.getAllTasks = async (req, res) => {
  const { phaseId } = req.params;
  try {
    // Lấy phase và populate tasks
    const phaseDoc = await phase.findById(phaseId).populate({
      path: "tasks",
      populate: { path: "member", select: "fullName email" }, // nếu muốn lấy thông tin member
    });

    if (!phaseDoc) {
      return res.status(404).json({ message: "Phase not found" });
    }

    res.json(phaseDoc.tasks);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách công việc" });
  }
};
// GET: http://localhost:8082/tasks/getTask/taskId
exports.getTask = async (req, res) => {
  const { taskId } = req.params;
  try {
    const taskDoc = await task.findById(taskId).populate("member", "-password");
    if (!taskDoc) {
      return res.status(404).json({ message: "Công việc không tồn tại" });
    }
    res.json(taskDoc);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin công việc" });
  }
};
// POST: http://localhost:8082/tasks/createTask/phaseId
exports.createTask = async (req, res) => {
  const { phaseId } = req.params;
  const { taskName, taskNote, member } = req.body;
  if (!taskName) {
    return res
      .status(400)
      .json({ message: "Tên công việc không được để trống" });
  }

  try {
    const newTask = new task({
      taskName,
      taskNote,
      member,
      phase: phaseId,
    });

    const savedTask = await newTask.save();
    // Cập nhật mảng tasks trong Phase
    await phase.findByIdAndUpdate(phaseId, {
      $push: { tasks: savedTask._id },
    });

    // Track với Mixpanel
    if (member && member.length > 0) {
      mixpanel.track("Task - Created", {
        distinct_id: member[0].toString(),
        taskId: savedTask._id.toString(),
        phaseId: phaseId,
        hasNote: !!taskNote,
        hasMember: member && member.length > 0,
      });
    }

    res
      .status(201)
      .json({ task: savedTask, message: "Tạo công việc thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo công việc" });
  }
};
// mark a task as completed or not completed
// PUT: http://localhost:8082/tasks/markCompleted/taskId
exports.markCompleted = async (req, res) => {
  const { taskId } = req.params;
  const { completed } = req.body;

  try {
    const updatedTask = await task.findByIdAndUpdate(
      taskId,
      { completed },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Công việc không tồn tại" });
    }

    // Track với Mixpanel
    if (updatedTask.member && updatedTask.member.length > 0) {
      mixpanel.track(
        "Task - Marked as " + (completed ? "Completed" : "Incomplete"),
        {
          distinct_id: updatedTask.member[0].toString(),
          taskId: taskId,
          completed: completed,
        }
      );
    }

    res.json({
      task: updatedTask,
      message: `Đánh dấu công việc là ${
        completed ? "hoàn thành" : "chưa hoàn thành"
      }`,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái công việc" });
  }
};

// PUT: http://localhost:8082/tasks/updateTask/taskId
exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { taskName, taskNote, member } = req.body;

  try {
    const updatedTask = await task.findByIdAndUpdate(
      taskId,
      {
        taskName,
        taskNote,
        member,
      },
      {
        new: true,
      }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Công việc không tồn tại" });
    }

    res.json({ task: updatedTask, message: "Cập nhật công việc thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật công việc" });
  }
};

// DELETE: http://localhost:8082/tasks/deleteTask/taskId
exports.deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const deletedTask = await task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: "Công việc không tồn tại" });
    }

    // Xóa task khỏi mảng tasks trong Phase
    await phase.updateMany(
      { tasks: deletedTask._id },
      { $pull: { tasks: deletedTask._id } }
    );

    res.json({ message: "Xóa công việc thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa công việc" });
  }
};
