import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";

function copyStaticAssets(): Plugin {
  return {
    name: "copy-static-assets",
    closeBundle() {
      // Copy manifest.json
      copyFileSync(
        resolve(__dirname, "public/manifest.json"),
        resolve(__dirname, "dist/manifest.json")
      );
      // Copy icons
      const iconsDir = resolve(__dirname, "public/icons");
      const outIcons = resolve(__dirname, "dist/icons");
      mkdirSync(outIcons, { recursive: true });
      for (const file of readdirSync(iconsDir)) {
        copyFileSync(resolve(iconsDir, file), resolve(outIcons, file));
      }
      // Strip crossorigin attributes — they cause chrome-extension://invalid/ errors
      const htmlPath = resolve(__dirname, "dist/sidepanel.html");
      const html = readFileSync(htmlPath, "utf-8");
      writeFileSync(htmlPath, html.replace(/ crossorigin/g, ""));
    },
  };
}

export default defineConfig({
  plugins: [react(), copyStaticAssets()],
  root: "public",
  base: "",
  build: {
    outDir: resolve(__dirname, "dist"),
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, "public/sidepanel.html"),
        background: resolve(__dirname, "src/background/service-worker.ts"),
        content: resolve(__dirname, "src/content/linkedin.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "background") return "background.js";
          if (chunkInfo.name === "content") return "content.js";
          return "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    emptyOutDir: true,
    copyPublicDir: false,
  },
});
