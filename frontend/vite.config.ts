import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Emit build assets to /static/ instead of the default /assets/, so they
    // never collide with the backend's /assets upload path. In prod, Traefik
    // routes /graphql and /assets to the API; everything else (including
    // /static) is served by this frontend.
    assetsDir: 'static',
  },
  server: {
    // Dev proxy: the browser only ever talks to the Vite origin (:5173),
    // which forwards API traffic to the backend — same single-origin,
    // CORS-free model we use in prod behind Traefik.
    proxy: {
      '/graphql': 'http://localhost:8000',
      '/assets': 'http://localhost:8000',
    },
  },
})
