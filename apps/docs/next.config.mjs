import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

// Static export for GitHub Pages. On a project page the site is served under
// /<repo>, so set NEXT_PUBLIC_BASE_PATH=/re-reduced in the deploy workflow.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const config = {
  output: "export",
  reactStrictMode: true,
  basePath: basePath || undefined,
  images: { unoptimized: true },
  // workspace packages ship TypeScript source (dev), so Next must transpile them
  transpilePackages: [
    "@re-reduced/core",
    "@re-reduced/react",
    "@re-reduced/signals",
    "@re-reduced/adapter-kit",
    "@re-reduced/demos",
  ],
};

export default withMDX(config);
