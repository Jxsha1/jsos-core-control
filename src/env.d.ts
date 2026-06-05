/// <reference types="astro/client" />

type Runtime = import('@astrojs/cloudflare').Runtime<{
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
