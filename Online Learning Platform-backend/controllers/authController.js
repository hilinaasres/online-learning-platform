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
