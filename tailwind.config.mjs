/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          canvas: '#020617',    // Deep Slate background canvas
          primary: '#6D28D9',   // Royal Amethyst for structural boundaries
          accent: '#E879F9',    // Neon Fuchsia interactive/telemetry targets
          surface: '#0f172a'    // Slate-900 container layers
        }
      }
    }
  },
  plugins: []
}
