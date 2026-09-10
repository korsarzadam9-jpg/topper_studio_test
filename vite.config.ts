import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["clipper-lib"],
  },
  server: {
    port: 5173,
    open: true,
  },
});
