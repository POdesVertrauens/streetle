/* ============================================
   MAP — Leaflet-Initialisierung & GeoJSON
   ============================================ */

import { BASEMAPS } from "./config.js";

let map = null;
let currentLayer = null;

/* Karte initialisieren */
export function initMap(contextMode = "withContext") {
  map = L.map("map", {
    zoomControl: true,
    attributionControl: true
  }).setView([52.52, 13.405], 13);

  const url = contextMode === "withoutContext"
    ? BASEMAPS.withoutContext
    : BASEMAPS.withContext;

  L.tileLayer(url, {
    subdomains: "abcd",
    attribution: "© OpenStreetMap © CARTO"
  }).addTo(map);

  return map;
}

/* GeoJSON laden */
export async function loadGeoJSON() {
  const res = await fetch("data/berlin-innenstadt.geojson");
  const data = await res.json();
  return data;
}

/* Zufällige Straße auswählen */
export function pickRandomStreet(features) {
  return features[Math.floor(Math.random() * features.length)];
}

/* Straße auf der Karte anzeigen */
export function showStreet(feature) {
  if (currentLayer) {
    map.removeLayer(currentLayer);
  }

  currentLayer = L.geoJSON(feature, {
    style: {
      color: "#e63946",
      weight: 6,
      opacity: 1,
      lineCap: "round",
      lineJoin: "round"
    }
  }).addTo(map);

  // Karte auf Straße zentrieren
  try {
    const bounds = currentLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.4));
    }
  } catch (e) {
    console.warn("Konnte Bounds nicht berechnen:", e);
  }

  setTimeout(() => map.invalidateSize(), 50);
}
