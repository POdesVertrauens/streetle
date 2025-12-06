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
  map = L.map('map').setView([52.52, 13.405], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("sideMenu").classList.toggle("open");
  });

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

//
