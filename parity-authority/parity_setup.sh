#!/bin/bash

set -e

if [[ $# -lt 2 ]] ; then
    echo 'ERROR! The number of input values is not sufficient!'
    exit 1
fi

PROSUMER=$1
CONSUMER=$2

HH=$(($1+$2))

for ((i=3; i<=$HH; i++))
do
FILE=parity-authority/parity/authorities/authority$i.json
if [[ -f "$FILE" ]]; then
    rm -f $FILE
    echo "Deleted existing file!"
fi
yes "node$i" | ethkey generate parity-authority/parity/authorities/authority$i.json
done

yarn generate-docker-parity $HH

#yarn migrate-contracts-authority

yarn setup-system $PROSUMER $CONSUMER