import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";
import Layout from "./components/layout/Layout";
import StreetleGame from "./components/StreetleGame";

const App = () => {
  return (
    <MantineProvider>
      <Layout>
        <h1>Wie heißt diese Straße?</h1>
        <StreetleGame />
      </Layout>
    </MantineProvider>
  );
};

export default App;
