import express from "express";
import type { Request, Response } from "express";
import "dotenv/config";
import OpenAI from "openai";

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

app.post("/api/chat", async (req: Request, res: Response) => {
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
});

app.get("/", (req: Request, res: Response) => {
  res.send(process.env.OPENAI_API_KEY);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
