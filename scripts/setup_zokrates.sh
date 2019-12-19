#!/bin/bash
PROJECT_ROOT=$(git rev-parse --show-toplevel)

cd $PROJECT_ROOT/zokrates-code

zokrates compile -i settlement-check.zok --light
zokrates setup --light
zokrates export-verifier

cp ./verifier.sol ../contracts/verifier.sol
