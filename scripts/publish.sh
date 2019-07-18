#!/bin/bash

cd packages

dirs=`ls`

for dir in $dirs
do
  echo $dir
  cd $dir && npm publish
  if [ $? -ne 0 ];
  then
    exit 1
  fi
  cd ../
done