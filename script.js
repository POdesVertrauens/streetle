/* ===========================
   GLOBAL VARIABLEN
=========================== */

let map;
let featureLayer;
let alleFeatures = [];
let aktuelleStrasse;

let streetMode = "all";
let contextMode = "withLabels";

let aktuelleRunde = 0;
let punkteGesamt = 0;
let fehlversuche = 0;
let tippStufe = 0;

let isMultiplayer = false;
let isHost = false;
let gameId = null;
let playerId = null;

const wichtigeStrassen = [
  "Friedrichstraße", "Unter den Linden", "Karl-Marx-Allee",
  "Kurfürstendamm", "Tauentzienstraße", "Alexanderplatz",
  "Potsdamer Platz", "Leipziger Straße", "Oranienstraße",
  "Schönhauser Allee", "Karl-Liebknecht-Straße", "Straße des 17. Juni"
];

/* ===========================
   HELFER
=========================== */

function normalizeName(name) {
  return (name || "")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/\s*\(.*?\)\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function setFeedback(text, color) {
  const el = document.getElementById("feedback");
  if (!el) return;
  el.textContent = text;
  el.style.color = color || "inherit";
}

function isMatch(a, b) {
  return a.replace(/[\s-]/g, "") === b.replace(/[\s-]/g, "");
}

function randomId(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/* ===========================
   VIEW SWITCHING
=========================== */

function showStartscreen(show) {
  document.getElementById("startscreen").style.display = show ? "block" : "none";
  document.getElementById("gameScreen").style.display = show ? "none" : "block";
}

function showLobby(show) {
  document.getElementById("lobby").style.display = show ? "block" : "none";
  document.getElementById("game-container").style.display = show ? "none" : "block";
}

function showGame(show) {
  document.getElementById("lobby").style.display = show ? "none" : "block";
  document.getElementById("game-container").style.display = show ? "block" : "none";
}

/* ===========================
   STARTSCREEN LOGIK
=========================== */

window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const joinGameId = urlParams.get("game");

  document.getElementById("singleplayer").onclick = () => {
    isMultiplayer = false;
    isHost = false;
    startSingleplayer();
  };

  document.getElementById("multiplayer").onclick = () => {
    document.getElementById("mpSection").style.display = "block";
  };

  document.getElementById("createPartyBtn").onclick = () => {
    isMultiplayer = true;
    isHost = true;
    gameId = randomId();
    playerId = randomId(4);

    const baseUrl = window.location.origin + window.location.pathname;
    const link = `${baseUrl}?game=${gameId}`;

    document.getElementById("partyLinkInfo").textContent = `Link zum Teilen: ${link}`;
    document.getElementById("partyStatus").textContent = `Party erstellt (ID: ${gameId}). Warte auf Spieler…`;

    initMultiplayerHost(gameId);
    enterLobbyAsHost();
  };

  document.getElementById("menuToggle").onclick = () => {
    document.getElementById("sideMenu").classList.toggle("open");
  };

  document.getElementById("startGameBtn").onclick = () => {
    if (isHost && gameId && window.streetleFirebase) {
      const { db, ref, update } = window.streetleFirebase;
      update(ref(db, `games/${gameId}`), {
        started: true,
        currentRound: 0
      });
      startMultiplayerGame();
    }
  };

  if (joinGameId) {
    isMultiplayer = true;
    isHost = false;
    gameId = joinGameId;
    playerId = randomId(4);
    joinMultiplayerGame(gameId);
  }
});

/* ===========================
   SINGLEPLAYER
=========================== */

function startSingleplayer() {
  showStartscreen(false);

  contextMode = document.getElementById("contextOn").checked ? "withLabels" : "noLabels";
  streetMode = document.getElementById("majorStreets").checked ? "major" : "all";

  initMap();
  loadGeoJSON().then(() => {
    showGame(true);
    neuesSpiel();
  });
}

/* ===========================
   MAP + GEOJSON
=========================== */

function initMap() {
  if (map) return;

  map = L.map('map').setView([52.52, 13.405], 12);

  const url = contextMode === "withLabels"
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';

  L.tileLayer(url, {
    attribution: '© OpenStreetMap © CARTO',
    subdomains: 'abcd'
  }).addTo(map);
}

async function loadGeoJSON() {
  if (alleFeatures.length) return;
  const res = await fetch("berlin-innenstadt.geojson");
  const data = await res.json();
  alleFeatures = data.features.filter(f => f.properties.strassenna);
}

/* ===========================
   SPIELLOGIK
=========================== */

function neuesSpiel() {
  aktuelleRunde = 0;
  punkteGesamt = 0;
  starteTeilspiel();
}

function starteTeilspiel() {
  fehlversuche = 0;
  tippStufe = 0;
  neueStrasse();
  setFeedback(`Teilspiel ${aktuelleRunde + 1} von 5 – Punkte: ${punkteGesamt}`);
}

function neueStrasse() {
  let pool = alleFeatures;

  if (streetMode === "major") {
    const wichtigeNorm = new Set(wichtigeStrassen.map(normalizeName));
    pool = alleFeatures.filter(f => wichtigeNorm.has(normalizeName(f.properties.strassenna)));
  }

  aktuelleStrasse = pool[Math.floor(Math.random() * pool.length)];

  if (featureLayer) map.removeLayer(featureLayer);

  featureLayer = L.geoJSON(aktuelleStrasse, { style: { color: "red", weight: 4 } }).addTo(map);

  try {
    const bounds = featureLayer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.2));
  } catch {}

  if (isMultiplayer && isHost && window.streetleFirebase) {
    const { db, ref, update } = window.streetleFirebase;
    update(ref(db, `games/${gameId}`), {
      currentStreetName: aktuelleStrasse.properties.strassenna,
      currentRound: aktuelleRunde
    });
  }
}

function guess() {
  const input = normalizeName(document.getElementById("guessInput").value);
  const ziel = normalizeName(aktuelleStrasse.properties.strassenna);

  if (!input) return;

  if (isMatch(input, ziel)) {
    let punkte = [3, 2, 1][tippStufe] || 0;
    punkteGesamt += punkte;
    setFeedback(`Richtig! +${punkte} Punkte`, "green");
    setTimeout(nextTeilspiel, 1200);
  } else {
    fehlversuche++;
    if (fehlversuche >= 3) {
      setFeedback(`Falsch! Lösung: ${aktuelleStrasse.properties.strassenna}`, "red");
      setTimeout(nextTeilspiel, 1500);
    } else {
      setFeedback(`Falsch – Versuch ${fehlversuche}`, "red");
    }
  }
}

function nextTeilspiel() {
  aktuelleRunde++;
  if (aktuelleRunde < 5) starteTeilspiel();
  else setFeedback(`Runde beendet! Gesamtpunkte: ${punkteGesamt}`, "blue");
}

/* ===========================
   MULTIPLAYER – HOST
=========================== */

function initMultiplayerHost(id) {
  const { db, ref, set, onValue } = window.streetleFirebase;

  set(ref(db, `games/${id}`), {
    createdAt: Date.now(),
    started: false,
    currentRound: 0,
    currentStreetName: null
  });

  onValue(ref(db, `games/${id}/players`), snap => {
    renderPlayersList(snap.val() || {});
  });

  set(ref(db, `games/${id}/players/${playerId}`), {
    joinedAt: Date.now(),
    score: 0,
    isHost: true
  });
}

function enterLobbyAsHost() {
  showStartscreen(false);
  showLobby(true);

  document.getElementById("lobbyGameId").textContent = `Game ID: ${gameId}`;
  document.getElementById("lobbyStatus").textContent = "Warte auf Spieler…";
  document.getElementById("startGameBtn").style.display = "inline-block";
}

/* ===========================
   MULTIPLAYER – JOINER
=========================== */

function joinMultiplayerGame(id) {
  const { db, ref, set, onValue } = window.streetleFirebase;

  showStartscreen(false);
  showLobby(true);

  document.getElementById("lobbyGameId").textContent = `Game ID: ${id}`;
  document.getElementById("lobbyStatus").textContent = "Warte auf Host…";
  document.getElementById("startGameBtn").style.display = "none";

  set(ref(db, `games/${id}/players/${playerId}`), {
    joinedAt: Date.now(),
    score: 0,
    isHost: false
  });

  onValue(ref(db, `games/${id}/players`), snap => {
    renderPlayersList(snap.val() || {});
  });

  onValue(ref(db, `games/${id}`), snap => {
    const game = snap.val();
    if (game?.started) startMultiplayerGameAsJoiner(game);
  });
}

/* ===========================
   LOBBY RENDERING
=========================== */

function renderPlayersList(players) {
  const list = document.getElementById("playersList");
  list.innerHTML = "";

  Object.entries(players).forEach(([pid, p]) => {
    const card = document.createElement("div");
    card.className = "player-card";

    const avatar = document.createElement("div");
    avatar.className = "player-avatar";
    avatar.style.background = randomColorFromId(pid);

    const name = document.createElement("span");
    name.className = "player-name";
    name.textContent = pid;

    card.appendChild(avatar);
    card.appendChild(name);

    if (p.isHost) {
      const hostBadge = document.createElement("span");
      hostBadge.className = "player-host";
      hostBadge.textContent = "Host";
      card.appendChild(hostBadge);
    }

    list.appendChild(card);
  });

  document.getElementById("lobbyStatus").textContent =
    `${Object.keys(players).length} Spieler in der Lobby`;
}

function randomColorFromId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
}

/* ===========================
   MULTIPLAYER – SPIELSTART
=========================== */

function startMultiplayerGame() {
  initMap();
  loadGeoJSON().then(() => {
    showGame(true);
    neuesSpiel();
  });
}

function startMultiplayerGameAsJoiner(game) {
  initMap();
  loadGeoJSON().then(() => {
    showGame(true);

    if (game.currentStreetName) {
      const match = alleFeatures.find(
        f => f.properties.strassenna === game.currentStreetName
      );
      if (match) {
        aktuelleStrasse = match;
        if (featureLayer) map.removeLayer(featureLayer);
        featureLayer = L.geoJSON(match, { style: { color: "red", weight: 4 } }).addTo(map);
      }
    }

    aktuelleRunde = game.currentRound || 0;
    setFeedback(`Teilspiel ${aktuelleRunde + 1} von 5 – Punkte: ${punkteGesamt}`);
  });
}
