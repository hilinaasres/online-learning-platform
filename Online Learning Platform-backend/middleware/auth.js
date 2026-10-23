import jwt from "jsonwebtoken";
import User, { normalizeRole } from "../models/User.js";
import { asyncHandler } from "./errorHandler.js";

const TOKEN_ISSUER = "learnify-api";
const TOKEN_AUDIENCE = "learnify-client";

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("JWT_SECRET must be set to a random value of at least 32 characters.");
  }
  return secret;
}

export function createAccessToken(user) {
  return jwt.sign(
    { role: normalizeRole(user.role) },
    getJwtSecret(),
    {
      subject: user._id.toString(),
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
      expiresIn: "8h",
    }
  );
}

export const authenticateToken = asyncHandler(async (req, res, next) => {
  const authorization = req.get("authorization") || "";
  const [scheme, token, ...extra] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token || extra.length) {
    return res.status(401).json({ message: "Authentication required" });
  }

  let payload;
  try {
    payload = jwt.verify(token, getJwtSecret(), {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  if (typeof payload === "string" || !payload.sub) {
    return res.status(401).json({ message: "Invalid token" });
  }

  const user = await User.findById(payload.sub).select("_id name email role");
  if (!user) {
    return res.status(401).json({ message: "Account no longer exists" });
  }

  user.role = normalizeRole(user.role);
  req.user = user;
  next();
});

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action" });
    }
    next();
  };
}
