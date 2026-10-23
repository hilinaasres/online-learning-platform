import Note from "../models/Note.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const listNotes = asyncHandler(async (_req, res) => {
  const notes = await Note.find().populate("uploadedBy", "name email").sort({ createdAt: -1 });
  res.json(notes);
});

export const createNote = asyncHandler(async (req, res) => {
  const { title, description, fileUrl, instructorId, teacherId } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const note = await Note.create({
    title,
    description,
    fileUrl,
    uploadedBy: instructorId || teacherId,
  });

  res.status(201).json({ message: "Note uploaded", note });
});
