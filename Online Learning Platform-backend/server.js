import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDb } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { authenticateToken, getJwtSecret } from "./middleware/auth.js";
import { migrateLegacyPasswords } from "./services/passwordService.js";
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

getJwtSecret();
app.use(helmet());
app.use(cors({ origin: frontendUrl }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "online-learning-platform-api" });
});

// Existing frontend paths are kept so current screens keep working.
app.use(authRoutes);
app.use("/notes", authenticateToken, noteRoutes);
app.use("/quiz", authenticateToken, quizRoutes);
app.use("/answer", authenticateToken, answerRoutes);
app.use("/answers", authenticateToken, answerRoutes);
app.use("/message", authenticateToken, messageRoutes);
app.use("/messages", authenticateToken, messageRoutes);
app.use("/users", authenticateToken, userRoutes);
app.use("/grade", authenticateToken, gradeRoutes);
app.use("/grades", authenticateToken, gradeRoutes);

app.use(notFound);
app.use(errorHandler);

connectDb(process.env.MONGODB_URI)
  .then(migrateLegacyPasswords)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("API startup failed:", err.message);
    process.exit(1);
  });
