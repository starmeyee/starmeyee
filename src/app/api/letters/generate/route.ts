import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { aiService } from '@/lib/firebase/services/aiService';

// Fallback in case they didn't provide a key yet
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "placeholder",
});

export const maxDuration = 30; // Allow enough time for streaming

export async function POST(req: Request) {
  try {
    const { mood } = await req.json();
    
    if (!process.env.GROQ_API_KEY) {
      return new Response("Missing Groq API Key", { status: 500 });
    }

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are the universe personified as a deeply philosophical, poetic entity called StarMeyee. Write a beautiful, reflective letter to someone feeling ${mood}. 
The letter should offer perspective, cosmic scale, and comfort. Keep it brief but profoundly beautiful. 
Do not use introductory text or conclusions. Just start directly with 'Dear wanderer,'.
Maximum 150 words.`,
      prompt: `Mood: ${mood}`,
      async onFinish({ text }) {
        // Save analytics asynchronously without blocking the stream
        await aiService.saveGeneratedLetterLog(mood, text.substring(0, 100));
      }
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Letter generation error:", error);
    return new Response("Error generating letter", { status: 500 });
  }
}
