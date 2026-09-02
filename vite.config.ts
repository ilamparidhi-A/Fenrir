import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base is REQUIRED: web portals (Poki/CrazyGames) serve games from a
  // subfolder, and Capacitor loads from file:// on Android. Absolute paths break both.
  base: './',
  server: { port: 5173, open: true },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Keep Phaser in its own chunk so game-code rebuilds don't bust its cache.
        manualChunks: { phaser: ['phaser'] },
      },
    },
  },
});
