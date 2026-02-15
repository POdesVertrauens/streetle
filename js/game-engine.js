/* ============================================
   GAME ENGINE — Runden, Timer, Punkte, Hinweise
   ============================================ */

import { formatTime, normalizeName } from "./utils.js";
import { WICHTIGE_STRASSEN } from "./config.js";
import { loadGeoJSON, pickRandomStreet, showStreet } from "./map.js";

export class GameEngine {
  constructor(options) {
    this.contextMode = options.contextMode;
    this.streetMode = options.streetMode;
    this.roundTime = options.roundTime;

    this.currentRound = 1;
    this.maxRounds = 5;

    this.pointsTotal = 0;
    this.pointsThisRound = 1000;

    this.timer = null;
    this.timeLeft = this.roundTime;

    this.hint1Used = false;
    this.hint2Used = false;

    this.currentStreet = null;
    this.allFeatures = [];
  }

  /* --------------------------------------------
     GEOJSON LADEN
  -------------------------------------------- */
async loadData() {
  const response = await fetch("data/berlin.geojson");
  const json = await response.json();

  if (this.streetMode === "important") {
    this.allFeatures = json.features.filter(f =>
      IMPORTANT_STREETS.includes(f.properties.strassenna)
    );
  } else {
    this.allFeatures = json.features;
  }
}

  /* --------------------------------------------
     RUNDE STARTEN
  -------------------------------------------- */
  startRound() {
    this.timeLeft = this.roundTime;
    this.pointsThisRound = 1000;
    this.hint1Used = false;
    this.hint2Used = false;

    const pool = this.streetMode === "major"
      ? this.allFeatures.filter(f =>
          WICHTIGE_STRASSEN
            .map(normalizeName)
            .includes(normalizeName(f.properties.strassenna))
        )
      : this.allFeatures;

    this.currentStreet = pickRandomStreet(pool);
    showStreet(this.currentStreet);

    this.startTimer();
  }

  /* --------------------------------------------
     TIMER
  -------------------------------------------- */
  startTimer() {
    clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.timeLeft--;

      if (this.onTick) {
        this.onTick(formatTime(this.timeLeft));
      }

      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.finishRound(false);
      }
    }, 1000);
  }

  /* --------------------------------------------
     RATEVERSUCH
  -------------------------------------------- */
  guess(input) {
    const guess = normalizeName(input);
    const target = normalizeName(this.currentStreet.properties.strassenna);

    if (!guess) return false;

    if (guess === target) {
      clearInterval(this.timer);
      this.finishRound(true);
      return true;
    }

    return false;
  }

  /* --------------------------------------------
     HINWEISE
  -------------------------------------------- */
  useHint1() {
    if (this.hint1Used) return null;
    this.hint1Used = true;
    this.pointsThisRound -= 100;

    const name = this.currentStreet.properties.strassenna;
    return name[0];
  }

  useHint2() {
    if (this.hint2Used) return null;
    this.hint2Used = true;
    this.pointsThisRound -= 200;

    const name = this.currentStreet.properties.strassenna;
    return name.slice(0, 3);
  }

  /* --------------------------------------------
     RUNDE BEENDEN
  -------------------------------------------- */
  finishRound(correct) {
    if (!correct) {
      this.pointsThisRound = 0;
    }

    this.pointsTotal += this.pointsThisRound;

    if (this.onRoundEnd) {
      this.onRoundEnd({
        correct,
        street: this.currentStreet.properties.strassenna,
        points: this.pointsThisRound,
        total: this.pointsTotal,
        round: this.currentRound
      });
    }
  }

  /* --------------------------------------------
     NÄCHSTE RUNDE
  -------------------------------------------- */
  nextRound() {
    this.currentRound++;

    if (this.currentRound > this.maxRounds) {
      if (this.onGameEnd) {
        this.onGameEnd({
          total: this.pointsTotal
        });
      }
      return;
    }

    this.startRound();
  }
}

