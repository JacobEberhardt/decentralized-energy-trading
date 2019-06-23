# Privacy preserving settlement using ZoKrates

## Installation

(From [ZoKrates](https://github.com/Zokrates/ZoKrates/blob/master/zokrates_book/src/gettingstarted.md)) run `curl -LSfs get.zokrat.es | sh`

## Usage

(From [ZoKrates](https://github.com/Zokrates/ZoKrates/blob/master/zokrates_book/src/gettingstarted.md))

```# compile
./zokrates compile -i settlement-check.code
# perform the setup phase
./zokrates setup
# execute the program
./zokrates compute-witness -a input_1 input_2 ... input_n output
# generate a proof of computation
./zokrates generate-proof
# export a solidity verifier
./zokrates export-verifier
```
