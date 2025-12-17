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
  // For 'custom' style, this holds the user input. For presets, this is unused/empty as it is loaded from files.
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

export const FAITHFUL_STYLE: StickerStyle = { 
  id: 'faithful', 
  name: 'Faithful', 
  promptModifier: '', // Loaded from prompts/styles/faithful.md
  previewColor: 'bg-slate-500' 
};

export const ARTISTIC_STYLES: StickerStyle[] = [
  {
    id: 'pixar',
    name: 'Pixar 3D',
    promptModifier: '', // Loaded from prompts/styles/pixar.md
    previewColor: 'bg-blue-500'
  },
  {
    id: 'pixel',
    name: 'Pixel Art',
    promptModifier: '', // Loaded from prompts/styles/pixel.md
    previewColor: 'bg-purple-500'
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    promptModifier: '', // Loaded from prompts/styles/watercolor.md
    previewColor: 'bg-pink-400'
  },
  {
    id: 'ghibli',
    name: 'Ghibli',
    promptModifier: '', // Loaded from prompts/styles/ghibli.md
    previewColor: 'bg-green-500'
  }
];

export const THEMATIC_STYLES: StickerStyle[] = [
  {
    id: 'christmas',
    name: 'Christmas',
    promptModifier: '', // Loaded from prompts/styles/christmas.md
    previewColor: 'bg-red-600'
  },
  {
    id: 'lunar_new_year',
    name: 'Lunar New Year',
    promptModifier: '', // Loaded from prompts/styles/lunar_new_year.md
    previewColor: 'bg-yellow-500'
  },
  {
    id: 'tropical',
    name: 'Tropical',
    promptModifier: '', // Loaded from prompts/styles/tropical.md
    previewColor: 'bg-orange-400'
  },
  {
    id: 'medieval',
    name: 'Medieval',
    promptModifier: '', // Loaded from prompts/styles/medieval.md
    previewColor: 'bg-stone-600'
  }
];

export const CUSTOM_STYLE_ID = 'custom';
