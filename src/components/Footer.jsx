import React from "react";
import { Code2 } from "lucide-react";

export default function Footer({ isDark }) {
  return (
    <footer
      id="contact"
      className={`py-16 px-6 sm:px-8 border-t bg-[#070a10] border-white/10`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Logo + About */}
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

              {/* Logo Text */}
              <span className="text-xl font-bold text-white">
                CodeVisualizer
              </span>
            </div>

            <p
              className={`mb-6 max-w-sm ${
                isDark ? "text-slate-400" : "text-slate-300"
              }`}
            >
              Empowering developers to build, visualize, and collaborate with
              cutting-edge tools and real-time feedback.
            </p>

            <div className={`${isDark ? "text-slate-400" : "text-slate-300"}`}>
              <div className="mb-2">
                Email:{" "}
                <a
                  href="mailto:support@codevisualizer.dev"
                  className="hover:text-blue-400 transition"
                >
                  support@codevisualizer.dev
                </a>
              </div>
              <div>Phone: +1 (555) 123-4567</div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Product</h3>
            <ul className="space-y-3">
              {["Features", "Pricing", "Documentation"].map((item, i) => (
                <li key={i}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className={`transition ${
                      isDark
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-3">
              {["About Us", "Blog", "Careers"].map((item, i) => (
                <li key={i}>
                  <a
                    href={`#${item.toLowerCase().replace(" ", "-")}`}
                    className={`transition ${
                      isDark
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-3">
              {["Community", "Tutorials", "Examples", "Support"].map(
                (item, i) => (
                  <li key={i}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className={`transition ${
                        isDark
                          ? "text-slate-400 hover:text-white"
                          : "text-slate-300 hover:text-white"
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

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div
            className={`text-sm ${
              isDark ? "text-slate-400" : "text-slate-300"
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
                      : "text-slate-300 hover:text-white"
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
