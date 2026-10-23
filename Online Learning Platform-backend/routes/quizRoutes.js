import { Router } from "express";
import { createQuiz, listQuizzes } from "../controllers/quizController.js";

const router = Router();
router.get("/", listQuizzes);
router.post("/", createQuiz);
export default router;
