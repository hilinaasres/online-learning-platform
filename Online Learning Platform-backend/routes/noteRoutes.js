import { Router } from "express";
import { createNote, listNotes } from "../controllers/noteController.js";

const router = Router();
router.get("/", listNotes);
router.post("/", createNote);
export default router;
