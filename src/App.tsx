import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";
import Layout from "./components/layout/Layout";
import GeoJsonMap from "./components/GeoJsonMap";

const App = () => {
  return (
    <MantineProvider>
      <Layout>
        <h1>Welcome to Streetle!</h1>
        <GeoJsonMap />
      </Layout>
    </MantineProvider>
  );
};

export default App;
