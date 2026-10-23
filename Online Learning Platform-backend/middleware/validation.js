import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Password is too long");
const loginPassword = z
  .string()
  .min(1)
  .max(72)
  .refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Password is too long");

export const schemas = {
  register: z.object({
    name: z.string().trim().min(1).max(100),
    email: z.email().trim().toLowerCase().max(254),
    password,
  }).strict(),
  login: z.object({
    email: z.email().trim().toLowerCase().max(254),
    password: loginPassword,
  }).strict(),
  passwordResetRequest: z.object({
    email: z.email().trim().toLowerCase().max(254),
  }).strict(),
  passwordReset: z.object({
    token: z.string().min(32).max(200),
    password,
  }).strict(),
  note: z.object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().max(2000).optional(),
    fileUrl: z.union([
      z.url().refine((value) => /^https?:\/\//i.test(value), "URL must use HTTP or HTTPS"),
      z.literal(""),
    ]).optional(),
  }).strict(),
  quiz: z.object({
    title: z.string().trim().min(1).max(160),
    questions: z.array(z.object({
      question: z.string().trim().min(1).max(1000),
      options: z.array(z.string().trim().min(1).max(300)).min(2).max(8),
      correctAnswer: z.string().trim().min(1).max(300),
    }).strict().refine(
      (question) => question.options.includes(question.correctAnswer),
      { message: "Correct answer must match one of the options" }
    )).min(1).max(100),
  }).strict(),
  answer: z.object({
    quizId: objectId,
    answers: z.array(z.string().max(300)).max(100),
  }).strict(),
  message: z.object({
    to: objectId,
    text: z.string().trim().min(1).max(5000),
  }).strict(),
  grade: z.object({
    studentId: objectId,
    title: z.string().trim().min(1).max(160),
    score: z.number().finite().min(0),
    maxScore: z.number().finite().positive().optional(),
  }).strict().refine(
    (grade) => grade.maxScore === undefined || grade.score <= grade.maxScore,
    { message: "Score cannot exceed maxScore", path: ["score"] }
  ),
  userId: z.object({ userId: objectId }),
  quizId: z.object({ quizId: objectId }),
  studentId: z.object({ studentId: objectId }),
};

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid request parameters" });
    }
    req.params = result.data;
    next();
  };
}
