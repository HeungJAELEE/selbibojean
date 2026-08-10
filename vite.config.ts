import vinext from "vinext";
import { defineConfig } from "vite";
import { sites } from "./build/sites-vite-plugin";

export default defineConfig(async () => {
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";
  const { cloudflare } = await import("@cloudflare/vite-plugin");
  return {
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local"],
      watch: {
        ignored: ["**/playwright-report/**", "**/test-results/**", "**/tmp/**"],
      },
    },
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: {
          main: "./worker/index.ts",
          compatibility_flags: ["nodejs_compat"],
          vars: {
            ENABLE_MOCK_CHOICE_SHUFFLE:
              process.env.ENABLE_MOCK_CHOICE_SHUFFLE ?? "false",
            ENABLE_BUSAN_KOPO_MEDIA:
              process.env.ENABLE_BUSAN_KOPO_MEDIA ?? "false",
          },
          assets: {
            binding: "ASSETS",
            run_worker_first: ["/data", "/data/*"],
          },
          d1_databases: [],
          r2_buckets: [],
        },
      }),
    ],
  };
});
