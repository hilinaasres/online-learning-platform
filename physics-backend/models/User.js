import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String // "student" or "teacher"
});

export default mongoose.model("User", userSchema);
