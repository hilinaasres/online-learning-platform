import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    answers: { type: [String], default: [] },
    score: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Answer", answerSchema);
