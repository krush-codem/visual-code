// src/components/ThemeProvider.jsx
import React, { createContext, useContext } from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";

const ThemeContext = createContext(null);

export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" {...props}>
      <ThemeWrapper>{children}</ThemeWrapper>
    </NextThemesProvider>
  );
}

// This wrapper syncs next-themes with your own React context
function ThemeWrapper({ children }) {
  const { theme, setTheme } = useNextTheme();

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}
