import React, { useEffect, useState } from "react";
import { Sun, Moon, Code2, Play, X } from "lucide-react";

export default function Navbar({ theme, toggleTheme }) {
  const isDark = theme === "dark";
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

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
    <>
      <nav
        className={`w-full px-6 sm:px-10 py-4 flex items-center justify-between fixed top-0 left-0 z-50 transition-all duration-300 ${
          scrolled ? "backdrop-blur-xl" : ""
        }`}
        style={{
          background: scrolled
            ? isDark
              ? "rgba(3,7,18,0.85)"
              : "rgba(255,255,255,0.85)"
            : isDark
            ? "rgba(3,7,18,0.72)"
            : "rgba(255,255,255,0.95)",
          borderBottom: isDark
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(2,6,23,0.08)",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.08)" : "none",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
            style={{
              background: "linear-gradient(135deg,#0046FF 0%, #2b78ff 100%)",
            }}
          >
            <Code2 className="w-6 h-6" />
          </div>
          <div
            className={`text-lg font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            CodeVisualizer
          </div>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-8 items-center">
          {navLinks.map((link, i) => (
            <li key={i}>
              <a
                href={link.href}
                className={`text-sm font-medium transition ${
                  isDark
                    ? "text-slate-200 hover:text-blue-400"
                    : "text-slate-700 hover:text-blue-600"
                }`}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg transition-all transform hover:scale-105 active:scale-95"
            style={{
              background: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(2,6,23,0.05)",
            }}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-300" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>

          {/* FIXED: Launch Button */}
          <a
            href="#workspace"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(90deg,#0046FF 0%, #2b78ff 100%)",
              color: "white",
              boxShadow: "0 4px 20px rgba(0,70,255,0.25)",
            }}
          >
            <Play className="w-4 h-4" />
            Launch Now
          </a>

          {/* Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            style={{
              background: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(2,6,23,0.05)",
            }}
          >
            {mobileMenuOpen ? (
              <X
                className={`w-6 h-6 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 64 64"
                fill="none"
              >
                <line
                  x1="12"
                  y1="20"
                  x2="52"
                  y2="20"
                  stroke={isDark ? "#ffffff" : "#000000"}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <line
                  x1="12"
                  y1="32"
                  x2="44"
                  y2="32"
                  stroke={isDark ? "#ffffff" : "#000000"}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <line
                  x1="12"
                  y1="44"
                  x2="36"
                  y2="44"
                  stroke={isDark ? "#ffffff" : "#000000"}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: isDark
            ? "rgba(7, 10, 16, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
        }}
        onClick={closeMobileMenu}
      >
        <div
          className={`flex flex-col items-center justify-center h-full px-8 transition-transform duration-300 ${
            mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="space-y-8 text-center mb-12">
            {navLinks.map((link, i) => (
              <li
                key={i}
                className="transform transition-all duration-300"
                style={{
                  transitionDelay: mobileMenuOpen ? `${i * 50}ms` : "0ms",
                  opacity: mobileMenuOpen ? 1 : 0,
                  transform: mobileMenuOpen
                    ? "translateY(0)"
                    : "translateY(-20px)",
                }}
              >
                <a
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={`text-2xl font-semibold transition-colors ${
                    isDark
                      ? "text-white hover:text-blue-400"
                      : "text-slate-900 hover:text-blue-600"
                  }`}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          {/* FIXED: Mobile Launch Button */}
          <a
            href="#workspace"
            onClick={closeMobileMenu}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
            style={{
              background: "linear-gradient(90deg,#0046FF 0%, #2b78ff 100%)",
              opacity: mobileMenuOpen ? 1 : 0,
              transform: mobileMenuOpen ? "scale(1)" : "scale(0.9)",
              transitionDelay: "200ms",
            }}
          >
            <Play className="w-5 h-5" />
            Launch Workspace
          </a>

          <div
            className="mt-12 text-center transition-all duration-300"
            style={{
              opacity: mobileMenuOpen ? 1 : 0,
              transitionDelay: "250ms",
            }}
          >
            <p
              className={`text-sm ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Ready to transform your workflow?
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
