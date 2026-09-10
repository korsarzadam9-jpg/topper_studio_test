import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/topper_studio_test/",
  plugins: [react()],
  optimizeDeps: {
    include: ["clipper-lib"],
  },
  server: {
    port: 5173,
    open: "/topper_studio_test/",
  },
});
