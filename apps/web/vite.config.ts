import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces (needed for Docker)
    port: 5173,
    strictPort: true, // Fail if port is already in use
    watch: {
      usePolling: true // Needed for hot reload in Docker
    }
  }
})