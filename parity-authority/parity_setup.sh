#!/bin/bash

set -e

if [[ $# -lt 1 ]] ; then
    echo 'ERROR! The number of input values is not sufficient!'
    exit 1
fi

HH=$1

for ((i=3; i<=$HH; i++))
do
FILE=parity/authorities/authority$i.json
if [[ -f "$FILE" ]]; then
    rm -f $FILE
    echo "Deleted existing file!"
fi
yes "node$i" | ethkey generate parity/authorities/authority$i.json
done

yarn generate-docker-parity $HH