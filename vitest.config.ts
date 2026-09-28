import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      CLOUDFLARE_R2_ACCESS_KEY: "mock-access-key-id",
      CLOUDFLARE_R2_SECRET_KEY: "mock-secret-access-key",
      CLOUDFLARE_R2_ACCOUNT_ID: "mock-account-id",
      CLOUDFLARE_R2_BUCKET_NAME: "mock-bucket",
      CLOUDFLARE_R2_PUBLIC_URL: "https://media.snipvis.com",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
