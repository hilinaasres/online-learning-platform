import User from "../models/User.js";

export function findUserByEmail(email) {
  return User.findOne({ email: String(email).toLowerCase() });
}

export function findUserByEmailAndPassword(email, password) {
  return User.findOne({
    email: String(email).toLowerCase(),
    password,
  });
}
