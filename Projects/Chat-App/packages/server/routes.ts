import express from "express";
import type { Request, Response } from "express";
import { chatController } from "./controllers/chat.controller";

const router = express.Router();

router.post("/api/chat", chatController.sendMessage);

router.get("/", (req: Request, res: Response) => {
  res.send(process.env.OPENAI_API_KEY);
});

export default router