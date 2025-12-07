import { Autocomplete, Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import classes from "./StreetGuessForm.module.css";
interface StreetGuessFormProps {
  onGuess: (values: { street: string }) => void;
  correctStreetName: string;
  options: string[];
}

export default function StreetGuessForm({
  onGuess,
  correctStreetName,
  options,
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
    <form onSubmit={form.onSubmit(onGuess)}>
      <Group className={classes.group}>
        <Autocomplete
          className={classes.textInput}
          size="md"
          placeholder="Straßennamen eingeben..."
          data={options}
          comboboxProps={{
            position: "bottom",
            middlewares: { flip: false, shift: false },
          }}
          {...form.getInputProps("street")}
        />
        <Button size="md" type="submit">
          Straße raten
        </Button>
      </Group>
    </form>
  );
}
