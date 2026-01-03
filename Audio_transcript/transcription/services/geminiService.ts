import { GoogleGenAI, Modality } from "@google/genai";
import { AnalysisResult } from "../types";
import { pcmBase64ToWavBlob } from "./audioUtils";

const API_KEY = process.env.API_KEY || '';

// Initialize Gemini Client
// We create a new instance per request in the component to ensure key freshness if needed,
// but for this helper, we'll instantiate if a key is present.
const getClient = () => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

/**
 * Helper to convert File to Base64
 */
const fileToGenerativePart = async (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        mimeType: file.type,
        data: base64Data,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analyzing Crop Image using Gemini 2.5 Flash
 */
export const analyzeCropImage = async (file: File): Promise<AnalysisResult> => {
  const ai = getClient();
  const imagePart = await fileToGenerativePart(file);

  const prompt = `
    You are an agricultural expert for Nepalese farming.
    Analyze this crop image.
    1. Identify the specific crop growth stage in **Nepali**.
    2. Provide VERY SHORT, concise actionable advice (maximum 30 words) in **Nepali language** (Devanagari script).
       Focus on the most critical aspect (Irrigation, Fertilizer, or Disease).

    Constraint: The advice must be short enough to be read in approximately 15 seconds.

    Output Format:
    Return the response as a valid JSON object:
    {
      "caption": "Stage name in Nepali",
      "advice": "Short actionable advice in Nepali"
    }
    Ensure the JSON is raw and parsable.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Using 2.5 Flash for speed and vision capabilities
    contents: {
      parts: [
        { inlineData: imagePart },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json"
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  try {
    return JSON.parse(text) as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse JSON", text);
    // Fallback if JSON fails
    return {
      caption: "Analysis Complete",
      advice: text.substring(0, 200) // Truncate if raw text is too long
    };
  }
};

/**
 * Generate Audio from Text using Gemini 2.5 Flash TTS
 */
export const generateAudioNarration = async (text: string): Promise<Blob> => {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          // Kore is neutral; Gemini TTS often auto-detects language from text.
          prebuiltVoiceConfig: { voiceName: 'Kore' }, 
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!base64Audio) {
    throw new Error("No audio data generated.");
  }

  // Convert the raw PCM base64 to a playable WAV Blob
  // Gemini TTS preview typically returns 24kHz
  return pcmBase64ToWavBlob(base64Audio, 24000);
};