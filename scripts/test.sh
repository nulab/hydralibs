#!/bin/bash

cp ./tsconfigs/tsconfig.test.json tsconfig.json

cd packages
dirs=`ls`
for dir in $dirs
do
  echo $dir
  cd $dir && npm test
  if [ $? -ne 0 ];
  then
    exit 1
  fi
  cd ../
done
cd ../
cp ./tsconfigs/tsconfig.build.json tsconfig.json
