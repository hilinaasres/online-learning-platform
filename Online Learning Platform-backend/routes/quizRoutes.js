import { Router } from "express";
import { createQuiz, listQuizzes } from "../controllers/quizController.js";
import { requireRoles } from "../middleware/auth.js";
import { schemas, validateBody } from "../middleware/validation.js";

const router = Router();
router.get("/", listQuizzes);
router.post("/", requireRoles("admin", "instructor"), validateBody(schemas.quiz), createQuiz);
export default router;
