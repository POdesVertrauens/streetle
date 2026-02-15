/* ===== GLOBAL VARS ===== */

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
let gameId = null;
let playerId = null;

const wichtigeStrassen = [
  "Friedrichstraße", "Unter den Linden", "Karl-Marx-Allee",
  "Kurfürstendamm", "Tauentzienstraße", "Alexanderplatz",
  "Potsdamer Platz", "Leipziger Straße", "Oranienstraße",
  "Schönhauser Allee", "Karl-Liebknecht-Straße", "Straße des 17. Juni"
];

/* ===== HELPERS ===== */

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
  if (a === b) return true;
  return a.replace(/[\s-]/g, "") === b.replace(/[\s-]/g, "");
}

function randomId(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/* ===== STARTSCREEN LOGIK ===== */

window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const joinGameId = urlParams.get("game");

  document.getElementById("singleplayer").addEventListener("click", () => {
    isMultiplayer = false;
    startGameFromStartscreen();
  });

  document.getElementById("multiplayer").addEventListener("click", () => {
    document.getElementById("mpSection").style.display = "block";
  });

  document.getElementById("createPartyBtn").addEventListener("click", () => {
    isMultiplayer = true;
    gameId = randomId();
    playerId = randomId(4);

    const baseUrl = window.location.origin + window.location.pathname;
    const link = `${baseUrl}?game=${gameId}`;
    document.getElementById("partyLinkInfo").textContent = `Link zum Teilen: ${link}`;
    document.getElementById("partyStatus").textContent = `Party erstellt (ID: ${gameId}). Warte auf Mitspieler…`;

    initMultiplayerHost(gameId);
  });

  if (joinGameId) {
    isMultiplayer = true;
    gameId = joinGameId;
    playerId = randomId(4);
    joinMultiplayerGame(gameId);
  }
});

function startGameFromStartscreen() {
  document.querySelector(".startscreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";

  contextMode = document.getElementById("contextOn").checked ? "withLabels" : "noLabels";
  streetMode = document.getElementById("majorStreets").checked ? "major" : "all";

  initMap();
  loadGeoJSON().then(() => neuesSpiel());
}

/* ===== MAP + GEOJSON ===== */

function initMap() {
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
  const res = await fetch("berlin-innenstadt.geojson");
  const data = await res.json();
  alleFeatures = data.features.filter(f => f.properties.strassenna);
}

/* ===== GAME LOGIC ===== */

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

  if (isMultiplayer && window.streetleFirebase && gameId) {
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

    if (isMultiplayer && window.streetleFirebase && gameId && playerId) {
      const { db, ref, update } = window.streetleFirebase;
      update(ref(db, `games/${gameId}/players/${playerId}`), {
        score: punkteGesamt,
        lastGuessCorrect: true
      });
    }

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

function zeigeTipp() {
  const name = aktuelleStrasse.properties.strassenna;
  const box = document.getElementById("tippBox");

  if (tippStufe === 0) {
    box.innerHTML = `<p>Erster Buchstabe: <strong>${name[0]}</strong></p>`;
  } else if (tippStufe === 1) {
    box.innerHTML += `<p>Länge: <strong>${name.length}</strong> Zeichen</p>`;
  }

  tippStufe = Math.min(2, tippStufe + 1);
}

function zeigeVorschlaege(query) {
  const box = document.getElementById("vorschlagBox");
  box.innerHTML = "";
  query = normalizeName(query);
  if (!query) return;

  const names = alleFeatures.map(f => f.properties.strassenna);
  const filtered = names.filter(n => normalizeName(n).includes(query)).slice(0, 10);

  filtered.forEach(n => {
    const div = document.createElement("div");
    div.textContent = n;
    div.onclick = () => {
      document.getElementById("guessInput").value = n;
      box.innerHTML = "";
    };
    box.appendChild(div);
  });
}

/* ===== MULTIPLAYER (Firebase) ===== */

function initMultiplayerHost(id) {
  if (!window.streetleFirebase) return;
  const { db, ref, set, onValue } = window.streetleFirebase;

  set(ref(db, `games/${id}`), {
    createdAt: Date.now(),
    currentRound: 0,
    currentStreetName: null
  });

  onValue(ref(db, `games/${id}/players`), snap => {
    const players = snap.val() || {};
    const names = Object.keys(players);
    document.getElementById("partyStatus").textContent =
      `Spieler in der Lobby: ${names.length}`;
  });
}

function joinMultiplayerGame(id) {
  if (!window.streetleFirebase) return;
  const { db, ref, set, onValue } = window.streetleFirebase;

  document.querySelector(".startscreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";

  contextMode = "withLabels";
  streetMode = "all";

  initMap();
  loadGeoJSON().then(() => {
    set(ref(db, `games/${id}/players/${playerId}`), {
      joinedAt: Date.now(),
      score: 0
    });

    onValue(ref(db, `games/${id}`), snap => {
      const game = snap.val();
      if (!game) return;

      const infoEl = document.getElementById("mpInfo");
      if (infoEl) {
        infoEl.textContent = `Multiplayer – Game ID: ${id}`;
      }

      if (game.currentStreetName && (!aktuelleStrasse || aktuelleStrasse.properties.strassenna !== game.currentStreetName)) {
        const match = alleFeatures.find(f => f.properties.strassenna === game.currentStreetName);
        if (match) {
          aktuelleStrasse = match;
          if (featureLayer) map.removeLayer(featureLayer);
          featureLayer = L.geoJSON(aktuelleStrasse, { style: { color: "red", weight: 4 } }).addTo(map);
          try {
            const bounds = featureLayer.getBounds();
            if (bounds.isValid()) map.fitBounds(bounds.pad(0.2));
          } catch {}
        }
      }
    });

    neuesSpiel();
  });
}
