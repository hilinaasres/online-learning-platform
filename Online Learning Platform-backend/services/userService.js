import User from "../models/User.js";

export function findUserByEmail(email) {
  return User.findOne({ email: String(email).toLowerCase() });
}

export function findUserForLogin(email) {
  return User.findOne({ email: String(email).toLowerCase() }).select("+password");
}
