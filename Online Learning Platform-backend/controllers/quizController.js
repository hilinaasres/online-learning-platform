import Quiz from "../models/Quiz.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const listQuizzes = asyncHandler(async (_req, res) => {
  const quizzes = await Quiz.find().populate("createdBy", "name email").sort({ createdAt: -1 });
  res.json(quizzes);
});

export const createQuiz = asyncHandler(async (req, res) => {
  const { title, questions, instructorId, teacherId } = req.body;
  if (!title || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: "Title and at least one question are required" });
  }

  const quiz = await Quiz.create({
    title,
    questions,
    createdBy: instructorId || teacherId,
  });

  res.status(201).json({ message: "Quiz created", quiz });
});
