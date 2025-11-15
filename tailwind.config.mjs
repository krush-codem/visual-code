// tailwind.config.mjs

import { shadcnPreset } from "./shadcn.preset.mjs"; // Import the preset

/** @type {import('tailwindcss').Config} */
const config = {
  presets: [shadcnPreset], // <-- USE the preset
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}", // The correct path
  ],
};

export default config;
