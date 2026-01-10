import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
  base: "/streetle/",
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "data",
          dest: "", // copies data/ into dist/data/
        },
      ],
    }),
  ],
});
