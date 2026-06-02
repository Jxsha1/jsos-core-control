/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx,vue}'],
  theme: {
    extend: {
      // Framework property key 'colors' must retain original syntax for the compiler
      colors: {
        brand: {
          canvas: '#020617',    // Deep Slate background canvas
          primary: '#6D28D9',   // Royal Amethyst for structural definitions
          accent: '#E879F9',    // Neon Fuchsia for interactive highlights
          surface: '#0f172a'    // Slate-900 container background layers
        }
      }
    }
  },
  plugins: []
}
