import Quiz from "../models/Quiz.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const listQuizzes = asyncHandler(async (req, res) => {
  const filter = req.user.role === "instructor"
    ? { createdBy: req.user._id }
    : {};
  const query = Quiz.find(filter).populate("createdBy", "name email").sort({ createdAt: -1 });
  if (req.user.role === "student") query.select("-questions.correctAnswer");
  const quizzes = await query;
  res.json(quizzes);
});

export const createQuiz = asyncHandler(async (req, res) => {
  const { title, questions } = req.body;
  const quiz = await Quiz.create({
    title,
    questions,
    createdBy: req.user._id,
  });

  res.status(201).json({ message: "Quiz created", quiz });
});
