import React from "react";
import { Code2 } from "lucide-react";

export default function Footer({ isDark }) {
  return (
    <footer
      id="contact"
      className={`py-16 px-6 sm:px-8 border-t ${
        isDark ? "bg-[#070a10] border-white/10" : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                style={{
                  background:
                    "linear-gradient(135deg,#0046FF 0%, #2b78ff 100%)",
                }}
              >
                <Code2 className="w-6 h-6" />
              </div>
              <span
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                CodeVisualizer
              </span>
            </div>
            <p
              className={`mb-6 max-w-sm ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Empowering developers to build, visualize, and collaborate with
              cutting-edge tools and real-time feedback.
            </p>
            <div className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
              <div className="mb-2">
                Email:{" "}
                <a
                  href="mailto:support@codevisualizer.dev"
                  className="hover:text-blue-500 transition"
                >
                  support@codevisualizer.dev
                </a>
              </div>
              <div>Phone: +1 (555) 123-4567</div>
            </div>
          </div>

          <div>
            <h3
              className={`font-semibold mb-4 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Product
            </h3>
            <ul className="space-y-3">
              {[
                "Features",
                "Pricing",
                "Documentation",
                "API Reference",
                "Changelog",
              ].map((item, i) => (
                <li key={i}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className={`transition ${
                      isDark
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className={`font-semibold mb-4 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Company
            </h3>
            <ul className="space-y-3">
              {["About Us", "Blog", "Careers", "Press Kit", "Partners"].map(
                (item, i) => (
                  <li key={i}>
                    <a
                      href={`#${item.toLowerCase().replace(" ", "-")}`}
                      className={`transition ${
                        isDark
                          ? "text-slate-400 hover:text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3
              className={`font-semibold mb-4 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Resources
            </h3>
            <ul className="space-y-3">
              {["Community", "Tutorials", "Examples", "Support", "Status"].map(
                (item, i) => (
                  <li key={i}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className={`transition ${
                        isDark
                          ? "text-slate-400 hover:text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div
          className={`pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 ${
            isDark ? "border-white/10" : "border-gray-200"
          }`}
        >
          <div
            className={`text-sm ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            © 2024 CodeVisualizer. All rights reserved.
          </div>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (item, i) => (
                <a
                  key={i}
                  href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                  className={`text-sm transition ${
                    isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
