let map;
let alleFeatures = [];
let aktuelleStrasse;
let schwierigkeit = "leicht";

// Rundenmodus Variablen
let aktuelleRunde = 0;
let punkteGesamt = 0;
let fehlversuche = 0;
let tippStufe = 0;

// Liste der wichtigen Straßen (gekürzt für Demo)
const wichtigeStrassen = [
  "Friedrichstraße", "Unter den Linden", "Karl-Marx-Allee",
  "Kurfürstendamm", "Tauentzienstraße", "Alexanderplatz",
  "Potsdamer Platz", "Leipziger Straße", "Oranienstraße",
  "Schönhauser Allee", "Karl-Liebknecht-Straße", "Straße des 17. Juni"
];

// Initialisierung
window.onload = () => {
  map = L.map('map').setView([52.52, 13.405], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  fetch('berlin-innenstadt.geojson')
    .then(res => res.json())
    .then(data => {
      alleFeatures = data.features.filter(f => f.properties.strassenna);
      neueStrasse();
    });

  // Menü öffnen/schließen
  document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("sideMenu").classList.toggle("open");
  });

  // Schwierigkeit ändern
  document.querySelectorAll("input[name='difficulty']").forEach(radio => {
    radio.addEventListener("change", (e) => {
      schwierigkeit = e.target.value;
      neueStrasse();
    });
  });
};

// Neues Spiel starten
function neuesSpiel() {
  aktuelleRunde = 0;
  punkteGesamt = 0;
  starteTeilspiel();
}

function starteTeilspiel() {
  fehlversuche = 0;
  tippStufe = 0;
  neueStrasse();
  document.getElementById("feedback").textContent =
    `Teilspiel ${aktuelleRunde+1} von 5 – Punkte bisher: ${punkteGesamt}`;
}

// Neue Straße laden
function neueStrasse() {
  let features = alleFeatures;

  if (schwierigkeit === "leicht") {
    features = alleFeatures.filter(f =>
      wichtigeStrassen.includes(f.properties.strassenna)
    );
  }

  aktuelleStrasse = features[Math.floor(Math.random() * features.length)];

  if (aktuelleStrasse) {
    L.geoJSON(aktuelleStrasse, {style: {color: "red"}}).addTo(map);
  }
}

// Ratefunktion
function guess() {
  const input = document.getElementById("guessInput").value.trim().toLowerCase();
  if (!aktuelleStrasse) return;

  const zielname = (aktuelleStrasse.properties.strassenna || "").toLowerCase();
  const feedback = document.getElementById("feedback");

  if (!input) return;

  if (input === zielname) {
    let punkte = 0;
    if (tippStufe === 0) punkte = 3;
    else if (tippStufe === 1) punkte = 2;
    else if (tippStufe === 2) punkte = 1;

    punkteGesamt += punkte;
    feedback.textContent = `✅ Richtig! +${punkte} Punkte (Gesamt: ${punkteGesamt})`;
    feedback.style.color = "green";

    setTimeout(nextTeilspiel, 1500);
  } else {
    fehlversuche++;
    if (fehlversuche >= 3) {
      feedback.textContent = `❌ 3 Fehlversuche – Lösung: ${aktuelleStrasse.properties.strassenna}`;
      feedback.style.color = "red";
      setTimeout(nextTeilspiel, 2000);
    } else {
      feedback.textContent = `❌ Versuch ${fehlversuche} – nochmal probieren!
