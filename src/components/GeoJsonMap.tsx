import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { FeatureCollection, GeoJsonObject } from "geojson";
import L, { Map as LeafletMap } from "leaflet";
const GEOJSON_PATH = "data/berlin-innenstadt.geojson";

const mapCenter: [number, number] = [52.520008, 13.404954]; // Berlin center
const mapZoom = 12;

const emptyFeatureCollection: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

const StreetLayer = ({ street }: { street: GeoJsonObject }) => {
  const map = useMap();

  useEffect(() => {
    if (!street || !("geometry" in street)) return;
    // Remove previous layers
    map.eachLayer((layer) => {
      if ((layer as any).feature) {
        map.removeLayer(layer);
      }
    });
    // Add new GeoJSON layer
    const aktuelleLayer = L.geoJSON(street, {
      style: { color: "red", weight: 8 },
    }).addTo(map);
    // Fit bounds
    map.fitBounds(aktuelleLayer.getBounds());
    // Cleanup
    return () => {
      map.removeLayer(aktuelleLayer);
    };
  }, [street, map]);

  return null;
};

export default function GeoJsonMap() {
  const [allStreets, setAllStreets] = useState<FeatureCollection | null>(null);
  const [selectedStreet, setSelectedStreet] = useState<GeoJsonObject>(
    emptyFeatureCollection
  );
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap>(null);
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (allStreets?.features.length === 0) return;
    setRandomStreet();
  }, [allStreets?.features.length]);

  const loadData = async () => {
    fetch(GEOJSON_PATH)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load GeoJSON");
        return res.json();
      })
      .then(setAllStreets)
      .catch((err) => setError(err.message));
  };

  const setRandomStreet = () => {
    const randomIndex = Math.floor(
      Math.random() * (allStreets?.features?.length || 0)
    );
    const randomStreet = allStreets?.features[randomIndex];
    if (randomStreet == null) return;
    setSelectedStreet(randomStreet);
  };

  if (error) return <div>Error: {error}</div>;
  if (!allStreets) return <div>Loading map...</div>;

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <StreetLayer street={selectedStreet} />{" "}
    </MapContainer>
  );
}
