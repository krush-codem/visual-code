import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function PricingSection({ isDark }) {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "5 Projects",
        "Basic AST Visualization",
        "Community Support",
        "Public Sharing",
      ],
      cta: "Get Started",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$6",
      period: "per month",
      features: [
        "Unlimited Projects",
        "Advanced AST & Debugging",
        "Priority Support",
        "Private Projects",
        "Team Collaboration (5 users)",
      ],
      cta: "Start Free Trial",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      features: [
        "Everything in Pro",
        "Unlimited Team Members",
        "SSO & Advanced Security",
        "Dedicated Support",
        "SLA Guarantee",
      ],
      cta: "Contact Sales",
      highlight: false,
    },
  ];

  return (
    <section
      id="pricing"
      className={`py-24 px-6 sm:px-8 ${isDark ? "bg-[#070a10]" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className={`text-4xl sm:text-5xl font-bold mb-4 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Start free, scale as you grow
          </h2>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Transparent pricing with no hidden fees
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`p-8 rounded-2xl transition-all ${
                plan.highlight
                  ? "scale-105 shadow-2xl" +
                    (isDark
                      ? " bg-gradient-to-b from-blue-600/10 to-purple-600/10 border-blue-500/30"
                      : " bg-white border-blue-500/50")
                  : isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-gray-200"
              }`}
              style={{ border: `1px solid` }}
            >
              {plan.highlight && (
                <div className="text-center mb-4">
                  <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <h3
                className={`text-2xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {plan.name}
              </h3>
              <div className="mb-6">
                <span
                  className={`text-5xl font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-sm ml-2 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  / {plan.period}
                </span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span
                      className={isDark ? "text-slate-300" : "text-slate-700"}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.highlight
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg hover:shadow-xl"
                    : isDark
                    ? "bg-white/10 text-white hover:bg-white/15"
                    : "bg-gray-100 text-slate-900 hover:bg-gray-200"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
