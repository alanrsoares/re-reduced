#!/bin/bash

yarn tsdx build
yarn tsc -p tsconfig.json --outDir dist/es_temp

mv dist/es_temp/src dist/es
rm -rf dist/es_temp

