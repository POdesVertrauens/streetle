// 🗺️ Karte initialisieren
const map = L.map('map').setView([52.52, 13.405], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 🔁 Spielstatus
let alleFeatures = [];
let aktuelleStrasse = null;
let aktuelleLayer = null;

// 📥 GeoJSON laden
fetch('berlin-innenstadt.geojson')
  .then(res => res.json())
  .then(data => {
    alleFeatures = data.features.filter(f => f.properties.strassenna);
    neueStrasse();
  });

// 🎯 Neue Straße auswählen und anzeigen
function neueStrasse() {
  if (aktuelleLayer) {
    map.removeLayer(aktuelleLayer);
  }

  aktuelleStrasse = alleFeatures[Math.floor(Math.random() * alleFeatures.length)];

  aktuelleLayer = L.geoJSON(aktuelleStrasse, {
    style: {
      color: "red",
      weight: 8
    }
  }).addTo(map);

  map.fitBounds(aktuelleLayer.getBounds());

  document.getElementById("feedback").textContent = "";
  document.getElementById("guessInput").value = "";
}

// 🧪 Ratefunktion mit Toleranz
function guess() {
  const input = document.getElementById("guessInput").value.trim().toLowerCase();
  const zielname = aktuelleStrasse.properties.strassenna.toLowerCase();
  const feedback = document.getElementById("feedback");

  if (!input) return;

  if (istAehnlich(input, zielname)) {
    feedback.textContent = "✅ Richtig!";
    feedback.style.color = "green";
    setTimeout(neueStrasse, 1500);
  } else {
    feedback.textContent = "❌ Leider falsch.";
    feedback.style.color = "red";
  }
}

// 💡 Tipp anzeigen
function showHint() {
  if (!aktuelleStrasse) return;
  const buchstabe = aktuelleStrasse.properties.strassenna.trim().charAt(0).toUpperCase();
  const feedback = document.getElementById("feedback");
  feedback.textContent = `💡 Die gesuchte Straße beginnt mit einem "${buchstabe}".`;
  feedback.style.color = "#333";
}

// 🔍 Toleranter Vergleich (Levenshtein-Distanz)
function istAehnlich(a, b) {
  const dist = levenshtein(a, b);
  return dist <= 2 || b.includes(a) || a.includes(b);
}

// 🔢 Levenshtein-Distanz
function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => []);
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const kosten = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + kosten
      );
    }
  }

  return matrix[a.length][b.length];
}
