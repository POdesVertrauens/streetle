/* ============================================
   UTILS — Helper-Funktionen
   ============================================ */

/* Straßennamen normalisieren */
export function normalizeName(name) {
  return (name || "")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/\s*\(.*?\)\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* Zeit formatieren (Sekunden → mm:ss) */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
