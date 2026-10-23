import Note from "../models/Note.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const listNotes = asyncHandler(async (req, res) => {
  const filter = req.user.role === "instructor"
    ? { uploadedBy: req.user._id }
    : {};
  const notes = await Note.find(filter).populate("uploadedBy", "name email").sort({ createdAt: -1 });
  res.json(notes);
});

export const createNote = asyncHandler(async (req, res) => {
  const { title, description, fileUrl } = req.body;
  const note = await Note.create({
    title,
    description,
    fileUrl,
    uploadedBy: req.user._id,
  });

  res.status(201).json({ message: "Note uploaded", note });
});
