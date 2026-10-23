import User, { normalizeRole, publicUser } from "../models/User.js";
import { findUserByEmail, findUserByEmailAndPassword } from "../services/userService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: "User already exists" });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: normalizeRole(role),
  });

  res.status(201).json({
    message: "User registered",
    userId: user._id,
    user: publicUser(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await findUserByEmailAndPassword(email, password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    message: "Login successful",
    user: publicUser(user),
  });
});
