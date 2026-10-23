import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, trim: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export default mongoose.model("Grade", gradeSchema);
