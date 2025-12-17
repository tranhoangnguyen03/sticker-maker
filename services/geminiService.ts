import { GoogleGenAI } from "@google/genai";
import { StickerStyle, CUSTOM_STYLE_ID } from "../types";

const GEMINI_MODEL = 'gemini-3-pro-image-preview';

/**
 * Converts a Blob/File to a Base64 string suitable for the Gemini API.
 */
const fileToGenerativePart = async (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Fetches the blob from a local object URL (used for the canvas output).
 */
const urlToBlob = async (url: string): Promise<Blob> => {
  const response = await fetch(url);
  return await response.blob();
};

// Simple in-memory cache to prevent fetching the same prompt file multiple times in a session
const PROMPT_CACHE = new Map<string, string>();

/**
 * Dynamically fetches a prompt markdown file.
 */
const getPrompt = async (path: string): Promise<string> => {
  if (PROMPT_CACHE.has(path)) {
    return PROMPT_CACHE.get(path)!;
  }

  // Very basic fallback logic for essential system prompts only
  const fallback = (name: string) => {
    if (name.includes('base.md')) return "Generate a high-quality die-cut sticker based on this image. The output must be a single sticker on a transparent or solid white background. Add a thick white border around the subject.";
    if (name.includes('manual.md')) return "IMPORTANT: I have drawn a crude red line/circle around the specific object I want you to extract. Use this red marking to identify the subject.";
    if (name.includes('auto.md')) return "Automatically identify the main salient subject of the image and isolate it.";
    return ""; // No fallback for specific styles, they should exist
  };

  try {
    const response = await fetch(path);
    
    if (!response.ok) {
      console.warn(`Could not load external prompt file '${path}', using fallback.`);
      return fallback(path);
    }
    
    const text = await response.text();
    PROMPT_CACHE.set(path, text.trim());
    return text.trim();
  } catch (error) {
    console.warn(`Error fetching prompt '${path}', using fallback.`, error);
    return fallback(path);
  }
};

export const generateSticker = async (
  apiKey: string,
  imageInput: string | File, // Can be a File object or a blob URL string
  style: StickerStyle,
  hasManualDrawing: boolean
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // 1. Determine which prompts to load
    const promptPromises = [
      getPrompt('prompts/base.md'),
      hasManualDrawing ? getPrompt('prompts/manual.md') : getPrompt('prompts/auto.md')
    ];

    // 2. Handle Style Prompt
    // If it's a preset, we fetch the file. If it's custom, we use the user's input directly.
    let stylePrompt = "";
    if (style.id === CUSTOM_STYLE_ID) {
        stylePrompt = style.promptModifier;
    } else {
        // Fetch the preset style file
        // We push this to the promises array to fetch in parallel
        promptPromises.push(getPrompt(`prompts/styles/${style.id}.md`));
    }

    // 3. Resolve all prompts
    const results = await Promise.all(promptPromises);
    const basePrompt = results[0];
    const guidancePrompt = results[1];
    
    // If we fetched a style file, it will be the 3rd result. Otherwise use the custom string.
    if (style.id !== CUSTOM_STYLE_ID) {
        stylePrompt = results[2];
    }

    // 4. Prepare Image
    let imageBlob: Blob | File;
    if (typeof imageInput === 'string') {
        imageBlob = await urlToBlob(imageInput);
    } else {
        imageBlob = imageInput;
    }
    const base64Image = await fileToGenerativePart(imageBlob);

    // 5. Construct final prompt
    const fullPrompt = `${basePrompt}
    ${stylePrompt}
    ${guidancePrompt}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // We assume PNG/JPEG usually
              data: base64Image
            }
          },
          {
            text: fullPrompt
          }
        ]
      },
      config: {
          imageConfig: {
              aspectRatio: "1:1", 
              imageSize: "1K"
          }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content returned from Gemini");
    }

    const imagePart = parts.find(p => p.inlineData);

    if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    }

    throw new Error("No image data found in generation result");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
