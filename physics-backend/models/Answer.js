import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  answers: [String],
  score: Number,
  feedback: String,
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Answer", answerSchema);
