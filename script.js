// 🗺️ Karte initialisieren
const map = L.map('map').setView([52.52, 13.405], 12);

// 🌍 Tile-Layer laden
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 🎯 Aktuelle Zielstraße
let aktuelleStrasse = null;

// 📥 GeoJSON laden & zufällige Straße auswählen
fetch('berlin-innenstadt.geojson')
  .then(res => res.json())
  .then(data => {
    const alleFeatures = data.features.filter(f => f.properties.strassenna);
    aktuelleStrasse = alleFeatures[Math.floor(Math.random() * alleFeatures.length)];

    // 🔴 Straße rot darstellen
    const layer = L.geoJSON(aktuelleStrasse, {
      style: {
        color: "red",
        weight: 8
      }
    }).addTo(map);

    // 🔍 Karte auf Straße zoomen
    map.fitBounds(layer.getBounds());
  });

// 🧪 Ratefunktion
function guess() {
  const input = document.getElementById("guessInput").value.trim().toLowerCase();
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
  } else {
    feedback.textContent = "❌ Leider falsch.";
    feedback.style.color = "red";
  }
}
