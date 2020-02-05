#!/bin/bash

set -e

if [[ $# -lt 2 ]] ; then
    echo 'The number of input values is not sufficient! Please provide the no. of energy producing (1st argument) and energy consuming HHs (2nd argument)!'
    exit 1
fi

PROSUMER=$1
CONSUMER=$2

yarn generate-proving-files $PROSUMER $CONSUMER

yarn setup-zokrates

yarn generate-docker-files $PROSUMER $CONSUMER
