#!/bin/bash
rm -rf dist
mkdir -p dist
# Build ESM
bun run esbuild src/index.ts --bundle --format=esm --outfile=dist/index.mjs --external:react --external:react-redux --external:redux --external:redux-saga --external:ramda --external:fsevents
# Build CJS
bun run esbuild src/index.ts --bundle --format=cjs --outfile=dist/for_cjs/index.js --external:react --external:react-redux --external:redux --external:redux-saga --external:ramda --external:fsevents
mv dist/for_cjs/index.js dist/index.js
# Generate Types
bun run tsc --emitDeclarationOnly --declaration --outDir dist --skipLibCheck true
