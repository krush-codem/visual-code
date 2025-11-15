// postcss.config.js
export default {
  plugins: {
    "@tailwindcss/postcss": {}, // <-- This is the fix
    autoprefixer: {},
  },
};
