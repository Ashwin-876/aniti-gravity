
import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem } from '../types';

const getApiKey = () => {
  const usePersonal = localStorage.getItem('use_personal_key') === 'true';
  const userKey = localStorage.getItem('user_gemini_api_key');
  
  // If usePersonal is true AND a valid user key exists, use it.
  if (usePersonal && userKey && userKey.trim() !== '') {
    return userKey;
  }
  
  // Default to the provided environment API KEY
  return (process.env.API_KEY as string) || "";
};

export const getAiInstance = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    // We throw a more descriptive error or handle it gracefully in the UI
    console.warn("No Gemini API Key found. AI features may not function.");
  }
  return new GoogleGenAI({ apiKey });
};

export const getQuickTip = async (itemName: string) => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a single, 10-word tip for storing ${itemName} to maximize freshness.`,
    });
    return response.text;
  } catch (e) {
    console.error("Fast AI error", e);
    return "Keep in a cool, dry place.";
  }
};

export const generateHighQualityImage = async (itemName: string, aspectRatio: string = "1:1"): Promise<string | null> => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A vibrant, friendly, high-quality 3D clay-style illustration of ${itemName} on a soft pastel background.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    return null;
  } catch (e) {
    console.error("Image generation error", e);
    return null;
  }
};

export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/wav', data: base64Audio } },
          { text: "Transcribe this audio exactly. Return only the text." }
        ]
      }
    });
    return response.text || "";
  } catch (e) {
    console.error("Transcription error", e);
    return "";
  }
};

export const getRecipeSuggestions = async (items: FoodItem[], filters?: { cuisine?: string, diet?: string, maxCalories?: string, maxTime?: string, additionalContext?: string }) => {
  try {
    const ai = getAiInstance();
    const itemNames = items.map(i => i.name).join(', ');
    
    let prompt = `Suggest exactly 3 delicious recipes using: ${itemNames}.`;
    if (filters?.additionalContext) prompt += ` ${filters.additionalContext}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
              prepTime: { type: Type.STRING },
              calories: { type: Type.STRING }
            },
            required: ['title', 'ingredients', 'instructions', 'prepTime']
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
};

export const analyzeWastePatterns = async (wasteHistory: any[]) => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze this food waste history and provide 3 expert actionable insights: ${JSON.stringify(wasteHistory)}`,
    });
    return response.text;
  } catch (e) {
    return "Keep tracking to see insights.";
  }
};
