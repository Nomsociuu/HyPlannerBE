// index.js (hoặc tên tệp chính của bạn)

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const configurePassport = require("../config/passport");

// ⚠️ CRON JOBS DON'T WORK ON VERCEL SERVERLESS!
// Vercel serverless functions are stateless and don't support background jobs
// For scheduled tasks, use Vercel Cron (vercel.json) or external services like:
// - Vercel Cron (https://vercel.com/docs/cron-jobs)
// - GitHub Actions
// - External cron service (cron-job.org, easycron.com)
// Commented out to reduce cold start time:
// require("../cron/inAppNotificationScheduler");
// require("../cron/pushNotificationScheduler");

const app = express();

// Trust proxy - CRITICAL for Vercel deployment
app.set("trust proxy", 1);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// ✅ OPTIMIZATION 1: Connect to DB once (will be cached)
let dbConnected = false;
const ensureDBConnection = async () => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
};

// ✅ OPTIMIZATION 2: Configure passport once
configurePassport(passport);

// ✅ OPTIMIZATION 3: Lazy load routes to reduce cold start
// Routes are loaded on first request, not on function initialization
const getRoutes = () => {
  if (!app._routesLoaded) {
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
    const uploadRoutes = require("../routes/uploadRoutes");
    const guestRoutes = require("../routes/guestRoutes");
    const topicGroupRoutes = require("../routes/topicGroupRoutes");
    const albumRoutes = require("../routes/albumRoutes");
    const voteRoutes = require("../routes/voteRoutes");
    const ratingRoutes = require("../routes/ratingRoutes");
    const savedPostRoutes = require("../routes/savedPostRoutes");
    const notificationRoutes = require("../routes/notificationRoutes");
    const cronRoutes = require("../routes/cronRoutes");

    // Register routes
    app.use("/auth", authRoutes);
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
    app.use("/upload", uploadRoutes);
    app.use("/guests", guestRoutes);
    app.use("/topic-groups", topicGroupRoutes);
    app.use("/albums", albumRoutes);
    app.use("/votes", voteRoutes);
    app.use("/ratings", ratingRoutes);
    app.use("/saved-posts", savedPostRoutes);
    app.use("/notifications", notificationRoutes);
    app.use("/api/cron", cronRoutes);

    app._routesLoaded = true;
  }
};

// ✅ MIDDLEWARE: Must be before routes
// Webhook needs raw body
const { handlePayOsWebhook } = require("../controllers/paymentController");
app.post(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  handlePayOsWebhook
);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);
app.use(express.json());

// ⚠️ Session disabled for serverless - JWT is used instead
// Uncomment only if you need OAuth callbacks with session
/*
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);
*/

app.use(passport.initialize());
// app.use(passport.session()); // Disabled - not needed for JWT

// ✅ DB Connection middleware - ensures DB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await ensureDBConnection();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(503).json({
      message: "Service temporarily unavailable. Database connection failed.",
    });
  }
});

// ✅ Load routes once before handling any request
getRoutes();

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "✅ API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

app.use(errorHandler);

// ✅ For local development only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// --- EXPORT FOR VERCEL SERVERLESS ---
module.exports = app;
