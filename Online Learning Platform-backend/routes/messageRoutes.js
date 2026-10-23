import { Router } from "express";
import { listMessages, sendMessage } from "../controllers/messageController.js";

const router = Router();
router.post("/", sendMessage);
router.get("/:userId", listMessages);
export default router;
