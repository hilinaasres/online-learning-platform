import User, { publicUser } from "../models/User.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const listUsers = asyncHandler(async (req, res) => {
  const roleFilter = req.user.role === "admin"
    ? {}
    : { role: req.user.role === "instructor" ? "student" : "instructor" };
  const users = await User.find(roleFilter, "_id name email role");
  res.json(users.map(publicUser));
});
