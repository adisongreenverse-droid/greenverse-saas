import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['cold-goats-argue.loca.lt', 'vast-oranges-listen.loca.lt']
  }
})
