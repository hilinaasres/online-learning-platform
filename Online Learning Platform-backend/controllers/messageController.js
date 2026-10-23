import Message from "../models/Message.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const { from, to, text } = req.body;
  if (!from || !to || !text) {
    return res.status(400).json({ message: "from, to, and text are required" });
  }

  const message = await Message.create({ from, to, text });
  res.status(201).json({ message: "Message sent", id: message._id });
});

export const listMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    $or: [{ from: req.params.userId }, { to: req.params.userId }],
  })
    .populate("from", "name email role")
    .populate("to", "name email role")
    .sort({ createdAt: 1 });

  res.json(messages);
});
