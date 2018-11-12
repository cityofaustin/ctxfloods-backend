#!/bin/bash

# can plug in an individual test file.
# default behavior is to run all tests
# ex: sh deployment/jestWithVars.sh super.admin.test.js
SCRIPT_PATH=$1
CURRENT_DIR=`dirname $BASH_SOURCE`

source $CURRENT_DIR/vars/local.sh
jest $( echo $1 || echo 'test' ) --detectOpenHandles
