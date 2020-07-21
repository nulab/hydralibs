#!/bin/bash

cp ./tsconfigs/tsconfig.build.json tsconfig.json

cd packages
dirs=`ls`
for dir in $dirs
do
  echo $dir
  npm i
  cd $dir && npm run build
  if [ $? -ne 0 ];
  then
    exit 1
  fi
  cd ../
done