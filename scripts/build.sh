#!/bin/bash

cd packages

dirs=`ls`

for dir in $dirs
do
  echo $dir
  cd $dir && npm run build
  cd ../
done