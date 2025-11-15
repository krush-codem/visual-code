// src/components/ThemeProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const ThemeProviderContext = createContext(null);

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
