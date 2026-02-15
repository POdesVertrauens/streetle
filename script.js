/* ===========================
   GLOBAL VARS
=========================== */

let map;
let featureLayer;
let alleFeatures = [];
let aktuelleStrasse;

let schwierigkeit = "leicht";
let streetMode = "all";
let contextMode = "withLabels";

let aktuelleRunde = 0;
let punkteGesamt = 0;
let fehlversuche = 0;
let tippStufe = 0;

const wichtigeStrassen = [
  "Friedrichstraße", "Unter den Linden", "Karl-Marx-Allee",
  "Kurfürstendamm", "Tauentzienstraße", "Alexanderplatz",
  "Potsdamer Platz", "Leipziger Straße", "Oranienstraße",
  "Schönhauser Allee", "Karl-Liebknecht-Straße", "Straße des 17. Juni"
];

/* ===========================
   HELPERS
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
  el.textContent = text;
  el.style.color = color || "inherit";
}

function isMatch(a, b) {
  if (a === b) return true;
  return a.replace(/[\s-]/g, "") === b.replace(/[\s-]/g, "");
}

/* ===========================
   STARTSCREEN → GAME
=========================== */

window.addEventListener("load", () => {
  document.getElementById("singleplayer").addEventListener("click", () => {
    document.querySelector(".startscreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";

    contextMode = document.getElementById("contextOn").checked ? "withLabels" : "noLabels";
    streetMode = document.getElementById("majorStreets").checked ? "major" : "all";

    initMap();
    loadGeoJSON().then(() => neuesSpiel());
  });
});

/* ===========================
   MAP + GEOJSON
=========================== */

function initMap() {
  map = L.map('map').setView([52.52, 13.405], 12);

  if (contextMode === "withLabels") {
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: 'abcd'
    }).addTo(map);
  } else {
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: 'abcd'
    }).addTo(map);
  }
}

async function loadGeoJSON() {
  const res = await fetch("berlin-innenstadt.geojson");
  const data = await res.json();
  alleFeatures = data.features.filter(f => f.properties.strassenna);
}

/* ===========================
   GAME LOGIC
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
