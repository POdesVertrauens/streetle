/* ============================================
   MAP — Leaflet-Initialisierung & GeoJSON
   ============================================ */

import { BASEMAPS } from "./config.js";

let map = null;
let geojsonData = null;
let currentLayer = null;

/* Karte initialisieren */
export function initMap(contextMode = "withContext") {
  if (!map) {
    map = L.map("map", {
      zoomControl: false,
      attributionControl: true
    }).setView([52.52, 13.405], 12);
  }

  setBasemap(contextMode);
}

/* Basemap setzen */
export function setBasemap(mode) {
  const url = mode === "withoutContext"
    ? BASEMAPS.withoutContext
    : BASEMAPS.withContext;

  L.tileLayer(url, {
    subdomains: "abcd",
    attribution: "© OpenStreetMap © CARTO"
  }).addTo(map);
}

/* GeoJSON laden (einmalig) */
export async function loadGeoJSON() {
  if (geojsonData) return geojsonData;

  const res = await fetch("data/berlin-innenstadt.geojson");
  geojsonData = await res.json();
  return geojsonData;
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
      color: "#000",
      weight: 4
    }
  }).addTo(map);

  centerStreet(feature);
}

/* Karte auf Straße zentrieren */
export function centerStreet(feature) {
  try {
    const layer = L.geoJSON(feature);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.2));
    }
  } catch (e) {
    console.warn("Konnte Bounds nicht berechnen:", e);
  }

  setTimeout(() => map.invalidateSize(), 50);
}

/* Export für andere Module */
export function getMap() {
  return map;
}
