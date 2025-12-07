import { Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import classes from "./StreetGuessForm.module.css";
interface StreetGuessFormProps {
  onGuess: (streetName: string) => void;
  correctStreetName: string;
}

export default function StreetGuessForm({
  onGuess,
  correctStreetName,
}: StreetGuessFormProps) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: { street: "" },
    validate: {
      street: (value) => {
        const trimmed = value.trim();
        return trimmed.toLowerCase() !== correctStreetName.toLowerCase()
          ? "Die Straße ist leider falsch."
          : null;
      },
    },
  });

  return (
    <form onSubmit={form.onSubmit(console.log)}>
      <Group className={classes.group}>
        <TextInput
          className={classes.textInput}
          size="md"
          placeholder="Straßennamen eingeben..."
          {...form.getInputProps("street")}
        />
        <Button type="submit">Straße raten</Button>
      </Group>
    </form>
  );
}
