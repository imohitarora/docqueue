import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["fs/promises", "pdf-parse", "path", "crypto"],
};

export default nextConfig;
