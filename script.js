let alleFeatures = [];
let aktuelleFeatures = [];
let aktuelleStrasse = null;
let tippStufe = 0;
let schwierigkeit = "leicht"; // oder "schwer"

// 📥 Daten laden (richtiger Dateiname!)
fetch('berlin-innenstadt.geojson')
  .then(res => res.json())
  .then(data => {
    alleFeatures = data.features.filter(f => f.properties.strassenna);

    // Sortieren nach Länge (absteigend)
    alleFeatures.sort((a, b) => b.properties.length - a.properties.length);

    if (schwierigkeit === "leicht") {
      aktuelleFeatures = alleFeatures.slice(0, 100); // Top 100
    } else {
      aktuelleFeatures = alleFeatures; // alle Straßen
    }

    neueStrasse();
  });

// 🎯 Neue Straße wählen
function neueStrasse() {
  tippStufe = 0;
  aktuelleStrasse = aktuelleFeatures[Math.floor(Math.random() * aktuelleFeatures.length)];
  document.getElementById("feedback").innerText = "";
  document.getElementById("tippBox").innerText = "";
}

// ✅ Rate-Logik
function guess() {
  const input = document.getElementById("guessInput").value.trim();
  if (!aktuelleStrasse) return;

  if (input.toLowerCase() === aktuelleStrasse.properties.strassenna.toLowerCase()) {
    document.getElementById("feedback").innerText = "✅ Richtig!";
  } else {
    document.getElementById("feedback").innerText = "❌ Falsch, versuch's nochmal!";
  }
}

// 💡 Tipp-Logik
function zeigeTipp() {
  tippStufe++;

  let tippText = "";
  if (tippStufe === 1) {
    tippText = "Straßenlänge: " + Math.round(aktuelleStrasse.properties.length) + " m";
  } else if (tippStufe === 2) {
    let name = aktuelleStrasse.properties.strassenna;
    tippText = "Die ersten drei Buchstaben: " + name.substring(0, 3);
  } else {
    tippText = "Keine weiteren Tipps!";
  }

  document.getElementById("tippBox").innerText = tippText;
}

// 🔍 Autocomplete Vorschläge
function zeigeVorschlaege(eingabe) {
  const box = document.getElementById("vorschlagBox");
  box.innerHTML = "";

  if (eingabe.length < 2) return; // erst ab 2 Buchstaben

  const matches = alleFeatures
    .map(f => f.properties.strassenna)
    .filter(name => name.toLowerCase().startsWith(eingabe.toLowerCase()))
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
