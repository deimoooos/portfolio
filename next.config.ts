import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone with a self-contained server.js, which the
  // Dockerfile's runner stage copies. Removing this breaks the image build.
  output: "standalone",
};

export default nextConfig;
