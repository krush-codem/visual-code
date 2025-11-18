import React from "react";
import { Zap, Layers, CheckCircle2 } from "lucide-react";

export default function ShowcaseSection({ isDark }) {
  const metrics = [
    {
      metric: "10ms",
      label: "Average Execution Time",
      icon: <Zap className="w-6 h-6" />,
    },
    {
      metric: "100%",
      label: "Browser Compatible",
      icon: <Layers className="w-6 h-6" />,
    },
    {
      metric: "24/7",
      label: "Support & Uptime",
      icon: <CheckCircle2 className="w-6 h-6" />,
    },
  ];

  // 🔥 Soft, polished, professional card colors (light mode only)
  const lightColors = [
    "#F3F8FF", // soft blue
    "#FFF7F0", // soft peach
    "#F4FFF6", // soft mint green
  ];

  return (
    <section
      id="showcase"
      className={`py-24 px-6 sm:px-8 ${isDark ? "bg-[#0a0f1e]" : "bg-white"}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className={`text-4xl sm:text-5xl font-bold mb-4 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Built for developers, by developers
          </h2>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Trusted by teams at innovative companies worldwide
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {metrics.map((item, i) => (
            <div
              key={i}
              className={`p-8 rounded-2xl text-center ${
                isDark ? "bg-white/5" : ""
              }`}
              style={{
                // ✨ Apply unique bg color only in light mode
                background: isDark ? "rgba(255,255,255,0.05)" : lightColors[i],
                border: isDark
                  ? "1px solid rgba(255,255,255,0.06)"
                  : "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 bg-blue-500/10 text-blue-500">
                {item.icon}
              </div>

              <div
                className={`text-4xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {item.metric}
              </div>

              <div
                className={`${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
