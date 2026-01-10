import type { GeoJsonObject } from "geojson";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

const mapCenter: [number, number] = [52.520008, 13.404954]; // Berlin center
const mapZoom = 12;

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

export default function GeoJsonMap({ street }: { street: GeoJsonObject }) {
  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <StreetLayer street={street} />
    </MapContainer>
  );
}
