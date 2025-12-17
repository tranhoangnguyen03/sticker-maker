import { GoogleGenAI } from "@google/genai";
import { StickerStyle } from "../types";

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

export const generateSticker = async (
  apiKey: string,
  imageInput: string | File, // Can be a File object or a blob URL string
  style: StickerStyle,
  hasManualDrawing: boolean
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    let imageBlob: Blob | File;
    if (typeof imageInput === 'string') {
        imageBlob = await urlToBlob(imageInput);
    } else {
        imageBlob = imageInput;
    }

    const base64Image = await fileToGenerativePart(imageBlob);

    let prompt = `Generate a high-quality die-cut sticker based on this image. 
    The output must be a single sticker on a transparent or solid white background. 
    Add a thick white border around the subject (die-cut style).
    ${style.promptModifier}`;

    if (hasManualDrawing) {
      prompt += ` IMPORTANT: I have drawn a crude red line/circle around the specific object I want you to extract. 
      Use this red marking to identify the subject, but DO NOT include the red line in the final generated sticker. 
      The final sticker should look clean.`;
    } else {
        prompt += ` Automatically identify the main salient subject of the image and isolate it.`;
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // We assume PNG/JPEG usually, but casting to PNG for consistency in request if converted
              data: base64Image
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
          imageConfig: {
              // We want a square sticker usually
              aspectRatio: "1:1", 
              imageSize: "1K"
          }
      }
    });

    // Extract image from response
    // The response for images usually comes in the parts as well
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content returned from Gemini");
    }

    // Look for the inlineData part
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