const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= TEST ROUTE ================= */
app.get("/test", (req, res) => {
  res.send("Backend working");
});

/* ================= ROUTES ================= */

// Auth Routes
const authRoutes = require("./routes/auth.routes");

// User Routes
const userRoutes = require("./routes/user.routes");

// Role-Based Routes
const studentRoutes = require("./routes/student.routes");
const teacherRoutes = require("./routes/teacher.routes");
const adminRoutes = require("./routes/admin.routes");

// Lesson Routes
const lessonRoutes = require("./routes/lesson.routes");
app.use("/api/courses", require("./routes/course.routes"));

// ✅ Quiz Routes (NEW)
const quizRoutes = require("./routes/quiz.routes");

const assignmentRoutes = require("./routes/assignment.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const aiRoutes = require("./routes/ai.routes");


/* ================= API ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/lessons", lessonRoutes);


// ✅ Quiz API
app.use("/api/quizzes", quizRoutes);

app.use("/api/assignments", assignmentRoutes);
app.use("/api/enrollment", enrollmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);


/* ================= SERVER ================= */

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});