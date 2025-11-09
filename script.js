const map = L.map('map').setView([52.5200, 13.4050], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let aktuelleStrasse = null;

fetch('berlin-innenstadt.geojson')
  .then(res => res.json())
  .then(data => {
    const alleFeatures = data.features.filter(f => f.properties.strassenna);
    aktuelleStrasse = alleFeatures[Math.floor(Math.random() * alleFeatures.length)];

    const layer = L.geoJSON(aktuelleStrasse, {
      style: {
        color: "red",
        weight: 8
      }
    }).addTo(map);

    map.fitBounds(layer.getBounds());
  });

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
