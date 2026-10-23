import Grade from "../models/Grade.js";
import User from "../models/User.js";
import { asyncHandler } from "../middleware/errorHandler.js";

function serializeGrade(grade) {
  const obj = grade.toObject();
  // Keep the old field name so the current UI keeps working.
  obj.teacherId = obj.instructorId;
  return obj;
}

export const createGrade = asyncHandler(async (req, res) => {
  const { studentId, title, score, maxScore } = req.body;
  const student = await User.findById(studentId).select("_id role");
  if (!student || student.role !== "student") {
    return res.status(404).json({ message: "Student not found" });
  }

  const grade = await Grade.create({
    studentId,
    instructorId: req.user._id,
    title,
    score,
    maxScore: maxScore ?? 100,
  });

  res.status(201).json({ message: "Grade saved", grade: serializeGrade(grade) });
});

export const listGrades = asyncHandler(async (req, res) => {
  const filter = req.user.role === "student"
    ? { studentId: req.user._id }
    : req.user.role === "instructor"
      ? { instructorId: req.user._id }
      : {};

  if (req.params.studentId) {
    if (req.user.role === "student" && req.params.studentId !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only view your own grades" });
    }
    filter.studentId = req.params.studentId;
  }

  const grades = await Grade.find(filter)
    .populate("studentId", "name email")
    .populate("instructorId", "name email")
    .sort({ createdAt: -1 });

  res.json(grades.map(serializeGrade));
});
