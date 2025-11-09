// Karte initialisieren
const map = L.map('map').setView([52.5200, 13.4050], 12);

// Tile-Layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Alle Features und Straßennamen speichern
let alleFeatures = [];
let aktuelleStrasse = null;
let geoJsonLayer = null;

// GeoJSON laden
fetch('berlin-innenstadt.geojson')
  .then(res => res.json())
  .then(data => {
    // Nur Features mit gültigem Straßennamen
    alleFeatures = data.features.filter(f => f.properties.strassenna);

    // Layer erzeugen (grau)
    geoJsonLayer = L.geoJSON(data, {
      style: {
        color: "#e01010",
        weight: 1
      }
    }).addTo(map);

    // Zufällige Straße auswählen
    aktuelleStrasse = alleFeatures[Math.floor(Math.random() * alleFeatures.length)];
    console.log("Gesuchte Straße:", aktuelleStrasse.properties.strassenna);
  });

// Eingabe prüfen
function checkGuess() {
  const input = document.getElementById("guess").value.trim().toLowerCase();
  const feedback = document.getElementById("feedback");

  if (!aktuelleStrasse) {
    feedback.textContent = "⏳ Daten werden noch geladen...";
    feedback.style.color = "gray";
    return;
  }

  const zielname = aktuelleStrasse.properties.strassenna.toLowerCase();

  if (input === zielname) {
    feedback.textContent = "✅ Richtig!";
    feedback.style.color = "green";

    // Straße
