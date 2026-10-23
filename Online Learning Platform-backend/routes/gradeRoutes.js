import { Router } from "express";
import { createGrade, listGrades } from "../controllers/gradeController.js";
import { requireRoles } from "../middleware/auth.js";
import { schemas, validateBody, validateParams } from "../middleware/validation.js";

const router = Router();
router.post("/", requireRoles("admin", "instructor"), validateBody(schemas.grade), createGrade);
router.get("/", listGrades);
router.get("/:studentId", validateParams(schemas.studentId), listGrades);
export default router;
