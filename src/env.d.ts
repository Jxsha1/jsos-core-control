/// <reference types="astro/client" />

type Runtime = import('@astrojs/cloudflare').Runtime<{
  // Strictly explicitly defines the infrastructure types passed into Astro context locals
  DB: D1Database;
  SESSION: KVNamespace;
  INVOICE_VAULT: R2Bucket;
  EMAIL: {
    send: (params: {
      to: { email: string; name?: string }[];
      from: { email: string; name?: string };
      subject: string;
      text: string;
    }) => Promise<void>;
  };
}>;

declare namespace App {
  interface Locals extends Runtime {}
}
