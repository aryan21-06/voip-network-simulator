import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/voip-network-simulator/',  // important for GitHub Pages
  plugins: [react()]
})
