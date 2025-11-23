// index.js (hoặc tên tệp chính của bạn)

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const path = require("path");
const session = require("express-session");
const phaseRoutes = require("../routes/phaseRoutes");
const taskRoutes = require("../routes/taskRoutes");
const weddingEventRoutes = require("../routes/weddingEventRoutes");
const weddingCostumeRoutes = require("../routes/weddingCostumeRoutes");
const userSelectionRoutes = require("../routes/userSelectionRoutes");
const groupActivityRoutes = require("../routes/groupActivityRoutes");
const activityRoutes = require("../routes/activityRoutes");
const authRoutes = require("../routes/authRoutes");
const invitationLetterRoutes = require("../routes/invitationLetterRoutes");
const publicRoutes = require("../routes/publicRoutes");
const templateRoutes = require("../routes/templateRoutes");
const paymentRoutes = require("../routes/paymentRoutes");
const feedbackRoutes = require("../routes/feedbackRoutes");
const postRoutes = require("../routes/postRoutes");
const commentRoutes = require("../routes/commentRoutes");
const { handlePayOsWebhook } = require("../controllers/paymentController");

const connectDB = require("../config/db");
const configurePassport = require("../config/passport");

const app = express();

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// --- CẤU HÌNH MIDDLEWARES VÀ ROUTES ---
connectDB();

configurePassport(passport);

app.post(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  handlePayOsWebhook
);

app.use(
  cors({
    origin: "*", // Hoặc chỉ định domain của frontend để an toàn hơn
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// 4. Routes
app.use("/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});
app.use("/phases", phaseRoutes);
app.use("/tasks", taskRoutes);
app.use("/weddingEvents", weddingEventRoutes);
app.use("/wedding-costume", weddingCostumeRoutes);
app.use("/user-selections", userSelectionRoutes);
app.use("/groupActivities", groupActivityRoutes);
app.use("/activities", activityRoutes);
app.use("/invitation", invitationLetterRoutes);
app.use("/inviletter", publicRoutes);
app.use("/templates", templateRoutes);
app.use("/payments", paymentRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});

// --- BƯỚC QUAN TRỌNG NHẤT ---
// Export ứng dụng Express để Vercel có thể sử dụng
module.exports = app;
