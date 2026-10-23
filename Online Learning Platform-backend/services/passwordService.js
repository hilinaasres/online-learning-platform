import bcrypt from "bcryptjs";
import User, { normalizeRole } from "../models/User.js";

const SALT_ROUNDS = 12;
const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$/;

export function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export async function migrateLegacyPasswords() {
  await User.updateMany({ role: "teacher" }, { $set: { role: "instructor" } });
  const legacyUsers = await User.find({
    password: { $not: BCRYPT_HASH },
  }).select("+password");

  for (const user of legacyUsers) {
    user.password = await hashPassword(user.password);
    user.role = normalizeRole(user.role);
    await user.save();
  }

  if (legacyUsers.length) {
    console.log(`Migrated ${legacyUsers.length} legacy password(s) to bcrypt.`);
  }
}
