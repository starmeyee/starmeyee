import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { novelService } from '@/lib/firebase/services/novelService';
import { productService } from '@/lib/firebase/services/productService';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "placeholder",
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { feeling } = await req.json();
    
    if (!process.env.GROQ_API_KEY) {
      // Fallback for when no API key is provided
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("Type: Novel | Title: Whispers of the Cosmos | Url: /writes/whispers-of-the-cosmos | Reason: Even when the API is resting, the universe provides. This story will guide you through the quiet philosophical moments of human connection."));
          controller.close();
        }
      });
      return new Response(stream, { headers: { 'Content-Type': 'text/plain' } });
    }

    // Fetch available content to recommend from
    const [novels, products] = await Promise.all([
      novelService.getAllNovels().catch(() => []),
      productService.getAllProducts().catch(() => [])
    ]);

    const publishedNovels = novels.filter(n => n.status === "published").slice(0, 5);
    const publishedProducts = products.filter(p => p.status === "published").slice(0, 5);

    let contentContext = "Available Novels:\n";
    publishedNovels.forEach(n => {
      contentContext += `- Title: ${n.title}, Slug: /writes/${n.slug}, Desc: ${n.description}\n`;
    });
    
    contentContext += "\nAvailable Creations (Products):\n";
    publishedProducts.forEach(p => {
      contentContext += `- Title: ${p.title}, Url: ${p.gumroadUrl || '#'}, Desc: ${p.description}\n`;
    });

    if (publishedNovels.length === 0 && publishedProducts.length === 0) {
      contentContext += "If no specific content matches, recommend the fallback novel 'Whispers of the Cosmos' at '/writes/whispers-of-the-cosmos'.";
    }

    const systemPrompt = `You are StarMeyee, a cosmic guide. The user will share their current feeling.
Based on their feeling, recommend exactly ONE item from the provided catalog that aligns best with their spirit.
Your response MUST be in this exact strict format:
Type: [Novel or Creation] | Title: [Title of the item] | Url: [Url or Slug] | Reason: [A beautiful, 2-sentence poetic explanation of why this will help them based on their feeling.]

Catalog context:
${contentContext}`;

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      prompt: `Feeling: ${feeling}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Recommendation error:", error);
    return new Response("Error generating recommendation", { status: 500 });
  }
}
