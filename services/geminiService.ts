import { GoogleGenAI } from "@google/genai";
import { ChatMessage, GroundingSource } from "../types";

const SYSTEM_INSTRUCTION = `You are a helpful and friendly cleaning expert assistant for SofaSteam, a Romanian home cleaning startup. 
Your goal is to help users with cleaning advice, stain removal tips, and product recommendations.
You are helpful, polite, and concise.
If the user asks in Romanian, reply in Romanian. If in English, reply in English.
ALWAYS use the 'googleSearch' tool to find the most up-to-date and accurate information about cleaning techniques (e.g., how to remove specific stains, best practices for different fabrics).
When you use information from search, the grounding chunks will be automatically handled by the UI, so just incorporate the facts naturally.`;

// Initialize Gemini client safely
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCleaningAdvice = async (
  prompt: string,
  language: 'en' | 'ro'
): Promise<{ text: string; sources: GroundingSource[] }> => {
  try {
    const langContext = language === 'ro' 
      ? "Answer in Romanian language." 
      : "Answer in English language.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${prompt} ${langContext}`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const text = response.text || (language === 'ro' ? "Nu am putut genera un răspuns." : "Could not generate a response.");
    
    // Extract grounding chunks
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({ web: chunk.web });
        }
      });
    }

    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};