import { chatService } from "../services/chat.service";
import type { Request , Response } from "express";
import z from "zod"


// implemetation detail
const chatSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt is required")
    .max(100, "Prompt is too long (max 100 characters)"),
  conversationId: z.string().uuid(),
});

// Public interface
export const chatController  = {
    async sendMessage(req:Request,res:Response){
        const parseResult = chatSchema.safeParse(req.body);

        if (!parseResult.success) {
            res.status(400).json(parseResult.error.format());
            return;
        }
        try {
            const { prompt, conversationId } = req.body;

            const response = await chatService.sendMessage(prompt, conversationId);

            res.json({
            message: (await response).message,
            });
        } catch (error) {
            res.status(500).json({ error: "Failed to generate a response" });
        }
    }
}