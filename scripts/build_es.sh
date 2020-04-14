#!/bin/bash

# build esmodules to temp folder
yarn tsc -p tsconfig.json --outDir es_temp

# clean previous build
rm -rf es/

# replace with freshly built es modules
mv es_temp/ es/
rm -rf es_temp/
