#!/bin/bash

yarn tsdx build
yarn tsc -p tsconfig.json --outDir es_temp

mv es_temp/src es
rm -rf es_temp

