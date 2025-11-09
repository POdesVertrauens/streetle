var map = L.map('map').setView([52.5200, 13.4050], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const erlaubteStadtteile = [
  "Mitte", "Moabit", "Tiergarten", "Charlottenburg", "Wilmersdorf",
  "Prenzlauer Berg", "Schöneberg", "Kreuzberg", "Friedrichshain",
  "Neukölln", "Tempelhof", "Alt-Treptow"
];

let alleStrassennamen = new Set();

fetch('berlin-detailnetz.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      filter: function (feature) {
        const stadtteil = feature.properties.stadtteil;
        const name = feature.properties.name;
        if (erlaubteStadtteile.includes(stadtteil) && name) {
          alleStrassennamen.add(name.toLowerCase());
          return true;
        }
        return false;
      },
      style: {
        color: "#ff6600",
        weight: 1
      }
    }).addTo(map);
  });

function checkGuess() {
  const input = document.getElementById("guess").value.trim().toLowerCase();
  const feedback = document.getElementById("feedback");
  if (alleStrassennamen.has(input)) {
    feedback.textContent = "✅ Richtig!";
    feedback.style.color = "green";
  } else {
    feedback.textContent = "❌ Leider falsch.";
    feedback.style.color = "red";
  }
}
