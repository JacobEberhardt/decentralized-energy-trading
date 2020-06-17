#!/bin/bash

set -e

if [[ $# -lt 2 ]] ; then
    echo 'ERROR! The number of input values is not sufficient!'
    exit 1
fi

PROSUMER=$1
CONSUMER=$2

HH=$(($1+$2))

if (($HH > 88)) ; then
    echo 'ERROR! A Maximum Number of 88 Households can be configured currently!'
    exit 1
fi

# Delete any previously created ETH accounts and the corresponding files, except for the 3 initial accounts

for ((i=3; i<=88; i++))
do
FILE=parity-authority/parity/authorities/authority$i.json
FILE2=parity-authority/parity/authorities/authority$i.pwd
FILE3=parity-authority/parity/node$i.network.key
if [[ -f "$FILE" ]]; then
    rm -f $FILE
    rm -f $FILE2
    rm -f $FILE3
    echo "Deleted existing file!"
fi
done

# Generate ETH accounts and the corresponding key files and save them in the authorities folder

for ((i=3; i<=$HH; i++))
do
yes "node$i" | ethkey generate parity-authority/parity/authorities/authority$i.json
done

yarn generate-docker-parity $HH

#yarn migrate-contracts-authority

yarn setup-system $PROSUMER $CONSUMER