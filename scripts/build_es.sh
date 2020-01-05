#!/bin/bash

# build esmodules to temp folder
yarn tsc -p tsconfig.json --outDir es_temp

# clean previous build
rm -rf es/

# replace with freshly build
mv es_temp/src es/
rm -rf es_temp/

