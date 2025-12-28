import express from "express";
import type { Request, Response } from "express";
import "dotenv/config";
import { chatController } from "./controllers/chat.controller";

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;



app.post("/api/chat", chatController.sendMessage);

app.get("/", (req: Request, res: Response) => {
  res.send(process.env.OPENAI_API_KEY);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
