import express from "express";
import type { Request, Response } from "express";
import "dotenv/config";
import OpenAI from "openai";
import z from "zod"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// let lastResponseId : string | null = ""
//conversationId -> lastResponseId
// conv1 -> 100
// conv2 -> 200
const conversations = new Map<string,string>();
const chatSchema = z.object({
  prompt : z.string()
  .trim()
  .min(1, "Prompt is required")
  .max(100,"Prompt is too long (max 100 characters)"),
  conversationId : z.string()
  .uuid() 
})

app.post("/api/chat", async (req: Request, res: Response) => {
  const parseResult = chatSchema.safeParse(req.body);

  if(!parseResult.success){
    res.status(400).json(parseResult.error.format());
    return;
  }try {
    
      const { prompt , conversationId } = req.body;
  
      const response = await client.responses.create({
          model : "gpt-4o-mini",
          input : prompt,
          temperature : 0.2,
          max_output_tokens : 150,
          previous_response_id : conversations.get(conversationId)
      })
  
      conversations.set(conversationId,response.id);
  
      res.json({
          message : response.output_text
      })
  } catch (error) {
    res.status(500).json({error : "Failed to generate a response"})
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send(process.env.OPENAI_API_KEY);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
