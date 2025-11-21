import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SuggestionItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const suggestionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      day: { type: Type.NUMBER, description: "The day number of the trip (1, 2, 3...)" },
      activity: { type: Type.STRING, description: "Name of the activity or place to visit" },
      location: { type: Type.STRING, description: "City or specific area" },
      estimatedCost: { type: Type.NUMBER, description: "Estimated cost per person in local currency" }
    },
    required: ["day", "activity", "location", "estimatedCost"]
  }
};

export const generateItinerarySuggestions = async (
  destination: string,
  days: number,
  budget: number
): Promise<SuggestionItem[]> => {
  try {
    const prompt = `Create a suggested itinerary for a ${days}-day trip to ${destination} with a total budget of ${budget}. 
    Focus on popular tourist attractions and local food. Return a JSON array.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: suggestionSchema,
        systemInstruction: "You are a helpful travel assistant. Provide concise, exciting activity suggestions.",
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as SuggestionItem[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const analyzeExpenseImage = async (base64Image: string): Promise<{ description: string; amount: number; category: string }> => {
    // Simple expense extraction helper
    try {
        const prompt = "Analyze this receipt/invoice. Extract the total amount, a brief description (merchant name), and categorize it into one of: Food, Transport, Shopping, Activity, Accommodation, Flight, Other.";
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: base64Image } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        amount: { type: Type.NUMBER },
                        category: { type: Type.STRING, enum: ['Food', 'Transport', 'Shopping', 'Activity', 'Accommodation', 'Flight', 'Other'] }
                    }
                }
            }
        });
        
        const text = response.text;
        if(!text) throw new Error("No text returned");
        return JSON.parse(text);

    } catch (error) {
        console.error("Expense Analysis Error:", error);
        throw error;
    }
}
