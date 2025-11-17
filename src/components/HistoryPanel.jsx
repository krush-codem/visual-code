import React from "react";
import { RotateCcw, Download, Trash2, Eye, Undo2 } from "lucide-react";

export default function HistoryPanel({
  history,
  onRestore,
  onExport,
  onClear,
  isDark,
}) {
  return (
    <div
      className={`mt-10 p-8 rounded-2xl shadow-xl ${
        isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
      } border`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3
          className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-slate-800"
          }`}
        >
          Version History
        </h3>

        <div className="flex gap-3">
          <button
            onClick={onExport}
            className="px-4 py-2 rounded-lg flex items-center gap-2 border text-sm"
          >
            <Download className="w-4 h-4" /> Export
          </button>

          <button
            onClick={onClear}
            className="px-4 py-2 rounded-lg flex items-center gap-2 border text-sm text-red-500"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {history.length === 0 && (
          <p className="text-sm opacity-60">No snapshots yet.</p>
        )}

        {history.map((snap) => (
          <div
            key={snap.id}
            className={`p-5 rounded-xl flex justify-between items-center transition ${
              isDark ? "bg-white/5" : "bg-white border"
            }`}
          >
            <div>
              <div
                className={`font-semibold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {new Date(snap.ts).toLocaleString()}
              </div>
              <div className="text-xs opacity-60">{snap.size} characters</div>
              <div className="text-xs mt-2 opacity-70 italic">
                {snap.content.slice(0, 100)}…
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onRestore(snap.id)}
                className="px-3 py-2 rounded-lg text-sm bg-blue-600 text-white flex items-center gap-2"
              >
                <Undo2 className="w-4 h-4" />
                Restore
              </button>

              <button
                onClick={() => navigator.clipboard.writeText(snap.content)}
                className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 border"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
