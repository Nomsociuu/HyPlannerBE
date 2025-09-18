// index.js (hoặc tên tệp chính của bạn)

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const phaseRoutes = require("../routes/phaseRoutes");
const taskRoutes = require("../routes/taskRoutes");
const weddingEventRoutes = require("../routes/weddingEventsRoutes");
require("dotenv").config();

const connectDB = require("../config/db");
const configurePassport = require("../config/passport");

const app = express();

// --- CẤU HÌNH MIDDLEWARES VÀ ROUTES ---
connectDB();

configurePassport(passport);

app.use(cors());
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
app.use("/auth", require("../routes/authRoutes"));
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});
app.use("/phases", phaseRoutes);
app.use("/tasks", taskRoutes);
app.use("/weddingEvents", weddingEventRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});

// --- BƯỚC QUAN TRỌNG NHẤT ---
// Export ứng dụng Express để Vercel có thể sử dụng
module.exports = app;
