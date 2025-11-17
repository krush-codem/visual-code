import { useEffect, useState, useRef, useCallback } from "react";
import { openDB } from "idb";

/**
 * IndexedDB Autosave Hook
 * Extremely robust — handles large code files, large history.
 */

export default function useAutoSaveIndexed(
  dbName = "codeviz-db",
  content,
  { debounceMs = 1000, maxHistory = 50, enabled = true } = {}
) {
  const [db, setDb] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const timerRef = useRef(null);

  // ---------- Initialize IndexedDB ----------
  useEffect(() => {
    async function initDB() {
      const newDB = await openDB(dbName, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("current")) {
            db.createObjectStore("current");
          }
          if (!db.objectStoreNames.contains("history")) {
            const store = db.createObjectStore("history", {
              keyPath: "id",
            });
            store.createIndex("ts", "ts");
          }
        },
      });
      setDb(newDB);

      // Load history on mount
      const all = await newDB.getAll("history");
      setHistory(all.sort((a, b) => b.ts - a.ts));
    }

    initDB();
  }, [dbName]);

  // ---------- Save Snapshot ----------
  const saveSnapshot = useCallback(
    async (value) => {
      if (!db) return;

      const snapshot = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        ts: Date.now(),
        content: value,
        size: value.length,
      };

      // Add snapshot
      await db.add("history", snapshot);

      // Trim old
      const all = await db.getAll("history");
      if (all.length > maxHistory) {
        const sorted = [...all].sort((a, b) => b.ts - a.ts);
        const toDelete = sorted.slice(maxHistory);
        for (const item of toDelete) {
          await db.delete("history", item.id);
        }
      }

      // Update state
      const updated = await db.getAll("history");
      setHistory(updated.sort((a, b) => b.ts - a.ts));
    },
    [db, maxHistory]
  );

  // ---------- Debounced Save ----------
  useEffect(() => {
    if (!db || !enabled) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    setIsSaving(true);

    timerRef.current = setTimeout(async () => {
      const val =
        typeof content === "string" ? content : JSON.stringify(content ?? "");

      await db.put("current", val, "content");

      const last = history[0];
      if (!last || last.content !== val) {
        await saveSnapshot(val);
      }

      setIsSaving(false);
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content, db, enabled, debounceMs, history, saveSnapshot]);

  // ---------- Restore ----------
  const restoreSnapshot = async (id) => {
    const snap = await db.get("history", id);
    if (snap) {
      await db.put("current", snap.content, "content");
    }
    return snap;
  };

  // ---------- Load Current ----------
  const loadCurrent = async () => {
    return await db.get("current", "content");
  };

  // ---------- Export ----------
  const exportHistory = async () => {
    const all = await db.getAll("history");
    return JSON.stringify(all, null, 2);
  };

  // ---------- Clear ----------
  const clearHistory = async () => {
    await db.clear("history");
    setHistory([]);
  };

  return {
    db,
    isSaving,
    history,
    saveSnapshot,
    restoreSnapshot,
    loadCurrent,
    clearHistory,
    exportHistory,
  };
}
