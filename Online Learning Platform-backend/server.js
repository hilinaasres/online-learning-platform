import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDb } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import answerRoutes from "./routes/answerRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js";

const app = express();
const port = Number(process.env.PORT) || 5001;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: frontendUrl }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "online-learning-platform-api" });
});

// Existing frontend paths are kept so current screens keep working.
app.use(authRoutes);
app.use("/notes", noteRoutes);
app.use("/quiz", quizRoutes);
app.use("/answer", answerRoutes);
app.use("/answers", answerRoutes);
app.use("/message", messageRoutes);
app.use("/messages", messageRoutes);
app.use("/users", userRoutes);
app.use("/grade", gradeRoutes);
app.use("/grades", gradeRoutes);

app.use(notFound);
app.use(errorHandler);

connectDb(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
