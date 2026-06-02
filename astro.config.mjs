import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  // Enforces dynamic Edge Server-Side Rendering for real-time CRM and ledger operations
  output: 'server',
  
  adapter: cloudflare({
    imageService: 'passthrough',
    platformProxy: {
      enabled: true
    }
  }),
  
  // Natively links the Tailwind compiling framework
  integrations: [tailwind()]
});
