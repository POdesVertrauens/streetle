/* ============================================
   SINGLEPLAYER — Hauptlogik
   ============================================ */

import { WICHTIGE_STRASSEN } from "./config.js";
import { normalizeName, formatTime } from "./utils.js";
import { initMap, loadGeoJSON, pickRandomStreet, showStreet } from "./map.js";
import { setupSuggestions } from "./ui.js";

/* -----------------------------------------------
   ZUSTAND
----------------------------------------------- */
let allFeatures = [];
let currentStreet = null;
let currentRound = 1;
const MAX_ROUNDS = 5;
let totalPoints = 0;
let pointsThisRound = 1000;
let timer = null;
let timeLeft = 60;
let hint1Used = false;
let hint2Used = false;
let roundOver = false;

/* -----------------------------------------------
   INITIALISIERUNG
----------------------------------------------- */
async function init() {
  const params = new URLSearchParams(window.location.search);
  const streetMode = params.get("streets") || "all";
  const contextMode = params.get("context") || "withContext";
  timeLeft = parseInt(params.get("time")) || 60;

  // Karte initialisieren
  initMap(contextMode);

  // GeoJSON laden
  const geojson = await loadGeoJSON();

  if (streetMode === "important") {
    const normalized = WICHTIGE_STRASSEN.map(normalizeName);
    allFeatures = geojson.features.filter(f =>
      normalized.includes(normalizeName(f.properties.strassenna))
    );
  } else {
    allFeatures = geojson.features;
  }

  if (allFeatures.length === 0) {
    document.getElementById("feedback").textContent = "Keine Straßen gefunden!";
    return;
  }

  // Vorschläge einrichten
  const allNames = [...new Set(allFeatures.map(f => f.properties.strassenna))].sort();
  setupSuggestions(
    document.getElementById("guessInput"),
    document.getElementById("suggestions"),
    allNames
  );

  // Event Listener
  document.getElementById("btnGuess").onclick = submitGuess;
  document.getElementById("guessInput").addEventListener("keydown", e => {
    if (e.key === "Enter") submitGuess();
  });
  document.getElementById("btnHint1").onclick = useHint1;
  document.getElementById("btnHint2").onclick = useHint2;
  document.getElementById("btnNext").onclick = nextRound;

  // Erste Runde starten
  startRound();
}

/* -----------------------------------------------
   RUNDE STARTEN
----------------------------------------------- */
function startRound() {
  roundOver = false;
  hint1Used = false;
  hint2Used = false;
  pointsThisRound = 1000;

  document.getElementById("roundInfo").textContent = `Runde ${currentRound} von ${MAX_ROUNDS}`;
  document.getElementById("feedback").textContent = "";
  document.getElementById("guessInput").value = "";
  document.getElementById("suggestions").innerHTML = "";
  document.getElementById("btnNext").style.display = "none";
  document.getElementById("btnHint1").disabled = false;
  document.getElementById("btnHint2").disabled = false;
  document.getElementById("btnGuess").disabled = false;
  document.getElementById("guessInput").disabled = false;

  currentStreet = pickRandomStreet(allFeatures);
  showStreet(currentStreet);
  startTimer();
}

/* -----------------------------------------------
   TIMER
----------------------------------------------- */
function startTimer() {
  clearInterval(timer);
  timeLeft = parseInt(new URLSearchParams(window.location.search).get("time")) || 60;
  updateTimerDisplay();

  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timer);
      endRound(false);
    }
  }, 1000);
}

function updateTimerDisplay() {
  document.getElementById("timer").textContent = formatTime(timeLeft);
}

/* -----------------------------------------------
   RATEN
----------------------------------------------- */
function submitGuess() {
  if (roundOver) return;

  const input = document.getElementById("guessInput").value.trim();
  if (!input) return;

  const guess = normalizeName(input);
  const target = normalizeName(currentStreet.properties.strassenna);

  if (guess === target) {
    clearInterval(timer);
    endRound(true);
  } else {
    document.getElementById("feedback").textContent = "❌ Falsch – versuch es nochmal!";
    document.getElementById("feedback").style.color = "#e63946";
    document.getElementById("guessInput").value = "";
    // Punkte abziehen für falschen Versuch
    pointsThisRound = Math.max(0, pointsThisRound - 50);
  }
}

/* -----------------------------------------------
   HINWEISE
----------------------------------------------- */
function useHint1() {
  if (hint1Used || roundOver) return;
  hint1Used = true;
  pointsThisRound = Math.max(0, pointsThisRound - 100);
  const name = currentStreet.properties.strassenna;
  document.getElementById("feedback").textContent = `💡 Erster Buchstabe: "${name[0]}"`;
  document.getElementById("feedback").style.color = "#f4a261";
  document.getElementById("btnHint1").disabled = true;
}

function useHint2() {
  if (hint2Used || roundOver) return;
  hint2Used = true;
  pointsThisRound = Math.max(0, pointsThisRound - 200);
  const name = currentStreet.properties.strassenna;
  document.getElementById("feedback").textContent = `💡 Erste 3 Buchstaben: "${name.slice(0, 3)}"`;
  document.getElementById("feedback").style.color = "#f4a261";
  document.getElementById("btnHint2").disabled = true;
}

/* -----------------------------------------------
   RUNDE BEENDEN
----------------------------------------------- */
function endRound(correct) {
  if (roundOver) return;
  roundOver = true;
  clearInterval(timer);

  const correctName = currentStreet.properties.strassenna;

  if (!correct) pointsThisRound = 0;
  totalPoints += pointsThisRound;

  const feedback = document.getElementById("feedback");
  if (correct) {
    feedback.textContent = `✅ Richtig! +${pointsThisRound} Punkte`;
    feedback.style.color = "#2a9d8f";
  } else {
    feedback.textContent = `⏱️ Zeit! Die Straße war: ${correctName}`;
    feedback.style.color = "#e63946";
  }

  document.getElementById("scoreInfo").textContent = `Punkte: ${totalPoints}`;
  document.getElementById("btnGuess").disabled = true;
  document.getElementById("guessInput").disabled = true;
  document.getElementById("btnHint1").disabled = true;
  document.getElementById("btnHint2").disabled = true;

  if (currentRound >= MAX_ROUNDS) {
    document.getElementById("btnNext").textContent = "Ergebnis anzeigen";
  }
  document.getElementById("btnNext").style.display = "block";
}

/* -----------------------------------------------
   NÄCHSTE RUNDE
----------------------------------------------- */
function nextRound() {
  if (currentRound >= MAX_ROUNDS) {
    showEndscreen();
    return;
  }

  currentRound++;
  startRound();
}

/* -----------------------------------------------
   ENDSCREEN
----------------------------------------------- */
function showEndscreen() {
  document.getElementById("game").style.display = "none";
  document.getElementById("endscreen").style.display = "block";
  document.getElementById("finalScore").textContent =
    `Du hast ${totalPoints} von ${MAX_ROUNDS * 1000} möglichen Punkten erreicht!`;
}

/* -----------------------------------------------
   START
----------------------------------------------- */
init();
