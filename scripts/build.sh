#!/bin/bash

yarn tsdx build
yarn tsc -p tsconfig.json --outDir es_temp

rm -rf es/
mv es_temp/src es/
rm -rf es_temp/

