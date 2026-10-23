import { Router } from "express";
import { listAnswersForQuiz, submitAnswer } from "../controllers/answerController.js";
import { requireRoles } from "../middleware/auth.js";
import { schemas, validateBody, validateParams } from "../middleware/validation.js";

const router = Router();
router.post("/", requireRoles("student"), validateBody(schemas.answer), submitAnswer);
router.get("/:quizId", validateParams(schemas.quizId), listAnswersForQuiz);
export default router;
