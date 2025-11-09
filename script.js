// Karte initialisieren
const map = L.map('map').setView([52.5200, 13.4050], 12);

// Tile-Layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Aktuelles Feature
let aktuelleStrasse = null;

// GeoJSON laden
fetch('berlin-innenstadt.geojson')
  .then(res => res.json())
  .then(data => {
    // Nur Features mit gültigem Straßennamen
    const alleFeatures = data.features.filter(f => f.properties.strassenna);

    // Zufälliges Feature auswählen
    aktuelleStrasse = alleFeatures[Math.floor(Math.random() * alleFeatures.length)];

    // Straße rot anzeigen
    L.geoJSON(aktuelleStrasse, {
      style: {
        color: "red",
        weight: 4
      }
    }).addTo(map);

    console.log("Gesuchte Straße:", aktuelleStrasse.properties.strassenna);
  });

// Eing
