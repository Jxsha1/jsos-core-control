import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // Enforces complete Edge Server-Side Rendering for real-time data analysis
  output: 'server',
  
  adapter: cloudflare({
    imageService: 'passthrough',
    platformProxy: {
      enabled: true
    }
  }),
  
  // Natively integrates the Tailwind design utility compilation layers
  integrations: [tailwind()]
});
