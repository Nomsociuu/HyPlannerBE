const Feedback = require("../models/Feedback");

// Tạo feedback mới
// POST http://localhost:8082/feedback/create/:id
exports.createFeedback = async (req, res) => {
  try {
    const userId = req.params.id;
    const { star, content } = req.body;

    // Validate input
    if (!star || !content) {
      return res.status(400).json({ 
        message: "Vui lòng cung cấp đủ thông tin đánh giá" 
      });
    }

    if (star < 1 || star > 5) {
      return res.status(400).json({ 
        message: "Số sao phải từ 1 đến 5" 
      });
    }

    // Kiểm tra user đã feedback chưa
    const existingFeedback = await Feedback.findOne({ userId });
    if (existingFeedback) {
      return res.status(400).json({ 
        message: "Bạn đã đánh giá rồi. Vui lòng sử dụng chức năng chỉnh sửa." 
      });
    }

    // Tạo feedback mới
    const newFeedback = new Feedback({
      userId,
      star,
      content,
    });

    await newFeedback.save();

    res.status(201).json({ 
      message: "Cảm ơn bạn đã đánh giá!", 
      feedback: newFeedback 
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(500).json({ 
      message: "Lỗi máy chủ", 
      error: error.message 
    });
  }
};

// Cập nhật feedback
// PUT http://localhost:8082/feedback/update/:id
exports.updateFeedback = async (req, res) => {
  try {
    const { star, content } = req.body;
    const userId = req.params.id;

    // Validate input
    if (!star || !content) {
      return res.status(400).json({ 
        message: "Vui lòng cung cấp đủ thông tin đánh giá" 
      });
    }

    if (star < 1 || star > 5) {
      return res.status(400).json({ 
        message: "Số sao phải từ 1 đến 5" 
      });
    }

    // Tìm và cập nhật feedback
    const feedback = await Feedback.findOneAndUpdate(
      { userId },
      { star, content },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({ 
        message: "Không tìm thấy đánh giá của bạn" 
      });
    }

    res.status(200).json({ 
      message: "Cập nhật đánh giá thành công", 
      feedback 
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ 
      message: "Lỗi máy chủ", 
      error: error.message 
    });
  }
};

// Lấy feedback của user hiện tại
// GET http://localhost:8082/feedback/my-feedback/:id
exports.getMyFeedback = async (req, res) => {
  try {
    const userId = req.params.id;

    const feedback = await Feedback.findOne({ userId }).populate(
      "userId",
      "fullName email"
    );

    if (!feedback) {
      return res.status(404).json({ 
        message: "Bạn chưa có đánh giá nào" 
      });
    }

    res.status(200).json(feedback);
  } catch (error) {
    console.error("Error getting feedback:", error);
    res.status(500).json({ 
      message: "Lỗi máy chủ", 
      error: error.message 
    });
  }
};

// Xóa feedback (optional)
// DELETE http://localhost:8082/feedback/delete/:id
exports.deleteFeedback = async (req, res) => {
  try {
    const userId = req.params.id;

    const feedback = await Feedback.findOneAndDelete({ userId });

    if (!feedback) {
      return res.status(404).json({ 
        message: "Không tìm thấy đánh giá của bạn" 
      });
    }

    res.status(200).json({ 
      message: "Xóa đánh giá thành công" 
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ 
      message: "Lỗi máy chủ", 
      error: error.message 
    });
  }
};

// Lấy tất cả feedback (for admin/developer)
// GET http://localhost:8082/feedback/all
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("userId", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    console.error("Error getting all feedback:", error);
    res.status(500).json({ 
      message: "Lỗi máy chủ", 
      error: error.message 
    });
  }
};

// Lấy thống kê feedback (for admin/developer)
// GET http://localhost:8082/feedback/statistics
exports.getFeedbackStatistics = async (req, res) => {
  try {
    const totalFeedback = await Feedback.countDocuments();
    
    const averageRating = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgStar: { $avg: "$star" },
        },
      },
    ]);

    const ratingDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: "$star",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      totalFeedback,
      averageRating: averageRating[0]?.avgStar || 0,
      ratingDistribution,
    });
  } catch (error) {
    console.error("Error getting feedback statistics:", error);
    res.status(500).json({ 
      message: "Lỗi máy chủ", 
      error: error.message 
    });
  }
};