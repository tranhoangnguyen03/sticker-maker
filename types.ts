export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface StickerStyle {
  id: string;
  name: string;
  promptModifier: string;
  previewColor: string;
}

export interface StickerJob {
  id: string;
  originalFile: File;
  previewUrl: string; // URL of the original image
  markedUrl?: string; // URL of the image with the red circle drawn (if applicable)
  resultUrl?: string; // URL of the generated sticker
  status: ProcessingStatus;
  error?: string;
}

export const STYLES: StickerStyle[] = [
  { 
    id: 'faithful', 
    name: 'Faithful', 
    promptModifier: 'Keep the style photorealistic and faithful to the original image.',
    previewColor: 'bg-slate-500' 
  },
  { 
    id: 'cartoon', 
    name: 'Cartoon', 
    promptModifier: 'Transform into a vibrant, 2D vector cartoon style with bold lines.',
    previewColor: 'bg-orange-400' 
  },
  { 
    id: 'pixel', 
    name: 'Pixel Art', 
    promptModifier: 'Transform into a retro 16-bit pixel art style.',
    previewColor: 'bg-purple-500' 
  },
  { 
    id: 'watercolor', 
    name: 'Watercolor', 
    promptModifier: 'Transform into a soft, artistic watercolor painting style.',
    previewColor: 'bg-blue-400' 
  },
  { 
    id: 'cyberpunk', 
    name: 'Cyberpunk', 
    promptModifier: 'Transform into a futuristic cyberpunk style with neon glows.',
    previewColor: 'bg-pink-600' 
  },
];