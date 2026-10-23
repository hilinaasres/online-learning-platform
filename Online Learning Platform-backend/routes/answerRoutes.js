import { Router } from "express";
import { listAnswersForQuiz, submitAnswer } from "../controllers/answerController.js";

const router = Router();
router.post("/", submitAnswer);
router.get("/:quizId", listAnswersForQuiz);
export default router;
