import { Router } from "express";
import { listMessages, sendMessage } from "../controllers/messageController.js";
import { schemas, validateBody, validateParams } from "../middleware/validation.js";

const router = Router();
router.post("/", validateBody(schemas.message), sendMessage);
router.get("/:userId", validateParams(schemas.userId), listMessages);
export default router;
