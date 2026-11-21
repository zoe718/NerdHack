/// <reference types="vitest/config" />
import { readFileSync } from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function apiPort(): number {
  if (process.env.UAK_PORT) return Number(process.env.UAK_PORT);
  try {
    const port = readFileSync(new URL("../.uak-env", import.meta.url), "utf8").match(/^UAK_PORT=(\d+)/m);
    if (port) return Number(port[1]);
  } catch {
    return 3000;
  }
  return 3000;
}

const api = `http://127.0.0.1:${apiPort()}`;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: "..",
  server: { port: apiPort() + 1, strictPort: true, proxy: { "/api": api } },
  preview: { port: apiPort() + 1, strictPort: true, proxy: { "/api": api } },
  test: { environment: "jsdom", globals: true, setupFiles: ["./src/lib/ui/test-setup.ts"] },
});
