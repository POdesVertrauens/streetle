// 🗺️ Karte initialisieren
const map = L.map('map').setView([52.52, 13.405], 12);

// 🌍 Schwarz-Weiß Tile-Layer ohne Labels
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20
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

// 🔍 Autocomplete Vorschläge
function zeigeVorschlaege(eingabe) {
  const box = document.getElementById("vorschlagBox");
  box.innerHTML = "";

  if (eingabe.length < 2) return; // erst ab 2 Buchstaben

  const matches = alleFeatures
    .map(f => f.properties.strassenna)
    .filter(name => name && name.toLowerCase().startsWith(eingabe.toLowerCase()))
    .slice(0, 10); // max. 10 Vorschläge

  matches.forEach(name => {
    const div = document.createElement("div");
    div.innerText = name;
    div.onclick = () => {
      document.getElementById("guessInput").value = name;
      box.innerHTML = "";
    };
    box.appendChild(div);
  });
}

// 💡 Tipp-Logik (2-stufig: 1 Buchstabe, dann 3 Buchstaben)
function zeigeTipp() {
  if (!aktuelleStrasse) return;
  const btn = document.getElementById("tippButton");
  const name = aktuelleStrasse.properties.strassenna || "";

  if (tippStufe === 0) {
    // 1. Tipp: erster Buchstabe
    document.getElementById("tippBox").innerText =
      "Die Straße beginnt mit " + name.substring(0, 1);
    if (btn) btn.innerText = "Weiteren Tipp erhalten";
    tippStufe = 1;
  } else if (tippStufe === 1) {
    // 2. Tipp: erste drei Buchstaben
    document.getElementById("tippBox").innerText =
      "Die Straße beginnt mit " + name.substring(0, 3);
    if (btn) btn.innerText = "Keine weiteren Tipps verfügbar";
    tippStufe = 2;
  } else {
    // keine weiteren Tipps, Text bleibt wie er ist
    if (btn) btn.innerText = "Keine weiteren Tipps verfügbar";
  }
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

// ⌨️ ENTER als Absenden
document.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    guess();
  }
});
