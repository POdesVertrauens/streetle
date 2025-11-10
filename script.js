// Menü öffnen/schließen
document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("sideMenu").classList.toggle("open");
});

// Schwierigkeit ändern
document.querySelectorAll("input[name='difficulty']").forEach(radio => {
  radio.addEventListener("change", (e) => {
    schwierigkeit = e.target.value;

    // Filter anwenden
    if (schwierigkeit === "leicht") {
      alleFeatures = alleFeatures.filter(f =>
        wichtigeStrassen.includes(f.properties.strassenna)
      );
    } else {
      // schwer = alle Straßen wieder laden
      fetch('berlin-innenstadt.geojson')
        .then(res => res.json())
        .then(data => {
          alleFeatures = data.features.filter(f => f.properties.strassenna);
          neueStrasse();
        });
      return;
    }

    // Neue Runde starten
    neueStrasse();
  });
});

// 🗺️ Karte initialisieren
const map = L.map('map').setView([52.52, 13.405], 12);

// 🌍 Schwarz-Weiß Tile-Layer ohne Labels
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors © CARTO',
  subdomains: 'abcd',
  maxZoom: 20
}).addTo(map);

// 🔁 Spielstatus
let alleFeatures = [];
let aktuelleStrasse = null;
let aktuelleLayer = null;
let tippStufe = 0;
let schwierigkeit = "leicht";

// 📥 GeoJSON laden
fetch('berlin-innenstadt.geojson')
  .then(res => res.json())
  .then(data => {
    alleFeatures = data.features.filter(f => f.properties && f.properties.strassenna);
    neueStrasse();
  });

// 🎯 Neue Straße auswählen und anzeigen
function neueStrasse() {
  if (aktuelleLayer) {
    map.removeLayer(aktuelleLayer);
  }

  aktuelleStrasse = alleFeatures[Math.floor(Math.random() * alleFeatures.length)];

  aktuelleLayer = L.geoJSON(aktuelleStrasse, {
    style: { color: "red", weight: 8 }
  }).addTo(map);

  map.fitBounds(aktuelleLayer.getBounds());

  // UI reset
  document.getElementById("feedback").textContent = "";
  document.getElementById("guessInput").value = "";

  // 💡 Tipp zurücksetzen
  tippStufe = 0;
  const btn = document.getElementById("tippButton");
  if (btn) btn.innerText = "💡 Tipp anzeigen";
  document.getElementById("tippBox").innerText = "";
}

// 🧪 Ratefunktion mit Toleranz
function guess() {
  const input = document.getElementById("guessInput").value.trim().toLowerCase();
  if (!aktuelleStrasse) return;

  const zielname = (aktuelleStrasse.properties.strassenna || "").toLowerCase();
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

// Liste der wichtigsten Straßen
const wichtigeStrassen = [
  "Friedrichstraße",
  "Unter den Linden",
  "Karl-Marx-Allee",
  "Gneisenaustraße",
  "Mehringdamm",
  "Prenzlauer Allee",
  "Frankfurter Allee",
  "Kantstraße",
  "Kurfürstendamm",
  "Alexanderplatz",
  "Potsdamer Platz",
  "Leipziger Straße",
  "Torstraße",
  "Oranienstraße",
  "Schönhauser Allee",
  "Müllerstraße",
  "Seestraße",
  "Tempelhofer Damm",
  "Hermannstraße",
  "Karl-Liebknecht-Straße",
  "Straße des 17. Juni",
  "Wilhelmstraße",
  "Invalidenstraße",
  "Greifswalder Straße",
  "Oberbaumbrücke",
  "Alt-Moabit",
  "Heidestraße",
  "Chausseestraße",
  "Landsberger Allee",
  "Hasenheide",
  "Adalbertstraße",
  "Skalitzer Straße",
  "Warschauer Straße",
  "Boxhagener Straße",
  "Karl-Marx-Straße",
  "Sonnenallee",
  "Revaler Straße",
  "Frankfurter Tor",
  "Straßburger Straße",
  "Kottbusser Damm",
  "Urbanstraße",
  "Grunewaldstraße",
  "Bismarckstraße",
  "Spandauer Damm",
  "Breite Straße",  
  "Turmstraße",
  "Birkenstraße",
  "Schloßstraße",
  "Stuttgarter Platz",
  "Fasanenstraße",
  "Bülowstraße",
  "Motzstraße",
  "Potsdamer Straße",
  "Oranienburger Straße",
  "Zionskirchplatz",
  "Ludwigkirchplatz",
  "Pariser Platz",
  "Hackescher Markt",
  "Rosenthaler Platz",
  "Boxhagener Platz",
  "Mauerpark",
  "Savignyplatz",
  "Nollendorfplatz",
  "Kollwitzplatz",
  "Kollwitzstraße",
  "Helmholtzplatz",
  "Görlitzer Straße",
  "Schlesische Straße",
  "Breitscheidplatz",
  "Budapester Straße",
  "Tauentzienstraße",
  "Hauptstraße",
  "Wiener Straße",
  "Reichenberger Straße",
  "Graefestraße",
  "Hermannplatz",
  "Holzmarktstraße"
];

// Filter anwenden
if (schwierigkeit === "leicht") {
  alleFeatures = alleFeatures.filter(f =>
    wichtigeStrassen.includes(f.properties.strassenna)
  );
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

// 🔢 Levenshtein-Distanz (vollständig geschlossen)
function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const kosten = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // Löschung
        matrix[i][j - 1] + 1,     // Einfügung
        matrix[i - 1][j - 1] + kosten // Ersetzung
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
