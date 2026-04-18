import { defineConfig } from "vitest/config";
import path from "path";

const src = path.resolve(__dirname, "src");

export default defineConfig({
  define: {
    "import.meta.env.VITE_MYCELIUM_API_URL": JSON.stringify("http://test-api"),
  },
  resolve: {
    alias: {
      "@/components": `${src}/components`,
      "@/types": `${src}/types`,
      "@/services": `${src}/services`,
      "@/constants": `${src}/constants`,
      "@/lib": `${src}/lib`,
      "@/functions": `${src}/functions`,
      "@/hooks": `${src}/hooks`,
      "@/states": `${src}/states`,
      "@/screens": `${src}/screens`,
      "@/translations": `${src}/translations`,
      "@/i18n": `${src}/i18n`,
      "@/contexts": `${src}/contexts`,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: ["src/services/rpc/**", "src/hooks/**"],
    },
  },
});
