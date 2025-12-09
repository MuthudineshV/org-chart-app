// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'
// import { viteSingleFile } from "vite-plugin-singlefile"

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),
//     viteSingleFile(),
//   ],
//   base: './',
//   build: {
//     assetsInlineLimit: 100000000, // 100MB
//     cssCodeSplit: false,
//   },
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Replace 'repo-name' with your actual GitHub repository name
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: "/org-chart-app/",
})
