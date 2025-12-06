// 🟦 Globale Variablen
let map;
let featureLayer;
let alleFeatures = [];
let aktuelleStrasse;
let schwierigkeit = "leicht";

// 🟨 Rundenmodus
let aktuelleRunde = 0;
let punkteGesamt = 0;
let fehlversuche = 0;
let tippStufe = 0;

// 🟩 Wichtige Straßen (Demo-Liste, erweitern!)
const wichtigeStrassen = [
  "Friedrichstraße", "Unter den Linden", "Karl-Marx-Allee",
  "Kurfürstendamm", "Tauentzienstraße", "Alexanderplatz",
  "Potsdamer Platz", "Leipziger Straße", "Oranienstraße",
  "Schönhauser Allee", "Karl-Liebknecht-Straße", "Straße des 17. Juni"
];

// 🟪 Hilfsfunktionen
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
  const compact = s => s.replace(/[\s-]/g, "");
  return compact(a) === compact(b);
}

// 🟦 Initialisierung
window.addEventListener("load", () => {
  // Karte mit Carto Positron (hell, ohne Labels)
  map = L.map('map').setView([52.52, 13.405], 12);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // Menü öffnen/schließen
  document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("sideMenu").classList.toggle("open");
  });

  // Schwierigkeit ändern
  document.querySelectorAll("input[name='difficulty']").forEach(radio => {
    radio.addEventListener("change", (e) => {
      schwierigkeit = e.target.value;
      if (alleFeatures.length) starteTeilspiel(true);
    });
  });

  // GeoJSON laden
  fetch('berlin-innenstadt.geojson')
    .then(res => res.json())
    .then(data => {
      alleFeatures = data.features.filter(f => f.properties.strassenna);
      neueStrasse();
    })
    .catch(err => {
      console.error("GeoJSON Fehler:", err);
      setFeedback("⚠️ GeoJSON konnte nicht geladen werden.", "red");
    });
});

// 🟨 Neues Spiel starten
function neuesSpiel() {
  aktuelleRunde = 0;
  punkteGesamt = 0;
  starteTeilspiel(false);
}

// 🟩 Teilspiel starten
function starteTeilspiel(force = false) {
  fehlversuche = 0;
  tippStufe = 0;
  neueStrasse();
  setFeedback(`Teilspiel ${aktuelleRunde + 1} von 5 – Punkte bisher: ${punkteGesamt}`);
}

// 🟪 Neue Straße auswählen
function neueStrasse() {
  if (!alleFeatures.length) return;

  let pool = alleFeatures;
  if (schwierigkeit === "leicht") {
    const wichtigeNorm = new Set(wichtigeStrassen.map(normalizeName));
    pool = alleFeatures.filter(f => wichtigeNorm.has(normalizeName(f.properties.strassenna)));
    if (pool.length === 0) {
      console.warn("Leicht-Filter ergab 0 Ergebnisse – verwende alle Straßen.");
      pool = alleFeatures;
    }
  }

  aktuelleStrasse = pool[Math.floor(Math.random() * pool.length)];

  if (featureLayer) map.removeLayer(featureLayer);
  featureLayer = L.geoJSON(aktuelleStrasse, { style
