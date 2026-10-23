import Grade from "../models/Grade.js";
import { asyncHandler } from "../middleware/errorHandler.js";

function serializeGrade(grade) {
  const obj = grade.toObject();
  // Keep the old field name so the current UI keeps working.
  obj.teacherId = obj.instructorId;
  return obj;
}

export const createGrade = asyncHandler(async (req, res) => {
  const { studentId, instructorId, teacherId, title, score, maxScore } = req.body;
  if (!studentId || !title || score === undefined) {
    return res.status(400).json({ message: "studentId, title, and score are required" });
  }

  const grade = await Grade.create({
    studentId,
    instructorId: instructorId || teacherId,
    title,
    score,
    maxScore: maxScore ?? 100,
  });

  res.status(201).json({ message: "Grade saved", grade: serializeGrade(grade) });
});

export const listGrades = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.params.studentId) filter.studentId = req.params.studentId;

  const grades = await Grade.find(filter)
    .populate("studentId", "name email")
    .populate("instructorId", "name email")
    .sort({ createdAt: -1 });

  res.json(grades.map(serializeGrade));
});
