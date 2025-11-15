// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite";
// import path from "path";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   define: {
//     "process.env": "{}",
//   },

//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// });

// vite.config.js
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// // import tailwindcss from "@tailwindcss/vite"; // <-- DELETE THIS
// import path from "path";

// // https://vite.dev/config/
// export default defineConfig({
//   // plugins: [react(), tailwindcss()], // <-- CHANGE THIS
//   plugins: [react()], // <-- TO THIS
//   define: {
//     "process.env": "{}",
//   },
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// });

// vite.config.mjs
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url"; // <-- Import this

// --- This is the correct way to get __dirname in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// -------------------------------------------------------------

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": "{}",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // <-- This now works
    },
  },
});
