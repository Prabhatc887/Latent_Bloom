import { GoogleGenAI, Modality } from "@google/genai";

/**
 * INITIALIZATION
 * Note: If you are using Vite, use: import.meta.env.VITE_GEMINI_API_KEY
 * If using Node/Express, use: process.env.API_KEY
 */
const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

/**
 * 1. VISION: Describes an image
 * Uses 'gemini-3-flash' which is the newest multimodal model for 2026.
 */
export const generateImageDescription = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash", // Best multimodal model for 2026
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            { text: "Provide a short, vivid, and engaging description of this image. Keep it under 50 words." }
          ]
        }
      ]
    });

    // Extract text using the new SDK's structure
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No description generated.");
    return text;
  } catch (error) {
    console.error("Vision API Error:", error);
    throw error;
  }
};

/**
 * 2. SPEECH: Converts text to audio
 * Uses 'gemini-2.5-flash-preview-tts' - the dedicated model for native audio output.
 */
export const generateSpeechFromText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts", // Dedicated TTS model variant
      contents: [{ role: "user", parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { 
              voiceName: 'Kore' // Options: 'Kore', 'Fenrir', 'Puck', 'Charon', 'Zephyr'
            }
          }
        }
      }
    });

    // Extract audio base64 data
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) throw new Error("No audio data generated.");
    return base64Audio;
  } catch (error) {
    console.error("TTS API Error:", error);
    throw error;
  }
};