import React from "react";
import { Zap, Eye, Terminal, Users, GitBranch, Share2 } from "lucide-react";

export default function FeaturesSection({ isDark }) {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      color: "#0046FF",
      title: "Instant Preview",
      description:
        "See your changes in real-time. No build step, no waiting. Write code and see results instantly in an isolated sandbox environment.",
    },
    {
      icon: <Eye className="w-8 h-8" />,
      color: "#FF8040",
      title: "AST Visualization",
      description:
        "Understand code structure at a glance. Interactive Abstract Syntax Tree visualization helps you debug faster and learn deeper.",
    },
    {
      icon: <Terminal className="w-8 h-8" />,
      color: "#0046FF",
      title: "Terminal Simulation",
      description:
        "Full console access with log capture, error tracking, and performance monitoring. Debug like a pro with complete visibility.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      color: "#FF8040",
      title: "Team Collaboration",
      description:
        "Real-time multiplayer editing. Share your workspace, collaborate seamlessly, and build together with your team.",
    },
    {
      icon: <GitBranch className="w-8 h-8" />,
      color: "#0046FF",
      title: "Version Control",
      description:
        "Built-in versioning and history tracking. Never lose your work. Revert, compare, and manage your code evolution effortlessly.",
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      color: "#FF8040",
      title: "Easy Sharing",
      description:
        "Share your projects with a single link. Embed in documentation, showcase in portfolios, or collaborate with stakeholders instantly.",
    },
  ];

  return (
    <section
      id="features"
      className={`py-24 px-6 sm:px-8 ${isDark ? "bg-[#0a0f1e]" : "bg-white"}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className={`text-4xl sm:text-5xl font-bold mb-4 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Everything you need to{" "}
            <span className="text-blue-500">build faster</span>
          </h2>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Professional tools that scale with your team and workflow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`p-8 rounded-2xl transition-all hover:scale-105 ${
                isDark
                  ? "bg-white/5 hover:bg-white/8"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
              style={{
                border: isDark
                  ? "1px solid rgba(255,255,255,0.06)"
                  : "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                style={{
                  background: `${feature.color}15`,
                  color: feature.color,
                }}
              >
                {feature.icon}
              </div>
              <h3
                className={`text-xl font-bold mb-3 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {feature.title}
              </h3>
              <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
