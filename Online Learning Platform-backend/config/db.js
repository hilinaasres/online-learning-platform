import mongoose from "mongoose";

export async function connectDb(uri) {
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy .env.example to .env.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}
