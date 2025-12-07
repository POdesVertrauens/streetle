import { useEffect, useState } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import GeoJsonMap from "./GeoJsonMap";
import StreetGuessForm from "./street-guess-form/StreetGuessForm";
import StreetleControls from "./StreetleControls";

const GEOJSON_PATH = "data/berlin-innenstadt.geojson";

type BerlinStreet = Feature<Geometry, { streetName: string }>;
type BerlinFeatureCollection = FeatureCollection<
  Geometry,
  { streetName: string }
>;

export default function StreetleGame() {
  const [allStreets, setAllStreets] = useState<BerlinFeatureCollection | null>(
    null
  );
  const [selectedStreet, setSelectedStreet] = useState<BerlinStreet | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(GEOJSON_PATH)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load GeoJSON");
        return res.json();
      })
      .then(setAllStreets)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (allStreets?.features.length) {
      setRandomStreet();
    }
  }, [allStreets]);

  const setRandomStreet = () => {
    const randomIndex = Math.floor(
      Math.random() * (allStreets?.features.length || 0)
    );
    const randomStreet = allStreets?.features[randomIndex];
    if (randomStreet) setSelectedStreet(randomStreet);
  };

  const handleGuess = (guess: string) => {
    // Implement guess checking logic here if needed
    // For now, just select a new random street
    console.log("guess", guess);
    console.log("street", selectedStreet?.properties.streetName);
    // setRandomStreet();
  };

  if (error) return <div>Error: {error}</div>;
  if (!allStreets || !selectedStreet) return <div>Loading...</div>;

  return (
    <div>
      <GeoJsonMap street={selectedStreet} />
      <StreetGuessForm
        onGuess={handleGuess}
        correctStreetName={selectedStreet.properties.streetName}
      />
      <StreetleControls
        streetName={selectedStreet.properties.streetName}
        onNewStreet={setRandomStreet}
      />
    </div>
  );
}
