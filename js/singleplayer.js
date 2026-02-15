/* ============================================
   SINGLEPLAYER — verbindet UI + GameEngine + Map
   ============================================ */

import { GameEngine } from "./game-engine.js";
import { setupSuggestions, setText } from "./ui.js";
import { loadGeoJSON } from "./map.js";

let engine = null;

window.addEventListener("DOMContentLoaded", async () => {
  /* Einstellungen aus index.html holen */
  const params = new URLSearchParams(window.location.search);

  const contextMode = params.get("context") || "with";
  const streetMode = params.get("streets") || "all";
  const roundTime = Number(params.get("time") || 60);

  /* Engine erstellen */
  engine = new GameEngine({
    contextMode,
    streetMode,
    roundTime
  });

  /* GeoJSON laden */
  await engine.loadData();

  /* Vorschläge vorbereiten */
  const allNames = engine.allFeatures.map(f => f.properties.strassenna);
  setupSuggestions(
    document.getElementById("guessInput"),
    document.getElementById("suggestions"),
    allNames
  );

  /* UI Elemente */
  const roundInfo = document.getElementById("roundInfo");
  const timer = document.getElementById("timer");
  const points = document.getElementById("points");
  const feedback = document.getElementById("feedback");

  /* Engine Events */
  engine.onTick = (time) => {
    setText(timer, time);
  };

  engine.onRoundEnd = (data) => {
    feedback.textContent = data.correct
      ? `Richtig! +${data.points} Punkte`
      : `Falsch! Die Lösung war: ${data.street}`;

    setTimeout(() => {
      engine.nextRound();
    }, 1500);
  };

  engine.onGameEnd = (data) => {
    feedback.textContent = `Spiel beendet! Gesamtpunkte: ${data.total}`;
  };

  /* Buttons */
  document.getElementById("btnGuess").onclick = () => {
    const val = document.getElementById("guessInput").value;
    engine.guess(val);
  };

  document.getElementById("btnHint1").onclick = () => {
    const hint = engine.useHint1();
    if (hint) feedback.textContent = `Hinweis: beginnt mit "${hint}"`;
  };

  document.getElementById("btnHint2").onclick = () => {
    const hint = engine.useHint2();
    if (hint) feedback.textContent = `Hinweis: beginnt mit "${hint}"`;
  };

  /* Runde starten */
  engine.startRound();
});
