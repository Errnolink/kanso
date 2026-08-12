import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react(), dts({ include: ["src"], outDir: "dist", rollupTypes: false })],
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      name: "Kanso",
      formats: ["es", "cjs"],
      fileName: "kanso",
    },
    cssCodeSplit: false,
    sourcemap: true,
    emptyOutDir: false,
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "animejs"],
    },
  },
});
