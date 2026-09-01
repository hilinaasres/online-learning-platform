// server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(cors());
app.use(express.json());

// ------------------ MONGODB CONNECTION ------------------
mongoose.connect("mongodb://127.0.0.1:27017/physics", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Connection Error:", err));

// ------------------ SCHEMAS & MODELS ------------------

// User
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String // "student" or "teacher"
});
const User = mongoose.model("User", userSchema);

// Note
const noteSchema = new mongoose.Schema({
  title: String,
  description: String,
  fileUrl: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});
const Note = mongoose.model("Note", noteSchema);

// Quiz
const quizSchema = new mongoose.Schema({
  title: String,
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String
    }
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});
const Quiz = mongoose.model("Quiz", quizSchema);

// Answer
const answerSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  answers: [String],
  score: Number,
  submittedAt: { type: Date, default: Date.now }
});
const Answer = mongoose.model("Answer", answerSchema);

// Message
const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model("Message", messageSchema);

// Grade
const gradeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  score: Number,
  maxScore: Number,
  createdAt: { type: Date, default: Date.now }
});
const Grade = mongoose.model("Grade", gradeSchema);

// ------------------ ROUTES ------------------

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.json({ message: "User already exists" });

    const user = new User({ name, email, password, role });
    await user.save();

    console.log("New user registered:", user);
    res.json({ message: "User registered", userId: user._id });
  } catch (err) {
    console.log("Error in register:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.json({ message: "Invalid credentials" });

    res.json({ message: "Login successful", user });
  } catch (err) {
    console.log("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPLOAD NOTE (Teacher)
app.post("/notes", async (req, res) => {
  try {
    const { title, description, fileUrl, teacherId } = req.body;
    const note = new Note({ title, description, fileUrl, uploadedBy: teacherId });
    await note.save();
    res.json({ message: "Note uploaded" });
  } catch (err) {
    console.log("Upload note error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET NOTES (Student)
app.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find().populate("uploadedBy", "name email");
    res.json(notes);
  } catch (err) {
    console.log("Get notes error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE QUIZ (Teacher)
app.post("/quiz", async (req, res) => {
  try {
    const { title, questions, teacherId } = req.body;
    const quiz = new Quiz({ title, questions, createdBy: teacherId });
    await quiz.save();
    res.json({ message: "Quiz created" });
  } catch (err) {
    console.log("Create quiz error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET QUIZZES (Student)
app.get("/quiz", async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("createdBy", "name email");
    res.json(quizzes);
  } catch (err) {
    console.log("Get quiz error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// SUBMIT QUIZ ANSWER (Student)
app.post("/answer", async (req, res) => {
  try {
    const { quizId, studentId, answers } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (q.correctAnswer === answers[idx]) score++;
    });

    const answer = new Answer({ quizId, studentId, answers, score });
    await answer.save();

    res.json({ message: "Quiz submitted", score });
  } catch (err) {
    console.log("Submit answer error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET STUDENT ANSWERS (Teacher)
app.get("/answers/:quizId", async (req, res) => {
  try {
    const answers = await Answer.find({ quizId: req.params.quizId }).populate("studentId", "name email");
    res.json(answers);
  } catch (err) {
    console.log("Get answers error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// MESSAGING
app.post("/message", async (req, res) => {
  try {
    const { from, to, text } = req.body;
    const message = new Message({ from, to, text });
    await message.save();
    res.json({ message: "Message sent" });
  } catch (err) {
    console.log("Message error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET MESSAGES
app.get("/messages/:userId", async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ from: req.params.userId }, { to: req.params.userId }]
    })
      .populate("from", "name email")
      .populate("to", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.log("Get messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "_id name email role");
    res.json(users);
  } catch (err) {
    console.log("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST GRADE
app.post("/grade", async (req, res) => {
  try {
    const { studentId, teacherId, title, score, maxScore } = req.body;
    const g = new Grade({ studentId, teacherId, title, score, maxScore });
    await g.save();
    res.json({ message: "Grade saved" });
  } catch (err) {
    console.log("Save grade error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET GRADES (optional filter by student)
app.get("/grades/:studentId?", async (req, res) => {
  try {
    const filter = {};
    if (req.params.studentId) filter.studentId = req.params.studentId;
    const grades = await Grade.find(filter).populate("studentId", "name email").populate("teacherId", "name email");
    res.json(grades);
  } catch (err) {
    console.log("Get grades error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ START SERVER ------------------
const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));