/// <reference types="vitest" />
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      entryRoot: "src",
      exclude: ["**/*.test.ts", "**/*.test.tsx"],
    }),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "typesafe-routes",
      fileName: "index",
    },
    rollupOptions: {
      external: ["zod"],
      output: {
        globals: {
          zod: "zod",
        },
      },
    },
  },
  test: {
    globals: true,
  },
});
