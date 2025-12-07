import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const GEOJSON_PATH = "data/berlin-innenstadt.geojson";

const mapCenter: [number, number] = [52.520008, 13.404954]; // Berlin center
const mapZoom = 12;

export default function GeoJsonMap() {
  const [geoData, setGeoData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    fetch(GEOJSON_PATH)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load GeoJSON");
        return res.json();
      })
      .then(setGeoData)
      .catch((err) => setError(err.message));
  };

  if (error) return <div>Error: {error}</div>;
  if (!geoData) return <div>Loading map...</div>;

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <GeoJSON data={geoData} />
    </MapContainer>
  );
}
