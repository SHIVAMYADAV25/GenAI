// import OpenAI from "openai";
// import dotenv from "dotenv";

// dotenv.config();

// const client = new OpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey: "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",
// });

// async function main() {
//   // First API call
//   const apiResponse = await client.chat.completions.create({
//     model: "openai/gpt-oss-120b:free",
//     messages: [
//       {
//         role: "user",
//         content: "How many r's are in the word 'strawberry'?",
//       },
//     ],

//     // OpenRouter-specific
//     // reasoning: {
//     //   enabled: true,
//     // } as any,
//   });

//   type ORChatMessage =
//     (typeof apiResponse)["choices"][number]["message"] & {
//       reasoning_details?: unknown;
//     };

//   const response = apiResponse.choices[0].message as ORChatMessage;

//   console.log("First Response:");
//   console.log(response.content);

//   // Preserve reasoning details
//   const messages = [
//     {
//       role: "user" as const,
//       content: "How many r's are in the word 'strawberry'?",
//     },
//     {
//       role: "assistant" as const,
//       content: response.content ?? "",
//       reasoning_details: response.reasoning_details,
//     },
//     {
//       role: "user" as const,
//       content: "Are you sure? Think carefully.",
//     },
//   ];

//   // Second API call
//   const response2 = await client.chat.completions.create({
//     model: "openai/gpt-oss-120b:free",
//     messages: messages as any,
//   });

//   console.log("\nSecond Response:");
//   console.log(response2.choices[0].message.content);
// }

// main().catch(console.error);


import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AQ.Ab8RN6K3UTMek7WL0LfeLHJy7Dh7yL7vDIAcRo_YS8Pp7Hxf5w",
});

async function main() {
  const doc1 = await ai.models.embedContent({
  model: "gemini-embedding-001",
  contents: "How to reset my password",
});

const doc2 = await ai.models.embedContent({
  model: "gemini-embedding-001",
  contents: "Forgot password recovery",
});

console.log(doc1.embeddings?.[0]?.values.length);
console.log(doc2.embeddings?.[0]?.values.length);
}

main();