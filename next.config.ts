import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Caching is off deliberately while learning: a stale page is
  // indistinguishable from a bug, and every page should render fresh.
  // `partialPrefetching` is also off because Next.js refuses to build when it
  // is on without `cacheComponents` — the two options are a pair.
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
