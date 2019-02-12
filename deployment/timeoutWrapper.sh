#!/bin/bash

# Hack to work around travis 10 minute timeout.
# For now, building a new CloudFormation stack takes about 20 minutes
# (15 for building a new CloudFormation stack, 5 for seeding.)
# Subsequent updates will take about 5 minutes.
# https://github.com/travis-ci/travis-ci/issues/7961
CURRENT_DIR=`dirname $BASH_SOURCE`
function bell() {
  while true; do
    echo -e "\a"
    sleep 60
  done
}
bell & bash $CURRENT_DIR/deploy.sh $1
exit $?
