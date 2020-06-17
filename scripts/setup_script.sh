#!/bin/bash

set -e

PROJECT_ROOT=$(git rev-parse --show-toplevel)

if [[ $# -lt 2 ]] ; then
    echo 'The number of input values is not sufficient! Please provide the no. of energy producing (1st argument) and energy consuming HHs (2nd argument)!'
    exit 1
fi

PROSUMER=$1
CONSUMER=$2

#yarn generate-proving-files $PROSUMER $CONSUMER

#yarn setup-zokrates

# Copy the zokrates-code fodler into the Directory referenced by the Dockerfile

cp -R -p $PROJECT_ROOT/zokrates-code/ $PROJECT_ROOT/netting-entity/dockerized_setup/docker/decentralized-energy-trading/zokrates-code

# Initiate the generation of the netting.yml via the setup_script.js

yarn generate-docker-files $PROSUMER $CONSUMER
