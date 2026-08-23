import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/nfl-broadcast-finder/",
  build: {
    outDir: "../out",
    emptyOutDir: true,
  },
  plugins: [react()],
  publicDir: "../public",
  root: "github-pages",
});
