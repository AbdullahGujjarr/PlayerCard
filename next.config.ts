import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The player card image route reads these fonts from disk at runtime.
  outputFileTracingIncludes: {
    "/api/card/[uid]": ["./src/assets/fonts/*"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
