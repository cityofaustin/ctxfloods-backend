#!/bin/bash
CURRENT_DIR=`dirname $BASH_SOURCE`
source $CURRENT_DIR/test-env-2.sh
bash $CURRENT_DIR/../deploy.sh
