import { Router } from "express";
import { createNote, listNotes } from "../controllers/noteController.js";
import { requireRoles } from "../middleware/auth.js";
import { schemas, validateBody } from "../middleware/validation.js";

const router = Router();
router.get("/", listNotes);
router.post("/", requireRoles("admin", "instructor"), validateBody(schemas.note), createNote);
export default router;
