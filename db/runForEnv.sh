#!/bin/bash

# SCRIPT_PATH is the node script you want to run
# ENV determines which environment variables you want to apply for your script
SCRIPT_PATH=$1
ENV=$2
CURRENT_DIR=`dirname $BASH_SOURCE`

source $CURRENT_DIR/../deployment/vars/$ENV.sh
node $CURRENT_DIR/../$SCRIPT_PATH
