#!/bin/bash
if [ ! -f "parity/bootnode.key" ]
then
    echo "Generating a new bootnode key ..."
    bootnode -genkey parity/bootnode.key
fi

if [ "$1" != "--test" ]
then
    bootnode -nodekey parity/bootnode.key -addr ":30400"  -nat "any"
else
    bootnode -nodekey parity/bootnode.key -addr ":30400"  -nat "any" & export BOOTNODE_PID=$!
fi