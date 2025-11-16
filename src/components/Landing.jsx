import React, { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import ShowcaseSection from "./ShowcaseSection";
import PricingSection from "./PricingSection";
import CTASection from "./CTASection";
import Footer from "./Footer";

export default function Landing() {
  const [theme, setTheme] = useState(() => {
    try {
      const s = localStorage.getItem("cv_theme");
      if (s) return s;
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    } catch {
      return "dark";
    }
  });

  const isDark = theme === "dark";
  const rootRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem("cv_theme", theme);
    } catch {}

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div
      ref={rootRef}
      className={`min-h-screen w-full transition-colors duration-300 ${
        isDark ? "bg-[#070a10]" : "bg-gray-50"
      }`}
    >
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main>
        <HeroSection isDark={isDark} />
        <FeaturesSection isDark={isDark} />
        <HowItWorksSection isDark={isDark} />
        <ShowcaseSection isDark={isDark} />
        <PricingSection isDark={isDark} />
        <CTASection isDark={isDark} />
        <Footer isDark={isDark} />
      </main>
    </div>
  );
}
