import Message from "../models/Message.js";
import User from "../models/User.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const { to, text } = req.body;
  const recipient = await User.findById(to).select("_id role");
  if (!recipient) {
    return res.status(404).json({ message: "Recipient not found" });
  }

  const allowedRecipient =
    req.user.role === "admin" ||
    (req.user.role === "student" && recipient.role === "instructor") ||
    (req.user.role === "instructor" && recipient.role === "student");
  if (!allowedRecipient) {
    return res.status(403).json({ message: "Messages are only allowed between students and instructors" });
  }

  const message = await Message.create({ from: req.user._id, to: recipient._id, text });
  res.status(201).json({ message: "Message sent", id: message._id });
});

export const listMessages = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.params.userId !== req.user._id.toString()) {
    return res.status(403).json({ message: "You can only view your own messages" });
  }

  const filter = req.user.role === "admin"
    ? {}
    : { $or: [{ from: req.user._id }, { to: req.user._id }] };
  const messages = await Message.find(filter)
    .populate("from", "name email role")
    .populate("to", "name email role")
    .sort({ createdAt: 1 });

  res.json(messages);
});
