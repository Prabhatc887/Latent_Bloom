import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CropData } from "../types";

const cropSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    cropName: { type: Type.STRING, description: "Common name of the crop in English" },
    scientificName: { type: Type.STRING, description: "Scientific name of the crop" },
    stages: {
      type: Type.ARRAY,
      description: "A list of exactly 5 growth stages: Sowing, Vegetative, Flowering, Fruiting, Harvest.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          name: { type: Type.STRING, description: "Name of the stage (e.g., Sowing)" },
          duration: { type: Type.STRING, description: "Typical duration of this stage in Nepal (e.g., '2 weeks')" },
          description: { type: Type.STRING, description: "Visual description of the crop at this stage" },
          advice: {
            type: Type.OBJECT,
            properties: {
              water: { type: Type.STRING, description: "Watering advice (e.g., 'Keep soil moist')" },
              fertilizer: { type: Type.STRING, description: "Fertilizer advice" },
              pests: { type: Type.STRING, description: "Common pests to watch for" },
              general: { type: Type.STRING, description: "General care tip" }
            },
            required: ["water", "fertilizer", "pests", "general"]
          }
        },
        required: ["id", "name", "duration", "description", "advice"]
      }
    }
  },
  required: ["cropName", "stages"]
};

export const analyzeCropImage = async (base64Image: string): Promise<CropData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `Analyze this image. If it is a crop, identify it. 
            Then, act as an agricultural expert for farming in Nepal. 
            Generate a detailed 5-stage lifecycle guide for this specific crop (Sowing, Vegetative, Flowering, Fruiting, Harvest).
            Ensure the advice is practical for Nepalese farmers, considering the local climate and traditional methods where applicable.
            If the image is not a crop, return a generic error in the cropName field explaining it is not recognized.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: cropSchema,
        systemInstruction: "You are an expert agronomist specialized in Nepalese agriculture. Provide helpful, supportive advice.",
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as CropData;
      return data;
    } else {
      throw new Error("No response from Gemini");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
