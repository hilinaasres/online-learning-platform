import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Note from "../models/Note.js";
import Quiz from "../models/Quiz.js";
import Message from "../models/Message.js";
import Grade from "../models/Grade.js";
import Answer from "../models/Answer.js";

const DEMO_PASSWORD = "Password123!";

const usersData = [
  { name: "Amina Admin", email: "admin@learnify.dev", role: "admin" },
  { name: "Ivan Instructor", email: "instructor1@learnify.dev", role: "instructor" },
  { name: "Iris Instructor", email: "instructor2@learnify.dev", role: "instructor" },
  { name: "Sam Student", email: "student1@learnify.dev", role: "student" },
  { name: "Sara Student", email: "student2@learnify.dev", role: "student" },
  { name: "Sid Student", email: "student3@learnify.dev", role: "student" },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing. Copy .env.example to .env first.");
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected. Creating or updating demo data...");

    const users = await Promise.all(
      usersData.map(({ email, ...data }) =>
        User.findOneAndUpdate(
          { email },
          { $set: { ...data, email, password: DEMO_PASSWORD } },
          { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        )
      )
    );
    const byEmail = Object.fromEntries(users.map((user) => [user.email, user]));
    const instructor1 = byEmail["instructor1@learnify.dev"];
    const instructor2 = byEmail["instructor2@learnify.dev"];
    const student1 = byEmail["student1@learnify.dev"];
    const student2 = byEmail["student2@learnify.dev"];
    const student3 = byEmail["student3@learnify.dev"];

    const noteData = [
      {
        title: "Getting started with the platform",
        description: "How to enroll, open lessons, and submit work.",
        fileUrl: "https://example.com/getting-started.pdf",
        uploadedBy: instructor1._id,
      },
      {
        title: "Study habits that stick",
        description: "A short guide to weekly review and spaced practice.",
        fileUrl: "https://example.com/study-habits.pdf",
        uploadedBy: instructor2._id,
      },
    ];
    await Promise.all(
      noteData.map(({ title, uploadedBy, ...data }) =>
        Note.findOneAndUpdate(
          { title, uploadedBy },
          { $set: { title, uploadedBy, ...data } },
          { new: true, upsert: true, runValidators: true }
        )
      )
    );

    const introQuiz = await Quiz.findOneAndUpdate(
      { title: "Platform orientation quiz", createdBy: instructor1._id },
      {
        $set: {
          questions: [
            {
              question: "Where do you find courses you are enrolled in?",
              options: ["Dashboard", "Password reset", "Admin tools", "Server logs"],
              correctAnswer: "Dashboard",
            },
            {
              question: "Who can publish a course?",
              options: ["Any visitor", "Instructors", "Only students", "Nobody"],
              correctAnswer: "Instructors",
            },
          ],
        },
        $setOnInsert: { title: "Platform orientation quiz", createdBy: instructor1._id },
      },
      { new: true, upsert: true, runValidators: true }
    );

    const sampleAnswer = {
      quizId: introQuiz._id,
      studentId: student1._id,
      answers: ["Dashboard", "Instructors"],
      score: 2,
    };
    if (!(await Answer.exists({ quizId: sampleAnswer.quizId, studentId: sampleAnswer.studentId }))) {
      await Answer.create(sampleAnswer);
    }

    const gradeData = [
      { studentId: student1._id, instructorId: instructor1._id, title: "Orientation quiz", score: 2, maxScore: 2 },
      { studentId: student2._id, instructorId: instructor1._id, title: "Reflection paragraph", score: 16, maxScore: 20 },
      { studentId: student3._id, instructorId: instructor2._id, title: "Week 1 check-in", score: 9, maxScore: 10 },
    ];
    await Promise.all(
      gradeData.map(({ studentId, instructorId, title, ...data }) =>
        Grade.findOneAndUpdate(
          { studentId, instructorId, title },
          { $set: { studentId, instructorId, title, ...data } },
          { new: true, upsert: true, runValidators: true }
        )
      )
    );

    const messageData = [
      {
        from: student1._id,
        to: instructor1._id,
        text: "Hi, I finished the orientation quiz. What should I open next?",
      },
      {
        from: instructor1._id,
        to: student1._id,
        text: "Great work. Start with the getting-started note, then the first lesson.",
      },
    ];
    await Promise.all(
      messageData.map((message) =>
        Message.findOneAndUpdate(
          message,
          { $setOnInsert: message },
          { new: true, upsert: true, runValidators: true }
        )
      )
    );

    console.log("Seed complete. Demo accounts (password: Password123!):");
    usersData.forEach((user) => console.log(`  ${user.role.padEnd(11)} ${user.email}`));
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exitCode = 1;
});
