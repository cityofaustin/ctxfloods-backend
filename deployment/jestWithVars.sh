#!/bin/bash

SCRIPT_PATH=$1
ENV=$2
CURRENT_DIR=`dirname $BASH_SOURCE`

source $CURRENT_DIR/vars/local.sh
jest test
