import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" = relative asset paths, so the build works on GitHub Pages (/weather/) and any other host.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
