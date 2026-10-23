import User, { publicUser } from "../models/User.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find({}, "_id name email role");
  res.json(users.map(publicUser));
});
