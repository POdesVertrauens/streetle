import { useEffect, useState } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import GeoJsonMap from "./GeoJsonMap";
import StreetGuessForm from "./street-guess-form/StreetGuessForm";
import StreetleControls from "./StreetleControls";
import importantStreets from "../../data/mostImportantStreets";

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
  const [difficulty, setDifficulty] = useState<"easy" | "hard">("easy");
  const [guessCorrect, setGuessCorrect] = useState(false);
  const [candidates, setCandidates] = useState<BerlinStreet[]>([]);

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
    if (candidates?.length === 0) {
      return;
    }

    setRandomStreet();
  }, [candidates]);

  useEffect(() => {
    updateCandidates();
  }, [difficulty, allStreets?.features.length]);

  const updateCandidates = () => {
    if (!allStreets) return;
    let newCandidates: BerlinStreet[] = [];
    if (difficulty === "easy") {
      const importantSet = new Set(importantStreets);
      newCandidates = allStreets.features.filter((f) =>
        importantSet.has(f.properties.streetName)
      );
    } else {
      newCandidates = allStreets.features;
    }
    if (newCandidates.length === 0) return;
    setCandidates(newCandidates);
  };

  const setRandomStreet = () => {
    const randomIndex = Math.floor(Math.random() * candidates.length);
    setSelectedStreet(candidates[randomIndex]);
    setGuessCorrect(false);
  };

  const handleGuess = (values: { street: string }) => {
    const { street } = values;
    if (
      street.trim().toLowerCase() ===
      selectedStreet?.properties.streetName.trim().toLowerCase()
    ) {
      setGuessCorrect(true);
    } else {
      setGuessCorrect(false);
    }
    console.log("guess", street);
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
        options={candidates.map((candidate) => candidate.properties.streetName)}
      />

      <StreetleControls
        streetName={selectedStreet.properties.streetName}
        onNewStreet={setRandomStreet}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        guessCorrect={guessCorrect}
      />
    </div>
  );
}
