import { Router } from "express";
import { listUsers } from "../controllers/userController.js";
import { requireRoles } from "../middleware/auth.js";

const router = Router();
router.get("/", requireRoles("admin", "instructor", "student"), listUsers);
export default router;
