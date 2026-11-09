import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  publicDir: false,
  build: {
    outDir: "landing-build",
    assetsDir: "static",
    rollupOptions: { input: "landing.html" },
  },
});
