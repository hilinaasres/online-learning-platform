import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, register } from "../controllers/authController.js";
import { schemas, validateBody } from "../middleware/validation.js";

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
});

router.post("/register", validateBody(schemas.register), register);
router.post("/login", loginLimiter, validateBody(schemas.login), login);
export default router;
