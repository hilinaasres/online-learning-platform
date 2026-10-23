import { createHash, randomBytes } from "node:crypto";
import User, { publicUser } from "../models/User.js";
import { findUserByEmail, findUserForLogin } from "../services/userService.js";
import { comparePassword, hashPassword } from "../services/passwordService.js";
import { createAccessToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: "User already exists" });
  }

  const user = await User.create({
    name,
    email,
    password: await hashPassword(password),
    role: "student",
  });

  res.status(201).json({
    message: "User registered",
    userId: user._id,
    user: publicUser(user),
    token: createAccessToken(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserForLogin(email);

  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    message: "Login successful",
    user: publicUser(user),
    token: createAccessToken(user),
  });
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (user) {
    const token = randomBytes(32).toString("hex");
    user.passwordResetTokenHash = createHash("sha256").update(token).digest("hex");
    user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    if (process.env.NODE_ENV !== "production") {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      console.info(`Password reset link for ${user.email}: ${frontendUrl}/reset-password?token=${token}`);
    }
  }

  res.json({ message: "If an account exists for that email, a password reset link will be generated." });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const tokenHash = createHash("sha256").update(req.body.token).digest("hex");
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select("+passwordResetTokenHash +passwordResetExpiresAt +password");

  if (!user) {
    return res.status(400).json({ message: "Password reset link is invalid or expired" });
  }

  user.password = await hashPassword(req.body.password);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  res.json({ message: "Password has been reset. You can now log in." });
});
