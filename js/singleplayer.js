import { GameEngine } from "./game-engine.js";
import { initMap, highlightStreet } from "./map.js";
import { setupSuggestions } from "./suggestions.js";

/* -----------------------------
   INITIALISIERUNG
------------------------------ */

async function init() {
  // URL-Parameter lesen
  const params = new URLSearchParams(window.location.search);
  const streetMode = params.get("streets") || "all";
  const contextMode = params.get("context") || "withContext";
  const timeLimit = parseInt(params.get("time")) || 60;

  // Engine erzeugen
  const engine = new GameEngine(streetMode);

  // 1) Daten laden (WICHTIG: await!)
  await engine.loadData();

  // 2) Map initialisieren
  initMap(contextMode);

  // 3) Zufallsstraße wählen
  engine.pickRandomStreet();

  // 4) Vorschläge vorbereiten
  const allNames = engine.allFeatures.map(f => f.properties.strassenna);
  setupSuggestions(
    document.getElementById("guessInput"),
    document.getElementById("suggestions"),
    allNames
  );

  // 5) Timer starten
  startTimer(timeLimit, engine);

  // 6) Event Listener setzen
  setupGuessHandler(engine);
}

init();

/* -----------------------------
   TIMER
------------------------------ */

function startTimer(seconds, engine) {
  let remaining = seconds;
  const timerEl = document.getElementById("timer");

  timerEl.textContent = remaining;

  const interval = setInterval(() => {
    remaining--;
    timerEl.textContent = remaining;

    if (remaining <= 0) {
      clearInterval(interval);
      endRound(engine, false);
    }
  }, 1000);
}

/* -----------------------------
   GUESS HANDLING
------------------------------ */

function setupGuessHandler(engine) {
  const input = document.getElementById("guessInput");
  const button = document.getElementById("guessButton");

  button.addEventListener("click", () => {
    checkGuess(engine, input.value.trim());
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      checkGuess(engine, input.value.trim());
    }
  });
}

function checkGuess(engine, guess) {
  if (!guess) return;

  const correct = engine.currentStreet.properties.strassenna;

  if (guess.toLowerCase() === correct.toLowerCase()) {
    endRound(engine, true);
  } else {
    document.getElementById("feedback").textContent = "Falsch!";
  }
}

/* -----------------------------
   RUNDE BEENDEN
------------------------------ */

function endRound(engine, success) {
  const feedback = document.getElementById("feedback");
  const correctName = engine.currentStreet.properties.strassenna;

  if (success) {
    feedback.textContent = "Richtig!";
  } else {
    feedback.textContent = `Zeit abgelaufen! Richtige Antwort: ${correctName}`;
  }

  // Straße auf der Karte hervorheben
  highlightStreet(engine.currentStreet);

  // Button für nächste Runde
  document.getElementById("nextButton").style.display = "block";
  document.getElementById("nextButton").onclick = () => nextRound(engine);
}

function nextRound(engine) {
  document.getElementById("feedback").textContent = "";
  document.getElementById("nextButton").style.display = "none";

  engine.pickRandomStreet();

  const allNames = engine.allFeatures.map(f => f.properties.strassenna);
  setupSuggestions(
    document.getElementById("guessInput"),
    document.getElementById("suggestions"),
    allNames
  );
}
