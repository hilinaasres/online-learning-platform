import mongoose from "mongoose";

export const USER_ROLES = ["admin", "instructor", "student"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Phase 2 will hash this with bcrypt. Kept plaintext only so existing logins still work.
    password: { type: String, required: true },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "student",
    },
  },
  { timestamps: true }
);

/** Map old "teacher" / mixed-case values onto the current role names. */
export function normalizeRole(role) {
  const value = String(role || "").toLowerCase();
  if (value === "teacher") return "instructor";
  if (USER_ROLES.includes(value)) return value;
  return "student";
}

export function publicUser(user) {
  if (!user) return null;
  const doc = user.toObject ? user.toObject() : user;
  return {
    _id: doc._id,
    name: doc.name,
    email: doc.email,
    role: normalizeRole(doc.role),
  };
}

export default mongoose.model("User", userSchema);
