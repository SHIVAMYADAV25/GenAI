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


app.post("/api/chat", async (req: Request, res: Response) => {
    const { prompt } = req.body;

    const response = await client.responses.create({
        model : "gpt-4o-mini",
        input : prompt,
        temperature : 0.2,
        max_output_tokens : 150,
    })

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
