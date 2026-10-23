import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    questions: [
      {
        question: { type: String, required: true },
        options: { type: [String], default: [] },
        correctAnswer: { type: String, default: "" },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
