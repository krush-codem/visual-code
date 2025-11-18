import React, { useEffect, useState } from "react";
import { Sun, Moon, Code2, Play, Rocket, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ theme, toggleTheme }) {
  const isDark = theme === "dark";
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Showcase", href: "#showcase" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <motion.div layout>
      {/* ░░ BETA ANNOUNCEMENT BAR WITH GRADIENT ░░ */}
      <motion.div
        layout
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 w-full z-50 flex items-center justify-center px-3"
        style={{
          height: "42px",
          background:
            "linear-gradient(90deg,#302b63 0%, #0f0c29 50%, #302b63 100%)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
        }}
      >
        <RotatingBetaText />
      </motion.div>

      {/* ░░ NAVBAR ░░ */}
      <motion.nav
        layout
        className="w-full flex items-center justify-between fixed left-0 z-40 px-6 sm:px-10"
        style={{
          top: "42px",
          height: "64px",

          /* Glass transparency for light + dark mode */
          background: isDark
            ? "rgba(0, 0, 0, 0.95)"
            : "rgba(255, 255, 255, 0.82)",

          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",

          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",

          boxShadow: scrolled ? "0 4px 18px rgba(0,0,0,0.25)" : "none",
        }}
      >
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X
                className={`w-6 h-6 ${isDark ? "text-white" : "text-black"}`}
              />
            ) : (
              <Code2
                className={`w-6 h-6 ${isDark ? "text-white" : "text-black"}`}
              />
            )}
          </button>

          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md"
            style={{
              background: "linear-gradient(135deg,#0046FF 0%, #2b78ff 100%)",
            }}
          >
            <Code2 className="w-6 h-6 text-white" />
          </div>

          <div
            className={`text-lg font-bold ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            CodeVisualizer
          </div>
        </div>

        {/* NAV LINKS */}
        <ul className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                className={`text-sm font-medium transition-colors ${
                  isDark
                    ? "text-slate-200 hover:text-blue-400"
                    : "text-slate-800 hover:text-blue-600"
                }`}
                href={link.href}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        {/* RIGHT BUTTONS */}
        <div className="flex items-center gap-3">
          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/10 transition-none"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-300" />
            ) : (
              <Moon className="w-5 h-5 text-black" />
            )}
          </button>

          {/* LAUNCH BUTTON — CLEAN + NO GLOW */}
          <a
            href="#workspace"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold transition-none"
            style={{
              background: "linear-gradient(90deg,#0046FF 0%, #2b78ff 100%)",
              boxShadow: "none",
              filter: "none",
              transform: "none",
            }}
          >
            <Play className="w-4 h-4" />
            Launch Now
          </a>
        </div>
      </motion.nav>

      {/* Prevents overlap */}
      <div style={{ height: "106px" }} />
    </motion.div>
  );
}

/* ░░ ROTATING BETA TEXT COMPONENT ░░ */
function RotatingBetaText() {
  const messages = [
    {
      icon1: <AlertCircle className="w-4 h-4 text-yellow-300" />,
      icon2: <Rocket className="w-4 h-4 text-pink-300 animate-pulse" />,
      text: "Beta Access Active — The full experience is launching soon.",
    },
    {
      icon1: <Rocket className="w-4 h-4 text-pink-300 animate-pulse" />,
      icon2: <span className="text-lg">✨</span>,
      text: "Experience the next-gen code visualizer — Faster, smarter, smoother.",
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const item = messages[index];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={index}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex items-center gap-2 text-white text-sm font-medium"
      >
        {item.icon1}
        {item.icon2}
        <span>{item.text}</span>
      </motion.div>
    </AnimatePresence>
  );
}
