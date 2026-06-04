import { db } from "../config";
import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";

export interface CosmicThought {
  id: string;
  thought: string;
  date: string; // YYYY-MM-DD format
  timestamp: number;
}

export const aiService = {
  // Feature 1: Cosmic Thought of the Day
  async getDailyThought(): Promise<CosmicThought> {
    const today = new Date().toISOString().split("T")[0];
    const docRef = doc(db, "ai_thoughts", today);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as CosmicThought;
    }

    // Generate new thought if not cached for today
    let thoughtText = "The universe is under no obligation to make sense to you, yet we spend our lives trying to make sense of it.";
    
    try {
      if (process.env.GROQ_API_KEY) {
        const groq = createGroq({
          apiKey: process.env.GROQ_API_KEY,
        });

        const { text } = await generateText({
          model: groq("llama-3.3-70b-versatile"),
          system: "You are StarMeyee, a deeply curious, philosophical astronomer who loves Japanese aesthetics and storytelling. Generate a single, profound 'Cosmic Thought of the Day' (max 2 sentences) blending astronomy, human nature, and imagination. Do not use quotes or introductory text.",
          prompt: "Generate today's cosmic thought.",
          temperature: 0.8,
          maxOutputTokens: 150,
        });
        
        if (text) {
          thoughtText = text.trim();
        }
      } else {
        console.warn("No GROQ_API_KEY found, using fallback thought.");
      }
    } catch (error) {
      console.error("Error generating daily thought with Groq:", error);
    }

    const newThought: CosmicThought = {
      id: today,
      thought: thoughtText,
      date: today,
      timestamp: Date.now(),
    };

    // Cache to Firestore
    try {
      await setDoc(docRef, newThought);
    } catch (error) {
      console.error("Error caching daily thought to Firestore:", error);
    }

    return newThought;
  },

  // Save generated letter for analytics
  async saveGeneratedLetterLog(mood: string, snippet: string) {
    try {
      await addDoc(collection(db, "ai_letters_analytics"), {
        mood,
        snippet,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error saving letter analytics:", error);
    }
  }
};
