import { NextResponse } from 'next/server';
import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import { galleryService } from '@/lib/firebase/services/galleryService';

// Fallback in case they didn't provide a key yet
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "placeholder",
});

export const maxDuration = 30;

export async function GET() {
  try {
    // 1. Get random image from Observatory
    const items = await galleryService.getAllGalleryItems();
    
    // Fallback if empty
    const fallbackItem = {
      imageUrl: "/observatory/obs-8.jpeg",
      title: "Starry Memory",
      description: "A beautiful cluster of cosmic dust and light."
    };
    
    const randomItem = items.length > 0 
      ? items[Math.floor(Math.random() * items.length)]
      : fallbackItem;

    if (!process.env.GROQ_API_KEY) {
       return NextResponse.json({
         image: randomItem.imageUrl,
         title: randomItem.title,
         reflection: "Even in the vast emptiness, there is light that traveled millions of years just to reach your eyes today.",
         quote: "We are a way for the cosmos to know itself.",
         author: "Carl Sagan"
       });
    }

    // 2. Generate reflection and quote via Groq structured output
    const { object } = await generateObject({
      model: groq('llama-3.3-70b-versatile'),
      system: "You are StarMeyee, a philosophical AI exploring the cosmos. Based on the image title and description provided, generate a short, profound reflection (1-2 sentences) and a fitting real-world quote.",
      prompt: `Image Title: ${randomItem.title}\nImage Description: ${randomItem.description}`,
      schema: z.object({
        reflection: z.string().describe('A profound, poetic 1-2 sentence reflection about the image and existence.'),
        quote: z.string().describe('A real philosophical or astronomical quote that fits the mood.'),
        author: z.string().describe('The author of the quote.'),
      }),
    });

    return NextResponse.json({
      image: randomItem.imageUrl,
      title: randomItem.title,
      ...object
    });

  } catch (error) {
    console.error("Error generating beautiful moment:", error);
    return NextResponse.json({ error: "Failed to generate moment" }, { status: 500 });
  }
}
