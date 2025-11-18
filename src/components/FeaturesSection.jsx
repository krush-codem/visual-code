import React from "react";
import { Zap, Eye, Terminal, UserCheck, ArchiveRestore } from "lucide-react";

export default function FeaturesSection({ isDark }) {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      color: "#6366f1", // Indigo
      lightBg: "linear-gradient(135deg, #e0e7ff 0%, #f5f3ff 100%)",
      lightBorder: "rgba(99, 102, 241, 0.2)",
      lightShadow: "0 8px 32px rgba(99, 102, 241, 0.12)",
      title: "Instant Preview",
      description:
        "See your changes in real-time. No build step, no waiting. Write code and see results instantly in an isolated sandbox environment.",
    },
    {
      icon: <Eye className="w-8 h-8" />,
      color: "#ec4899", // Pink
      lightBg: "linear-gradient(135deg, #fce7f3 0%, #fdf2f8 100%)",
      lightBorder: "rgba(236, 72, 153, 0.2)",
      lightShadow: "0 8px 32px rgba(236, 72, 153, 0.12)",
      title: "AST Visualization",
      description:
        "Understand code structure at a glance. Interactive Abstract Syntax Tree visualization helps you debug faster and learn deeper.",
    },
    {
      icon: <Terminal className="w-8 h-8" />,
      color: "#8b5cf6", // Purple
      lightBg: "linear-gradient(135deg, #ede9fe 0%, #faf5ff 100%)",
      lightBorder: "rgba(139, 92, 246, 0.2)",
      lightShadow: "0 8px 32px rgba(139, 92, 246, 0.12)",
      title: "Terminal Simulation",
      description:
        "Full console access with log capture, error tracking, and performance monitoring. Debug like a pro with complete visibility.",
    },
    {
      icon: <UserCheck className="w-8 h-8" />,
      color: "#10b981", // Emerald
      lightBg: "linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)",
      lightBorder: "rgba(16, 185, 129, 0.2)",
      lightShadow: "0 8px 32px rgba(16, 185, 129, 0.12)",
      title: "Team Collaboration",
      description:
        "Real-time multiplayer editing. Share your workspace, collaborate seamlessly, and build together with your team.",
    },
    {
      icon: <ArchiveRestore className="w-8 h-8" />,
      color: "#f59e0b", // Amber
      lightBg: "linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)",
      lightBorder: "rgba(245, 158, 11, 0.2)",
      lightShadow: "0 8px 32px rgba(245, 158, 11, 0.12)",
      title: "Indexed DB Storage",
      description:
        "Never lose your work. Automatic saving and local history ensure your changes are preserved and easily recoverable.",
    },
  ];

  return (
    <section
      id="features"
      className={`py-24 px-6 sm:px-8 relative overflow-hidden ${
        isDark ? "bg-[#0a0f1e]" : "bg-gradient-to-b from-gray-50 to-white"
      }`}
    >
      {/* Subtle background decoration for light mode */}
      {!isDark && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)",
            }}
          />
          <div
            className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(236,72,153,0.12), transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%)",
            }}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2
            className={`text-4xl sm:text-5xl font-bold mb-4 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Everything you need to{" "}
            <span
              style={{
                background: "linear-gradient(to right, #2563eb, #60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              build faster
            </span>
          </h2>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Professional tools that scale with your team and workflow
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`${
                i === features.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div
                className={`h-full p-8 rounded-2xl transition-all hover:-translate-y-2 group relative overflow-hidden ${
                  isDark
                    ? "bg-white/5 hover:bg-white/8"
                    : "bg-white hover:shadow-2xl"
                }`}
                style={{
                  background: isDark ? undefined : feature.lightBg,
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.08)"
                    : `1px solid ${feature.lightBorder}`,
                  boxShadow: isDark ? "none" : `0 4px 20px rgba(0, 0, 0, 0.04)`,
                  transitionDuration: "0.3s",
                }}
              >
                {/* Animated gradient overlay on hover (light mode) */}
                {!isDark && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${feature.color}08, transparent)`,
                    }}
                  />
                )}

                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 relative z-10 transition-transform group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    background: isDark
                      ? `${feature.color}15`
                      : `linear-gradient(135deg, ${feature.color}25, ${feature.color}10)`,
                    color: feature.color,
                    boxShadow: isDark
                      ? "none"
                      : `0 8px 24px ${feature.color}18`,
                    transitionDuration: "0.3s",
                  }}
                >
                  {feature.icon}
                </div>

                {/* Title */}
                <h3
                  className={`text-xl font-bold mb-3 relative z-10 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className={`relative z-10 leading-relaxed ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {feature.description}
                </p>

                {/* Bottom accent line - visible on hover */}
                <div
                  className="absolute bottom-0 left-0 h-1 rounded-full w-0 group-hover:w-full transition-all duration-500"
                  style={{
                    background: `linear-gradient(90deg, ${feature.color}, transparent)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
