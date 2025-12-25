import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    root: __dirname,
    publicDir: path.resolve(__dirname, "public"),
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
    },
    server: {
      host: true,
      port: 5173,
      proxy: {
        //used only in development mode
        "/api": {
          target: env.VITE_API_URL_DEVELOPMENT || "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
