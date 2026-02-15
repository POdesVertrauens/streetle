/* ============================================
   MULTIPLAYER — Lobby, Sync, Host/Join
   ============================================ */

import { GameEngine } from "./game-engine.js";
import { setupSuggestions, show, hide, setText } from "./ui.js";
import { loadGeoJSON } from "./map.js";
import { randomId } from "./utils.js";
import { db, ref, set, update, onValue } from "./firebase.js";

let engine = null;
let gameId = null;
let playerId = randomId(4);
let isHost = false;

window.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  gameId = params.get("game");

  if (gameId) {
    joinGame(gameId);
  } else {
    createGame();
  }
});

/* --------------------------------------------
   HOST erstellt Spiel
-------------------------------------------- */
function createGame() {
  isHost = true;
  gameId = randomId(6);

  const url = `${window.location.origin}${window.location.pathname}?game=${gameId}`;
  document.getElementById("gameId").textContent = `Link: ${url}`;

  set(ref(db, `games/${gameId}`), {
    createdAt: Date.now(),
    started: false,
    players: {}
  });

  addPlayer(playerId, true);

  listenForPlayers();
  listenForStart();

  document.getElementById("btnStart").style.display = "block";
  document.getElementById("btnStart").onclick = startGame;
}

/* --------------------------------------------
   JOINER tritt bei
-------------------------------------------- */
function joinGame(id) {
  isHost = false;
  gameId = id;

  addPlayer(playerId, false);

  listenForPlayers();
  listenForStart();
}

/* --------------------------------------------
   Spieler hinzufügen
-------------------------------------------- */
function addPlayer(id, host) {
  set(ref(db, `games/${gameId}/players/${id}`), {
    joinedAt: Date.now(),
    score: 0,
    isHost: host
  });
}

/* --------------------------------------------
   Lobby aktualisieren
-------------------------------------------- */
function listenForPlayers() {
  onValue(ref(db, `games/${gameId}/players`), (snap) => {
    const players = snap.val() || {};
    const container = document.getElementById("players");
    container.innerHTML = "";

    Object.entries(players).forEach(([pid, p]) => {
      const row = document.createElement("div");
      row.className = "player-row";
      row.textContent = `${pid}${p.isHost ? " (Host)" : ""}`;
      container.appendChild(row);
    });

    document.getElementById("lobbyStatus").textContent =
      `${Object.keys(players).length} Spieler in der Lobby`;
  });
}

/* --------------------------------------------
   Host startet Spiel
-------------------------------------------- */
function startGame() {
  update(ref(db, `games/${gameId}`), {
    started: true
  });
}

/* --------------------------------------------
   Spielstart überwachen
-------------------------------------------- */
function listenForStart() {
  onValue(ref(db, `games/${gameId}/started`), (snap) => {
    if (snap.val() === true) {
      beginMultiplayerGame();
    }
  });
}

/* --------------------------------------------
   Multiplayer-Spiel starten
-------------------------------------------- */
async function beginMultiplayerGame() {
  hide(document.getElementById("lobby"));
  show(document.getElementById("game"));

  const params = new URLSearchParams(window.location.search);
  const contextMode = params.get("context") || "with";
  const streetMode = params.get("streets") || "all";
  const roundTime = Number(params.get("time") || 60);

  engine = new GameEngine({
    contextMode,
    streetMode,
    roundTime
  });

  await engine.loadData();

  const allNames = engine.allFeatures.map(f => f.properties.strassenna);
  setupSuggestions(
    document.getElementById("guessInput"),
    document.getElementById("suggestions"),
    allNames
  );

  engine.onTick = (time) => {
    setText(document.getElementById("timer"), time);
  };

  engine.onRoundEnd = (data) => {
    update(ref(db, `games/${gameId}/players/${playerId}`), {
      score: data.total
    });

    setTimeout(() => {
      engine.nextRound();
    }, 1500);
  };

  engine.onGameEnd = (data) => {
    document.getElementById("feedback").textContent =
      `Spiel beendet! Deine Punkte: ${data.total}`;
  };

  document.getElementById("btnGuess").onclick = () => {
    const val = document.getElementById("guessInput").value;
    engine.guess(val);
  };

  engine.startRound();
}
