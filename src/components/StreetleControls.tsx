import { useState } from "react";
import { Button, Group, Stack, Text, Switch } from "@mantine/core";
import styles from "./StreetleControls.module.css";

type Props = {
  streetName: string;
  onNewStreet: () => void;
  difficulty: "einfach" | "schwer";
  setDifficulty: (d: "einfach" | "schwer") => void;
};

export default function StreetleControls({
  streetName,
  onNewStreet,
  difficulty,
  setDifficulty,
}: Props) {
  const [hint, setHint] = useState<string | null>(null);
  const [solved, setSolved] = useState<boolean>(false);

  const handleHint = () => {
    setHint(streetName.slice(0, 3));
  };

  const handleSolve = () => {
    setSolved(true);
  };

  const handleNewStreet = () => {
    setHint(null);
    setSolved(false);
    onNewStreet();
  };

  const handleSwitch = (checked: boolean) => {
    setDifficulty(checked ? "schwer" : "einfach");
    setHint(null);
    setSolved(false);
    onNewStreet();
  };

  return (
    <Stack mt={16} mb={16} className={styles.centered}>
      <Group>
        <Switch
          checked={difficulty === "schwer"}
          onChange={(event) => handleSwitch(event.currentTarget.checked)}
          label={difficulty === "schwer" ? "Schwer" : "Einfach"}
          color="red"
        />
        <Button onClick={handleHint} variant="outline">
          Hinweis
        </Button>
        <Button onClick={handleSolve} color="red" variant="outline">
          Auflösen
        </Button>
        <Button onClick={handleNewStreet} color="blue" variant="filled">
          Neue Straße
        </Button>
      </Group>
      {hint && <Text>Hinweis: {hint}...</Text>}
      {solved && (
        <Text>
          Lösung: <b>{streetName}</b>
        </Text>
      )}
    </Stack>
  );
}
