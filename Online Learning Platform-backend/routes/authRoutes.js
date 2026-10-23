import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  login,
  register,
  requestPasswordReset,
  resetPassword,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import { schemas, validateBody } from "../middleware/validation.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { publicUser } from "../models/User.js";

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
});
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many password reset attempts. Please try again later." },
});

router.post("/register", validateBody(schemas.register), register);
router.post("/login", loginLimiter, validateBody(schemas.login), login);
router.get("/auth/me", authenticateToken, asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
}));
router.post(
  "/password/forgot",
  passwordResetLimiter,
  validateBody(schemas.passwordResetRequest),
  requestPasswordReset
);
router.post(
  "/password/reset",
  passwordResetLimiter,
  validateBody(schemas.passwordReset),
  resetPassword
);
export default router;
