#!/bin/bash

cp ./tsconfigs/tsconfig.test.json tsconfig.json

cd packages/dispatch
npm test
cd ../styled
npm test
cd ../../

cp ./tsconfigs/tsconfig.build.json tsconfig.json
