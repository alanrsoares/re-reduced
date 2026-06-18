import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
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
