import { useState } from "react";
import { TextInput, Button, Group } from "@mantine/core";
import classes from "./StreetGuessForm.module.css";
interface StreetGuessFormProps {
  onGuess: (streetName: string) => void;
}

export default function StreetGuessForm({ onGuess }: StreetGuessFormProps) {
  const [streetName, setStreetName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuess(streetName.trim());
    setStreetName("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Group className={classes.group}>
        <TextInput
          size="md"
          width={150}
          label="Straßenname"
          placeholder="Straßennamen eingeben..."
          value={streetName}
          onChange={(e) => setStreetName(e.currentTarget.value)}
        />
        <Button type="submit">Straße raten</Button>
      </Group>
    </form>
  );
}
