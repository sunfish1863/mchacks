import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "extension/manifest.json", dest: "." },
        { src: "extension/background.js", dest: "." },
        { src: "extension/content.css", dest: "." },
        { src: "extension/icons", dest: "." }
      ],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        // this creates dist/content-entry.js
        "content-entry": "extension/content-entry.jsx",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
})
