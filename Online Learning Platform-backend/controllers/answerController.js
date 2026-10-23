import Answer from "../models/Answer.js";
import Quiz from "../models/Quiz.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const submitAnswer = asyncHandler(async (req, res) => {
  const { quizId, studentId, answers } = req.body;
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const submitted = Array.isArray(answers) ? answers : [];
  let score = 0;
  quiz.questions.forEach((q, idx) => {
    if (q.correctAnswer === submitted[idx]) score += 1;
  });

  const answer = await Answer.create({ quizId, studentId, answers: submitted, score });
  res.status(201).json({ message: "Quiz submitted", score, answerId: answer._id });
});

export const listAnswersForQuiz = asyncHandler(async (req, res) => {
  const answers = await Answer.find({ quizId: req.params.quizId }).populate("studentId", "name email");
  res.json(answers);
});
