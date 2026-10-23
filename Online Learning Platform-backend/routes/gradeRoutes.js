import { Router } from "express";
import { createGrade, listGrades } from "../controllers/gradeController.js";

const router = Router();
router.post("/", createGrade);
router.get("/", listGrades);
router.get("/:studentId", listGrades);
export default router;
