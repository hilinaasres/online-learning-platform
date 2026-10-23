import Answer from "../models/Answer.js";
import Quiz from "../models/Quiz.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const submitAnswer = asyncHandler(async (req, res) => {
  const { quizId, answers } = req.body;
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  if (answers.length !== quiz.questions.length) {
    return res.status(400).json({ message: "Submit one answer for each question" });
  }

  const submitted = answers;
  let score = 0;
  quiz.questions.forEach((q, idx) => {
    if (q.correctAnswer === submitted[idx]) score += 1;
  });

  const answer = await Answer.create({ quizId, studentId: req.user._id, answers: submitted, score });
  res.status(201).json({ message: "Quiz submitted", score, answerId: answer._id });
});

export const listAnswersForQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId).select("_id createdBy");
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  if (req.user.role === "instructor" && !quiz.createdBy.equals(req.user._id)) {
    return res.status(403).json({ message: "You can only view answers for your quizzes" });
  }

  const filter = { quizId: quiz._id };
  if (req.user.role === "student") filter.studentId = req.user._id;
  const answers = await Answer.find(filter).populate("studentId", "name email");
  res.json(answers);
});
