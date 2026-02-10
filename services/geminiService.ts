
import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult, VisualizationSource } from "../types";

const SEARCH_MODEL = 'gemini-3-flash-preview';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

export const performTopicSearch = async (topic: string): Promise<SearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: SEARCH_MODEL,
    contents: `Analyze the topic "${topic}". Identify 4 distinct types of visualizations (e.g., specific charts, diagrams, maps, or photos). 
    CRITICAL: At least one of these must be an "iconic personal-style photo" typical of Wikimedia Commons Creative Commons media (realistic, documentary style).
    For each, provide a title and a vivid 2-sentence description of what the visualization looks like. 
    Also provide a summary of the topic's visual landscape.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          visualizations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['chart', 'photo', 'diagram', 'map'] }
              },
              required: ['title', 'description', 'type']
            }
          }
        },
        required: ['summary', 'visualizations']
      }
    },
  });

  const rawText = response.text;
  const data = JSON.parse(rawText);
  
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const groundingLinks = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title,
      uri: chunk.web.uri
    }));

  return {
    summary: data.summary,
    visualizations: data.visualizations,
    groundingLinks
  };
};

export const generateNanoBananaImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate) {
      throw new Error("No candidates returned from the image model.");
    }

    // Iterate through parts to find the image
    for (const part of candidate.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // If no image, check for a text explanation (often a safety refusal)
    const textPart = candidate.content?.parts?.find(p => p.text);
    if (textPart?.text) {
      throw new Error(`Model Refusal: ${textPart.text}`);
    }

    throw new Error("No image data returned from model. This usually happens if the prompt triggered a safety filter or failed to generate.");
  } catch (err: any) {
    console.error("Image generation error:", err);
    throw err;
  }
};
