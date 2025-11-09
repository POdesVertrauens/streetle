var map = L.map('map').setView([52.5200, 13.4050], 12);

L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
}).addTo(map);

const erlaubteStadtteile = [
  "Mitte", "Moabit", "Tiergarten", "Charlottenburg", "Wilmersdorf",
  "Prenzlauer Berg", "Schöneberg", "Kreuzberg", "Friedrichshain",
  "Neukölln", "Tempelhof", "Alt-Treptow"
];

fetch('berlin_strassen.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      filter: function (feature) {
        const stadtteil = feature.properties.stadtteil;
        return erlaubteStadtteile.includes(stadtteil);
      },
      style: {
        color: "#ff6600",
        weight: 1
      },
      onEachFeature: function (feature, layer) {
        layer.on('click', function () {
          alert("Straße: " + feature.properties.name);
        });
      }
    }).addTo(map);
  });
