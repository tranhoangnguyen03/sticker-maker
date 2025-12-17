# Sticker Maker

A React application that uses Google's Gemini 3 Pro Vision model (`gemini-3-pro-image-preview`) to transform user-uploaded photos into high-quality die-cut stickers.

## Features

- **Single & Batch Processing**: Create individual stickers or process up to 6 images at once.
- **Smart Subject Detection**: Automatically identifies the main subject, or lets users guide the AI by drawing a circle around the target.
- **Stylistic Transformations**: Apply various styles including:
  - Faithful (no change)
  - Stylistic (Pixar 3D, Pixel Art, Watercolor, Studio Ghibli)
  - Thematic (Christmas, Lunar New Year, etc.)
  - Custom Style Prompt
- **Downloadable Results**: Generates transparent PNGs ready for use.
- **Dark Mode**: Fully responsive dark/light mode UI.

## Prerequisites

- Node.js 18+
- A Google Cloud API Key with access to the Gemini API (specifically `gemini-3-pro-image-preview`).
  - [Get an API Key here](https://aistudio.google.com/)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sticker-maker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **(Optional) Configure Environment Variables**:
   If you want to hardcode your API Key for local development so you don't have to enter it in the UI every time, create a file named `.env` in the root directory with the following content:

   ```env
   # Google Gemini API Key
   # Get yours at https://aistudio.google.com/app/apikey
   API_KEY=your_actual_api_key_here
   ```
   
   *Note: If you are using a specific bundler like Vite, you may need to update the variable name (e.g., `VITE_API_KEY`) and the code in `App.tsx` to match.*

4. Run the development server:
   ```bash
   npm start
   ```

## API Key Setup

The application supports two modes of operation:

1.  **Manual Entry (Standard Deployment)**:
    - When running locally or deployed on standard hosts (Vercel, Netlify), the app will prompt you to enter your Gemini API Key in the UI.
    - The key is stored locally in your browser's `localStorage` for convenience.
    - Alternatively, you can pre-configure it using the `.env` file as described above.

2.  **Google AI Studio (Project IDX)**:
    - If running within Google's AI Studio environment, the app detects the environment and allows you to select your cloud project directly via the integrated "Select Project" button.

## Deployment

You can deploy this project to any static site host.

### Vercel / Netlify

1.  Build the project:
    ```bash
    npm run build
    ```
2.  Deploy the `build` (or `dist`) folder.
3.  **(Optional)** Add `API_KEY` as an environment variable in your hosting provider's dashboard if you want to pre-fill it for your users (Warning: be careful with exposing paid API keys in public client-side apps).

## Technologies Used

- React 19
- TypeScript
- Tailwind CSS
- Lucide React (Icons)
- Google GenAI SDK (`@google/genai`)

## License

MIT
