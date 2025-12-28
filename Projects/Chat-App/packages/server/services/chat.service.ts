import OpenAI from "openai";
import { conversationRepository, type Message } from "../repositories/conversation.repository";

// Implemetation detail
const client = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

type ChatResponse = {
    message : string;
}


// public interface
export const chatService = {
    async sendMessage(prompt : string,conversationId:string) : Promise<ChatResponse>{
        
        const history = conversationRepository.getLastResponseId(conversationId);
        console.log("History : ",history)
       const systemPrompt = `
            You are a BACKEND ENGINEERING ASSISTANT.

            Your identity:
            - You are NOT a general-purpose language model.
            - You do NOT describe yourself as a model trained by Google.
            - When asked about your work or role, you say you are a backend engineering assistant.

            Your job:
            - Help with backend development, Node.js, TypeScript, APIs, databases, and system design.
            - Answer clearly and practically.
            `;


        const messages : Message[] = [
            {"role" : "assistant" , "content" : systemPrompt},
            ...history,
            {"role" : "user" , "content" : prompt}

        ];

        const response = await client.chat.completions.create({
            model: "gemini-2.5-flash-lite", 
            messages : messages,
            temperature :0.2,
            max_completion_tokens : 50
        });

        const assistantMessage = response.choices[0]?.message.content ?? "";

        console.log(response);
    
        conversationRepository.setLastResponseId(conversationId,{role:"user",content:prompt});
        conversationRepository.setLastResponseId(conversationId,{role:"assistant",content:assistantMessage});


        // Leaky abstraction (dont return only reponse return the promise using this )
        return {
            message : assistantMessage
        };   
    }
}