import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Standalone output is opt-in, and only the Docker build opts in.
   *
   * `output: "standalone"` makes `next build` run an extra step that assembles
   * `.next/standalone` from the server's file-tracing manifest
   * (`.next/next-server.js.nft.json`). That step is what the Dockerfile's runner
   * stage copies, and it is also what broke deploying to Vercel: the build died
   * inside `next build` with ENOENT on that manifest.
   *
   * Vercel traces and packages the output itself and has no use for
   * `.next/standalone`, so the default build no longer produces it. The
   * Dockerfile sets BUILD_STANDALONE=1 — keep that in step if you move the
   * build elsewhere, or the runner stage will have no server.js to copy.
   */
  ...(process.env.BUILD_STANDALONE === "1"
    ? { output: "standalone" as const }
    : {}),
};

export default nextConfig;
