/// <reference types="astro/client" />

type Runtime = import('@astrojs/cloudflare').Runtime<{
  DB: D1Database;
  SESSION: KVNamespace;
  INVOICE_VAULT: R2Bucket;
}>;

declare namespace App {
  interface Locals extends Runtime {}
}
